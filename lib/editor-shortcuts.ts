/** Keep editor shortcuts out of text controls, dialogs, and handled events. */
export function shouldIgnoreEditorShortcut(event: {
  target: EventTarget | null;
  defaultPrevented: boolean;
  isComposing?: boolean;
}): boolean {
  const target = event.target;
  return event.defaultPrevented || !!event.isComposing || (
    target instanceof HTMLElement && (
      target.isContentEditable ||
      !!target.closest('input, textarea, select, [role="dialog"], [role="alertdialog"]')
    )
  );
}
