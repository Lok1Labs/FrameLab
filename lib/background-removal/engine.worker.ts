/**
 * Background removal worker.
 *
 * Holds the model for the lifetime of the tab: weights load once, then every
 * image reuses the same session. Decoding, segmentation, and compositing all
 * run here so a multi-second WASM pass never blocks the page.
 */

import type { PreTrainedModel, Processor, RawImage, Tensor } from "@huggingface/transformers";
import {
  MODEL_ID,
  MODEL_REVISION,
  MODEL_WEIGHTS,
  assessMask,
  checkFile,
  forwardOnly,
  maskToAlpha,
  sharpenAlpha,
} from "./mask";
import {
  BackgroundRemovalError,
  type Backend,
  type EdgeStyle,
  type RemovalStep,
  type WorkerRequest,
  type WorkerResponse,
} from "./types";

type Transformers = typeof import("@huggingface/transformers");

interface Session {
  backend: Backend;
  processor: Processor;
  model: PreTrainedModel;
}

interface Segmentation {
  mask: Float32Array;
  width: number;
  height: number;
}

/** Kept so a restyle can recomposite without segmenting again. */
interface Latest extends Segmentation {
  id: string;
  bitmap: ImageBitmap;
  backend: Backend;
}

/** The processor resizes to 512x512 anyway; this only bounds memory for very large photos. */
const MODEL_INPUT_MAX_SIDE = 1024;

const scope = self as unknown as {
  postMessage: (message: WorkerResponse) => void;
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
};

let library: Promise<Transformers> | null = null;
const sessions: Partial<Record<Backend, Promise<Session>>> = {};
/** Anyone waiting on a backend's weights, so a preload and a real request share one download. */
const weightWatchers: Record<Backend, Set<(fraction: number) => void>> = {
  webgpu: new Set(),
  wasm: new Set(),
};
const aborted = new Set<string>();
let latest: Latest | null = null;

function send(message: WorkerResponse) {
  scope.postMessage(message);
}

function loadLibrary(): Promise<Transformers> {
  library ??= import("@huggingface/transformers").then((module) => {
    module.env.allowLocalModels = false;
    module.env.allowRemoteModels = true;
    return module;
  });
  return library;
}

/**
 * Only the ONNX weights are worth reporting: the config files are a few
 * kilobytes and finish instantly. When the server omits a length, fall back
 * to the known size of the pinned file.
 */
function watchWeights(backend: Backend) {
  const weights = MODEL_WEIGHTS[backend];
  const report = forwardOnly();

  return (event: unknown) => {
    const info = event as { status?: string; file?: string; loaded?: number; total?: number };
    if (!info?.file?.endsWith(".onnx")) return;

    let fraction: number;
    if (info.status === "progress") {
      fraction = (info.loaded ?? 0) / (info.total || weights.bytes);
    } else if (info.status === "done") {
      fraction = 1;
    } else {
      return;
    }

    const value = report(fraction);
    for (const watcher of weightWatchers[backend]) watcher(value);
  };
}

function openSession(backend: Backend, onWeights?: (fraction: number) => void): Promise<Session> {
  if (onWeights) weightWatchers[backend].add(onWeights);

  sessions[backend] ??= (async () => {
    const { AutoModel, AutoProcessor } = await loadLibrary();
    const progress_callback = watchWeights(backend);
    const [processor, model] = await Promise.all([
      AutoProcessor.from_pretrained(MODEL_ID, { revision: MODEL_REVISION, progress_callback }),
      AutoModel.from_pretrained(MODEL_ID, {
        revision: MODEL_REVISION,
        device: backend,
        dtype: backend === "webgpu" ? "fp16" : "fp32",
        progress_callback,
      }),
    ]);
    return { backend, processor, model };
  })();

  const pending = sessions[backend]!;
  return pending
    .catch((error) => {
      // Forget the failure so the next request can try again.
      if (sessions[backend] === pending) delete sessions[backend];
      throw error;
    })
    .finally(() => {
      if (onWeights) weightWatchers[backend].delete(onWeights);
    });
}

function stopIfAborted(id: string) {
  if (aborted.has(id)) throw new BackgroundRemovalError("aborted", "Stopped.");
}

