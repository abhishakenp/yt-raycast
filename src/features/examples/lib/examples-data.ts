import { allCapsules } from '@ship-fast/blocks'
import {
  buildRouteTargetMap,
  planPages,
  type PagePlan,
  type RoutePlanFamily,
} from '@ship-fast/engine/genui/navigation-plan.ts'
import {
  createDefaultItem,
  introspectCapsuleSchema,
  type CapsuleSchemaInfo,
  type CollectionField,
  type CollectionProp,
  type VariantOption,
} from '@ship-fast/blocks/capsules'
import { capsuleCategories } from '@ship-fast/blocks/generated'

import {
  getExampleCategories,
  getExampleCategory,
  labelFromExampleSlug,
  type ExampleCategory,
} from './examples-categories'

type CapsuleClient = {
  name: string
  props: unknown
}

type CapsuleRecord = {
  category: string
  componentName: string
  functionalType: string
  propsSchema: unknown
}

type ZodObjectDef = {
  type?: string
  shape?: Record<string, unknown>
}

type ZodContainer = {
  _zod?: {
    def?: ZodObjectDef
  }
}

export type ExampleCapsule = {
  category: string
  componentName: string
  functionalType: string
  label: string
  source: string
}

export type ExampleCategorySite = {
  category: string
  label: string
  capsuleCount: number
  imageContextTitle: string
  source: string
}

const COMMON_TEXT_PROPS = [
  'brand',
  'badge',
  'eyebrow',
  'heading',
  'headingTop',
  'headingBottom',
  'headingLead',
  'headingAccent',
  'headline',
  'highlight',
  'title',
  'subtitle',
  'subheading',
  'description',
  'intro',
  'copy',
  'note',
  'tagline',
  'primaryCta',
  'secondaryCta',
  'cta',
  'ctaLabel',
  'buttonLabel',
  'submit',
  'imageAlt',
  'portraitAlt',
  'coverAlt',
  'avatarAlt',
  'founderAvatarAlt',
] as const

const COMMON_LIST_PROPS = [
  'nav',
  'links',
  'names',
  'badges',
  'features',
  'legal',
  'socials',
  'engines',
] as const

const SKIPPED_PROP_KEYS = new Set([
  'className',
  'homeTarget',
  'primaryTarget',
  'secondaryTarget',
  'ctaTarget',
  'contactTarget',
  'eventsTarget',
  'menuTarget',
  'href',
  'target',
])

const labelFromComponentName = (value: string): string =>
  value.replace(/([a-z0-9])([A-Z])/g, '$1 $2')

const isCapsuleClient = (value: unknown): value is CapsuleClient =>
  value !== null &&
  typeof value === 'object' &&
  'name' in value &&
  typeof value.name === 'string' &&
  'props' in value

const capsuleRecords = (): CapsuleRecord[] =>
  (allCapsules as readonly unknown[])
    .flatMap((value) => {
      if (!value || typeof value !== 'object' || !('client' in value)) {
        return []
      }
      const client = value.client
      if (!isCapsuleClient(client)) return []
      const categoryInfo = capsuleCategories[client.name]
      if (!categoryInfo) return []
      return [
        {
          category: categoryInfo.category,
          componentName: client.name,
          functionalType: categoryInfo.functionalType,
          propsSchema: client.props,
        },
      ]
    })
    .sort((left, right) =>
      left.componentName.localeCompare(right.componentName),
    )

const isZodContainer = (value: unknown): value is ZodContainer =>
  value !== null && typeof value === 'object' && '_zod' in value

const orderedPropKeys = (propsSchema: unknown): string[] => {
  const def = isZodContainer(propsSchema) ? propsSchema._zod?.def : undefined
  if (def?.type !== 'object' || !def.shape) return []
  return Object.keys(def.shape)
}

const serializeOpenUIArg = (value: unknown): string => {
  if (value === undefined) return 'undefined'
  return JSON.stringify(value) ?? 'null'
}

const serializeOpenUICallArgs = (
  propsSchema: unknown,
  props: Record<string, unknown>,
): string => {
  const args = orderedPropKeys(propsSchema).map((key) =>
    key === 'className' ? undefined : props[key],
  )
  while (args.length > 0 && args.at(-1) === undefined) args.pop()
  return args.map(serializeOpenUIArg).join(', ')
}

const demoLabel = (category: string): string => labelFromExampleSlug(category)

type DemoCopyProfile = {
  brand: string
  eyebrow: string
  heroTitle: string
  heroDescription: string
  overviewTitle: string
  overviewDescription: string
  menuTitle: string
  menuDescription: string
  ctaTitle: string
  ctaDescription: string
  footerTitle: string
  footerDescription: string
  tagline: string
  primaryAction: string
  secondaryAction: string
  placeholder: string
  itemNames: string[]
  features: string[]
  badges: string[]
  quote: string
  location: string
  hours: string
  phone: string
  email: string
  price: string
  date: string
  role: string
  statValue: string
  statLabel: string
}

const containsAny = (value: string, needles: string[]): boolean =>
  needles.some((needle) => value.includes(needle))

