// v3 vocabulary — per-kind role/field signatures aligned with ACTUAL component
// specs from the blocks registry. Field names match topLevelArgNames() exactly
// (minus brand/nav which the engine injects). Only roles with existing components
// are included. Only core content fields are exposed to the LLM — conventional
// fields (CTAs, targets, routing, contact info) are omitted; buildComponentCall
// fills them with defaults.
import type { KindVocabulary, RoleField, RoleVocabulary } from './types.ts'

// ── Field builders ──────────────────────────────────────────────────────────
const f = (name: string): RoleField => ({ name })
const fa = (name: string, nested?: RoleField[]): RoleField => ({
  name,
  array: true,
  nested: nested ?? [],
})

// Common nested field shapes (used across kinds).
const FEATURE_ITEMS = [f('title'), f('description')]
const TESTIMONIAL_ITEMS = [f('quote'), f('name'), f('role'), f('rating')]
const FAQ_ITEMS = [f('question'), f('answer')]
const STAT_ITEMS = [f('value'), f('label')]
const TIER_ITEMS = [f('name'), f('price'), f('period'), fa('features')]
const PRICING_ITEMS = [f('name'), f('price'), f('period'), fa('features')]
const STEP_ITEMS = [f('title'), f('description')]
const IMAGE_ITEMS = [f('alt')]
const COLUMN_ITEMS = [f('title'), fa('links')]

// ── Universal roles (available to every kind) ───────────────────────────────
const FOOTER_FIELDS: RoleField[] = [
  f('tagline'),
  fa('columns', COLUMN_ITEMS),
  fa('social'),
]
const NAVBAR_FIELDS: RoleField[] = [] // brand + nav injected by engine

export const UNIVERSAL_ROLES: RoleVocabulary[] = [
  { role: 'navbar', fields: NAVBAR_FIELDS, universal: true },
  { role: 'footer', fields: FOOTER_FIELDS, universal: true },
  {
    role: 'testimonials',
    fields: [f('heading'), fa('items', TESTIMONIAL_ITEMS)],
    universal: true,
  },
  {
    role: 'faq',
    fields: [f('heading'), fa('items', FAQ_ITEMS)],
    universal: true,
  },
  { role: 'cta', fields: [f('heading'), f('subheading')], universal: true },
  {
    role: 'stats',
    fields: [f('heading'), fa('items', STAT_ITEMS)],
    universal: true,
  },
  {
    role: 'contact',
    fields: [f('heading'), f('description')],
    universal: true,
  },
]

// ── Per-kind vocabularies (only roles with existing components) ─────────────
// Field names EXACTLY match the component spec's argument names (minus brand/nav).
// Only core content fields are exposed — CTAs, targets, routing, contact info
// are omitted (buildComponentCall fills them with defaults).

const COMMERCE: RoleVocabulary[] = [
  {
    role: 'hero',
    fields: [f('eyebrow'), f('heading'), f('subheading'), f('imageAlt')],
  },
  {
    role: 'features',
    fields: [f('heading'), f('subheading'), fa('features', FEATURE_ITEMS)],
  },
  {
    role: 'gallery',
    fields: [
      f('heading'),
      f('subheading'),
      fa('products', [
        f('name'),
        f('price'),
        f('oldPrice'),
        f('badge'),
        f('imageAlt'),
      ]),
    ],
  },
  {
    role: 'testimonials',
    fields: [f('heading'), f('subheading'), fa('reviews', TESTIMONIAL_ITEMS)],
  },
  { role: 'cta', fields: [f('heading'), f('subheading')] },
  { role: 'logos', fields: [f('eyebrow'), fa('items', [f('label')])] },
  { role: 'navbar', fields: NAVBAR_FIELDS },
  { role: 'footer', fields: FOOTER_FIELDS },
]

const RESTAURANT: RoleVocabulary[] = [
  {
    role: 'hero',
    fields: [f('eyebrow'), f('heading'), f('subheading'), f('imageAlt')],
  },
  {
    role: 'menu',
    fields: [
      f('heading'),
      f('description'),
      fa('categories', [
        f('name'),
        fa('items', [f('name'), f('description'), f('price'), f('tag')]),
      ]),
    ],
  },
  {
    role: 'story',
    fields: [
      f('eyebrow'),
      f('heading'),
      f('body'),
      fa('features', FEATURE_ITEMS),
    ],
  },
  {
    role: 'gallery',
    fields: [f('heading'), f('description'), fa('images', IMAGE_ITEMS)],
  },
  {
    role: 'testimonials',
    fields: [f('heading'), fa('reviews', TESTIMONIAL_ITEMS)],
  },
  { role: 'cta', fields: [f('headline'), f('subheading')] },
  { role: 'navbar', fields: NAVBAR_FIELDS },
  { role: 'footer', fields: FOOTER_FIELDS },
]

