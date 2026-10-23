"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  CropIcon,
  Download04Icon,
  Delete02Icon,
  Eraser01Icon,
  Loading03Icon,
  PencilEdit02Icon,
  Undo02Icon,
} from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  appendPathPoint,
  applyCropAspectRatio,
  buildOutputName,
  centeredCropForRatio,
  clampCropRect,
  clampPoint,
  downloadBlob,
  formatBytes,
  imageToolsWorker,
  pickCutSide,
  polygonBounds,
  readImageSize,
  resolveFreehand,
  resolveOutputFormat,
  supportsTransparency,
  DEFAULT_REENCODE_QUALITY,
  DEFAULT_TOOL_SETTINGS,
  type CropRect,
  type Dimensions,
  type EraseStroke,
  type FreehandSelection,
  type Point,
  type ProcessResult,
  type RasterFormat,
} from "@/lib/image-tools";
import type { ToolDefinition } from "@/lib/seo/tools";
import { ToolDropzone } from "./ToolDropzone";
import { OptionGroup } from "./ToolOptions";
import { CARD_CLASS } from "./ui";

const RATIO_PRESETS: { id: string; label: string; ratio: number | null }[] = [
  { id: "free", label: "Free", ratio: null },
  { id: "1:1", label: "1:1", ratio: 1 },
  { id: "16:9", label: "16:9", ratio: 16 / 9 },
  { id: "4:3", label: "4:3", ratio: 4 / 3 },
  { id: "3:2", label: "3:2", ratio: 3 / 2 },
  { id: "9:16", label: "9:16", ratio: 9 / 16 },
];

type CropShape = "rectangle" | "freehand";

const SHAPE_OPTIONS: { id: CropShape; label: string }[] = [
  { id: "rectangle", label: "Rectangle" },
  { id: "freehand", label: "Freehand" },
];

type FreehandTool = "draw" | "erase";

const FREEHAND_TOOLS: { id: FreehandTool; label: string; icon: React.ReactNode }[] = [
  { id: "draw", label: "Draw", icon: <PencilEdit02Icon size={14} /> },
  { id: "erase", label: "Erase", icon: <Eraser01Icon size={14} /> },
];

/** Smallest crop we allow, in source pixels. */
const MIN_CROP = 16;

// Freehand distances are in preview pixels, so they feel the same however
// large the image is; they are divided by the preview scale before use.
/** Gap between recorded points along a stroke. */
const PATH_POINT_SPACING = 2;
/** A stroke end this close to an image edge counts as touching it. */
const EDGE_SNAP = 16;
/** Stroke ends closer than this make a closed loop rather than a cut. */
const CLOSE_DISTANCE = 32;
/** A press that moves less than this is a click, not a stroke. */
const TAP_DISTANCE = 4;
/** Eraser brush diameter range. */
const MIN_BRUSH = 8;
const MAX_BRUSH = 120;
const DEFAULT_BRUSH = 32;

type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
type DragMode = Handle | "move";

interface DragState {
  mode: DragMode;
  pointerId: number;
  startX: number;
  startY: number;
  startRect: CropRect;
}

/** A freehand stroke in progress, either drawing a shape or erasing. */
interface FreehandDraft {
  pointerId: number;
  tool: FreehandTool;
  points: Point[];
  /** Brush radius in source pixels, fixed when the stroke starts. */
  radius: number;
}

const HANDLE_POSITIONS: Record<Handle, string> = {
  nw: "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize",
  n: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize",
  ne: "right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize",
  e: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize",
  se: "right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize",
  s: "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-ns-resize",
  sw: "left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize",
  w: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize",
};

function toPointList(points: Point[]): string {
  return points.map(({ x, y }) => `${x},${y}`).join(" ");
}

/**
 * Outline of a freehand path, drawn twice so it reads on light and dark
 * images alike: a dark halo under a white line, like the rectangle's border.
 */
function FreehandOutline({ points, closed }: { points: Point[]; closed: boolean }) {
  const Shape = closed ? "polygon" : "polyline";
  const shared = {
    points: toPointList(points),
    fill: "none",
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
    vectorEffect: "non-scaling-stroke" as const,
  };
  return (
    <>
      <Shape {...shared} stroke="rgba(0,0,0,0.35)" strokeWidth={4} />
      <Shape {...shared} stroke="white" strokeWidth={2} />
    </>
  );
}

