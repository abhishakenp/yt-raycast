import { describe, it, expect } from 'vitest'
import { generateLakebedClient } from './lakebed-client-codegen'
import type { LakebedDefinition } from './types'

const empty: LakebedDefinition = { tables: [], queries: [], mutations: [] }

describe('generateLakebedClient', () => {
  it('generates a module with empty queries/mutations', () => {
    const out = generateLakebedClient(empty)
    expect(out).toContain("import { ConvexClient } from 'convex/browser'")
    expect(out).toContain('export const queries = {')
    expect(out).toContain('export const mutations = {')
    expect(out).toContain('export { client }')
  })

  it('generates a no-arg query method', () => {
    const def: LakebedDefinition = {
      ...empty,
      queries: [
        {
          name: 'listMenu',
          table: 'menuItems',
          body: 'return ctx.db.query("menuItems").collect()',
        },
      ],
    }
    const out = generateLakebedClient(def)
    expect(out).toContain("listMenu: () => client.query('listMenu')")
    // No args object passed
    expect(out).not.toContain("'listMenu', {")
  })

  it('parses args.field references from body and generates typed signature', () => {
    const def: LakebedDefinition = {
      ...empty,
      queries: [
        {
          name: 'getMenuItem',
          table: 'menuItems',
          body: 'return ctx.db.query("menuItems").filter(q => q.eq(q.field("name"), args.name)).first()',
        },
      ],
    }
    const out = generateLakebedClient(def)
    expect(out).toContain('getMenuItem: (name) => client.query')
    expect(out).toContain("{ 'name': name }")
  })

  it('dedupes repeated args.field references', () => {
    const def: LakebedDefinition = {
      ...empty,
      mutations: [
        {
          name: 'updateOrder',
          table: 'orderItems',
          body: 'if (args.qty < 1) throw new Error(); await ctx.db.patch(args.id, { qty: args.qty })',
        },
      ],
    }
    const out = generateLakebedClient(def)
    // args.qty appears first in body → signature (qty, id); both args deduped
    expect(out).toContain('updateOrder: (qty, id) => client.mutation')
    expect(out).toContain("{ 'qty': qty, 'id': id }")
  })

  it('generates mutation methods with args', () => {
    const def: LakebedDefinition = {
      ...empty,
      mutations: [
        {
          name: 'addMenuItem',
          table: 'menuItems',
          body: 'await ctx.db.insert("menuItems", { name: args.name, price: args.price })',
        },
      ],
    }
    const out = generateLakebedClient(def)
    expect(out).toContain('addMenuItem: (name, price) => client.mutation')
    expect(out).toContain("{ 'name': name, 'price': price }")
  })

  it('includes the convex URL bootstrap from env', () => {
    const out = generateLakebedClient(empty)
    expect(out).toContain('import.meta.env.VITE_CONVEX_URL')
    expect(out).toContain('new ConvexClient(convexUrl)')
  })

  it('emits a header comment marking the file auto-generated', () => {
    const out = generateLakebedClient(empty)
    expect(out).toContain('Auto-generated')
    expect(out).toContain('Do not edit')
  })

  it('handles multiple queries and mutations together', () => {
    const def: LakebedDefinition = {
      ...empty,
      queries: [
        {
          name: 'listMenu',
          table: 'menuItems',
          body: 'return ctx.db.query("menuItems").collect()',
        },
        {
          name: 'getReservations',
          table: 'reservations',
          body: 'return ctx.db.query("reservations").filter(q => q.eq(q.field("date"), args.date)).collect()',
        },
      ],
      mutations: [
        {
          name: 'addMenuItem',
          table: 'menuItems',
          body: 'await ctx.db.insert("menuItems", { name: args.name })',
        },
        {
          name: 'cancelReservation',
          table: 'reservations',
          body: 'await ctx.db.patch(args.id, { cancelled: true })',
        },
      ],
    }
    const out = generateLakebedClient(def)
    expect(out).toContain("listMenu: () => client.query('listMenu')")
    expect(out).toContain('getReservations: (date) => client.query')
    expect(out).toContain('addMenuItem: (name) => client.mutation')
    expect(out).toContain('cancelReservation: (id) => client.mutation')
  })
})
