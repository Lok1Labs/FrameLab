"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Add01Icon,
  ArrowDown01Icon,
  Cancel01Icon,
  GridIcon,
  Image01Icon,
  Layers01Icon,
  PaintBoardIcon,
  Settings02Icon,
  TextIcon,
} from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { CachedImage } from "@/components/ui/cached-image";
import { SectionWrapper } from "@/components/editor/sections";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  STORE_BACKGROUND_PRESETS,
  STORE_FONT_OPTIONS,
} from "@/lib/store-screenshots/config";
import {
  BACKGROUND_CATEGORY_LABELS,
  BACKGROUND_CATEGORY_ORDER,
  backgroundCategories,
  getBackgroundThumbnailUrl,
  getBackgroundUrl,
} from "@/lib/r2-backgrounds";
import {
  assertStoreImageBudget,
  DEFAULT_IMAGE_TRANSFORM,
  fileToDataUrl,
  getStoreDeviceStyleOverride,
  getStoreDeviceTransform,
  storeDataUrlBytes,
  storeSlidesImageBytes,
  withStoreDeviceStyleOverride,
  withStoreDeviceTransform,
} from "@/lib/store-screenshots/project";
import { getStoreLayoutIds, resolveStoreLayout } from "@/lib/store-screenshots/layouts";
import type {
  StoreDeviceSlot,
  StoreDeviceStyle,
  StoreExtraText,
  StoreImageTransform,
  StoreProject,
  StoreSlide,
} from "@/lib/store-screenshots/types";
import { cn } from "@/lib/utils";
import { showStoreUndoToast } from "./store-undo-toast";

type GlobalTab = "layout" | "theme";
type SlideTab = "content" | "advanced";
type TextColorScope = "slide" | "all";
export type StoreTextFocusRequest = {
  field: "heading" | "subheading";
  id: number;
};

function Section({
  title,
  children,
  compact = false,
}: {
  title: string;
  children: React.ReactNode;
  compact?: boolean;
}): React.JSX.Element {
  return (
    <SectionWrapper
      title={title}
      defaultOpen
      className={cn(compact && "[&>div:first-child]:py-2 [&>div:last-child>div]:space-y-3 [&>div:last-child>div]:pb-2")}
    >
      {children}
    </SectionWrapper>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}): React.JSX.Element {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums text-foreground">{Math.round(value * 100) / 100}{suffix}</span>
      </div>
      <Slider aria-label={label} min={min} max={max} step={step} value={[value]} onValueChange={([next]) => onChange(next)} />
    </div>
  );
}

function ColorInput({
  label,
  ariaLabel,
  value,
  onChange,
}: {
  label: string;
  ariaLabel?: string;
  value: string;
  onChange: (value: string) => void;
}): React.JSX.Element {
  return (
    <label className="block space-y-2 text-xs text-muted-foreground">
      <span className="block">{label}</span>
      <span className="flex h-9 items-center gap-2 rounded-md border border-foreground/10 bg-foreground/[0.035] px-2">
        <input aria-label={ariaLabel ?? `${label} color`} type="color" value={value} onChange={(event) => onChange(event.target.value)} className="size-5 cursor-pointer rounded border-0 bg-transparent p-0" />
        <span className="font-mono text-[11px] uppercase text-foreground">{value}</span>
      </span>
    </label>
  );
}

function NumberInput({
  ariaLabel,
  value,
  min,
  max,
  step,
  onChange,
}: {
  ariaLabel: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}): React.JSX.Element {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [draft, setDraft] = React.useState(String(value));

  React.useEffect(() => {
    if (document.activeElement !== inputRef.current) setDraft(String(value));
  }, [value]);

  const commit = (): void => {
    const parsed = Number(draft);
    if (!draft.trim() || !Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }
    const next = Math.min(max, Math.max(min, parsed));
    setDraft(String(next));
    onChange(next);
  };

  return (
    <input
      ref={inputRef}
      aria-label={ariaLabel}
      type="number"
      inputMode="decimal"
      min={min}
      max={max}
      step={step}
      value={draft}
      onChange={(event) => {
        const nextDraft = event.target.value;
        const parsed = Number(nextDraft);
        if (nextDraft.trim() && Number.isFinite(parsed) && parsed > max) {
          setDraft(String(max));
          onChange(max);
          return;
        }
        setDraft(nextDraft);
        if (!nextDraft.trim()) return;
        if (Number.isFinite(parsed) && parsed >= min && parsed <= max) onChange(parsed);
      }}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") {
          setDraft(String(value));
          event.currentTarget.blur();
        }
      }}
      className="store-text-size-input h-9 w-full rounded-md border border-foreground/10 bg-foreground/[0.035] px-1 text-center text-xs tabular-nums text-foreground outline-none focus:border-foreground/25"
    />
  );
}

