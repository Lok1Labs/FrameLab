"use client";

import * as React from "react";
import { CropGridOverlay, DeviceShell } from "@/components/mockups/DeviceShell";
import { getMockupDefinition } from "@/lib/constants/mockups";
import { backgroundToCss } from "@/lib/store-screenshots/config";
import { composeStoreSlide, resolveStoreLayout } from "@/lib/store-screenshots/layouts";
import {
  getStoreDeviceStyleOverride,
  getStoreDeviceTransform,
  withStoreDeviceTransform,
} from "@/lib/store-screenshots/project";
import type {
  StoreDeviceSlot,
  StoreDeviceStyle,
  StoreDeviceTransform,
  StoreImageTransform,
  StoreOutputProfile,
  StoreProject,
  StoreSlide,
  StoreTextOffset,
} from "@/lib/store-screenshots/types";
import type { DeviceScreenContent, MockupDefinition } from "@/types/mockup";
import { cn } from "@/lib/utils";

const FALLBACK_PHONE: MockupDefinition = {
  id: "store-phone",
  name: "Phone",
  family: "phone",
  finish: "dark",
  perspective: "front",
  aspectRatio: 0.5,
};

type TextDragTarget =
  | { kind: "heading" | "subheading"; origin: StoreTextOffset }
  | { kind: "extra"; id: string; origin: StoreTextOffset };

interface TextDragState {
  pointerId: number;
  startX: number;
  startY: number;
  target: TextDragTarget;
}

type DeviceInteractionKind = "move" | "resize" | "rotate";

interface DeviceInteractionState {
  pointerId: number;
  kind: DeviceInteractionKind;
  slot: StoreDeviceSlot;
  startX: number;
  startY: number;
  centerX: number;
  centerY: number;
  startDistance: number;
  startAngle: number;
  movementLimit: number;
  origin: StoreDeviceTransform;
}

interface ScreenCropSession {
  slot: StoreDeviceSlot;
  sourceSlideId: string;
  original: StoreImageTransform;
}

interface ScreenCropDragState {
  pointerId: number;
  startX: number;
  startY: number;
  origin: StoreImageTransform;
}

export interface StoreCropRequest {
  id: number;
  sourceSlideId: string;
  original: StoreImageTransform;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const imageAspectRatioCache = new Map<string, number>();

function useImageAspectRatio(src: string, fallback: number): number {
  const [aspectRatio, setAspectRatio] = React.useState(
    () => imageAspectRatioCache.get(src) ?? fallback,
  );

  React.useEffect(() => {
    if (!src) return;
    const cached = imageAspectRatioCache.get(src);
    if (cached) {
      setAspectRatio(cached);
      return;
    }

    setAspectRatio(fallback);
    const image = new window.Image();
    let cancelled = false;
    image.onload = () => {
      if (cancelled || image.naturalWidth <= 0 || image.naturalHeight <= 0) return;
      const nextAspectRatio = clamp(image.naturalWidth / image.naturalHeight, 0.2, 5);
      imageAspectRatioCache.set(src, nextAspectRatio);
      setAspectRatio(nextAspectRatio);
    };
    image.src = src;

    return () => {
      cancelled = true;
      image.onload = null;
    };
  }, [fallback, src]);

  return aspectRatio;
}

function resolveDeviceDefinition(
  style: StoreDeviceStyle,
): MockupDefinition | null {
  if (style === "screen-only") return null;
  return getMockupDefinition("iphone-17-pro-front") ?? FALLBACK_PHONE;
}

function screenContent(slide: StoreSlide): DeviceScreenContent {
  const mode = slide.image.mode ?? "fill";
  const custom = mode === "custom";
  return {
    src: slide.src,
    name: slide.name,
    fit: mode === "fill" ? "cover" : "contain",
    scale: custom ? slide.image.scale : 1,
    offset: custom
      ? { x: slide.image.offsetX, y: slide.image.offsetY }
      : { x: 0, y: 0 },
    isCustom: true,
  };
}

function ScreenOnly({
  slide,
  interactive = false,
  onFile,
}: {
  slide: StoreSlide;
  interactive?: boolean;
  onFile?: (file: File) => void;
}): React.JSX.Element {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const content = screenContent(slide);

  if (!slide.src && interactive) {
    return (
      <div
        className="pointer-events-auto relative h-full w-full overflow-hidden rounded-[2cqw] border border-dashed border-foreground/25 bg-background/55 shadow-sm backdrop-blur-sm"
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
          event.dataTransfer.dropEffect = "copy";
        }}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const file = Array.from(event.dataTransfer.files).find((item) => item.type.startsWith("image/"));
          if (file) onFile?.(file);
        }}
      >
        <button
          type="button"
          aria-label="Upload a new screen image"
          onClick={() => inputRef.current?.click()}
          className="flex h-full w-full flex-col items-center justify-center gap-[2cqw] px-[8%] text-center text-foreground/65 transition-colors hover:bg-foreground/[0.04] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/30"
        >
          <span className="flex size-[8cqw] min-h-8 min-w-8 items-center justify-center rounded-full border border-foreground/15 bg-background shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <span className="text-[clamp(9px,2.2cqw,14px)] font-medium leading-tight">Upload screen image</span>
          <span className="text-[clamp(7px,1.5cqw,11px)] leading-tight text-muted-foreground">Click or drop an image here</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFile?.(file);
            event.currentTarget.value = "";
          }}
        />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {slide.src ? (
        <img
          src={slide.src}
          alt=""
          draggable={false}
          className="block h-full w-full select-none"
          style={{
            objectFit: content.fit,
            transform: `translate(${content.offset.x}%, ${content.offset.y}%) scale(${content.scale})`,
            transformOrigin: "center",
          }}
        />
      ) : null}
    </div>
  );
}