const SAAS: RoleVocabulary[] = [
  { role: 'hero', fields: [f('badge'), f('heading'), f('subheading')] },
  {
    role: 'features',
    fields: [f('heading'), f('subheading'), fa('features', FEATURE_ITEMS)],
  },
  {
    role: 'pricing',
    fields: [f('heading'), f('subheading'), fa('tiers', TIER_ITEMS)],
  },
  {
    role: 'steps',
    fields: [f('heading'), f('subheading'), fa('steps', STEP_ITEMS)],
  },
  {
    role: 'bento',
    fields: [
      f('heading'),
      f('subheading'),
      fa('tiles', [f('title'), f('description')]),
    ],
  },
  {
    role: 'testimonials',
    fields: [f('heading'), f('subheading'), fa('items', TESTIMONIAL_ITEMS)],
  },
  {
    role: 'faq',
    fields: [f('heading'), f('subheading'), fa('items', FAQ_ITEMS)],
  },
  { role: 'cta', fields: [f('heading'), f('subheading')] },
  { role: 'logos', fields: [f('label'), fa('names')] },
  { role: 'navbar', fields: NAVBAR_FIELDS },
  { role: 'footer', fields: FOOTER_FIELDS },
]

const FINANCE: RoleVocabulary[] = [
  {
    role: 'hero',
    fields: [f('badge'), f('heading'), f('subheading'), f('imageAlt')],
  },
  {
    role: 'features',
    fields: [f('heading'), f('description'), fa('items', FEATURE_ITEMS)],
  },
  {
    role: 'pricing',
    fields: [f('heading'), f('subheading'), fa('tiers', TIER_ITEMS)],
  },
  {
    role: 'stats',
    fields: [f('heading'), f('subheading'), fa('stats', STAT_ITEMS)],
  },
  {
    role: 'testimonials',
    fields: [f('heading'), f('subheading'), fa('items', TESTIMONIAL_ITEMS)],
  },
  { role: 'cta', fields: [f('eyebrow'), f('title'), f('subtitle')] },
  { role: 'logos', fields: [f('label'), fa('items')] },
  { role: 'navbar', fields: NAVBAR_FIELDS },
  {
    role: 'footer',
    fields: [
      f('tagline'),
      fa('columns', COLUMN_ITEMS),
      fa('social'),
      f('legal'),
      f('note'),
    ],
  },
]

const MARKETPLACE: RoleVocabulary[] = [
  {
    role: 'hero',
    fields: [f('badge'), f('headingLead'), f('headingTail'), f('subheading')],
  },
  {
    role: 'features',
    fields: [f('heading'), f('subheading'), fa('features', FEATURE_ITEMS)],
  },
  {
    role: 'stats',
    fields: [f('heading'), f('subheading'), fa('stats', STAT_ITEMS)],
  },
  {
    role: 'testimonials',
    fields: [f('heading'), fa('reviews', TESTIMONIAL_ITEMS)],
  },
  { role: 'cta', fields: [f('eyebrow'), f('headline'), f('subheading')] },
  { role: 'navbar', fields: NAVBAR_FIELDS },
  {
    role: 'footer',
    fields: [
      f('tagline'),
      fa('social'),
      fa('columns', COLUMN_ITEMS),
      f('legal'),
      f('note'),
    ],
  },
]

const REALESTATE: RoleVocabulary[] = [
  {
    role: 'hero',
    fields: [f('eyebrow'), f('heading'), f('subheading'), f('imageAlt')],
  },
  {
    role: 'stats',
    fields: [f('heading'), f('description'), fa('stats', STAT_ITEMS)],
  },
  {
    role: 'testimonials',
    fields: [f('heading'), f('description'), fa('reviews', TESTIMONIAL_ITEMS)],
  },
  { role: 'cta', fields: [f('eyebrow'), f('heading'), f('subheading')] },
  {
    role: 'services',
    fields: [f('heading'), f('description'), fa('services', FEATURE_ITEMS)],
  },
  {
    role: 'gallery',
    fields: [
      f('heading'),
      f('description'),
      fa('listings', [
        f('price'),
        f('beds'),
        f('baths'),
        f('sqft'),
        f('address'),
        f('badge'),
      ]),
    ],
  },
  { role: 'navbar', fields: NAVBAR_FIELDS },
  {
    role: 'footer',
    fields: [f('blurb'), fa('columns', COLUMN_ITEMS), fa('social'), f('note')],
  },
]

