import {
  MAX_STORE_PROJECT_IMAGE_BYTES,
  storeDataUrlBytes,
} from "./project";
import type { StoreProject } from "./types";

export const MAX_STORE_HISTORY_ENTRIES = 30;

function projectImageSources(project: StoreProject): string[] {
  return project.slides.flatMap((slide) => [
    slide.src,
    slide.backgroundImageOverride?.src,
    slide.overlay?.src,
  ].filter((source): source is string => Boolean(source)));
}

export function appendStoreHistory(
  stack: StoreProject[],
  snapshot: StoreProject,
  activeProject: StoreProject,
  imageBudgetBytes = MAX_STORE_PROJECT_IMAGE_BYTES,
): StoreProject[] {
  const candidates = [...stack, snapshot].slice(-MAX_STORE_HISTORY_ENTRIES);
  const seenSources = new Set(projectImageSources(activeProject));
  const retained: StoreProject[] = [];
  let retainedImageBytes = 0;

  for (let index = candidates.length - 1; index >= 0; index -= 1) {
    const candidate = candidates[index];
    const newSources = projectImageSources(candidate).filter((source) => !seenSources.has(source));
    const newImageBytes = newSources.reduce(
      (total, source) => total + storeDataUrlBytes(source),
      0,
    );
    if (retainedImageBytes + newImageBytes > imageBudgetBytes) break;
    newSources.forEach((source) => seenSources.add(source));
    retainedImageBytes += newImageBytes;
    retained.push(candidate);
  }

  return retained.reverse();
}

function collectChangedPaths(
  previous: unknown,
  next: unknown,
  path: string,
  paths: string[],
): void {
  if (Object.is(previous, next)) return;
  if (
    previous === null
    || next === null
    || typeof previous !== "object"
    || typeof next !== "object"
  ) {
    paths.push(path);
    return;
  }

  if (Array.isArray(previous) || Array.isArray(next)) {
    if (!Array.isArray(previous) || !Array.isArray(next) || previous.length !== next.length) {
      paths.push(path);
      return;
    }
    for (let index = 0; index < previous.length; index += 1) {
      const previousItem = previous[index];
      const nextItem = next[index];
      const itemId = (
        previousItem
        && nextItem
        && typeof previousItem === "object"
        && typeof nextItem === "object"
        && "id" in previousItem
        && "id" in nextItem
        && previousItem.id === nextItem.id
        && typeof previousItem.id === "string"
      ) ? previousItem.id : String(index);
      collectChangedPaths(previousItem, nextItem, `${path}.${itemId}`, paths);
    }
    return;
  }

  const previousRecord = previous as Record<string, unknown>;
  const nextRecord = next as Record<string, unknown>;
  const keys = new Set([...Object.keys(previousRecord), ...Object.keys(nextRecord)]);
  keys.forEach((key) => {
    collectChangedPaths(previousRecord[key], nextRecord[key], path ? `${path}.${key}` : key, paths);
  });
}

export function storeHistoryGroupKey(
  previous: StoreProject,
  next: StoreProject,
): string | null {
  const paths: string[] = [];
  collectChangedPaths(previous, next, "", paths);
  const meaningfulPaths = paths.filter((path) => path !== "updatedAt");
  if (meaningfulPaths.length === 0) return null;
  if (meaningfulPaths.some((path) => (
    path === "slides"
    || path === "templateId"
    || path === "createdAt"
    || path === "selectedSlideId"
    || path.endsWith(".src")
    || path.includes(".backgroundImageOverride")
    || path.includes(".overlay.src")
  ))) return null;
  if (meaningfulPaths.length === 1) return meaningfulPaths[0];

  const segments = meaningfulPaths.map((path) => path.split("."));
  const common: string[] = [];
  for (let index = 0; index < segments[0].length; index += 1) {
    const segment = segments[0][index];
    if (segments.every((parts) => parts[index] === segment)) common.push(segment);
    else break;
  }
  return common.length >= 3 ? common.join(".") : null;
}
