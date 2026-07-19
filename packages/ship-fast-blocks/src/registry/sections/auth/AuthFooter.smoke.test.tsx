// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const { AuthFooter } = await import('./AuthFooter.tsx')

describe('AuthFooter smoke', () => {
  it('renders brand, columns, social, and status line with no props', () => {
    render(
      <>
        {AuthFooter.client.component({
          props: {},
          statementId: 'auth_footer',
        })}
      </>,
    )

    expect(screen.getByText('Authly')).toBeTruthy()
    expect(screen.getByText('Product')).toBeTruthy()
    expect(screen.getByText('Developers')).toBeTruthy()
    expect(screen.getByText('GitHub')).toBeTruthy()
    expect(screen.getByText('all systems operational')).toBeTruthy()
    expect(screen.getByText('All rights reserved.')).toBeTruthy()
    expect(screen.getByText('API Reference')).toBeTruthy()
  })
})
