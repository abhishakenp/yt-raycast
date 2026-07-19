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

const moduleLoaders = [
  () => import('./auto-dealership/AutoDealershipFeatures.tsx'),
  () => import('./auto-dealership/AutoDealershipFinancing.tsx'),
  () => import('./auto-dealership/AutoDealershipInventory.tsx'),
  () => import('./auto-dealership/AutoDealershipNavbar.tsx'),
  () => import('./auto-dealership/AutoDealershipStats.tsx'),
  () => import('./bakery/BakeryFeatures.tsx'),
  () => import('./bakery/BakeryGallery.tsx'),
  () => import('./bakery/BakeryLogos.tsx'),
  () => import('./bakery/BakeryMenu.tsx'),
  () => import('./bakery/BakeryNavbar.tsx'),
  () => import('./bakery/BakerySteps.tsx'),
  () => import('./bar-nightclub/BarNightclubEvents.tsx'),
  () => import('./bar-nightclub/BarNightclubFeatures.tsx'),
  () => import('./bar-nightclub/BarNightclubGallery.tsx'),
  () => import('./bar-nightclub/BarNightclubMenu.tsx'),
  () => import('./bar-nightclub/BarNightclubNavbar.tsx'),
  () => import('./bar-nightclub/BarNightclubSteps.tsx'),
  () => import('./consulting/ConsultingCaseStudies.tsx'),
  () => import('./consulting/ConsultingLogos.tsx'),
  () => import('./consulting/ConsultingPricing.tsx'),
  () => import('./consulting/ConsultingProcess.tsx'),
  () => import('./consulting/ConsultingServices.tsx'),
  () => import('./coworking/CoworkingCta.tsx'),
  () => import('./coworking/CoworkingFeatures.tsx'),
  () => import('./coworking/CoworkingGallery.tsx'),
  () => import('./coworking/CoworkingPricing.tsx'),
  () => import('./coworking/CoworkingTestimonials.tsx'),
  () => import('./crypto/CryptoFeatures.tsx'),
  () => import('./crypto/CryptoNavbar.tsx'),
  () => import('./crypto/CryptoNetworkStats.tsx'),
  () => import('./crypto/CryptoRoadmap.tsx'),
  () => import('./crypto/CryptoSteps.tsx'),
  () => import('./crypto/CryptoTestimonials.tsx'),
]

function isCapsule(value: unknown): value is {
  client: {
    component: (input: { props: {}; statementId: string }) => JSX.Element
    name: string
  }
} {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'client' in value &&
    value.client &&
    typeof value.client === 'object' &&
    'component' in value.client &&
    typeof value.client.component === 'function',
  )
}

const loadSections = async () => {
  const modules = await Promise.all(moduleLoaders.map((load) => load()))
  return modules.flatMap((module) => Object.values(module).filter(isCapsule))
}

afterEach(() => {
  cleanup()
})

describe('mid-count Container adoption', () => {
  it('renders each refactored section with the shared Container slot', async () => {
    const sections = await loadSections()

    expect(sections).toHaveLength(moduleLoaders.length)

    for (const section of sections) {
      const SectionProbe = () =>
        section.client.component({
          props: {},
          statementId: `${section.client.name}_test`,
        })

      const { container } = render(<SectionProbe />)

      const wrapper = container.querySelector('[data-slot="container"]')

      expect(wrapper, section.client.name).not.toBeNull()
      expect(wrapper?.className, section.client.name).toContain('mx-auto')
      expect(wrapper?.className, section.client.name).toContain('max-w-7xl')
      expect(wrapper?.className, section.client.name).toContain('px-4')
      expect(wrapper?.className, section.client.name).toContain('sm:px-6')
      expect(wrapper?.className, section.client.name).toContain('lg:px-8')
      cleanup()
    }
  })

  it('keeps the auto-dealership navbar wrapper semantic as a nav element', async () => {
    const { AutoDealershipNavbar } =
      await import('./auto-dealership/AutoDealershipNavbar.tsx')
    const SectionProbe = () =>
      AutoDealershipNavbar.client.component({
        props: {},
        statementId: 'AutoDealershipNavbar_test',
      })

    const { container } = render(<SectionProbe />)

    expect(container.querySelector('[data-slot="container"]')?.tagName).toBe(
      'NAV',
    )
  })
})
