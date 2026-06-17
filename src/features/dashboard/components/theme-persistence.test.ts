import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('Theme persistence', () => {
  describe('serializeSession includes themeOverride', () => {
    const sessionsSource = readFileSync(
      resolve(__dirname, '../../../../convex/sessions.ts'),
      'utf-8',
    )
    const serializationHelpersSource = readFileSync(
      resolve(
        __dirname,
        '../../../../convex/lib/session_serialization_helpers.ts',
      ),
      'utf-8',
    )
    const readinessHelpersSource = readFileSync(
      resolve(__dirname, '../../../../convex/lib/session_readiness_helpers.ts'),
      'utf-8',
    )

    it('serializeSession returns themeOverride field', () => {
      const serializeMatch = serializationHelpersSource.match(
        /export const serializeSession[\s\S]*?\n\}\)/,
      )
      expect(serializeMatch).not.toBeNull()
      expect(serializeMatch![0]).toContain('themeOverride')
    })

    it('session query helpers use the extracted serializer', () => {
      expect(sessionsSource).toContain("from './lib/session_readiness_helpers'")
      expect(sessionsSource).toContain('loadSessionReadiness(ctx, args.lookup)')
      expect(readinessHelpersSource).toContain(
        "from './session_serialization_helpers'",
      )
      expect(readinessHelpersSource).toContain('serializeSession(session)')
    })
  })

  describe('setThemeOverride mutation exists', () => {
    const sessionsSource = readFileSync(
      resolve(__dirname, '../../../../convex/sessions.ts'),
      'utf-8',
    )
    const accessHelpersSource = readFileSync(
      resolve(__dirname, '../../../../convex/lib/session_access_helpers.ts'),
      'utf-8',
    )
    const validatorsSource = readFileSync(
      resolve(__dirname, '../../../../convex/lib/session_validators.ts'),
      'utf-8',
    )

    it('exports a setThemeOverride mutation', () => {
      expect(sessionsSource).toContain(
        'export const setThemeOverride = mutation(',
      )
    })

    it('mutation delegates to the access helper that patches themeOverride', () => {
      const mutationMatch = sessionsSource.match(
        /export const setThemeOverride = mutation\([\s\S]*?\n\}\)/,
      )
      expect(mutationMatch).not.toBeNull()
      expect(mutationMatch![0]).toContain('args: setThemeOverrideArgs')
      expect(mutationMatch![0]).toContain('setSessionThemeOverride(ctx, args)')
      expect(validatorsSource).toContain('export const setThemeOverrideArgs =')
      expect(validatorsSource).toContain('themeOverride')
      expect(accessHelpersSource).toContain('setSessionThemeOverride')
      expect(accessHelpersSource).toContain('themeOverride')
      expect(accessHelpersSource).toContain('ctx.db.patch')
    })
  })

  describe('Dashboard wires theme persistence', () => {
    const dashboardSource = readFileSync(
      resolve(__dirname, 'Dashboard.tsx'),
      'utf-8',
    )

    it('calls setThemeOverride mutation', () => {
      expect(dashboardSource).toContain('setThemeOverrideMutation')
    })

    it('initializes selectedTheme from serverThemeOverride', () => {
      expect(dashboardSource).toContain('serverThemeOverride')
      expect(dashboardSource).toContain('setSelectedTheme(serverThemeOverride)')
    })

    it('passes themeOverride when calling mutation on select', () => {
      expect(dashboardSource).toContain('themeOverride: theme')
    })
  })
})
