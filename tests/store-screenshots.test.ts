import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_STORE_SLIDES,
  STORE_OUTPUT_PROFILES,
  STORE_TEMPLATES,
  getStoreProfile,
} from "../lib/store-screenshots/config";
import { composeStoreSlide, resolveStoreLayout } from "../lib/store-screenshots/layouts";
import {
  appendStoreHistory,
  MAX_STORE_HISTORY_ENTRIES,
  storeHistoryGroupKey,
} from "../lib/store-screenshots/history";
import {
  assertStoreImageBudget,
  assertStoreImageFile,
  createScratchStoreProject,
  createStoreProject,
  createStoreSlide,
  createStarterStoreProject,
  duplicateStoreSlide,
  filesToStoreSlides,
  getStoreDeviceStyleOverride,
  getStoreDeviceTransform,
  MAX_STORE_IMAGE_SIZE,
  MAX_STORE_PROJECT_IMAGE_BYTES,
  moveStoreSlide,
  normalizeStoreProject,
  removeStoreSlide,
  resetStoreSlidePositions,
  storeDataUrlBytes,
  storeSlidePositionsChanged,
  storeSlidesImageBytes,
  withStoreDeviceStyleOverride,
  withStoreDeviceTransform,
} from "../lib/store-screenshots/project";

test("the App Store profile exposes the exact portrait export size", () => {
  const apple = getStoreProfile("app-store");

  assert.deepEqual(
    { width: apple.width, height: apple.height },
    { width: 1320, height: 2868 },
  );
  assert.equal(STORE_OUTPUT_PROFILES.length, 1);
  assert.equal(apple.maxSlides, MAX_STORE_SLIDES);
});

test("six coordinated templates resolve repeatable layout sequences", () => {
  assert.equal(STORE_TEMPLATES.length, 6);
  assert.equal(resolveStoreLayout("editorial", 0, null), "editorial-left");
  assert.equal(resolveStoreLayout("editorial", 1, null), "editorial-right");
  assert.equal(resolveStoreLayout("editorial", 4, null), "editorial-left");
  assert.equal(resolveStoreLayout("editorial", 0, "minimal"), "minimal");
  assert.equal(resolveStoreLayout("classic", 0, "no-mockup"), "no-mockup");
  assert.equal(composeStoreSlide("no-mockup").devices.length, 0);
});

test("App Store projects cap slides at the supported maximum", () => {
  const slides = Array.from({ length: MAX_STORE_SLIDES + 3 }, (_, index) =>
    createStoreSlide(`data:image/png;base64,${index}`, `screen-${index}.png`),
  );
  const project = createStoreProject(slides);

  assert.equal(project.slides.length, MAX_STORE_SLIDES);
  assert.equal(project.selectedSlideId, project.slides[0].id);
});

test("store history caps retained image data instead of retaining every replacement", () => {
  const projectWithImage = (src: string, name: string) => createStoreProject([
    createStoreSlide(`data:image/png;base64,${src}`, name),
  ]);
  const active = projectWithImage("DDDD", "active.png");
  const oldest = projectWithImage("AAAA", "oldest.png");
  const middle = projectWithImage("BBBB", "middle.png");
  const newest = projectWithImage("CCCC", "newest.png");

  const history = appendStoreHistory(
    appendStoreHistory(
      appendStoreHistory([], oldest, active, 6),
      middle,
      active,
      6,
    ),
    newest,
    active,
    6,
  );

  assert.deepEqual(history.map((project) => project.slides[0].name), [
    "middle.png",
    "newest.png",
  ]);
});

test("store history keeps lightweight edits while enforcing its entry limit", () => {
  const active = createScratchStoreProject();
  let history: ReturnType<typeof appendStoreHistory> = [];
  for (let index = 0; index < MAX_STORE_HISTORY_ENTRIES + 5; index += 1) {
    history = appendStoreHistory(history, { ...active, updatedAt: index }, active);
  }

  assert.equal(history.length, MAX_STORE_HISTORY_ENTRIES);
  assert.equal(history[0].updatedAt, 5);
});

