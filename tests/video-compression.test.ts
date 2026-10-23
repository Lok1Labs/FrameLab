import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_SETTINGS,
  MAX_FILE_BYTES,
  MIN_VIDEO_KBPS,
  OUTPUT_FILE,
  PASS_LOG_PREFIX,
  buildCompressPasses,
  checkFile,
  clampTargetMb,
  compressedFileName,
  effectiveAudio,
  encoderThreads,
  formatDuration,
  inputFileName,
  minimumTargetMb,
  parseProbeLog,
  parseProgressTime,
  scaleFilter,
  targetVideoKbps,
  type CompressSettings,
  type VideoInfo,
} from "../lib/video-compression/settings";

const HD: VideoInfo = { durationSec: 60, width: 1920, height: 1080, hasAudio: true };

/** The single argument list of a quality-level run. */
function levelArgs(info: VideoInfo, settings: CompressSettings, threads?: number): string[] {
  const passes = buildCompressPasses("in", info, settings, threads);
  assert.equal(passes.length, 1);
  return passes[0];
}

function valueAfter(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index === -1 ? undefined : args[index + 1];
}

test("checkFile accepts video MIME types and extensions browsers leave untyped", () => {
  assert.equal(checkFile({ name: "clip.mp4", type: "video/mp4", size: 1 }), null);
  assert.equal(checkFile({ name: "clip.mkv", type: "", size: 1 }), null);
  assert.equal(checkFile({ name: "IMG_0001.MOV", type: "", size: 1 }), null);
  assert.equal(checkFile({ name: "photo.png", type: "image/png", size: 1 }), "invalid-type");
  assert.equal(checkFile({ name: "notes", type: "", size: 1 }), "invalid-type");
  assert.equal(checkFile({ name: "clip.mp4", type: "video/mp4", size: MAX_FILE_BYTES + 1 }), "file-too-large");
});

test("file names keep the base name and give FFmpeg a neutral input name", () => {
  assert.equal(compressedFileName("holiday.mov"), "holiday-compressed.mp4");
  assert.equal(compressedFileName("my.clip.final.mp4"), "my.clip.final-compressed.mp4");
  assert.equal(compressedFileName(".mp4"), ".mp4-compressed.mp4");
  assert.equal(inputFileName("Screen Recording (1).MOV"), "source.mov");
  assert.equal(inputFileName("weird.name.xyz"), "source");
});

test("target bitrate fits the size with headroom and leaves room for audio", () => {
  const kbps = targetVideoKbps(25, 60, "keep");
  assert.ok(kbps !== null);
  const totalBytes = ((kbps + 128) * 1000 * 60) / 8;
  assert.ok(totalBytes < 25 * 1024 * 1024, `${totalBytes} bytes should fit in 25 MB`);
  assert.ok(totalBytes > 25 * 1024 * 1024 * 0.85, "should not waste most of the budget");
  assert.ok(targetVideoKbps(25, 60, "remove")! > kbps);
});

test("a target too small for the duration is refused, with a usable minimum", () => {
  assert.equal(targetVideoKbps(1, 600, "keep"), null);
  assert.equal(targetVideoKbps(25, 0, "keep"), null);
  const minimum = minimumTargetMb(600, "keep");
  assert.ok(targetVideoKbps(minimum, 600, "keep")! >= MIN_VIDEO_KBPS);
  assert.equal(targetVideoKbps(minimum - 0.5, 600, "keep"), null);
});

test("clampTargetMb rejects junk and keeps one decimal", () => {
  assert.equal(clampTargetMb(Number.NaN), DEFAULT_SETTINGS.targetMb);
  assert.equal(clampTargetMb(0), 1);
  assert.equal(clampTargetMb(9.96), 10);
  assert.equal(clampTargetMb(12.34), 12.3);
});

