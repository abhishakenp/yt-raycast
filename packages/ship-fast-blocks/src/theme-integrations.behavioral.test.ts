// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'

import {
  THEME_VAR_KEYS,
  applyThemeVars,
  clearThemeVars,
  isKnownTheme,
  resolveThemeStyles,
  themeLabel,
} from './theme-apply.ts'
import { defaultPresets, type ThemeStyles } from './theme-presets.ts'
import {
  IntegrationProvider,
  OpenUIMedusaContext,
  provisionMedusaIntegration,
  type OpenUIIntegrationConfig,
} from './integrations.tsx'

function MedusaProbe() {
  const ctx = React.useContext(OpenUIMedusaContext)
  return React.createElement('div', null, JSON.stringify(ctx))
}

const REQUIRED_VAR_KEYS = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'border',
  'input',
  'ring',
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
  'sidebar',
  'sidebar-foreground',
  'sidebar-primary',
  'sidebar-primary-foreground',
  'sidebar-accent',
  'sidebar-accent-foreground',
  'sidebar-border',
  'sidebar-ring',
  'font-sans',
  'font-serif',
  'font-mono',
  'radius',
  'shadow-color',
  'shadow-opacity',
  'shadow-blur',
  'shadow-spread',
  'shadow-offset-x',
  'shadow-offset-y',
  'letter-spacing',
  'spacing',
] as const

