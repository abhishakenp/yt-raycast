import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const readHomePageSource = () =>
  readFileSync(
    join(process.cwd(), 'src/features/home/components/HomePage.tsx'),
    'utf8',
  )

const readLaunchBackdropSource = () =>
  readFileSync(
    join(process.cwd(), 'src/components/launch-backdrop.tsx'),
    'utf8',
  )

describe('homepage gallery deferral', () => {
  it('keeps the homepage form sized to content with the gallery close behind it', () => {
    const source = readHomePageSource()
    const heroSectionStart = source.indexOf(
      'aria-label="Print your mind in seconds"',
    )
    const heroSectionBlock = source.slice(
      source.lastIndexOf('<section', heroSectionStart),
      source.indexOf(
        'aria-label="Print your mind in seconds"',
        heroSectionStart,
      ),
    )
    const formColumnStart = source.indexOf(
      'className="relative z-[1] flex',
      heroSectionStart,
    )
    const formColumnBlock = source.slice(
      formColumnStart,
      source.indexOf('>', formColumnStart),
    )

    expect(heroSectionBlock).toContain('min-h-0')
    expect(heroSectionBlock).not.toMatch(/min-h-\[(?:50|70|100)s?vh\]/)
    expect(heroSectionBlock).not.toContain('max-[760px]:min-h-')
    expect(heroSectionBlock).toContain('pb-[clamp(18px,2vw,28px)]')
    expect(formColumnBlock).toContain('min-h-0')
    expect(formColumnBlock).not.toContain('min-h-[clamp(360px,34vw,420px)]')
    expect(formColumnBlock).not.toContain('max-[1100px]:min-h-[720px]')
    expect(source).toContain('id="home-gallery-mount"')
    expect(source).toContain(
      "'#home-gallery-mount .sf-home-gallery-section{margin-top:1rem}'",
    )
    expect(source).toContain('className="mb-10 mt-4 min-h-[280px]')
  })

  it('mounts the public gallery after viewport proximity or idle readiness', () => {
    const source = readHomePageSource()
    const renderBody = source.slice(
      source.indexOf('export const HomePage = () => {'),
    )

    expect(source).toContain('const DeferredHomeGallerySection = () =>')
    expect(source).toContain('IntersectionObserver')
    expect(source).toContain('requestIdleCallback')
    expect(source).toContain('HOME_GALLERY_IDLE_DELAY_MS')
    expect(source).toContain('const activateIfNearGallery = () =>')
    expect(source).toContain('activateIfNearGallery()')
    expect(source).not.toContain('userScrolled')
    expect(source).toContain('const LazyHomeGallerySection = lazy(')
    expect(source).toContain(
      "import('@/features/gallery/components/PublicGallery')",
    )
    expect(source).not.toContain(
      "import { HomeGallerySection } from '@/features/gallery/components/PublicGallery'",
    )
    expect(source).toContain("document.activeElement.id === 'prompt-input'")
    expect(source).toContain("window.addEventListener('scroll', handleScroll")
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

  it('mounts lazy Clerk auth controls so reloads can show signed-in state', () => {
    const source = readHomePageSource()

    expect(source).not.toContain('@clerk/tanstack-react-start')
    expect(source).toContain("import('@/components/HomepageAuthControls')")
    expect(source).not.toContain('authRequested ? (')
    expect(source).toContain(
      '<LazyHomepageAuthControls autoOpen={authRequested} />',
    )
  })

  it('keeps the heavy prompt language detector out of the initial homepage bundle', () => {
    const source = readHomePageSource()
    const imports = source.slice(0, source.indexOf('const LANGUAGE_OPTIONS'))

    expect(imports).toContain('@/lib/home/prompt-language-labels')
    expect(imports).not.toContain('@/lib/home/prompt-language-core')
    expect(source).toMatch(
      /await\s+import\(\s*['"]@\/lib\/home\/prompt-language-core['"]\s*\)/,
    )
  })

  it('defers and pauses the animated homepage canvas backdrop', () => {
    const source = readLaunchBackdropSource()

    expect(source).toContain('BACKDROP_START_DELAY_MS')
    expect(source).toContain('requestIdleCallback')
    expect(source).toMatch(
      /document\.addEventListener\(\s*['"]visibilitychange['"]/,
    )
    expect(source).toContain('document.hidden')
    expect(source).toContain('width < 760 ? 54 : 96')
  })
})
