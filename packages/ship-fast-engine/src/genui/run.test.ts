import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  generateText: vi.fn(),
}))

vi.mock('../generate.ts', () => ({
  formatLlmFailureMessage: (error: unknown) => String(error),
  generateText: mocks.generateText,
  isHardLlmFailure: () => false,
}))

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

const longCopy =
  'FastCo turns operational data into launch-ready growth systems for product teams. '.repeat(
    18,
  )

const homeModule = `home = SaasKimiPage("FastCo", ["Home", "Features"], { hero: { badge: "Fast preview", title: "${longCopy}", subtitle: "${longCopy}", cta: "Ship now" }, features: [{ title: "Instant direction", body: "${longCopy}" }, { title: "Polished defaults", body: "${longCopy}" }] })`

const secondaryModule = `p1 = SaasKimiPage2("FastCo", ["Home", "Features"], { hero: { title: "${longCopy}", subtitle: "${longCopy}" } })`

describe('runHomepageOrchestrator multi-page generation', () => {
  beforeEach(() => {
    vi.resetModules()
    mocks.generateText.mockReset()
  })

  it('waits for secondary page modules so the final source is a complete site', async () => {
    const { runHomepageOrchestrator } = await import('./run.ts')
    const events: string[] = []

    mocks.generateText.mockImplementation(async (_modelId, _system, user) => {
      if (!String(user).includes('This page:')) {
        return JSON.stringify({
          brand: 'FastCo',
          tagline: 'FastCo launches previews quickly.',
          theme: 'bold-tech',
          locale: 'en',
          pages: [
            {
              label: 'Home',
              brief: 'Primary landing page',
              blocks: ['SaasKimiPage'],
            },
            {
              label: 'Features',
              brief: 'Secondary feature details',
              blocks: ['SaasKimiPage2'],
            },
          ],
        })
      }

      if (String(user).includes('This page: "Home"')) {
        return homeModule
      }

      await delay(80)
      return secondaryModule
    })

    const startedAt = Date.now()
    const result = await runHomepageOrchestrator({
      prompt: 'Build a SaaS landing page for FastCo',
      onEvent: (event) => events.push(event.type),
    })
    const elapsed = Date.now() - startedAt

    expect(elapsed).toBeGreaterThanOrEqual(70)
    expect(result.source).toContain('home = SaasKimiPage')
    expect(result.source).toContain('p1 = SaasKimiPage2')
    expect(events).toContain('done')
  })

  it('carries the enforced preferred language into page content prompts', async () => {
    const { runHomepageOrchestrator } = await import('./run.ts')
    const pagePrompts: string[] = []

    mocks.generateText.mockImplementation(async (_modelId, _system, user) => {
      const userPrompt = String(user)
      if (!userPrompt.includes('This page:')) {
        return JSON.stringify({
          brand: 'Kaveri Meals',
          tagline: 'Fresh meals for local families.',
          theme: 'bold-tech',
          locale: 'ta-en',
          pages: [
            {
              label: 'Home',
              brief: 'Primary landing page',
              blocks: ['SaasKimiPage'],
            },
          ],
        })
      }

      pagePrompts.push(userPrompt)
      return homeModule.replaceAll('FastCo', 'Kaveri Meals')
    })

    const result = await runHomepageOrchestrator({
      prompt: 'Build a food delivery landing page',
      preferredLanguage: 'ta-en',
    })

    expect(result.locale).toBe('ta-en')
    expect(pagePrompts).toHaveLength(1)
    expect(pagePrompts[0]).toContain('server language code `ta-en`')
    expect(pagePrompts[0]).toContain('natural Tamil + English mix')
  })

  it('preserves planner locale variants for code-mixed languages', async () => {
    const { runHomepageOrchestrator } = await import('./run.ts')

    mocks.generateText.mockImplementation(async (_modelId, _system, user) => {
      if (!String(user).includes('This page:')) {
        return JSON.stringify({
          brand: 'Kaveri Meals',
          tagline: 'Fresh meals for local families.',
          theme: 'bold-tech',
          locale: 'ta-en',
          pages: [
            {
              label: 'Home',
              brief: 'Primary landing page',
              blocks: ['SaasKimiPage'],
            },
          ],
        })
      }

      return homeModule.replaceAll('FastCo', 'Kaveri Meals')
    })

    const result = await runHomepageOrchestrator({
      prompt: 'Build a landing page for Kaveri Meals',
    })

    expect(result.locale).toBe('ta-en')
  })

  it('repairs top-level named section args before merging page modules', async () => {
    const { runHomepageOrchestrator } = await import('./run.ts')
    const malformedHome = `home = TourExperiencesKimiPage("Kerala Tourism", ["Home", "Destinations"], {badge: "1500+ experiences", heading: "Kerala journeys", subheading: "${longCopy}", searchPlaceholder: "Search Kerala", searchCta: "Search", destinations: [{name: "Alappuzha", count: "120 experiences", imageAlt: "Alappuzha backwater houseboat"}]},press: {label: "Featured In", logos: ["The Hindu", "Lonely Planet"]},features: {heading: "Why Kerala", description: "${longCopy}", items: [{title: "Backwaters", description: "${longCopy}"}]},experiences: {heading: "Popular Kerala experiences", description: "${longCopy}", viewAll: "View all", loadMore: "More", items: [{title: "Alappuzha backwater cruise", category: "Backwaters", location: "Alappuzha", rating: "4.9", reviews: "120 reviews", price: "₹2500", duration: "2 hours", imageAlt: "Kerala backwater cruise"}]},steps: {heading: "Book easily", description: "${longCopy}", items: [{title: "Discover", description: "${longCopy}"}]},stats: {items: [{value: "1500+", label: "Experiences"}]},reviews: {heading: "Traveler stories", description: "${longCopy}", items: [{quote: "Beautiful trip", name: "Anjali", meta: "Kochi", avatarAlt: "Anjali portrait"}]},faq: {heading: "Questions", description: "${longCopy}", items: [{question: "Can I cancel?", answer: "Yes"}]},cta: {heading: "Ready for Kerala?", description: "${longCopy}", primaryCta: "Book", secondaryCta: "Explore", note: "Local support"},footer: {description: "${longCopy}", columns: [{title: "Company", links: ["About"]}], copyright: "© 2026 Kerala Tourism", legal: ["Privacy"], socials: ["Instagram"]}})`

    mocks.generateText.mockImplementation(async (_modelId, _system, user) => {
      if (!String(user).includes('This page:')) {
        return JSON.stringify({
          brand: 'Kerala Tourism',
          tagline: 'Kerala journeys for domestic travelers.',
          theme: 'sunset-horizon',
          locale: 'en',
          pages: [
            {
              label: 'Home',
              brief: 'Malayalam travel landing page',
              blocks: ['TourExperiencesKimiPage'],
            },
          ],
        })
      }

      return malformedHome
    })

    const result = await runHomepageOrchestrator({
      prompt: 'Build a Kerala tourism site',
    })

    expect(result.source).toContain('home = TourExperiencesKimiPage')
    expect(result.source).not.toContain(',press:')
    expect(result.source).not.toContain(',features:')
    expect(result.source).toContain('"Popular Kerala experiences"')
  })

  it('filters subpage blocks out of the home candidate shortlist', async () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)
    const { runHomepageOrchestrator } = await import('./run.ts')
    const pagePrompts: string[] = []

    try {
      mocks.generateText.mockImplementation(async (_modelId, _system, user) => {
        const userPrompt = String(user)
        if (!userPrompt.includes('This page:')) {
          return JSON.stringify({
            brand: 'WaterWorks',
            tagline: 'WaterWorks helps residents manage water services.',
            theme: 'clean-slate',
            locale: 'en',
            pages: [
              {
                label: 'Home',
                brief: 'Primary utility landing page',
                blocks: ['TestimonialsKimiPage', 'CorporateKimiPage'],
              },
            ],
          })
        }

        pagePrompts.push(userPrompt)
        return `home = CorporateKimiPage("WaterWorks", ["Home"], {heading: "${longCopy}", subheading: "${longCopy}", primaryCta: "Pay bill", secondaryCta: "Report outage"})`
      })

      const result = await runHomepageOrchestrator({
        prompt: 'Build a water utility homepage for WaterWorks',
      })

      expect(pagePrompts[0]).toContain('home = CorporateKimiPage')
      expect(pagePrompts[0]).not.toContain('home = TestimonialsKimiPage')
      expect(result.source).toContain('home = CorporateKimiPage')
    } finally {
      randomSpy.mockRestore()
    }
  })

  it('does not expose a home-only completion option', async () => {
    const source = await import('node:fs').then(({ readFileSync }) =>
      readFileSync(new URL('./run.ts', import.meta.url), 'utf8'),
    )

    expect(source).not.toContain('completeWhen')
  })
})
