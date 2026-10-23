import {
  DEFAULT_STORE_THEME,
  MAX_STORE_SLIDES,
  STORE_FONT_OPTIONS,
  STORE_PROJECT_VERSION,
  STORE_TEMPLATES,
} from "./config";
import type {
  StoreBackgroundImage,
  StoreBackground,
  StoreDeviceSlot,
  StoreDeviceStyle,
  StoreDeviceTransform,
  StoreExtraText,
  StoreLayoutId,
  StoreOverlay,
  StoreProject,
  StoreSlide,
  StoreTemplateId,
  StoreTextKind,
} from "./types";

export const DEFAULT_IMAGE_TRANSFORM = {
  mode: "fill",
  scale: 1,
  offsetX: 0,
  offsetY: 0,
} as const;
export const DEFAULT_COPY_POSITION = { offsetX: 0, offsetY: 0 } as const;
export const DEFAULT_TEXT_OFFSET = { x: 0, y: 0 } as const;
export const DEFAULT_DEVICE_TRANSFORM = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  rotateX: 0,
  rotateY: 0,
} as const;
export const DEFAULT_IMAGE_FILTERS = { brightness: 100, contrast: 100, saturation: 100 } as const;
export const MAX_STORE_IMAGE_SIZE = 25 * 1024 * 1024;
export const MAX_STORE_PROJECT_IMAGE_BYTES = 100 * 1024 * 1024;
export const STORE_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"] as const;
export const STORE_STARTER_SCREEN_SRC = "/store-screenshot-create.png";
export const STORE_TEMPLATE_SCREEN_SRCS = [
  STORE_STARTER_SCREEN_SRC,
  "/store-screenshot-learn.png",
  "/store-screenshot-voice.png",
  "/store-screenshot-write.png",
  "/store-screenshot-ideas.png",
  "/store-screenshot-butterfly.png",
  "/store-screenshot-writing.png",
  "/store-screenshot-inspiration.png",
] as const;

const STORE_LAYOUT_IDS: StoreLayoutId[] = [
  "classic",
  "hero",
  "editorial-left",
  "editorial-right",
  "offset",
  "duo",
  "minimal",
  "no-mockup",
];
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function finiteNumber(value: unknown, fallback: number, min: number, max: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function nullableColor(value: unknown): string | null {
  return typeof value === "string" && HEX_COLOR.test(value) ? value : null;
}

function normalizeBackground(value: unknown): StoreBackground | null {
  if (!isRecord(value)) return null;
  const from = nullableColor(value.from);
  const to = nullableColor(value.to);
  if (!from || !to) return null;
  return {
    from,
    to,
    angle: finiteNumber(value.angle, 180, 0, 360),
  };
}

export function storeDataUrlBytes(src: string): number {
  const commaIndex = src.indexOf(",");
  if (commaIndex === -1) return src.length;
  const header = src.slice(0, commaIndex);
  const payload = src.slice(commaIndex + 1);
  if (!header.includes(";base64")) {
    try {
      return new TextEncoder().encode(decodeURIComponent(payload)).length;
    } catch {
      return payload.length;
    }
  }
  const padding = payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((payload.length * 3) / 4) - padding);
}

export function storeSlideImageBytes(slide: StoreSlide): number {
  return storeDataUrlBytes(slide.src)
    + (slide.backgroundImageOverride ? storeDataUrlBytes(slide.backgroundImageOverride.src) : 0)
    + (slide.overlay ? storeDataUrlBytes(slide.overlay.src) : 0);
}

export function storeSlidesImageBytes(slides: StoreSlide[]): number {
  return slides.reduce((total, slide) => total + storeSlideImageBytes(slide), 0);
}

export function assertStoreImageFile(file: File): void {
  if (!STORE_IMAGE_TYPES.includes(file.type as (typeof STORE_IMAGE_TYPES)[number])) {
    throw new Error(`“${file.name}” is not supported. Choose a PNG, JPEG, or WebP image.`);
  }
  if (file.size > MAX_STORE_IMAGE_SIZE) {
    throw new Error(`“${file.name}” is too large. Choose an image smaller than 25 MB.`);
  }
}