test("store history groups only repeated edits to the same field", () => {
  const project = createScratchStoreProject();
  const slide = project.slides[0];
  const shadowEdit = {
    ...project,
    theme: { ...project.theme, shadow: project.theme.shadow + 1 },
    updatedAt: project.updatedAt + 1,
  };
  const headlineEdit = {
    ...project,
    slides: project.slides.map((candidate) => candidate.id === slide.id
      ? { ...candidate, headline: "Updated" }
      : candidate),
    updatedAt: project.updatedAt + 1,
  };
  const imageReplacement = {
    ...project,
    slides: project.slides.map((candidate) => candidate.id === slide.id
      ? { ...candidate, src: "data:image/png;base64,AAAA", name: "replacement.png" }
      : candidate),
  };
  const deviceMove = {
    ...project,
    slides: project.slides.map((candidate) => candidate.id === slide.id
      ? {
          ...candidate,
          device: {
            ...candidate.device,
            offsetX: candidate.device.offsetX + 1,
            offsetY: candidate.device.offsetY + 1,
          },
        }
      : candidate),
    updatedAt: project.updatedAt + 1,
  };

  assert.equal(storeHistoryGroupKey(project, shadowEdit), "theme.shadow");
  assert.equal(storeHistoryGroupKey(project, headlineEdit), `slides.${slide.id}.headline`);
  assert.equal(storeHistoryGroupKey(project, deviceMove), `slides.${slide.id}.device`);
  assert.equal(storeHistoryGroupKey(project, imageReplacement), null);
  assert.equal(storeHistoryGroupKey(project, { ...project, slides: [] }), null);
});

test("a new Store Screenshots visit offers a complete editable starter set", () => {
  const project = createStarterStoreProject();

  assert.equal(project.templateId, "classic");
  assert.equal(project.slides.length, 8);
  assert.equal(project.selectedSlideId, project.slides[0].id);
  assert.equal(project.slides[0].src, "/store-screenshot-create.png");
  assert.equal(new Set(project.slides.map((slide) => slide.src)).size, 8);
  assert.ok(project.slides.every((slide) => slide.headline.length > 0));
  assert.ok(project.slides.every((slide) => slide.subhead.length === 0));
  assert.ok(project.slides.every((slide) => slide.device.scale === 1.05));
  assert.ok(project.slides.every((slide) => slide.device.offsetY === -5));
  assert.ok(project.slides.every((slide) => slide.image.mode === "fill"));
  assert.ok(project.slides.every((slide) => slide.backgroundOverride !== null));
  assert.equal(
    new Set(project.slides.map((slide) => JSON.stringify(slide.backgroundOverride))).size,
    8,
  );
  assert.equal(project.theme.headlineColor, "#111111");
  assert.deepEqual(project.theme.background, {
    from: "#FAFAFA",
    to: "#F3D7F7",
    angle: 180,
  });
});

test("starting from scratch creates one simple customizable mockup", () => {
  const project = createScratchStoreProject();

  assert.equal(project.templateId, "classic");
  assert.equal(project.slides.length, 1);
  assert.equal(project.selectedSlideId, project.slides[0].id);
  assert.equal(project.slides[0].name, "Screenshot 1");
  assert.equal(project.slides[0].src, "/store-screenshot-create.png");
  assert.equal(project.theme.headlineColor, "#111111");
});

test("store image validation rejects unsupported and oversized uploads", () => {
  const unsupported = { name: "notes.pdf", type: "application/pdf", size: 1_000 } as File;
  const oversized = {
    name: "huge.png",
    type: "image/png",
    size: MAX_STORE_IMAGE_SIZE + 1,
  } as File;

  assert.throws(() => assertStoreImageFile(unsupported), /not supported/);
  assert.throws(() => assertStoreImageFile(oversized), /too large/);
  assert.doesNotThrow(() => assertStoreImageFile({
    name: "screen.webp",
    type: "image/webp",
    size: MAX_STORE_IMAGE_SIZE,
  } as File));
});

test("store image budgeting counts slide, background, and overlay data", () => {
  const slide = createStoreSlide("data:image/png;base64,AAAA", "screen.png");
  slide.backgroundImageOverride = {
    src: "data:image/png;base64,AAAA",
    name: "background.png",
  };
  slide.overlay = {
    src: "data:image/png;base64,AAAA",
    name: "overlay.png",
    x: 50,
    y: 50,
    size: 20,
    opacity: 1,
  };

  assert.equal(storeDataUrlBytes("data:image/png;base64,AAAA"), 3);
  assert.equal(storeSlidesImageBytes([slide]), 9);
  assert.doesNotThrow(() => assertStoreImageBudget(80, 20));
  assert.throws(
    () => assertStoreImageBudget(MAX_STORE_PROJECT_IMAGE_BYTES, 1),
    /complete set under 100 MB/,
  );
});

test("multi-file uploads reject a batch before reading beyond the available project budget", async () => {
  const files = ["one.png", "two.png"].map((name) => ({
    name,
    type: "image/png",
    size: MAX_STORE_IMAGE_SIZE,
  } as File));

  await assert.rejects(
    filesToStoreSlides(files, { availableBytes: MAX_STORE_IMAGE_SIZE * 2 - 1 }),
    /complete set under 100 MB/,
  );
});

