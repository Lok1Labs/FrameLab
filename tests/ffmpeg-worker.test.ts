import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const PACKAGE_DIR = path.join(process.cwd(), "node_modules/@ffmpeg/ffmpeg");
const { version } = JSON.parse(readFileSync(path.join(PACKAGE_DIR, "package.json"), "utf8"));
const ENCODER_SOURCE = readFileSync(path.join(process.cwd(), "lib/export/ffmpeg-encoder.ts"), "utf8");

test("the served FFmpeg worker path matches the installed @ffmpeg/ffmpeg version", () => {
  assert.match(ENCODER_SOURCE, new RegExp(`FFMPEG_CLASS_WORKER_PATH = '/ffmpeg/${version.replace(/\./g, "\\.")}/worker\\.js'`));
});

test("the unbundled FFmpeg worker files are identical to the installed package", () => {
  // Upgrading @ffmpeg/ffmpeg without recopying would load a mismatched worker in production.
  for (const file of ["worker.js", "const.js", "errors.js"]) {
    assert.equal(
      readFileSync(path.join(process.cwd(), "public/ffmpeg", version, file), "utf8"),
      readFileSync(path.join(PACKAGE_DIR, "dist/esm", file), "utf8"),
      `public/ffmpeg/${version}/${file} is out of date; copy it from node_modules/@ffmpeg/ffmpeg/dist/esm`,
    );
  }
});
