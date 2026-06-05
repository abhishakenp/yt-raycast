export type PreviewResetGuardInput = {
  openuiActive: boolean
  previewLoaded: boolean
  iframeSrc?: string | null
  previewBase: string
  origin: string
}

export const shouldPreserveOpenUIPreviewReset = ({
  openuiActive,
  previewLoaded,
  iframeSrc,
  previewBase,
  origin,
}: PreviewResetGuardInput): boolean => {
  if (!openuiActive || !previewLoaded || !iframeSrc) return false

  try {
    const current = new URL(iframeSrc, origin)
    const expected = new URL(previewBase, origin)
    return current.origin === expected.origin && current.pathname === expected.pathname
  } catch {
    return false
  }
}
