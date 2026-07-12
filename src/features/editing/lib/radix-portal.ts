// Radix UI overlays (Select dropdowns, popovers, AlertDialogs) render into a
// portal on document.body — OUTSIDE the inline-edit toolbar and preview
// container DOM. Every "click/focus moved outside → dismiss" handler in the
// editor must treat these portals as "inside", or interacting with a control
// inside the toolbar (e.g. switching the gap unit px → rem) collapses the
// toolbar. Keep this list in sync across all such handlers.
const RADIX_PORTAL_SELECTORS = [
  '[role="option"]',
  '[role="listbox"]',
  '[role="alertdialog"]',
  '[data-radix-popper-content-wrapper]',
  '[data-radix-select-content]',
  '[data-radix-dialog-content]',
  '[data-radix-dialog-overlay]',
] as const

/**
 * True when `el` lives inside a Radix portal overlay (Select dropdown, popper,
 * or AlertDialog). Dismiss handlers should bail out early when this is true so
 * interacting with a portalled control does not close the toolbar/selection.
 */
export function isInRadixPortal(el: Element | null | undefined): boolean {
  if (!el || typeof el.closest !== 'function') return false
  return RADIX_PORTAL_SELECTORS.some((sel) => el.closest(sel))
}
