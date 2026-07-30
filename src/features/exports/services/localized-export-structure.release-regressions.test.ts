import { beforeAll, describe, expect, it } from 'vitest'

import { buildOpenUIArtifactFiles } from './openui-artifact-files'

type BrowserExportTarget = 'next' | 'react'

const targets: BrowserExportTarget[] = ['react', 'next']
const localizedBakerySource = `home_navbar = Navbar({"brand":"स्वीट क्रम्ब बेकरी","links":["होम","मेनू"],"cta":"अभी ऑर्डर करें"})
home_navbar_anchor = SectionAnchor("होम_नेविगेशन", home_navbar, "स्क्रोल-एमटी-28")
menu_menu = ProductGrid({"heading":"दैनिक मेनू","products":[{"नाम":"खट्टी रोटी","imageAlt":"धीमी आंच पर पकी कारीगर रोटी","मूल्य":"₹250"}]})
menu_menu_anchor = SectionAnchor("मेनू_मेनू", menu_menu, "स्क्रोल-एमटी-28")
home = Stack([home_navbar_anchor])
menu = Stack([menu_menu_anchor])
root = PageSwitch(["होम","मेनू"], [home,menu], "", {"होम":"Home","मेनू":"Menu"})`

let artifacts: Record<BrowserExportTarget, Record<string, string>>

async function buildTargetArtifact(target: BrowserExportTarget) {
  const result = await buildOpenUIArtifactFiles({
    locale: 'hi',
    sessionId: `localized-structure-${target}`,
    siteSpecJson: JSON.stringify({
      locale: 'hi',
      projectName: 'स्वीट क्रम्ब बेकरी',
    }),
    source: localizedBakerySource,
    target,
  })
  return result.files
}

beforeAll(async () => {
  const [react, next] = await Promise.all([
    buildTargetArtifact('react'),
    buildTargetArtifact('next'),
  ])
  artifacts = { next, react }
}, 180_000)

describe('localized export structural invariants', () => {
  it.each(targets)(
    '%s translates visible values without translating schema keys',
    (target) => {
      const pages = Object.values(artifacts[target]).join('\n')

      expect(pages).not.toMatch(/["']?(?:नाम|मूल्य)["']?\s*:/)
      expect(pages).toMatch(/\bname:\s*['"]खट्टी रोटी['"]/)
      expect(pages).toMatch(/\bprice:\s*['"]₹250['"]/)
    },
  )

  it.each(targets)(
    '%s keeps SectionAnchor IDs and CSS classes canonical',
    (target) => {
      const pages = Object.values(artifacts[target]).join('\n')

      expect(pages).not.toMatch(
        /(?:id|className):\s*['"][^'"]*[\u0900-\u097f][^'"]*['"]/,
      )
      expect(pages).toMatch(/home_navbar/)
      expect(pages).toMatch(/menu_menu/)
      expect(pages).toMatch(/scroll-mt-28/)
    },
  )

  it.each(targets)(
    '%s keeps translated route labels on canonical component identities',
    (target) => {
      const files = artifacts[target]
      const paths = Object.keys(files)

      expect(files['src/components/HomePage.tsx']).toBeDefined()
      expect(Object.keys(files).some((path) => /Page\.tsx$/.test(path))).toBe(
        true,
      )
      expect(paths.filter((path) => /[\u0900-\u097f]/.test(path))).toEqual([])
      expect(paths.filter((path) => /\/_+Page\.tsx$/.test(path))).toEqual([])
    },
  )

  it.each(targets)(
    '%s keeps translated route labels on canonical URL paths',
    (target) => {
      const files = artifacts[target]
      const pages = Object.values(files).join('\n')

      expect(pages).toMatch(/label:\s*['"]होम['"]/)
      expect(pages).toMatch(/label:\s*['"]मेनू['"]/)
      expect(pages).toMatch(/Page_2|page-2/)

      if (target === 'next') {
        expect(files['app/page.tsx']).toBeDefined()
        expect(files['app/page-2/page.tsx']).toBeDefined()
        expect(files['app/page/page.tsx']).toBeUndefined()
      }
    },
  )
})
