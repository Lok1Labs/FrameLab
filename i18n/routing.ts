import { defineRouting } from "next-intl/routing";

export const locales = [
  "en",
  "es",
  "fr",
  "de",
  "ja",
  "pt",
  "ko",
  "zh",
  "ru",
] as const;

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Espanol",
  fr: "Francais",
  de: "Deutsch",
  ja: "Japanese",
  pt: "Portugues",
  ko: "Korean",
  zh: "Chinese",
  ru: "Русский",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeCookie: false,
  localeDetection: false,
});
