/**
 * Freehand crop geometry. Pure, no DOM, safe to unit test.
 *
 * A stroke becomes one of two selections:
 *
 * - "lasso": the stroke is closed with a straight line back to its start, and
 *   the enclosed area is kept.
 * - "cut": the stroke runs from one image edge to another, splitting the image
 *   in two. The user then picks the side to keep.
 *
 * Every point is in source pixels.
 */

import type { CropRect, Dimensions, Point } from "./types";

export type FreehandSelection =
  | { kind: "lasso"; polygon: Point[] }
  | { kind: "cut"; stroke: Point[]; sides: [Point[], Point[]] };

export interface FreehandThresholds {
  /** How close an end must be to an image edge to count as touching it. */
  edge: number;
  /** Ends closer than this are a closed loop, never a cut. */
  close: number;
  /** Smallest side of the kept area's bounding box. */
  minSize: number;
}

type Edge = "top" | "right" | "bottom" | "left";

/** Pins a point inside the image, so a stroke that leaves the image hugs its edge. */
export function clampPoint(point: Point, source: Dimensions): Point {
  return {
    x: Math.min(Math.max(0, point.x), source.width),
    y: Math.min(Math.max(0, point.y), source.height),
  };
}

/**
 * Appends a point to a freehand path unless it sits within `minDistance` of the
 * last one. Pointer events fire far faster than a hand moves, and the dropped
 * points would only bloat the path without changing its shape.
 *
 * Returns the same array when the point is skipped, so React can bail out.
 */
export function appendPathPoint(
  path: Point[],
  point: Point,
  minDistance: number
): Point[] {
  const last = path[path.length - 1];
  if (last && Math.hypot(point.x - last.x, point.y - last.y) < minDistance) {
    return path;
  }
  return [...path, point];
}

/**
 * Whole-pixel bounding box of a freehand selection, clamped to the image.
 * Returns null for a shape too small to crop, such as a click or a stray line.
 */
export function polygonBounds(
  points: Point[],
  source: Dimensions,
  minSize = 1
): CropRect | null {
  if (points.length < 3) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const point of points) {
    const { x, y } = clampPoint(point, source);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  // Grow outward to whole pixels so the edge of the shape is never shaved off.
  const x = Math.floor(minX);
  const y = Math.floor(minY);
  const width = Math.ceil(maxX) - x;
  const height = Math.ceil(maxY) - y;
  if (width < minSize || height < minSize) return null;

  return { x, y, width, height };
}

/** Enclosed area of a polygon (shoelace formula), whichever way it winds. */
export function polygonArea(points: Point[]): number {
  let twiceArea = 0;
  for (let index = 0; index < points.length; index++) {
    const a = points[index];
    const b = points[(index + 1) % points.length];
    twiceArea += a.x * b.y - b.x * a.y;
  }
  return Math.abs(twiceArea) / 2;
}

/**
 * Even-odd point-in-polygon test, the same rule the preview and the export
 * use to fill the shape, so a click lands on the side the user can see.
 */
export function pointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const a = polygon[index];
    const b = polygon[previous];
    if (
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
    ) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * A shape is worth cropping when its box clears the minimum and it encloses
 * real area. The area check is what rejects a straight line: a corner-to-corner
 * diagonal has a full-size box but encloses nothing.
 */
function isUsableShape(polygon: Point[], source: Dimensions, minSize: number): boolean {
  return (
    polygonBounds(polygon, source, minSize) !== null &&
    polygonArea(polygon) >= minSize * minSize
  );
}

function nearestEdge(point: Point, source: Dimensions): { edge: Edge; distance: number } {
  const candidates: { edge: Edge; distance: number }[] = [
    { edge: "top", distance: point.y },
    { edge: "right", distance: source.width - point.x },
    { edge: "bottom", distance: source.height - point.y },
    { edge: "left", distance: point.x },
  ];
  return candidates.reduce((best, next) => (next.distance < best.distance ? next : best));
}

function snapToEdge(point: Point, edge: Edge, source: Dimensions): Point {
  switch (edge) {
    case "top":
      return { x: point.x, y: 0 };
    case "right":
      return { x: source.width, y: point.y };
    case "bottom":
      return { x: point.x, y: source.height };
    case "left":
      return { x: 0, y: point.y };
  }
}

/** Distance along the image border, clockwise from the top-left corner. */
function perimeterPosition(point: Point, edge: Edge, source: Dimensions): number {
  const { width, height } = source;
  switch (edge) {
    case "top":
      return point.x;
    case "right":
      return width + point.y;
    case "bottom":
      return width + height + (width - point.x);
    case "left":
      return 2 * width + height + (height - point.y);
  }
}

/**
 * Corners passed when walking the border from one position to another, in the
 * order they are reached.
 */
function cornersBetween(
  from: number,
  to: number,
  clockwise: boolean,
  source: Dimensions
): Point[] {
  const { width, height } = source;
  const perimeter = 2 * (width + height);
  const ahead = (start: number, end: number) => (((end - start) % perimeter) + perimeter) % perimeter;
  const corners = [
    { at: 0, point: { x: 0, y: 0 } },
    { at: width, point: { x: width, y: 0 } },
    { at: width + height, point: { x: width, y: height } },
    { at: 2 * width + height, point: { x: 0, y: height } },
  ];
  const span = clockwise ? ahead(from, to) : ahead(to, from);

  return corners
    .map((corner) => ({
      point: corner.point,
      distance: clockwise ? ahead(from, corner.at) : ahead(corner.at, from),
    }))
    .filter(({ distance }) => distance > 0 && distance < span)
    .sort((a, b) => a.distance - b.distance)
    .map(({ point }) => point);
}

/**
 * Turns a finished stroke into a selection, or null when it encloses nothing
 * worth cropping (a click, a scribble, a straight line).
 */
export function resolveFreehand(
  stroke: Point[],
  source: Dimensions,
  thresholds: FreehandThresholds
): FreehandSelection | null {
  if (stroke.length < 2) return null;

  const start = stroke[0];
  const end = stroke[stroke.length - 1];
  const startEdge = nearestEdge(start, source);
  const endEdge = nearestEdge(end, source);
  const isCut =
    Math.hypot(end.x - start.x, end.y - start.y) > thresholds.close &&
    startEdge.distance <= thresholds.edge &&
    endEdge.distance <= thresholds.edge;

  if (isCut) {
    const from = snapToEdge(start, startEdge.edge, source);
    const to = snapToEdge(end, endEdge.edge, source);
    const line = [from, ...stroke, to];
    const fromAt = perimeterPosition(from, startEdge.edge, source);
    const toAt = perimeterPosition(to, endEdge.edge, source);
    const sides: [Point[], Point[]] = [
      [...line, ...cornersBetween(toAt, fromAt, true, source)],
      [...line, ...cornersBetween(toAt, fromAt, false, source)],
    ];
    // A line that only skims an edge leaves one side empty; treat it as a lasso.
    if (sides.every((side) => isUsableShape(side, source, thresholds.minSize))) {
      return { kind: "cut", stroke: line, sides };
    }
  }

  return isUsableShape(stroke, source, thresholds.minSize)
    ? { kind: "lasso", polygon: stroke }
    : null;
}

/** Which side of a cut a click landed on, or null if it hit neither. */
export function pickCutSide(sides: [Point[], Point[]], point: Point): 0 | 1 | null {
  if (pointInPolygon(point, sides[0])) return 0;
  if (pointInPolygon(point, sides[1])) return 1;
  return null;
}