describe('theme + integrations behavioral', () => {
  describe('theme presets', () => {
    it('exposes 30+ presets', () => {
      expect(Object.keys(defaultPresets).length).toBeGreaterThanOrEqual(30)
    })

    it('every key declared by any preset is a valid THEME_VAR_KEY', () => {
      const declared = new Set(THEME_VAR_KEYS)
      for (const [name, preset] of Object.entries(defaultPresets)) {
        for (const mode of ['light', 'dark'] as const) {
          const variant = preset.styles[mode] ?? {}
          for (const key of Object.keys(variant)) {
            expect(
              declared.has(key),
              `${name}.${mode} declares unknown key ${key}`,
            ).toBe(true)
          }
        }
      }
    })

    it('every preset defines the core color tokens (background, foreground, primary, ring) for both modes', () => {
      const core = ['background', 'foreground', 'primary', 'ring'] as const
      for (const [name, preset] of Object.entries(defaultPresets)) {
        for (const mode of ['light', 'dark'] as const) {
          const variant = preset.styles[mode] ?? {}
          for (const key of core) {
            expect(
              variant[key],
              `${name}.${mode} missing core ${key}`,
            ).toBeTruthy()
          }
        }
      }
    })

    it('THEME_VAR_KEYS covers every required design token', () => {
      const declared = new Set(THEME_VAR_KEYS)
      for (const key of REQUIRED_VAR_KEYS) {
        expect(declared.has(key), `THEME_VAR_KEYS missing ${key}`).toBe(true)
      }
      expect(THEME_VAR_KEYS.length).toBeGreaterThanOrEqual(
        REQUIRED_VAR_KEYS.length,
      )
    })

    it('isKnownTheme and themeLabel resolve known and unknown names', () => {
      const first = Object.keys(defaultPresets)[0]!
      expect(isKnownTheme(first)).toBe(true)
      expect(isKnownTheme('not-a-real-theme')).toBe(false)
      expect(isKnownTheme(123)).toBe(false)
      expect(themeLabel(first)).toBe(defaultPresets[first].label ?? first)
      expect(themeLabel('nope')).toBe('Default')
    })
  })

  describe('resolveThemeStyles', () => {
    it('returns the preset styles object for a known theme', () => {
      const first = Object.keys(defaultPresets)[0]!
      const styles = resolveThemeStyles(first)
      expect(styles).not.toBeNull()
      expect(styles!.light.background).toBeTruthy()
      expect(styles!.dark.background).toBeTruthy()
    })

    it('returns null for unknown or empty names', () => {
      expect(resolveThemeStyles('nope')).toBeNull()
      expect(resolveThemeStyles('')).toBeNull()
      expect(resolveThemeStyles(null)).toBeNull()
    })
  })

  describe('applyThemeVars / clearThemeVars', () => {
    beforeEach(() => {
      document.documentElement.innerHTML = ''
    })
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('injects CSS custom properties from the theme preset onto the root in light mode', () => {
      const first = Object.keys(defaultPresets)[0]!
      const styles = resolveThemeStyles(first) as ThemeStyles
      const root = document.documentElement
      applyThemeVars(root, styles, false)

      expect(root.style.getPropertyValue('--background')).toBe(
        styles.light.background,
      )
      expect(root.style.getPropertyValue('--primary')).toBe(
        styles.light.primary,
      )
      expect(root.style.getPropertyValue('--font-sans')).toBe(
        styles.light['font-sans'],
      )
      expect(root.classList.contains('dark')).toBe(false)
      expect(root.style.colorScheme).toBe('light')
    })

    it('overlays dark variant and adds the .dark class in dark mode', () => {
      const first = Object.keys(defaultPresets)[0]!
      const styles = resolveThemeStyles(first) as ThemeStyles
      const root = document.documentElement
      applyThemeVars(root, styles, true)

      expect(root.style.getPropertyValue('--background')).toBe(
        styles.dark.background,
      )
      expect(root.style.getPropertyValue('--primary')).toBe(styles.dark.primary)
      expect(root.classList.contains('dark')).toBe(true)
      expect(root.style.colorScheme).toBe('dark')
    })

    it('clears stale vars from a previous theme before applying a new one', () => {
      const [a, b] = Object.keys(defaultPresets)
      const root = document.documentElement
      applyThemeVars(root, resolveThemeStyles(a) as ThemeStyles, false)
      const aPrimary = root.style.getPropertyValue('--primary')

      applyThemeVars(root, resolveThemeStyles(b) as ThemeStyles, false)
      const bPrimary = root.style.getPropertyValue('--primary')

      expect(aPrimary).not.toBe(bPrimary)
      expect(root.style.getPropertyValue('--primary')).toBe(bPrimary)
    })

    it('clearThemeVars removes every managed CSS var', () => {
      const first = Object.keys(defaultPresets)[0]!
      const root = document.documentElement
      applyThemeVars(root, resolveThemeStyles(first) as ThemeStyles, false)
      expect(root.style.getPropertyValue('--background')).not.toBe('')

      clearThemeVars(root)
      for (const key of THEME_VAR_KEYS) {
        expect(root.style.getPropertyValue(`--${key}`)).toBe('')
      }
    })
  })

  describe('IntegrationProvider / Medusa context', () => {
    it('provides the configured backend and storefront URLs to children', () => {
      const config: OpenUIIntegrationConfig = {
        backendUrl: 'https://medusa.example.com',
        storefrontUrl: 'https://shop.example.com',
      }
      const { container } = render(
        React.createElement(
          IntegrationProvider,
          { medusa: { enabled: true, config }, sessionId: null },
          React.createElement(MedusaProbe),
        ),
      )
      const value = JSON.parse(container.textContent ?? '{}')
      expect(value.enabled).toBe(true)
      expect(value.backendUrl).toBe('https://medusa.example.com')
      expect(value.storefrontUrl).toBe('https://shop.example.com')
      expect(value.status).toBe('ready')
      expect(value.ready).toBe(true)
      expect(value.error).toBeNull()
    })

    it('checks deployment-scoped Medusa config when deploymentSlug is present', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            enabled: true,
            config: {
              backendUrl: 'https://backend.deployed.test',
              storefrontUrl: 'https://storefront.deployed.test',
            },
          }),
          { status: 200 },
        ),
      )
      vi.stubGlobal('fetch', fetchMock)

      await expect(
        provisionMedusaIntegration('session_123', {
          deploymentSlug: 'deployed-store',
        }),
      ).resolves.toMatchObject({
        backendUrl: 'https://backend.deployed.test',
        ready: true,
        storefrontUrl: 'https://storefront.deployed.test',
        status: 'ready',
      })
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/deployments/deployed-store/medusa-config',
        {
          headers: { Accept: 'application/json' },
        },
      )
    })

    it('prefers backendUrl over adminBaseUrl and trims whitespace', () => {
      const config: OpenUIIntegrationConfig = {
        backendUrl: '  https://api.example.com  ',
        adminBaseUrl: 'https://admin.example.com',
      }
      const { container } = render(
        React.createElement(
          IntegrationProvider,
          { medusa: { enabled: true, config }, sessionId: null },
          React.createElement(MedusaProbe),
        ),
      )
      const value = JSON.parse(container.textContent ?? '{}')
      expect(value.backendUrl).toBe('https://api.example.com')
    })

    it('falls back to adminBaseUrl when backendUrl is missing', () => {
      const config: OpenUIIntegrationConfig = {
        adminBaseUrl: 'https://admin.example.com',
      }
      const { container } = render(
        React.createElement(
          IntegrationProvider,
          { medusa: { enabled: true, config }, sessionId: null },
          React.createElement(MedusaProbe),
        ),
      )
      const value = JSON.parse(container.textContent ?? '{}')
      expect(value.backendUrl).toBe('https://admin.example.com')
    })

    it('reports disabled status when medusa is not enabled', () => {
      const { container } = render(
        React.createElement(
          IntegrationProvider,
          { medusa: { enabled: false, config: {} }, sessionId: null },
          React.createElement(MedusaProbe),
        ),
      )
      const value = JSON.parse(container.textContent ?? '{}')
      expect(value.enabled).toBe(false)
      expect(value.status).toBe('disabled')
      expect(value.ready).toBe(false)
    })
  })

  describe('sanitize integration config', () => {
    it('filters out non-string and forbidden fields, trims string values', () => {
      // IntegrationProvider normalizes payload internally; we observe via context.
      const raw = {
        backendUrl: '  https://api.example.com  ',
        storefrontUrl: 'https://shop.example.com',
        secret: 'should-be-kept-as-string',
        numericPort: 8080, // non-string -> dropped
        nested: { x: 1 }, // non-string -> dropped
        empty: null, // null -> dropped
        adminBaseUrl: 'https://admin.example.com',
      }
      const { container } = render(
        React.createElement(
          IntegrationProvider,
          { medusa: { enabled: true, config: raw }, sessionId: null },
          React.createElement(MedusaProbe),
        ),
      )
      const value = JSON.parse(container.textContent ?? '{}')
      const config = value.config as Record<string, string>
      expect(config.backendUrl).toBe('https://api.example.com')
      expect(config.storefrontUrl).toBe('https://shop.example.com')
      expect(config.adminBaseUrl).toBe('https://admin.example.com')
      // non-string values are filtered out
      expect(config.numericPort).toBeUndefined()
      expect(config.nested).toBeUndefined()
      expect(config.empty).toBeUndefined()
      // string values are preserved (sanitizer keeps all string fields; downstream
      // consumers pick the ones they need)
      expect(config.secret).toBe('should-be-kept-as-string')
    })

    it('returns an empty config for non-object payloads', () => {
      const { container } = render(
        React.createElement(
          IntegrationProvider,
          {
            medusa: { enabled: true, config: 'not-an-object' },
            sessionId: null,
          },
          React.createElement(MedusaProbe),
        ),
      )
      const value = JSON.parse(container.textContent ?? '{}')
      expect(value.config).toEqual({})
      expect(value.backendUrl).toBeNull()
    })

    it('treats malformed top-level integration payloads as disabled instead of crashing children', () => {
      for (const malformed of [
        null,
        'enabled=true',
        ['https://api.example.com'],
      ]) {
        const { container, unmount } = render(
          React.createElement(
            IntegrationProvider,
            { medusa: malformed as never, sessionId: null },
            React.createElement(MedusaProbe),
          ),
        )

        const value = JSON.parse(container.textContent ?? '{}')
        expect(value.enabled).toBe(false)
        expect(value.ready).toBe(false)
        expect(value.status).toBe('disabled')
        expect(value.config).toEqual({})
        expect(value.backendUrl).toBeNull()
        expect(value.storefrontUrl).toBeNull()
        unmount()
      }
    })
  })
})
