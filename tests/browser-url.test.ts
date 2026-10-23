import assert from "node:assert/strict";
import test from "node:test";
import { browserDisplayUrl } from "../lib/browser-url";

test("browserDisplayUrl shows a captured page the way a browser address bar does", () => {
  assert.equal(browserDisplayUrl("https://github.com/AniketR10"), "github.com/AniketR10");
  assert.equal(browserDisplayUrl("https://www.github.com/AniketR10/"), "github.com/AniketR10");
  assert.equal(browserDisplayUrl("http://example.com/"), "example.com");
  assert.equal(browserDisplayUrl("example.com/docs?tab=api#auth"), "example.com/docs?tab=api#auth");
  assert.equal(browserDisplayUrl("  https://localhost:3000/editor  "), "localhost:3000/editor");
});
