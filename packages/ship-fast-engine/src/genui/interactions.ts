// interaction profile registry — motif/component → macro profiles + operation mapping.
import type { InteractionProfile } from './types.ts'

const NONE: InteractionProfile = { profiles: ['none'], operations: {} }

export const INTERACTIONS: Record<string, InteractionProfile> = {
  // ── Motif interaction profiles ───────────────────────────────────────────
  // Interactive motifs that have real local + fullstack state.
  ContactForm: {
    profiles: ['submission'],
    submissionTable: 'messages',
    submissionFields: ['label', 'source'],
    operations: {
      submissionSummary: 'contactExperience',
      submit: 'sendMessage',
    },
  },
  BookingForm: {
    profiles: ['submission'],
    submissionTable: 'bookings',
    submissionFields: ['label', 'source'],
    operations: {
      submissionSummary: 'bookingExperience',
      submit: 'createBooking',
    },
  },
  NewsletterCta: {
    profiles: ['submission'],
    submissionTable: 'subscribers',
    submissionFields: ['label', 'source'],
    operations: {
      submissionSummary: 'newsletterExperience',
      submit: 'subscribe',
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
  ProductGrid: {
    profiles: ['collection', 'cart'],
    dataKey: 'Catalog',
    seedTable: 'products',
    seedPath: 'cards',
    seedFields: ['title', 'description'],
    cartTable: 'orderItems',
    cartKey: 'title',
    operations: {
      listCollection: 'productCatalog',
      syncCollection: 'syncProductCatalog',
      orderSummary: 'cartSummary',
      addToOrder: 'addToCart',
      removeFromOrder: 'removeFromCart',
      clearOrder: 'clearCart',
    },
  },
  GroupedList: {
    profiles: ['collection'],
    dataKey: 'Catalog',
    seedTable: 'items',
    seedPath: 'groups',
    seedFields: ['title', 'description'],
    operations: {
      listCollection: 'itemCatalog',
      syncCollection: 'syncItemCatalog',
    },
  },

  // ── Presentational motifs (no interaction) ───────────────────────────────
  SplitHero: NONE,
  CenteredHero: NONE,
  PosterHero: NONE,
  Navbar: NONE,
  Footer: NONE,
  CardGrid: NONE,
  PricingTable: NONE,
  TestimonialRow: NONE,
  StatsStrip: NONE,
  FaqAccordion: NONE,
  MediaSplit: NONE,
  CtaBand: NONE,
  LogoCloud: NONE,
  MapBlock: NONE,
  ProjectGallery: NONE,
  TeamGrid: NONE,
  Timeline: NONE,
  FeatureColumns: NONE,
  FeatureSplit: NONE,
  Steps: NONE,
  TabbedContent: NONE,
  VideoEmbed: NONE,
  SocialProof: NONE,
  ArticleCard: NONE,
  ContentRow: NONE,
  Empty: NONE,
}

export function getInteraction(component: string): InteractionProfile | null {
  return INTERACTIONS[component] ?? null
}
