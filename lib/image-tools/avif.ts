/**
 * AVIF encoding.
 *
 * No browser can encode AVIF from a canvas: toBlob("image/avif") silently
 * returns a PNG instead. libaom compiled to WebAssembly fills the gap.
 *
 * The encoder is around 3.5MB, so it is imported only when someone actually
 * asks for AVIF, and the loaded module is reused afterwards. Encoding is also
 * genuinely slow compared to JPEG or WebP, because AVIF is an AV1 intra frame,
 * so `speed` is tuned below rather than left at the library default.
 */

/**
 * libaom's speed/quality dial, 0 (slowest, smallest) to 10 (fastest, largest).
 *
 * The library defaults to 6. We use 8 because the extra compression below that
 * is small while the time cost climbs steeply, and this runs on a main-thread
 * budget in someone's tab rather than on a build server.
 */
const ENCODE_SPEED = 8;

type AvifEncoder = (
  data: ImageData,
  options?: { quality?: number; speed?: number }
) => Promise<ArrayBuffer>;

let encoderPromise: Promise<AvifEncoder> | null = null;

function loadEncoder(): Promise<AvifEncoder> {
  if (!encoderPromise) {
    encoderPromise = import("@jsquash/avif/encode").then(
      (module) => module.default as unknown as AvifEncoder
    );
  }
  return encoderPromise;
}

/**
 * Encodes pixels as AVIF.
 *
 * `quality` arrives as the 0-1 fraction the rest of the pipeline uses and is
 * converted to the 0-100 scale libaom expects.
 */
export async function encodeAvif(
  imageData: ImageData,
  quality: number
): Promise<Blob> {
  const encode = await loadEncoder();

  const buffer = await encode(imageData, {
    quality: Math.round(Math.min(1, Math.max(0.01, quality)) * 100),
    speed: ENCODE_SPEED,
  });

  return new Blob([buffer], { type: "image/avif" });
}
