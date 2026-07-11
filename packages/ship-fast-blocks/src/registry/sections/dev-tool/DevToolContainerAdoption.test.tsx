// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('@ship-fast/lakebed/react', () => {
  const mutation = Object.assign(
    vi.fn(async () => []),
    {
      isPending: false,
      lastError: null,
      pendingCount: 0,
      reset: vi.fn(),
    },
  )

  return {
    createLakebedClient: vi.fn(() => ({
      signInWithGoogle: vi.fn(async () => ({
        bundle: { challenge: '', state: '', verifier: '' },
        url: '',
      })),
      signOut: vi.fn(),
      useAuth: () => ({
        displayName: 'Guest',
        isAuthenticated: false,
        isGuest: true,
        provider: 'guest',
        user: {
          displayName: 'Guest',
          id: 'guest:local',
          isGuest: true,
          provider: 'guest',
          userId: 'guest:local',
        },
        userId: 'guest:local',
      }),
      useData: () => ({}),
      useMutation: () => mutation,
      useQuery: (name: string) => {
        if (name === 'authSessionSummary') {
          return { count: 0, lastSession: null, sessions: [] }
        }
        if (name === 'planCatalog') return []
        return null
      },
    })),
  }
})

const { cleanup, render } = await import('@testing-library/react')
const { DevToolFeatures } = await import('./DevToolFeatures.tsx')
const { DevToolFooter } = await import('./DevToolFooter.tsx')
const { DevToolGallery } = await import('./DevToolGallery.tsx')
const { DevToolLogos } = await import('./DevToolLogos.tsx')
const { DevToolNavbar } = await import('./DevToolNavbar.tsx')
const { DevToolPricing } = await import('./DevToolPricing.tsx')
const { DevToolStats } = await import('./DevToolStats.tsx')
const { DevToolSteps } = await import('./DevToolSteps.tsx')
const { DevToolTestimonials } = await import('./DevToolTestimonials.tsx')

const devToolSections = [
  DevToolFeatures,
  DevToolFooter,
  DevToolGallery,
  DevToolLogos,
  DevToolNavbar,
  DevToolPricing,
  DevToolStats,
  DevToolSteps,
  DevToolTestimonials,
]

afterEach(() => {
  cleanup()
})

describe('dev-tool Container adoption', () => {
  it.each(devToolSections)(
    'renders %s with the shared Container slot',
    (section) => {
      const SectionProbe = () =>
        section.client.component({
          props: {},
          statementId: `${section.client.name}_test`,
        })

      const { container } = render(<SectionProbe />)

      const wrapper = container.querySelector('[data-slot="container"]')

      expect(wrapper).not.toBeNull()
      expect(wrapper?.className).toContain('mx-auto')
      expect(wrapper?.className).toContain('max-w-7xl')
      expect(wrapper?.className).toContain('px-4')
      expect(wrapper?.className).toContain('sm:px-6')
      expect(wrapper?.className).toContain('lg:px-8')
    },
  )
})