const roleLabelFromComponentName = (
  componentName: string,
  categoryLabel: string,
): string => {
  const componentWords = labelFromComponentName(componentName).split(' ')
  const categoryWords = categoryLabel.split(' ')
  const hasCategoryPrefix = categoryWords.every(
    (word, index) =>
      componentWords[index]?.toLowerCase() === word.toLowerCase(),
  )

  if (!hasCategoryPrefix) return componentWords.join(' ')

  const roleWords = componentWords.slice(categoryWords.length)
  return roleWords.length ? roleWords.join(' ') : componentWords.join(' ')
}

const defaultProfile = (label: string): DemoCopyProfile => ({
  brand: `${label} Works`,
  eyebrow: 'Built for momentum',
  heroTitle: `A sharper ${label.toLowerCase()} experience`,
  heroDescription: `Bring the offer, proof, and next step together in a polished ${label.toLowerCase()} site built for real visitors.`,
  overviewTitle: `How ${label.toLowerCase()} teams move faster`,
  overviewDescription:
    'Show the story, proof points, and decision path visitors need before they take action.',
  menuTitle: 'Featured options',
  menuDescription:
    'Highlight the offers, packages, and details customers compare before choosing.',
  ctaTitle: 'Start the conversation today',
  ctaDescription:
    'Give visitors a clear next step with confident copy and practical context.',
  footerTitle: 'Helpful links',
  footerDescription:
    'Keep essential information easy to find after visitors finish scanning the page.',
  tagline: `Practical ${label.toLowerCase()} experiences for modern teams.`,
  primaryAction: 'Get started',
  secondaryAction: 'See details',
  placeholder: 'Enter your email',
  itemNames: ['Starter plan', 'Growth plan', 'Signature plan'],
  features: [
    'Clear positioning',
    'Conversion-focused sections',
    'Responsive pages',
  ],
  badges: ['Trusted team', 'Fast launch', 'Polished handoff'],
  quote:
    'The page makes the offer clear, credible, and easy to act on from the first screen.',
  location: '123 Market Street',
  hours: 'Mon-Fri, 9am-6pm',
  phone: '(555) 013-7420',
  email: 'hello@example.test',
  price: '$29',
  date: 'Jul 19',
  role: 'Customer Success Lead',
  statValue: '42%',
  statLabel: 'More qualified inquiries',
})