test("duplicating a slide preserves its design while creating a new identity", () => {
  const source = createStoreSlide("data:image/png;base64,a", "home.png");
  source.headline = "A polished headline";
  source.device.rotateY = 12;
  source.secondaryDevice.offsetX = -8;
  source.copyPosition = { offsetX: 12, offsetY: 18 };
  source.headingOffset = { x: 4, y: 8 };
  source.headlineColorOverride = "#FFCC00";
  source.subheadColorOverride = "#00CCFF";
  source.extraTexts = [{
    id: "extra-1",
    text: "A useful detail",
    kind: "subheading",
    fontSize: 3.25,
    bold: false,
    italic: true,
    color: "#AABBCC",
    x: 50,
    y: 44,
  }];
  source.backgroundImageOverride = {
    src: "data:image/png;base64,background",
    name: "background.png",
  };
  const copy = duplicateStoreSlide(source);

  assert.notEqual(copy.id, source.id);
  assert.equal(copy.headline, source.headline);
  assert.equal(copy.device.rotateY, 12);
  assert.notEqual(copy.device, source.device);
  assert.deepEqual(copy.secondaryDevice, source.secondaryDevice);
  assert.notEqual(copy.secondaryDevice, source.secondaryDevice);
  assert.deepEqual(copy.copyPosition, source.copyPosition);
  assert.notEqual(copy.copyPosition, source.copyPosition);
  assert.deepEqual(copy.headingOffset, source.headingOffset);
  assert.notEqual(copy.headingOffset, source.headingOffset);
  assert.equal(copy.headlineColorOverride, "#FFCC00");
  assert.equal(copy.subheadColorOverride, "#00CCFF");
  assert.deepEqual(copy.extraTexts, source.extraTexts);
  assert.notEqual(copy.extraTexts, source.extraTexts);
  assert.deepEqual(copy.backgroundImageOverride, source.backgroundImageOverride);
  assert.notEqual(copy.backgroundImageOverride, source.backgroundImageOverride);
});

test("device slot helpers keep Duo mockup controls independent", () => {
  const slide = createStoreSlide("data:image/png;base64,a", "home.png");
  const secondaryTransform = {
    ...slide.secondaryDevice,
    offsetX: 12,
    rotation: -7,
  };
  const transformed = withStoreDeviceTransform(slide, "secondary", secondaryTransform);
  const styled = withStoreDeviceStyleOverride(transformed, "secondary", "screen-only");

  assert.equal(getStoreDeviceTransform(styled, "primary"), slide.device);
  assert.equal(getStoreDeviceTransform(styled, "secondary"), secondaryTransform);
  assert.equal(getStoreDeviceStyleOverride(styled, "primary"), null);
  assert.equal(getStoreDeviceStyleOverride(styled, "secondary"), "screen-only");
});

test("switching a free screen back to an iPhone clamps its position", () => {
  const slide = createStoreSlide("data:image/png;base64,a", "home.png");
  const freeScreen = withStoreDeviceTransform(slide, "primary", {
    ...slide.device,
    offsetX: 82,
    offsetY: -64,
  });
  const iphone = withStoreDeviceStyleOverride(freeScreen, "primary", "iphone");

  assert.equal(iphone.device.offsetX, 25);
  assert.equal(iphone.device.offsetY, -25);
});

test("deleting the final slide signals that the saved project must be removed", () => {
  const onlySlide = createStoreSlide("data:image/png;base64,only", "only.png");
  const project = createStoreProject([onlySlide]);

  assert.equal(removeStoreSlide(project, onlySlide.id), null);
});

test("deleting a slide selects the nearest remaining slide", () => {
  const slides = [0, 1, 2].map((index) =>
    createStoreSlide(`data:image/png;base64,${index}`, `screen-${index}.png`),
  );
  const project = createStoreProject(slides);
  project.selectedSlideId = slides[1].id;

  const nextProject = removeStoreSlide(project, slides[1].id);

  assert.ok(nextProject);
  assert.deepEqual(nextProject.slides.map((slide) => slide.id), [slides[0].id, slides[2].id]);
  assert.equal(nextProject.selectedSlideId, slides[2].id);
});

