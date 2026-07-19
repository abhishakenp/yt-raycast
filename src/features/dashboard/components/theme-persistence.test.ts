import { convexTest } from 'convex-test'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import schema from '../../../../convex/schema'
import { serializeSession } from '../../../../convex/lib/session_serialization_helpers'

const modules = import.meta.glob('../../../../convex/**/*.ts')

type SerializedSession = ReturnType<typeof serializeSession>

function mockSession(
  overrides: Partial<Parameters<typeof serializeSession>[0]> = {},
): Parameters<typeof serializeSession>[0] {
  return {
    _id: 'session-1' as unknown as Id<'sessions'>,
    prompt: 'A themed website',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    createdAt: 100,
    ...overrides,
  } as Parameters<typeof serializeSession>[0]
}

describe('Theme persistence', () => {
  describe('serializeSession', () => {
    it('returns themeOverride and themeMode fields from the session document', () => {
      const serialized: SerializedSession = serializeSession(
        mockSession({ themeOverride: 'midnight', themeMode: 'dark' }),
      )

      expect(serialized.themeOverride).toBe('midnight')
      expect(serialized.themeMode).toBe('dark')
      expect(serialized.sessionId).toBe('session-1')
      expect(serialized.prompt).toBe('A themed website')
    })

    it('coerces missing theme fields to null', () => {
      const serialized: SerializedSession = serializeSession(mockSession())

      expect(serialized.themeOverride).toBeNull()
      expect(serialized.themeMode).toBeNull()
    })

    it('coerces an invalid themeMode value to null', () => {
      const serialized: SerializedSession = serializeSession(
        mockSession({ themeMode: 'purple' as unknown as 'light' | 'dark' }),
      )

      expect(serialized.themeMode).toBeNull()
    })
  })

  describe('setThemeOverride mutation', () => {
    beforeEach(() => {
      // Bypass ownership checks so the mutation can run without an auth
      // identity or anonymous owner secret in the test environment.
      vi.stubEnv('DISABLE_PAYWALL', 'true')
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('patches themeOverride and themeMode on the session document', async () => {
      const t = convexTest(schema, modules)
      const sessionId = await t.run(async (ctx) =>
        ctx.db.insert('sessions', {
          prompt: 'A themed website',
          preferredLanguage: 'en',
          preferredExportTarget: 'html',
          isPrivate: false,
          createdAt: 100,
        }),
      )

      await t.mutation(api.sessions.setThemeOverride, {
        sessionId,
        themeOverride: 'ocean',
        themeMode: 'dark',
      })

      const patched = await t.run(async (ctx) => ctx.db.get(sessionId))
      expect(patched?.themeOverride).toBe('ocean')
      expect(patched?.themeMode).toBe('dark')
      expect(patched?.updatedAt).toEqual(expect.any(Number))
      expect(patched?.updatedAt).toBeGreaterThan(100)
    })

    it('clears theme fields when null is passed', async () => {
      const t = convexTest(schema, modules)
      const sessionId = await t.run(async (ctx) =>
        ctx.db.insert('sessions', {
          prompt: 'A themed website',
          preferredLanguage: 'en',
          preferredExportTarget: 'html',
          isPrivate: false,
          createdAt: 100,
          themeOverride: 'sunset',
          themeMode: 'light',
        }),
      )

      await t.mutation(api.sessions.setThemeOverride, {
        sessionId,
        themeOverride: null,
        themeMode: null,
      })

      const patched = await t.run(async (ctx) => ctx.db.get(sessionId))
      expect(patched?.themeOverride).toBeUndefined()
      expect(patched?.themeMode).toBeUndefined()
      expect(patched?.updatedAt).toEqual(expect.any(Number))
      expect(patched?.updatedAt).toBeGreaterThan(100)
    })

    it('leaves theme fields untouched when they are omitted from the args', async () => {
      const t = convexTest(schema, modules)
      const sessionId = await t.run(async (ctx) =>
        ctx.db.insert('sessions', {
          prompt: 'A themed website',
          preferredLanguage: 'en',
          preferredExportTarget: 'html',
          isPrivate: false,
          createdAt: 100,
          themeOverride: 'forest',
          themeMode: 'light',
        }),
      )

      await t.mutation(api.sessions.setThemeOverride, {
        sessionId,
        themeOverride: 'ocean',
      })

      const patched = await t.run(async (ctx) => ctx.db.get(sessionId))
      expect(patched?.themeOverride).toBe('ocean')
      // themeMode was omitted from the mutation args, so it must be preserved.
      expect(patched?.themeMode).toBe('light')
    })
  })
})
