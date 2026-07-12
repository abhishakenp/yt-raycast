import { describe, expect, it } from 'vitest'

import { extractTokens, looksSerif, tokensToThemeVars } from './tokens.ts'
import type { CapturedPage } from './types.ts'

function stylesMap(
  entries: Array<[string, Record<string, string>]>,
): Map<string, Record<string, string>> {
  return new Map(entries)
}

function captured(
  computedStyles: Map<string, Record<string, string>>,
): CapturedPage {
  return {
    url: 'https://example.com/',
    normalizedUrl: 'https://example.com/',
    html: '<html><body></body></html>',
    computedStyles,
    bboxes: new Map(),
    assetUrls: [],
  }
}

describe('clone token extraction', () => {
  it('extracts palette, font, radius, and spacing from captured computed styles', () => {
    const tokens = extractTokens(
      captured(
        stylesMap([
          [
            'html',
            {
              'background-color': '#fafafa',
              color: '#111827',
            },
          ],
          [
            'body',
            {
              'background-color': 'transparent',
              color: 'rgb(17, 24, 39)',
              'font-family': 'system-ui, sans-serif',
              'border-color': 'transparent',
              'border-radius': '0px',
              gap: 'normal',
            },
          ],
          [
            'button.primary',
            {
              'background-color': '#f60',
              color: 'white',
              'border-color': '#f60',
              'border-radius': '12px',
              'font-family': '"Inter", sans-serif',
            },
          ],
          [
            'a.cta',
            {
              color: 'hsl(210 100% 50%)',
              'font-family': '"Inter", sans-serif',
            },
          ],
          [
            '.card-one',
            {
              'border-radius': '16px',
              gap: '24px',
              'font-family': '"Inter", sans-serif',
            },
          ],
          [
            '.card-two',
            {
              'border-radius': '16px',
              gap: '24px',
              'font-family': '"Inter", sans-serif',
            },
          ],
        ]),
      ),
    )

    expect(tokens.background).toBe('#fafafa')
    expect(tokens.foreground).toBe('#111827')
    expect(tokens.primary).toBe('#ff6600')
    expect(tokens.accent).toBe('#0080ff')
    expect(tokens.secondary).toBe('#64748b')
    expect(tokens.fontFamily).toBe('"Inter", sans-serif')
    expect(tokens.radius).toBe('16px')
    expect(tokens.spacing).toBe('24px')
    expect(tokens.muted).toMatch(/^#[0-9a-f]{6}$/)
    expect(tokens.muted).not.toBe(tokens.background)
    expect(tokens.border).toMatch(/^#[0-9a-f]{6}$/)
    expect(tokens.border).not.toBe(tokens.background)
  })

  it('falls back to legible defaults when styles are transparent, generic, or low contrast', () => {
    const tokens = extractTokens(
      captured(
        stylesMap([
          [
            'body',
            {
              'background-color': '#050505',
              color: '#050505',
              'font-family': 'sans-serif',
              'border-color': '#050505',
              'border-radius': '0',
              gap: '0px',
            },
          ],
        ]),
      ),
    )

    expect(tokens.background).toBe('#050505')
    expect(tokens.foreground).toBe('#f8fafc')
    expect(tokens.primary).toBe('#3b82f6')
    expect(tokens.accent).toBe('#8b5cf6')
    expect(tokens.fontFamily).toBe('sans-serif')
    expect(tokens.radius).toBe('0.5rem')
    expect(tokens.spacing).toBe('1rem')
    expect(tokens.border).not.toBe('#050505')
  })

  it('normalizes named colors, rgba values, and hsl values to stable hex tokens', () => {
    const tokens = extractTokens(
      captured(
        stylesMap([
          ['body', { 'background-color': 'white', color: 'black' }],
          ['.brand', { 'background-color': 'rgba(255, 0, 128, 0.85)' }],
          ['.secondary-brand', { color: 'hsl(120, 100%, 25%)' }],
        ]),
      ),
    )

    expect(tokens.background).toBe('#ffffff')
    expect(tokens.foreground).toBe('#000000')
    expect(tokens.primary).toBe('#ff0080')
    expect(tokens.accent).toBe('#008000')
  })

  it('classifies serif/display stacks separately from generic sans stacks', () => {
    expect(looksSerif('"Playfair Display", Georgia, serif')).toBe(true)
    expect(looksSerif('Merriweather, serif')).toBe(true)
    expect(looksSerif('Inter, system-ui, sans-serif')).toBe(false)
    expect(looksSerif('ui-sans-serif')).toBe(false)
  })

  it('maps extracted tokens to OpenUI theme variable keys', () => {
    const tokens = {
      background: '#ffffff',
      foreground: '#111111',
      primary: '#ff6600',
      secondary: '#64748b',
      muted: '#f3f4f6',
      accent: '#0080ff',
      border: '#d1d5db',
      radius: '16px',
      fontFamily: '"Inter", sans-serif',
      spacing: '24px',
    }

    expect(tokensToThemeVars(tokens)).toEqual({
      '--background': '#ffffff',
      '--foreground': '#111111',
      '--primary': '#ff6600',
      '--secondary': '#64748b',
      '--muted': '#f3f4f6',
      '--accent': '#0080ff',
      '--border': '#d1d5db',
      '--radius': '16px',
      '--font-sans': '"Inter", sans-serif',
      '--spacing': '24px',
    })
  })
})
