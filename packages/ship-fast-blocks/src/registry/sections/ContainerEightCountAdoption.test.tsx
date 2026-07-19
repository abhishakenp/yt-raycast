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

const batchModulePaths = [
  './bootcamp/BootcampCurriculum.tsx',
  './bootcamp/BootcampFooter.tsx',
  './bootcamp/BootcampLogos.tsx',
  './bootcamp/BootcampMentors.tsx',
  './bootcamp/BootcampOutcomes.tsx',
  './bootcamp/BootcampPricing.tsx',
  './bootcamp/BootcampSteps.tsx',
  './bootcamp/BootcampTestimonials.tsx',
  './cleaning-service/CleaningServiceFooter.tsx',
  './cleaning-service/CleaningServiceGallery.tsx',
  './cleaning-service/CleaningServiceNavbar.tsx',
  './cleaning-service/CleaningServicePricing.tsx',
  './cleaning-service/CleaningServiceReviews.tsx',
  './cleaning-service/CleaningServiceServices.tsx',
  './cleaning-service/CleaningServiceStats.tsx',
  './cleaning-service/CleaningServiceSteps.tsx',
  './crm/CrmFeatures.tsx',
  './crm/CrmFooter.tsx',
  './crm/CrmIntegrations.tsx',
  './crm/CrmLogos.tsx',
  './crm/CrmPricing.tsx',
  './crm/CrmStats.tsx',
  './crm/CrmSteps.tsx',
  './crm/CrmTestimonials.tsx',
  './directory/DirectoryCategories.tsx',
  './directory/DirectoryFeatured.tsx',
  './directory/DirectoryFooter.tsx',
  './directory/DirectoryNavbar.tsx',
  './directory/DirectoryPricing.tsx',
  './directory/DirectoryStats.tsx',
  './directory/DirectorySteps.tsx',
  './directory/DirectoryTestimonials.tsx',
  './furniture-store/FurnitureStoreDesign.tsx',
  './furniture-store/FurnitureStoreFeatures.tsx',
  './furniture-store/FurnitureStoreFooter.tsx',
  './furniture-store/FurnitureStoreNavbar.tsx',
  './furniture-store/FurnitureStorePress.tsx',
  './furniture-store/FurnitureStoreProducts.tsx',
  './furniture-store/FurnitureStoreRooms.tsx',
  './furniture-store/FurnitureStoreTestimonials.tsx',
  './insurance/InsuranceCoverage.tsx',
  './insurance/InsuranceFooter.tsx',
  './insurance/InsuranceLogos.tsx',
  './insurance/InsuranceNavbar.tsx',
  './insurance/InsurancePricing.tsx',
  './insurance/InsuranceStats.tsx',
  './insurance/InsuranceSteps.tsx',
  './insurance/InsuranceTestimonials.tsx',
  './job-board/JobBoardCategories.tsx',
  './job-board/JobBoardFeatures.tsx',
  './job-board/JobBoardJobs.tsx',
  './job-board/JobBoardLogos.tsx',
  './job-board/JobBoardNavbar.tsx',
  './job-board/JobBoardStats.tsx',
  './job-board/JobBoardSteps.tsx',
  './job-board/JobBoardTestimonials.tsx',
  './kids-education/KidsEducationActivities.tsx',
  './kids-education/KidsEducationFooter.tsx',
  './kids-education/KidsEducationGallery.tsx',
  './kids-education/KidsEducationLogos.tsx',
  './kids-education/KidsEducationPricing.tsx',
  './kids-education/KidsEducationStats.tsx',
  './kids-education/KidsEducationSteps.tsx',
  './kids-education/KidsEducationTestimonials.tsx',
  './no-code/NoCodeFeatures.tsx',
  './no-code/NoCodeFooter.tsx',
  './no-code/NoCodeLogos.tsx',
  './no-code/NoCodePricing.tsx',
  './no-code/NoCodeStats.tsx',
  './no-code/NoCodeSteps.tsx',
  './no-code/NoCodeTemplates.tsx',
  './no-code/NoCodeTestimonials.tsx',
] as const

const moduleLoaders = import.meta.glob<ModuleWithCapsules>(
  './{bootcamp,cleaning-service,crm,directory,furniture-store,insurance,job-board,kids-education,no-code}/*.tsx',
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

describe('eight-count Container adoption', () => {
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
    ['./furniture-store/FurnitureStoreNavbar.tsx', 'FurnitureStoreNavbar'],
    ['./insurance/InsuranceNavbar.tsx', 'InsuranceNavbar'],
    ['./job-board/JobBoardNavbar.tsx', 'JobBoardNavbar'],
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