const HEALTHCARE: RoleVocabulary[] = [
  {
    role: 'hero',
    fields: [
      f('badge'),
      f('headingBefore'),
      f('headingAfter'),
      f('subheading'),
      f('imageAlt'),
    ],
  },
  {
    role: 'pricing',
    fields: [
      f('eyebrow'),
      f('heading'),
      f('description'),
      fa('items', [
        f('name'),
        f('tagline'),
        f('price'),
        f('unit'),
        fa('features'),
        f('badge'),
      ]),
    ],
  },
  { role: 'stats', fields: [fa('items', STAT_ITEMS)] },
  {
    role: 'testimonials',
    fields: [
      f('eyebrow'),
      f('heading'),
      f('description'),
      fa('items', TESTIMONIAL_ITEMS),
    ],
  },
  {
    role: 'faq',
    fields: [
      f('eyebrow'),
      f('heading'),
      f('description'),
      fa('items', FAQ_ITEMS),
    ],
  },
  { role: 'cta', fields: [f('heading'), f('description')] },
  {
    role: 'services',
    fields: [
      f('eyebrow'),
      f('heading'),
      f('description'),
      fa('items', FEATURE_ITEMS),
    ],
  },
  {
    role: 'steps',
    fields: [
      f('eyebrow'),
      f('heading'),
      f('description'),
      fa('items', STEP_ITEMS),
    ],
  },
  { role: 'navbar', fields: NAVBAR_FIELDS },
  {
    role: 'footer',
    fields: [f('tagline'), fa('social'), fa('columns', COLUMN_ITEMS)],
  },
]

const PORTFOLIO: RoleVocabulary[] = [
  {
    role: 'hero',
    fields: [
      f('eyebrow'),
      f('headlineLead'),
      f('headlineAccent'),
      f('headlineTail'),
      f('description'),
    ],
  },
  {
    role: 'testimonials',
    fields: [f('heading'), fa('reviews', TESTIMONIAL_ITEMS)],
  },
  { role: 'cta', fields: [f('headline'), f('subheading')] },
  {
    role: 'services',
    fields: [f('heading'), f('subheading'), fa('services', FEATURE_ITEMS)],
  },
  { role: 'logos', fields: [fa('clients')] },
  { role: 'navbar', fields: NAVBAR_FIELDS },
  { role: 'footer', fields: FOOTER_FIELDS },
]

const PUBLICATION: RoleVocabulary[] = [
  {
    role: 'hero',
    fields: [f('kicker'), f('headline'), f('dek'), f('imageAlt'), f('caption')],
  },
  { role: 'navbar', fields: NAVBAR_FIELDS },
  {
    role: 'footer',
    fields: [
      f('blurb'),
      fa('columns', COLUMN_ITEMS),
      fa('social'),
      f('copyright'),
      f('legal'),
    ],
  },
]

const SERVICE: RoleVocabulary[] = [
  {
    role: 'hero',
    fields: [f('badge'), f('headingTop'), f('subheading'), f('imageAlt')],
  },
  {
    role: 'pricing',
    fields: [f('heading'), f('description'), fa('plans', PRICING_ITEMS)],
  },
  { role: 'stats', fields: [fa('items', STAT_ITEMS)] },
  {
    role: 'faq',
    fields: [f('heading'), f('description'), fa('items', FAQ_ITEMS)],
  },
  {
    role: 'services',
    fields: [f('heading'), f('description'), fa('items', FEATURE_ITEMS)],
  },
  {
    role: 'gallery',
    fields: [
      f('heading'),
      f('description'),
      fa('items', [f('title'), f('location'), f('alt')]),
    ],
  },
  {
    role: 'steps',
    fields: [f('heading'), f('description'), fa('items', STEP_ITEMS)],
  },
  { role: 'logos', fields: [f('label'), fa('items')] },
  { role: 'navbar', fields: NAVBAR_FIELDS },
  {
    role: 'footer',
    fields: [
      f('tagline'),
      fa('columns', COLUMN_ITEMS),
      f('copyright'),
      f('location'),
    ],
  },
]