test("resetting positions preserves the slide layout, content, and image", () => {
  const slides = [0, 1].map((index) =>
    createStoreSlide(`data:image/png;base64,${index}`, `screen-${index}.png`),
  );
  const project = createStoreProject(slides);
  project.templateId = "editorial";
  project.slides[0] = {
    ...project.slides[0],
    headline: "Keep this headline",
    subhead: "Keep this subheading",
    layoutOverride: "minimal",
    copyPosition: { offsetX: 14, offsetY: 20 },
    headingOffset: { x: -8, y: 12 },
    subheadingOffset: { x: 7, y: -4 },
    extraTexts: [{
      id: "extra-copy",
      text: "Keep this extra text",
      kind: "subheading",
      fontSize: 3.25,
      bold: false,
      italic: false,
      color: null,
      x: 76,
      y: 71,
    }],
    image: { mode: "custom", scale: 1.4, offsetX: 12, offsetY: -9 },
    device: { scale: 1.2, offsetX: 9, offsetY: -7, rotation: 8, rotateX: 5, rotateY: -4 },
    secondaryDevice: { scale: 0.85, offsetX: -6, offsetY: 5, rotation: -7, rotateX: -3, rotateY: 4 },
  };

  assert.equal(storeSlidePositionsChanged(project.slides[0]), true);
  const reset = resetStoreSlidePositions(project.slides[0]);

  assert.equal(reset.src, "data:image/png;base64,0");
  assert.equal(reset.headline, "Keep this headline");
  assert.equal(reset.subhead, "Keep this subheading");
  assert.equal(reset.extraTexts[0].text, "Keep this extra text");
  assert.equal(reset.layoutOverride, "minimal");
  assert.deepEqual(reset.copyPosition, { offsetX: 0, offsetY: 0 });
  assert.deepEqual(reset.headingOffset, { x: 0, y: 0 });
  assert.deepEqual(reset.subheadingOffset, { x: 0, y: 0 });
  assert.deepEqual(
    { x: reset.extraTexts[0].x, y: reset.extraTexts[0].y },
    { x: 50, y: 42 },
  );
  assert.deepEqual(reset.device, {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    rotateX: 0,
    rotateY: 0,
  });
  assert.deepEqual(reset.secondaryDevice, {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    rotateX: 0,
    rotateY: 0,
  });
  assert.deepEqual(reset.image, { mode: "custom", scale: 1.4, offsetX: 12, offsetY: -9 });
  assert.equal(storeSlidePositionsChanged(reset), false);
});

test("keyboard reordering moves one slide at a time and keeps it selected", () => {
  const slides = [0, 1, 2].map((index) =>
    createStoreSlide(`data:image/png;base64,${index}`, `screen-${index}.png`),
  );
  const project = createStoreProject(slides);

  const moved = moveStoreSlide(project, slides[1].id, 1);
  assert.deepEqual(moved.slides.map((slide) => slide.id), [slides[0].id, slides[2].id, slides[1].id]);
  assert.equal(moved.selectedSlideId, slides[1].id);
  assert.equal(moveStoreSlide(moved, slides[1].id, 1), moved);
});

test("saved projects are normalized before the editor uses them", () => {
  const restored = normalizeStoreProject({
    version: 1,
    templateId: "unknown-template",
    theme: {
      background: { from: "invalid", to: "#123456", angle: 900 },
      headlineColor: "invalid",
      subheadColor: "#ABCDEF",
      fontFamily: "unknown-font",
      deviceStyle: "android",
      shadow: 500,
    },
    slides: [{
      id: "saved-slide",
      src: "data:image/png;base64,saved",
      name: "saved.png",
      headline: "Saved heading",
      layoutOverride: "no-mockup",
      backgroundOverride: { from: "#FAFAFA", to: "#CDEAF4", angle: -20 },
      image: { mode: "custom", scale: 99, offsetX: -999, offsetY: 999 },
      device: { scale: 1, offsetX: -999, offsetY: 999, rotation: 0, rotateX: 0, rotateY: 0 },
    }],
    selectedSlideId: "missing-slide",
  });

  assert.ok(restored);
  assert.equal(restored.templateId, "classic");
  assert.equal(restored.selectedSlideId, "saved-slide");
  assert.equal(restored.theme.background.from, "#090A0C");
  assert.equal(restored.theme.background.to, "#123456");
  assert.equal(restored.theme.background.angle, 360);
  assert.equal(restored.theme.deviceStyle, "iphone");
  assert.equal(restored.theme.shadow, 100);
  assert.equal(restored.slides[0].layoutOverride, "no-mockup");
  assert.deepEqual(restored.slides[0].backgroundOverride, {
    from: "#FAFAFA",
    to: "#CDEAF4",
    angle: 0,
  });
  assert.deepEqual(restored.slides[0].image, {
    mode: "custom",
    scale: 4,
    offsetX: -100,
    offsetY: 100,
  });
  assert.equal(restored.slides[0].device.offsetX, -100);
  assert.equal(restored.slides[0].device.offsetY, 100);
  assert.deepEqual(restored.slides[0].filters, { brightness: 100, contrast: 100, saturation: 100 });
  assert.deepEqual(restored.slides[0].extraTexts, []);
});

test("unsupported future projects and empty data are ignored safely", () => {
  assert.equal(normalizeStoreProject({ version: 2, slides: [] }), null);
  assert.equal(normalizeStoreProject({ version: 2, slides: [{ src: "data:image/png;base64,a" }] }), null);
  assert.equal(normalizeStoreProject({ version: 1, slides: [{ name: "missing-source" }] }), null);
});
