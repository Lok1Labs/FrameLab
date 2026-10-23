"use client";

import { useEffect } from "react";
import translations from "@/messages/ru-ui.json";

const dictionary = translations as Record<string, string>;
const attributes = ["placeholder", "title", "aria-label", "alt", "label"] as const;
const skipSelector = "script, style, noscript, svg, canvas, code, pre, textarea, [contenteditable], [data-no-translate]";
const localePrefix = /^\/(?:en|es|fr|de|ja|pt|ko|zh|ru)(?=\/|$)/;

function translate(value: string): string {
  const parts = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!parts) return value;
  const key = parts[2].replace(/\s+/g, " ").trim();
  let result: string | undefined = dictionary[key];
  if (result === key) result = undefined;
  if (!result && key.endsWith(" | FrameLab")) {
    const heading = key.slice(0, -" | FrameLab".length);
    if (dictionary[heading]) result = `${dictionary[heading]} | FrameLab`;
  }
  if (!result && dictionary[`${key} (2026)`]) {
    result = dictionary[`${key} (2026)`].replace(/\s*\(2026\s*г?\.?\)$/, "");
  }
  if (!result) {
    const conversion = key.match(/^(PNG|JPG|JPEG|WebP|AVIF) to (PNG|JPG|JPEG|WebP|AVIF)$/);
    if (conversion) result = `${conversion[1]} в ${conversion[2]}`;
  }
  if (!result && key === "Built & maintained by Lok1Labs. ©") {
    result = "Создано и поддерживается Lok1Labs. ©";
  }
  if (!result) {
    const date = key.match(/^(January|February|March|April|May|June|July|August|September|October|November|December) (\d{1,2}), (\d{4})$/);
    if (date) {
      const months: Record<string, string> = { January: "января", February: "февраля", March: "марта", April: "апреля", May: "мая", June: "июня", July: "июля", August: "августа", September: "сентября", October: "октября", November: "ноября", December: "декабря" };
      result = `${date[2]} ${months[date[1]]} ${date[3]} г.`;
    }
  }
  if (!result) {
    const counted = key.match(/^(.+?)\s*\((\d+)\)$/);
    if (counted && dictionary[counted[1]]) {
      result = `${dictionary[counted[1]]} (${counted[2]})`;
    }
  }
  if (!result) {
    const exportFormat = key.match(/^Export as (PNG|JPEG|JPG|WebP|AVIF)$/);
    if (exportFormat) result = `Экспортировать как ${exportFormat[1]}`;
  }
  return result ? `${parts[1]}${result}${parts[3]}` : value;
}

function localizeHref(anchor: HTMLAnchorElement) {
  const raw = anchor.getAttribute("href");
  if (!raw || raw.startsWith("#") || anchor.hasAttribute("download")) return;
  try {
    const url = new URL(raw, window.location.href);
    if (url.origin !== window.location.origin ||
        /^\/(?:api|_next|svc|ffmpeg)(?:\/|$)/.test(url.pathname) ||
        /\.[a-z0-9]{2,5}$/i.test(url.pathname)) return;
    const path = url.pathname.replace(localePrefix, "") || "/";
    const localized = `/ru${path === "/" ? "" : path}${url.search}${url.hash}`;
    if (anchor.getAttribute("href") !== localized) anchor.setAttribute("href", localized);
  } catch {
    // Ignore non-URL href values.
  }
}

function processText(node: Text) {
  const parent = node.parentElement;
  if (!parent || parent.closest(skipSelector)) return;
  const localized = translate(node.data);
  if (localized !== node.data) node.data = localized;
}

function processElement(element: Element) {
  if (element.matches(skipSelector)) return;
  if (element instanceof HTMLElement) {
    for (const attribute of attributes) {
      const value = element.getAttribute(attribute);
      if (value) {
        const localized = translate(value);
        if (localized !== value) element.setAttribute(attribute, localized);
      }
    }
    if (element instanceof HTMLInputElement && ["button", "submit", "reset"].includes(element.type)) {
      element.value = translate(element.value);
    }
  }
  if (element instanceof HTMLAnchorElement) localizeHref(element);
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const current = walker.currentNode;
    if (current.nodeType === Node.TEXT_NODE) processText(current as Text);
    else if (current instanceof HTMLElement && !current.closest(skipSelector)) {
      for (const attribute of attributes) {
        const value = current.getAttribute(attribute);
        if (value) {
          const localized = translate(value);
          if (localized !== value) current.setAttribute(attribute, localized);
        }
      }
      if (current instanceof HTMLAnchorElement) localizeHref(current);
    }
  }
}

/** Localizes legacy UI copy while the components are migrated to message keys. */
export function RussianUi() {
  useEffect(() => {
    let observer: MutationObserver | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onMutations = (records: MutationRecord[]) => {
      for (const record of records) {
        if (record.type === "characterData") processText(record.target as Text);
        else if (record.type === "attributes" && record.target instanceof Element) {
          processElement(record.target);
        } else {
          record.addedNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) processText(node as Text);
            else if (node instanceof Element) processElement(node);
          });
        }
      }
    };

    const preserveLocale = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      const anchor = target instanceof Element ? target.closest("a") : null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      localizeHref(anchor);
      const url = new URL(anchor.href);
      if (url.origin !== window.location.origin || !/^\/ru(?:\/|$)/.test(url.pathname)) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return;
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(url.href);
    };
    const initialize = () => {
      timer = setTimeout(() => {
        document.documentElement.lang = "ru";
        processElement(document.body);
        document.title = translate(document.title);
        observer = new MutationObserver(onMutations);
        observer.observe(document.documentElement, {
          subtree: true,
          childList: true,
          characterData: true,
          attributes: true,
          attributeFilter: [...attributes, "href", "value"],
        });
        document.addEventListener("click", preserveLocale, true);
      }, 500);
    };
    if (document.readyState === "complete") initialize();
    else window.addEventListener("load", initialize, { once: true });
    return () => {
      window.removeEventListener("load", initialize);
      if (timer) clearTimeout(timer);
      observer?.disconnect();
      document.removeEventListener("click", preserveLocale, true);
      document.documentElement.lang = "en";
    };
  }, []);
  return null;
}
