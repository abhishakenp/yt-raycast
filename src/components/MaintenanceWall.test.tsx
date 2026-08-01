// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const maintenanceQuery = vi.hoisted(() => vi.fn())

vi.mock('convex/react', () => ({
  useQuery: maintenanceQuery,
}))

import { MaintenanceWall } from './MaintenanceWall'

describe('MaintenanceWall', () => {
  beforeEach(() => maintenanceQuery.mockReset())

  it('does not obscure the app while maintenance mode is disabled or loading', () => {
    maintenanceQuery.mockReturnValue(undefined)
    const loading = render(<MaintenanceWall />)
    expect(loading.container.innerHTML).toBe('')

    maintenanceQuery.mockReturnValue({ enabled: false })
    const disabled = render(<MaintenanceWall />)
    expect(disabled.container.innerHTML).toBe('')
  })

  it('renders an accessible full-screen wall with update links while enabled', () => {
    maintenanceQuery.mockReturnValue({ enabled: true })
    render(<MaintenanceWall />)

    expect(
      screen.getByRole('main', { name: 'Ship Fast maintenance' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'Sorry, back soon.' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'X / Twitter' }).getAttribute('href'),
    ).toBe('https://x.com')
    expect(
      screen.getByRole('link', { name: 'LinkedIn' }).getAttribute('href'),
    ).toBe('https://www.linkedin.com')
  })
})