const copyProfileForCategory = (category: string): DemoCopyProfile => {
  const label = demoLabel(category)
  const fallback = defaultProfile(label)

  if (category === 'winery-brewery') {
    return {
      ...fallback,
      brand: 'Cellar & Tap',
      eyebrow: 'Estate pours and small-batch releases',
      heroTitle: 'Taste what is pouring this week',
      heroDescription:
        'Reserve a guided flight, browse seasonal bottles, and plan a relaxed visit around the newest cellar and taproom releases.',
      overviewTitle: 'A laid-back tasting room with serious craft',
      overviewDescription:
        'From vineyard rows to barrel room pours, every visit is paced around thoughtful hospitality and limited-run releases.',
      menuTitle: 'Seasonal pours and cellar bites',
      menuDescription:
        'Explore tasting flights, reserve bottles, crisp lagers, and shareable boards selected for the current release list.',
      ctaTitle: 'Reserve your next tasting',
      ctaDescription:
        'Book a table, ask about private events, or call ahead for the bottles currently available by the glass.',
      footerTitle: 'Visit the cellar',
      footerDescription:
        'Tasting hours, event notes, and bottle-release details for planning your next stop.',
      tagline:
        'Small-batch pours, local plates, and weekends worth slowing down for.',
      primaryAction: 'Reserve a tasting',
      secondaryAction: 'View the menu',
      placeholder: 'Email for release notes',
      itemNames: ['Reserve flight', 'Seasonal tasting', 'Cellar board'],
      features: ['Guided flights', 'Limited releases', 'Private events'],
      badges: ['Estate-grown', 'Taproom favorite', 'Weekend release'],
      quote:
        'Every pour felt intentional, and the team made the whole visit easy to plan.',
      location: '428 Vineyard Lane',
      hours: 'Thu-Sun, 12pm-8pm',
      phone: '(555) 019-2048',
      email: 'hello@cellarandtap.test',
      price: '$18',
      date: 'Aug 24',
      role: 'Tasting Room Manager',
      statValue: '4.9/5',
      statLabel: 'Guest rating',
    }
  }

  if (
    containsAny(category, [
      'restaurant',
      'cafe',
      'bakery',
      'bar-nightclub',
      'food',
    ])
  ) {
    return {
      ...fallback,
      brand: `${label} House`,
      eyebrow: 'Fresh service, local flavor',
      heroTitle: 'Book a table for tonight',
      heroDescription:
        'Browse seasonal dishes, check hours, and reserve a spot for a polished dining experience.',
      overviewTitle: 'Hospitality that feels effortless',
      overviewDescription:
        'Lead with the menu, the room, and the details guests need before they visit.',
      menuTitle: 'Seasonal favorites from the kitchen',
      menuDescription:
        'Feature signature dishes, drinks, and specials with enough detail to help guests choose.',
      ctaTitle: 'Make your reservation',
      ctaDescription:
        'Give guests a clear path to book, call, or browse the menu before they arrive.',
      footerTitle: 'Plan your visit',
      footerDescription:
        'Hours, location, menu links, and contact details in one place.',
      tagline: 'Seasonal food, warm service, and a room worth returning to.',
      primaryAction: 'Reserve a table',
      secondaryAction: 'View menu',
      itemNames: ['Seasonal tasting', 'House special', 'Chef selection'],
      features: ['Fresh menu', 'Easy reservations', 'Private dining'],
      badges: ['Local favorite', 'Chef-led', 'Open tonight'],
      quote: 'The menu was easy to scan and the reservation path was obvious.',
      role: 'General Manager',
    }
  }

  if (
    containsAny(category, [
      'saas',
      'analytics',
      'crm',
      'cloud',
      'dev-tool',
      'auth',
      'ai-product',
      'aeo',
      'cybersecurity',
      'no-code',
      'fintech',
      'marketing',
    ])
  ) {
    return {
      ...fallback,
      brand: `${label} Labs`,
      eyebrow: 'Built for modern teams',
      heroTitle: 'Launch faster with a clearer product story',
      heroDescription:
        'Explain the product, prove the value, and give buyers a direct path from interest to activation.',
      overviewTitle: 'A product page that sells the workflow',
      overviewDescription:
        'Connect features, outcomes, proof, pricing, and support in a page that feels ready for real customers.',
      menuTitle: 'Platform capabilities',
      menuDescription:
        'Show the workflows, integrations, and controls teams need to evaluate the product.',
      ctaTitle: 'Start building with confidence',
      ctaDescription:
        'Move visitors from evaluation to action with a direct trial, demo, or implementation path.',
      footerTitle: 'Product resources',
      footerDescription:
        'Docs, pricing, security, and support links for serious buyers.',
      tagline: 'Clear product storytelling for teams ready to move.',
      primaryAction: 'Start free',
      secondaryAction: 'Book a demo',
      itemNames: ['Workflow automation', 'Team dashboard', 'Security controls'],
      features: ['Fast onboarding', 'Connected data', 'Enterprise controls'],
      badges: ['SOC-ready', 'API-first', 'Team approved'],
      quote:
        'The page made the product feel credible before we ever opened a demo.',
      role: 'Product Lead',
      statValue: '38%',
      statLabel: 'Faster activation',
    }
  }

  if (
    containsAny(category, [
      'ecommerce',
      'store',
      'shop',
      'marketplace',
      'jewelry',
      'furniture',
      'product-detail',
      'subscription-box',
    ])
  ) {
    return {
      ...fallback,
      brand: `${label} Market`,
      eyebrow: 'Curated for everyday use',
      heroTitle: 'Shop the pieces customers come back for',
      heroDescription:
        'Showcase best sellers, product proof, and collection details with a clean path to purchase.',
      overviewTitle: 'A storefront designed for confident buying',
      overviewDescription:
        'Pair strong merchandising with trust signals, product education, and simple checkout actions.',
      menuTitle: 'Featured collection',
      menuDescription:
        'Present standout products, bundles, and seasonal offers with crisp buying cues.',
      ctaTitle: 'Find your next favorite',
      ctaDescription:
        'Invite shoppers into the collection with a clear offer and practical product context.',
      footerTitle: 'Store support',
      footerDescription:
        'Shipping, returns, sizing, and account links close at hand.',
      tagline:
        'Thoughtfully selected products with a smoother path to purchase.',
      primaryAction: 'Shop now',
      secondaryAction: 'View collection',
      itemNames: ['Signature bundle', 'Daily essential', 'Limited release'],
      features: ['Curated edits', 'Fast checkout', 'Easy returns'],
      badges: ['Best seller', 'New arrival', 'Limited run'],
      quote: 'The storefront answered my questions before I reached checkout.',
      role: 'Merchandising Lead',
    }
  }

  if (
    containsAny(category, [
      'fitness',
      'yoga',
      'spa',
      'salon',
      'health',
      'dental',
      'nutrition',
      'telehealth',
      'mental-health',
      'pet-veterinary',
    ])
  ) {
    return {
      ...fallback,
      brand: `${label} Collective`,
      eyebrow: 'Care that fits real life',
      heroTitle: 'Book care with a team you can trust',
      heroDescription:
        'Help clients understand services, schedule with confidence, and feel prepared before the first visit.',
      overviewTitle: 'Clear care from first click to follow-up',
      overviewDescription:
        'Use practical service details, credentials, and outcomes to make booking feel simple.',
      menuTitle: 'Services and programs',
      menuDescription:
        'Compare service options, session formats, and care paths before choosing the right fit.',
      ctaTitle: 'Schedule your first visit',
      ctaDescription:
        'Make the next step simple with booking, contact, and location details in one focused section.',
      footerTitle: 'Care resources',
      footerDescription:
        'Hours, location, insurance, and contact details for new clients.',
      tagline:
        'Professional care, clear guidance, and appointments that fit your week.',
      primaryAction: 'Book appointment',
      secondaryAction: 'View services',
      itemNames: ['Initial visit', 'Personal plan', 'Follow-up session'],
      features: ['Licensed team', 'Flexible scheduling', 'Personalized plans'],
      badges: ['New clients welcome', 'Insurance friendly', 'Evening hours'],
      quote:
        'The service details made it easy to choose the right appointment.',
      role: 'Client Care Lead',
    }
  }

  if (
    containsAny(category, [
      'law',
      'accounting',
      'consulting',
      'agency',
      'construction',
      'cleaning',
      'plumbing',
      'landscaping',
      'insurance',
      'logistics',
      'manufacturing',
      'architecture',
      'interior-design',
    ])
  ) {
    return {
      ...fallback,
      brand: `${label} Partners`,
      eyebrow: 'Specialists for complex work',
      heroTitle: 'Move important projects forward',
      heroDescription:
        'Present expertise, process, proof, and contact paths with the clarity clients expect from a professional firm.',
      overviewTitle: 'A better way to evaluate the team',
      overviewDescription:
        'Show services, standards, case work, and next steps without forcing prospects to hunt for answers.',
      menuTitle: 'Core services',
      menuDescription:
        'Lay out the engagements, packages, and service lines clients need to compare.',
      ctaTitle: 'Talk with a specialist',
      ctaDescription:
        'Invite qualified prospects into a consultation with clear expectations and direct contact options.',
      footerTitle: 'Firm resources',
      footerDescription:
        'Services, process, team, and contact links for serious buyers.',
      tagline: 'Experienced guidance for high-stakes decisions.',
      primaryAction: 'Schedule consultation',
      secondaryAction: 'View services',
      itemNames: [
        'Strategic review',
        'Implementation plan',
        'Ongoing advisory',
      ],
      features: ['Senior expertise', 'Clear process', 'Measured outcomes'],
      badges: ['Trusted advisors', 'Proven process', 'Client-first'],
      quote:
        'The site made the firm feel organized, credible, and easy to contact.',
      role: 'Managing Partner',
    }
  }

  if (
    containsAny(category, [
      'hotel',
      'travel',
      'tour',
      'vacation',
      'real-estate',
      'property',
      'auto-dealership',
    ])
  ) {
    return {
      ...fallback,
      brand: `${label} Group`,
      eyebrow: 'Plan with confidence',
      heroTitle: 'Find the right place, route, or stay',
      heroDescription:
        'Show availability, highlights, pricing context, and inquiry paths in a page built for high-intent visitors.',
      overviewTitle: 'Details that make planning easier',
      overviewDescription:
        'Combine visuals, specs, amenities, and next steps so visitors can decide without friction.',
      menuTitle: 'Featured options',
      menuDescription:
        'Compare the stays, listings, routes, or inventory visitors are most likely to choose.',
      ctaTitle: 'Plan your next move',
      ctaDescription:
        'Convert interest into a booking, inquiry, or tour request with clear practical details.',
      footerTitle: 'Planning resources',
      footerDescription:
        'Availability, policies, directions, and contact links in one place.',
      tagline: 'Curated options and practical details for confident planning.',
      primaryAction: 'Check availability',
      secondaryAction: 'Request details',
      itemNames: ['Featured stay', 'Private tour', 'Signature listing'],
      features: ['Real availability', 'Local guidance', 'Simple booking'],
      badges: ['Guest favorite', 'Limited dates', 'Verified details'],
      quote: 'The details were clear enough to make a decision on the spot.',
      role: 'Experience Manager',
    }
  }

  if (
    containsAny(category, [
      'university',
      'bootcamp',
      'course',
      'tutoring',
      'kids-education',
      'docs',
      'knowledge-base',
    ])
  ) {
    return {
      ...fallback,
      brand: `${label} Institute`,
      eyebrow: 'Learn with structure',
      heroTitle: 'Build skills with a clearer path',
      heroDescription:
        'Explain programs, outcomes, support, and enrollment steps so learners know exactly where to begin.',
      overviewTitle: 'Education that feels organized from day one',
      overviewDescription:
        'Connect curriculum, instructors, outcomes, pricing, and support into a page built for decision-making.',
      menuTitle: 'Programs and pathways',
      menuDescription:
        'Compare courses, formats, and learning tracks before choosing the right path.',
      ctaTitle: 'Start learning today',
      ctaDescription:
        'Give learners a confident next step with program details and simple enrollment actions.',
      footerTitle: 'Learning resources',
      footerDescription:
        'Programs, admissions, support, and contact links for learners.',
      tagline: 'Structured learning paths for ambitious students and teams.',
      primaryAction: 'Enroll now',
      secondaryAction: 'View programs',
      itemNames: ['Foundations track', 'Career pathway', 'Advanced workshop'],
      features: [
        'Expert instructors',
        'Project-based lessons',
        'Career support',
      ],
      badges: ['Flexible schedule', 'Mentor-led', 'Certificate ready'],
      quote: 'The program path was clear before I ever spoke to admissions.',
      role: 'Program Director',
    }
  }

  if (
    containsAny(category, [
      'blog',
      'news',
      'newsletter',
      'podcast',
      'webinar',
      'community',
      'forum',
    ])
  ) {
    return {
      ...fallback,
      brand: `${label} Dispatch`,
      eyebrow: 'Fresh perspective',
      heroTitle: 'Stories worth returning to',
      heroDescription:
        'Package sharp editorial, featured topics, and subscription paths into a publication that feels alive.',
      overviewTitle: 'A cleaner way to browse the archive',
      overviewDescription:
        'Surface featured stories, authors, categories, and sign-up prompts without clutter.',
      menuTitle: 'Featured stories',
      menuDescription:
        'Highlight the latest reads, episodes, and discussions with crisp editorial context.',
      ctaTitle: 'Never miss the next edition',
      ctaDescription:
        'Invite readers to subscribe, follow, or join the conversation with a clear value promise.',
      footerTitle: 'Editorial links',
      footerDescription:
        'Topics, authors, archives, and subscription links for readers.',
      tagline: 'Smart updates, useful context, and a reason to come back.',
      primaryAction: 'Subscribe',
      secondaryAction: 'Browse archive',
      itemNames: ['Feature story', 'Editor note', 'Field report'],
      features: ['Curated topics', 'Expert authors', 'Weekly editions'],
      badges: ['Editor pick', 'New issue', 'Subscriber favorite'],
      quote:
        'The publication felt focused, current, and easy to keep following.',
      role: 'Managing Editor',
    }
  }

  return fallback
}