function StoreDevice({
  slide,
  style,
  interactive = false,
  cropping = false,
  onScreenFile,
  onScreenPointerDown,
  onScreenPointerMove,
  onScreenPointerUp,
  onScreenPointerCancel,
  onScreenKeyDown,
}: {
  slide: StoreSlide;
  style: StoreDeviceStyle;
  interactive?: boolean;
  cropping?: boolean;
  onScreenFile?: (file: File) => void;
  onScreenPointerDown?: React.PointerEventHandler<HTMLDivElement>;
  onScreenPointerMove?: React.PointerEventHandler<HTMLDivElement>;
  onScreenPointerUp?: React.PointerEventHandler<HTMLDivElement>;
  onScreenPointerCancel?: React.PointerEventHandler<HTMLDivElement>;
  onScreenKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
}): React.JSX.Element {
  const definition = resolveDeviceDefinition(style);
  if (!definition) return <ScreenOnly slide={slide} interactive={interactive} onFile={onScreenFile} />;
  return (
    <DeviceShell
      definition={definition}
      screen={screenContent(slide)}
      editing={cropping}
      onScreenFile={interactive ? onScreenFile : undefined}
      onScreenPointerDown={cropping ? onScreenPointerDown : undefined}
      onScreenPointerMove={cropping ? onScreenPointerMove : undefined}
      onScreenPointerUp={cropping ? onScreenPointerUp : undefined}
      onScreenPointerCancel={cropping ? onScreenPointerCancel : undefined}
      onScreenKeyDown={cropping ? onScreenKeyDown : undefined}
    />
  );
}