/** An eraser stroke as it appears inside the preview's dimming mask. */
function EraseMark({ stroke }: { stroke: EraseStroke }) {
  if (stroke.points.length === 1) {
    const [point] = stroke.points;
    return <circle cx={point.x} cy={point.y} r={stroke.radius} fill="white" />;
  }
  return (
    <polyline
      points={toPointList(stroke.points)}
      fill="none"
      stroke="white"
      strokeWidth={stroke.radius * 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

/**
 * Applies a drag to the crop rectangle in *source pixel* space, so the result
 * is independent of how large the preview happens to be rendered.
 */
function resizeRect(
  rect: CropRect,
  mode: Handle,
  dx: number,
  dy: number,
  source: Dimensions,
  ratio: number | null
): CropRect {
  let { x, y, width, height } = rect;

  if (mode.includes("w")) {
    const nextX = Math.min(x + dx, x + width - MIN_CROP);
    width += x - nextX;
    x = nextX;
  }
  if (mode.includes("e")) {
    width = Math.max(MIN_CROP, width + dx);
  }
  if (mode.includes("n")) {
    const nextY = Math.min(y + dy, y + height - MIN_CROP);
    height += y - nextY;
    y = nextY;
  }
  if (mode.includes("s")) {
    height = Math.max(MIN_CROP, height + dy);
  }

  if (ratio) {
    // Edge handles drive the axis they control; corners follow the width.
    if (mode === "n" || mode === "s") {
      width = height * ratio;
    } else {
      height = width / ratio;
    }
    // Keep the anchored edges pinned after the ratio correction.
    if (mode.includes("w")) x = rect.x + rect.width - width;
    if (mode.includes("n")) y = rect.y + rect.height - height;
  }

  return clampCropRect({ x, y, width, height }, source);
}

interface CropWorkspaceProps {
  tool: ToolDefinition;
}

export function CropWorkspace({ tool }: CropWorkspaceProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [source, setSource] = React.useState<Dimensions | null>(null);
  const [crop, setCrop] = React.useState<CropRect | null>(null);
  const [ratioId, setRatioId] = React.useState("free");
  const [isRunning, setIsRunning] = React.useState(false);
  const [result, setResult] = React.useState<ProcessResult | null>(null);

  const [shape, setShape] = React.useState<CropShape>("rectangle");
  const [selection, setSelection] = React.useState<FreehandSelection | null>(null);
  // Which side of a cut is kept; null until the user clicks one.
  const [side, setSide] = React.useState<0 | 1 | null>(null);
  const [hoverSide, setHoverSide] = React.useState<0 | 1 | null>(null);
  const [freehandTool, setFreehandTool] = React.useState<FreehandTool>("draw");
  const [brushSize, setBrushSize] = React.useState(DEFAULT_BRUSH);
  const [eraseStrokes, setEraseStrokes] = React.useState<EraseStroke[]>([]);
  const [draft, setDraft] = React.useState<FreehandDraft | null>(null);
  const [brushPoint, setBrushPoint] = React.useState<Point | null>(null);

  const frameRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<DragState | null>(null);
  // Mirrors `draft` so pointer handlers read the latest points synchronously.
  const draftRef = React.useRef<FreehandDraft | null>(null);
  const [displayWidth, setDisplayWidth] = React.useState(0);
  const maskId = `crop-mask-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const ratio = RATIO_PRESETS.find((preset) => preset.id === ratioId)?.ratio ?? null;
  // Preview pixels per source pixel; every drag delta is divided by this.
  const scale = source && displayWidth ? displayWidth / source.width : 1;

  const isFreehand = shape === "freehand";
  const keptPolygon =
    selection?.kind === "lasso"
      ? selection.polygon
      : selection && side !== null
        ? selection.sides[side]
        : null;
  const freehandBounds = keptPolygon && source ? polygonBounds(keptPolygon, source) : null;
  const outputRect = isFreehand ? freehandBounds : crop;
  // Erasing only makes sense once there is something kept to erase from.
  const activeTool: FreehandTool = keptPolygon ? freehandTool : "draw";
  const brushRadius = brushSize / 2 / scale;
  const isDrawingShape = draft?.tool === "draw";

  // Outside a freehand shape is transparent, which JPEG cannot store.
  const outputFormat = (sourceFile: File): RasterFormat => {
    const format = resolveOutputFormat(DEFAULT_TOOL_SETTINGS.format, sourceFile.type);
    return isFreehand && !supportsTransparency(format) ? "png" : format;
  };

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // The preview is laid out by the browser (max-height, max-width), so its
  // rendered width has to be observed rather than calculated.
  React.useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const observer = new ResizeObserver(([entry]) => {
      setDisplayWidth(entry.contentRect.width);
    });
    observer.observe(frame);
    setDisplayWidth(frame.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, [previewUrl]);

  const clearFreehand = React.useCallback(() => {
    setSelection(null);
    setSide(null);
    setHoverSide(null);
    setEraseStrokes([]);
    setFreehandTool("draw");
    setResult(null);
  }, []);

  const handleFiles = React.useCallback(
    async (files: File[]) => {
      const next = files[0];
      if (!next) return;

      try {
        const size = await readImageSize(next);
        setFile(next);
        setPreviewUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return URL.createObjectURL(next);
        });
        setSource(size);
        setCrop(centeredCropForRatio(size, size.width / size.height));
        setRatioId("free");
        clearFreehand();
      } catch {
        toast.error("Could not read that image", {
          description: "Try a PNG, JPG, WebP, or AVIF file.",
        });
      }
    },
    [clearFreehand]
  );

  const handleRatioChange = React.useCallback(
    (id: string) => {
      setRatioId(id);
      setResult(null);
      const preset = RATIO_PRESETS.find((entry) => entry.id === id);
      if (!preset?.ratio || !source || !crop) return;
      setCrop(applyCropAspectRatio(crop, source, preset.ratio));
    },
    [crop, source]
  );

  const beginDrag = React.useCallback(
    (mode: DragMode) => (event: React.PointerEvent) => {
      if (!crop) return;
      event.preventDefault();
      event.stopPropagation();
      (event.target as Element).setPointerCapture(event.pointerId);
      dragRef.current = {
        mode,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startRect: crop,
      };
      setResult(null);
    },
    [crop]
  );

  const handleShapeChange = React.useCallback((id: string) => {
    setShape(id as CropShape);
    setResult(null);
  }, []);

  const toSourcePoint = (event: React.PointerEvent): Point | null => {
    const frame = frameRef.current;
    if (!frame || !source) return null;
    const bounds = frame.getBoundingClientRect();
    return clampPoint(
      {
        x: (event.clientX - bounds.left) / scale,
        y: (event.clientY - bounds.top) / scale,
      },
      source
    );
  };

  const beginFreehand = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isFreehand || event.button !== 0) return;
    const point = toSourcePoint(event);
    if (!point) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    draftRef.current = {
      pointerId: event.pointerId,
      tool: activeTool,
      points: [point],
      radius: brushRadius,
    };
    setDraft(draftRef.current);
  };

  const finishFreehand = (finished: FreehandDraft) => {
    if (!source) return;

    if (finished.tool === "erase") {
      setEraseStrokes((current) => [
        ...current,
        { points: finished.points, radius: finished.radius },
      ]);
      setResult(null);
      return;
    }

    const [first] = finished.points;
    const isTap = finished.points.every(
      (point) => Math.hypot(point.x - first.x, point.y - first.y) < TAP_DISTANCE / scale
    );
    if (isTap) {
      // Clicking picks or switches the kept side of a cut; elsewhere it is a no-op.
      if (selection?.kind === "cut") {
        const picked = pickCutSide(selection.sides, first);
        if (picked !== null) {
          setSide(picked);
          setResult(null);
        }
      }
      return;
    }

    // A new shape starts over, including anything erased from the old one.
    clearFreehand();
    setSelection(
      resolveFreehand(finished.points, source, {
        edge: EDGE_SNAP / scale,
        close: CLOSE_DISTANCE / scale,
        minSize: MIN_CROP,
      })
    );
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    const current = draftRef.current;
    if (current && current.pointerId === event.pointerId) {
      const point = toSourcePoint(event);
      if (!point) return;
      const points = appendPathPoint(current.points, point, PATH_POINT_SPACING / scale);
      if (points !== current.points) {
        draftRef.current = { ...current, points };
        setDraft(draftRef.current);
      }
      if (current.tool === "erase") setBrushPoint(point);
      return;
    }

    if (isFreehand) {
      const point = toSourcePoint(event);
      setBrushPoint(activeTool === "erase" ? point : null);
      setHoverSide(
        point && selection?.kind === "cut" && activeTool === "draw"
          ? pickCutSide(selection.sides, point)
          : null
      );
      return;
    }

    const drag = dragRef.current;
    if (!drag || !source || drag.pointerId !== event.pointerId) return;

    const dx = (event.clientX - drag.startX) / scale;
    const dy = (event.clientY - drag.startY) / scale;

    if (drag.mode === "move") {
      setCrop(
        clampCropRect(
          {
            ...drag.startRect,
            x: drag.startRect.x + dx,
            y: drag.startRect.y + dy,
          },
          source
        )
      );
      return;
    }

    setCrop(resizeRect(drag.startRect, drag.mode, dx, dy, source, ratio));
  };

  const endDrag = (event: React.PointerEvent) => {
    const finished = draftRef.current;
    if (finished?.pointerId === event.pointerId) {
      draftRef.current = null;
      setDraft(null);
      if (event.type === "pointerup") finishFreehand(finished);
    }
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  };

  const handlePointerLeave = () => {
    setHoverSide(null);
    if (!draftRef.current) setBrushPoint(null);
  };

  const setCropField = (field: keyof CropRect, raw: string) => {
    if (!source || !crop) return;
    const value = Math.max(0, Number.parseInt(raw, 10) || 0);
    setCrop(clampCropRect({ ...crop, [field]: value }, source));
    setResult(null);
  };

  const handleCrop = async () => {
    if (!file || !outputRect) return;

    setIsRunning(true);
    try {
      const format = outputFormat(file);
      const processed = await imageToolsWorker.process(file, {
        crop: outputRect,
        mask: isFreehand ? keptPolygon : null,
        erase: isFreehand ? eraseStrokes : null,
        transform: null,
        resize: null,
        encode: {
          format,
          quality: DEFAULT_REENCODE_QUALITY,
          background: DEFAULT_TOOL_SETTINGS.background,
        },
      });
      setResult(processed);
    } catch {
      toast.error("Crop failed", {
        description: "The image may be too large for this browser to process.",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    downloadBlob(result.blob, buildOutputName("crop", file.name, outputFormat(file)));
  };

  const reset = React.useCallback(() => {
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setFile(null);
    setSource(null);
    setCrop(null);
    clearFreehand();
  }, [clearFreehand]);

  if (!file || !previewUrl || !source || !crop) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <ToolDropzone
          onFiles={handleFiles}
          multiple={false}
          sourceLabel={tool.preset?.sourceLabel}
        />
      </div>
    );
  }

  const visibleEraseStrokes =
    draft?.tool === "erase" ? [...eraseStrokes, draft] : eraseStrokes;

  const selectionHint = !selection
    ? "Press and drag to draw around what you want to keep. A line from one edge to another splits the image instead."
    : selection.kind === "lasso"
      ? "Everything outside the shape becomes transparent."
      : side === null
        ? "Click the side of the line you want to keep."
        : "The other side becomes transparent. Click it to switch.";

  const cropLabel = outputRect
    ? `Crop to ${outputRect.width} × ${outputRect.height}`
    : selection?.kind === "cut"
      ? "Choose a side to crop"
      : "Draw a shape to crop";

  return (
    <div className="mx-auto grid w-full max-w-5xl items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className={cn(CARD_CLASS, "p-2")}>
        <div className="flex w-full justify-center rounded-xl bg-background/70 p-4 sm:p-6">
          <div
            ref={frameRef}
            className={cn(
              "relative inline-block touch-none select-none",
              isFreehand &&
                (activeTool === "erase"
                  ? "cursor-none"
                  : hoverSide !== null
                    ? "cursor-pointer"
                    : "cursor-crosshair")
            )}
            onPointerDown={beginFreehand}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerLeave={handlePointerLeave}
          >
            <Image
              src={previewUrl}
              alt={file.name}
              width={source.width}
              height={source.height}
              unoptimized
              draggable={false}
              className="block h-auto max-h-[60vh] w-auto max-w-full rounded-md"
            />

            {isFreehand ? (
              <>
                {/* Drawn in source pixels; the viewBox does the scaling. */}
                <svg
                  className="pointer-events-none absolute inset-0 size-full rounded-md"
                  viewBox={`0 0 ${source.width} ${source.height}`}
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  {keptPolygon && !isDrawingShape ? (
                    <>
                      {/* Dim everything that will be removed: outside the kept area, plus erased strokes. */}
                      <defs>
                        <mask
                          id={maskId}
                          maskUnits="userSpaceOnUse"
                          x={0}
                          y={0}
                          width={source.width}
                          height={source.height}
                        >
                          <rect width={source.width} height={source.height} fill="white" />
                          <polygon
                            points={toPointList(keptPolygon)}
                            fill="black"
                            fillRule="evenodd"
                          />
                          {visibleEraseStrokes.map((stroke, index) => (
                            <EraseMark key={index} stroke={stroke} />
                          ))}
                        </mask>
                      </defs>
                      <rect
                        width={source.width}
                        height={source.height}
                        className="fill-black/50"
                        mask={`url(#${maskId})`}
                      />
                    </>
                  ) : null}

                  {selection?.kind === "cut" && side === null && hoverSide !== null && !draft ? (
                    <polygon
                      points={toPointList(selection.sides[hoverSide])}
                      fillRule="evenodd"
                      className="fill-white/20"
                    />
                  ) : null}

                  {isDrawingShape ? (
                    draft.points.length > 1 ? (
                      <FreehandOutline points={draft.points} closed={false} />
                    ) : null
                  ) : selection?.kind === "lasso" ? (
                    <FreehandOutline points={selection.polygon} closed />
                  ) : selection?.kind === "cut" ? (
                    <FreehandOutline points={selection.stroke} closed={false} />
                  ) : null}

                  {activeTool === "erase" && brushPoint ? (
                    <>
                      <circle
                        cx={brushPoint.x}
                        cy={brushPoint.y}
                        r={brushRadius}
                        fill="none"
                        stroke="rgba(0,0,0,0.35)"
                        strokeWidth={3}
                        vectorEffect="non-scaling-stroke"
                      />
                      <circle
                        cx={brushPoint.x}
                        cy={brushPoint.y}
                        r={brushRadius}
                        fill="none"
                        stroke="white"
                        strokeWidth={1.5}
                        vectorEffect="non-scaling-stroke"
                      />
                    </>
                  ) : null}
                </svg>

                {!draft && (!selection || (selection.kind === "cut" && side === null)) ? (
                  <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-black/60 px-3 py-1.5 text-xs font-medium text-white">
                    {selection ? "Click the side to keep" : "Draw around what you want to keep"}
                  </span>
                ) : null}
              </>
            ) : (
              <>
                {/* Dimmed area outside the selection. */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-md bg-black/50"
                  style={{
                    clipPath: `polygon(0% 0%, 0% 100%, ${crop.x * scale}px 100%, ${
                      crop.x * scale
                    }px ${crop.y * scale}px, ${(crop.x + crop.width) * scale}px ${
                      crop.y * scale
                    }px, ${(crop.x + crop.width) * scale}px ${
                      (crop.y + crop.height) * scale
                    }px, ${crop.x * scale}px ${
                      (crop.y + crop.height) * scale
                    }px, ${crop.x * scale}px 100%, 100% 100%, 100% 0%)`,
                  }}
                  aria-hidden="true"
                />

                <div
                  role="group"
                  aria-label="Crop selection"
                  onPointerDown={beginDrag("move")}
                  className="absolute cursor-move border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
                  style={{
                    left: crop.x * scale,
                    top: crop.y * scale,
                    width: crop.width * scale,
                    height: crop.height * scale,
                  }}
                >
                  {(Object.keys(HANDLE_POSITIONS) as Handle[]).map((handle) => (
                    <span
                      key={handle}
                      onPointerDown={beginDrag(handle)}
                      className={cn(
                        "absolute size-3 rounded-full border-2 border-white bg-foreground shadow",
                        HANDLE_POSITIONS[handle]
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <aside className={cn(CARD_CLASS, "flex flex-col gap-5 p-5 lg:sticky lg:top-24")}>
        <OptionGroup label="Shape">
          <SegmentedControl
            options={SHAPE_OPTIONS}
            value={shape}
            onChange={handleShapeChange}
            ariaLabel="Crop shape"
            size="sm"
          />
        </OptionGroup>

        {isFreehand ? (
          <>
            <OptionGroup label="Selection" hint={selectionHint}>
              {keptPolygon && file.type === "image/jpeg" ? (
                <p className="text-xs text-muted-foreground">
                  Saved as PNG, since JPEG cannot store transparency.
                </p>
              ) : null}
              {selection ? (
                <Button variant="outline" size="sm" onClick={clearFreehand} className="w-full">
                  <PencilEdit02Icon size={15} aria-hidden="true" />
                  Draw again
                </Button>
              ) : null}
            </OptionGroup>

            {keptPolygon ? (
              <OptionGroup
                label="Tool"
                hint={
                  activeTool === "erase"
                    ? "Brush over anything you don't want. It becomes transparent."
                    : undefined
                }
              >
                <SegmentedControl
                  options={FREEHAND_TOOLS}
                  value={activeTool}
                  onChange={(id) => setFreehandTool(id as FreehandTool)}
                  ariaLabel="Freehand tool"
                  size="sm"
                />
                {activeTool === "erase" ? (
                  <>
                    <Slider
                      value={[brushSize]}
                      min={MIN_BRUSH}
                      max={MAX_BRUSH}
                      step={1}
                      onValueChange={([next]) => setBrushSize(next)}
                      aria-label="Eraser size"
                      label="Brush size"
                      valueDisplay={`${brushSize}px`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={eraseStrokes.length === 0}
                      onClick={() => {
                        setEraseStrokes((current) => current.slice(0, -1));
                        setResult(null);
                      }}
                      className="w-full"
                    >
                      <Undo02Icon size={15} aria-hidden="true" />
                      Undo erase
                    </Button>
                  </>
                ) : null}
              </OptionGroup>
            ) : null}
          </>
        ) : (
          <>
            <OptionGroup label="Aspect ratio">
              <SegmentedControl
                options={RATIO_PRESETS.map((preset) => ({
                  id: preset.id,
                  label: preset.label,
                }))}
                value={ratioId}
                onChange={handleRatioChange}
                ariaLabel="Aspect ratio"
                size="sm"
              />
            </OptionGroup>

            <OptionGroup label="Selection" hint={`Source image: ${source.width} × ${source.height}`}>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["width", "Width"],
                    ["height", "Height"],
                    ["x", "X offset"],
                    ["y", "Y offset"],
                  ] as const
                ).map(([field, label]) => (
                  <div key={field} className="flex flex-col gap-1.5">
                    <Label
                      htmlFor={`crop-${field}`}
                      className="text-xs text-muted-foreground"
                    >
                      {label}
                    </Label>
                    <Input
                      id={`crop-${field}`}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={crop[field]}
                      onChange={(event) => setCropField(field, event.target.value)}
                    />
                  </div>
                ))}
              </div>
            </OptionGroup>
          </>
        )}

        <div className="flex flex-col gap-2 border-t border-border pt-5">
          <Button
            size="lg"
            onClick={() => void handleCrop()}
            disabled={isRunning || !outputRect}
            className="w-full"
          >
            {isRunning ? (
              <Loading03Icon size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <CropIcon size={16} aria-hidden="true" />
            )}
            {cropLabel}
          </Button>

          {result ? (
            <Button variant="secondary" onClick={handleDownload} className="w-full">
              <Download04Icon size={16} aria-hidden="true" />
              Download ({formatBytes(result.bytes)})
            </Button>
          ) : null}

          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="w-full text-muted-foreground"
          >
            <Delete02Icon size={15} aria-hidden="true" />
            Choose another image
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Cropped at full resolution from the original file. The preview above is
          only scaled for display. Nothing is uploaded.
        </p>
      </aside>
    </div>
  );
}