test("scaleFilter caps the short side and never upscales", () => {
  assert.equal(scaleFilter({ width: 3840, height: 2160 }, "1080"), "scale='if(gte(iw,ih),-2,1080)':'if(gte(iw,ih),1080,-2)'");
  // Portrait phone footage is capped on its width, the short side.
  assert.equal(scaleFilter({ width: 1080, height: 1920 }, "720"), "scale='if(gte(iw,ih),-2,720)':'if(gte(iw,ih),720,-2)'");
  assert.equal(scaleFilter({ width: 1280, height: 720 }, "1080"), "scale=trunc(iw/2)*2:trunc(ih/2)*2");
  assert.equal(scaleFilter({ width: 1280, height: 720 }, "original"), "scale=trunc(iw/2)*2:trunc(ih/2)*2");
});

test("level mode uses CRF, keeps audio, and writes a faststart MP4", () => {
  const args = levelArgs(HD, { ...DEFAULT_SETTINGS, level: "strong" });
  assert.equal(valueAfter(args, "-i"), "in");
  assert.equal(valueAfter(args, "-c:v"), "libx264");
  assert.equal(valueAfter(args, "-crf"), "29");
  assert.equal(valueAfter(args, "-b:v"), undefined);
  assert.equal(valueAfter(args, "-c:a"), "aac");
  assert.equal(valueAfter(args, "-b:a"), "128k");
  assert.equal(valueAfter(args, "-movflags"), "+faststart");
  assert.equal(args.at(-1), OUTPUT_FILE);
});

test("the source frame timing is kept instead of padding to a constant rate", () => {
  // Variable-rate screencasts were padded from ~23 fps to 60 fps by duplicating frames.
  assert.equal(valueAfter(levelArgs(HD, DEFAULT_SETTINGS), "-fps_mode"), "passthrough");
  for (const pass of buildCompressPasses("in", HD, { ...DEFAULT_SETTINGS, mode: "target" })) {
    assert.equal(valueAfter(pass, "-fps_mode"), "passthrough");
  }
});

test("audio can be shrunk or dropped, and silent videos never map audio", () => {
  const low = levelArgs(HD, { ...DEFAULT_SETTINGS, audio: "low" });
  assert.equal(valueAfter(low, "-b:a"), "64k");

  const removed = levelArgs(HD, { ...DEFAULT_SETTINGS, audio: "remove" });
  assert.ok(removed.includes("-an"));
  assert.ok(!removed.includes("0:a:0"));

  const silent = levelArgs({ ...HD, hasAudio: false }, DEFAULT_SETTINGS);
  assert.ok(silent.includes("-an"));
  assert.ok(!silent.includes("0:a:0"));
});

test("thread counts stay inside what the WASM core handles", () => {
  assert.equal(encoderThreads(16, true), 4);
  assert.equal(encoderThreads(2, true), 2);
  assert.equal(encoderThreads(undefined, true), 4);
  assert.equal(encoderThreads(16, false), 1);

  const args = levelArgs(HD, DEFAULT_SETTINGS, 4);
  assert.equal(args[args.indexOf("-threads") + 1], "2", "decoder threads come before -i");
  assert.ok(args.indexOf("-threads") < args.indexOf("-i"));
  assert.equal(args[args.lastIndexOf("-threads") + 1], "4", "encoder threads");
  assert.equal(valueAfter(args, "-filter_threads"), "1");

  const single = levelArgs(HD, DEFAULT_SETTINGS);
  assert.deepEqual(
    [single[single.indexOf("-threads") + 1], single[single.lastIndexOf("-threads") + 1]],
    ["1", "1"],
  );
});

test("target mode runs two passes at the target bitrate instead of CRF", () => {
  const passes = buildCompressPasses("in", HD, { ...DEFAULT_SETTINGS, mode: "target", targetMb: 25 });
  const kbps = targetVideoKbps(25, 60, "keep")!;
  assert.equal(passes.length, 2);
  const [first, second] = passes;

  for (const [index, pass] of passes.entries()) {
    assert.equal(valueAfter(pass, "-pass"), String(index + 1));
    assert.equal(valueAfter(pass, "-b:v"), `${kbps}k`);
    assert.equal(valueAfter(pass, "-passlogfile"), PASS_LOG_PREFIX);
    assert.equal(valueAfter(pass, "-crf"), undefined);
    assert.equal(valueAfter(pass, "-maxrate"), undefined);
  }

  // The analysis pass skips audio and writes nothing.
  assert.ok(first.includes("-an"));
  assert.ok(!first.includes("0:a:0"));
  assert.equal(valueAfter(first, "-f"), "null");
  assert.equal(first.at(-1), "/dev/null");

  assert.equal(valueAfter(second, "-c:a"), "aac");
  assert.equal(second.at(-1), OUTPUT_FILE);
});

