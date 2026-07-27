import { describe, it, expect, vi } from 'vitest'
import type { InteractionProfile, ParsedSitePlan } from './types'

// Mock ./kinds — getDefaultFamily maps kind → default family
vi.mock('./kinds', () => ({
  getDefaultFamily: (kind: string) => {
    if (kind === 'restaurant') return 'Restaurant'
    if (kind === 'commerce') return 'Ecommerce'
    return 'Marketing'
  },
}))

// Mock ../interactions — component → InteractionProfile
const MOCK_INTERACTIONS: Record<string, InteractionProfile> = {
  RestaurantMenu: {
    profiles: ['collection', 'cart'],
    seedTable: 'menuItems',
    seedFields: ['name', 'description', 'price', 'tag'],
    cartTable: 'orderItems',
    cartKey: 'name',
    operations: {
      listCollection: 'menuCatalog',
      syncCollection: 'syncMenuCatalog',
      orderSummary: 'restaurantOrder',
      addToOrder: 'addMenuItem',
      removeFromOrder: 'removeMenuItem',
      clearOrder: 'clearRestaurantOrder',
    },
  },
  RestaurantReservations: {
    profiles: ['submission'],
    submissionTable: 'reservations',
    submissionFields: ['label', 'source'],
    operations: {
      submissionSummary: 'restaurantExperience',
      submit: 'reserveTable',
    },
  },
  RestaurantHero: { profiles: ['none'], operations: {} },
  EcommerceProducts: {
    profiles: ['collection'],
    seedTable: 'products',
    seedFields: ['name', 'price', 'imageAlt'],
    operations: {
      listCollection: 'productCatalog',
      syncCollection: 'syncProducts',
    },
  },
}

vi.mock('./interactions', () => ({
  INTERACTIONS: MOCK_INTERACTIONS,
  getInteraction: (component: string) => MOCK_INTERACTIONS[component] ?? null,
}))

// Import after mocks are set up
const { inferLakebed } = await import('./inference')

function plan(
  sections: ParsedSitePlan['sections'],
  extra: Partial<ParsedSitePlan> = {},
): ParsedSitePlan {
  return {
    kind: 'restaurant',
    sections,
    pages: [],
    ...extra,
  }
}

describe('inferLakebed', () => {
  it('single-profile section generates lakebed', () => {
    const p = plan([{ role: 'reservations', content: ['Book a Table'] }])
    const def = inferLakebed(p, 'restaurant')
    // submission macro → reservations table
    const reservationsTable = def.tables.find((t) => t.name === 'reservations')
    expect(reservationsTable).toBeDefined()
    expect(reservationsTable!.fields.label.seedFromProps).toBe(false)
    // operation name mapping: submissionSummary → restaurantExperience, submit → reserveTable
    expect(def.queries.some((q) => q.name === 'restaurantExperience')).toBe(
      true,
    )
    expect(def.mutations.some((m) => m.name === 'reserveTable')).toBe(true)
  })

  it('multi-profile section (collection+cart) generates both', () => {
    const p = plan([{ role: 'menu', content: ['Autumn Menu'] }])
    const def = inferLakebed(p, 'restaurant')
    // collection → menuItems table (seeded)
    const menuTable = def.tables.find((t) => t.name === 'menuItems')
    expect(menuTable).toBeDefined()
    expect(menuTable!.fields.name.seedFromProps).toBe(true)
    // cart → orderItems table with quantity
    const orderTable = def.tables.find((t) => t.name === 'orderItems')
    expect(orderTable).toBeDefined()
    expect(orderTable!.fields.quantity.type).toBe('number')
    // operation name mapping applied
    expect(def.queries.some((q) => q.name === 'menuCatalog')).toBe(true)
    expect(def.queries.some((q) => q.name === 'restaurantOrder')).toBe(true)
    expect(def.mutations.some((m) => m.name === 'syncMenuCatalog')).toBe(true)
    expect(def.mutations.some((m) => m.name === 'addMenuItem')).toBe(true)
  })

  it('deduplicates tables across sections (same table name merges fields)', () => {
    // Two menu sections both generate menuItems — should dedupe to 1
    const p2: ParsedSitePlan = {
      kind: 'restaurant',
      sections: [
        { role: 'menu', content: ['Menu 1'] },
        { role: 'menu', content: ['Menu 2'] },
      ],
      pages: [],
    }
    const def = inferLakebed(p2, 'restaurant')
    // Two menu sections both generate menuItems — should dedupe to 1
    const menuTables = def.tables.filter((t) => t.name === 'menuItems')
    expect(menuTables).toHaveLength(1)
  })

  it('skips sections with none profile', () => {
    const p = plan([{ role: 'hero', content: ['Welcome'] }])
    const def = inferLakebed(p, 'restaurant')
    // hero → RestaurantHero → profiles ['none'] → no tables/queries/mutations
    expect(def.tables).toHaveLength(0)
    expect(def.queries).toHaveLength(0)
    expect(def.mutations).toHaveLength(0)
  })

  it('skips unknown components (no interaction profile)', () => {
    const p = plan([{ role: 'nonexistent', content: ['?'] }])
    const def = inferLakebed(p, 'restaurant')
    // RestaurantNonexistent → not in registry → skip
    expect(def.tables).toHaveLength(0)
  })
})