const roleTitle = (profile: DemoCopyProfile, roleName: string): string => {
  if (roleName.includes('hero')) return profile.heroTitle
  if (roleName.includes('menu')) return profile.menuTitle
  if (roleName.includes('cta')) return profile.ctaTitle
  if (roleName.includes('footer')) return profile.footerTitle
  if (
    roleName.includes('overview') ||
    roleName.includes('about') ||
    roleName.includes('story')
  ) {
    return profile.overviewTitle
  }
  if (roleName.includes('pricing')) return 'Choose the right plan'
  if (roleName.includes('gallery')) return 'See the experience'
  if (roleName.includes('testimonials')) return 'What customers say'
  if (roleName.includes('events')) return 'Upcoming events and openings'
  if (roleName.includes('features') || roleName.includes('services')) {
    return 'Everything visitors need to decide'
  }
  if (roleName.includes('header')) return `${profile.brand} overview`
  return profile.heroTitle
}

const roleDescription = (
  profile: DemoCopyProfile,
  roleName: string,
): string => {
  if (roleName.includes('hero')) return profile.heroDescription
  if (roleName.includes('menu')) return profile.menuDescription
  if (roleName.includes('cta')) return profile.ctaDescription
  if (roleName.includes('footer')) return profile.footerDescription
  if (
    roleName.includes('overview') ||
    roleName.includes('about') ||
    roleName.includes('story')
  ) {
    return profile.overviewDescription
  }
  if (roleName.includes('pricing')) {
    return 'Compare packages, inclusions, and next steps without slowing buyers down.'
  }
  if (roleName.includes('gallery')) {
    return 'Use strong visuals and practical captions to help visitors picture the experience.'
  }
  if (roleName.includes('testimonials')) return profile.quote
  if (roleName.includes('events')) {
    return 'Promote upcoming dates with the details guests need before they commit.'
  }
  return profile.heroDescription
}

