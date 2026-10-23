/**
 * Pure helpers for the background remover: model constants, input limits,
 * mask sanity checks, edge styling, and output naming.
 *
 * Nothing here touches the DOM, canvas, or the model, so it runs unchanged in
 * the worker, on the main thread, and under node:test.
 */

/**
 * BiRefNet-lite exported to ONNX at 512x512 (MIT licence). The revision is
 * pinned so an upstream change can never alter output or invalidate every
 * visitor's cached download.
 */
export const MODEL_ID = "studioludens/birefnet-lite-512";
export const MODEL_REVISION = "4a3c40c36c94093cc1e724d9ea428b8fa4b57dc7";
export const MODEL_BASE_URL = `https://huggingface.co/${MODEL_ID}/resolve/${MODEL_REVISION}`;

/** WebGPU runs the half-precision weights; WASM needs full precision. */
export const MODEL_WEIGHTS = {
  webgpu: { path: "onnx/model_fp16.onnx", bytes: 98_484_532 },
  wasm: { path: "onnx/model.onnx", bytes: 191_877_254 },
} as const;

/** Matches the per-image limit the rest of the image tools use for large photos. */
export const MAX_FILE_BYTES = 50 * 1024 * 1024;

export const SUPPORTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/avif"] as const;

export type FileProblem = "invalid-type" | "file-too-large";

export function checkFile(file: { type: string; size: number }): FileProblem | null {
  if (!(SUPPORTED_TYPES as readonly string[]).includes(file.type)) return "invalid-type";
  if (file.size > MAX_FILE_BYTES) return "file-too-large";
  return null;
}

export interface MaskHealth {
  /** Right length and every value finite. */
  wellFormed: boolean;
  /**
   * At least one confident subject pixel and real contrast. A GPU driver that
   * silently returns zeros or a flat field fails this, which is the signal to
   * rerun on WASM rather than hand back an empty PNG.
   */
  hasSubject: boolean;
}

export function assessMask(mask: ArrayLike<number>, expectedLength: number): MaskHealth {
  if (mask.length === 0 || mask.length !== expectedLength) {
    return { wellFormed: false, hasSubject: false };
  }

  let lowest = Infinity;
  let highest = -Infinity;
  for (let i = 0; i < mask.length; i++) {
    const value = mask[i];
    if (!Number.isFinite(value)) return { wellFormed: false, hasSubject: false };
    if (value < lowest) lowest = value;
    if (value > highest) highest = value;
  }

  return { wellFormed: true, hasSubject: highest > 0.5 && highest - lowest > 0.1 };
}

/** Converts the model's 0-1 confidence mask into 8-bit alpha, unchanged. */
export function maskToAlpha(mask: ArrayLike<number>): Uint8ClampedArray {
  const alpha = new Uint8ClampedArray(mask.length);
  for (let i = 0; i < mask.length; i++) {
    // Uint8ClampedArray clamps to 0-255 and rounds on assignment.
    alpha[i] = mask[i] * 255;
  }
  return alpha;
}

/**
 * Crisp edges stretch this alpha band across the full range. It is deliberately
 * narrow: by the time it runs, the mask has been scaled up to the image's own
 * size, so the band covers the blur the upscale introduced. Anything wider
 * leaves the same soft edge the soft style already gives.
 */
const CRISP_BAND = { low: 0.42, high: 0.58 } as const;

/**
 * Hardens the cutout edge, in place, on the alpha channel of full-resolution
 * RGBA pixels.
 *
 * This has to happen after the mask is scaled up. Applied to the 512px mask it
 * is undone by the upscale, which smooths the edge back into a ramp several
 * pixels wide.
 */
export function sharpenAlpha(rgba: Uint8ClampedArray): void {
  const span = CRISP_BAND.high - CRISP_BAND.low;
  for (let i = 3; i < rgba.length; i += 4) {
    const value = (rgba[i] / 255 - CRISP_BAND.low) / span;
    rgba[i] = value * 255;
  }
}

/** "holiday photo.jpg" -> "holiday photo-transparent.png" */
export function cutoutFileName(inputName: string): string {
  const base = inputName.replace(/\.[^./\\]+$/, "").trim() || "image";
  return `${base}-transparent.png`;
}

/** Returns a reporter that clamps to 0-1 and holds its highest value. */
export function forwardOnly(): (value: number) => number {
  let highest = 0;
  return (value) => {
    highest = Math.max(highest, Math.min(1, Math.max(0, value)));
    return highest;
  };
}
