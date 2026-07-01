// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { EcommercifyTransformOverlay } from './EcommercifyTransformOverlay'

describe('EcommercifyTransformOverlay', () => {
  afterEach(cleanup)

  it('announces the commerce transformation without exposing decorative carts', () => {
    const view = render(<EcommercifyTransformOverlay />)
    const status = view.getByRole('status', {
      name: 'E-commercify transformation in progress',
    })

    expect(status.getAttribute('aria-live')).toBe('polite')
    expect(status.classList.contains('ecommercify-transform')).toBe(true)
    expect(status.classList.contains('ecommercify-transform--fixed')).toBe(
      false,
    )
    expect(view.getByRole('heading', { name: 'Ship Fast' })).toBeTruthy()
    expect(view.getByText('E-commercifying your site')).toBeTruthy()
    expect(
      view.container.querySelectorAll('.ecommercify-transform__cart'),
    ).toHaveLength(30)
  })

  it('can render as a fixed overlay for full-screen transforms', () => {
    const view = render(<EcommercifyTransformOverlay fixed />)
    const status = view.getByTestId('ecommercify-transform')

    expect(status.classList.contains('ecommercify-transform--fixed')).toBe(true)
  })
})
