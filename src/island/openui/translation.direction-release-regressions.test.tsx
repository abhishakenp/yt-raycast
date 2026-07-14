import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider, T } from './_providers/translation'

interface HarnessProps {
  locale: string
}

function Harness({ locale }: HarnessProps) {
  return (
    <I18nProvider locale={locale}>
      <T>
        <p>Preview copy</p>
      </T>
    </I18nProvider>
  )
}

function translationRoot() {
  const paragraph = screen.getByText('Preview copy')
  const root = paragraph.parentElement
  if (!root) throw new Error('Translation root was not rendered')
  return root
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ translations: ['Preview copy'] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    ),
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('preview language direction release regressions', () => {
  it.each([
    ['en', 'ltr'],
    ['hi', 'ltr'],
    ['ur', 'rtl'],
    ['sd', 'rtl'],
    ['ur-Latn', 'ltr'],
  ])('marks %s preview content with %s direction', (locale, direction) => {
    render(<Harness locale={locale} />)

    expect(translationRoot().getAttribute('lang')).toBe(locale)
    expect(translationRoot().getAttribute('dir')).toBe(direction)
  })

  it('updates language and direction atomically when the locale changes', () => {
    const view = render(<Harness locale="hi" />)
    expect(translationRoot().getAttribute('lang')).toBe('hi')
    expect(translationRoot().getAttribute('dir')).toBe('ltr')

    view.rerender(<Harness locale="ur" />)

    expect(translationRoot().getAttribute('lang')).toBe('ur')
    expect(translationRoot().getAttribute('dir')).toBe('rtl')
  })
})
