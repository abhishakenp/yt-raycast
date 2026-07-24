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
    useKeyedLakebedMutation: () => keyedMutation,
  }
})

const { cleanup, render } = await import('@testing-library/react')

const batchModulePaths = [
  './fitness/FitnessClasses.tsx',
  './fitness/FitnessFooter.tsx',
  './fitness/FitnessGallery.tsx',
  './fitness/FitnessHero.tsx',
  './fitness/FitnessLogos.tsx',
  './fitness/FitnessNavbar.tsx',
  './fitness/FitnessPricing.tsx',
  './fitness/FitnessSchedule.tsx',
  './fitness/FitnessStats.tsx',
  './fitness/FitnessTestimonials.tsx',
  './fitness/FitnessTrainers.tsx',
  './law-firm/LawFirmAttorneys.tsx',
  './law-firm/LawFirmContact.tsx',
  './law-firm/LawFirmFooter.tsx',
  './law-firm/LawFirmHero.tsx',
  './law-firm/LawFirmLogos.tsx',
  './law-firm/LawFirmNavbar.tsx',
  './law-firm/LawFirmPracticeAreas.tsx',
  './law-firm/LawFirmProcess.tsx',
  './law-firm/LawFirmStats.tsx',
  './law-firm/LawFirmTestimonials.tsx',
  './logistics/LogisticsFooter.tsx',
  './logistics/LogisticsGallery.tsx',
  './logistics/LogisticsHero.tsx',
  './logistics/LogisticsLogos.tsx',
  './logistics/LogisticsNavbar.tsx',
  './logistics/LogisticsPricing.tsx',
  './logistics/LogisticsProcess.tsx',
  './logistics/LogisticsServices.tsx',
  './logistics/LogisticsStats.tsx',
  './logistics/LogisticsTestimonials.tsx',
  './manufacturing/ManufacturingCapabilities.tsx',
  './manufacturing/ManufacturingFooter.tsx',
  './manufacturing/ManufacturingGallery.tsx',
  './manufacturing/ManufacturingIndustries.tsx',
  './manufacturing/ManufacturingLogos.tsx',
  './manufacturing/ManufacturingNavbar.tsx',
  './manufacturing/ManufacturingPricing.tsx',
  './manufacturing/ManufacturingProcess.tsx',
  './manufacturing/ManufacturingStats.tsx',
  './manufacturing/ManufacturingTestimonials.tsx',
  './mobile-app/MobileAppFeatures.tsx',
  './mobile-app/MobileAppFooter.tsx',
  './mobile-app/MobileAppGallery.tsx',
  './mobile-app/MobileAppHero.tsx',
  './mobile-app/MobileAppHowItWorks.tsx',
  './mobile-app/MobileAppLogos.tsx',
  './mobile-app/MobileAppNavbar.tsx',
  './mobile-app/MobileAppPricing.tsx',
  './mobile-app/MobileAppStats.tsx',
  './mobile-app/MobileAppTestimonials.tsx',
  './music-festival/MusicFestivalExperience.tsx',
  './music-festival/MusicFestivalFooter.tsx',
  './music-festival/MusicFestivalGallery.tsx',
  './music-festival/MusicFestivalHero.tsx',
  './music-festival/MusicFestivalLineup.tsx',
  './music-festival/MusicFestivalLogos.tsx',
  './music-festival/MusicFestivalSchedule.tsx',
  './music-festival/MusicFestivalStats.tsx',
  './music-festival/MusicFestivalTestimonials.tsx',
  './music-festival/MusicFestivalTickets.tsx',
] as const

const moduleLoaders = import.meta.glob<ModuleWithCapsules>(
  './{fitness,law-firm,logistics,manufacturing,mobile-app,music-festival}/*.tsx',
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

describe('final Container adoption batch', () => {
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
    ['./law-firm/LawFirmNavbar.tsx', 'LawFirmNavbar'],
    ['./manufacturing/ManufacturingNavbar.tsx', 'ManufacturingNavbar'],
    ['./mobile-app/MobileAppNavbar.tsx', 'MobileAppNavbar'],
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