export function assertStoreImageBudget(
  currentBytes: number,
  incomingBytes: number,
  replacedBytes = 0,
): void {
  if (currentBytes - replacedBytes + incomingBytes <= MAX_STORE_PROJECT_IMAGE_BYTES) return;
  throw new Error("These images would make the project too large. Keep the complete set under 100 MB.");
}

function normalizeBackgroundImage(value: unknown): StoreBackgroundImage | null {
  if (!isRecord(value) || typeof value.src !== "string" || value.src.length === 0) return null;
  return {
    src: value.src,
    name: stringValue(value.name, "Background image"),
  };
}

function normalizeOverlay(value: unknown): StoreOverlay | null {
  if (!isRecord(value) || typeof value.src !== "string" || value.src.length === 0) return null;
  return {
    src: value.src,
    name: stringValue(value.name, "Overlay image"),
    x: finiteNumber(value.x, 75, 0, 100),
    y: finiteNumber(value.y, 20, 0, 100),
    size: finiteNumber(value.size, 24, 8, 70),
    opacity: finiteNumber(value.opacity, 1, 0.1, 1),
  };
}

function normalizeExtraText(value: unknown, usedIds: Set<string>): StoreExtraText | null {
  if (!isRecord(value)) return null;
  const kind: StoreTextKind = value.kind === "heading" ? "heading" : "subheading";
  const storedId = typeof value.id === "string" && value.id.length > 0 ? value.id : null;
  const id = storedId && !usedIds.has(storedId) ? storedId : crypto.randomUUID();
  usedIds.add(id);
  return {
    id,
    text: stringValue(value.text, "Add another message"),
    kind,
    fontSize: finiteNumber(value.fontSize, kind === "heading" ? 5.5 : 3.25, 2, 20),
    bold: value.bold === true,
    italic: value.italic === true,
    color: nullableColor(value.color),
    x: finiteNumber(value.x, 50, 3, 97),
    y: finiteNumber(value.y, 42, 2, 98),
  };
}

