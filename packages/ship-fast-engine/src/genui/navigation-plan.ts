export type RoutePlanFamily = {
  name: string
  sections: string[]
}

export type PagePlan = {
  id: string
  label: string
  sections: string[]
}

const navigationKeyPattern =
  /(^|_|\b)(nav|cta|link|links|href|route|routes|action|button|buttons|primary|secondary|submit|phone|email|legal)(\b|_|$)/i

const normalizeAlias = (value: string): string => value.trim().toLowerCase()

const addTargetAlias = (
  targetMap: Record<string, string>,
  alias: string,
  target: string,
) => {
  const cleanAlias = alias.trim()
  const cleanTarget = target.trim()
  if (!cleanAlias || !cleanTarget) return
  targetMap[cleanAlias] = cleanTarget
  targetMap[normalizeAlias(cleanAlias)] = cleanTarget
}

const collectNavigationStrings = (
  value: unknown,
  values = new Set<string>(),
  navigationContext = false,
  key = '',
): Set<string> => {
  const nextNavigationContext =
    navigationContext || navigationKeyPattern.test(key)
  if (typeof value === 'string') {
    if (nextNavigationContext && value.trim()) values.add(value)
    return values
  }
  if (Array.isArray(value)) {
    for (const item of value)
      collectNavigationStrings(item, values, nextNavigationContext, key)
    return values
  }
  if (value && typeof value === 'object') {
    for (const [entryKey, item] of Object.entries(value)) {
      collectNavigationStrings(item, values, nextNavigationContext, entryKey)
    }
  }
  return values
}

const ROLE_ALIASES: Record<string, string[]> = {
  Pricing: ['Pricing', 'Plans', 'Memberships', 'Subscribe', 'Upgrade'],
  Menu: ['Menu', 'Order', 'Browse Menu'],
  Services: ['Services', 'What We Do', 'Book Service'],
  Programs: ['Programs', 'Courses', 'Classes'],
  Curriculum: ['Curriculum', 'Syllabus', 'Modules', 'Course Plan'],
  Outcomes: ['Outcomes', 'Results'],
  Mentors: ['Mentors', 'Instructors', 'Faculty'],
  Work: ['Work', 'Portfolio', 'Case Studies', 'Projects'],
  Projects: ['Projects', 'Portfolio', 'Case Studies'],
  Collections: ['Collections', 'Collection', 'Shop Collections'],
  Lookbook: ['Lookbook', 'Editorial', 'Style Guide'],
  Gallery: ['Gallery', 'Lookbook', 'Photos'],
  Amenities: ['Amenities', 'Facilities'],
  Booking: ['Booking', 'Book', 'Reserve'],
  Agenda: ['Agenda', 'Schedule'],
  Speakers: ['Speakers', 'Lineup'],
  Venue: ['Venue', 'Location'],
  About: ['About', 'Story', 'Mission'],
  Contact: ['Contact', 'Get in Touch', 'Book', 'Reserve', 'Request a Quote'],
  Faq: ['FAQ', 'Questions'],
  Cta: ['Get Started', 'Start', 'Join', 'Book Now'],
  ApplyCta: ['Apply', 'Apply Now'],
  Newsletter: ['Newsletter', 'Mailing List'],
  Subscribe: ['Subscribe', 'Newsletter'],
  Schedule: ['Schedule', 'Agenda'],
  Events: ['Events'],
  Benefits: ['Benefits', 'Why Us'],
  Topics: ['Topics'],
  StoryGrid: ['Articles', 'Stories', 'Read More'],
  FeaturedStory: ['Featured', 'Latest'],
  Products: ['Products', 'Shop', 'Collection'],
}

