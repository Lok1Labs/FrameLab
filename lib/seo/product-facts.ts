import { CODE_THEME_SOURCES } from "@/components/code-image/code-themes-data";
import { FONTS as CODE_FONTS, LANGUAGES } from "@/components/code-image/code-themes";
import { ANIMATION_PRESETS } from "@/lib/animation/presets";
import { fontFamilies } from "@/lib/constants/fonts";
import { gradientColors } from "@/lib/constants/gradient-colors";
import { magicGradients, meshGradients } from "@/lib/constants/mesh-gradients";
import { MOCKUP_DEFINITIONS } from "@/lib/constants/mockups";
import { solidColors } from "@/lib/constants/solid-colors";

/** Single source of truth for every product count quoted in marketing copy, schema and llms.txt. */
export const PRODUCT_FACTS = {
  codeThemes: CODE_THEME_SOURCES.length,
  codeLanguages: LANGUAGES.filter((language) => language.id !== "auto").length,
  codeFonts: CODE_FONTS.length,
  fonts: fontFamilies.length,
  animationPresets: ANIMATION_PRESETS.length,
  deviceMockups: MOCKUP_DEFINITIONS.length,
  backgrounds:
    Object.keys(meshGradients).length +
    Object.keys(magicGradients).length +
    Object.keys(gradientColors).length +
    Object.keys(solidColors).length,
  maxExportScale: 5,
  license: "Apache 2.0",
} as const;

export const IMAGE_EXPORT_FORMATS = ["PNG", "JPEG", "WebP"] as const;
export const VIDEO_EXPORT_FORMATS = ["MP4", "WebM", "GIF"] as const;
export const BROWSER_MOCKUPS = ["Safari", "Chrome"] as const;
export const WINDOW_FRAMES = ["Arc", "macOS", "Windows"] as const;
export const IMAGE_FRAMES = ["Polaroid", "glass", "outline", "border"] as const;

export const EXPORT_FORMATS_SENTENCE =
  "PNG, JPEG, WebP, MP4, WebM, and GIF";

export const IMAGE_FORMATS_SENTENCE = "PNG, JPEG, and WebP";

export const VIDEO_FORMATS_SENTENCE = "MP4, WebM, and GIF";

export const FRAMES_SENTENCE =
  "Safari and Chrome browser mockups plus Arc, macOS, and Windows window frames, each in light and dark, and Polaroid, glass, outline, and border image frames";

/** Rounds down to the nearest 10 so "N+" claims stay true as the catalogue grows. */
export function atLeast(count: number): string {
  return `${Math.floor(count / 10) * 10}+`;
}