function normalizeSlide(value: unknown, index: number, usedIds: Set<string>): StoreSlide | null {
  if (!isRecord(value) || typeof value.src !== "string" || value.src.length === 0) return null;
  const base = createStoreSlide(value.src, stringValue(value.name, `Screenshot ${index + 1}`));
  const storedId = typeof value.id === "string" && value.id.length > 0 ? value.id : null;
  const id = storedId && !usedIds.has(storedId) ? storedId : base.id;
  usedIds.add(id);
  const layoutOverride = typeof value.layoutOverride === "string"
    && STORE_LAYOUT_IDS.includes(value.layoutOverride as StoreLayoutId)
    ? value.layoutOverride as StoreLayoutId
    : null;
  const deviceStyleOverride: StoreDeviceStyle | null = value.deviceStyleOverride === "screen-only"
    ? "screen-only"
    : value.deviceStyleOverride === "iphone"
      ? "iphone"
      : null;
  const secondaryDeviceStyleOverride: StoreDeviceStyle | null = value.secondaryDeviceStyleOverride === "screen-only"
    ? "screen-only"
    : value.secondaryDeviceStyleOverride === "iphone"
      ? "iphone"
      : null;
  const copyPosition = isRecord(value.copyPosition) ? value.copyPosition : {};
  const headingOffset = isRecord(value.headingOffset) ? value.headingOffset : {};
  const subheadingOffset = isRecord(value.subheadingOffset) ? value.subheadingOffset : {};
  const image = isRecord(value.image) ? value.image : {};
  const device = isRecord(value.device) ? value.device : {};
  const secondaryDevice = isRecord(value.secondaryDevice) ? value.secondaryDevice : {};
  const filters = isRecord(value.filters) ? value.filters : {};
  const textIds = new Set<string>();
  const extraTexts = Array.isArray(value.extraTexts)
    ? value.extraTexts
      .map((text) => normalizeExtraText(text, textIds))
      .filter((text): text is StoreExtraText => text !== null)
      .slice(0, 6)
    : [];

  return {
    ...base,
    id,
    headline: stringValue(value.headline, base.headline).slice(0, 80),
    subhead: stringValue(value.subhead, base.subhead).slice(0, 140),
    headlineColorOverride: nullableColor(value.headlineColorOverride),
    subheadColorOverride: nullableColor(value.subheadColorOverride),
    layoutOverride,
    backgroundOverride: normalizeBackground(value.backgroundOverride),
    backgroundImageOverride: normalizeBackgroundImage(value.backgroundImageOverride),
    deviceStyleOverride,
    secondaryDeviceStyleOverride,
    duoLeftSlideId: typeof value.duoLeftSlideId === "string" ? value.duoLeftSlideId : null,
    duoRightSlideId: typeof value.duoRightSlideId === "string" ? value.duoRightSlideId : null,
    copyPosition: {
      offsetX: finiteNumber(copyPosition.offsetX, 0, -60, 60),
      offsetY: finiteNumber(copyPosition.offsetY, 0, -30, 80),
    },
    headingOffset: {
      x: finiteNumber(headingOffset.x, 0, -60, 60),
      y: finiteNumber(headingOffset.y, 0, -30, 80),
    },
    subheadingOffset: {
      x: finiteNumber(subheadingOffset.x, 0, -60, 60),
      y: finiteNumber(subheadingOffset.y, 0, -30, 80),
    },
    extraTexts,
    image: {
      mode: image.mode === "fit" || image.mode === "custom" ? image.mode : "fill",
      scale: finiteNumber(image.scale, 1, 0.25, 4),
      offsetX: finiteNumber(image.offsetX, 0, -100, 100),
      offsetY: finiteNumber(image.offsetY, 0, -100, 100),
    },
    device: {
      scale: finiteNumber(device.scale, 1, 0.65, 1.35),
      offsetX: finiteNumber(device.offsetX, 0, -100, 100),
      offsetY: finiteNumber(device.offsetY, 0, -100, 100),
      rotation: finiteNumber(device.rotation, 0, -25, 25),
      rotateX: finiteNumber(device.rotateX, 0, -25, 25),
      rotateY: finiteNumber(device.rotateY, 0, -25, 25),
    },
    secondaryDevice: {
      scale: finiteNumber(secondaryDevice.scale, 1, 0.65, 1.35),
      offsetX: finiteNumber(secondaryDevice.offsetX, 0, -100, 100),
      offsetY: finiteNumber(secondaryDevice.offsetY, 0, -100, 100),
      rotation: finiteNumber(secondaryDevice.rotation, 0, -25, 25),
      rotateX: finiteNumber(secondaryDevice.rotateX, 0, -25, 25),
      rotateY: finiteNumber(secondaryDevice.rotateY, 0, -25, 25),
    },
    filters: {
      brightness: finiteNumber(filters.brightness, 100, 50, 150),
      contrast: finiteNumber(filters.contrast, 100, 50, 150),
      saturation: finiteNumber(filters.saturation, 100, 0, 180),
    },
    overlay: normalizeOverlay(value.overlay),
  };
}

export function createStoreSlide(src: string, name: string): StoreSlide {
  return {
    id: crypto.randomUUID(),
    src,
    name,
    headline: "Show what makes your app special",
    subhead: "Explain the benefit in one clear, compelling sentence.",
    headlineColorOverride: null,
    subheadColorOverride: null,
    layoutOverride: null,
    backgroundOverride: null,
    backgroundImageOverride: null,
    deviceStyleOverride: null,
    secondaryDeviceStyleOverride: null,
    duoLeftSlideId: null,
    duoRightSlideId: null,
    copyPosition: { ...DEFAULT_COPY_POSITION },
    headingOffset: { ...DEFAULT_TEXT_OFFSET },
    subheadingOffset: { ...DEFAULT_TEXT_OFFSET },
    extraTexts: [],
    image: { ...DEFAULT_IMAGE_TRANSFORM },
    device: { ...DEFAULT_DEVICE_TRANSFORM },
    secondaryDevice: { ...DEFAULT_DEVICE_TRANSFORM },
    filters: { ...DEFAULT_IMAGE_FILTERS },
    overlay: null,
  };
}

