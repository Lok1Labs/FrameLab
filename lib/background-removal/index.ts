/**
 * On-device background remover.
 *
 * BiRefNet-lite runs in a Web Worker on WebGPU or WebAssembly. The weights
 * download once from Hugging Face and are cached by the browser; images are
 * never uploaded.
 */

export * from "./types";
export { MAX_FILE_BYTES, SUPPORTED_TYPES, checkFile, cutoutFileName } from "./mask";
export { backgroundRemover } from "./client";
export type { Environment, RemoveOptions } from "./client";
