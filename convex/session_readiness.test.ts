import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'

import { api } from './_generated/api'
import type { Id } from './_generated/dataModel'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

test('getSessionReadiness returns computed readiness through the public Convex query', async () => {
  const t = convexTest(schema, modules)

  const sessionId = await t.run(async (ctx) =>
    ctx.db.insert('sessions', {
      prompt: 'Build a public readiness query page',
      workspace: 'workspace_readiness_public',
      status: 'streaming',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      createdAt: 100,
      updatedAt: 120,
    }),
  )

  await t.run(async (ctx) => {
    await ctx.db.insert('tasks', {
      sessionId,
      taskKey: 'homepage',
      title: 'Generate homepage',
      status: 'succeeded',
      order: 1,
      createdAt: 100,
      updatedAt: 120,
    })
    await ctx.db.insert('tasks', {
      sessionId,
      taskKey: 'openui',
      title: 'Render OpenUI',
      status: 'running',
      order: 2,
      createdAt: 101,
      updatedAt: 121,
    })
    await ctx.db.insert('previews', {
      sessionId,
      version: 1,
      createdAt: 122,
      source: 'generation',
    })
    await ctx.db.insert('siteSpecs', {
      sessionId,
      specJson: '{"projectName":"Readiness"}',
      createdAt: 123,
      updatedAt: 123,
    })
    await ctx.db.insert('generatedModules', {
      sessionId,
      moduleKey: 'home',
      source: '$page = "Home"',
      status: 'succeeded',
      createdAt: 124,
      updatedAt: 124,
    })
  })

  const result = await t.query(api.sessions.getSessionReadiness, {
    lookup: sessionId as Id<'sessions'>,
  })

  expect(result).toMatchObject({
    session: {
      sessionId,
      status: 'streaming',
    },
    readiness: {
      homepageReady: true,
      openuiReady: true,
      siteSpecReady: true,
      done: 1,
      taskCount: 2,
    },
  })
})

test('getSessionReadiness accepts sessionId arg for backward compatibility with stale clients', async () => {
  const t = convexTest(schema, modules)

  const sessionId = await t.run(async (ctx) =>
    ctx.db.insert('sessions', {
      prompt: 'Backward compat readiness',
      workspace: 'workspace_readiness_compat',
      status: 'preview_ready',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      createdAt: 100,
      updatedAt: 120,
    }),
  )

  // Stale clients send { sessionId } instead of { lookup } — the query must
  // resolve the session from either field without an ArgumentValidationError.
  const result = await t.query(api.sessions.getSessionReadiness, {
    sessionId: sessionId as Id<'sessions'>,
  })

  expect(result).toMatchObject({
    session: {
      sessionId,
      status: 'preview_ready',
    },
    readiness: {
      homepageReady: true,
      openuiReady: false,
      siteSpecReady: true,
    },
  })
})

test('getSessionReadiness returns null when neither lookup nor sessionId is provided', async () => {
  const t = convexTest(schema, modules)

  const result = await t.query(api.sessions.getSessionReadiness, {})

  expect(result).toBeNull()
})
