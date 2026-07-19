// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'

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
  const keyedMutation = Object.assign(
    vi.fn(async () => []),
    {
      isPending: vi.fn(() => false),
      lastError: vi.fn(() => null),
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
      useQuery: () => null,
    })),
    useKeyedLakebedMutation: () => keyedMutation,
  }
})

const { cleanup, render } = await import('@testing-library/react')
const { EcommerceGallery } = await import('./ecommerce/EcommerceGallery.tsx')
const { EcommerceLogos } = await import('./ecommerce/EcommerceLogos.tsx')
const { EventPlannerLogos } =
  await import('./event-planner/EventPlannerLogos.tsx')
const { EventPlannerNavbar } =
  await import('./event-planner/EventPlannerNavbar.tsx')
const { FintechFeatures } = await import('./fintech/FintechFeatures.tsx')
const { FintechLogos } = await import('./fintech/FintechLogos.tsx')
const { IllustratorLogos } = await import('./illustrator/IllustratorLogos.tsx')
const { IllustratorNavbar } =
  await import('./illustrator/IllustratorNavbar.tsx')
const { InteriorDesignLogos } =
  await import('./interior-design/InteriorDesignLogos.tsx')
const { InteriorDesignNavbar } =
  await import('./interior-design/InteriorDesignNavbar.tsx')

const twoMatchSections = [
  EcommerceGallery,
  EcommerceLogos,
  EventPlannerLogos,
  EventPlannerNavbar,
  FintechFeatures,
  FintechLogos,
  IllustratorLogos,
  IllustratorNavbar,
  InteriorDesignLogos,
  InteriorDesignNavbar,
]

afterEach(() => {
  cleanup()
})

describe('two-match Container adoption', () => {
  it.each(twoMatchSections)(
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

  it('keeps the illustrator navbar wrapper semantic as a nav element', () => {
    const SectionProbe = () =>
      IllustratorNavbar.client.component({
        props: {},
        statementId: 'IllustratorNavbar_test',
      })

    const { container } = render(<SectionProbe />)

    expect(container.querySelector('[data-slot="container"]')?.tagName).toBe(
      'NAV',
    )
  })
})