test("videos without audio give the whole target to the picture", () => {
  const silent = { ...HD, hasAudio: false };
  // The setting says "keep", but there is no track to keep, so nothing is reserved for it.
  const [, second] = buildCompressPasses("in", silent, { ...DEFAULT_SETTINGS, mode: "target", targetMb: 5 });
  assert.equal(valueAfter(second, "-b:v"), `${targetVideoKbps(5, 60, "remove")}k`);
  assert.equal(effectiveAudio(silent, "keep"), "remove");
  assert.equal(effectiveAudio(HD, "low"), "low");
});

test("target mode refuses impossible targets and unknown durations", () => {
  assert.throws(() => buildCompressPasses("in", HD, { ...DEFAULT_SETTINGS, mode: "target", targetMb: 1 }));
  assert.throws(() =>
    buildCompressPasses("in", { ...HD, durationSec: null }, { ...DEFAULT_SETTINGS, mode: "target" }),
  );
});

test("parseProbeLog reads duration, size, and audio from FFmpeg output", () => {
  const info = parseProbeLog([
    "Input #0, mov,mp4,m4a,3gp,3g2,mj2, from '/input/source.mp4':",
    "  Duration: 00:01:02.50, start: 0.000000, bitrate: 8123 kb/s",
    "  Stream #0:0[0x1](und): Video: h264 (High) (avc1 / 0x31637661), yuv420p(tv, bt709, progressive), 1920x1080 [SAR 1:1 DAR 16:9], 7990 kb/s, 30 fps",
    "  Stream #0:1[0x2](und): Audio: aac (LC) (mp4a / 0x6134706D), 48000 Hz, stereo, fltp, 128 kb/s",
  ]);
  assert.deepEqual(info, { durationSec: 62.5, width: 1920, height: 1080, hasAudio: true });
});

test("parseProbeLog swaps dimensions for rotated phone video", () => {
  const info = parseProbeLog([
    "  Duration: 00:00:10.00, start: 0.000000, bitrate: 9000 kb/s",
    "  Stream #0:0[0x1](und): Video: hevc (Main) (hvc1 / 0x31637668), yuv420p(tv, bt709), 1920x1080, 8000 kb/s, 30 fps",
    "    Side data:",
    "      displaymatrix: rotation of -90.00 degrees",
  ]);
  assert.deepEqual(info, { durationSec: 10, width: 1080, height: 1920, hasAudio: false });
});

test("parseProbeLog handles a missing duration and files without video", () => {
  const recording = parseProbeLog([
    "  Duration: N/A, start: 0.000000, bitrate: N/A",
    "  Stream #0:0: Video: vp9, yuv420p(tv), 1280x720, SAR 1:1 DAR 16:9, 30 fps",
  ]);
  assert.deepEqual(recording, { durationSec: null, width: 1280, height: 720, hasAudio: false });

  assert.equal(
    parseProbeLog(["  Duration: 00:03:00.00", "  Stream #0:0: Audio: mp3, 44100 Hz, stereo"]),
    null,
  );
});

test("parseProgressTime reads encoder status lines", () => {
  assert.equal(parseProgressTime("frame=  240 fps= 31 q=28.0 size=    1024kB time=00:00:08.00 bitrate=1048.6kbits/s speed=1.03x"), 8);
  assert.equal(parseProgressTime("frame=    0 fps=0.0 q=0.0 size=       0kB time=-577014:32:22.77 bitrate=  -0.0kbits/s"), null);
  assert.equal(parseProgressTime("Press [q] to stop"), null);
});

test("formatDuration prints minutes and hours", () => {
  assert.equal(formatDuration(5), "0:05");
  assert.equal(formatDuration(65.4), "1:05");
  assert.equal(formatDuration(3729), "1:02:09");
});
