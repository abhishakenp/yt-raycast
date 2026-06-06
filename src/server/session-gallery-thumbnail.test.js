import { describe, expect, it } from 'vitest'
import { join } from 'node:path'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import {
  GALLERY_THUMB_FILENAME,
  getGalleryThumbPath,
  hasGalleryThumb,
  isGalleryThumbEnabled,
  readGalleryThumb,
} from './session-gallery-thumbnail.js'

describe('session-gallery-thumbnail', () => {
  it('detects cached thumbnail in session workspace', () => {
    const workspace = join(tmpdir(), `sf-thumb-${Date.now()}`)
    mkdirSync(workspace, { recursive: true })
    try {
      expect(hasGalleryThumb(workspace)).toBe(false)
      const path = getGalleryThumbPath(workspace)
      expect(path.endsWith(GALLERY_THUMB_FILENAME)).toBe(true)
      writeFileSync(path, Buffer.from('png-bytes'))
      expect(hasGalleryThumb(workspace)).toBe(true)
      expect(readGalleryThumb(workspace)?.toString()).toBe('png-bytes')
    } finally {
      rmSync(workspace, { recursive: true, force: true })
    }
  })

  it('uses the workspace-local png cache filename', () => {
    expect(GALLERY_THUMB_FILENAME).toBe('.gallery-thumb.png')
  })

  it('is enabled unless GALLERY_THUMB_DISABLE=1', () => {
    const prev = process.env.GALLERY_THUMB_DISABLE
    delete process.env.GALLERY_THUMB_DISABLE
    expect(isGalleryThumbEnabled()).toBe(true)
    process.env.GALLERY_THUMB_DISABLE = '1'
    expect(isGalleryThumbEnabled()).toBe(false)
    if (prev == null) delete process.env.GALLERY_THUMB_DISABLE
    else process.env.GALLERY_THUMB_DISABLE = prev
  })
})