export function getStoreDeviceTransform(
  slide: StoreSlide,
  slot: StoreDeviceSlot,
): StoreDeviceTransform {
  return slot === "secondary" ? slide.secondaryDevice : slide.device;
}

export function withStoreDeviceTransform(
  slide: StoreSlide,
  slot: StoreDeviceSlot,
  transform: StoreDeviceTransform,
): StoreSlide {
  return slot === "secondary"
    ? { ...slide, secondaryDevice: transform }
    : { ...slide, device: transform };
}

export function getStoreDeviceStyleOverride(
  slide: StoreSlide,
  slot: StoreDeviceSlot,
): StoreDeviceStyle | null {
  return slot === "secondary"
    ? slide.secondaryDeviceStyleOverride
    : slide.deviceStyleOverride;
}

export function withStoreDeviceStyleOverride(
  slide: StoreSlide,
  slot: StoreDeviceSlot,
  style: StoreDeviceStyle,
): StoreSlide {
  const transform = getStoreDeviceTransform(slide, slot);
  const nextTransform = style === "iphone"
    ? {
        ...transform,
        offsetX: finiteNumber(transform.offsetX, 0, -25, 25),
        offsetY: finiteNumber(transform.offsetY, 0, -25, 25),
      }
    : transform;

  return slot === "secondary"
    ? {
        ...slide,
        secondaryDeviceStyleOverride: style,
        secondaryDevice: nextTransform,
      }
    : {
        ...slide,
        deviceStyleOverride: style,
        device: nextTransform,
      };
}

