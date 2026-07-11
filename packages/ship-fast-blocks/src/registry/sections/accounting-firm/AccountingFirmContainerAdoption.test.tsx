// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => vi.fn(),
}))

const { cleanup, render } = await import('@testing-library/react')
const { AccountingFirmAbout } = await import('./AccountingFirmAbout.tsx')
const { AccountingFirmLogos } = await import('./AccountingFirmLogos.tsx')
const { AccountingFirmNavbar } = await import('./AccountingFirmNavbar.tsx')
const { AccountingFirmProcess } = await import('./AccountingFirmProcess.tsx')
const { AccountingFirmServices } = await import('./AccountingFirmServices.tsx')
const { AccountingFirmTeam } = await import('./AccountingFirmTeam.tsx')

const accountingFirmSections = [
  AccountingFirmAbout,
  AccountingFirmLogos,
  AccountingFirmNavbar,
  AccountingFirmProcess,
  AccountingFirmServices,
  AccountingFirmTeam,
]

afterEach(() => {
  cleanup()
})

describe('accounting-firm Container adoption', () => {
  it.each(accountingFirmSections)(
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

  it('keeps the navbar wrapper semantic as a nav element', () => {
    const SectionProbe = () =>
      AccountingFirmNavbar.client.component({
        props: {},
        statementId: 'AccountingFirmNavbar_test',
      })

    const { container } = render(<SectionProbe />)

    expect(container.querySelector('[data-slot="container"]')?.tagName).toBe(
      'NAV',
    )
  })
})
