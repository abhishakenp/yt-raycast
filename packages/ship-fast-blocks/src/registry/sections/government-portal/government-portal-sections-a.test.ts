import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'

const DIR = dirname(fileURLToPath(import.meta.url))
const read = (file: string) => readFileSync(join(DIR, file), 'utf8')
const importFrom = (source: string) =>
  new RegExp(`from ['"]${source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`)

// The five SPINE sections of the classic Indian-government / PSU portal family
// (the "TVNL" look) built in batch A: Navbar, Hero, Services, Stats, Footer.
// Source-level invariants guard against regression of the defineComponent
// contract, retrieval-rich gov descriptions, and the family color tokens.
const SECTIONS = [
  { file: 'GovernmentPortalNavbar.tsx', name: 'GovernmentPortalNavbar' },
  { file: 'GovernmentPortalHero.tsx', name: 'GovernmentPortalHero' },
  { file: 'GovernmentPortalServices.tsx', name: 'GovernmentPortalServices' },
  { file: 'GovernmentPortalStats.tsx', name: 'GovernmentPortalStats' },
  { file: 'GovernmentPortalFooter.tsx', name: 'GovernmentPortalFooter' },
] as const

// Royal-blue mega-nav token is shared across the whole family, so every spine
// section is expected to carry it. The light-blue utility bar and indigo footer
// tokens live in the chrome sections (Navbar / Footer) — asserted family-wide.
const NAV_BLUE = '#3346B5'
const TOPBAR_BLUE = '#0792D0'
const FOOTER_INDIGO = '#4B57A0'

describe('government-portal sections (batch A — spine)', () => {
  for (const { file, name } of SECTIONS) {
    describe(name, () => {
      const src = read(file)

      it('uses defineComponent with the correct name', () => {
        expect(src).toMatch(importFrom('@openuidev/react-lang'))
        expect(src).toContain('defineComponent({')
        expect(src).toMatch(new RegExp(`name:\\s*['"]${name}['"],`))
        expect(src).toContain(`export const ${name} = defineComponent`)
      })

      it('has a retrieval-rich classic-gov description with tender/psu terms', () => {
        const lower = src.toLowerCase()
        expect(lower).toContain('government')
        // classic Indian-gov / public-sector retrieval anchors
        expect(lower).toMatch(/tender|psu/)
        expect(lower).toContain('public sector')
        expect(lower).toContain('classic')
        expect(lower).toContain('portal')
      })

      it('carries at least one signature classic-gov chrome token', () => {
        // Each spine section is styled in the TVNL palette: the light-blue
        // utility bar (#0792D0), the royal-blue mega-nav (#3346B5), or the
        // indigo footer (#4B57A0). Not every section uses all three, but every
        // one must carry at least one of the family hexes.
        expect(
          src.includes(TOPBAR_BLUE) ||
            src.includes(NAV_BLUE) ||
            src.includes(FOOTER_INDIGO),
        ).toBe(true)
      })

      it('bans `as any` casts', () => {
        expect(src).not.toMatch(/as any/)
      })
    })
  }

  it('the family carries all three classic-gov chrome tokens', () => {
    const all = SECTIONS.map(({ file }) => read(file)).join('\n')
    // light-blue utility bar (#0792D0), royal-blue mega-nav (#3346B5),
    // indigo footer (#4B57A0) — the three signature TVNL gov-portal hexes.
    for (const token of [TOPBAR_BLUE, NAV_BLUE, FOOTER_INDIGO]) {
      expect(all).toContain(token)
    }
  })

  it('Navbar is a three-tier header with topbar + mega-nav tokens', () => {
    const src = read('GovernmentPortalNavbar.tsx')
    expect(src).toContain('useNavigate')
    expect(src).toContain('useState') // hover dropdowns
    expect(src).toContain(TOPBAR_BLUE)
    expect(src).toContain(NAV_BLUE)
  })

  it('Navbar accepts flat string nav labels from composed generation', () => {
    const src = read('GovernmentPortalNavbar.tsx')
    expect(src).toContain('type RawNavItem = string | NavItem')
    expect(src).toContain('z.union([')
    expect(src).toContain('props.nav.map(normalizeNavItem)')
  })

  it('Hero is an auto-advancing carousel with a notice ticker', () => {
    const src = read('GovernmentPortalHero.tsx')
    expect(src).toContain('useEffect')
    expect(src).toContain('setInterval')
    expect(src).toMatch(importFrom('#/lib/img.tsx'))
    expect(src.toLowerCase()).toContain('ticker')
  })

  it('Services renders the four colored dept quick-link cards', () => {
    const src = read('GovernmentPortalServices.tsx')
    for (const color of ['#74C7A1', '#E2CA96', '#E6AD97', '#94BEE0']) {
      expect(src).toContain(color)
    }
    expect(src).toMatch(/title:\s*['"]Power Generation['"]/)
  })

  it('Stats is a formal key-figures strip on the gov-blue band', () => {
    const src = read('GovernmentPortalStats.tsx')
    expect(src).toContain(NAV_BLUE)
    expect(src).toContain('Installed Capacity')
    // The inline <dl> was removed when Stats was migrated to compose the
    // section-kit StatGrid composite, which now renders the figure cells.
    expect(src).toContain('section-kit/StatGrid.tsx')
  })

  it('Footer is the indigo gov footer with columns + important links', () => {
    const src = read('GovernmentPortalFooter.tsx')
    expect(src).toContain(FOOTER_INDIGO)
    expect(src).toContain('useNavigate')
    expect(src).toContain('importantLinks')
    expect(src).toContain('getFullYear')
  })

  it('spine sections compose section-kit composites', () => {
    expect(read('GovernmentPortalNavbar.tsx')).toMatch(
      importFrom('#/section-kit/SiteNav.tsx'),
    )
    expect(read('GovernmentPortalFooter.tsx')).toMatch(
      importFrom('#/section-kit/SiteFooter.tsx'),
    )
    expect(read('GovernmentPortalStats.tsx')).toMatch(
      importFrom('#/section-kit/StatGrid.tsx'),
    )
    expect(read('GovernmentPortalServices.tsx')).toMatch(
      importFrom('#/section-kit/SectionHeading.tsx'),
    )
  })

  it('imports kit composites directly, not via the barrel', () => {
    for (const { file } of SECTIONS) {
      const src = read(file)
      expect(src).not.toMatch(/from ["']#\/section-kit["']/) // no bare-dir barrel import
      expect(src).not.toMatch(/from ["']#\/section-kit\/index/) // no explicit index import
    }
  })
})