export function createStoreProject(slides: StoreSlide[]): StoreProject {
  const now = Date.now();
  const safeSlides = slides.slice(0, MAX_STORE_SLIDES);
  return {
    version: STORE_PROJECT_VERSION,
    templateId: "classic",
    theme: structuredClone(DEFAULT_STORE_THEME),
    slides: safeSlides,
    selectedSlideId: safeSlides[0]?.id ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

export function createStarterStoreProject(): StoreProject {
  const backgrounds: StoreBackground[] = [
    { from: "#FAFAFA", to: "#E8DDF5", angle: 168 },
    { from: "#FAFAFA", to: "#CDEAF4", angle: 178 },
    { from: "#FAFAFA", to: "#EED8F1", angle: 186 },
    { from: "#FAFAFA", to: "#C7EAF3", angle: 180 },
    { from: "#FAFAFA", to: "#EBD9E8", angle: 158 },
    { from: "#FAFAFA", to: "#D8E5F5", angle: 198 },
    { from: "#FAFAFA", to: "#F0D5ED", angle: 182 },
    { from: "#FAFAFA", to: "#C2E8F3", angle: 176 },
  ];
  const copy = [
    {
      name: "Prepare",
      headline: "Prepare for your\nnext challenge",
      subhead: "",
    },
    {
      name: "Learn",
      headline: "Go deep\nand learn",
      subhead: "",
    },
    {
      name: "Voice",
      headline: "Chat in\nvoice mode",
      subhead: "",
    },
    {
      name: "Reimagine",
      headline: "Reimagine\nany photo",
      subhead: "",
    },
    {
      name: "Ideas",
      headline: "See your ideas\ncome to life",
      subhead: "",
    },
    {
      name: "Discover",
      headline: "Learn anything\nyour way",
      subhead: "",
    },
    {
      name: "Writing",
      headline: "Get writing that\nsounds like you",
      subhead: "",
    },
    {
      name: "Inspiration",
      headline: "Find creative\ninspiration",
      subhead: "",
    },
  ];
  const project = createStoreProject(STORE_TEMPLATE_SCREEN_SRCS.map((src, index) => ({
    ...createStoreSlide(src, copy[index].name),
    headline: copy[index].headline,
    subhead: copy[index].subhead,
    backgroundOverride: structuredClone(backgrounds[index]),
    headingOffset: { x: 0, y: 1 },
    device: { ...DEFAULT_DEVICE_TRANSFORM, scale: 1.05, offsetY: -5 },
  })));
  project.templateId = "classic";
  project.theme = {
    ...project.theme,
    background: { from: "#FAFAFA", to: "#F3D7F7", angle: 180 },
    headlineColor: "#111111",
    subheadColor: "#52525B",
    shadow: 35,
  };
  return project;
}

export function createScratchStoreProject(): StoreProject {
  const slide = createStoreSlide(STORE_STARTER_SCREEN_SRC, "Screenshot 1");
  slide.headline = "Prepare for your\nnext challenge";
  slide.subhead = "";
  slide.headingOffset = { x: 0, y: 1 };
  slide.device = { ...DEFAULT_DEVICE_TRANSFORM, scale: 1.05, offsetY: -5 };
  const project = createStoreProject([slide]);
  project.theme = {
    ...project.theme,
    background: { from: "#FAFAFA", to: "#F3D7F7", angle: 180 },
    headlineColor: "#111111",
    subheadColor: "#52525B",
    shadow: 35,
  };
  return project;
}

export function normalizeStoreProject(value: unknown): StoreProject | null {
  if (!isRecord(value) || !Array.isArray(value.slides)) return null;
  if (typeof value.version === "number" && value.version > STORE_PROJECT_VERSION) return null;

  const slideIds = new Set<string>();
  const slides = value.slides
    .map((slide, index) => normalizeSlide(slide, index, slideIds))
    .filter((slide): slide is StoreSlide => slide !== null)
    .slice(0, MAX_STORE_SLIDES);
  if (slides.length === 0) return null;

  const validSlideIds = new Set(slides.map((slide) => slide.id));
  const normalizedSlides = slides.map((slide) => ({
    ...slide,
    duoLeftSlideId: slide.duoLeftSlideId && validSlideIds.has(slide.duoLeftSlideId)
      ? slide.duoLeftSlideId
      : null,
    duoRightSlideId: slide.duoRightSlideId && validSlideIds.has(slide.duoRightSlideId)
      ? slide.duoRightSlideId
      : null,
  }));
  const theme = isRecord(value.theme) ? value.theme : {};
  const background = isRecord(theme.background) ? theme.background : {};
  const storedTemplate = typeof value.templateId === "string"
    ? STORE_TEMPLATES.find((template) => template.id === value.templateId)?.id
    : undefined;
  const templateId: StoreTemplateId = storedTemplate ?? "classic";
  const storedFont = typeof theme.fontFamily === "string"
    ? STORE_FONT_OPTIONS.find((font) => font.value === theme.fontFamily)?.value
    : undefined;
  const selectedSlideId = typeof value.selectedSlideId === "string"
    && validSlideIds.has(value.selectedSlideId)
    ? value.selectedSlideId
    : normalizedSlides[0].id;
  const now = Date.now();

  return {
    version: STORE_PROJECT_VERSION,
    templateId,
    theme: {
      background: {
        from: nullableColor(background.from) ?? DEFAULT_STORE_THEME.background.from,
        to: nullableColor(background.to) ?? DEFAULT_STORE_THEME.background.to,
        angle: finiteNumber(background.angle, DEFAULT_STORE_THEME.background.angle, 0, 360),
      },
      headlineColor: nullableColor(theme.headlineColor) ?? DEFAULT_STORE_THEME.headlineColor,
      subheadColor: nullableColor(theme.subheadColor) ?? DEFAULT_STORE_THEME.subheadColor,
      fontFamily: storedFont ?? DEFAULT_STORE_THEME.fontFamily,
      deviceStyle: theme.deviceStyle === "screen-only" ? "screen-only" : "iphone",
      shadow: finiteNumber(theme.shadow, DEFAULT_STORE_THEME.shadow, 0, 100),
    },
    slides: normalizedSlides,
    selectedSlideId,
    createdAt: finiteNumber(value.createdAt, now, 0, Number.MAX_SAFE_INTEGER),
    updatedAt: finiteNumber(value.updatedAt, now, 0, Number.MAX_SAFE_INTEGER),
  };
}

export function duplicateStoreSlide(slide: StoreSlide): StoreSlide {
  return {
    ...structuredClone(slide),
    id: crypto.randomUUID(),
    name: `${slide.name.replace(/\.[^/.]+$/, "")} copy`,
  };
}

export function storeSlidePositionsChanged(slide: StoreSlide): boolean {
  const extraTextPositionsChanged = slide.extraTexts.some((text, index) => (
    text.x !== 50 || text.y !== Math.min(84, 42 + index * 9)
  ));
  return slide.copyPosition.offsetX !== 0
    || slide.copyPosition.offsetY !== 0
    || slide.headingOffset.x !== 0
    || slide.headingOffset.y !== 0
    || slide.subheadingOffset.x !== 0
    || slide.subheadingOffset.y !== 0
    || extraTextPositionsChanged
    || slide.device.scale !== 1
    || slide.device.offsetX !== 0
    || slide.device.offsetY !== 0
    || slide.device.rotation !== 0
    || slide.device.rotateX !== 0
    || slide.device.rotateY !== 0
    || slide.secondaryDevice.scale !== 1
    || slide.secondaryDevice.offsetX !== 0
    || slide.secondaryDevice.offsetY !== 0
    || slide.secondaryDevice.rotation !== 0
    || slide.secondaryDevice.rotateX !== 0
    || slide.secondaryDevice.rotateY !== 0;
}

export function resetStoreSlidePositions(slide: StoreSlide): StoreSlide {
  return {
    ...slide,
    copyPosition: { ...DEFAULT_COPY_POSITION },
    headingOffset: { ...DEFAULT_TEXT_OFFSET },
    subheadingOffset: { ...DEFAULT_TEXT_OFFSET },
    extraTexts: slide.extraTexts.map((text, index) => ({
      ...text,
      x: 50,
      y: Math.min(84, 42 + index * 9),
    })),
    device: { ...DEFAULT_DEVICE_TRANSFORM },
    secondaryDevice: { ...DEFAULT_DEVICE_TRANSFORM },
  };
}

export function moveStoreSlide(
  project: StoreProject,
  slideId: string,
  direction: -1 | 1,
): StoreProject {
  const currentIndex = project.slides.findIndex((slide) => slide.id === slideId);
  const nextIndex = currentIndex + direction;
  if (currentIndex === -1 || nextIndex < 0 || nextIndex >= project.slides.length) return project;

  const slides = [...project.slides];
  [slides[currentIndex], slides[nextIndex]] = [slides[nextIndex], slides[currentIndex]];
  return {
    ...project,
    slides,
    selectedSlideId: slideId,
    updatedAt: Date.now(),
  };
}

export function removeStoreSlide(project: StoreProject, slideId: string): StoreProject | null {
  const removedIndex = project.slides.findIndex((slide) => slide.id === slideId);
  if (removedIndex === -1) return project;

  const slides = project.slides.filter((slide) => slide.id !== slideId);
  if (slides.length === 0) return null;

  const selectedSlide = slides[Math.min(removedIndex, slides.length - 1)];
  return {
    ...project,
    slides,
    selectedSlideId: selectedSlide.id,
    updatedAt: Date.now(),
  };
}

export async function fileToDataUrl(file: File): Promise<string> {
  assertStoreImageFile(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export async function filesToStoreSlides(
  files: File[],
  options: { availableBytes?: number; maxFiles?: number } = {},
): Promise<StoreSlide[]> {
  const candidates = files.slice(0, options.maxFiles ?? MAX_STORE_SLIDES);
  candidates.forEach(assertStoreImageFile);
  const incomingBytes = candidates.reduce((total, file) => total + file.size, 0);
  assertStoreImageBudget(
    MAX_STORE_PROJECT_IMAGE_BYTES - (options.availableBytes ?? MAX_STORE_PROJECT_IMAGE_BYTES),
    incomingBytes,
  );

  const slides: StoreSlide[] = [];
  for (const file of candidates) {
    const src = await fileToDataUrl(file);
    slides.push(createStoreSlide(src, file.name));
  }
  return slides;
}
