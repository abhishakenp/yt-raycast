import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const readMarketingShellSource = () =>
  readFileSync(
    join(process.cwd(), 'src/routes/pricing/-MarketingShell.tsx'),
    'utf8',
  )

describe('MarketingShell navigation prewarm', () => {
  it('warms public internal destinations while keeping auth off the idle path', () => {
    const source = readMarketingShellSource()

    expect(source).toContain(
      "import { Link, useRouter } from '@tanstack/react-router'",
    )
    expect(source).toContain('MARKETING_SHELL_PREWARM_DELAY_MS')
    expect(source).toContain('requestIdleCallback')
    expect(source).toContain("routerRef.current.preloadRoute({ to: '/' })")
    expect(source).toMatch(
      /routerRef\.current\s*\.\s*preloadRoute\(\{ to: '\/pricing' \}\)/,
    )
    expect(source).toContain("void import('@/routes/index')")
    expect(source).toContain(
      "void import('@/features/home/components/HomePage')",
    )
    expect(source).toContain(
      "void import('@/features/gallery/components/PublicGallery')",
    )
    expect(source).toContain(
      "void import('@/features/gallery/hooks/useGalleryController').then(",
    )
    expect(source).toContain('prewarmGalleryPayload({ limit: 12 }).then(')
    expect(source).toContain('prewarmGalleryThumbnails(gallery, 12)')
    expect(source).toContain("void import('@/routes/pricing')")
    expect(source).toContain("void import('@/routes/pricing/-PricingPage')")
    expect(source).toContain('new Image()')
    expect(source).toContain(
      "homeRocket.src = '/assets/rocket-transparent.png'",
    )
    expect(source).toContain('document.fonts.load')
    expect(source).toContain('1em Archivo Black')
    expect(source).toContain('1em JetBrains Mono')
    expect(source).not.toContain('@clerk/tanstack-react-start')
    expect(source).not.toContain('@/app/providers/ClerkConvexProvider')
  })
})
