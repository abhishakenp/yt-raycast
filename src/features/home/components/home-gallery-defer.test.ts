import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const readHomePageSource = () =>
  readFileSync(
    join(process.cwd(), 'src/features/home/components/HomePage.tsx'),
    'utf8',
  )

const readLaunchBackdropSource = () =>
  readFileSync(join(process.cwd(), 'src/components/launch-backdrop.tsx'), 'utf8')

describe('homepage gallery deferral', () => {
  it('mounts the public gallery only after viewport or idle readiness', () => {
    const source = readHomePageSource()
    const renderBody = source.slice(source.indexOf('export const HomePage = () => {'))

    expect(source).toContain('const DeferredHomeGallerySection = () =>')
    expect(source).toContain('IntersectionObserver')
    expect(source).toContain('requestIdleCallback')
    expect(source).toContain('HOME_GALLERY_IDLE_DELAY_MS')
    expect(source).toContain('const LazyHomeGallerySection = lazy(')
    expect(source).toContain(
      "import('@/features/gallery/components/PublicGallery')",
    )
    expect(source).not.toContain(
      "import { HomeGallerySection } from '@/features/gallery/components/PublicGallery'",
    )
    expect(source).toContain("document.activeElement.id === 'prompt-input'")
    expect(source).toContain('window.addEventListener(\'scroll\', handleScroll')
    expect(renderBody).toContain('<DeferredHomeGallerySection />')
    expect(renderBody).not.toContain('<HomeGallerySection />')
  })

  it('does not expose full example prompt text as a native hover title', () => {
    const source = readHomePageSource()
    const examplePromptBlock = source.slice(
      source.indexOf('aria-label="Example prompts"'),
      source.indexOf('onClick={() => handleExamplePrompt(value)}'),
    )

    expect(examplePromptBlock).toContain('data-prompt={value}')
    expect(examplePromptBlock).not.toContain('title={value}')
  })

  it('loads Clerk auth controls only after explicit sign-in intent', () => {
    const source = readHomePageSource()

    expect(source).not.toContain('@clerk/tanstack-react-start')
    expect(source).toContain("import('@/components/HomepageAuthControls')")
    expect(source).toContain('authRequested ? (')
    expect(source).toContain('<LazyHomepageAuthControls autoOpen />')
  })

  it('keeps the heavy prompt language detector out of the initial homepage bundle', () => {
    const source = readHomePageSource()
    const imports = source.slice(0, source.indexOf('const LANGUAGE_OPTIONS'))

    expect(imports).toContain('@/lib/home/prompt-language-labels')
    expect(imports).not.toContain('@/lib/home/prompt-language-core')
    expect(source).toContain("await import(\n          '@/lib/home/prompt-language-core'")
  })

  it('defers and pauses the animated homepage canvas backdrop', () => {
    const source = readLaunchBackdropSource()

    expect(source).toContain('BACKDROP_START_DELAY_MS')
    expect(source).toContain('requestIdleCallback')
    expect(source).toContain('document.addEventListener("visibilitychange"')
    expect(source).toContain('document.hidden')
    expect(source).toContain('width < 760 ? 54 : 96')
  })
})
