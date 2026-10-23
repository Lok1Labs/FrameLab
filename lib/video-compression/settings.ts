/**
 * Pure helpers for the video compressor: settings, FFmpeg arguments, the
 * target-size bitrate maths, and parsing FFmpeg's log output. No DOM, no
 * FFmpeg instance, so everything here is safe to unit test.
 */

export type CompressionLevel = "light" | "balanced" | "strong" | "extreme";
export type SizeMode = "level" | "target";
export type ResolutionCap = "original" | "1080" | "720" | "480";
export type AudioMode = "keep" | "low" | "remove";

export interface CompressSettings {
  mode: SizeMode;
  level: CompressionLevel;
  /** Used when mode is "target". */
  targetMb: number;
  resolution: ResolutionCap;
  audio: AudioMode;
}

export const DEFAULT_SETTINGS: CompressSettings = {
  mode: "level",
  level: "balanced",
  targetMb: 25,
  resolution: "original",
  audio: "keep",
};

/** What a probe of the input reports. Duration is null when the container does not store it. */
export interface VideoInfo {
  durationSec: number | null;
  width: number;
  height: number;
  hasAudio: boolean;
}

/** x264 CRF per level: each step of 3 cuts the bitrate by about 30%, and +6 roughly halves it. */
export const LEVEL_CRF: Record<CompressionLevel, number> = {
  light: 23,
  balanced: 26,
  strong: 29,
  extreme: 32,
};

/** Caps apply to the short side, so a portrait 1080x1920 phone clip counts as 1080p. */
const RESOLUTION_CAP: Record<ResolutionCap, number | null> = {
  original: null,
  "1080": 1080,
  "720": 720,
  "480": 480,
};

const AUDIO_KBPS: Record<AudioMode, number> = {
  keep: 128,
  low: 64,
  remove: 0,
};

export const MAX_FILE_BYTES = 1024 * 1024 * 1024;

/** Below this the picture falls apart, so a target that needs less is refused. */
export const MIN_VIDEO_KBPS = 150;

/**
 * Two-pass encoding lands within a percent or two of the requested bitrate,
 * and the MP4 container adds a little on top. Aiming slightly under the target
 * keeps the file under it without leaving much of the budget unused.
 */
const TARGET_HEADROOM = 0.96;

/**
 * Thread counts for FFmpeg WASM's multi-threaded core (@ffmpeg/core-mt 0.12.6).
 * Left to FFmpeg's defaults, which scale with the core count, the encode
 * deadlocks after the first frame. With x264 at 6 or more threads it fails
 * instead: a worker thread reports to stderr with no message and the core's
 * printErr throws on it. Two decoder threads and up to four x264 threads were
 * measured to work, at about twice the single-threaded speed for 1080p.
 */
const DECODER_THREADS = 2;
const MAX_ENCODER_THREADS = 4;

export function encoderThreads(hardwareConcurrency: number | undefined, multiThreaded: boolean): number {
  if (!multiThreaded) return 1;
  const cores = hardwareConcurrency && hardwareConcurrency > 0 ? hardwareConcurrency : 4;
  return Math.max(1, Math.min(MAX_ENCODER_THREADS, cores));
}

export const INPUT_PATH = "/input";
export const OUTPUT_FILE = "/compressed.mp4";
/** x264 writes its first-pass statistics next to this prefix. */
export const PASS_LOG_PREFIX = "/x264-pass";
export const PASS_LOG_FILES = [`${PASS_LOG_PREFIX}-0.log`, `${PASS_LOG_PREFIX}-0.log.mbtree`];

const VIDEO_EXTENSIONS = new Set(["mp4", "m4v", "mov", "webm", "mkv", "avi", "3gp", "mpg", "mpeg", "ts", "mts", "wmv", "flv", "ogv"]);

export const ACCEPT = "video/*,.mkv,.mov,.m4v,.avi,.3gp,.mts,.ts,.wmv,.flv";

