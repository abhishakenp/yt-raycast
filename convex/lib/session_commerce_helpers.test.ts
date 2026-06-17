import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import { hashOwnerSecret } from './session_access_helpers'
import {
  loadSessionCommerceConfig,
  provisionSessionMedusaTenant,
  syncSessionMedusaProducts,
  upsertSessionCommerceConfig,
} from './session_commerce_helpers'

type CommerceConfigDoc = Doc<'commerceConfigs'>

const sessionId = 'session_commerce' as Id<'sessions'>

const sessionDoc = async (ownerSecret = 'owner-secret') =>
  ({
    _id: sessionId,
    _creationTime: 1,
    prompt: 'Build a store',
    workspace: 'workspace_commerce',
    createdAt: 1,
    anonOwnerSecretHash: await hashOwnerSecret(ownerSecret),
  }) as Doc<'sessions'>

const commerceDoc = (
  overrides: Partial<CommerceConfigDoc> = {},
): CommerceConfigDoc =>
  ({
    _id: 'commerce_config' as Id<'commerceConfigs'>,
    _creationTime: 1,
    sessionId,
    status: 'ready',
    backendUrl: 'https://backend.old.test',
    adminUrl: 'https://admin.old.test',
    storefrontUrl: 'https://store.old.test',
    productCount: 0,
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  }) as CommerceConfigDoc

const ctxFor = async (
  options: {
    session?: Doc<'sessions'> | null
    configs?: CommerceConfigDoc[]
  } = {},
) => {
  const session =
    options.session === undefined ? await sessionDoc() : options.session
  const configs = [...(options.configs ?? [])]

  const ctx = {
    auth: {
      getUserIdentity: async () => null,
    },
    db: {
      get: async (id: string) => {
        if (id === sessionId) return session
        return configs.find((config) => config._id === id) ?? null
      },
      query: (table: string) => {
        expect(table).toBe('commerceConfigs')
        return {
          withIndex: (
            indexName: string,
            applyIndex: (index: {
              eq: (
                fieldName: string,
                fieldValue: unknown,
              ) => {
                field: string
                value: unknown
              }
            }) => { field: string; value: unknown },
          ) => {
            expect(indexName).toBe('by_sessionId')
            const { field, value } = applyIndex({
              eq: (fieldName, fieldValue) => ({
                field: fieldName,
                value: fieldValue,
              }),
            })
            expect(field).toBe('sessionId')
            return {
              first: async () =>
                configs.find((config) => config.sessionId === value) ?? null,
            }
          },
        }
      },
      insert: async (table: string, value: Record<string, unknown>) => {
        expect(table).toBe('commerceConfigs')
        const config = {
          _id: `commerce_config_${configs.length + 1}` as Id<'commerceConfigs'>,
          _creationTime: 1,
          ...value,
        } as CommerceConfigDoc
        configs.push(config)
        return config._id
      },
      patch: async (
        id: Id<'commerceConfigs'>,
        patch: Partial<CommerceConfigDoc>,
      ) => {
        const index = configs.findIndex((config) => config._id === id)
        expect(index).toBeGreaterThanOrEqual(0)
        configs[index] = {
          ...configs[index],
          ...patch,
        } as CommerceConfigDoc
      },
    },
  } as unknown as MutationCtx

  return { ctx, configs }
}

