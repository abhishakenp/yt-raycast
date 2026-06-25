import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const readProjectFile = (path: string): string =>
  readFileSync(join(process.cwd(), path), 'utf8')

describe('public gallery preview cards', () => {
  it('uses stored HTML or generated thumbnails without loading the live preview runtime', () => {
    const gallerySource = readProjectFile(
      'src/features/gallery/components/PublicGallery.tsx',
    )
    const responseSource = readProjectFile(
      'src/features/gallery/server/gallery-thumbnail-response.ts',
    )
    const captureSource = readProjectFile(
      'src/features/gallery/server/gallery-thumbnail-capture.ts',
    )
    expect(gallerySource).toContain('getGalleryThumbnailUrl(session)')
    expect(gallerySource).toContain('resolveGalleryThumbnail')
    expect(gallerySource).not.toContain(
      'const LazyGeneratedModulePreview = lazy(',
    )
    expect(gallerySource).not.toContain(
      "import('@/features/generation/components/GeneratedModulePreview')",
    )
    expect(gallerySource).not.toContain(
      "import { GeneratedModulePreview } from '@/features/generation/components/GeneratedModulePreview'",
    )
    expect(gallerySource).toContain('previewDocument !== undefined ?')
    expect(gallerySource).toContain(
      'previewDocument === undefined ? getGalleryImageUrl(session) :',
    )
    expect(gallerySource).not.toContain('getModuleSource(')
    expect(gallerySource).not.toContain('moduleSource !== undefined')
    expect(gallerySource).not.toContain('/preview-raw')
    expect(gallerySource).not.toContain('fallback=1')
    expect(gallerySource).not.toContain('<iframe')
    expect(gallerySource).not.toContain('gallery-preview-frame')
    expect(responseSource).toContain("searchParams.get('fallback') !== '1'")
    expect(captureSource).not.toContain(`agent-${'browser'}`)
  })
})