export type FileProblem = "invalid-type" | "file-too-large";

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

/** Browsers leave the MIME type empty for MKV and some MOV files, so the extension counts too. */
export function checkFile(file: { name: string; type: string; size: number }): FileProblem | null {
  if (!file.type.startsWith("video/") && !VIDEO_EXTENSIONS.has(extensionOf(file.name))) {
    return "invalid-type";
  }
  if (file.size > MAX_FILE_BYTES) return "file-too-large";
  return null;
}

export function compressedFileName(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name) || "video";
  return `${base}-compressed.mp4`;
}

/** A neutral name inside FFmpeg's filesystem, keeping the extension as a demuxer hint. */
export function inputFileName(name: string): string {
  const extension = extensionOf(name);
  return extension && VIDEO_EXTENSIONS.has(extension) ? `source.${extension}` : "source";
}

/** Clamps a typed or pasted target to something FFmpeg can aim for. */
export function clampTargetMb(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SETTINGS.targetMb;
  return Math.min(4096, Math.max(1, Math.round(value * 10) / 10));
}

/** The audio a run actually writes: a video without an audio track gets none, whatever the setting. */
export function effectiveAudio(info: Pick<VideoInfo, "hasAudio">, audio: AudioMode): AudioMode {
  return info.hasAudio ? audio : "remove";
}

/**
 * Video bitrate that fits `targetMb` for this duration, or null when even the
 * minimum usable bitrate would not fit. Megabytes are 1024-based, matching
 * how file sizes are shown across the tools.
 */
export function targetVideoKbps(targetMb: number, durationSec: number, audio: AudioMode): number | null {
  if (!(durationSec > 0)) return null;
  const totalKbps = (targetMb * 1024 * 1024 * 8 * TARGET_HEADROOM) / durationSec / 1000;
  const videoKbps = Math.floor(totalKbps - AUDIO_KBPS[audio]);
  return videoKbps >= MIN_VIDEO_KBPS ? videoKbps : null;
}

/** Smallest target that still leaves MIN_VIDEO_KBPS for the picture, rounded up to 0.1 MB. */
export function minimumTargetMb(durationSec: number, audio: AudioMode): number {
  const totalKbps = MIN_VIDEO_KBPS + AUDIO_KBPS[audio];
  const mb = (totalKbps * 1000 * durationSec) / 8 / TARGET_HEADROOM / 1024 / 1024;
  return Math.ceil(mb * 10) / 10;
}

/**
 * Filters see frames after FFmpeg's autorotation, so the expressions work on
 * the displayed orientation. -2 keeps the derived side even, which yuv420p
 * H.264 requires; the fallback evens out odd-sized screen recordings.
 */
export function scaleFilter(info: Pick<VideoInfo, "width" | "height">, resolution: ResolutionCap): string {
  const cap = RESOLUTION_CAP[resolution];
  if (cap !== null && Math.min(info.width, info.height) > cap) {
    return `scale='if(gte(iw,ih),-2,${cap})':'if(gte(iw,ih),${cap},-2)'`;
  }
  return "scale=trunc(iw/2)*2:trunc(ih/2)*2";
}

/**
 * FFmpeg argument lists to run in order: one for a quality level, two for a
 * target size. Throws when a target size cannot be met; callers check
 * targetVideoKbps first to show a friendly error.
 *
 * Target sizes use two passes. Single-pass ABR has to guess how hard the
 * video is and undershoots on easy content such as screen recordings, which
 * wastes the budget; the first pass measures the whole video so the second
 * can spend the bits where they are needed and land on the target.
 */
