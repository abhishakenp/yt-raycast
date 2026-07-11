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
  './cloud-infra/CloudInfraFeatures.tsx',
  './cloud-infra/CloudInfraFooter.tsx',
  './cloud-infra/CloudInfraGallery.tsx',
  './cloud-infra/CloudInfraLogos.tsx',
  './cloud-infra/CloudInfraNavbar.tsx',
  './cloud-infra/CloudInfraPricing.tsx',
  './cloud-infra/CloudInfraStats.tsx',
  './cloud-infra/CloudInfraSteps.tsx',
  './cloud-infra/CloudInfraTestimonials.tsx',
  './construction/ConstructionFooter.tsx',
  './construction/ConstructionLogos.tsx',
  './construction/ConstructionNavbar.tsx',
  './construction/ConstructionPricing.tsx',
  './construction/ConstructionProcess.tsx',
  './construction/ConstructionProjects.tsx',
  './construction/ConstructionServices.tsx',
  './construction/ConstructionStats.tsx',
  './construction/ConstructionTestimonials.tsx',
  './corporate/CorporateFooter.tsx',
  './corporate/CorporateGallery.tsx',
  './corporate/CorporateLogos.tsx',
  './corporate/CorporateNavbar.tsx',
  './corporate/CorporatePricing.tsx',
  './corporate/CorporateSolutions.tsx',
  './corporate/CorporateStats.tsx',
  './corporate/CorporateSteps.tsx',
  './corporate/CorporateTestimonials.tsx',
  './dental/DentalFooter.tsx',
  './dental/DentalGallery.tsx',
  './dental/DentalLogos.tsx',
  './dental/DentalPricing.tsx',
  './dental/DentalServices.tsx',
  './dental/DentalStats.tsx',
  './dental/DentalTeam.tsx',
  './dental/DentalTestimonials.tsx',
  './dental/DentalWhyChooseUs.tsx',
  './electronics-store/ElectronicsStoreCategories.tsx',
  './electronics-store/ElectronicsStoreDeals.tsx',
  './electronics-store/ElectronicsStoreFeatures.tsx',
  './electronics-store/ElectronicsStoreFooter.tsx',
  './electronics-store/ElectronicsStoreGallery.tsx',
  './electronics-store/ElectronicsStoreLogos.tsx',
  './electronics-store/ElectronicsStoreProducts.tsx',
  './electronics-store/ElectronicsStoreStats.tsx',
  './electronics-store/ElectronicsStoreTestimonials.tsx',
  './fashion-store/FashionStoreAbout.tsx',
  './fashion-store/FashionStoreCollections.tsx',
  './fashion-store/FashionStoreFooter.tsx',
  './fashion-store/FashionStoreLogos.tsx',
  './fashion-store/FashionStoreLookbook.tsx',
  './fashion-store/FashionStoreNavbar.tsx',
  './fashion-store/FashionStoreProducts.tsx',
  './fashion-store/FashionStoreStats.tsx',
  './fashion-store/FashionStoreTestimonials.tsx',
  './film-director/FilmDirectorFooter.tsx',
  './film-director/FilmDirectorLogos.tsx',
  './film-director/FilmDirectorNavbar.tsx',
  './film-director/FilmDirectorPricing.tsx',
  './film-director/FilmDirectorProcess.tsx',
  './film-director/FilmDirectorServices.tsx',
  './film-director/FilmDirectorStats.tsx',
  './film-director/FilmDirectorTestimonials.tsx',
  './film-director/FilmDirectorWork.tsx',
  './food-delivery/FoodDeliveryFeatures.tsx',
  './food-delivery/FoodDeliveryFooter.tsx',
  './food-delivery/FoodDeliveryHero.tsx',
  './food-delivery/FoodDeliveryLogos.tsx',
  './food-delivery/FoodDeliveryNavbar.tsx',
  './food-delivery/FoodDeliveryRestaurants.tsx',
  './food-delivery/FoodDeliveryStats.tsx',
  './food-delivery/FoodDeliverySteps.tsx',
  './food-delivery/FoodDeliveryTestimonials.tsx',
  './healthcare/HealthcareDoctors.tsx',
  './healthcare/HealthcareFooter.tsx',
  './healthcare/HealthcareInsurers.tsx',
  './healthcare/HealthcareNavbar.tsx',
  './healthcare/HealthcarePricing.tsx',
  './healthcare/HealthcareServices.tsx',
  './healthcare/HealthcareStats.tsx',
  './healthcare/HealthcareSteps.tsx',
  './healthcare/HealthcareTestimonials.tsx',
  './investing/InvestingFeatures.tsx',
  './investing/InvestingFooter.tsx',
  './investing/InvestingGallery.tsx',
  './investing/InvestingMarkets.tsx',
  './investing/InvestingNavbar.tsx',
  './investing/InvestingPricing.tsx',
  './investing/InvestingStats.tsx',
  './investing/InvestingSteps.tsx',
  './investing/InvestingTestimonials.tsx',
  './lending/LendingBenefits.tsx',
  './lending/LendingCalculator.tsx',
  './lending/LendingFooter.tsx',
  './lending/LendingLogos.tsx',
  './lending/LendingNavbar.tsx',
  './lending/LendingRates.tsx',
  './lending/LendingStats.tsx',
  './lending/LendingSteps.tsx',
  './lending/LendingTestimonials.tsx',
  './marketing-agency/MarketingAgencyCases.tsx',
  './marketing-agency/MarketingAgencyFooter.tsx',
  './marketing-agency/MarketingAgencyLogos.tsx',
  './marketing-agency/MarketingAgencyNavbar.tsx',
  './marketing-agency/MarketingAgencyPricing.tsx',
  './marketing-agency/MarketingAgencyProcess.tsx',
  './marketing-agency/MarketingAgencyServices.tsx',
  './marketing-agency/MarketingAgencyStats.tsx',
  './marketing-agency/MarketingAgencyTestimonials.tsx',
] as const

const moduleLoaders = import.meta.glob<ModuleWithCapsules>(
  './{cloud-infra,construction,corporate,dental,electronics-store,fashion-store,film-director,food-delivery,healthcare,investing,lending,marketing-agency}/*.tsx',
)

type CapsuleExport = {
  client: {
    component: (input: { props: {}; statementId: string }) => JSX.Element
    name: string
  }
}

type ModuleWithCapsules = Record<string, unknown>

const isCapsule = (value: unknown): value is CapsuleExport =>
  Boolean(
    value &&
    typeof value === 'object' &&
    'client' in value &&
    value.client &&
    typeof value.client === 'object' &&
    'component' in value.client &&
    typeof value.client.component === 'function',
  )

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

describe('nine-count Container adoption', () => {
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
    ['./cloud-infra/CloudInfraNavbar.tsx', 'CloudInfraNavbar'],
    ['./construction/ConstructionNavbar.tsx', 'ConstructionNavbar'],
    ['./corporate/CorporateNavbar.tsx', 'CorporateNavbar'],
    ['./fashion-store/FashionStoreNavbar.tsx', 'FashionStoreNavbar'],
    ['./healthcare/HealthcareNavbar.tsx', 'HealthcareNavbar'],
    ['./investing/InvestingNavbar.tsx', 'InvestingNavbar'],
    ['./lending/LendingNavbar.tsx', 'LendingNavbar'],
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
