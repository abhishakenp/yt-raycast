// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  injectThemeFonts,
  pickRandomTheme,
  THEME_NAMES,
} from './theme-apply.ts'
import type { ThemeStyles } from './theme-presets.ts'

const externalFontStyles: ThemeStyles = {
  dark: {
    'font-mono': 'ui-monospace, monospace',
    'font-sans': 'Space Grotesk, sans-serif',
    'font-serif': 'Merriweather, serif',
  },
  light: {
    'font-mono': 'JetBrains Mono, monospace',
    'font-sans': '"Space Grotesk", sans-serif',
    'font-serif': 'Georgia, serif',
  },
}

const systemFontStyles: ThemeStyles = {
  dark: {
    'font-mono': 'Consolas, monospace',
    'font-sans': 'system-ui, sans-serif',
    'font-serif': 'Times New Roman, serif',
  },
  light: {
    'font-mono': 'Menlo, monospace',
    'font-sans': 'Arial, sans-serif',
    'font-serif': 'Georgia, serif',
  },
}

describe('Blocks theme font lifecycle', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
  })

  it('injects one deduplicated Google Fonts request for external families', () => {
    injectThemeFonts(document, externalFontStyles)

    const links = document.head.querySelectorAll('link[data-theme-font]')
    const href = links[0]?.getAttribute('href') ?? ''
    expect(links).toHaveLength(1)
    expect(links[0]?.getAttribute('rel')).toBe('stylesheet')
    expect(href).toContain('family=Space+Grotesk:wght@400;500;600;700')
    expect(href).toContain('family=JetBrains+Mono:wght@400;500;600;700')
    expect(href).toContain('family=Merriweather:wght@400;500;600;700')
    expect(href.match(/family=Space\+Grotesk/g)).toHaveLength(1)
    expect(href).not.toContain('Georgia')
    expect(href).not.toContain('ui-monospace')
  })

  it('removes stale theme links and adds none for system-only families', () => {
    const stale = document.createElement('link')
    stale.setAttribute('data-theme-font', '')
    stale.href = 'https://fonts.googleapis.com/css2?family=Old+Font'
    document.head.appendChild(stale)

    injectThemeFonts(document, systemFontStyles)

    expect(document.head.querySelector('link[data-theme-font]')).toBeNull()
  })

  it('replaces the previous request instead of accumulating font links', () => {
    injectThemeFonts(document, externalFontStyles)
    const first = document.head.querySelector('link[data-theme-font]')

    injectThemeFonts(document, {
      dark: { 'font-sans': 'Inter, sans-serif' },
      light: { 'font-sans': 'Inter, sans-serif' },
    })
    const links = document.head.querySelectorAll('link[data-theme-font]')

    expect(first?.isConnected).toBe(false)
    expect(links).toHaveLength(1)
    expect(links[0]?.getAttribute('href')).toContain('family=Inter:')
  })
})

describe('Blocks random theme selection', () => {
  it('maps the lower and upper RNG boundaries to valid catalog entries', () => {
    expect(pickRandomTheme(() => 0)).toBe(THEME_NAMES[0])
    expect(pickRandomTheme(() => 0.999999)).toBe(
      THEME_NAMES[THEME_NAMES.length - 1],
    )
    expect(pickRandomTheme(() => 1)).toBe(THEME_NAMES[THEME_NAMES.length - 1])
  })

  it('samples the RNG exactly once and returns deterministically', () => {
    const rng = vi.fn(() => 0.5)
    const expected = THEME_NAMES[Math.floor(THEME_NAMES.length * 0.5)]

    expect(pickRandomTheme(rng)).toBe(expected)
    expect(rng).toHaveBeenCalledTimes(1)
  })
})