export const StoreSlideCanvas = React.memo(function StoreSlideCanvas({
  project,
  slide,
  slideIndex,
  profile,
  className,
  style,
  exportMode = false,
  interactive = false,
  onSlideChange,
  onDeviceSelect,
  selectedDeviceSlot,
  onScreenFile,
  onScreenDelete,
  onScreenImageChange,
  cropRequest,
  onTextEditRequest,
}: {
  project: StoreProject;
  slide: StoreSlide;
  slideIndex: number;
  profile: StoreOutputProfile;
  className?: string;
  style?: React.CSSProperties;
  exportMode?: boolean;
  interactive?: boolean;
  onSlideChange?: (slide: StoreSlide) => void;
  onDeviceSelect?: (slot: StoreDeviceSlot | null) => void;
  selectedDeviceSlot?: StoreDeviceSlot | null;
  onScreenFile?: (sourceSlideId: string, file: File) => void;
  onScreenDelete?: (sourceSlideId: string) => void;
  onScreenImageChange?: (sourceSlideId: string, image: StoreImageTransform) => void;
  cropRequest?: StoreCropRequest | null;
  onTextEditRequest?: (field: "heading" | "subheading") => void;
}): React.JSX.Element {
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<TextDragState | null>(null);
  const textPointerMovedRef = React.useRef(false);
  const deviceInteractionRef = React.useRef<DeviceInteractionState | null>(null);
  const screenCropDragRef = React.useRef<ScreenCropDragState | null>(null);
  const handledCropRequestRef = React.useRef(0);
  const [screenCropSession, setScreenCropSession] = React.useState<ScreenCropSession | null>(null);
  const layoutId = resolveStoreLayout(project.templateId, slideIndex, slide.layoutOverride);
  const composition = composeStoreSlide(layoutId);
  const defaultDeviceStyle = project.theme.deviceStyle;
  const defaultSecondarySlide = project.slides[(slideIndex + 1) % project.slides.length] ?? slide;
  const primarySlide = layoutId === "duo"
    ? project.slides.find((candidate) => candidate.id === slide.duoLeftSlideId) ?? slide
    : slide;
  const secondarySlide = layoutId === "duo"
    ? project.slides.find((candidate) => candidate.id === slide.duoRightSlideId) ?? defaultSecondarySlide
    : defaultSecondarySlide;
  const isMinimal = composition.copy.position === "none";
  const copyOffsetX = slide.copyPosition?.offsetX ?? 0;
  const copyOffsetY = slide.copyPosition?.offsetY ?? 0;
  const headingOffset = slide.headingOffset ?? { x: 0, y: 0 };
  const subheadingOffset = slide.subheadingOffset ?? { x: 0, y: 0 };
  const extraTexts = slide.extraTexts ?? [];
  const headlineColor = slide.headlineColorOverride ?? project.theme.headlineColor;
  const subheadingColor = slide.subheadColorOverride ?? project.theme.subheadColor;
  const fallbackScreenAspect = profile.width / profile.height;
  const primaryImageAspect = useImageAspectRatio(primarySlide.src, fallbackScreenAspect);
  const secondaryImageAspect = useImageAspectRatio(secondarySlide.src, fallbackScreenAspect);

  React.useEffect(() => {
    if (!screenCropSession) return;
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") return;
      onScreenImageChange?.(screenCropSession.sourceSlideId, screenCropSession.original);
      setScreenCropSession(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onScreenImageChange, screenCropSession]);

  React.useEffect(() => {
    if (!cropRequest || handledCropRequestRef.current === cropRequest.id) return;
    const slot = primarySlide.id === cropRequest.sourceSlideId
      ? "primary"
      : secondarySlide.id === cropRequest.sourceSlideId ? "secondary" : null;
    if (!slot) return;
    handledCropRequestRef.current = cropRequest.id;
    onDeviceSelect?.(slot);
    setScreenCropSession({
      slot,
      sourceSlideId: cropRequest.sourceSlideId,
      original: cropRequest.original,
    });
  }, [cropRequest, onDeviceSelect, primarySlide.id, secondarySlide.id]);

  const beginTextDrag = (
    event: React.PointerEvent<HTMLElement>,
    target: TextDragTarget,
  ): void => {
    if (!interactive || !onSlideChange || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    onDeviceSelect?.(null);
    textPointerMovedRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      target,
    };
  };

  const selectDevice = (slot: StoreDeviceSlot): void => {
    onDeviceSelect?.(slot);
  };

  const startScreenCrop = (
    event: React.MouseEvent<HTMLButtonElement>,
    slot: StoreDeviceSlot,
    source: StoreSlide,
  ): void => {
    event.preventDefault();
    event.stopPropagation();
    if (!onScreenImageChange) return;
    selectDevice(slot);
    setScreenCropSession({ slot, sourceSlideId: source.id, original: source.image });
    if (source.image.mode !== "custom") {
      onScreenImageChange(source.id, {
        ...source.image,
        mode: "custom",
        scale: Math.max(1, source.image.scale),
        offsetX: 0,
        offsetY: 0,
      });
    }
  };

  const beginScreenCropDrag = (
    event: React.PointerEvent<HTMLElement>,
    image: StoreImageTransform,
  ): void => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    screenCropDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: image,
    };
  };

  const moveScreenCropDrag = (
    event: React.PointerEvent<HTMLElement>,
    sourceSlideId: string,
  ): void => {
    const drag = screenCropDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !onScreenImageChange) return;
    event.preventDefault();
    event.stopPropagation();
    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width === 0 || bounds.height === 0) return;
    onScreenImageChange(sourceSlideId, {
      ...drag.origin,
      mode: "custom",
      offsetX: clamp(drag.origin.offsetX + ((event.clientX - drag.startX) / bounds.width) * 100, -100, 100),
      offsetY: clamp(drag.origin.offsetY + ((event.clientY - drag.startY) / bounds.height) * 100, -100, 100),
    });
  };

  const endScreenCropDrag = (event: React.PointerEvent<HTMLElement>): void => {
    if (screenCropDragRef.current?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    screenCropDragRef.current = null;
  };

  const moveScreenCropWithKeyboard = (
    event: React.KeyboardEvent<HTMLElement>,
    source: StoreSlide,
  ): void => {
    if (!onScreenImageChange) return;
    if (event.key === "Escape" && screenCropSession?.sourceSlideId === source.id) {
      event.preventDefault();
      onScreenImageChange(source.id, screenCropSession.original);
      setScreenCropSession(null);
      return;
    }
    const amount = event.shiftKey ? 5 : 1;
    const deltaX = event.key === "ArrowLeft" ? -amount : event.key === "ArrowRight" ? amount : 0;
    const deltaY = event.key === "ArrowUp" ? -amount : event.key === "ArrowDown" ? amount : 0;
    if (deltaX === 0 && deltaY === 0) return;
    event.preventDefault();
    onScreenImageChange(source.id, {
      ...source.image,
      mode: "custom",
      offsetX: clamp(source.image.offsetX + deltaX, -100, 100),
      offsetY: clamp(source.image.offsetY + deltaY, -100, 100),
    });
  };

  const beginDeviceInteraction = (
    event: React.PointerEvent<HTMLElement>,
    kind: DeviceInteractionKind,
    slot: StoreDeviceSlot,
    transform: StoreDeviceTransform,
    movementLimit: number,
  ): void => {
    if (!interactive || !onSlideChange || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    selectDevice(slot);

    const object = event.currentTarget.closest<HTMLElement>("[data-store-device-object]");
    const bounds = object?.getBoundingClientRect();
    const centerX = bounds ? bounds.left + bounds.width / 2 : event.clientX;
    const centerY = bounds ? bounds.top + bounds.height / 2 : event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
    deviceInteractionRef.current = {
      pointerId: event.pointerId,
      kind,
      slot,
      startX: event.clientX,
      startY: event.clientY,
      centerX,
      centerY,
      startDistance: Math.max(1, Math.hypot(event.clientX - centerX, event.clientY - centerY)),
      startAngle: Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI),
      movementLimit,
      origin: transform,
    };
  };

  const moveDeviceInteraction = (event: React.PointerEvent<HTMLElement>): void => {
    const interaction = deviceInteractionRef.current;
    const canvas = canvasRef.current;
    if (!interaction || interaction.pointerId !== event.pointerId || !canvas || !onSlideChange) return;
    event.preventDefault();
    event.stopPropagation();

    let nextDevice = interaction.origin;
    if (interaction.kind === "move") {
      const bounds = canvas.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return;
      let offsetX = interaction.origin.offsetX
        + ((event.clientX - interaction.startX) / bounds.width) * 100;
      let offsetY = interaction.origin.offsetY
        + ((event.clientY - interaction.startY) / bounds.height) * 100;
      if (Math.abs(offsetX) < 1) offsetX = 0;
      if (Math.abs(offsetY) < 1) offsetY = 0;
      nextDevice = {
        ...interaction.origin,
        offsetX: clamp(offsetX, -interaction.movementLimit, interaction.movementLimit),
        offsetY: clamp(offsetY, -interaction.movementLimit, interaction.movementLimit),
      };
    } else if (interaction.kind === "resize") {
      const distance = Math.max(1, Math.hypot(
        event.clientX - interaction.centerX,
        event.clientY - interaction.centerY,
      ));
      nextDevice = {
        ...interaction.origin,
        scale: Math.round(clamp(
          interaction.origin.scale * (distance / interaction.startDistance),
          0.65,
          1.35,
        ) * 100) / 100,
      };
    } else {
      const angle = Math.atan2(
        event.clientY - interaction.centerY,
        event.clientX - interaction.centerX,
      ) * (180 / Math.PI);
      nextDevice = {
        ...interaction.origin,
        rotation: Math.round(clamp(
          interaction.origin.rotation + angle - interaction.startAngle,
          -25,
          25,
        )),
      };
    }

    onSlideChange(withStoreDeviceTransform(slide, interaction.slot, nextDevice));
  };

  const endDeviceInteraction = (event: React.PointerEvent<HTMLElement>): void => {
    if (deviceInteractionRef.current?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    deviceInteractionRef.current = null;
  };

  const moveDeviceWithKeyboard = (
    event: React.KeyboardEvent<HTMLElement>,
    slot: StoreDeviceSlot,
    transform: StoreDeviceTransform,
    movementLimit: number,
  ): void => {
    if (!interactive || !onSlideChange) return;
    const amount = event.shiftKey ? 2 : 0.5;
    const deltaX = event.key === "ArrowLeft" ? -amount : event.key === "ArrowRight" ? amount : 0;
    const deltaY = event.key === "ArrowUp" ? -amount : event.key === "ArrowDown" ? amount : 0;
    if (deltaX === 0 && deltaY === 0) return;
    event.preventDefault();
    selectDevice(slot);
    onSlideChange(withStoreDeviceTransform(slide, slot, {
      ...transform,
      offsetX: clamp(transform.offsetX + deltaX, -movementLimit, movementLimit),
      offsetY: clamp(transform.offsetY + deltaY, -movementLimit, movementLimit),
    }));
  };

  const resizeDeviceWithKeyboard = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    slot: StoreDeviceSlot,
    transform: StoreDeviceTransform,
  ): void => {
    const direction = ["ArrowUp", "ArrowRight", "+", "="].includes(event.key)
      ? 1
      : ["ArrowDown", "ArrowLeft", "-", "_"].includes(event.key) ? -1 : 0;
    if (!direction || !interactive || !onSlideChange) return;
    event.preventDefault();
    event.stopPropagation();
    selectDevice(slot);
    onSlideChange(withStoreDeviceTransform(slide, slot, {
      ...transform,
      scale: Math.round(clamp(transform.scale + direction * 0.05, 0.65, 1.35) * 100) / 100,
    }));
  };

  const rotateDeviceWithKeyboard = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    slot: StoreDeviceSlot,
    transform: StoreDeviceTransform,
  ): void => {
    const direction = event.key === "ArrowRight" || event.key === "ArrowUp"
      ? 1
      : event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : 0;
    if (!direction || !interactive || !onSlideChange) return;
    event.preventDefault();
    event.stopPropagation();
    selectDevice(slot);
    onSlideChange(withStoreDeviceTransform(slide, slot, {
      ...transform,
      rotation: clamp(transform.rotation + direction * (event.shiftKey ? 5 : 1), -25, 25),
    }));
  };

  const moveDraggedText = (event: React.PointerEvent<HTMLElement>): void => {
    const drag = dragRef.current;
    const canvas = canvasRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !canvas || !onSlideChange) return;
    event.preventDefault();
    event.stopPropagation();
    const bounds = canvas.getBoundingClientRect();
    if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 3) {
      textPointerMovedRef.current = true;
    }
    const deltaX = ((event.clientX - drag.startX) / bounds.width) * 100;
    const deltaY = ((event.clientY - drag.startY) / bounds.height) * 100;

    if (drag.target.kind !== "extra") {
      const next = {
        x: clamp(drag.target.origin.x + deltaX, -60, 60),
        y: clamp(drag.target.origin.y + deltaY, -30, 80),
      };
      onSlideChange({
        ...slide,
        [drag.target.kind === "heading" ? "headingOffset" : "subheadingOffset"]: next,
      });
      return;
    }

    const extraTextId = drag.target.id;
    onSlideChange({
      ...slide,
      extraTexts: extraTexts.map((text) => text.id === extraTextId
        ? {
            ...text,
            x: clamp(drag.target.origin.x + deltaX, 3, 97),
            y: clamp(drag.target.origin.y + deltaY, 2, 98),
          }
        : text),
    });
  };

  const endTextDrag = (event: React.PointerEvent<HTMLElement>): void => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  };

  const editTextOnClick = (field: "heading" | "subheading"): void => {
    if (textPointerMovedRef.current) {
      textPointerMovedRef.current = false;
      return;
    }
    onTextEditRequest?.(field);
  };

  const moveTextWithKeyboard = (
    event: React.KeyboardEvent<HTMLElement>,
    target: "heading" | "subheading" | { id: string },
  ): void => {
    if (!interactive || !onSlideChange) return;
    const amount = event.shiftKey ? 2 : 0.5;
    const delta = {
      x: event.key === "ArrowLeft" ? -amount : event.key === "ArrowRight" ? amount : 0,
      y: event.key === "ArrowUp" ? -amount : event.key === "ArrowDown" ? amount : 0,
    };
    if (delta.x === 0 && delta.y === 0) return;
    event.preventDefault();

    if (typeof target === "string") {
      const current = target === "heading" ? headingOffset : subheadingOffset;
      onSlideChange({
        ...slide,
        [target === "heading" ? "headingOffset" : "subheadingOffset"]: {
          x: clamp(current.x + delta.x, -60, 60),
          y: clamp(current.y + delta.y, -30, 80),
        },
      });
      return;
    }

    onSlideChange({
      ...slide,
      extraTexts: extraTexts.map((text) => text.id === target.id
        ? {
            ...text,
            x: clamp(text.x + delta.x, 3, 97),
            y: clamp(text.y + delta.y, 2, 98),
          }
        : text),
    });
  };

  const interactiveTextClass = cn(
    "relative whitespace-pre-wrap",
    interactive
      ? "pointer-events-auto touch-none cursor-grab select-none rounded-[0.6cqw] outline outline-1 outline-transparent transition-[outline-color,background-color] hover:bg-[var(--canvas-selection)]/10 hover:outline-[var(--canvas-control-surface)]/30 focus-visible:bg-[var(--canvas-selection)]/10 focus-visible:outline-[var(--canvas-control-surface)]/60 active:cursor-grabbing"
      : "pointer-events-none",
  );

  return (
    <div
      ref={canvasRef}
      data-store-slide-canvas="true"
      data-export-mode={exportMode ? "true" : undefined}
      className={cn(
        "relative isolate overflow-hidden bg-background [container-type:size]",
        className,
      )}
      onPointerDown={interactive ? (event) => {
        const target = event.target as Element;
        if (!target.closest("[data-store-device-object]")) onDeviceSelect?.(null);
      } : undefined}
      style={{
        ...style,
        aspectRatio: `${profile.width} / ${profile.height}`,
        background: backgroundToCss(slide.backgroundOverride ?? project.theme.background),
        fontFamily: project.theme.fontFamily,
      }}
    >
      {slide.backgroundImageOverride ? (
        <img
          data-store-background-image="true"
          src={slide.backgroundImageOverride.src}
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
        />
      ) : null}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(circle at 18% 8%, rgba(255,255,255,0.18), transparent 34%), radial-gradient(circle at 86% 92%, rgba(255,255,255,0.08), transparent 32%)",
        }}
      />

      {!isMinimal ? (
        <div
          data-store-copy="true"
          className="pointer-events-none absolute z-20 flex flex-col gap-[1.6cqw]"
          style={{
            left: `${composition.copy.x + copyOffsetX}%`,
            top: `${composition.copy.y + copyOffsetY}%`,
            width: `${composition.copy.width}%`,
            transform: composition.copy.align === "center" ? "translateX(-50%)" : undefined,
            textAlign: composition.copy.align,
            alignItems: composition.copy.align === "center" ? "center" : "flex-start",
          }}
        >
          {slide.headline ? (
            <div
              data-store-text-role="heading"
              role={interactive ? "button" : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-label={interactive ? "Move heading" : undefined}
              title={interactive ? "Click to edit; drag to reposition heading" : undefined}
              onPointerDown={(event) => beginTextDrag(event, { kind: "heading", origin: headingOffset })}
              onPointerMove={moveDraggedText}
              onPointerUp={endTextDrag}
              onPointerCancel={endTextDrag}
              onClick={() => editTextOnClick("heading")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onTextEditRequest?.("heading");
                  return;
                }
                moveTextWithKeyboard(event, "heading");
              }}
              className={cn(interactiveTextClass, "whitespace-pre-line text-balance font-semibold tracking-[-0.04em]")}
              style={{
                color: headlineColor,
                fontSize: profile.platform === "app-store" ? "7.3cqw" : "6.5cqw",
                lineHeight: 1.03,
                transform: `translate(${headingOffset.x}cqw, ${headingOffset.y}cqh)`,
              }}
            >
              <span data-no-translate>{slide.headline}</span>
            </div>
          ) : null}
          {slide.subhead ? (
            <div
              data-store-text-role="subheading"
              role={interactive ? "button" : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-label={interactive ? "Move subheading" : undefined}
              title={interactive ? "Click to edit; drag to reposition subheading" : undefined}
              onPointerDown={(event) => beginTextDrag(event, { kind: "subheading", origin: subheadingOffset })}
              onPointerMove={moveDraggedText}
              onPointerUp={endTextDrag}
              onPointerCancel={endTextDrag}
              onClick={() => editTextOnClick("subheading")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onTextEditRequest?.("subheading");
                  return;
                }
                moveTextWithKeyboard(event, "subheading");
              }}
              className={cn(interactiveTextClass, "text-pretty font-medium tracking-[-0.015em]")}
              style={{
                color: subheadingColor,
                fontSize: profile.platform === "app-store" ? "3.25cqw" : "2.9cqw",
                lineHeight: 1.3,
                maxWidth: composition.copy.align === "center" ? "92%" : "100%",
                transform: `translate(${subheadingOffset.x}cqw, ${subheadingOffset.y}cqh)`,
              }}
            >
              <span data-no-translate>{slide.subhead}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {extraTexts.map((text, index) => {
        const kind = text.kind ?? "subheading";
        const fontSize = Number.isFinite(text.fontSize)
          ? text.fontSize
          : kind === "heading" ? 5.5 : 3.25;
        return (
          <div
            key={text.id}
            data-store-extra-text={text.id}
            data-store-text-role={kind}
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? `Move text block ${index + 1}` : undefined}
            title={interactive ? "Drag to reposition text" : undefined}
            onPointerDown={(event) => beginTextDrag(event, {
              kind: "extra",
              id: text.id,
              origin: { x: text.x, y: text.y },
            })}
            onPointerMove={moveDraggedText}
            onPointerUp={endTextDrag}
            onPointerCancel={endTextDrag}
            onKeyDown={(event) => moveTextWithKeyboard(event, { id: text.id })}
            className={cn(
              "absolute z-20 w-[84%] -translate-x-1/2 -translate-y-1/2 text-center tracking-[-0.02em]",
              interactiveTextClass,
            )}
            style={{
              left: `${text.x}%`,
              top: `${text.y}%`,
              color: text.color ?? (kind === "heading" ? headlineColor : subheadingColor),
              fontSize: `${clamp(fontSize, 2, 20)}cqw`,
              fontWeight: text.bold ? 700 : kind === "heading" ? 600 : 500,
              fontStyle: text.italic ? "italic" : "normal",
              lineHeight: kind === "heading" ? 1.05 : 1.3,
            }}
          >
            <span data-no-translate>{text.text}</span>
          </div>
        );
      })}

      {composition.devices.map((device, index) => {
        const source = device.source === "secondary" ? secondarySlide : primarySlide;
        const slot = device.source;
        const transform = getStoreDeviceTransform(slide, slot);
        const styleOverride = getStoreDeviceStyleOverride(slide, slot);
        const resolvedDeviceStyle = styleOverride ?? defaultDeviceStyle;
        const definition = resolveDeviceDefinition(resolvedDeviceStyle);
        const imageAspect = slot === "secondary" ? secondaryImageAspect : primaryImageAspect;
        const baseAspect = definition?.aspectRatio ?? imageAspect;
        const adjustedWidth = device.width * transform.scale;
        const movementLimit = resolvedDeviceStyle === "screen-only" ? 100 : 25;
        const deviceKey = `${slide.id}-${device.source}-${index}`;
        const emptyScreen = !definition && !source.src;
        const selected = interactive && selectedDeviceSlot === slot && !emptyScreen;
        const cropping = screenCropSession?.slot === slot
          && screenCropSession.sourceSlideId === source.id;
        const objectLabel = layoutId === "duo"
          ? `${device.source === "primary" ? "left" : "right"} ${definition ? "device" : "screen"}`
          : definition ? "device" : "screen";
        return (
          <div
            key={deviceKey}
            data-store-device-object={deviceKey}
            className="pointer-events-none absolute z-10"
            style={{
              left: `${device.x + transform.offsetX}%`,
              top: `${device.y + transform.offsetY}%`,
              width: `${adjustedWidth}%`,
              aspectRatio: String(baseAspect),
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className={cn(
                "relative h-full w-full",
                selected && "outline outline-[1.5px] outline-[var(--canvas-selection)] outline-offset-[3px]",
              )}
              style={{
                transform: `perspective(1200px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) rotateZ(${device.rotation + transform.rotation}deg)`,
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className="h-full w-full"
                style={{
                  filter: [
                    `brightness(${source.filters.brightness}%) contrast(${source.filters.contrast}%) saturate(${source.filters.saturation}%)`,
                    project.theme.shadow > 0
                      ? `drop-shadow(0 ${1.1 + project.theme.shadow / 55}cqw ${1.4 + project.theme.shadow / 20}cqw rgba(0,0,0,${0.16 + project.theme.shadow / 250}))`
                      : "",
                  ].filter(Boolean).join(" "),
                }}
              >
                <StoreDevice
                  slide={source}
                  style={resolvedDeviceStyle}
                  interactive={interactive}
                  cropping={cropping}
                  onScreenFile={(file) => onScreenFile?.(source.id, file)}
                  onScreenPointerDown={(event) => beginScreenCropDrag(event, source.image)}
                  onScreenPointerMove={(event) => moveScreenCropDrag(event, source.id)}
                  onScreenPointerUp={endScreenCropDrag}
                  onScreenPointerCancel={endScreenCropDrag}
                  onScreenKeyDown={(event) => moveScreenCropWithKeyboard(event, source)}
                />
              </div>

              {interactive && !emptyScreen && !cropping ? (
                <button
                  type="button"
                  data-store-device-control="move"
                  aria-label={`Move ${objectLabel}`}
                  title={`Click to select ${objectLabel}; drag to move`}
                  onFocus={() => selectDevice(slot)}
                  onDragOver={(event) => {
                    if (!event.dataTransfer.types.includes("Files")) return;
                    event.preventDefault();
                    event.stopPropagation();
                    event.dataTransfer.dropEffect = "copy";
                  }}
                  onDrop={(event) => {
                    const file = Array.from(event.dataTransfer.files).find((item) => item.type.startsWith("image/"));
                    if (!file) return;
                    event.preventDefault();
                    event.stopPropagation();
                    onScreenFile?.(source.id, file);
                  }}
                  onPointerDown={(event) => beginDeviceInteraction(event, "move", slot, transform, movementLimit)}
                  onPointerMove={moveDeviceInteraction}
                  onPointerUp={endDeviceInteraction}
                  onPointerCancel={endDeviceInteraction}
                  onKeyDown={(event) => moveDeviceWithKeyboard(event, slot, transform, movementLimit)}
                  className="pointer-events-auto absolute inset-0 z-20 cursor-grab touch-none select-none bg-transparent focus-visible:outline-none active:cursor-grabbing"
                />
              ) : null}

              {selected && cropping ? (
                <>
                  {!definition ? (
                    <div
                      data-store-device-control="crop-image"
                      role="group"
                      tabIndex={0}
                      aria-label={`Reposition ${objectLabel} crop`}
                      aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight Escape"
                      title="Drag to reposition the image inside the crop"
                      onPointerDown={(event) => beginScreenCropDrag(event, source.image)}
                      onPointerMove={(event) => moveScreenCropDrag(event, source.id)}
                      onPointerUp={endScreenCropDrag}
                      onPointerCancel={endScreenCropDrag}
                      onKeyDown={(event) => moveScreenCropWithKeyboard(event, source)}
                      className="pointer-events-auto absolute inset-0 z-30 cursor-move touch-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background"
                    >
                      <CropGridOverlay />
                    </div>
                  ) : null}
                  <div className={cn(
                    "pointer-events-auto absolute left-1/2 z-40 flex h-10 -translate-x-1/2 items-center gap-0.5 rounded-full border border-foreground/15 bg-background/95 p-1 text-foreground shadow-lg backdrop-blur-sm",
                    definition ? "top-2" : "-top-14",
                  )}>
                    <button
                      type="button"
                      aria-label="Zoom image out"
                      title="Zoom out"
                      onClick={() => onScreenImageChange?.(source.id, {
                        ...source.image,
                        mode: "custom",
                        scale: Math.round(clamp(source.image.scale - 0.1, 0.25, 4) * 100) / 100,
                      })}
                      className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/[0.07] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
                    >
                      <span aria-hidden="true">−</span>
                    </button>
                    <span className="min-w-9 text-center text-[10px] tabular-nums text-muted-foreground">
                      {Math.round(source.image.scale * 100)}%
                    </span>
                    <button
                      type="button"
                      aria-label="Zoom image in"
                      title="Zoom in"
                      onClick={() => onScreenImageChange?.(source.id, {
                        ...source.image,
                        mode: "custom",
                        scale: Math.round(clamp(source.image.scale + 0.1, 0.25, 4) * 100) / 100,
                      })}
                      className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/[0.07] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
                    >
                      <span aria-hidden="true">+</span>
                    </button>
                    <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-foreground/10" />
                    <button
                      type="button"
                      onClick={() => {
                        onScreenImageChange?.(source.id, screenCropSession.original);
                        setScreenCropSession(null);
                      }}
                      className="min-h-8 rounded-full px-2.5 py-1 text-[10px] font-medium text-muted-foreground hover:bg-foreground/[0.07] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setScreenCropSession(null)}
                      className="min-h-8 rounded-full bg-foreground px-2.5 py-1 text-[10px] font-medium text-background hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
                    >
                      Done
                    </button>
                  </div>
                </>
              ) : null}

              {selected && !cropping ? (
                <>
                  {(["top-left", "top-right", "bottom-left", "bottom-right"] as const).map((handle) => (
                    <button
                      key={handle}
                      type="button"
                      data-store-device-control="resize"
                      aria-label={`Resize ${objectLabel} from ${handle.replace("-", " ")}`}
                      title={`Resize ${objectLabel}`}
                      onPointerDown={(event) => beginDeviceInteraction(event, "resize", slot, transform, movementLimit)}
                      onPointerMove={moveDeviceInteraction}
                      onPointerUp={endDeviceInteraction}
                      onPointerCancel={endDeviceInteraction}
                      onKeyDown={(event) => resizeDeviceWithKeyboard(event, slot, transform)}
                      className={cn(
                        "pointer-events-auto absolute z-30 size-3 rounded-[2px] border-2 border-[var(--canvas-selection)] bg-[var(--canvas-control-surface)] shadow-sm before:absolute before:-inset-3.5 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--canvas-selection)]",
                        handle.includes("top") ? "-top-1.5" : "-bottom-1.5",
                        handle.includes("left") ? "-left-1.5" : "-right-1.5",
                        handle === "top-left" || handle === "bottom-right" ? "cursor-nwse-resize" : "cursor-nesw-resize",
                      )}
                    />
                  ))}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-8 left-1/2 h-7 w-px -translate-x-1/2 bg-[var(--canvas-selection)]/70"
                  />
                  <button
                    type="button"
                    data-store-device-control="rotate"
                    aria-label={`Rotate ${objectLabel}`}
                    title={`Rotate ${objectLabel}`}
                    onPointerDown={(event) => beginDeviceInteraction(event, "rotate", slot, transform, movementLimit)}
                    onPointerMove={moveDeviceInteraction}
                    onPointerUp={endDeviceInteraction}
                    onPointerCancel={endDeviceInteraction}
                    onKeyDown={(event) => rotateDeviceWithKeyboard(event, slot, transform)}
                    className="pointer-events-auto absolute -top-12 left-1/2 z-30 flex size-8 -translate-x-1/2 cursor-grab touch-none select-none items-center justify-center rounded-full border-2 border-[var(--canvas-selection)] bg-[var(--canvas-control-surface)] text-[var(--canvas-selection)] shadow-sm before:absolute before:-inset-1 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--canvas-selection)] active:cursor-grabbing"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21.5 2v6h-6" />
                      <path d="M21.34 13.72A10 10 0 1 1 18.57 4.62L21.5 8" />
                    </svg>
                  </button>
                  {!definition && source.src ? (
                    <>
                      <button
                        type="button"
                        data-store-device-control="start-crop"
                        aria-label={`Crop ${objectLabel} image`}
                        title={`Crop ${objectLabel} image`}
                        onClick={(event) => startScreenCrop(event, slot, source)}
                        className="pointer-events-auto absolute -top-12 left-1/2 z-30 flex size-8 -translate-x-14 items-center justify-center rounded-full border-2 border-[var(--canvas-selection)] bg-[var(--canvas-control-surface)] text-[var(--canvas-selection)] shadow-sm before:absolute before:-inset-1 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--canvas-selection)]"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 2v14a2 2 0 0 0 2 2h14" />
                          <path d="M2 6h14a2 2 0 0 1 2 2v14" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        data-store-device-control="delete-screen"
                        aria-label={`Delete ${objectLabel} image`}
                        title={`Delete ${objectLabel} image`}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          onScreenDelete?.(source.id);
                        }}
                        className="pointer-events-auto absolute -top-12 left-1/2 z-30 flex size-8 translate-x-6 items-center justify-center rounded-full border-2 border-destructive bg-[var(--canvas-control-surface)] text-destructive shadow-sm before:absolute before:-inset-1 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                          <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                      </button>
                    </>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        );
      })}

      {slide.overlay ? (
        <img
          src={slide.overlay.src}
          alt=""
          draggable={false}
          className="pointer-events-none absolute z-30 select-none object-contain"
          style={{
            left: `${slide.overlay.x}%`,
            top: `${slide.overlay.y}%`,
            width: `${slide.overlay.size}%`,
            opacity: slide.overlay.opacity,
            transform: "translate(-50%, -50%)",
          }}
        />
      ) : null}
    </div>
  );
});
