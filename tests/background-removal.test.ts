import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_FILE_BYTES,
  assessMask,
  checkFile,
  cutoutFileName,
  forwardOnly,
  maskToAlpha,
  sharpenAlpha,
} from "../lib/background-removal/mask";

test("checkFile accepts PNG, JPG, WebP, and AVIF up to 50 MB", () => {
  assert.equal(checkFile({ type: "image/png", size: 1024 }), null);
  assert.equal(checkFile({ type: "image/jpeg", size: MAX_FILE_BYTES }), null);
  assert.equal(checkFile({ type: "image/webp", size: 1 }), null);
  assert.equal(checkFile({ type: "image/avif", size: 1 }), null);
  assert.equal(checkFile({ type: "image/gif", size: 1 }), "invalid-type");
  assert.equal(checkFile({ type: "", size: 1 }), "invalid-type");
  assert.equal(checkFile({ type: "image/png", size: MAX_FILE_BYTES + 1 }), "file-too-large");
});

test("assessMask rejects wrong lengths and non-finite values", () => {
  assert.deepEqual(assessMask(new Float32Array(0), 0), { wellFormed: false, hasSubject: false });
  assert.deepEqual(assessMask(new Float32Array(3), 4), { wellFormed: false, hasSubject: false });
  assert.deepEqual(assessMask(Float32Array.from([0, Infinity]), 2), { wellFormed: false, hasSubject: false });
});

test("assessMask flags empty or flat masks that a faulty GPU can return", () => {
  assert.deepEqual(assessMask(new Float32Array(4), 4), { wellFormed: true, hasSubject: false });
  assert.deepEqual(assessMask(Float32Array.from([0.6, 0.62, 0.61]), 3), { wellFormed: true, hasSubject: false });
  assert.deepEqual(assessMask(Float32Array.from([0.1, 0.3, 0.45]), 3), { wellFormed: true, hasSubject: false });
  assert.deepEqual(assessMask(Float32Array.from([0, 0.4, 0.97]), 3), { wellFormed: true, hasSubject: true });
});

test("maskToAlpha converts confidence to 8-bit alpha untouched", () => {
  const mask = Float32Array.from([0, 0.25, 0.5, 1]);
  assert.deepEqual(Array.from(maskToAlpha(mask)), [0, 64, 128, 255]);
});

test("sharpenAlpha hardens the edge and leaves colour channels alone", () => {
  // One RGBA pixel per alpha value, with colour set so we can prove it survives.
  const alphas = [0, 100, 107, 128, 150, 255];
  const rgba = new Uint8ClampedArray(alphas.length * 4);
  alphas.forEach((a, i) => {
    rgba[i * 4] = 10;
    rgba[i * 4 + 1] = 20;
    rgba[i * 4 + 2] = 30;
    rgba[i * 4 + 3] = a;
  });

  sharpenAlpha(rgba);
  const out = alphas.map((_, i) => rgba[i * 4 + 3]);

  assert.equal(out[0], 0, "fully transparent stays transparent");
  assert.equal(out[1], 0, "just below the band is pushed to transparent");
  assert.ok(Math.abs(out[3] - 128) <= 5, "the midpoint stays roughly half transparent");
  assert.equal(out[4], 255, "just above the band is pushed to opaque");
  assert.equal(out[5], 255, "fully opaque stays opaque");
  assert.ok(out[2] < out[3] && out[3] < out[4], "the band still ramps, so edges stay anti-aliased");

  assert.deepEqual([rgba[0], rgba[1], rgba[2]], [10, 20, 30], "colour channels untouched");
});

test("cutoutFileName swaps the extension for -transparent.png", () => {
  assert.equal(cutoutFileName("holiday photo.jpg"), "holiday photo-transparent.png");
  assert.equal(cutoutFileName("archive.v2.webp"), "archive.v2-transparent.png");
  assert.equal(cutoutFileName("no-extension"), "no-extension-transparent.png");
  assert.equal(cutoutFileName(".png"), "image-transparent.png");
});

test("forwardOnly clamps and never moves backwards", () => {
  const report = forwardOnly();
  assert.equal(report(0.4), 0.4);
  assert.equal(report(0.2), 0.4);
  assert.equal(report(1.5), 1);
  assert.equal(report(-1), 1);
});