const titleSegments = (
  profile: DemoCopyProfile,
  roleName: string,
): {
  accent: string
  bottom: string
  top: string
} => {
  const words = roleTitle(profile, roleName).split(/\s+/).filter(Boolean)
  const accent = words.at(-1) ?? profile.brand
  const topWords = words.slice(0, Math.min(3, Math.max(1, words.length - 1)))
  const bottomWords = words.slice(topWords.length)

  return {
    accent,
    bottom: bottomWords.join(' ') || accent,
    top: topWords.join(' ') || accent,
  }
}

const actionLabelForKey = (
  key: string,
  profile: DemoCopyProfile,
  roleName: string,
): string => {
  const lowerKey = key.toLowerCase()
  if (lowerKey.includes('signin') || lowerKey.includes('login')) {
    return 'Sign in'
  }
  if (lowerKey.includes('signup') || lowerKey.includes('register')) {
    return 'Sign up'
  }
  if (lowerKey.includes('secondary')) return profile.secondaryAction
  if (lowerKey.includes('add')) {
    if (profile.brand === 'Cellar & Tap') {
      return roleName.includes('menu') ? 'Add pour' : 'Add tasting flight'
    }
    if (roleName.includes('menu')) return 'Add to order'
    return 'Add selection'
  }
  if (lowerKey.includes('export')) return 'Export report'
  if (lowerKey.includes('read')) return 'Read more'
  if (lowerKey.includes('follow')) return 'Follow updates'
  if (lowerKey.includes('sign')) return 'Sign in'
  return profile.primaryAction
}

