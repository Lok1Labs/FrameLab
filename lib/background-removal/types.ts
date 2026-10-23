/**
 * Shared types for the on-device background remover.
 *
 * Everything runs in a Web Worker:
 *
 *   decode -> segment (BiRefNet-lite, 512x512) -> alpha mask -> composite -> PNG
 *
 * Only the model weights come over the network, once, from Hugging Face. The
 * image itself never leaves the browser.
 */

/** "crisp" hardens the cutout edge; "soft" keeps partial transparency for hair and fur. */
export type EdgeStyle = "crisp" | "soft";

export type Backend = "webgpu" | "wasm";

export type RemovalStep = "decoding" | "loading-model" | "segmenting" | "compositing";

export interface RemovalProgress {
  step: RemovalStep;
  /** 0-1, never goes backwards within one request. */
  value: number;
  label: string;
}

export interface RemovalResult {
  /** Pass back to restyle() to recomposite with another edge style. */
  id: string;
  blob: Blob;
  width: number;
  height: number;
  backend: Backend;
  edgeStyle: EdgeStyle;
  elapsedMs: number;
}

export type RemovalErrorCode =
  | "invalid-type"
  | "file-too-large"
  | "unreadable-image"
  | "model-unavailable"
  | "segmentation-failed"
  | "unsupported-browser"
  | "aborted";

export class BackgroundRemovalError extends Error {
  readonly code: RemovalErrorCode;

  constructor(code: RemovalErrorCode, message: string) {
    super(message);
    this.name = "BackgroundRemovalError";
    this.code = code;
  }
}

export type WorkerRequest =
  | { type: "remove"; id: string; file: Blob; edgeStyle: EdgeStyle; backend: Backend }
  | { type: "restyle"; id: string; edgeStyle: EdgeStyle }
  | { type: "preload"; backend: Backend }
  | { type: "abort"; id: string };

export type WorkerResponse =
  | { type: "ready" }
  | { type: "progress"; id: string; progress: RemovalProgress }
  | {
      type: "result";
      id: string;
      blob: Blob;
      width: number;
      height: number;
      backend: Backend;
      edgeStyle: EdgeStyle;
      elapsedMs: number;
    }
  | { type: "failure"; id: string; code: RemovalErrorCode; message: string }
  /** WebGPU could not produce a usable mask here; the client stops trying it for a while. */
  | { type: "gpu-unusable" };