export function StoreGlobalPanel({
  project,
  onChange,
  onSlideChange,
  onOverview,
  onPreviewTemplates,
  onDeviceSelectionChange,
  deviceSlot,
  embedded = false,
}: {
  project: StoreProject;
  onChange: (project: StoreProject) => void;
  onSlideChange: (slideId: string, updates: Partial<StoreSlide>) => void;
  onOverview: () => void;
  onPreviewTemplates: () => void;
  onDeviceSelectionChange: (slot: StoreDeviceSlot) => void;
  deviceSlot?: StoreDeviceSlot | null;
  embedded?: boolean;
}): React.JSX.Element {
  const [tab, setTab] = React.useState<GlobalTab>("layout");
  const backgroundInputRef = React.useRef<HTMLInputElement>(null);
  const backgroundRequestIdsRef = React.useRef<Map<string, number>>(new Map());
  const projectRef = React.useRef(project);
  projectRef.current = project;
  const selectedSlide = project.slides.find((slide) => slide.id === project.selectedSlideId)
    ?? project.slides[0];
  const selectedSlideIndex = selectedSlide
    ? project.slides.findIndex((slide) => slide.id === selectedSlide.id)
    : -1;
  const selectedLayoutId = selectedSlide
    ? resolveStoreLayout(project.templateId, selectedSlideIndex, selectedSlide.layoutOverride)
    : null;
  const selectedDeviceSlot: StoreDeviceSlot = selectedLayoutId === "duo" && deviceSlot === "secondary"
    ? "secondary"
    : "primary";
  const selectedDevice = getStoreDeviceTransform(selectedSlide, selectedDeviceSlot);
  const selectedDeviceStyleOverride = getStoreDeviceStyleOverride(selectedSlide, selectedDeviceSlot);
  const selectedDeviceStyle = selectedDeviceStyleOverride ?? project.theme.deviceStyle;
  const placementLimit = selectedDeviceStyle === "screen-only" ? 100 : 25;
  const selectedBackground = selectedSlide?.backgroundOverride ?? project.theme.background;
  const updateTheme = (updates: Partial<StoreProject["theme"]>): void => {
    const current = projectRef.current;
    onChange({ ...current, theme: { ...current.theme, ...updates }, updatedAt: Date.now() });
  };
  const updateSelectedSlide = (
    updates: Partial<StoreSlide>,
    slideId = selectedSlide?.id,
  ): void => {
    if (!slideId) return;
    const current = projectRef.current;
    onChange({
      ...current,
      slides: current.slides.map((slide) => slide.id === slideId ? { ...slide, ...updates } : slide),
      updatedAt: Date.now(),
    });
  };
  const selectBackgroundPreset = (background: StoreProject["theme"]["background"]): void => {
    const current = projectRef.current;
    if (selectedSlide) {
      backgroundRequestIdsRef.current.set(
        selectedSlide.id,
        (backgroundRequestIdsRef.current.get(selectedSlide.id) ?? 0) + 1,
      );
    }
    onChange({
      ...current,
      slides: selectedSlide
        ? current.slides.map((slide) => slide.id === selectedSlide.id
          ? {
            ...slide,
            backgroundOverride: structuredClone(background),
            backgroundImageOverride: null,
          }
          : slide)
        : current.slides,
      updatedAt: Date.now(),
    });
  };
  const selectLibraryBackground = (imagePath: string): void => {
    if (!selectedSlide) return;
    backgroundRequestIdsRef.current.set(
      selectedSlide.id,
      (backgroundRequestIdsRef.current.get(selectedSlide.id) ?? 0) + 1,
    );
    updateSelectedSlide({
      backgroundImageOverride: {
        src: getBackgroundUrl(imagePath),
        name: imagePath.split("/").pop() ?? "Background image",
      },
    });
  };

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col overflow-hidden bg-background",
        embedded ? "w-full" : "w-[260px] border-r border-foreground/10",
      )}
    >
      <div className="shrink-0 space-y-3 border-b border-foreground/10 p-3">
        <SegmentedControl
          size="sm"
          value={tab}
          onChange={(value) => setTab(value as GlobalTab)}
          options={[
            { id: "layout", icon: <Layers01Icon size={14} />, ariaLabel: "Layout" },
            { id: "theme", icon: <PaintBoardIcon size={14} />, ariaLabel: "Theme" },
          ]}
        />
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="min-w-0 px-2 text-xs" onClick={onOverview}>
            <GridIcon size={14} /> Screenshots
          </Button>
          <Button variant="outline" size="sm" className="min-w-0 px-2 text-xs" onClick={onPreviewTemplates}>
            <Layers01Icon size={14} /> Templates
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-hide">
        {tab === "layout" ? (
          <div className="space-y-4">
            <Section title="Slide layout">
              <div className="grid grid-cols-2 gap-1.5">
                {getStoreLayoutIds().map((layoutId) => {
                  const selected = selectedLayoutId === layoutId;

                  return (
                    <button
                      key={layoutId}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        updateSelectedSlide({ layoutOverride: layoutId });
                        onDeviceSelectionChange("primary");
                      }}
                      className={cn(
                        "min-h-12 rounded-md border px-2 text-xs capitalize",
                        selected
                          ? "border-foreground/30 bg-foreground/[0.08] text-foreground"
                          : "border-foreground/10 text-muted-foreground hover:bg-foreground/[0.04]",
                      )}
                    >
                      {layoutId.replace("-", " ")}
                    </button>
                  );
                })}
              </div>
            </Section>
            {selectedSlide && selectedLayoutId !== "no-mockup" ? (
              <>
                <Section title="Presentation">
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">Show as</span>
                    <SegmentedControl
                      size="sm"
                      value={selectedDeviceStyle}
                      onChange={(value) => updateSelectedSlide(withStoreDeviceStyleOverride(
                        selectedSlide,
                        selectedDeviceSlot,
                        value as StoreDeviceStyle,
                      ))}
                      options={[
                        { id: "iphone", label: "iPhone" },
                        { id: "screen-only", label: "Image" },
                      ]}
                    />
                  </div>
                </Section>
                <Section title="Device placement">
                  {selectedLayoutId === "duo" ? (
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground">Mockup</span>
                      <SegmentedControl
                        size="sm"
                        value={selectedDeviceSlot}
                        onChange={(value) => onDeviceSelectionChange(value as StoreDeviceSlot)}
                        options={[
                          { id: "primary", label: "Left" },
                          { id: "secondary", label: "Right" },
                        ]}
                      />
                    </div>
                  ) : null}
                  <RangeControl label="Size" value={selectedDevice.scale} min={0.65} max={1.35} step={0.01} suffix="×" onChange={(scale) => updateSelectedSlide(withStoreDeviceTransform(selectedSlide, selectedDeviceSlot, { ...selectedDevice, scale }))} />
                  <RangeControl label="Horizontal" value={selectedDevice.offsetX} min={-placementLimit} max={placementLimit} suffix="%" onChange={(offsetX) => updateSelectedSlide(withStoreDeviceTransform(selectedSlide, selectedDeviceSlot, { ...selectedDevice, offsetX }))} />
                  <RangeControl label="Vertical" value={selectedDevice.offsetY} min={-placementLimit} max={placementLimit} suffix="%" onChange={(offsetY) => updateSelectedSlide(withStoreDeviceTransform(selectedSlide, selectedDeviceSlot, { ...selectedDevice, offsetY }))} />
                  <RangeControl label="Rotation" value={selectedDevice.rotation} min={-25} max={25} suffix="°" onChange={(rotation) => updateSelectedSlide(withStoreDeviceTransform(selectedSlide, selectedDeviceSlot, { ...selectedDevice, rotation }))} />
                </Section>
              </>
            ) : null}
          </div>
        ) : null}

        {tab === "theme" ? (
          <div className="space-y-6">
            <Section title="Backgrounds">
              <div className="grid grid-cols-4 gap-2">
                {STORE_BACKGROUND_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    title={preset.name}
                    aria-label={preset.name}
                    onClick={() => selectBackgroundPreset(preset.value)}
                    className="aspect-square rounded-md border border-foreground/10 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
                    style={{ background: `linear-gradient(${preset.value.angle}deg, ${preset.value.from}, ${preset.value.to})` }}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ColorInput
                  label="From"
                  value={selectedBackground.from}
                  onChange={(from) => updateSelectedSlide({
                    backgroundOverride: { ...selectedBackground, from },
                  })}
                />
                <ColorInput
                  label="To"
                  value={selectedBackground.to}
                  onChange={(to) => updateSelectedSlide({
                    backgroundOverride: { ...selectedBackground, to },
                  })}
                />
              </div>
              <RangeControl
                label="Gradient angle"
                value={selectedBackground.angle}
                min={0}
                max={360}
                suffix="°"
                onChange={(angle) => updateSelectedSlide({
                  backgroundOverride: { ...selectedBackground, angle },
                })}
              />
              {selectedSlide ? (
                <div className="space-y-4 border-t border-foreground/10 pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-foreground">Custom background</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">Upload an image for this slide.</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 text-[11px]"
                      onClick={() => backgroundInputRef.current?.click()}
                    >
                      <Image01Icon size={13} />
                      {selectedSlide.backgroundImageOverride ? "Replace" : "Customize"}
                    </Button>
                  </div>
                  <input
                    ref={backgroundInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    aria-label="Upload custom slide background"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        const slideId = selectedSlide.id;
                        const requestId = (backgroundRequestIdsRef.current.get(slideId) ?? 0) + 1;
                        backgroundRequestIdsRef.current.set(slideId, requestId);
                        void (async () => {
                          try {
                            assertStoreImageBudget(
                              storeSlidesImageBytes(project.slides),
                              file.size,
                              selectedSlide.backgroundImageOverride
                                ? storeDataUrlBytes(selectedSlide.backgroundImageOverride.src)
                                : 0,
                            );
                            const src = await fileToDataUrl(file);
                            if (backgroundRequestIdsRef.current.get(slideId) !== requestId) return;
                            onSlideChange(slideId, {
                              backgroundImageOverride: { src, name: file.name },
                            });
                          } catch (cause) {
                            if (backgroundRequestIdsRef.current.get(slideId) !== requestId) return;
                            toast.error("Could not use that background", {
                              description: cause instanceof Error ? cause.message : "Please try a different image file.",
                            });
                          }
                        })();
                      }
                      event.currentTarget.value = "";
                    }}
                  />
                  {selectedSlide.backgroundImageOverride ? (
                    <div className="flex items-center gap-2 rounded-md border border-foreground/10 bg-foreground/[0.035] p-2">
                      <img
                        src={selectedSlide.backgroundImageOverride.src}
                        alt=""
                        className="size-9 shrink-0 rounded object-cover"
                      />
                      <span className="min-w-0 flex-1 truncate text-[11px] text-foreground">
                        {selectedSlide.backgroundImageOverride.name}
                      </span>
                      <button
                        type="button"
                        aria-label="Remove custom slide background"
                        title="Remove custom background"
                        onClick={() => {
                          const deletedBackground = selectedSlide.backgroundImageOverride;
                          backgroundRequestIdsRef.current.set(
                            selectedSlide.id,
                            (backgroundRequestIdsRef.current.get(selectedSlide.id) ?? 0) + 1,
                          );
                          updateSelectedSlide({ backgroundImageOverride: null });
                          showStoreUndoToast("Background removed", () => {
                            onSlideChange(selectedSlide.id, {
                              backgroundImageOverride: deletedBackground,
                            });
                          });
                        }}
                        className="flex size-8 shrink-0 items-center justify-center rounded-md text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
                      >
                        <Cancel01Icon size={13} />
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </Section>

            {BACKGROUND_CATEGORY_ORDER.map((category) => (
              <Section
                key={category}
                title={BACKGROUND_CATEGORY_LABELS[category] ?? category}
                compact
              >
                <div className="grid grid-cols-4 gap-2">
                  {(backgroundCategories[category] ?? []).map((imagePath, index) => {
                    const imageUrl = getBackgroundUrl(imagePath);
                    const selected = selectedSlide?.backgroundImageOverride?.src === imageUrl;
                    return (
                      <button
                        key={imagePath}
                        type="button"
                        title={`${BACKGROUND_CATEGORY_LABELS[category] ?? category} ${index + 1}`}
                        aria-label={`Use ${BACKGROUND_CATEGORY_LABELS[category] ?? category} background ${index + 1}`}
                        aria-pressed={selected}
                        onClick={() => selectLibraryBackground(imagePath)}
                        className={cn(
                          "relative aspect-square cursor-pointer overflow-hidden rounded-md border transition-[border-color,transform,box-shadow] hover:scale-105",
                          selected
                            ? "border-foreground/40 ring-1 ring-foreground/25"
                            : "border-foreground/10 hover:border-foreground/25",
                        )}
                      >
                        <CachedImage
                          src={getBackgroundThumbnailUrl(imagePath)}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </Section>
            ))}

            <Section title="Depth">
              <RangeControl label="Shadow" value={project.theme.shadow} min={0} max={100} suffix="%" onChange={(shadow) => updateTheme({ shadow })} />
            </Section>
          </div>
        ) : null}

      </div>
    </aside>
  );
}

export function StoreSlidePanel({
  slide,
  screenSlide,
  screenLabel,
  usesDeviceFrame,
  slides,
  isDuo,
  theme,
  onChange,
  onThemeChange,
  onApplyTextColorToAll,
  onReplace,
  onCropRequest,
  textFocusRequest,
  embedded = false,
}: {
  slide: StoreSlide | null;
  screenSlide: StoreSlide | null;
  screenLabel: string;
  usesDeviceFrame: boolean;
  slides: StoreSlide[];
  isDuo: boolean;
  theme: StoreProject["theme"];
  onChange: (slideId: string, updates: Partial<StoreSlide>) => void;
  onThemeChange: (updates: Partial<StoreProject["theme"]>) => void;
  onApplyTextColorToAll: (key: "headlineColor" | "subheadColor", value: string) => void;
  onReplace: (slideId: string, file: File) => void;
  onCropRequest: (sourceSlideId: string, original: StoreImageTransform) => void;
  textFocusRequest?: StoreTextFocusRequest | null;
  embedded?: boolean;
}): React.JSX.Element {
  const [tab, setTab] = React.useState<SlideTab>("content");
  const [textColorScope, setTextColorScope] = React.useState<TextColorScope>("slide");
  const overlayInputRef = React.useRef<HTMLInputElement>(null);
  const overlayRequestIdsRef = React.useRef<Map<string, number>>(new Map());
  const replaceInputRef = React.useRef<HTMLInputElement>(null);
  const headingInputRef = React.useRef<HTMLTextAreaElement>(null);
  const subheadingInputRef = React.useRef<HTMLTextAreaElement>(null);
  const slideRef = React.useRef(slide);

  React.useEffect(() => {
    slideRef.current = slide;
  }, [slide]);

  React.useEffect(() => {
    if (!textFocusRequest) return;
    setTab("content");
    const frame = window.requestAnimationFrame(() => {
      const input = textFocusRequest.field === "heading"
        ? headingInputRef.current
        : subheadingInputRef.current;
      if (!input || input.offsetParent === null) return;
      input.focus({ preventScroll: true });
      input.setSelectionRange(input.value.length, input.value.length);
      input.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [textFocusRequest]);

  if (!slide || !screenSlide) {
    return (
      <aside
        className={cn(
          "h-full shrink-0 items-center justify-center bg-background px-8 text-center text-xs text-muted-foreground",
          embedded ? "flex w-full" : "hidden w-[292px] border-l border-foreground/10 xl:flex",
        )}
      >
        Select a screenshot to customize it.
      </aside>
    );
  }

  const update = (updates: Partial<StoreSlide>): void => onChange(slide.id, updates);
  const extraTexts = slide.extraTexts ?? [];
  const updateExtraText = (id: string, updates: Partial<StoreExtraText>): void => {
    update({
      extraTexts: extraTexts.map((text) => text.id === id ? { ...text, ...updates } : text),
    });
  };
  const addExtraText = (): void => {
    if (extraTexts.length >= 6) return;
    const index = extraTexts.length;
    update({
      extraTexts: [
        ...extraTexts,
        {
          id: crypto.randomUUID(),
          text: "Add another message",
          kind: "subheading",
          fontSize: 3.25,
          bold: false,
          italic: false,
          color: null,
          x: 50,
          y: Math.min(84, 42 + index * 9),
        },
      ],
    });
  };
  const currentIndex = slides.findIndex((candidate) => candidate.id === slide.id);
  const fallbackRightSlide = slides[(currentIndex + 1) % slides.length] ?? slide;
  const leftSlideId = slides.some((candidate) => candidate.id === slide.duoLeftSlideId)
    ? slide.duoLeftSlideId!
    : slide.id;
  const rightSlideId = slides.some((candidate) => candidate.id === slide.duoRightSlideId)
    ? slide.duoRightSlideId!
    : fallbackRightSlide.id;
  const imageMode = screenSlide.image.mode ?? "fill";
  const imageFramingChanged = imageMode !== "fill"
    || screenSlide.image.scale !== 1
    || screenSlide.image.offsetX !== 0
    || screenSlide.image.offsetY !== 0;
  const screenImageLabel = isDuo ? `${screenLabel.toLowerCase()} image` : "image";

  return (
    <aside
      className={cn(
        "h-full shrink-0 flex-col overflow-hidden bg-background",
        embedded ? "flex w-full" : "hidden w-[292px] border-l border-foreground/10 xl:flex",
      )}
    >
      <div className="shrink-0 border-b border-foreground/10 p-3">
        <SegmentedControl
          size="sm"
          value={tab}
          onChange={(value) => setTab(value as SlideTab)}
          options={[
            { id: "content", icon: <TextIcon size={14} />, ariaLabel: "Content" },
            { id: "advanced", icon: <Settings02Icon size={14} />, ariaLabel: "Advanced" },
          ]}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2 scrollbar-hide">
        {tab === "content" ? (
          <div className="space-y-1">
            <Section title="Copy" compact>
              <div className="space-y-2 rounded-md border border-foreground/10 bg-foreground/[0.025] p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-medium text-muted-foreground">Heading</span>
                  {slide.headline ? (
                    <button
                      type="button"
                      aria-label="Delete heading"
                      title="Delete heading"
                      onClick={() => {
                        const deletedHeading = slide.headline;
                        update({ headline: "" });
                        showStoreUndoToast("Heading deleted", () => {
                          onChange(slide.id, { headline: deletedHeading });
                        });
                      }}
                      className="flex size-8 items-center justify-center rounded text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
                    >
                      <Cancel01Icon size={12} />
                    </button>
                  ) : null}
                </div>
                <textarea
                  ref={headingInputRef}
                  aria-label="Heading"
                  rows={2}
                  value={slide.headline}
                  placeholder="Add a heading"
                  maxLength={80}
                  onChange={(event) => update({ headline: event.target.value })}
                  className="w-full resize-none rounded-md border border-foreground/10 bg-foreground/[0.035] p-2 text-xs leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-foreground/25"
                />
              </div>
              <div className="space-y-2 rounded-md border border-foreground/10 bg-foreground/[0.025] p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-medium text-muted-foreground">Subheading</span>
                  {slide.subhead ? (
                    <button
                      type="button"
                      aria-label="Delete subheading"
                      title="Delete subheading"
                      onClick={() => {
                        const deletedSubheading = slide.subhead;
                        update({ subhead: "" });
                        showStoreUndoToast("Subheading deleted", () => {
                          onChange(slide.id, { subhead: deletedSubheading });
                        });
                      }}
                      className="flex size-8 items-center justify-center rounded text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
                    >
                      <Cancel01Icon size={12} />
                    </button>
                  ) : null}
                </div>
                <textarea
                  ref={subheadingInputRef}
                  aria-label="Subheading"
                  rows={2}
                  value={slide.subhead}
                  placeholder="Add a subheading"
                  maxLength={140}
                  onChange={(event) => update({ subhead: event.target.value })}
                  className="w-full resize-none rounded-md border border-foreground/10 bg-foreground/[0.035] p-2 text-xs leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-foreground/25"
                />
              </div>
              {extraTexts.map((text, index) => {
                const kind = text.kind ?? "subheading";
                const fontSize = Number.isFinite(text.fontSize)
                  ? text.fontSize
                  : kind === "heading" ? 5.5 : 3.25;
                return (
                  <div
                    key={text.id}
                    className="space-y-2 rounded-md border border-foreground/10 bg-foreground/[0.025] p-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-medium text-muted-foreground">Text {index + 1}</span>
                      <button
                        type="button"
                        aria-label={`Remove text block ${index + 1}`}
                        title="Remove text"
                        onClick={() => {
                          update({ extraTexts: extraTexts.filter((item) => item.id !== text.id) });
                          showStoreUndoToast("Text block removed", () => {
                            const currentSlide = slideRef.current;
                            if (!currentSlide || currentSlide.id !== slide.id) return;
                            const currentTexts = currentSlide.extraTexts ?? [];
                            if (currentTexts.some((item) => item.id === text.id)) return;
                            const restoredTexts = [...currentTexts];
                            restoredTexts.splice(Math.min(index, restoredTexts.length), 0, text);
                            onChange(slide.id, { extraTexts: restoredTexts });
                          });
                        }}
                        className="flex size-8 items-center justify-center rounded text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
                      >
                        <Cancel01Icon size={12} />
                      </button>
                    </div>
                    <textarea
                      aria-label={`Text block ${index + 1}`}
                      rows={2}
                      value={text.text}
                      maxLength={140}
                      onChange={(event) => updateExtraText(text.id, { text: event.target.value })}
                      className="w-full resize-none rounded-md border border-foreground/10 bg-foreground/[0.035] p-2 text-xs leading-relaxed text-foreground outline-none focus:border-foreground/25"
                    />
                    <ColorInput
                      label="Color"
                      ariaLabel={`Text block ${index + 1} color`}
                      value={text.color ?? (kind === "heading"
                        ? slide.headlineColorOverride ?? theme.headlineColor
                        : slide.subheadColorOverride ?? theme.subheadColor)}
                      onChange={(color) => updateExtraText(text.id, { color })}
                    />
                    <div className="grid grid-cols-[minmax(0,1fr)_32px_32px_50px] gap-1 px-0.5 text-[9px] text-muted-foreground">
                      <span>Style</span>
                      <span className="text-center">Bold</span>
                      <span className="text-center">Italic</span>
                      <span>Size</span>
                    </div>
                    <div className="grid grid-cols-[minmax(0,1fr)_32px_32px_50px] gap-1">
                      <span className="relative min-w-0">
                        <select
                          aria-label={`Text block ${index + 1} style`}
                          value={kind}
                          onChange={(event) => updateExtraText(text.id, {
                            kind: event.target.value as StoreExtraText["kind"],
                            fontSize: event.target.value === "heading" && kind !== "heading"
                              ? 5.5
                              : event.target.value === "subheading" && kind !== "subheading"
                                ? 3.25
                                : fontSize,
                          })}
                          className="h-9 w-full appearance-none rounded-md border border-foreground/10 bg-foreground/[0.035] pl-2 pr-6 text-xs leading-normal text-foreground outline-none focus:border-foreground/25"
                        >
                          <option value="heading">Heading</option>
                          <option value="subheading">Subheading</option>
                        </select>
                        <ArrowDown01Icon aria-hidden="true" size={11} className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      </span>
                      <button
                        type="button"
                        aria-label={`Bold text block ${index + 1}`}
                        aria-pressed={text.bold ?? false}
                        title="Bold"
                        onClick={() => updateExtraText(text.id, { bold: !(text.bold ?? false) })}
                        className={cn(
                          "flex h-9 items-center justify-center rounded-md border text-xs font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-foreground/30",
                          text.bold
                            ? "border-foreground/30 bg-foreground/[0.1] text-foreground"
                            : "border-foreground/10 bg-foreground/[0.035] text-muted-foreground hover:text-foreground",
                        )}
                      >
                        B
                      </button>
                      <button
                        type="button"
                        aria-label={`Italic text block ${index + 1}`}
                        aria-pressed={text.italic ?? false}
                        title="Italic"
                        onClick={() => updateExtraText(text.id, { italic: !(text.italic ?? false) })}
                        className={cn(
                          "flex h-9 items-center justify-center rounded-md border text-xs italic outline-none transition-colors focus-visible:ring-2 focus-visible:ring-foreground/30",
                          text.italic
                            ? "border-foreground/30 bg-foreground/[0.1] text-foreground"
                            : "border-foreground/10 bg-foreground/[0.035] text-muted-foreground hover:text-foreground",
                        )}
                      >
                        I
                      </button>
                      <label className="relative block">
                        <span className="sr-only">Text block {index + 1} font size</span>
                        <NumberInput
                          ariaLabel={`Text block ${index + 1} font size`}
                          value={fontSize}
                          min={2}
                          max={20}
                          step={0.25}
                          onChange={(fontSize) => updateExtraText(text.id, { fontSize })}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center justify-between gap-3 border-t border-foreground/10 pt-3">
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  Drag any text directly on the canvas.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={extraTexts.length >= 6}
                  onClick={addExtraText}
                  className="h-8 shrink-0 px-2.5 text-[11px]"
                >
                  <Add01Icon size={13} /> Add text
                </Button>
              </div>
            </Section>
            <Section title="Typography" compact>
              <div className="space-y-5">
                <label className="block space-y-2 text-xs text-muted-foreground">
                  <span className="block">Font</span>
                  <span className="relative block">
                    <select
                      value={theme.fontFamily}
                      onChange={(event) => onThemeChange({ fontFamily: event.target.value })}
                      className="h-9 w-full appearance-none rounded-md border border-foreground/10 bg-foreground/[0.035] py-0 pl-2 pr-8 text-xs text-foreground outline-none focus:border-foreground/25"
                    >
                      {STORE_FONT_OPTIONS.map((font) => <option key={font.name} value={font.value}>{font.name}</option>)}
                    </select>
                    <ArrowDown01Icon aria-hidden="true" size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </span>
                </label>
                <div className="flex h-9 items-center justify-between gap-3 rounded-md border border-foreground/10 bg-foreground/[0.025] px-2.5">
                  <label htmlFor="store-text-color-scope" className="cursor-pointer text-[10px] font-medium text-muted-foreground">
                    Apply to all screenshots
                  </label>
                  <Switch
                    id="store-text-color-scope"
                    checked={textColorScope === "all"}
                    onCheckedChange={(checked) => setTextColorScope(checked ? "all" : "slide")}
                    aria-label="Apply text colors to all screenshots"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <ColorInput
                    label="Heading"
                    value={textColorScope === "slide"
                      ? slide.headlineColorOverride ?? theme.headlineColor
                      : theme.headlineColor}
                    onChange={(headlineColor) => textColorScope === "slide"
                      ? update({ headlineColorOverride: headlineColor })
                      : onApplyTextColorToAll("headlineColor", headlineColor)}
                  />
                  <ColorInput
                    label="Subheading"
                    value={textColorScope === "slide"
                      ? slide.subheadColorOverride ?? theme.subheadColor
                      : theme.subheadColor}
                    onChange={(subheadColor) => textColorScope === "slide"
                      ? update({ subheadColorOverride: subheadColor })
                      : onApplyTextColorToAll("subheadColor", subheadColor)}
                  />
                </div>
              </div>
            </Section>
            <Section title={isDuo ? `${screenLabel} image` : "Screenshot"} compact>
              {isDuo ? (
                <div className="grid grid-cols-2 gap-2">
                    <label className="flex min-w-0 items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="shrink-0">Left</span>
                      <span className="relative min-w-0 flex-1">
                        <select
                          aria-label="Left device image"
                          value={leftSlideId}
                          onChange={(event) => update({ duoLeftSlideId: event.target.value })}
                          className="h-8 w-full appearance-none rounded-md border border-foreground/10 bg-foreground/[0.035] py-0 pl-1.5 pr-6 text-[10px] text-foreground outline-none focus:border-foreground/25"
                        >
                          {slides.map((candidate, index) => (
                            <option key={candidate.id} value={candidate.id}>{index + 1} · {candidate.name}</option>
                          ))}
                        </select>
                        <ArrowDown01Icon aria-hidden="true" size={12} className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      </span>
                    </label>
                    <label className="flex min-w-0 items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="shrink-0">Right</span>
                      <span className="relative min-w-0 flex-1">
                        <select
                          aria-label="Right device image"
                          value={rightSlideId}
                          onChange={(event) => update({ duoRightSlideId: event.target.value })}
                          className="h-8 w-full appearance-none rounded-md border border-foreground/10 bg-foreground/[0.035] py-0 pl-1.5 pr-6 text-[10px] text-foreground outline-none focus:border-foreground/25"
                        >
                          {slides.map((candidate, index) => (
                            <option key={candidate.id} value={candidate.id}>{index + 1} · {candidate.name}</option>
                          ))}
                        </select>
                        <ArrowDown01Icon aria-hidden="true" size={12} className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      </span>
                    </label>
                </div>
              ) : null}
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => replaceInputRef.current?.click()}>
                <Image01Icon size={14} /> {screenSlide.src ? `Replace ${screenImageLabel}` : `Upload ${screenImageLabel}`}
              </Button>
              <input
                ref={replaceInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onReplace(screenSlide.id, file);
                  event.currentTarget.value = "";
                }}
              />
              {screenSlide.src && usesDeviceFrame ? (
                <>
                  <div className="flex items-center justify-between gap-3 border-t border-foreground/10 pt-3">
                    <span className="text-[10px] font-medium text-muted-foreground">Image framing</span>
                    <button
                      type="button"
                      disabled={!imageFramingChanged}
                      onClick={() => onChange(screenSlide.id, { image: { ...DEFAULT_IMAGE_TRANSFORM } })}
                      className="rounded px-1.5 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
                    >
                      Reset
                    </button>
                  </div>
                  <SegmentedControl
                    size="sm"
                    value={imageMode}
                    onChange={(value) => {
                      const mode = value as StoreSlide["image"]["mode"];
                      if (mode === "custom") onCropRequest(screenSlide.id, screenSlide.image);
                      onChange(screenSlide.id, { image: { ...screenSlide.image, mode } });
                    }}
                    options={[
                      { id: "fill", label: "Fill" },
                      { id: "fit", label: "Fit" },
                      { id: "custom", label: "Crop" },
                    ]}
                  />
                  <p className="px-0.5 text-[10px] leading-relaxed text-muted-foreground">
                    {imageMode === "fill"
                      ? "Fills the screen edge to edge. Some image edges may be cropped."
                      : imageMode === "fit"
                        ? "Shows the complete image at its original aspect ratio."
                        : "Drag and zoom directly on the canvas to frame the screen."}
                  </p>
                  {imageMode === "custom" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => onCropRequest(screenSlide.id, screenSlide.image)}
                    >
                      Edit crop on canvas
                    </Button>
                  ) : null}
                </>
              ) : null}
            </Section>
          </div>
        ) : null}

        {tab === "advanced" ? (
          <div className="space-y-1">
            <Section title="Image adjustments" compact>
              <RangeControl label="Brightness" value={screenSlide.filters.brightness} min={50} max={150} suffix="%" onChange={(brightness) => onChange(screenSlide.id, { filters: { ...screenSlide.filters, brightness } })} />
              <RangeControl label="Contrast" value={screenSlide.filters.contrast} min={50} max={150} suffix="%" onChange={(contrast) => onChange(screenSlide.id, { filters: { ...screenSlide.filters, contrast } })} />
              <RangeControl label="Saturation" value={screenSlide.filters.saturation} min={0} max={180} suffix="%" onChange={(saturation) => onChange(screenSlide.id, { filters: { ...screenSlide.filters, saturation } })} />
            </Section>
            <Section title="3D perspective" compact>
              <RangeControl label="Tilt X" value={slide.device.rotateX} min={-25} max={25} suffix="°" onChange={(rotateX) => update({ device: { ...slide.device, rotateX } })} />
              <RangeControl label="Tilt Y" value={slide.device.rotateY} min={-25} max={25} suffix="°" onChange={(rotateY) => update({ device: { ...slide.device, rotateY } })} />
            </Section>
            <Section title="Image overlay" compact>
              {slide.overlay ? (
                <>
                  <div className="flex items-center gap-2 rounded-md border border-foreground/10 bg-foreground/[0.035] p-2">
                    <img src={slide.overlay.src} alt="" className="size-9 rounded object-cover" />
                    <span className="min-w-0 flex-1 truncate text-xs text-foreground">{slide.overlay.name}</span>
                    <button
                      type="button"
                      aria-label="Remove overlay"
                      onClick={() => {
                        const deletedOverlay = slide.overlay;
                        overlayRequestIdsRef.current.set(
                          slide.id,
                          (overlayRequestIdsRef.current.get(slide.id) ?? 0) + 1,
                        );
                        update({ overlay: null });
                        showStoreUndoToast("Overlay removed", () => {
                          onChange(slide.id, { overlay: deletedOverlay });
                        });
                      }}
                      className="flex size-8 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
                    >
                      <Cancel01Icon size={14} />
                    </button>
                  </div>
                  <RangeControl label="Size" value={slide.overlay.size} min={8} max={70} suffix="%" onChange={(size) => update({ overlay: { ...slide.overlay!, size } })} />
                  <RangeControl label="Horizontal" value={slide.overlay.x} min={0} max={100} suffix="%" onChange={(x) => update({ overlay: { ...slide.overlay!, x } })} />
                  <RangeControl label="Vertical" value={slide.overlay.y} min={0} max={100} suffix="%" onChange={(y) => update({ overlay: { ...slide.overlay!, y } })} />
                  <RangeControl label="Opacity" value={slide.overlay.opacity * 100} min={10} max={100} suffix="%" onChange={(opacity) => update({ overlay: { ...slide.overlay!, opacity: opacity / 100 } })} />
                </>
              ) : (
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => overlayInputRef.current?.click()}>
                  <Image01Icon size={14} /> Add overlay image
                </Button>
              )}
              <input
                ref={overlayInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const slideId = slide.id;
                  const requestId = (overlayRequestIdsRef.current.get(slideId) ?? 0) + 1;
                  overlayRequestIdsRef.current.set(slideId, requestId);
                  void (async () => {
                    try {
                      assertStoreImageBudget(
                        storeSlidesImageBytes(slides),
                        file.size,
                        slide.overlay ? storeDataUrlBytes(slide.overlay.src) : 0,
                      );
                      const src = await fileToDataUrl(file);
                      if (overlayRequestIdsRef.current.get(slideId) !== requestId) return;
                      update({ overlay: { src, name: file.name, x: 75, y: 20, size: 24, opacity: 1 } });
                    } catch (cause) {
                      if (overlayRequestIdsRef.current.get(slideId) !== requestId) return;
                      toast.error("Could not add that overlay", {
                        description: cause instanceof Error ? cause.message : "Please try a different image file.",
                      });
                    }
                  })();
                  event.currentTarget.value = "";
                }}
              />
            </Section>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