export const buildRouteTargetMap = (input: {
  pages: PagePlan[]
  pageProps: Record<string, Record<string, Record<string, unknown>>>
}): Record<string, string> => {
  const targetMap: Record<string, string> = {}
  const pagesByRole = new Map<string, PagePlan>()
  for (const page of input.pages) {
    addTargetAlias(targetMap, page.label, page.label)
    addTargetAlias(targetMap, page.id, page.label)
    for (const section of page.sections) {
      const sectionId = `${page.id}_${section.toLowerCase()}`
      const sectionTarget = `${page.label}#${sectionId}`
      addTargetAlias(targetMap, sectionId, sectionTarget)
      addTargetAlias(targetMap, section, sectionTarget)
      for (const alias of ROLE_ALIASES[section] ?? []) {
        addTargetAlias(targetMap, alias, sectionTarget)
      }
      if (!pagesByRole.has(section)) pagesByRole.set(section, page)
    }
  }

  const semanticTargetFor = (value: string) => {
    const normalized = normalizeAlias(value)
    const exact =
      targetMap[value] ??
      targetMap[normalized] ??
      input.pages.find((page) => normalizeAlias(page.label) === normalized)
        ?.label
    if (exact) return exact
    const role =
      (/shop|store|product|buy|cart|order|browse|collection/.test(normalized) &&
        (pagesByRole.get('Products') ??
          pagesByRole.get('Collections') ??
          pagesByRole.get('Lookbook') ??
          pagesByRole.get('Menu') ??
          pagesByRole.get('Gallery') ??
          pagesByRole.get('Work'))) ||
      (/price|plan|pricing|subscribe|upgrade|tier|membership/.test(
        normalized,
      ) &&
        (pagesByRole.get('Pricing') ?? pagesByRole.get('Subscribe'))) ||
      (/contact|reach|get in touch|book|reserve|demo|quote|start|join|get started|register/.test(
        normalized,
      ) &&
        (pagesByRole.get('Contact') ??
          pagesByRole.get('Booking') ??
          pagesByRole.get('Tickets') ??
          pagesByRole.get('ApplyCta') ??
          pagesByRole.get('Cta') ??
          pagesByRole.get('Subscribe'))) ||
      (/about|story|team|who we are|mission/.test(normalized) &&
        (pagesByRole.get('About') ?? pagesByRole.get('FeaturedStory'))) ||
      (/blog|news|post|article|read|stories|journal|tips/.test(normalized) &&
        (pagesByRole.get('StoryGrid') ??
          pagesByRole.get('FeaturedStory') ??
          pagesByRole.get('Topics'))) ||
      (/feature|service|how it works|learn|explore|tour|class|schedule|trainer/.test(
        normalized,
      ) &&
        (pagesByRole.get('Services') ??
          pagesByRole.get('Programs') ??
          pagesByRole.get('Curriculum') ??
          pagesByRole.get('Agenda') ??
          pagesByRole.get('Speakers') ??
          pagesByRole.get('Amenities') ??
          pagesByRole.get('Features') ??
          pagesByRole.get('Steps') ??
          pagesByRole.get('Schedule'))) ||
      null
    if (!role) return null
    const section = role.sections.find((candidate) =>
      Object.keys(ROLE_ALIASES).includes(candidate),
    )
    return section
      ? `${role.label}#${role.id}_${section.toLowerCase()}`
      : role.label
  }

  for (const [pageId, propsByRole] of Object.entries(input.pageProps)) {
    if (!input.pages.some((page) => page.id === pageId)) continue
    for (const value of collectNavigationStrings(propsByRole)) {
      const target = semanticTargetFor(value)
      if (target) addTargetAlias(targetMap, value, target)
    }
  }
  return targetMap
}

