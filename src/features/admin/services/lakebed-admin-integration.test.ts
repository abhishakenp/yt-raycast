import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api } from '../../../../convex/_generated/api'
import schema from '../../../../convex/schema'
import {
  canAddRowsToTable,
  createLakebedAdminTables,
} from './lakebed-admin-model'
import { buildCapsuleSchemaRegistry } from './capsule-schema-registry'

const modules = import.meta.glob('../../../../convex/**/*.ts')
const convexApi = api as any
const ownerSecret = 'lakebed-owner-secret'

async function createSession(t: any, anonymousClientId: string) {
  const result = await t.mutation(api.sessions.create, {
    anonymousClientId,
    anonymousOwnerSecret: ownerSecret,
    isPrivate: false,
    preferredExportTarget: 'html',
    preferredLanguage: 'en',
    prompt: 'Admin integration test',
    workspace: `workspace_${anonymousClientId}`,
  })
  return result.sessionId
}

// The restaurant lakebed has dataKey 'Restaurant' and defines these tables:
// catalog, orderItems, reservations, selections, state
const RESTAURANT_TABLES = [
  'catalog',
  'orderItems',
  'reservations',
  'selections',
  'state',
].sort()

describe('lakebed admin integration: convex-test → schema-aware model', () => {
  it('flows real DB sessionData through the schema-aware admin model', async () => {
    const t = convexTest(schema, modules) as any
    const sessionId = await createSession(t, 'admin-int-1')

    // Seed sessionData with capsule = dataKey ('Restaurant') as production does
    await t.mutation(convexApi.lakebed.replaceSessionData, {
      anonymousOwnerSecret: ownerSecret,
      capsule: 'Restaurant',
      data: {
        catalog: [
          { name: 'Ramen', price: '12', category: 'Mains', tag: 'hot' },
          { name: 'Gyoza', price: '6', category: 'Sides' },
        ],
        reservations: [{ source: 'web', label: 'Party of 4' }],
      },
      sessionId,
    })

    // Query the real listSessionData endpoint
    const docs = await t.query(convexApi.lakebed.listSessionData, {
      anonymousOwnerSecret: ownerSecret,
      sessionId,
    })

    expect(docs).toHaveLength(1)
    expect(docs[0].capsule).toBe('Restaurant')

    // Feed real DB output through the schema-aware model
    const registry = buildCapsuleSchemaRegistry()
    const tables = createLakebedAdminTables(docs, registry)

    const tableNames = tables.map((tbl) => tbl.name).sort()
    expect(tableNames).toEqual(RESTAURANT_TABLES)

    // catalog has real rows from the seeded data
    const catalog = tables.find((tbl) => tbl.name === 'catalog')
    expect(catalog).toBeDefined()
    expect(catalog!.rows).toHaveLength(2)
    expect(catalog!.rows[0].cells).toMatchObject({
      name: 'Ramen',
      price: '12',
      category: 'Mains',
    })

    // Schema-defined columns appear even for rows missing fields
    // Gyoza row has no tag, but tag is in the schema
    expect(catalog!.columns).toContain('tag')
    expect(catalog!.columns).toContain('description')

    // orderItems is empty (no seeded data) but still appears from schema
    const orderItems = tables.find((tbl) => tbl.name === 'orderItems')
    expect(orderItems).toBeDefined()
    expect(orderItems!.rows).toHaveLength(0)
    expect(orderItems!.columns).toContain('name')
    expect(orderItems!.columns).toContain('quantity')

    // reservations has real rows
    const reservations = tables.find((tbl) => tbl.name === 'reservations')
    expect(reservations).toBeDefined()
    expect(reservations!.rows).toHaveLength(1)
    expect(reservations!.rows[0].cells).toMatchObject({
      source: 'web',
      label: 'Party of 4',
    })

    // Empty schema tables allow adding rows
    expect(canAddRowsToTable(orderItems!)).toBe(true)
    // Populated single-source tables also allow adding
    expect(canAddRowsToTable(catalog!)).toBe(true)
  })

  it('shows schema tables with correct field types from real DB data', async () => {
    const t = convexTest(schema, modules) as any
    const sessionId = await createSession(t, 'admin-int-2')

    await t.mutation(convexApi.lakebed.replaceSessionData, {
      anonymousOwnerSecret: ownerSecret,
      capsule: 'Restaurant',
      data: {
        orderItems: [{ name: 'Ramen', quantity: 3, price: '12' }],
      },
      sessionId,
    })

    const docs = await t.query(convexApi.lakebed.listSessionData, {
      anonymousOwnerSecret: ownerSecret,
      sessionId,
    })

    const registry = buildCapsuleSchemaRegistry()
    const tables = createLakebedAdminTables(docs, registry)

    const orderItems = tables.find((tbl) => tbl.name === 'orderItems')
    expect(orderItems).toBeDefined()
    expect(orderItems!.fieldTypes).toMatchObject({
      name: 'string',
      quantity: 'number',
      price: 'string',
    })
    expect(orderItems!.rows).toHaveLength(1)
    expect(orderItems!.rows[0].cells).toMatchObject({
      name: 'Ramen',
      quantity: 3,
    })
  })

  it('merges schema tables across multiple capsule instances from real DB', async () => {
    const t = convexTest(schema, modules) as any
    const sessionId = await createSession(t, 'admin-int-3')

    // Two capsule instances of the same dataKey with the same table
    await t.mutation(convexApi.lakebed.replaceSessionData, {
      anonymousOwnerSecret: ownerSecret,
      capsule: 'Restaurant:home_story',
      data: {
        catalog: [{ name: 'Ramen' }],
      },
      sessionId,
    })
    await t.mutation(convexApi.lakebed.mergeSessionData, {
      anonymousOwnerSecret: ownerSecret,
      capsule: 'Restaurant:menu_story',
      patch: { catalog: [{ name: 'Gyoza' }] },
      sessionId,
    })

    const docs = await t.query(convexApi.lakebed.listSessionData, {
      anonymousOwnerSecret: ownerSecret,
      sessionId,
    })

    expect(docs).toHaveLength(2)

    const registry = buildCapsuleSchemaRegistry()
    const tables = createLakebedAdminTables(docs, registry)

    const catalog = tables.find((tbl) => tbl.name === 'catalog')
    expect(catalog).toBeDefined()
    expect(catalog!.rows).toHaveLength(2)
    expect(catalog!.sourceCapsules).toHaveLength(2)
    // Merged table should not allow adding rows
    expect(canAddRowsToTable(catalog!)).toBe(false)
  })

  it('handles empty sessionData doc with schema (all tables empty)', async () => {
    const t = convexTest(schema, modules) as any
    const sessionId = await createSession(t, 'admin-int-4')

    await t.mutation(convexApi.lakebed.replaceSessionData, {
      anonymousOwnerSecret: ownerSecret,
      capsule: 'Restaurant',
      data: {},
      sessionId,
    })

    const docs = await t.query(convexApi.lakebed.listSessionData, {
      anonymousOwnerSecret: ownerSecret,
      sessionId,
    })

    const registry = buildCapsuleSchemaRegistry()
    const tables = createLakebedAdminTables(docs, registry)

    // All schema tables appear but are empty
    const tableNames = tables.map((tbl) => tbl.name).sort()
    expect(tableNames).toEqual(RESTAURANT_TABLES)

    for (const table of tables) {
      expect(table.rows).toHaveLength(0)
      expect(table.columns.length).toBeGreaterThan(1) // _id + schema fields
    }
  })

  it('produces no tables for capsules without a matching dataKey schema', async () => {
    const t = convexTest(schema, modules) as any
    const sessionId = await createSession(t, 'admin-int-5')

    // Use a capsule name that does NOT match any block registry dataKey.
    // Section prop docs are stored under component names like this and must
    // NOT produce admin tables — only lakebed.schema dataKey docs should.
    await t.mutation(convexApi.lakebed.replaceSessionData, {
      anonymousOwnerSecret: ownerSecret,
      capsule: 'UnknownComponent:home_unknown',
      data: {
        customItems: [{ id: 'x1', label: 'Custom' }],
        heading: 'A section prop',
        body: 'Scalar prop content',
      },
      sessionId,
    })

    const docs = await t.query(convexApi.lakebed.listSessionData, {
      anonymousOwnerSecret: ownerSecret,
      sessionId,
    })

    const registry = buildCapsuleSchemaRegistry()
    const tables = createLakebedAdminTables(docs, registry)

    expect(tables).toHaveLength(0)
  })

  it('ignores section-capsule prop docs even when a lakebed schema exists for that vertical', async () => {
    const t = convexTest(schema, modules) as any
    const sessionId = await createSession(t, 'admin-int-6')

    // Real restaurant lakebed data under the dataKey
    await t.mutation(convexApi.lakebed.replaceSessionData, {
      anonymousOwnerSecret: ownerSecret,
      capsule: 'Restaurant',
      data: {
        catalog: [{ name: 'Ramen', price: '12' }],
      },
      sessionId,
    })
    // Section prop docs stored under component names — these used to leak
    // heading/body/reviews/images tables into the admin via runtime inference
    await t.mutation(convexApi.lakebed.mergeSessionData, {
      anonymousOwnerSecret: ownerSecret,
      capsule: 'RestaurantStory:home_story',
      patch: {
        body: 'Our story',
        heading: 'From Homebrew',
        alt: [{ title: 'Award', description: 'Gold medal' }],
      },
      sessionId,
    })
    await t.mutation(convexApi.lakebed.mergeSessionData, {
      anonymousOwnerSecret: ownerSecret,
      capsule: 'RestaurantGallery:home_gallery',
      patch: {
        heading: 'Taproom',
        images: [{ alt: 'bar area' }],
      },
      sessionId,
    })

    const docs = await t.query(convexApi.lakebed.listSessionData, {
      anonymousOwnerSecret: ownerSecret,
      sessionId,
    })

    const registry = buildCapsuleSchemaRegistry()
    const tables = createLakebedAdminTables(docs, registry)

    const tableNames = tables.map((tbl) => tbl.name).sort()
    expect(tableNames).toEqual(RESTAURANT_TABLES)
    // No prop-derived garbage tables
    expect(tables.find((tbl) => tbl.name === 'heading')).toBeUndefined()
    expect(tables.find((tbl) => tbl.name === 'body')).toBeUndefined()
    expect(tables.find((tbl) => tbl.name === 'alt')).toBeUndefined()
    expect(tables.find((tbl) => tbl.name === 'images')).toBeUndefined()
    expect(tables.find((tbl) => tbl.name === 'reviews')).toBeUndefined()
  })
})
