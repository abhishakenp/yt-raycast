import { describe, expect, it } from 'vitest'

import { shouldPreserveOpenUIPreviewReset } from './preview-reset-guard'

const baseInput = {
  openuiActive: true,
  previewLoaded: true,
  iframeSrc: 'http://localhost:7420/preview/session-123?t=123',
  previewBase: 'http://localhost:7420/preview/session-123',
  origin: 'http://localhost:7420',
}

describe('shouldPreserveOpenUIPreviewReset', () => {
  it('preserves a loaded OpenUI preview already on the session preview path', () => {
    expect(shouldPreserveOpenUIPreviewReset(baseInput)).toBe(true)
  })

  it('does not preserve when OpenUI mode is inactive', () => {
    expect(shouldPreserveOpenUIPreviewReset({ ...baseInput, openuiActive: false })).toBe(false)
  })

  it('does not preserve before the preview iframe has loaded', () => {
    expect(shouldPreserveOpenUIPreviewReset({ ...baseInput, previewLoaded: false })).toBe(false)
  })

  it('does not preserve blank or unrelated iframe URLs', () => {
    expect(shouldPreserveOpenUIPreviewReset({ ...baseInput, iframeSrc: 'about:blank' })).toBe(false)
    expect(
      shouldPreserveOpenUIPreviewReset({
        ...baseInput,
        iframeSrc: 'http://localhost:7420/next/session-123/',
      }),
    ).toBe(false)
  })

  it('does not preserve previews from another origin', () => {
    expect(
      shouldPreserveOpenUIPreviewReset({
        ...baseInput,
        iframeSrc: 'https://example.com/preview/session-123',
      }),
    ).toBe(false)
  })
})