const SECONDARY_ROLES: {
  id: string
  label: string
  need: string
  want: string[]
}[] = [
  {
    id: 'pricing',
    label: 'Pricing',
    need: 'Pricing',
    want: ['Navbar', 'Pricing', 'Faq', 'Cta', 'Footer'],
  },
  {
    id: 'menu',
    label: 'Menu',
    need: 'Menu',
    want: ['Navbar', 'Menu', 'Gallery', 'Footer'],
  },
  {
    id: 'programs',
    label: 'Programs',
    need: 'Programs',
    want: [
      'Navbar',
      'Programs',
      'Overview',
      'Schedule',
      'Pricing',
      'Testimonials',
      'Faq',
      'Cta',
      'Footer',
    ],
  },
  {
    id: 'curriculum',
    label: 'Curriculum',
    need: 'Curriculum',
    want: [
      'Navbar',
      'Curriculum',
      'Outcomes',
      'Mentors',
      'Steps',
      'Pricing',
      'Testimonials',
      'Faq',
      'Footer',
    ],
  },
  {
    id: 'outcomes',
    label: 'Outcomes',
    need: 'Outcomes',
    want: [
      'Navbar',
      'Outcomes',
      'Curriculum',
      'Mentors',
      'Stats',
      'Testimonials',
      'Faq',
      'Footer',
    ],
  },
  {
    id: 'services',
    label: 'Services',
    need: 'Services',
    want: ['Navbar', 'Services', 'Process', 'Stats', 'Cta', 'Footer'],
  },
  {
    id: 'products',
    label: 'Shop',
    need: 'Products',
    want: ['Navbar', 'Products', 'Gallery', 'Testimonials', 'Cta', 'Footer'],
  },
  {
    id: 'collections',
    label: 'Collections',
    need: 'Collections',
    want: [
      'Navbar',
      'Collections',
      'Products',
      'Lookbook',
      'Gallery',
      'Testimonials',
      'Footer',
    ],
  },
  {
    id: 'lookbook',
    label: 'Lookbook',
    need: 'Lookbook',
    want: [
      'Navbar',
      'Lookbook',
      'Collections',
      'Products',
      'Gallery',
      'Testimonials',
      'Footer',
    ],
  },
  {
    id: 'work',
    label: 'Work',
    need: 'Work',
    want: ['Navbar', 'Work', 'Projects', 'Stats', 'Testimonials', 'Footer'],
  },
  {
    id: 'projects',
    label: 'Work',
    need: 'Projects',
    want: ['Navbar', 'Projects', 'Work', 'Services', 'Stats', 'Footer'],
  },
  {
    id: 'gallery',
    label: 'Gallery',
    need: 'Gallery',
    want: ['Navbar', 'Gallery', 'Testimonials', 'Footer'],
  },
  {
    id: 'about',
    label: 'About',
    need: 'About',
    want: ['Navbar', 'About', 'Stats', 'Process', 'Testimonials', 'Footer'],
  },
  {
    id: 'contact',
    label: 'Contact',
    need: 'Contact',
    want: ['Navbar', 'Contact', 'Faq', 'Footer'],
  },
  {
    id: 'stories',
    label: 'Stories',
    need: 'StoryGrid',
    want: [
      'Navbar',
      'FeaturedStory',
      'StoryGrid',
      'Topics',
      'Authors',
      'Subscribe',
      'Footer',
    ],
  },
  {
    id: 'topics',
    label: 'Topics',
    need: 'Topics',
    want: ['Navbar', 'Topics', 'StoryGrid', 'Subscribe', 'Footer'],
  },
  {
    id: 'subscribe',
    label: 'Subscribe',
    need: 'Subscribe',
    want: ['Navbar', 'Subscribe', 'Pricing', 'Faq', 'Footer'],
  },
  {
    id: 'newsletter',
    label: 'Newsletter',
    need: 'Newsletter',
    want: ['Navbar', 'Newsletter', 'Subscribe', 'Products', 'Topics', 'Footer'],
  },
  {
    id: 'schedule',
    label: 'Schedule',
    need: 'Schedule',
    want: ['Navbar', 'Schedule', 'Events', 'Faq', 'Cta', 'Footer'],
  },
  {
    id: 'agenda',
    label: 'Agenda',
    need: 'Agenda',
    want: ['Navbar', 'Agenda', 'Speakers', 'Tickets', 'Venue', 'Faq', 'Footer'],
  },
  {
    id: 'events',
    label: 'Events',
    need: 'Events',
    want: ['Navbar', 'Events', 'Schedule', 'Gallery', 'Footer'],
  },
  {
    id: 'tickets',
    label: 'Tickets',
    need: 'Tickets',
    want: ['Navbar', 'Tickets', 'Schedule', 'Faq', 'Cta', 'Footer'],
  },
  {
    id: 'speakers',
    label: 'Speakers',
    need: 'Speakers',
    want: ['Navbar', 'Speakers', 'Agenda', 'Tickets', 'Venue', 'Faq', 'Footer'],
  },
  {
    id: 'venue',
    label: 'Venue',
    need: 'Venue',
    want: ['Navbar', 'Venue', 'Agenda', 'Gallery', 'Tickets', 'Faq', 'Footer'],
  },
  {
    id: 'rooms',
    label: 'Rooms',
    need: 'Rooms',
    want: ['Navbar', 'Rooms', 'Gallery', 'Pricing', 'Testimonials', 'Footer'],
  },
  {
    id: 'amenities',
    label: 'Amenities',
    need: 'Amenities',
    want: [
      'Navbar',
      'Amenities',
      'Rooms',
      'Gallery',
      'Booking',
      'Testimonials',
      'Faq',
      'Footer',
    ],
  },
  {
    id: 'booking',
    label: 'Booking',
    need: 'Booking',
    want: ['Navbar', 'Booking', 'Rooms', 'Amenities', 'Faq', 'Cta', 'Footer'],
  },
  {
    id: 'team',
    label: 'Team',
    need: 'Team',
    want: ['Navbar', 'Team', 'About', 'Stats', 'Testimonials', 'Footer'],
  },
  {
    id: 'authors',
    label: 'Authors',
    need: 'Authors',
    want: ['Navbar', 'Authors', 'StoryGrid', 'Subscribe', 'Footer'],
  },
]

export const PAGE_ROLE_IDS = ['home', ...SECONDARY_ROLES.map((role) => role.id)]

export const planPages = (
  family: RoutePlanFamily,
  seed: string,
  navLabels?: Record<string, string>,
): PagePlan[] => {
  const home: PagePlan = {
    id: 'home',
    label: navLabels?.home || 'Home',
    sections: family.sections,
  }
  const rng = makeSeededRng(`${seed}:pages`)
  const has = new Set(family.sections)
  const candidates = SECONDARY_ROLES.filter((role) => has.has(role.need)).map(
    (role) => ({
      id: role.id,
      label: navLabels?.[role.id] || role.label,
      sections: family.sections.filter((section) =>
        role.want.includes(section),
      ),
    }),
  )
  const usable = candidates.filter((page) => page.sections.length >= 3)
  const shuffled = [...usable].sort(() => rng() - 0.5)
  const count = Math.min(5, shuffled.length)
  return [home, ...shuffled.slice(0, count)]
}

const hashString = (value: string): number => {
  let h = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    h ^= value.charCodeAt(index)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const makeSeededRng = (seed: string): (() => number) => {
  let state = hashString(seed) || 1
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}
