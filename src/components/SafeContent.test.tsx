// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SafeContent } from './GenUI/SafeContent'

const ExplodingChild = () => {
  throw new Error('preview crashed')
}

describe('SafeContent', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders children while the content tree is healthy', () => {
    render(
      <SafeContent>
        <main>Generated preview content</main>
      </SafeContent>,
    )

    expect(screen.getByText('Generated preview content')).toBeTruthy()
  })

  it('isolates content crashes behind the default fallback', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <SafeContent>
        <ExplodingChild />
      </SafeContent>,
    )

    expect(screen.getByText('Something went wrong.')).toBeTruthy()
    expect(screen.getByText('preview crashed')).toBeTruthy()
  })

  it('uses a caller-provided fallback when supplied', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <SafeContent fallback={<div role="alert">Preview failed safely</div>}>
        <ExplodingChild />
      </SafeContent>,
    )

    expect(screen.getByRole('alert').textContent).toBe('Preview failed safely')
    expect(screen.queryByText('Something went wrong.')).toBeNull()
  })
})
