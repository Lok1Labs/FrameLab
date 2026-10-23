"use client";

import { useLocale } from "next-intl";

export function LanguageSwitch({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const russian = locale === "ru";

  const switchLanguage = () => {
    const current = window.location.pathname.replace(/^\/(?:en|es|fr|de|ja|pt|ko|zh|ru)(?=\/|$)/, "") || "/";
    const path = russian ? current : `/ru${current === "/" ? "" : current}`;
    window.location.assign(`${path}${window.location.search}${window.location.hash}`);
  };

  return (
    <button
      type="button"
      onClick={switchLanguage}
      aria-label={russian ? "Переключить на английский" : "Переключить на русский"}
      title={russian ? "Переключить на английский" : "Переключить на русский"}
      className={`inline-flex h-8 shrink-0 items-center justify-center rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${className}`}
    >
      {russian ? "EN" : "RU"}
    </button>
  );
}