async function decode(file: Blob): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new BackgroundRemovalError(
      "unreadable-image",
      "We couldn't read that image. It may be damaged or in an unusual format."
    );
  }
}

/** Builds the model input from the decoded bitmap so the mask lines up with the EXIF-rotated output. */
async function toModelInput(bitmap: ImageBitmap): Promise<RawImage> {
  const { RawImage } = await loadLibrary();
  const scale = Math.min(1, MODEL_INPUT_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("OffscreenCanvas 2D context is unavailable");
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, width, height);
  return new RawImage(context.getImageData(0, 0, width, height).data, width, height, 4).rgb();
}

async function segment(session: Session, input: RawImage): Promise<Segmentation> {
  const { pixel_values } = (await session.processor(input)) as { pixel_values?: Tensor };
  if (!pixel_values) throw new Error("Preprocessing produced no pixel values");

  const outputs = (await session.model({ input_image: pixel_values })) as Record<string, Tensor>;
  // Some exports emit raw logits, others an already-activated map.
  const map = outputs.logits ? outputs.logits.sigmoid() : outputs.output_image;
  if (!map) throw new Error("The model produced no output");

  const [height, width] = map.dims.slice(-2);
  if (!(map.data instanceof Float32Array) || !width || !height) {
    throw new Error("The model output has an unexpected shape");
  }
  return { mask: map.data, width, height };
}

async function compose(bitmap: ImageBitmap, seg: Segmentation, edgeStyle: EdgeStyle): Promise<Blob> {
  const alpha = maskToAlpha(seg.mask);
  const matte = new OffscreenCanvas(seg.width, seg.height);
  const matteContext = matte.getContext("2d");
  if (!matteContext) throw new Error("OffscreenCanvas 2D context is unavailable");
  const pixels = matteContext.createImageData(seg.width, seg.height);
  for (let i = 0; i < alpha.length; i++) {
    // Colour is irrelevant for destination-in; only alpha is read.
    pixels.data[i * 4 + 3] = alpha[i];
  }
  matteContext.putImageData(pixels, 0, 0);

  const output = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = output.getContext("2d");
  if (!context) throw new Error("OffscreenCanvas 2D context is unavailable");
  context.drawImage(bitmap, 0, 0);
  context.globalCompositeOperation = "destination-in";
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  if (edgeStyle === "crisp") {
    // Scale the mask up first, then harden it: the upscale would otherwise
    // smooth a hardened edge straight back into a soft ramp.
    const scaled = new OffscreenCanvas(bitmap.width, bitmap.height);
    const scaledContext = scaled.getContext("2d");
    if (!scaledContext) throw new Error("OffscreenCanvas 2D context is unavailable");
    scaledContext.imageSmoothingEnabled = true;
    scaledContext.imageSmoothingQuality = "high";
    scaledContext.drawImage(matte, 0, 0, bitmap.width, bitmap.height);

    const full = scaledContext.getImageData(0, 0, bitmap.width, bitmap.height);
    sharpenAlpha(full.data);
    scaledContext.putImageData(full, 0, 0);
    context.drawImage(scaled, 0, 0);
  } else {
    context.drawImage(matte, 0, 0, bitmap.width, bitmap.height);
  }

  return output.convertToBlob({ type: "image/png" });
}

