/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'
import {
  DAILY_WINDOW_MS,
  MAX_ANON_PER_DAY,
  MAX_FREE_PER_MONTH,
  MONTHLY_WINDOW_MS,
  RATE_WINDOW_MS,
} from '../src/billing/constants'

const modules = import.meta.glob('./**/*.ts')
const issuer = 'https://clerk.release.test'
const historicalRows = 37

function asUser(t: ReturnType<typeof convexTest>, userId: string) {
  return t.withIdentity({
    issuer,
    subject: userId,
    tokenIdentifier: `${issuer}|${userId}`,
  })
}

async function seedUserSessions(
  t: ReturnType<typeof convexTest>,
  userId: string,
  oldCount: number,
  currentCount: number,
  currentCreatedAt: number,
) {
  await t.run(async (ctx) => {
    const oldCreatedAt = Date.now() - MONTHLY_WINDOW_MS - 1_000
    for (let index = 0; index < oldCount; index += 1) {
      await ctx.db.insert('sessions', {
        userId,
        prompt: `Historical user generation ${index}`,
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        isPrivate: true,
        createdAt: oldCreatedAt - index,
      })
    }
    for (let index = 0; index < currentCount; index += 1) {
      await ctx.db.insert('sessions', {
        userId,
        prompt: `Current user generation ${index}`,
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        isPrivate: true,
        createdAt: currentCreatedAt - index,
      })
    }
  })
}

async function seedAnonymousSessions(
  t: ReturnType<typeof convexTest>,
  clientIpHash: string,
  oldCount: number,
  currentCount: number,
  currentCreatedAt: number,
) {
  await t.run(async (ctx) => {
    const oldCreatedAt = Date.now() - DAILY_WINDOW_MS - 1_000
    for (let index = 0; index < oldCount; index += 1) {
      await ctx.db.insert('sessions', {
        clientIpHash,
        prompt: `Historical anonymous generation ${index}`,
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        isPrivate: true,
        createdAt: oldCreatedAt - index,
      })
    }
    for (let index = 0; index < currentCount; index += 1) {
      await ctx.db.insert('sessions', {
        clientIpHash,
        prompt: `Current anonymous generation ${index}`,
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        isPrivate: true,
        createdAt: currentCreatedAt - index,
      })
    }
  })
}

function createPayload(workspace: string): {
  prompt: string
  preferredLanguage: string
  preferredExportTarget: 'html'
  isPrivate: boolean
  workspace: string
} {
  return {
    prompt: `Strict release quota verification for ${workspace}`,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: true,
    workspace,
  }
}

describe('generation quota checks with long account histories', () => {
  beforeEach(() => {
    vi.stubEnv('DISABLE_LIMIT', '')
    vi.stubEnv('IS_DEV', '')
    vi.stubEnv('OPENUI_HOME_MODEL', 'openai/gpt-oss-120b')
    vi.stubEnv('GROQ_API_KEY', '')
    vi.stubEnv('SHARE_BONUS_MUTATION_SECRET', 'test-server-secret')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('enforces the free monthly cap after more than 36 older sessions', async () => {
    const t = convexTest(schema, modules)
    const userId = `${issuer}|monthly-user`
    await seedUserSessions(
      t,
      userId,
      historicalRows,
      MAX_FREE_PER_MONTH,
      Date.now() - RATE_WINDOW_MS - 1_000,
    )

    await expect(
      asUser(t, 'monthly-user').mutation(
        api.sessions.create,
        { ...createPayload('monthly-long-history'), serverSecret: 'test-server-secret' },
      ),
    ).rejects.toMatchObject({
      data: expect.objectContaining({ code: 'QUOTA_EXCEEDED' }),
    })
  })

  it('enforces the anonymous daily cap after more than 36 older sessions', async () => {
    const t = convexTest(schema, modules)
    const clientIpHash = 'ip_hash_long_history'
    await seedAnonymousSessions(
      t,
      clientIpHash,
      historicalRows,
      MAX_ANON_PER_DAY,
      Date.now() - RATE_WINDOW_MS - 1_000,
    )

    await expect(
      t.mutation(api.sessions.create, {
        ...createPayload('anonymous-daily-long-history'),
        clientIpHash,
        serverSecret: 'test-server-secret',
        anonymousOwnerSecret: 'anonymous-owner-secret',
      }),
    ).rejects.toMatchObject({
      data: expect.objectContaining({ code: 'QUOTA_EXCEEDED' }),
    })
  })

  it('enforces the short-window rate limit after a long account history', async () => {
    const t = convexTest(schema, modules)
    const userId = `${issuer}|rate-user`
    await seedUserSessions(t, userId, historicalRows, 5, Date.now())

    await expect(
      asUser(t, 'rate-user').mutation(
        api.sessions.create,
        { ...createPayload('rate-long-history'), serverSecret: 'test-server-secret' },
      ),
    ).rejects.toMatchObject({
      data: expect.objectContaining({ code: 'RATE_LIMITED' }),
    })
  })
})
