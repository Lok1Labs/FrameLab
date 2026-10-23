export const DEVICE_SCREEN_DROPZONE_SELECTOR = "[data-device-screen-dropzone]";

/**
 * Marks a region that handles its own file drops, such as a standalone tool
 * page. React listens on `document` in the App Router, so stopPropagation in a
 * component cannot keep GlobalDropZone from also seeing the drop.
 */
export const LOCAL_DROPZONE_SELECTOR = "[data-local-dropzone]";

interface ClosestTarget extends EventTarget {
  closest: (selector: string) => unknown;
}

function hasClosest(target: EventTarget | null): target is ClosestTarget {
  return typeof (target as Partial<ClosestTarget> | null)?.closest === "function";
}

export function isDeviceScreenDropTarget(target: EventTarget | null): boolean {
  return hasClosest(target) && Boolean(target.closest(DEVICE_SCREEN_DROPZONE_SELECTOR));
}

/** True when the global drop handler should leave this drop to the element under the cursor. */
export function isLocalDropTarget(target: EventTarget | null): boolean {
  return (
    isDeviceScreenDropTarget(target) ||
    (hasClosest(target) && Boolean(target.closest(LOCAL_DROPZONE_SELECTOR)))
  );
}
