import { describe, expect, it } from 'vitest'

import {
  appendPreviewVersion,
  createEmptyPreviewState,
  getCurrentPreview,
  restorePreviewVersion,
} from './preview-version'

describe('preview versions', () => {
  it('appends preview versions monotonically', () => {
    const first = appendPreviewVersion(createEmptyPreviewState(), {
      source: 'generation',
      createdAt: 1,
    })
    const second = appendPreviewVersion(first, {
      source: 'edit',
      createdAt: 2,
    })

    expect(second.currentVersion).toBe(2)
    expect(getCurrentPreview(second)?.source).toBe('edit')
  })

  it('restores history by creating a new version', () => {
    const first = appendPreviewVersion(createEmptyPreviewState(), {
      source: 'generation',
      createdAt: 1,
    })
    const second = appendPreviewVersion(first, {
      source: 'edit',
      createdAt: 2,
    })
    const restored = restorePreviewVersion(second, 1, 3)

    expect(restored.currentVersion).toBe(3)
    expect(getCurrentPreview(restored)?.source).toBe('history_restore')
  })

  it('rejects missing history restores', () => {
    expect(() =>
      restorePreviewVersion(createEmptyPreviewState(), 9, 1),
    ).toThrow('Preview version 9 was not found')
  })
})
