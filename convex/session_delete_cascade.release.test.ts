/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const issuer = 'https://clerk.release.test'

function sessionDeleteTest() {
  return convexTest(schema, modules)
}

function asUser(t: ReturnType<typeof sessionDeleteTest>, userId: string) {
  return t.withIdentity({
    issuer,
    subject: userId,
    tokenIdentifier: `${issuer}|${userId}`,
  })
}

async function insertSessionGraph(
  t: ReturnType<typeof sessionDeleteTest>,
  userId: string,
  suffix: string,
) {
  return await t.run(async (ctx) => {
    const commerceInstanceId = await ctx.db.insert('commerceInstances', {
      ownerUserId: userId,
      status: 'ready',
      provider: 'medusa',
      providerReference: `stack-${suffix}`,
      backendUrl: `https://backend-instance-${suffix}.example`,
      adminUrl: `https://admin-instance-${suffix}.example`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    const now = Date.now()
    const sessionId = await ctx.db.insert('sessions', {
      userId,
      prompt: `Delete cascade ${suffix}`,
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      status: 'preview_ready',
      previewVersion: 1,
      createdAt: now,
    })
    await ctx.db.insert('tasks', {
      sessionId,
      taskKey: 'homepage',
      title: 'Homepage',
      status: 'succeeded',
      createdAt: now,
    })
    await ctx.db.insert('generationEvents', {
      sessionId,
      eventType: 'preview_ready',
      createdAt: now,
    })
    await ctx.db.insert('usageMetrics', {
      sessionId,
      eventType: 'generation',
      timestamp: now,
      elapsedMs: 100,
      cost: 0.01,
      provider: 'release-provider',
      userId,
    })
    await ctx.db.insert('generatedModules', {
      sessionId,
      moduleKey: 'home',
      source: 'root = Page({})',
      status: 'succeeded',
      createdAt: now,
      updatedAt: now,
    })
    await ctx.db.insert('clonePages', {
      sessionId,
      pathname: '/',
      html: '<main>Clone</main>',
      isHome: true,
      failed: false,
      order: 0,
      byteLength: 18,
      createdAt: now,
      updatedAt: now,
    })
    await ctx.db.insert('siteSpecs', {
      sessionId,
      specJson: '{"pages":{"home":"root = Page({})"}}',
      createdAt: now,
      updatedAt: now,
    })
    await ctx.db.insert('previews', {
      sessionId,
      version: 1,
      createdAt: now,
      source: 'generation',
    })
    await ctx.db.insert('edits', {
      sessionId,
      previewVersion: 1,
      editType: 'text',
      beforeText: 'Release',
      afterText: 'Deleted',
      createdAt: now,
      userId,
    })
    await ctx.db.insert('exports', {
      sessionId,
      target: 'html',
      status: 'ready',
      previewVersion: 1,
      createdAt: now,
      updatedAt: now,
    })
    await ctx.db.insert('exportArtifacts', {
      sessionId,
      target: 'html',
      previewVersion: 1,
      status: 'queued',
      createdAt: now,
      updatedAt: now,
    })
    const deploymentId = await ctx.db.insert('deployments', {
      sessionId,
      slug: `delete-${suffix}`,
      url: `https://delete-${suffix}.example`,
      status: 'ready',
      createdAt: now,
      updatedAt: now,
    })
    await ctx.db.insert('commerceConfigs', {
      sessionId,
      status: 'ready',
      createdAt: now,
      updatedAt: now,
    })
    await ctx.db.insert('commerceTenants', {
      deploymentId,
      sessionId,
      deploymentSlug: `delete-${suffix}`,
      provider: 'medusa',
      status: 'ready',
      syncStatus: 'ready',
      backendUrl: `https://backend-${suffix}.example`,
      adminUrl: `https://admin-${suffix}.example`,
      storefrontUrl: `https://storefront-${suffix}.example`,
      createdAt: now,
      updatedAt: now,
    })
    await ctx.db.insert('commerceStores', {
      commerceInstanceId,
      sessionId,
      deploymentId,
      status: 'ready',
      syncStatus: 'ready',
      providerStoreId: `store-${suffix}`,
      publishableKey: `pk_${suffix}`,
      createdAt: now,
      updatedAt: now,
    })
    await ctx.db.insert('genuiModules', {
      sessionId,
      moduleId: 'home',
      text: 'root = Page({})',
      failed: false,
      startedAt: now,
      completedAt: now,
    })
    await ctx.db.insert('previewHistory', {
      sessionId,
      html: '<main>History</main>',
      timestamp: now,
    })
    await ctx.db.insert('sessionData', {
      sessionId,
      capsule: 'Store',
      ownerKey: `user:${userId}`,
      userId,
      data: { cartCount: 1 },
      createdAt: now,
      updatedAt: now,
    })
    await ctx.db.insert('themeOverrides', {
      sessionId,
      themeName: 'release-theme',
      styles: { color: '#000000' },
      createdAt: now,
    })
    await ctx.db.insert('aiCapsules', {
      sessionId,
      capsuleName: 'ReleaseCapsule',
      parentCapsule: 'Root',
      compiledJs: 'module.exports = {}',
      description: 'Release cascade fixture',
      createdAt: now,
      updatedAt: now,
    })
    const storageId = await ctx.storage.store(
      new Blob(['release-image'], { type: 'image/png' }),
    )
    await ctx.db.insert('userImages', {
      sessionId,
      storageId,
      filename: 'release.png',
      contentType: 'image/png',
      size: 13,
      createdAt: now,
    })
    return { sessionId, commerceInstanceId }
  })
}

async function graphCounts(
  t: ReturnType<typeof sessionDeleteTest>,
  graph: Awaited<ReturnType<typeof insertSessionGraph>>,
) {
  const { sessionId, commerceInstanceId } = graph
  return await t.run(async (ctx) => {
    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .collect()
    const events = await ctx.db
      .query('generationEvents')
      .withIndex('by_sessionId_createdAt', (index) =>
        index.eq('sessionId', sessionId),
      )
      .collect()
    const usage = await ctx.db
      .query('usageMetrics')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .collect()
    const modulesForSession = await ctx.db
      .query('generatedModules')
      .withIndex('by_sessionId_moduleKey', (index) =>
        index.eq('sessionId', sessionId),
      )
      .collect()
    const clonePages = await ctx.db
      .query('clonePages')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .collect()
    const siteSpecs = await ctx.db
      .query('siteSpecs')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .collect()
    const previews = await ctx.db
      .query('previews')
      .withIndex('by_sessionId_version', (index) =>
        index.eq('sessionId', sessionId),
      )
      .collect()
    const edits = await ctx.db
      .query('edits')
      .withIndex('by_sessionId_createdAt', (index) =>
        index.eq('sessionId', sessionId),
      )
      .collect()
    const exportsForSession = await ctx.db
      .query('exports')
      .withIndex('by_sessionId_target', (index) =>
        index.eq('sessionId', sessionId),
      )
      .collect()
    const artifacts = await ctx.db
      .query('exportArtifacts')
      .withIndex('by_sessionId_target', (index) =>
        index.eq('sessionId', sessionId),
      )
      .collect()
    const deployments = await ctx.db
      .query('deployments')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .collect()
    const commerceConfigs = await ctx.db
      .query('commerceConfigs')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .collect()
    const commerceTenants = await ctx.db
      .query('commerceTenants')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .collect()
    const commerceStores = await ctx.db
      .query('commerceStores')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .collect()
    const commerceInstance = await ctx.db.get(commerceInstanceId)
    const genuiModules = await ctx.db
      .query('genuiModules')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .collect()
    const previewHistory = await ctx.db
      .query('previewHistory')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .collect()
    const sessionData = await ctx.db
      .query('sessionData')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .collect()
    const themeOverrides = await ctx.db
      .query('themeOverrides')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .collect()
    const aiCapsules = await ctx.db
      .query('aiCapsules')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .collect()
    const userImages = await ctx.db
      .query('userImages')
      .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
      .collect()

    return {
      aiCapsules: aiCapsules.length,
      artifacts: artifacts.length,
      clonePages: clonePages.length,
      commerceConfigs: commerceConfigs.length,
      commerceInstanceExists: commerceInstance !== null,
      commerceStores: commerceStores.length,
      commerceTenants: commerceTenants.length,
      deployments: deployments.length,
      edits: edits.length,
      events: events.length,
      exports: exportsForSession.length,
      genuiModules: genuiModules.length,
      modules: modulesForSession.length,
      previewHistory: previewHistory.length,
      previews: previews.length,
      session: (await ctx.db.get(sessionId))?.deletedAt !== undefined ? 0 : 1,
      sessionData: sessionData.length,
      siteSpecs: siteSpecs.length,
      tasks: tasks.length,
      themeOverrides: themeOverrides.length,
      usage: usage.length,
      userImages: userImages.length,
    }
  })
}

const emptyGraph = {
  aiCapsules: 0,
  artifacts: 0,
  clonePages: 0,
  commerceConfigs: 0,
  // commerceInstances is customer-owned and outlives the session/deployment
  // it was first provisioned from, so it must survive session deletion even
  // though every other row in the graph is gone.
  commerceInstanceExists: true,
  commerceStores: 0,
  commerceTenants: 0,
  deployments: 0,
  edits: 0,
  events: 0,
  exports: 0,
  genuiModules: 0,
  modules: 0,
  previewHistory: 0,
  previews: 0,
  session: 0,
  sessionData: 0,
  siteSpecs: 0,
  tasks: 0,
  themeOverrides: 0,
  usage: 0,
  userImages: 0,
}

describe('session deletion persistence boundaries', () => {
  it('deletes every persisted record owned by the deleted session', async () => {
    const t = sessionDeleteTest()
    const userId = `${issuer}|delete-owner`
    const graph = await insertSessionGraph(t, userId, 'owned')

    await expect(
      asUser(t, 'delete-owner').mutation(api.sessions.deleteMine, {
        sessionId: graph.sessionId,
      }),
    ).resolves.toEqual({ deleted: 1 })
    await expect(graphCounts(t, graph)).resolves.toEqual(emptyGraph)
  })

  it('cascades only the selected owned session and preserves foreign graphs', async () => {
    const t = sessionDeleteTest()
    const owned = await insertSessionGraph(
      t,
      `${issuer}|delete-owner`,
      'selected',
    )
    const foreign = await insertSessionGraph(
      t,
      `${issuer}|foreign-owner`,
      'foreign',
    )

    await asUser(t, 'delete-owner').mutation(api.sessions.deleteMine, {
      sessionId: owned.sessionId,
    })

    expect({
      foreign: await graphCounts(t, foreign),
      owned: await graphCounts(t, owned),
    }).toEqual({
      foreign: {
        aiCapsules: 1,
        artifacts: 1,
        clonePages: 1,
        commerceConfigs: 1,
        commerceInstanceExists: true,
        commerceStores: 1,
        commerceTenants: 1,
        deployments: 1,
        edits: 1,
        events: 1,
        exports: 1,
        genuiModules: 1,
        modules: 1,
        previewHistory: 1,
        previews: 1,
        session: 1,
        sessionData: 1,
        siteSpecs: 1,
        tasks: 1,
        themeOverrides: 1,
        usage: 1,
        userImages: 1,
      },
      owned: emptyGraph,
    })
  })

  it('makes repeated deletion a harmless no-op', async () => {
    const t = sessionDeleteTest()
    const userId = `${issuer}|delete-owner`
    const { sessionId } = await insertSessionGraph(t, userId, 'replay')
    const owner = asUser(t, 'delete-owner')

    await owner.mutation(api.sessions.deleteMine, { sessionId })
    await expect(
      owner.mutation(api.sessions.deleteMine, { sessionId }),
    ).resolves.toEqual({ deleted: 0 })
  })
})
