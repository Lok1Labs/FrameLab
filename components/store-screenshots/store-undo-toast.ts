import { toast } from "sonner";

const STORE_UNDO_DURATION_MS = 8_000;

export function showStoreUndoToast(title: string, onUndo: () => void): void {
  toast(title, {
    description: "You can restore it for the next 8 seconds.",
    duration: STORE_UNDO_DURATION_MS,
    action: {
      label: "Undo",
      onClick: onUndo,
    },
  });
}
