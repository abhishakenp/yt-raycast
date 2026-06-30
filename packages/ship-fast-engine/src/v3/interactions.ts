// v3 interaction profile registry — component → macro profiles + operation mapping.
import type { InteractionProfile } from './types.ts'

const NONE: InteractionProfile = { profiles: ['none'], operations: {} }

export const INTERACTIONS: Record<string, InteractionProfile> = {
  // ── Restaurant ───────────────────────────────────────────────────────────
  RestaurantMenu: {
    profiles: ['collection', 'cart'],
    dataKey: 'Restaurant',
    seedTable: 'menuItems',
    seedPath: 'categories.items',
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
    dataKey: 'Restaurant',
    submissionTable: 'reservations',
    submissionFields: ['label', 'source'],
    operations: {
      submissionSummary: 'restaurantExperience',
      submit: 'reserveTable',
    },
  },
  RestaurantHero: NONE,
  RestaurantGallery: NONE,
  RestaurantStory: NONE,

  // ── Ecommerce / commerce ─────────────────────────────────────────────────
  EcommerceProducts: {
    profiles: ['collection', 'cart'],
    dataKey: 'Ecommerce',
    seedTable: 'products',
    seedPath: 'items',
    seedFields: ['name', 'price', 'imageAlt', 'tag'],
    cartTable: 'orderItems',
    cartKey: 'name',
    operations: {
      listCollection: 'productCatalog',
      syncCollection: 'syncProductCatalog',
      orderSummary: 'cartSummary',
      addToOrder: 'addToCart',
      removeFromOrder: 'removeFromCart',
      clearOrder: 'clearCart',
    },
  },
  EcommerceCheckout: {
    profiles: ['submission'],
    dataKey: 'Ecommerce',
    submissionTable: 'orders',
    submissionFields: ['label', 'source'],
    operations: {
      submissionSummary: 'orderExperience',
      submit: 'placeOrder',
    },
  },
  Catalog: {
    profiles: ['collection', 'cart'],
    dataKey: 'Ecommerce',
    seedTable: 'products',
    seedPath: 'items',
    seedFields: ['name', 'price', 'imageAlt', 'tag'],
    cartTable: 'orderItems',
    cartKey: 'name',
    operations: {
      listCollection: 'productCatalog',
      syncCollection: 'syncProductCatalog',
      orderSummary: 'cartSummary',
      addToOrder: 'addToCart',
      removeFromOrder: 'removeFromCart',
      clearOrder: 'clearCart',
    },
  },
  EcommerceHero: NONE,
  EcommercePricing: NONE,

  // ── SaaS ─────────────────────────────────────────────────────────────────
  SaasContact: {
    profiles: ['submission'],
    dataKey: 'Saas',
    submissionTable: 'leads',
    submissionFields: ['label', 'source'],
    operations: {
      submissionSummary: 'leadExperience',
      submit: 'captureLead',
    },
  },
  SaasDemo: {
    profiles: ['submission'],
    dataKey: 'Saas',
    submissionTable: 'demoRequests',
    submissionFields: ['label', 'source'],
    operations: {
      submissionSummary: 'demoExperience',
      submit: 'requestDemo',
    },
  },
  SaasPricing: NONE,
  SaasHero: NONE,
  SaasFeatures: NONE,

  // ── Generic interactive components ───────────────────────────────────────
  ContactForm: {
    profiles: ['submission'],
    submissionTable: 'messages',
    submissionFields: ['label', 'source'],
    operations: {
      submissionSummary: 'contactExperience',
      submit: 'sendMessage',
    },
  },
  SearchBar: {
    profiles: ['search'],
    operations: {
      searchState: 'searchState',
      setSearch: 'setSearch',
    },
  },
  AuthPanel: {
    profiles: ['auth'],
    operations: {
      sessionSummary: 'sessionSummary',
      recordSession: 'recordSession',
      clearSessions: 'clearSessions',
    },
  },
  FavoritesButton: {
    profiles: ['favorites'],
    seedTable: 'savedItems',
    seedFields: ['name', 'description', 'price'],
    operations: {
      savedList: 'savedList',
      toggleSave: 'toggleSave',
    },
  },

  // ── Universal no-interaction components ───────────────────────────────────
  Hero: NONE,
  Footer: NONE,
  Stats: NONE,
  Testimonials: NONE,
  Faq: NONE,
  Cta: NONE,
}

export function getInteraction(component: string): InteractionProfile | null {
  return INTERACTIONS[component] ?? null
}
