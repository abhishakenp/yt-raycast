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

const batchModulePaths = [
  './architecture-firm/ArchitectureFirmLogos.tsx',
  './architecture-firm/ArchitectureFirmNavbar.tsx',
  './architecture-firm/ArchitectureFirmPhilosophy.tsx',
  './architecture-firm/ArchitectureFirmProcess.tsx',
  './architecture-firm/ArchitectureFirmStats.tsx',
  './architecture-firm/ArchitectureFirmTestimonials.tsx',
  './architecture-firm/ArchitectureFirmWork.tsx',
  './beauty-store/BeautyStoreBenefits.tsx',
  './beauty-store/BeautyStoreGallery.tsx',
  './beauty-store/BeautyStoreLogos.tsx',
  './beauty-store/BeautyStoreNavbar.tsx',
  './beauty-store/BeautyStoreNewsletter.tsx',
  './beauty-store/BeautyStoreProducts.tsx',
  './beauty-store/BeautyStoreTestimonials.tsx',
  './crowdfunding/CrowdfundingFeatures.tsx',
  './crowdfunding/CrowdfundingFooter.tsx',
  './crowdfunding/CrowdfundingGallery.tsx',
  './crowdfunding/CrowdfundingNavbar.tsx',
  './crowdfunding/CrowdfundingPress.tsx',
  './crowdfunding/CrowdfundingRewards.tsx',
  './crowdfunding/CrowdfundingTestimonials.tsx',
  './cybersecurity/CybersecurityFeatures.tsx',
  './cybersecurity/CybersecurityFooter.tsx',
  './cybersecurity/CybersecurityGallery.tsx',
  './cybersecurity/CybersecurityNavbar.tsx',
  './cybersecurity/CybersecurityPricing.tsx',
  './cybersecurity/CybersecuritySteps.tsx',
  './cybersecurity/CybersecurityTestimonials.tsx',
  './dating-app/DatingAppDownloadCta.tsx',
  './dating-app/DatingAppFeatures.tsx',
  './dating-app/DatingAppLogos.tsx',
  './dating-app/DatingAppPricing.tsx',
  './dating-app/DatingAppStats.tsx',
  './dating-app/DatingAppSteps.tsx',
  './dating-app/DatingAppTestimonials.tsx',
  './landscaping/LandscapingFooter.tsx',
  './landscaping/LandscapingGallery.tsx',
  './landscaping/LandscapingLogos.tsx',
  './landscaping/LandscapingNavbar.tsx',
  './landscaping/LandscapingPricing.tsx',
  './landscaping/LandscapingProcess.tsx',
  './landscaping/LandscapingServices.tsx',
  './membership-club/MembershipClubBenefits.tsx',
  './membership-club/MembershipClubGallery.tsx',
  './membership-club/MembershipClubNavbar.tsx',
  './membership-club/MembershipClubPricing.tsx',
  './membership-club/MembershipClubStats.tsx',
  './membership-club/MembershipClubSteps.tsx',
  './membership-club/MembershipClubTestimonials.tsx',
  './newsroom/NewsroomAuthors.tsx',
  './newsroom/NewsroomFeaturedStory.tsx',
  './newsroom/NewsroomFooter.tsx',
  './newsroom/NewsroomNavbar.tsx',
  './newsroom/NewsroomStoryGrid.tsx',
  './newsroom/NewsroomSubscribe.tsx',
  './newsroom/NewsroomTopics.tsx',
] as const

const moduleLoaders = import.meta.glob<ModuleWithCapsules>(
  './{architecture-firm,beauty-store,crowdfunding,cybersecurity,dating-app,landscaping,membership-club,newsroom}/*.tsx',
)

type CapsuleExport = {
  client: {
    component: (input: { props: {}; statementId: string }) => JSX.Element
    name: string
  }
}

type ModuleWithCapsules = Record<string, unknown>

function isCapsule(value: unknown): value is CapsuleExport {
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
  const modules = await Promise.all(
    batchModulePaths.map((path) => {
      const load = moduleLoaders[path]
      if (!load) throw new Error(`Missing module loader for ${path}`)
      return load()
    }),
  )
  return modules.flatMap((module) => Object.values(module).filter(isCapsule))
}

afterEach(() => {
  cleanup()
})

describe('seven-count Container adoption', () => {
  it('renders each refactored section with the shared Container slot', async () => {
    const sections = await loadSections()

    expect(sections).toHaveLength(batchModulePaths.length)

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

  it.each([
    [
      './architecture-firm/ArchitectureFirmNavbar.tsx',
      'ArchitectureFirmNavbar',
    ],
    ['./crowdfunding/CrowdfundingNavbar.tsx', 'CrowdfundingNavbar'],
    ['./cybersecurity/CybersecurityNavbar.tsx', 'CybersecurityNavbar'],
    ['./membership-club/MembershipClubNavbar.tsx', 'MembershipClubNavbar'],
  ] as const)(
    'keeps %s semantic as a nav element',
    async (path, exportName) => {
      const load = moduleLoaders[path]
      if (!load) throw new Error(`Missing module loader for ${path}`)

      const module = await load()
      const section = module[exportName]

      if (!isCapsule(section)) throw new Error(`${exportName} is not a capsule`)

      const SectionProbe = () =>
        section.client.component({
          props: {},
          statementId: `${section.client.name}_test`,
        })

      const { container } = render(<SectionProbe />)

      expect(container.querySelector('[data-slot="container"]')?.tagName).toBe(
        'NAV',
      )
    },
  )
})
