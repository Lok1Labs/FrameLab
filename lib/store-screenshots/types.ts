export type StoreLayoutId =
  | "classic"
  | "hero"
  | "editorial-left"
  | "editorial-right"
  | "offset"
  | "duo"
  | "minimal"
  | "no-mockup";

export type StoreTemplateId =
  | "classic"
  | "hero"
  | "editorial"
  | "offset"
  | "duo"
  | "minimal";

export type StoreDeviceStyle = "iphone" | "screen-only";
export type StoreDeviceSlot = "primary" | "secondary";

export interface StoreOutputProfile {
  id: string;
  platform: "app-store";
  name: string;
  shortName: string;
  width: number;
  height: number;
  minSlides: number;
  maxSlides: number;
}

export interface StoreBackground {
  from: string;
  to: string;
  angle: number;
}

export interface StoreTheme {
  background: StoreBackground;
  headlineColor: string;
  subheadColor: string;
  fontFamily: string;
  deviceStyle: StoreDeviceStyle;
  shadow: number;
}

export type StoreImageFitMode = "fill" | "fit" | "custom";

export interface StoreImageTransform {
  mode: StoreImageFitMode;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface StoreCopyPosition {
  offsetX: number;
  offsetY: number;
}

export interface StoreTextOffset {
  x: number;
  y: number;
}

export type StoreTextKind = "heading" | "subheading";

export interface StoreExtraText {
  id: string;
  text: string;
  kind: StoreTextKind;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  color: string | null;
  x: number;
  y: number;
}

export interface StoreDeviceTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  rotateX: number;
  rotateY: number;
}

export interface StoreImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
}

export interface StoreOverlay {
  src: string;
  name: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export interface StoreBackgroundImage {
  src: string;
  name: string;
}

export interface StoreSlide {
  id: string;
  src: string;
  name: string;
  headline: string;
  subhead: string;
  headlineColorOverride: string | null;
  subheadColorOverride: string | null;
  layoutOverride: StoreLayoutId | null;
  backgroundOverride: StoreBackground | null;
  backgroundImageOverride: StoreBackgroundImage | null;
  deviceStyleOverride: StoreDeviceStyle | null;
  secondaryDeviceStyleOverride: StoreDeviceStyle | null;
  duoLeftSlideId: string | null;
  duoRightSlideId: string | null;
  copyPosition: StoreCopyPosition;
  headingOffset: StoreTextOffset;
  subheadingOffset: StoreTextOffset;
  extraTexts: StoreExtraText[];
  image: StoreImageTransform;
  device: StoreDeviceTransform;
  secondaryDevice: StoreDeviceTransform;
  filters: StoreImageFilters;
  overlay: StoreOverlay | null;
}

export interface StoreProject {
  version: 1;
  templateId: StoreTemplateId;
  theme: StoreTheme;
  slides: StoreSlide[];
  selectedSlideId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface StoreTemplate {
  id: StoreTemplateId;
  name: string;
  description: string;
  sequence: StoreLayoutId[];
}

export interface StoreCompositionDevice {
  x: number;
  y: number;
  width: number;
  rotation: number;
  source: "primary" | "secondary";
}

export interface StoreComposition {
  copy: {
    position: "top" | "bottom" | "left" | "none";
    align: "left" | "center";
    x: number;
    y: number;
    width: number;
  };
  devices: StoreCompositionDevice[];
}
