import { describe, expect, it } from 'vitest'

import { preprocessOpenUIRuntimeResponse } from './openui-runtime-preprocess'

describe('preprocessOpenUIRuntimeResponse', () => {
  it('repairs streaming syntax without resolving spec-aware section labels', () => {
    const source = [
      '```openui',
      'hero = Hero("Ship Fast", [Image("https://images.example.com/',
      'root = Page([hero, Action("click")',
    ].join('\n')

    const result = preprocessOpenUIRuntimeResponse(source)

    expect(result).not.toContain('```')
    expect(result).not.toContain('Action(')
    expect(result).toContain('hero = Hero(')
    expect(result).toContain('root = Page(')
    expect(result).toContain('Image("https://images.example.com/")')
  })

  it('repairs malformed quoted object keys before runtime parsing', () => {
    const source =
      'root = SaasHero("StrideFit", ["Home"], {items:[{"name":"Darius K.", tag:"Verified Buyer"},{"name:"Maya S.", tag:"Verified Buyer"}]})'

    const result = preprocessOpenUIRuntimeResponse(source)

    expect(result).toContain('{"name":"Darius K."')
    expect(result).toContain('{"name":"Maya S."')
    expect(result).not.toContain('{"name:"Maya S."')
  })

  it('repairs object boundaries before trailing null arguments', () => {
    const source =
      'root = ProductDetailHero("StrideFit", ["Home"], ["Home"], {}, {}, {}, {}, {footer:{note:"Done"}, null)'

    const result = preprocessOpenUIRuntimeResponse(source)

    expect(result).toContain('{"footer":{"note":"Done"}}, null)')
    expect(result).not.toContain('{"footer":{"note":"Done"}, null)')
  })

  // Mirrors the server preprocess: full-bleed section bands own their padding,
  // so the page-root Stack that stacks them renders gapless (default gap-4 shows
  // the page bg as black slivers). Fixes existing persisted programs on render.
  describe('gapless section-band stack', () => {
    it('forces gap="none" on a Stack whose children are all SectionAnchors', () => {
      const source = [
        'nav = CafeNavbar("Acme")',
        'nav_anchor = SectionAnchor("nav", nav)',
        'hero = CafeHero("Welcome")',
        'hero_anchor = SectionAnchor("hero", hero, "scroll-mt-28")',
        'home = Stack([nav_anchor, hero_anchor])',
        'root = PageSwitch(["Home"], [home])',
      ].join('\n')
      const result = preprocessOpenUIRuntimeResponse(source)
      expect(result).toContain(
        'home = Stack([nav_anchor, hero_anchor], "col", "none")',
      )
    })

    it('leaves freeform-app / inner content stacks untouched', () => {
      const source = [
        'status = StateText("on", false, "Status: ")',
        'toggle = StateButton("Toggle", "on", "toggle")',
        'root = Stack([status, toggle])',
      ].join('\n')
      const result = preprocessOpenUIRuntimeResponse(source)
      expect(result).toContain('root = Stack([status, toggle])')
      expect(result).not.toContain('"col", "none"')
    })
  })

  describe('fixSubPageHeroStacks', () => {
    it('replaces hero refs in sub-page Stacks with matching home content', () => {
      const source = [
        'nav = Navbar("Brand", ["Home", "Projects"])',
        'hero = SplitHero("Title")',
        'projects = ProjectGallery("Selected Projects")',
        'newsletter = NewsletterCta("Subscribe")',
        'footer = Footer("Brand")',
        'nav_anchor = SectionAnchor("nav", nav)',
        'hero_anchor = SectionAnchor("hero", hero, "scroll-mt-28")',
        'projects_anchor = SectionAnchor("projects", projects, "scroll-mt-28")',
        'newsletter_anchor = SectionAnchor("newsletter", newsletter, "scroll-mt-28")',
        'footer_anchor = SectionAnchor("footer", footer)',
        'home = Stack([nav_anchor, hero_anchor, projects_anchor, newsletter_anchor, footer_anchor])',
        'projects_page = Stack([nav_anchor, hero_anchor, footer_anchor])',
      ].join('\n')
      const result = preprocessOpenUIRuntimeResponse(source)
      // projects_page should no longer contain hero_anchor
      const projectsLine = result
        .split('\n')
        .find((l) => l.startsWith('projects_page ='))
      expect(projectsLine).toBeTruthy()
      expect(projectsLine).not.toContain('hero_anchor')
      // It should contain projects_anchor (matched by page name)
      expect(projectsLine).toContain('projects_anchor')
    })

    it('does not modify home page Stack', () => {
      const source = [
        'nav = Navbar("Brand")',
        'hero = SplitHero("Title")',
        'content = CardGrid("Features")',
        'nav_anchor = SectionAnchor("nav", nav)',
        'hero_anchor = SectionAnchor("hero", hero, "scroll-mt-28")',
        'content_anchor = SectionAnchor("content", content, "scroll-mt-28")',
        'home = Stack([nav_anchor, hero_anchor, content_anchor])',
        'about = Stack([nav_anchor, hero_anchor, content_anchor])',
      ].join('\n')
      const result = preprocessOpenUIRuntimeResponse(source)
      const homeLine = result.split('\n').find((l) => l.startsWith('home ='))
      // Home page keeps its hero
      expect(homeLine).toContain('hero_anchor')
    })

    it('leaves single-page sources untouched', () => {
      const source = ['hero = SplitHero("Title")', 'root = Stack([hero])'].join(
        '\n',
      )
      const result = preprocessOpenUIRuntimeResponse(source)
      expect(result).toContain('root = Stack([hero])')
    })
  })

  describe('fixNavbarLinksToMatchRoutes', () => {
    it('patches Navbar links to match PageSwitch routes (deterministic)', () => {
      const source = [
        'home_navbar = Navbar("Brand", ["Home","About","Projects"])',
        'home_footer = Footer("Brand", [{"title":"Pages","links":["Home","About","Projects"]},{"title":"Social","links":["Instagram"]}], ["Instagram","LinkedIn"])',
        'home = Stack([home_navbar, home_footer])',
        'root = PageSwitch(["Home","Philosophy","Projects"], [home, about, projects], "", {"Home":"home","Philosophy":"about","Projects":"projects"})',
      ].join('\n')
      const result = preprocessOpenUIRuntimeResponse(source)
      // Navbar should use the canonical routes
      expect(result).toContain(
        'Navbar("Brand", ["Home","Philosophy","Projects"])',
      )
      // Footer columns are NOT patched — preserved as-is
      expect(result).toContain('"links":["Home","About","Projects"]')
      expect(result).toContain('"links":["Instagram"]')
      // The old "About" label should be gone from Navbar only
      const navbarLines = result
        .split('\n')
        .filter((l) => l.includes('Navbar('))
      for (const line of navbarLines) {
        expect(line).not.toContain('"About"')
      }
    })

    it('does not modify Navbar links when they already match routes', () => {
      const source = [
        'nav = Navbar("Brand", ["Home","Pricing"])',
        'home = Stack([nav])',
        'root = PageSwitch(["Home","Pricing"], [home, pricing], "", {"Home":"home","Pricing":"pricing"})',
      ].join('\n')
      const result = preprocessOpenUIRuntimeResponse(source)
      expect(result).toContain('Navbar("Brand", ["Home","Pricing"])')
    })

    it('leaves sources without PageSwitch untouched', () => {
      const source = [
        'nav = Navbar("Brand", ["Home","About"])',
        'root = Stack([nav])',
      ].join('\n')
      const result = preprocessOpenUIRuntimeResponse(source)
      expect(result).toContain('Navbar("Brand", ["Home","About"])')
    })

    it('strips targetMap from PageSwitch calls (no longer needed)', () => {
      const source = [
        'nav = Navbar("Brand", ["Home","Pricing"])',
        'home = Stack([nav])',
        'root = PageSwitch(["Home","Pricing"], [home, pricing], "", {"Home":"home","Pricing":"pricing"})',
      ].join('\n')
      const result = preprocessOpenUIRuntimeResponse(source)
      // targetMap should be stripped — PageSwitch only takes 3 args now
      expect(result).toContain(
        'PageSwitch(["Home","Pricing"], [home, pricing], "")',
      )
      expect(result).not.toContain('"Home":"home"')
    })
  })
})
