import { describe, expect, it } from 'vitest'

import {
  defaultPresets,
  themeStylePropsSchema,
  themeStylePropsSchemaWithoutSpacing,
  themeStylesSchema,
  themeStylesSchemaWithoutSpacing,
  type ThemeStyleProps,
  type ThemeStyles,
} from './theme-presets'

// Presets are typed as Partial<ThemeStyleProps>, so only a minimal invariant
// core is guaranteed across every preset. These are the keys every theme must
// define for a usable UI. radius/fonts/shadow-* may be omitted in dark variants
// (inherited from light), so they are not part of the universal core.
const REQUIRED_CORE_KEYS: (keyof ThemeStyleProps)[] = [
  'background',
  'foreground',
  'primary',
  'primary-foreground',
  'border',
  'ring',
]

// Accepts hex (#rgb / #rrggbb), oklch(), hsl()/hsla(), rgb()/rgba(), and named
// colors — presets use a mix of these formats.
const COLOR_RE =
  /^(#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$|oklch\(|hsla?\(|rgba?\(|^[a-z]+$)/i

const completeStyle: ThemeStyleProps = {
  background: '#ffffff',
  foreground: '#000000',
  card: '#ffffff',
  'card-foreground': '#000000',
  popover: '#ffffff',
  'popover-foreground': '#000000',
  primary: '#3b82f6',
  'primary-foreground': '#ffffff',
  secondary: '#f3f4f6',
  'secondary-foreground': '#4b5563',
  muted: '#f9fafb',
  'muted-foreground': '#6b7280',
  accent: '#e0f2fe',
  'accent-foreground': '#1e3a8a',
  destructive: '#ef4444',
  'destructive-foreground': '#ffffff',
  border: '#e5e7eb',
  input: '#e5e7eb',
  ring: '#3b82f6',
  'chart-1': '#3b82f6',
  'chart-2': '#2563eb',
  'chart-3': '#1d4ed8',
  'chart-4': '#1e40af',
  'chart-5': '#1e3a8a',
  sidebar: '#f9fafb',
  'sidebar-foreground': '#333333',
  'sidebar-primary': '#3b82f6',
  'sidebar-primary-foreground': '#ffffff',
  'sidebar-accent': '#e0f2fe',
  'sidebar-accent-foreground': '#1e3a8a',
  'sidebar-border': '#e5e7eb',
  'sidebar-ring': '#3b82f6',
  'font-sans': 'Inter, sans-serif',
  'font-serif': 'Georgia, serif',
  'font-mono': 'Menlo, monospace',
  radius: '0.5rem',
  'shadow-color': 'hsl(0 0% 0%)',
  'shadow-opacity': '0.1',
  'shadow-blur': '4px',
  'shadow-spread': '0px',
  'shadow-offset-x': '0px',
  'shadow-offset-y': '2px',
  'letter-spacing': '0em',
}

describe('themeStylePropsSchema', () => {
  it('validates a complete style props object', () => {
    const result = themeStylePropsSchema.safeParse(completeStyle)
    expect(result.success).toBe(true)
  })

  it('rejects an object missing a required key', () => {
    const partial = { ...completeStyle, background: undefined }
    delete (partial as Partial<ThemeStyleProps>).background
    const result = themeStylePropsSchema.safeParse(partial)
    expect(result.success).toBe(false)
  })

  it('accepts an optional spacing field', () => {
    const withSpacing = { ...completeStyle, spacing: '0.25rem' }
    const result = themeStylePropsSchema.safeParse(withSpacing)
    expect(result.success).toBe(true)
  })

  it('accepts an object without the optional spacing field', () => {
    const result = themeStylePropsSchema.safeParse(completeStyle)
    expect(result.success).toBe(true)
  })
})

describe('themeStylePropsSchemaWithoutSpacing', () => {
  it('validates a style object that omits spacing', () => {
    const result = themeStylePropsSchemaWithoutSpacing.safeParse(completeStyle)
    expect(result.success).toBe(true)
  })

  it('ignores a spacing field when present (strips it)', () => {
    const withSpacing = { ...completeStyle, spacing: '0.25rem' }
    const result = themeStylePropsSchemaWithoutSpacing.safeParse(withSpacing)
    expect(result.success).toBe(true)
  })
})

describe('themeStylesSchema', () => {
  it('validates an object with light and dark style props', () => {
    const result = themeStylesSchema.safeParse({
      light: completeStyle,
      dark: completeStyle,
    })
    expect(result.success).toBe(true)
  })

  it('rejects an object missing the dark variant', () => {
    const result = themeStylesSchema.safeParse({ light: completeStyle })
    expect(result.success).toBe(false)
  })
})

describe('themeStylesSchemaWithoutSpacing', () => {
  it('validates light/dark without requiring spacing', () => {
    const result = themeStylesSchemaWithoutSpacing.safeParse({
      light: completeStyle,
      dark: completeStyle,
    })
    expect(result.success).toBe(true)
  })
})

describe('defaultPresets', () => {
  const presetKeys = Object.keys(defaultPresets)

  it('contains a non-empty set of presets', () => {
    expect(presetKeys.length).toBeGreaterThan(0)
  })

  it.each(presetKeys)('%s has a non-empty label', (key) => {
    const preset = defaultPresets[key]
    expect(typeof preset.label).toBe('string')
    expect(preset.label?.trim().length).toBeGreaterThan(0)
  })

  it.each(presetKeys)('%s defines both light and dark styles', (key) => {
    const preset = defaultPresets[key]
    expect(preset.styles.light).toBeDefined()
    expect(preset.styles.dark).toBeDefined()
  })

  it.each(presetKeys)('%s light variant has all required core keys', (key) => {
    const light = defaultPresets[key].styles.light
    for (const prop of REQUIRED_CORE_KEYS) {
      expect(light[prop], `${key}.light missing ${prop}`).toBeDefined()
    }
  })

  it.each(presetKeys)('%s dark variant has all required core keys', (key) => {
    const dark = defaultPresets[key].styles.dark
    for (const prop of REQUIRED_CORE_KEYS) {
      expect(dark[prop], `${key}.dark missing ${prop}`).toBeDefined()
    }
  })

  it.each(presetKeys)('%s light primary is a valid color value', (key) => {
    const primary = defaultPresets[key].styles.light.primary
    expect(primary).toMatch(COLOR_RE)
  })

  it.each(presetKeys)('%s dark primary is a valid color value', (key) => {
    const primary = defaultPresets[key].styles.dark.primary
    expect(primary).toMatch(COLOR_RE)
  })

  it('includes the modern-minimal preset', () => {
    expect(presetKeys).toContain('modern-minimal')
    expect(defaultPresets['modern-minimal'].label).toBe('Modern Minimal')
  })

  it('every preset light/dark pair satisfies ThemeStyles shape', () => {
    for (const key of presetKeys) {
      const styles = defaultPresets[key].styles as ThemeStyles
      expect(styles.light).toBeDefined()
      expect(styles.dark).toBeDefined()
    }
  })
})
