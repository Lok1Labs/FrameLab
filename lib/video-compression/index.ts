/**
 * In-browser video compressor.
 *
 * FFmpeg WASM re-encodes the video to H.264 and AAC in an MP4. The engine
 * downloads once from a CDN and is cached; the video itself is never uploaded.
 */

export * from "./settings";
export { VideoCompressionError, cancelCompression, compressVideo, probeVideo } from "./compress";
export type { CompressOptions, CompressResult, VideoCompressionErrorCode } from "./compress";
