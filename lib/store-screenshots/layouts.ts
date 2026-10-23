import { STORE_TEMPLATES } from "./config";
import type {
  StoreComposition,
  StoreLayoutId,
  StoreTemplateId,
} from "./types";

const COMPOSITIONS: Record<StoreLayoutId, StoreComposition> = {
  classic: {
    copy: { position: "top", align: "center", x: 50, y: 6, width: 84 },
    devices: [{ x: 50, y: 61, width: 76, rotation: 0, source: "primary" }],
  },
  hero: {
    copy: { position: "top", align: "center", x: 50, y: 5, width: 88 },
    devices: [{ x: 50, y: 69, width: 90, rotation: 0, source: "primary" }],
  },
  "editorial-left": {
    copy: { position: "left", align: "left", x: 7, y: 9, width: 66 },
    devices: [{ x: 62, y: 66, width: 78, rotation: 4, source: "primary" }],
  },
  "editorial-right": {
    copy: { position: "top", align: "left", x: 28, y: 7, width: 66 },
    devices: [{ x: 40, y: 66, width: 78, rotation: -4, source: "primary" }],
  },
  offset: {
    copy: { position: "top", align: "left", x: 8, y: 6, width: 72 },
    devices: [{ x: 64, y: 70, width: 85, rotation: 9, source: "primary" }],
  },
  duo: {
    copy: { position: "top", align: "center", x: 50, y: 5, width: 88 },
    devices: [
      { x: 35, y: 65, width: 57, rotation: -5, source: "primary" },
      { x: 67, y: 69, width: 60, rotation: 5, source: "secondary" },
    ],
  },
  minimal: {
    copy: { position: "none", align: "center", x: 50, y: 0, width: 0 },
    devices: [{ x: 50, y: 53, width: 90, rotation: 0, source: "primary" }],
  },
  "no-mockup": {
    copy: { position: "top", align: "center", x: 50, y: 38, width: 84 },
    devices: [],
  },
};

export function resolveStoreLayout(
  templateId: StoreTemplateId,
  slideIndex: number,
  override: StoreLayoutId | null,
): StoreLayoutId {
  if (override) return override;
  const template = STORE_TEMPLATES.find((item) => item.id === templateId)
    ?? STORE_TEMPLATES[0];
  return template.sequence[slideIndex % template.sequence.length];
}

export function composeStoreSlide(layoutId: StoreLayoutId): StoreComposition {
  return COMPOSITIONS[layoutId];
}

export function getStoreLayoutIds(): StoreLayoutId[] {
  return Object.keys(COMPOSITIONS) as StoreLayoutId[];
}