const EDUCATION: RoleVocabulary[] = [
  {
    role: 'hero',
    fields: [f('badge'), f('headingTop'), f('subheading'), f('imageAlt')],
  },
  {
    role: 'pricing',
    fields: [
      f('eyebrow'),
      f('heading'),
      f('description'),
      fa('items', PRICING_ITEMS),
    ],
  },
  {
    role: 'testimonials',
    fields: [
      f('eyebrow'),
      f('heading'),
      f('description'),
      fa('items', TESTIMONIAL_ITEMS),
    ],
  },
  {
    role: 'faq',
    fields: [
      f('eyebrow'),
      f('heading'),
      f('description'),
      fa('items', FAQ_ITEMS),
    ],
  },
  {
    role: 'steps',
    fields: [
      f('eyebrow'),
      f('heading'),
      f('description'),
      fa('items', STEP_ITEMS),
    ],
  },
  { role: 'logos', fields: [f('label'), fa('items')] },
  { role: 'navbar', fields: NAVBAR_FIELDS },
  {
    role: 'footer',
    fields: [
      f('tagline'),
      fa('columns', COLUMN_ITEMS),
      fa('socials'),
      f('legal'),
    ],
  },
]

const EVENTS: RoleVocabulary[] = [
  {
    role: 'hero',
    fields: [
      f('eyebrow'),
      f('headingTop'),
      f('headingBottom'),
      f('subheading'),
    ],
  },
  {
    role: 'features',
    fields: [f('heading'), f('description'), fa('items', FEATURE_ITEMS)],
  },
  {
    role: 'testimonials',
    fields: [f('heading'), f('description'), fa('items', TESTIMONIAL_ITEMS)],
  },
  {
    role: 'faq',
    fields: [f('heading'), f('description'), fa('items', FAQ_ITEMS)],
  },
  { role: 'cta', fields: [f('heading'), f('description')] },
  { role: 'gallery', fields: [f('heading'), f('description'), fa('items')] },
  { role: 'logos', fields: [f('label'), fa('items')] },
  { role: 'navbar', fields: NAVBAR_FIELDS },
  {
    role: 'footer',
    fields: [
      f('tagline'),
      f('note'),
      fa('columns', COLUMN_ITEMS),
      fa('socials'),
      f('legal'),
    ],
  },
]

const TRAVEL: RoleVocabulary[] = [
  {
    role: 'hero',
    fields: [
      f('location'),
      f('headingTop'),
      f('headingBottom'),
      f('subheading'),
      f('imageAlt'),
    ],
  },
  { role: 'stats', fields: [fa('stats', STAT_ITEMS)] },
  {
    role: 'testimonials',
    fields: [
      f('eyebrow'),
      f('heading'),
      f('description'),
      fa('items', TESTIMONIAL_ITEMS),
    ],
  },
  {
    role: 'faq',
    fields: [
      f('eyebrow'),
      f('heading'),
      f('description'),
      fa('items', FAQ_ITEMS),
    ],
  },
  {
    role: 'cta',
    fields: [f('eyebrow'), f('heading'), f('description'), f('imageAlt')],
  },
  {
    role: 'gallery',
    fields: [
      f('eyebrow'),
      f('heading'),
      f('description'),
      fa('images', IMAGE_ITEMS),
    ],
  },
  {
    role: 'rooms',
    fields: [
      f('eyebrow'),
      f('heading'),
      f('description'),
      fa('items', [
        f('name'),
        f('price'),
        f('meta'),
        f('description'),
        f('imageAlt'),
        fa('tags'),
        f('badge'),
      ]),
    ],
  },
  { role: 'navbar', fields: NAVBAR_FIELDS },
  {
    role: 'footer',
    fields: [f('about'), fa('socials'), fa('columns', COLUMN_ITEMS), f('note')],
  },
]

const GOVERNMENT: RoleVocabulary[] = [
  {
    role: 'hero',
    fields: [fa('slides', [f('alt'), f('caption')]), fa('ticker')],
  },
  { role: 'stats', fields: [f('heading'), fa('stats', STAT_ITEMS)] },
  { role: 'faq', fields: [f('heading'), f('intro'), fa('items', FAQ_ITEMS)] },
  {
    role: 'contact',
    fields: [
      f('heading'),
      fa('offices', [f('name'), f('address')]),
      fa('directory', [f('name'), f('designation')]),
    ],
  },
  { role: 'services', fields: [f('heading'), fa('cards', FEATURE_ITEMS)] },
  {
    role: 'events',
    fields: [
      f('heading'),
      fa('tenders', [f('title'), f('date')]),
      fa('notices', [f('title'), f('date')]),
    ],
  },
  { role: 'about', fields: [f('sectionHeading'), f('overview')] },
  { role: 'navbar', fields: NAVBAR_FIELDS },
  {
    role: 'footer',
    fields: [
      f('orgName'),
      f('blurb'),
      fa('columns', COLUMN_ITEMS),
      fa('importantLinks', [f('label')]),
      f('note'),
    ],
  },
]

