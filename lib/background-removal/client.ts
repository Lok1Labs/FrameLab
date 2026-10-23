/**
 * Main-thread client for the background removal worker.
 *
 * Lazily starts one module worker per tab, turns its messages back into
 * promises, and remembers in localStorage when WebGPU has proven unusable on
 * this device (the worker cannot reach localStorage).
 */

import { MODEL_BASE_URL, MODEL_REVISION, MODEL_WEIGHTS } from "./mask";
import {
  BackgroundRemovalError,
  type Backend,
  type EdgeStyle,
  type RemovalProgress,
  type RemovalResult,
  type WorkerRequest,
  type WorkerResponse,
} from "./types";

const GPU_UNUSABLE_KEY = "screenshot-studio:bg-removal:gpu-unusable";
/** How long to stay on WASM after WebGPU fails, so driver or browser updates get another chance. */
const GPU_RETRY_AFTER_MS = 7 * 24 * 60 * 60 * 1000;
const STARTUP_TIMEOUT_MS = 10_000;

interface Waiting {
  resolve: (result: RemovalResult) => void;
  reject: (error: BackgroundRemovalError) => void;
  onProgress?: (progress: RemovalProgress) => void;
}

export interface RemoveOptions {
  edgeStyle: EdgeStyle;
  onProgress?: (progress: RemovalProgress) => void;
  signal?: AbortSignal;
}

export interface Environment {
  /** Workers, OffscreenCanvas, and WebAssembly are all present. */
  supported: boolean;
  /** The next run will start on WebGPU. */
  gpu: boolean;
}

class BackgroundRemovalClient {
  private workerPromise: Promise<Worker> | null = null;
  private waiting = new Map<string, Waiting>();
  private sequence = 0;
  private gpuUnusableThisSession = false;
  private adapterPromise: Promise<boolean> | null = null;

  isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      typeof Worker !== "undefined" &&
      typeof OffscreenCanvas !== "undefined" &&
      typeof WebAssembly !== "undefined"
    );
  }

  async detect(): Promise<Environment> {
    const supported = this.isSupported();
    return { supported, gpu: supported && (await this.gpuWorthTrying()) };
  }

  async preferredBackend(): Promise<Backend> {
    return (await this.detect()).gpu ? "webgpu" : "wasm";
  }

  weightsBytes(backend: Backend): number {
    return MODEL_WEIGHTS[backend].bytes;
  }

  /** True when the weights for a backend are already in the transformers.js cache. */
  async hasCachedWeights(backend: Backend): Promise<boolean> {
    try {
      if (typeof caches === "undefined") return false;
      const cache = await caches.open("transformers-cache");
      return Boolean(await cache.match(`${MODEL_BASE_URL}/${MODEL_WEIGHTS[backend].path}`));
    } catch {
      return false;
    }
  }

  /** Loads cached weights into memory before the first image. Never starts a download. */
  async preloadIfCached(backend: Backend): Promise<boolean> {
    if (!this.isSupported() || !(await this.hasCachedWeights(backend))) return false;
    this.post(await this.worker(), { type: "preload", backend });
    return true;
  }

  async remove(file: Blob, options: RemoveOptions): Promise<RemovalResult> {
    if (options.signal?.aborted) throw abortedError();
    const [worker, backend] = await Promise.all([this.worker(), this.preferredBackend()]);
    const id = `cutout-${++this.sequence}-${Date.now()}`;

    return new Promise<RemovalResult>((resolve, reject) => {
      const onAbort = () => {
        if (!this.waiting.delete(id)) return;
        this.post(worker, { type: "abort", id });
        reject(abortedError());
      };
      const cleanup = () => options.signal?.removeEventListener("abort", onAbort);
      options.signal?.addEventListener("abort", onAbort, { once: true });

      this.waiting.set(id, {
        resolve: (result) => {
          cleanup();
          resolve(result);
        },
        reject: (error) => {
          cleanup();
          reject(error);
        },
        onProgress: options.onProgress,
      });

      this.post(worker, { type: "remove", id, file, edgeStyle: options.edgeStyle, backend });
    });
  }

  /** Recomposites the latest cutout with another edge style, without segmenting again. */
  async restyle(id: string, edgeStyle: EdgeStyle): Promise<RemovalResult> {
    const worker = await this.worker();
    return new Promise<RemovalResult>((resolve, reject) => {
      this.waiting.set(id, { resolve, reject });
      this.post(worker, { type: "restyle", id, edgeStyle });
    });
  }

  private async gpuWorthTrying(): Promise<boolean> {
    if (this.gpuUnusableThisSession) return false;
    try {
      const stored = JSON.parse(localStorage.getItem(GPU_UNUSABLE_KEY) ?? "null") as
        | { revision: string; at: number }
        | null;
      if (stored?.revision === MODEL_REVISION && Date.now() - stored.at < GPU_RETRY_AFTER_MS) {
        return false;
      }
    } catch {
      // Unreadable or blocked storage: fall through to the adapter probe.
    }
    return this.hasGpuAdapter();
  }

  /**
   * Some browsers expose `navigator.gpu` but return no adapter (headless
   * sessions, blocklisted GPUs). Probing first avoids downloading the fp16
   * weights only to fall back and fetch the fp32 ones as well.
   */
  private hasGpuAdapter(): Promise<boolean> {
    this.adapterPromise ??= (async () => {
      const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }).gpu;
      if (!gpu) return false;
      try {
        return Boolean(await gpu.requestAdapter());
      } catch {
        return false;
      }
    })();
    return this.adapterPromise;
  }

  private markGpuUnusable() {
    this.gpuUnusableThisSession = true;
    try {
      localStorage.setItem(GPU_UNUSABLE_KEY, JSON.stringify({ revision: MODEL_REVISION, at: Date.now() }));
    } catch {
      // Private browsing: the session flag still avoids repeat attempts.
    }
  }

  private worker(): Promise<Worker> {
    this.workerPromise ??= new Promise<Worker>((resolve, reject) => {
      if (!this.isSupported()) {
        reject(
          new BackgroundRemovalError(
            "unsupported-browser",
            "Your browser can't run the background remover. Please update it or switch to a current version of Chrome, Edge, Firefox, or Safari."
          )
        );
        return;
      }

      let worker: Worker;
      try {
        worker = new Worker(new URL("./engine.worker.ts", import.meta.url), { type: "module" });
      } catch {
        reject(new BackgroundRemovalError("unsupported-browser", "The background remover failed to start."));
        return;
      }

      const timer = setTimeout(() => {
        worker.terminate();
        reject(new BackgroundRemovalError("unsupported-browser", "The background remover took too long to start."));
      }, STARTUP_TIMEOUT_MS);

      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        if (event.data.type === "ready") {
          clearTimeout(timer);
          resolve(worker);
          return;
        }
        this.receive(event.data);
      };

      worker.onerror = (event) => {
        clearTimeout(timer);
        console.error("[background-removal] worker error", event);
        worker.terminate();
        this.failAll(new BackgroundRemovalError("unsupported-browser", "The background remover stopped. Please try again."));
        reject(new BackgroundRemovalError("unsupported-browser", "The background remover failed to start."));
      };
    }).catch((error) => {
      this.workerPromise = null;
      throw error;
    });

    return this.workerPromise;
  }

  private receive(message: WorkerResponse) {
    switch (message.type) {
      case "progress":
        this.waiting.get(message.id)?.onProgress?.(message.progress);
        break;
      case "result": {
        const entry = this.waiting.get(message.id);
        if (!entry) return;
        this.waiting.delete(message.id);
        const { type: _type, ...result } = message;
        entry.resolve(result);
        break;
      }
      case "failure": {
        const entry = this.waiting.get(message.id);
        if (!entry) return;
        this.waiting.delete(message.id);
        entry.reject(new BackgroundRemovalError(message.code, message.message));
        break;
      }
      case "gpu-unusable":
        this.markGpuUnusable();
        break;
    }
  }

  /** Rejects every in-flight request and forgets the worker so the next call starts a fresh one. */
  private failAll(error: BackgroundRemovalError) {
    this.workerPromise = null;
    for (const entry of this.waiting.values()) entry.reject(error);
    this.waiting.clear();
  }

  private post(worker: Worker, message: WorkerRequest) {
    worker.postMessage(message);
  }
}

function abortedError() {
  return new BackgroundRemovalError("aborted", "Stopped.");
}

export const backgroundRemover = new BackgroundRemovalClient();
