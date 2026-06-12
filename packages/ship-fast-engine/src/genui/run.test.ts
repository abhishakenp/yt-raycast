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

  it('does not expose a home-only completion option', async () => {
    const source = await import('node:fs').then(({ readFileSync }) =>
      readFileSync(new URL('./run.ts', import.meta.url), 'utf8'),
    )

    expect(source).not.toContain('completeWhen')
  })
})