describe('session commerce helpers', () => {
  it('creates an owned commerce config', async () => {
    const { ctx, configs } = await ctxFor()

    await expect(
      upsertSessionCommerceConfig(ctx, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        backendUrl: 'https://backend.medusa.test',
        adminUrl: 'https://admin.medusa.test',
        storefrontUrl: 'https://store.medusa.test',
        configJson: '{"provider":"medusa"}',
      }),
    ).resolves.toEqual({ sessionId })

    expect(configs).toHaveLength(1)
    expect(configs[0]).toMatchObject({
      sessionId,
      status: 'ready',
      backendUrl: 'https://backend.medusa.test',
      adminUrl: 'https://admin.medusa.test',
      storefrontUrl: 'https://store.medusa.test',
      configJson: '{"provider":"medusa"}',
    })
  })

  it('updates an existing owned commerce config', async () => {
    const existing = commerceDoc()
    const { ctx, configs } = await ctxFor({ configs: [existing] })

    await upsertSessionCommerceConfig(ctx, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      backendUrl: 'https://backend.new.test',
      adminUrl: 'https://admin.new.test',
      storefrontUrl: 'https://store.new.test',
      errorMessage: 'warning',
    })

    expect(configs).toHaveLength(1)
    expect(configs[0]).toMatchObject({
      _id: existing._id,
      backendUrl: 'https://backend.new.test',
      adminUrl: 'https://admin.new.test',
      storefrontUrl: 'https://store.new.test',
      errorMessage: 'warning',
      status: 'ready',
    })
  })

  it('rejects commerce config writes without session ownership', async () => {
    const { ctx } = await ctxFor()

    await expect(
      upsertSessionCommerceConfig(ctx, {
        sessionId,
        anonymousOwnerSecret: 'wrong-secret',
      }),
    ).rejects.toMatchObject({
      data: {
        code: 'FORBIDDEN',
      },
    })
  })

  it('serializes commerce config for public reads', async () => {
    const { ctx } = await ctxFor({
      configs: [
        commerceDoc({
          productCount: 3,
          configJson: '{"ready":true}',
          errorMessage: 'partial',
        }),
      ],
    })

    await expect(loadSessionCommerceConfig(ctx, sessionId)).resolves.toEqual({
      configId: 'commerce_config',
      status: 'ready',
      backendUrl: 'https://backend.old.test',
      adminUrl: 'https://admin.old.test',
      storefrontUrl: 'https://store.old.test',
      productCount: 3,
      configJson: '{"ready":true}',
      errorMessage: 'partial',
      createdAt: 100,
      updatedAt: 100,
    })
  })

  it('provisions a Medusa tenant config with zero products by default', async () => {
    const { ctx, configs } = await ctxFor()

    await expect(
      provisionSessionMedusaTenant(ctx, {
        sessionId,
        backendUrl: 'https://backend.medusa.test',
        adminUrl: 'https://admin.medusa.test',
        storefrontUrl: 'https://store.medusa.test',
      }),
    ).resolves.toEqual({ success: true })

    expect(configs[0]).toMatchObject({
      sessionId,
      status: 'ready',
      productCount: 0,
      backendUrl: 'https://backend.medusa.test',
      adminUrl: 'https://admin.medusa.test',
      storefrontUrl: 'https://store.medusa.test',
    })
  })

  it('updates product count during Medusa sync', async () => {
    const { ctx, configs } = await ctxFor({ configs: [commerceDoc()] })

    await expect(
      syncSessionMedusaProducts(ctx, {
        sessionId,
        products: [
          {
            id: 'prod_1',
            title: 'First',
            handle: 'first',
            price: 12,
          },
          {
            id: 'prod_2',
            title: 'Second',
            handle: 'second',
            price: 24,
            description: 'Second product',
          },
        ],
      }),
    ).resolves.toEqual({ synced: 2 })

    expect(configs[0]?.productCount).toBe(2)
  })

  it('rejects Medusa sync before commerce is configured', async () => {
    const { ctx } = await ctxFor()

    await expect(
      syncSessionMedusaProducts(ctx, {
        sessionId,
        products: [],
      }),
    ).rejects.toMatchObject({
      data: {
        code: 'NOT_CONFIGURED',
        message: 'Medusa commerce config not found',
      },
    })
  })

  it('keeps session commerce and Medusa handlers delegated', () => {
    const sessionsSource = readFileSync('convex/sessions.ts', 'utf8')

    expect(sessionsSource).toContain(
      'handler: (ctx, args) => upsertSessionCommerceConfig(ctx, args)',
    )
    expect(sessionsSource).toContain(
      'handler: (ctx, args) => loadSessionCommerceConfig(ctx, args.sessionId)',
    )
    expect(sessionsSource).toContain(
      'handler: (ctx, args) => provisionSessionMedusaTenant(ctx, args)',
    )
    expect(sessionsSource).toContain(
      'handler: (ctx, args) => syncSessionMedusaProducts(ctx, args)',
    )
    expect(sessionsSource).not.toContain(
      "message: 'Medusa commerce config not found'",
    )
  })
})