const stringValueForKey = (
  key: string,
  category: string,
  componentName: string,
  index = 0,
): string => {
  const label = demoLabel(category)
  const roleLabel = roleLabelFromComponentName(componentName, label)
  const roleName = roleLabel.toLowerCase()
  const profile = copyProfileForCategory(category)
  const lowerKey = key.toLowerCase()
  const segments = titleSegments(profile, roleName)

  if (lowerKey === 'read') return index % 2 === 0 ? 'false' : 'true'
  if (lowerKey.includes('signin') || lowerKey.includes('login')) {
    return 'Sign in'
  }
  if (lowerKey.includes('signup') || lowerKey.includes('register')) {
    return 'Sign up'
  }
  if (lowerKey === 'headingtop' || lowerKey === 'headinglead') {
    return segments.top
  }
  if (lowerKey === 'headingbottom') return segments.bottom
  if (
    lowerKey === 'highlight' ||
    lowerKey === 'headingaccent' ||
    lowerKey === 'headingmark'
  ) {
    return segments.accent
  }
  if (lowerKey.includes('message')) {
    return `${profile.brand} update is ready for review`
  }
  if (lowerKey === 'type') return 'Insight'
  if (lowerKey.includes('alt')) {
    return `${profile.brand} ${roleLabel.toLowerCase()} image`
  }
  if (lowerKey.includes('brand')) return profile.brand
  if (lowerKey.includes('eyebrow') || lowerKey.includes('badge')) {
    return profile.eyebrow
  }
  if (
    lowerKey.includes('subtitle') ||
    lowerKey.includes('subheading') ||
    lowerKey.includes('description') ||
    lowerKey.includes('intro') ||
    lowerKey.includes('copy') ||
    lowerKey.includes('body') ||
    lowerKey.includes('blurb') ||
    lowerKey.includes('content') ||
    lowerKey.includes('text')
  ) {
    return roleDescription(profile, roleName)
  }
  if (
    lowerKey.includes('heading') ||
    lowerKey.includes('headline') ||
    lowerKey.includes('title') ||
    lowerKey.includes('header')
  ) {
    return roleTitle(profile, roleName)
  }
  if (lowerKey.includes('tagline')) return profile.tagline
  if (lowerKey.includes('footer') || lowerKey.includes('note')) {
    return profile.footerDescription
  }
  if (lowerKey.includes('cta') || lowerKey.includes('button')) {
    return actionLabelForKey(key, profile, roleName)
  }
  if (lowerKey.includes('submit')) return profile.primaryAction
  if (lowerKey.includes('placeholder')) return profile.placeholder
  if (lowerKey.includes('disclaimer')) {
    return 'No spam. Unsubscribe anytime. Details are handled with care.'
  }
  if (lowerKey.includes('caption')) return roleDescription(profile, roleName)
  if (
    lowerKey.includes('label') &&
    (roleName.includes('stat') || roleName.includes('overview'))
  ) {
    return profile.statLabel
  }
  if (lowerKey.includes('label'))
    return actionLabelForKey(key, profile, roleName)
  if (lowerKey.includes('phone')) return profile.phone
  if (lowerKey.includes('email')) return profile.email
  if (lowerKey.includes('count')) return String(numberValueForKey(lowerKey))
  if (lowerKey.includes('price')) return profile.price
  if (lowerKey.includes('date')) return profile.date
  if (lowerKey.includes('time') || lowerKey.includes('hours')) {
    return profile.hours
  }
  if (lowerKey.includes('location') || lowerKey.includes('address')) {
    return profile.location
  }
  if (lowerKey.includes('name')) {
    return (
      profile.itemNames[index % profile.itemNames.length] ??
      profile.itemNames[0] ??
      profile.brand
    )
  }
  if (lowerKey.includes('role')) return profile.role
  if (lowerKey.includes('quote')) return profile.quote
  if (lowerKey.includes('value')) return profile.statValue
  if (lowerKey.includes('copyright')) return `Copyright 2026 ${profile.brand}.`

  if (roleName.includes('footer')) return profile.footerDescription
  if (roleName.includes('menu')) return profile.menuDescription
  if (roleName.includes('cta')) return profile.ctaDescription
  return roleDescription(profile, roleName)
}

const numberValueForKey = (key: string, index = 0): number => {
  const lowerKey = key.toLowerCase()
  if (lowerKey.includes('rating')) return 5
  if (lowerKey.includes('column')) return 3
  if (lowerKey.includes('count')) return index + 3
  return index + 1
}

const arrayValueForKey = (key: string, category: string): string[] => {
  const profile = copyProfileForCategory(category)
  const lowerKey = key.toLowerCase()
  if (lowerKey.includes('nav') || lowerKey.includes('link')) {
    return ['Overview', 'Examples', 'Pricing', 'Contact']
  }
  if (lowerKey.includes('feature')) return profile.features
  if (lowerKey.includes('badge')) return profile.badges
  if (lowerKey.includes('name')) return profile.itemNames
  if (lowerKey.includes('legal')) return ['Privacy', 'Terms', 'Accessibility']
  if (lowerKey.includes('social')) return ['Instagram', 'LinkedIn', 'Email']
  if (lowerKey.includes('engine')) return ['ChatGPT', 'Perplexity', 'Gemini']
  return profile.itemNames
}

const createCollectionItem = (
  collection: CollectionProp,
  category: string,
  componentName: string,
  index: number,
): Record<string, unknown> => {
  const item = createDefaultItem(collection)
  for (const field of collection.itemFields) {
    item[field.key] = valueForField(field, category, componentName, index)
  }
  return item
}

