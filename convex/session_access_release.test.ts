/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'
import { hashOwnerSecret } from './lib/session_access_helpers'

const modules = import.meta.glob('./**/*.ts')

const ISSUER = 'https://clerk.test'

function asUser(t: ReturnType<typeof convexTest>, userId: string) {
  return t.withIdentity({
    issuer: ISSUER,
    subject: userId,
    tokenIdentifier: `${ISSUER}|${userId}`,
  })
}

async function insertSession(
  t: ReturnType<typeof convexTest>,
  input: {
    isPrivate: boolean
    userId?: string
    anonymousOwnerSecret?: string
    prompt?: string
  },
) {
  const anonOwnerSecretHash =
    input.anonymousOwnerSecret === undefined
      ? undefined
      : await hashOwnerSecret(input.anonymousOwnerSecret)

  return await t.run(async (ctx) =>
    ctx.db.insert('sessions', {
      userId: input.userId,
      anonOwnerSecretHash,
      workspace: 'release-session-access',
      prompt: input.prompt ?? 'Private release workspace',
      status: 'preview_ready',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: input.isPrivate,
      previewVersion: 1,
      createdAt: 1,
      updatedAt: 1,
    }),
  )
}

describe('registered session access boundaries', () => {
  it('requires authentication before claiming an anonymous session', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await insertSession(t, {
      isPrivate: true,
      anonymousOwnerSecret: 'correct-secret',
    })

    await expect(
      t.mutation(api.sessions.claimAnonymous, {
        sessionId,
        anonymousOwnerSecret: 'correct-secret',
      }),
    ).rejects.toMatchObject({
      data: expect.objectContaining({ code: 'AUTH_REQUIRED' }),
    })
  })

  it('rejects an incorrect anonymous owner secret', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await insertSession(t, {
      isPrivate: true,
      anonymousOwnerSecret: 'correct-secret',
    })

    await expect(
      asUser(t, 'alice').mutation(api.sessions.claimAnonymous, {
        sessionId,
        anonymousOwnerSecret: 'wrong-secret',
      }),
    ).rejects.toMatchObject({
      data: expect.objectContaining({ code: 'FORBIDDEN' }),
    })
  })

  it('claims an anonymous session once and transfers ownership to the caller', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await insertSession(t, {
      isPrivate: true,
      anonymousOwnerSecret: 'correct-secret',
    })
    const alice = asUser(t, 'alice')

    await expect(
      alice.mutation(api.sessions.claimAnonymous, {
        sessionId,
        anonymousOwnerSecret: 'correct-secret',
      }),
    ).resolves.toEqual({ sessionId })

    const claimed = await t.run(async (ctx) => ctx.db.get(sessionId))
    expect(claimed).toMatchObject({ userId: `${ISSUER}|alice` })
    expect(claimed?.anonOwnerSecretHash).toBeUndefined()

    await expect(
      alice.mutation(api.sessions.claimAnonymous, {
        sessionId,
        anonymousOwnerSecret: 'correct-secret',
      }),
    ).rejects.toMatchObject({
      data: expect.objectContaining({ code: 'ALREADY_OWNED' }),
    })
  })

  it('returns workspace data for a public session', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await insertSession(t, {
      isPrivate: false,
      prompt: 'Public release workspace',
    })

    await t.run(async (ctx) => {
      await ctx.db.insert('previews', {
        sessionId,
        version: 1,
        html: '<main>Public preview</main>',
        source: 'generation',
        createdAt: 1,
      })
    })

    await expect(
      t.query(api.sessions.getWorkspace, { sessionId }),
    ).resolves.toMatchObject({
      session: {
        sessionId,
        prompt: 'Public release workspace',
        isPrivate: false,
      },
      preview: { html: '<main>Public preview</main>' },
    })
  })

  it('does not expose a private workspace to an unauthenticated caller', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await insertSession(t, {
      isPrivate: true,
      userId: `${ISSUER}|alice`,
    })

    await t.run(async (ctx) => {
      await ctx.db.insert('previews', {
        sessionId,
        version: 1,
        html: '<main>Confidential customer preview</main>',
        source: 'generation',
        createdAt: 1,
      })
    })

    await expect(
      t.query(api.sessions.getWorkspace, { sessionId }),
    ).resolves.toBeNull()
  })

  it('does not expose a private workspace to another authenticated user', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await insertSession(t, {
      isPrivate: true,
      userId: `${ISSUER}|alice`,
    })

    await expect(
      asUser(t, 'bob').query(api.sessions.getWorkspace, { sessionId }),
    ).resolves.toBeNull()
  })

  it('returns a private workspace to its authenticated owner', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await insertSession(t, {
      isPrivate: true,
      userId: `${ISSUER}|alice`,
    })

    await expect(
      asUser(t, 'alice').query(api.sessions.getWorkspace, { sessionId }),
    ).resolves.toMatchObject({
      session: {
        sessionId,
        userId: `${ISSUER}|alice`,
        isPrivate: true,
      },
    })
  })

  it('does not expose a private generation view to another user', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await insertSession(t, {
      isPrivate: true,
      userId: `${ISSUER}|alice`,
    })

    await t.run(async (ctx) => {
      await ctx.db.insert('generatedModules', {
        sessionId,
        moduleKey: 'home',
        source: 'root = Text("Confidential launch plan")',
        status: 'succeeded',
        createdAt: 1,
        updatedAt: 1,
      })
    })

    await expect(
      asUser(t, 'bob').query(api.sessions.getGenerationView, {
        sessionId,
      }),
    ).resolves.toBeNull()
  })

  it('does not expose private session readiness to another user', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await insertSession(t, {
      isPrivate: true,
      userId: `${ISSUER}|alice`,
    })

    await expect(
      asUser(t, 'bob').query(api.sessions.getSessionReadiness, {
        sessionId,
      }),
    ).resolves.toBeNull()
  })

  it('does not expose private edit history to another user', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await insertSession(t, {
      isPrivate: true,
      userId: `${ISSUER}|alice`,
    })

    await t.run(async (ctx) => {
      await ctx.db.insert('edits', {
        sessionId,
        previewVersion: 2,
        editType: 'text',
        beforeText: 'Internal codename',
        afterText: 'Confidential product name',
        createdAt: 2,
        userId: `${ISSUER}|alice`,
      })
    })

    await expect(
      asUser(t, 'bob').query(api.sessions.listEdits, { lookup: sessionId }),
    ).resolves.toEqual([])
  })

  it('does not expose private preview history to another user', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await insertSession(t, {
      isPrivate: true,
      userId: `${ISSUER}|alice`,
    })

    await t.run(async (ctx) => {
      await ctx.db.insert('previews', {
        sessionId,
        version: 1,
        html: '<main>Confidential preview</main>',
        source: 'generation',
        createdAt: 1,
      })
    })

    await expect(
      asUser(t, 'bob').query(api.sessions.listPreviewHistory, {
        lookup: sessionId,
      }),
    ).resolves.toEqual([])
  })

  it('does not expose private clone page source to another user', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await insertSession(t, {
      isPrivate: true,
      userId: `${ISSUER}|alice`,
    })

    await t.run(async (ctx) => {
      await ctx.db.insert('clonePages', {
        sessionId,
        pathname: '/',
        html: '<main>Confidential cloned homepage</main>',
        isHome: true,
        failed: false,
        order: 0,
        byteLength: 43,
        createdAt: 1,
        updatedAt: 1,
      })
    })

    await expect(
      asUser(t, 'bob').query(api.sessions.listClonePages, {
        lookup: sessionId,
      }),
    ).resolves.toEqual([])
  })

  it('does not expose private compiled AI capsules to another user', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await insertSession(t, {
      isPrivate: true,
      userId: `${ISSUER}|alice`,
    })

    await t.run(async (ctx) => {
      await ctx.db.insert('aiCapsules', {
        sessionId,
        capsuleName: 'ConfidentialHero',
        parentCapsule: 'Hero',
        compiledJs: 'export default "confidential customer code"',
        description: 'Private generated capsule',
        createdAt: 1,
        updatedAt: 1,
      })
    })

    await expect(
      asUser(t, 'bob').query(api.sessions.listAiCapsules, { sessionId }),
    ).resolves.toEqual([])
  })

  it('does not expose private commerce configuration to another user', async () => {
    const t = convexTest(schema, modules)
    const sessionId = await insertSession(t, {
      isPrivate: true,
      userId: `${ISSUER}|alice`,
    })

    await t.run(async (ctx) => {
      await ctx.db.insert('commerceConfigs', {
        sessionId,
        status: 'ready',
        backendUrl: 'https://private-commerce.example.test',
        adminUrl: 'https://private-admin.example.test',
        storefrontUrl: 'https://private-store.example.test',
        configJson: '{"privateCatalog":"unreleased"}',
        createdAt: 1,
        updatedAt: 1,
      })
    })

    await expect(
      asUser(t, 'bob').query(api.sessions.getCommerceConfig, { sessionId }),
    ).resolves.toBeNull()
  })
})
