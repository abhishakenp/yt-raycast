// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'

import {
  THEME_CATALOG,
  applyThemeVars,
  clearThemeVars,
  injectThemeFonts,
  isKnownTheme,
  pickRandomTheme,
  resolveThemeStyles,
  themeLabel,
} from './theme-apply'
import { defaultPresets, type ThemeStyles } from './theme-presets'

describe('theme apply catalog and DOM behavior', () => {
  afterEach(() => {
    document.head.replaceChildren()
    document.body.replaceChildren()
  })

  it('resolves known themes, labels, and deterministic random selections', () => {
    expect(isKnownTheme('modern-minimal')).toBe(true)
    expect(isKnownTheme('not-a-theme')).toBe(false)
    expect(themeLabel('modern-minimal')).toBe('Modern Minimal')
    expect(themeLabel('not-a-theme')).toBe('Default')
    expect(resolveThemeStyles('modern-minimal')).toBe(
      defaultPresets['modern-minimal'].styles,
    )
    expect(resolveThemeStyles({ styles: defaultPresets.twitter.styles })).toBe(
      defaultPresets.twitter.styles,
    )
    expect(THEME_CATALOG).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'modern-minimal',
          label: 'Modern Minimal',
        }),
      ]),
    )
    expect(pickRandomTheme(() => 0)).toBe(THEME_CATALOG[0]?.name)
  })

  it('applies light and dark theme variables without leaving stale CSS vars', () => {
    const root = document.createElement('div')
    root.style.setProperty('--spacing', 'stale')
    const styles = defaultPresets['modern-minimal'].styles as ThemeStyles

    applyThemeVars(root, styles, false)

    expect(root.style.getPropertyValue('--background')).toBe(
      styles.light.background,
    )
    expect(root.style.getPropertyValue('--spacing')).toBe('')
    expect(root.classList.contains('dark')).toBe(false)
    expect(root.style.colorScheme).toBe('light')

    applyThemeVars(root, styles, true)

    expect(root.style.getPropertyValue('--background')).toBe(
      styles.dark.background,
    )
    expect(root.classList.contains('dark')).toBe(true)
    expect(root.style.colorScheme).toBe('dark')

    clearThemeVars(root)

    expect(root.style.getPropertyValue('--background')).toBe('')
    expect(root.style.getPropertyValue('--primary')).toBe('')
  })

  it('injects Google font links for non-system theme families and replaces stale links', () => {
    const stale = document.createElement('link')
    stale.setAttribute('data-theme-font', '')
    stale.href = 'https://example.test/stale.css'
    document.head.append(stale)

    injectThemeFonts(
      document,
      defaultPresets['modern-minimal'].styles as ThemeStyles,
    )

    const links = document.head.querySelectorAll('link[data-theme-font]')
    expect(links).toHaveLength(1)
    expect(links[0]?.getAttribute('href')).toContain(
      'https://fonts.googleapis.com/css2?',
    )
    expect(links[0]?.getAttribute('href')).toContain('family=Inter')
    expect(links[0]?.getAttribute('href')).toContain('family=Source+Serif+4')
    expect(links[0]?.getAttribute('href')).toContain('family=JetBrains+Mono')
  })
})
