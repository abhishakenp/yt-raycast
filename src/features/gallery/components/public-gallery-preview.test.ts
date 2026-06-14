import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const readProjectFile = (path: string): string =>
  readFileSync(join(process.cwd(), path), 'utf8')

describe('public gallery preview cards', () => {
  it('renders generated sites through raw previews and keeps thumbnails as fallback only', () => {
    const gallerySource = readProjectFile('src/features/gallery/components/PublicGallery.tsx')
    const responseSource = readProjectFile('src/features/gallery/server/gallery-thumbnail-response.ts')
    const captureSource = readProjectFile('src/features/gallery/server/gallery-thumbnail-capture.ts')
    expect(gallerySource).toContain('/gallery-thumb?v=')
    expect(gallerySource).toContain('URL.createObjectURL(blob)')
    expect(gallerySource).not.toContain('/preview-raw')
    expect(gallerySource).not.toContain('fallback=1')
    expect(gallerySource).not.toContain('<iframe')
    expect(gallerySource).not.toContain('gallery-preview-frame')
    expect(responseSource).toContain("searchParams.get('fallback') !== '1'")
    expect(captureSource).not.toContain(`agent-${'browser'}`)
  })
})
