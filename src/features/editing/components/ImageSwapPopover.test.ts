import { describe, expect, it } from 'vitest'
import { validateImageFile, extractImageFiles } from './ImageSwapPopover'

describe('validateImageFile', () => {
  it('accepts a valid PNG within size limit', () => {
    const file = new File(['data'], 'photo.png', { type: 'image/png' })
    expect(validateImageFile(file)).toBeNull()
  })

  it('accepts JPEG, GIF, WebP, and SVG', () => {
    const types = ['image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
    for (const type of types) {
      const file = new File(['data'], `file.${type.split('/')[1]}`, { type })
      expect(validateImageFile(file)).toBeNull()
    }
  })

  it('rejects non-image MIME types', () => {
    const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' })
    const error = validateImageFile(file)
    expect(error).not.toBeNull()
    expect(error).toContain('Unsupported file type')
    expect(error).toContain('application/pdf')
  })

  it('rejects empty MIME type', () => {
    const file = new File(['data'], 'no-type.bin', { type: '' })
    expect(validateImageFile(file)).not.toBeNull()
    expect(validateImageFile(file)).toContain('Unsupported')
  })

  it('rejects files exceeding 8MB', () => {
    const file = new File(['x'.repeat(9 * 1024 * 1024)], 'big.png', {
      type: 'image/png',
    })
    const error = validateImageFile(file)
    expect(error).not.toBeNull()
    expect(error).toContain('File too large')
    expect(error).toContain('8MB')
  })

  it('accepts file exactly at 8MB boundary', () => {
    const file = new File(['x'.repeat(8 * 1024 * 1024)], 'exact.png', {
      type: 'image/png',
    })
    expect(validateImageFile(file)).toBeNull()
  })
})

describe('extractImageFiles', () => {
  it('filters to only image files', () => {
    const files = [
      new File(['a'], 'a.png', { type: 'image/png' }),
      new File(['b'], 'b.pdf', { type: 'application/pdf' }),
      new File(['c'], 'c.jpg', { type: 'image/jpeg' }),
      new File(['d'], 'd.txt', { type: 'text/plain' }),
    ]
    const result = extractImageFiles(files)
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('a.png')
    expect(result[1].name).toBe('c.jpg')
  })

  it('returns empty array for no image files', () => {
    const files = [
      new File(['a'], 'a.pdf', { type: 'application/pdf' }),
      new File(['b'], 'b.txt', { type: 'text/plain' }),
    ]
    expect(extractImageFiles(files)).toEqual([])
  })

  it('returns empty array for empty input', () => {
    expect(extractImageFiles([])).toEqual([])
  })

  it('preserves all image files including SVG', () => {
    const files = [
      new File(['<svg/>'], 'icon.svg', { type: 'image/svg+xml' }),
      new File(['gif'], 'anim.gif', { type: 'image/gif' }),
    ]
    const result = extractImageFiles(files)
    expect(result).toHaveLength(2)
  })
})