const valueForField = (
  field: CollectionField,
  category: string,
  componentName: string,
  index: number,
): unknown => {
  if (field.type === 'string') {
    return stringValueForKey(field.key, category, componentName, index)
  }
  if (field.type === 'number') return numberValueForKey(field.key, index)
  if (field.type === 'boolean') return index % 2 === 0
  if (field.type === 'array-string')
    return arrayValueForKey(field.key, category)
  return undefined
}

const optionValue = (option: VariantOption): string | number | boolean =>
  option.value

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const generatedPropsForCapsule = (
  capsule: CapsuleRecord,
): Record<string, unknown> => {
  const schemaInfo: CapsuleSchemaInfo = introspectCapsuleSchema(
    capsule.propsSchema,
  )
  const props: Record<string, unknown> = {}

  for (const key of COMMON_TEXT_PROPS) {
    props[key] = stringValueForKey(key, capsule.category, capsule.componentName)
  }
  for (const key of COMMON_LIST_PROPS) {
    props[key] = arrayValueForKey(key, capsule.category)
  }
  for (const scalar of schemaInfo.scalars) {
    if (SKIPPED_PROP_KEYS.has(scalar.key)) continue
    props[scalar.key] =
      scalar.type === 'number'
        ? numberValueForKey(scalar.key)
        : stringValueForKey(scalar.key, capsule.category, capsule.componentName)
  }
  for (const variant of schemaInfo.variants) {
    if (SKIPPED_PROP_KEYS.has(variant.key)) continue
    const first = variant.options[0]
    if (first) props[variant.key] = optionValue(first)
  }
  for (const collection of schemaInfo.collections) {
    if (SKIPPED_PROP_KEYS.has(collection.key)) continue
    props[collection.key] = Array.from({ length: 3 }, (_, index) =>
      createCollectionItem(
        collection,
        capsule.category,
        capsule.componentName,
        index,
      ),
    )
  }
  if (
    typeof props.headingBottom === 'string' &&
    typeof props.highlight === 'string'
  ) {
    const highlight = props.highlight.trim()
    const headingBottom = props.headingBottom
      .replace(new RegExp(`\\b${escapeRegExp(highlight)}\\b`, 'i'), '')
      .replace(/\s+/g, ' ')
      .trim()
    if (/^(for|with|to|by|from|of|in|on|at)$/i.test(headingBottom)) {
      props.headingBottom = ''
    } else {
      props.headingBottom = headingBottom
    }
  }

  return props
}

const variableNameForCapsule = (componentName: string): string =>
  componentName
    .replace(/[^A-Za-z0-9_$]/g, '_')
    .replace(/^([^A-Za-z_$])/, '_$1')
    .replace(/[A-Z]/g, (match, offset) =>
      offset === 0 ? match.toLowerCase() : `_${match.toLowerCase()}`,
    )

const capsuleOrderRank = ({ functionalType }: CapsuleRecord): number => {
  const normalized = functionalType.toLowerCase()
  if (normalized === 'navbar') return 0
  if (normalized === 'header') return 1
  if (normalized === 'hero') return 2
  if (normalized === 'footer') return 100
  if (normalized.includes('cta')) return 90
  return 50
}

const sortCapsulesForSite = (capsules: CapsuleRecord[]): CapsuleRecord[] =>
  [...capsules].sort((left, right) => {
    const rankDelta = capsuleOrderRank(left) - capsuleOrderRank(right)
    return rankDelta === 0
      ? left.componentName.localeCompare(right.componentName)
      : rankDelta
  })

const unique = (values: string[]): string[] => [...new Set(values)]

const pascalNameFromCategory = (category: string): string =>
  category
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

const buildRouteFamilyFromCapsules = (
  category: string,
  capsules: CapsuleRecord[],
): RoutePlanFamily => ({
  name: pascalNameFromCategory(category),
  sections: unique(capsules.map((capsule) => capsule.functionalType)),
})

const pageVariableName = (page: PagePlan): string =>
  variableNameForCapsule(page.id)

const propsByRoleForPages = (
  pagePlans: PagePlan[],
  propsByRole: Record<string, Record<string, unknown>>,
): Record<string, Record<string, Record<string, unknown>>> =>
  Object.fromEntries(
    pagePlans.map((page) => [
      page.id,
      Object.fromEntries(
        page.sections
          .map((section) => [
            section.toLowerCase(),
            propsByRole[section.toLowerCase()],
          ])
          .filter(
            (entry): entry is [string, Record<string, unknown>] =>
              entry[1] !== undefined,
          ),
      ),
    ]),
  )

const isRouteListKey = (key: string): boolean =>
  /^(nav|links|routes?)$/i.test(key)

const isRouteStringKey = (key: string): boolean =>
  /(^|_)(cta|button|submit|href|target|route|action)(_|$)/i.test(key) ||
  /^(cta|buttonLabel|ctaLabel|primaryCta|secondaryCta|href|target|action)$/i.test(
    key,
  )

