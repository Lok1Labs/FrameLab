import type {
  StoreBackground,
  StoreOutputProfile,
  StoreTemplate,
  StoreTheme,
} from "./types";

export const STORE_PROJECT_VERSION = 1 as const;
export const MAX_STORE_SLIDES = 10;
export const STORE_SHORTCUT_HEIGHT = 32;
export const STORE_SHORTCUT_GAP = 12;
export const STORE_SHORTCUT_ROW_HEIGHT = STORE_SHORTCUT_HEIGHT + STORE_SHORTCUT_GAP;

export const STORE_OUTPUT_PROFILES: StoreOutputProfile[] = [
  {
    id: "app-store-iphone-6.9-portrait",
    platform: "app-store",
    name: "App Store · iPhone 6.9-inch",
    shortName: "App Store",
    width: 1320,
    height: 2868,
    minSlides: 1,
    maxSlides: MAX_STORE_SLIDES,
  },
];

export const STORE_TEMPLATES: StoreTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Clear benefit-led copy above a centered device.",
    sequence: ["classic"],
  },
  {
    id: "hero",
    name: "Hero",
    description: "A bold opener followed by clean supporting screens.",
    sequence: ["hero", "classic", "hero", "classic"],
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Alternating copy and devices create an easy reading rhythm.",
    sequence: ["editorial-left", "editorial-right", "classic", "editorial-left"],
  },
  {
    id: "offset",
    name: "Offset",
    description: "Asymmetric, energetic devices with generous copy space.",
    sequence: ["offset", "editorial-right", "offset", "classic"],
  },
  {
    id: "duo",
    name: "Duo",
    description: "Pairs adjacent product screens for richer feature stories.",
    sequence: ["duo", "classic", "duo", "hero"],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Large screen-first compositions with optional copy.",
    sequence: ["minimal"],
  },
];

export const STORE_BACKGROUND_PRESETS: Array<{
  name: string;
  value: StoreBackground;
}> = [
  { name: "Raycast", value: { from: "#090A0C", to: "#F43F5E", angle: 145 } },
  { name: "Midnight", value: { from: "#111827", to: "#312E81", angle: 155 } },
  { name: "Ocean", value: { from: "#0C4A6E", to: "#38BDF8", angle: 145 } },
  { name: "Mint", value: { from: "#D1FAE5", to: "#F8FAFC", angle: 160 } },
  { name: "Peach", value: { from: "#FED7AA", to: "#FFF7ED", angle: 155 } },
  { name: "Paper", value: { from: "#F8FAFC", to: "#E2E8F0", angle: 180 } },
  { name: "Graphite", value: { from: "#18181B", to: "#3F3F46", angle: 150 } },
  { name: "Berry", value: { from: "#831843", to: "#F472B6", angle: 145 } },
];

export const STORE_FONT_OPTIONS = [
  { name: "Inter", value: "var(--font-inter), system-ui, sans-serif" },
  { name: "Geist", value: "var(--font-geist-sans), system-ui, sans-serif" },
  { name: "DM Sans", value: "var(--font-dm-sans), system-ui, sans-serif" },
  { name: "Poppins", value: "var(--font-poppins), system-ui, sans-serif" },
  { name: "Manrope", value: "var(--font-manrope), system-ui, sans-serif" },
  { name: "Montserrat", value: "var(--font-montserrat), system-ui, sans-serif" },
  { name: "Plus Jakarta Sans", value: "var(--font-plus-jakarta-sans), system-ui, sans-serif" },
  { name: "Sora", value: "var(--font-sora), system-ui, sans-serif" },
  { name: "Outfit", value: "var(--font-outfit), system-ui, sans-serif" },
  { name: "Space Grotesk", value: "var(--font-space-grotesk), system-ui, sans-serif" },
  { name: "Work Sans", value: "var(--font-work-sans), system-ui, sans-serif" },
  { name: "Raleway", value: "var(--font-raleway), system-ui, sans-serif" },
  { name: "Lexend", value: "var(--font-lexend), system-ui, sans-serif" },
  { name: "Urbanist", value: "var(--font-urbanist), system-ui, sans-serif" },
  { name: "Playfair Display", value: "var(--font-playfair-display), Georgia, serif" },
  { name: "Lora", value: "var(--font-lora), Georgia, serif" },
  { name: "Oswald", value: "var(--font-oswald), Arial Narrow, sans-serif" },
  { name: "Bebas Neue", value: "var(--font-bebas-neue), Arial Narrow, sans-serif" },
] as const;

export const DEFAULT_STORE_THEME: StoreTheme = {
  background: STORE_BACKGROUND_PRESETS[0].value,
  headlineColor: "#FFFFFF",
  subheadColor: "#E4E4E7",
  fontFamily: STORE_FONT_OPTIONS[0].value,
  deviceStyle: "iphone",
  shadow: 60,
};

export function backgroundToCss(background: StoreBackground): string {
  if (background.from.toLowerCase() === background.to.toLowerCase()) {
    return background.from;
  }
  return `linear-gradient(${background.angle}deg, ${background.from} 0%, ${background.to} 100%)`;
}

export function getStoreProfile(platform: StoreOutputProfile["platform"]): StoreOutputProfile {
  return STORE_OUTPUT_PROFILES.find((profile) => profile.platform === platform)
    ?? STORE_OUTPUT_PROFILES[0];
}
