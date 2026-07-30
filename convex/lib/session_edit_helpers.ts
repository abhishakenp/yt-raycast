// Re-export edit helper functions from shared location for use in Convex
// This keeps a single source of truth while making functions available to both client and server
export {
  applyPreviewTextEdit,
  applyImageSwap,
  applyOpenUiVarReplace,
  applySectionHtmlReplace,
  applyStyleEdit,
} from './edit_helpers'
