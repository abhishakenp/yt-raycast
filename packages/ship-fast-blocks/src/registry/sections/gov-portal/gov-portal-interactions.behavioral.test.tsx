// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  GOV_LANG_STORAGE_KEY,
  GovDarkModeToggle,
  GovLanguagePicker,
  useGovLang,
} from './gov-portal-interactions'

const THEME_KEY = 'lakebed:theme-dark'

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.className = ''
})
afterEach(() => cleanup())

function LangProbe() {
  const { lang, setLang } = useGovLang()
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <button type="button" onClick={() => setLang('hi')}>
        to-hi
      </button>
      <button type="button" onClick={() => setLang('en')}>
        to-en
      </button>
    </div>
  )
}

describe('useGovLang — localStorage-backed, no Lakebed DB', () => {
  it('defaults to en and persists a choice to localStorage', () => {
    render(<LangProbe />)
    expect(screen.getByTestId('lang').textContent).toBe('en')

    fireEvent.click(screen.getByText('to-hi'))
    expect(screen.getByTestId('lang').textContent).toBe('hi')
    expect(window.localStorage.getItem(GOV_LANG_STORAGE_KEY)).toBe('hi')
  })

  it('hydrates the persisted language on a fresh mount', () => {
    window.localStorage.setItem(GOV_LANG_STORAGE_KEY, 'hi')
    render(<LangProbe />)
    expect(screen.getByTestId('lang').textContent).toBe('hi')
  })

  it('keeps every section in sync within the tab via a custom event', () => {
    render(
      <div>
        <LangProbe />
        <LangProbe />
      </div>,
    )
    const langs = () => screen.getAllByTestId('lang').map((n) => n.textContent)
    expect(langs()).toEqual(['en', 'en'])

    fireEvent.click(screen.getAllByText('to-hi')[0])
    // Both probes flip, not just the one that was clicked.
    expect(langs()).toEqual(['hi', 'hi'])
  })
})

describe('GovLanguagePicker — works without a Lakebed runtime', () => {
  it('switches the pressed language purely client-side', () => {
    render(<GovLanguagePicker />)
    const en = screen.getByRole('button', { name: 'EN' })
    const hi = screen.getByRole('button', { name: 'हिं' })
    expect(en.getAttribute('aria-pressed')).toBe('true')
    expect(hi.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(hi)
    expect(hi.getAttribute('aria-pressed')).toBe('true')
    expect(en.getAttribute('aria-pressed')).toBe('false')
    expect(window.localStorage.getItem(GOV_LANG_STORAGE_KEY)).toBe('hi')
  })
})

describe('GovDarkModeToggle — toggles the shared .dark class', () => {
  it('flips the <html> .dark class + persists, driving the real theme palette', () => {
    render(<GovDarkModeToggle />)
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: /dark mode/i }))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(window.localStorage.getItem(THEME_KEY)).toBe('1')

    fireEvent.click(screen.getByRole('button', { name: /light mode/i }))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(window.localStorage.getItem(THEME_KEY)).toBe('0')
  })

  it('adopts an already-dark document on mount', () => {
    window.localStorage.setItem(THEME_KEY, '1')
    document.documentElement.classList.add('dark')
    render(<GovDarkModeToggle />)
    // Reflects dark: the button offers "light mode".
    expect(screen.getByRole('button', { name: /light mode/i })).toBeTruthy()
  })
})
