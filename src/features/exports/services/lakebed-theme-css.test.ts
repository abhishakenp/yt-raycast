import { describe, expect, it } from 'vitest'

import { buildLakebedThemeCss } from './openui-lakebed-export-builder'
import type { ThemeStyles } from '@/genui/theme-presets'

/**
 * A Lakebed deploy must ship BOTH the light and dark CSS variable palettes so
 * the in-page dark/light toggle actually has real theme colors to switch to.
 *
 * The historical bug: buildLakebedThemeCss baked only ONE `:root` var set
 * (light OR dark, chosen by `isDark`). On a dark session the deployed "light"
 * mode rendered dark, and the toggle had no real dark palette (it injected
 * generic hardcoded colors → "broken af"). The contract: `:root` carries the
 * light palette and a `.dark` selector carries the dark palette, regardless of
 * which mode is the default.
 */

const STYLES: ThemeStyles = {
  light: {
    background: '#ffffff',
    foreground: '#111111',
    primary: '#2563eb',
  } as ThemeStyles['light'],
  dark: {
    background: '#0b1220',
    foreground: '#e5e9f2',
    primary: '#6366f1',
  } as ThemeStyles['dark'],
}

describe('buildLakebedThemeCss ships both light and dark palettes', () => {
  for (const isDark of [false, true]) {
    it(`emits :root light vars and a .dark dark override (isDark=${isDark})`, () => {
      const css = buildLakebedThemeCss(STYLES, isDark)

      // Light palette lives on :root.
      const root = css.match(/:root\s*\{[^}]*\}/)?.[0] ?? ''
      expect(root).toContain('--background: #ffffff')
      expect(root).toContain('--foreground: #111111')

      // Dark palette lives on a `.dark` selector so a class toggle repaints.
      expect(css).toMatch(/\.dark\s*\{/)
      const dark = css.match(/\.dark\s*\{[^}]*\}/)?.[0] ?? ''
      expect(dark).toContain('--background: #0b1220')
      expect(dark).toContain('--foreground: #e5e9f2')

      // Each mode declares its own color-scheme.
      expect(root).toContain('color-scheme: light')
      expect(dark).toContain('color-scheme: dark')
    })
  }
})