const LOGISTICS: RoleVocabulary[] = [
  { role: 'hero', fields: [f('headingTop'), f('subheading'), f('imageAlt')] },
  {
    role: 'pricing',
    fields: [f('heading'), f('description'), fa('tiers', TIER_ITEMS)],
  },
  { role: 'stats', fields: [fa('items', STAT_ITEMS)] },
  {
    role: 'testimonials',
    fields: [f('heading'), f('description'), fa('items', TESTIMONIAL_ITEMS)],
  },
  {
    role: 'faq',
    fields: [f('heading'), f('description'), fa('items', FAQ_ITEMS)],
  },
  { role: 'cta', fields: [f('heading'), f('description')] },
  {
    role: 'services',
    fields: [f('heading'), f('description'), fa('items', FEATURE_ITEMS)],
  },
  {
    role: 'gallery',
    fields: [f('heading'), f('description'), fa('images', IMAGE_ITEMS)],
  },
  { role: 'logos', fields: [f('heading'), fa('items')] },
  { role: 'navbar', fields: NAVBAR_FIELDS },
  {
    role: 'footer',
    fields: [f('blurb'), fa('socials'), fa('columns', COLUMN_ITEMS)],
  },
]

const JOBS: RoleVocabulary[] = [
  { role: 'hero', fields: [f('badge'), f('heading'), f('subheading')] },
  {
    role: 'features',
    fields: [f('heading'), f('description'), fa('items', FEATURE_ITEMS)],
  },
  { role: 'stats', fields: [fa('items', STAT_ITEMS)] },
  {
    role: 'testimonials',
    fields: [f('heading'), f('description'), fa('items', TESTIMONIAL_ITEMS)],
  },
  { role: 'cta', fields: [f('heading'), f('description')] },
  {
    role: 'steps',
    fields: [f('heading'), f('description'), fa('items', STEP_ITEMS)],
  },
  { role: 'logos', fields: [f('heading'), fa('companies')] },
  {
    role: 'jobs',
    fields: [
      f('heading'),
      f('description'),
      fa('items', [
        f('role'),
        f('company'),
        f('logoAlt'),
        fa('tags'),
        f('description'),
        f('posted'),
        f('badge'),
      ]),
    ],
  },
  { role: 'navbar', fields: NAVBAR_FIELDS },
  {
    role: 'footer',
    fields: [
      f('tagline'),
      fa('socials'),
      fa('columns', COLUMN_ITEMS),
      f('note'),
      f('legal'),
    ],
  },
]

const MARKETING: RoleVocabulary[] = [
  { role: 'hero', fields: [f('badge'), f('heading'), f('subheading')] },
  {
    role: 'features',
    fields: [f('heading'), f('description'), fa('items', FEATURE_ITEMS)],
  },
  {
    role: 'pricing',
    fields: [f('heading'), f('description'), fa('plans', PRICING_ITEMS)],
  },
  { role: 'cta', fields: [f('heading'), f('subheading')] },
  { role: 'logos', fields: [f('label'), fa('names')] },
  { role: 'navbar', fields: NAVBAR_FIELDS },
  { role: 'footer', fields: [fa('links'), f('copyright')] },
]

// ── Registry ────────────────────────────────────────────────────────────────
const VOCAB_MAP: Record<string, RoleVocabulary[]> = {
  commerce: COMMERCE,
  restaurant: RESTAURANT,
  saas: SAAS,
  finance: FINANCE,
  marketplace: MARKETPLACE,
  realestate: REALESTATE,
  healthcare: HEALTHCARE,
  portfolio: PORTFOLIO,
  publication: PUBLICATION,
  service: SERVICE,
  education: EDUCATION,
  events: EVENTS,
  travel: TRAVEL,
  government: GOVERNMENT,
  logistics: LOGISTICS,
  jobs: JOBS,
  marketing: MARKETING,
}

export const VOCABULARY: KindVocabulary[] = Object.entries(VOCAB_MAP).map(
  ([kind, roles]) => ({ kind, roles }),
)

export function getVocabulary(kind: string): KindVocabulary {
  return (
    VOCABULARY.find((v) => v.kind === kind) ?? {
      kind,
      roles: MARKETING,
    }
  )
}

/** Flattened top-level field names for a role in a kind (nested arrays represented
 *  by their parent name). Returns [] for footer/navbar/unknown. */
export function roleFieldOrder(kind: string, role: string): string[] {
  const vocab = getVocabulary(kind)
  const rv = vocab.roles.find((r) => r.role === role)
  if (!rv) return []
  return rv.fields.map((field) => field.name)
}
