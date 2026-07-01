// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'

import {
  applyThemeVars,
  clearThemeVars,
  injectThemeFonts,
} from './theme-runtime'
import type { ThemeStyles } from './theme-presets'

const runtimeStyles = {
  light: {
    background: '#ffffff',
    foreground: '#111111',
    primary: '#2563eb',
    'font-sans': 'Inter, sans-serif',
    'font-serif': 'Georgia, serif',
    'font-mono': 'ui-monospace, monospace',
  },
  dark: {
    background: '#050505',
    foreground: '#fafafa',
    primary: '#60a5fa',
    'font-sans': 'Inter, sans-serif',
    'font-serif': 'Georgia, serif',
    'font-mono': 'JetBrains Mono, monospace',
  },
} as unknown as ThemeStyles

describe('runtime theme helpers', () => {
  afterEach(() => {
    document.head.replaceChildren()
    document.body.replaceChildren()
  })

  it('paints light and dark theme vars onto an existing preview root', () => {
    const root = document.createElement('main')
    root.style.setProperty('--primary', 'stale')

    applyThemeVars(root, runtimeStyles, false)

    expect(root.style.getPropertyValue('--background')).toBe('#ffffff')
    expect(root.style.getPropertyValue('--primary')).toBe('#2563eb')
    expect(root.classList.contains('dark')).toBe(false)
    expect(root.style.colorScheme).toBe('light')

    applyThemeVars(root, runtimeStyles, true)

    expect(root.style.getPropertyValue('--background')).toBe('#050505')
    expect(root.style.getPropertyValue('--primary')).toBe('#60a5fa')
    expect(root.classList.contains('dark')).toBe(true)
    expect(root.style.colorScheme).toBe('dark')

    clearThemeVars(root)

    expect(root.style.getPropertyValue('--background')).toBe('')
    expect(root.style.getPropertyValue('--primary')).toBe('')
  })

  it('injects only non-system font families into the target document', () => {
    injectThemeFonts(document, runtimeStyles)

    const link = document.head.querySelector('link[data-theme-font]')
    expect(link?.getAttribute('href')).toContain('family=Inter')
    expect(link?.getAttribute('href')).toContain('family=JetBrains+Mono')
    expect(link?.getAttribute('href')).not.toContain('Georgia')
    expect(link?.getAttribute('href')).not.toContain('ui-monospace')
  })
})
