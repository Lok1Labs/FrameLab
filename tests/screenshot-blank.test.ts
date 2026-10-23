import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { isBlankImage } from "../lib/screenshot-blank";

function flat(r: number, g: number, b: number) {
  return sharp({ create: { width: 320, height: 180, channels: 3, background: { r, g, b } } }).png().toBuffer();
}

test("a flat black or white capture counts as blank", async () => {
  assert.equal(await isBlankImage(await flat(0, 0, 0)), true);
  assert.equal(await isBlankImage(await flat(255, 255, 255)), true);
});

test("a capture with any real content is not blank", async () => {
  // A dark page with one small block of text-like pixels, like a site still mid fade-in.
  const page = await sharp(await flat(0, 0, 0))
    .composite([{ input: await sharp({ create: { width: 40, height: 10, channels: 3, background: "#ffffff" } }).png().toBuffer(), top: 85, left: 140 }])
    .png()
    .toBuffer();
  assert.equal(await isBlankImage(page), false);
});

test("bytes that are not an image never count as blank", async () => {
  assert.equal(await isBlankImage(Buffer.from("not an image")), false);
});