const replaceNavigationValues = (
  value: unknown,
  nav: string[],
  primaryRoute: string,
  secondaryRoute: string,
  key = '',
): unknown => {
  if (Array.isArray(value)) {
    if (
      isRouteListKey(key) &&
      value.every((item) => typeof item === 'string')
    ) {
      return nav
    }
    return value.map((item) =>
      replaceNavigationValues(item, nav, primaryRoute, secondaryRoute, key),
    )
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        replaceNavigationValues(
          entryValue,
          nav,
          primaryRoute,
          secondaryRoute,
          entryKey,
        ),
      ]),
    )
  }
  if (typeof value === 'string' && isRouteStringKey(key)) {
    return /secondary/i.test(key) ? secondaryRoute : primaryRoute
  }
  return value
}

const routeAwareProps = (
  props: Record<string, unknown>,
  nav: string[],
): Record<string, unknown> => {
  const primaryRoute = nav[1] ?? nav[0] ?? 'Home'
  const secondaryRoute = nav[2] ?? nav[0] ?? primaryRoute
  const replaced = replaceNavigationValues(
    props,
    nav,
    primaryRoute,
    secondaryRoute,
  )
  if (!replaced || typeof replaced !== 'object' || Array.isArray(replaced)) {
    return props
  }
  return {
    ...replaced,
    nav,
    links: nav,
    homeTarget: nav[0] ?? 'Home',
    primaryCta: primaryRoute,
    secondaryCta: secondaryRoute,
    cta: primaryRoute,
    ctaLabel: primaryRoute,
    buttonLabel: primaryRoute,
    submit: primaryRoute,
    primaryTarget: primaryRoute,
    secondaryTarget: secondaryRoute,
    ctaTarget: primaryRoute,
    contactTarget: secondaryRoute,
    eventsTarget: primaryRoute,
    menuTarget: primaryRoute,
    href: primaryRoute,
    target: primaryRoute,
  }
}

export const buildExampleOpenUISource = (
  capsule: Pick<
    CapsuleRecord,
    'category' | 'componentName' | 'functionalType' | 'propsSchema'
  >,
): string => {
  const variableName = variableNameForCapsule(capsule.componentName)
  const props = generatedPropsForCapsule(capsule)
  const args = serializeOpenUICallArgs(capsule.propsSchema, props)
  return `${variableName} = ${capsule.componentName}(${args})\nroot = Stack([${variableName}])`
}

export const buildExampleCategoryOpenUISource = (category: string): string => {
  const capsules = sortCapsulesForSite(
    capsuleRecords().filter((capsule) => capsule.category === category),
  )
  const family = buildRouteFamilyFromCapsules(category, capsules)
  const pagePlans = planPages(family, `examples:${category}`)
  const nav = pagePlans.map((page) => page.label)
  const propsByRole: Record<string, Record<string, unknown>> = {}
  const statements: string[] = []
  const componentByRole = new Map<string, string>()

  for (const capsule of capsules) {
    const variableName = variableNameForCapsule(capsule.componentName)
    const props = routeAwareProps(generatedPropsForCapsule(capsule), nav)
    const args = serializeOpenUICallArgs(capsule.propsSchema, props)
    propsByRole[capsule.functionalType.toLowerCase()] = props
    if (!componentByRole.has(capsule.functionalType)) {
      componentByRole.set(capsule.functionalType, variableName)
    }
    statements.push(`${variableName} = ${capsule.componentName}(${args})`)
  }

  for (const page of pagePlans) {
    const anchorNames: string[] = []
    for (const section of page.sections) {
      const variableName = componentByRole.get(section)
      if (!variableName) continue
      const sectionId = `${page.id}_${section.toLowerCase()}`
      const anchorName = `${sectionId}_anchor`
      const anchorStatement =
        section === 'Navbar'
          ? `${anchorName} = SectionAnchor("${sectionId}", ${variableName})`
          : `${anchorName} = SectionAnchor("${sectionId}", ${variableName}, "scroll-mt-28")`
      statements.push(anchorStatement)
      anchorNames.push(anchorName)
    }
    statements.push(
      `${pageVariableName(page)} = Stack([${unique(anchorNames).join(', ')}])`,
    )
  }
  statements.push(
    `root = PageSwitch(${JSON.stringify(pagePlans.map((page) => page.label))}, [${pagePlans
      .map(pageVariableName)
      .join(', ')}], "", ${JSON.stringify(
      buildRouteTargetMap({
        pages: pagePlans,
        pageProps: propsByRoleForPages(pagePlans, propsByRole),
      }),
    )})`,
  )

  return statements.join('\n')
}

export const getExampleCategorySite = (
  category: string,
): ExampleCategorySite | undefined => {
  const categoryInfo = getExampleCategory(category)
  if (!categoryInfo) return undefined

  return {
    category,
    label: categoryInfo.label,
    capsuleCount: categoryInfo.capsuleCount,
    imageContextTitle: `${categoryInfo.label} examples`,
    source: buildExampleCategoryOpenUISource(category),
  }
}

export { getExampleCategories, getExampleCategory }
export type { ExampleCategory }

export const getExampleCapsules = (category: string): ExampleCapsule[] =>
  capsuleRecords()
    .filter((capsule) => capsule.category === category)
    .map((capsule) => ({
      category: capsule.category,
      componentName: capsule.componentName,
      functionalType: capsule.functionalType,
      label: labelFromComponentName(capsule.componentName),
      source: buildExampleOpenUISource(capsule),
    }))