export function buildCompressPasses(
  inputPath: string,
  info: VideoInfo,
  settings: CompressSettings,
  threads = 1,
): string[][] {
  const input = [
    "-hide_banner",
    "-threads", String(Math.min(DECODER_THREADS, threads)),
    "-i", inputPath,
    "-filter_threads", "1",
  ];
  const video = [
    "-vf", scaleFilter(info, settings.resolution),
    // Keep the source's frame timing. MP4 output otherwise defaults to a
    // constant rate and duplicates frames of variable-rate screen and phone
    // recordings, e.g. turning a 23 fps screencast into 60 fps.
    "-fps_mode", "passthrough",
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-pix_fmt", "yuv420p",
    "-threads", String(threads),
  ];
  const keepAudio = info.hasAudio && settings.audio !== "remove";
  const audio = keepAudio
    ? ["-c:a", "aac", "-b:a", `${AUDIO_KBPS[settings.audio]}k`, "-ac", "2"]
    : ["-an"];
  const maps = keepAudio ? ["-map", "0:v:0", "-map", "0:a:0"] : ["-map", "0:v:0"];
  // Moves the index to the front so the file starts playing before it fully loads.
  const output = ["-movflags", "+faststart", "-y", OUTPUT_FILE];

  if (settings.mode === "level") {
    return [[...input, ...maps, ...video, "-crf", String(LEVEL_CRF[settings.level]), ...audio, ...output]];
  }

  const kbps = info.durationSec === null
    ? null
    : targetVideoKbps(settings.targetMb, info.durationSec, effectiveAudio(info, settings.audio));
  if (kbps === null) throw new Error("Target size is too small for this video.");
  const rate = ["-b:v", `${kbps}k`, "-passlogfile", PASS_LOG_PREFIX];

  return [
    [...input, "-map", "0:v:0", ...video, ...rate, "-pass", "1", "-an", "-f", "null", "-y", "/dev/null"],
    [...input, ...maps, ...video, ...rate, "-pass", "2", ...audio, ...output],
  ];
}

function parseClock(value: string): number | null {
  const match = /^(\d+):(\d{2}):(\d{2}(?:\.\d+)?)$/.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

/**
 * Reads duration, display size, and audio presence from `ffmpeg -i` output.
 * Returns null when there is no video stream. Rotated phone clips report
 * their coded size, so the dimensions are swapped for a quarter turn.
 */
export function parseProbeLog(lines: readonly string[]): VideoInfo | null {
  let durationSec: number | null = null;
  let size: { width: number; height: number } | null = null;
  let hasAudio = false;
  let rotation = 0;

  for (const line of lines) {
    const duration = /Duration:\s*([\d:.]+)/.exec(line);
    if (duration && durationSec === null) {
      const seconds = parseClock(duration[1]);
      if (seconds !== null && seconds > 0) durationSec = seconds;
    }
    if (/Stream #\d+:\d+.*Video:/.test(line) && size === null) {
      const dims = /[\s,](\d{2,5})x(\d{2,5})[\s,[]/.exec(line);
      if (dims) size = { width: Number(dims[1]), height: Number(dims[2]) };
    }
    if (/Stream #\d+:\d+.*Audio:/.test(line)) hasAudio = true;
    const rotate = /rotation of (-?[\d.]+) degrees|rotate\s*:\s*(-?\d+)/.exec(line);
    if (rotate && size !== null) rotation = Number(rotate[1] ?? rotate[2]);
  }

  if (!size) return null;
  const quarterTurn = Math.abs(Math.round(rotation / 90)) % 2 === 1;
  return {
    durationSec,
    width: quarterTurn ? size.height : size.width,
    height: quarterTurn ? size.width : size.height,
    hasAudio,
  };
}

/** Seconds encoded so far, from an FFmpeg status line such as "frame= 120 ... time=00:00:04.00 ...". */
export function parseProgressTime(line: string): number | null {
  const match = /time=\s*(-?[\d:.]+)/.exec(line);
  if (!match || match[1].startsWith("-")) return null;
  return parseClock(match[1]);
}

/** Human-readable duration, e.g. 1:05 or 1:02:09. */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}
