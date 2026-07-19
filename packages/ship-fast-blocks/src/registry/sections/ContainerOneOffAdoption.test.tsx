// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => vi.fn(),
}))

const { cleanup, render } = await import('@testing-library/react')
const { MarketplaceAuthors } = await import(
  './marketplace/MarketplaceAuthors.tsx'
)
const { NutritionLogos } = await import('./nutrition/NutritionLogos.tsx')
const { OnlineCourseHero } = await import(
  './online-course/OnlineCourseHero.tsx'
)
const { PlumbingHvacSteps } = await import(
  './plumbing-hvac/PlumbingHvacSteps.tsx'
)
const { SaasSteps } = await import('./saas/SaasSteps.tsx')

const oneOffSections = [
  MarketplaceAuthors,
  NutritionLogos,
  OnlineCourseHero,
  PlumbingHvacSteps,
  SaasSteps,
]

afterEach(() => {
  cleanup()
})

describe('one-off Container adoption', () => {
  it.each(oneOffSections)(
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
