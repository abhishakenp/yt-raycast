// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/features/generation/components/GeneratedModulePreview', () => ({
  GeneratedModulePreview: ({
    locale,
    sessionId,
    source,
  }: {
    locale?: string
    sessionId: string
    source: string
  }) => (
    <section data-locale={locale} data-testid="generated-preview">
      {sessionId}:{source}
    </section>
  ),
}))

import { SessionGeneratedPreview } from './SessionGeneratedPreview'

afterEach(() => {
  cleanup()
})

describe('SessionGeneratedPreview', () => {
  it('renders the generated preview with the active session input', () => {
    render(
      <SessionGeneratedPreview
        source="home = Hero('Launch')"
        sessionId="k574ms14ma9f94keq30r7dq24x89n1k2"
        locale="en"
      />,
    )

    const preview = screen.getByTestId('generated-preview')
    expect(preview.textContent).toContain(
      "k574ms14ma9f94keq30r7dq24x89n1k2:home = Hero('Launch')",
    )
    expect(preview.getAttribute('data-locale')).toBe('en')
  })
})
