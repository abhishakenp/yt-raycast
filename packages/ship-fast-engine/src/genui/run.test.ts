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

  it('does not expose a home-only completion option', async () => {
    const source = await import('node:fs').then(({ readFileSync }) =>
      readFileSync(new URL('./run.ts', import.meta.url), 'utf8'),
    )

    expect(source).not.toContain('completeWhen')
  })
})