async function remove(request: Extract<WorkerRequest, { type: "remove" }>) {
  const { id, file, edgeStyle } = request;
  const startedAt = performance.now();
  const forward = forwardOnly();
  const progress = (step: RemovalStep, value: number, label: string) => {
    if (!aborted.has(id)) send({ type: "progress", id, progress: { step, value: forward(value), label } });
  };

  const problem = checkFile(file);
  if (problem === "invalid-type") {
    throw new BackgroundRemovalError(problem, "That file type isn't supported. Use PNG, JPG, WebP, or AVIF.");
  }
  if (problem === "file-too-large") {
    throw new BackgroundRemovalError(problem, "That image is larger than 50 MB. Try a smaller copy.");
  }

  progress("decoding", 0.02, "Reading image");
  const bitmap = await decode(file);
  let retained = false;

  try {
    stopIfAborted(id);

    const load = (backend: Backend, from: number, to: number) =>
      openSession(backend, (fraction) =>
        progress("loading-model", from + fraction * (to - from), "Getting the worker ready")
      );

    let session: Session;
    try {
      session = await load(request.backend, 0.05, 0.65);
    } catch (error) {
      if (request.backend !== "webgpu") throw modelUnavailable(error);
      send({ type: "gpu-unusable" });
      try {
        session = await load("wasm", 0.05, 0.65);
      } catch (cpuError) {
        throw modelUnavailable(cpuError);
      }
    }
    stopIfAborted(id);

    progress("segmenting", 0.7, "Finding the subject");
    const input = await toModelInput(bitmap);
    let seg: Segmentation | null = await segment(session, input).catch((error) => {
      if (session.backend === "webgpu") return null;
      throw segmentationFailed(error);
    });
    let health = seg ? assessMask(seg.mask, seg.width * seg.height) : null;

    if (session.backend === "webgpu" && (!seg || !health?.wellFormed || !health.hasSubject)) {
      send({ type: "gpu-unusable" });
      stopIfAborted(id);
      progress("loading-model", 0.72, "Graphics card unavailable, using the CPU");
      try {
        session = await load("wasm", 0.72, 0.86);
      } catch (error) {
        throw modelUnavailable(error);
      }
      stopIfAborted(id);
      progress("segmenting", 0.88, "Finding the subject");
      seg = await segment(session, input).catch((error) => {
        throw segmentationFailed(error);
      });
      health = assessMask(seg.mask, seg.width * seg.height);
    }

    if (!seg || !health?.wellFormed) {
      throw new BackgroundRemovalError("segmentation-failed", "The cutout didn't work on this image. Try a different photo.");
    }
    stopIfAborted(id);

    progress("compositing", 0.94, "Creating transparent PNG");
    const blob = await compose(bitmap, seg, edgeStyle);
    stopIfAborted(id);

    latest?.bitmap.close();
    latest = { id, bitmap, backend: session.backend, ...seg };
    retained = true;

    send({
      type: "result",
      id,
      blob,
      width: bitmap.width,
      height: bitmap.height,
      backend: session.backend,
      edgeStyle,
      elapsedMs: Math.round(performance.now() - startedAt),
    });
  } finally {
    if (!retained) bitmap.close();
  }
}

async function restyle({ id, edgeStyle }: Extract<WorkerRequest, { type: "restyle" }>) {
  if (!latest || latest.id !== id) {
    throw new BackgroundRemovalError("segmentation-failed", "That cutout has expired. Process the image again.");
  }
  const startedAt = performance.now();
  const current = latest;
  const blob = await compose(current.bitmap, current, edgeStyle);
  send({
    type: "result",
    id,
    blob,
    width: current.bitmap.width,
    height: current.bitmap.height,
    backend: current.backend,
    edgeStyle,
    elapsedMs: Math.round(performance.now() - startedAt),
  });
}

function modelUnavailable(error: unknown) {
  console.error("[background-removal] model failed to load", error);
  return new BackgroundRemovalError(
    "model-unavailable",
    "The AI model didn't download. Check your internet connection and try again."
  );
}

function segmentationFailed(error: unknown) {
  if (error instanceof BackgroundRemovalError) return error;
  console.error("[background-removal] segmentation failed", error);
  return new BackgroundRemovalError("segmentation-failed", "The cutout didn't work on this device. Try a different photo.");
}

function sendFailure(id: string, error: unknown) {
  const known = error instanceof BackgroundRemovalError ? error : segmentationFailed(error);
  send({ type: "failure", id, code: known.code, message: known.message });
}

scope.onmessage = (event) => {
  const request = event.data;
  switch (request.type) {
    case "remove":
      remove(request)
        .catch((error) => sendFailure(request.id, error))
        .finally(() => aborted.delete(request.id));
      break;
    case "restyle":
      restyle(request).catch((error) => sendFailure(request.id, error));
      break;
    case "preload":
      // The client only asks when the weights are already cached, so this never downloads.
      openSession(request.backend).catch(() => undefined);
      break;
    case "abort":
      aborted.add(request.id);
      break;
  }
};

send({ type: "ready" });
