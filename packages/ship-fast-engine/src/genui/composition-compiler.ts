/**
 * composition-compiler.ts — compiles a ParsedComposition into OpenUI source.
 *
 * Takes the parsed composition (motif sections + design intent) and produces
 * the OpenUI-lang source string that the existing renderer consumes:
 *
 *   home_splitHero = SplitHero(heading="...", primaryCta="...", design="...")
 *   home_splitHero_anchor = SectionAnchor("home_splitHero", home_splitHero, "scroll-mt-28")
 *   home = Stack([home_splitHero_anchor, ...])
 *   root = PageSwitch(["Home", ...], [home, ...], "", {...})
 *
 * The motif capsules are OpenUI-registered components, so the existing
 * buildComponentCall mechanism works — we just pass the motif name directly
 * instead of constructing `family+Role`.
 */
import type {
  ParsedComposition,
  CompositionSection,
} from './composition-parser.ts'
import { sectionToProps } from './composition-parser.ts'
import { serializeDesignIntent } from '../../../ship-fast-blocks/src/primitives/design-system.ts'
import { buildComponentCall } from './openui-signature.ts'
import { inferLakebedFromComposition } from './inference.ts'
import { getInteraction } from './interactions.ts'
import { generateConvexBackend } from './convex-codegen.ts'
import { compileSvelteBlock, type CompiledSvelte } from './svelte-compiler.ts'
import type { LakebedDefinition, DataBinding } from './types.ts'

export interface CompositionCompileResult {
  /** Full OpenUI source string (all pages + skeleton). */
  source: string
  /** Per-page source statements. */
  pageSources: Record<string, string>
  /** Skeleton line (root = PageSwitch(...)). */
  skeleton: string
  /** Brand name. */
  brand: string
  /** Site title. */
  title: string
  /** Design intent (serialized for the renderer). */
  design: string
  /** Pages list. */
  pages: string[]
  /** Nav labels. */
  navLabels?: Record<string, string>
  /** Lakebed definition (tables, queries, mutations). */
  lakebed: LakebedDefinition
  /** Convex backend files (path → content). */
  convexBackend: Record<string, string>
  /** Data bindings (componentId → binding). */
  dataBindings: Record<string, DataBinding>
  /** Svelte scripts (path → JS). */
  svelteScripts: Record<string, string>
  /** Fullstack manifest. */
  fullstackManifest: {
    tables: string[]
    schemaVersion: number
    auth: boolean
  }
}

export interface CompositionCompileOptions {
  /** Override brand (falls back to parsed brand, then "Brand"). */
  brand?: string
  /** Override title. */
  title?: string
  /** Fallback navbar variant if the LLM didn't specify one. */
  navbarVariant?: string
}

/**
 * Compile a parsed composition into OpenUI source.
 */
export async function compileComposition(
  parsed: ParsedComposition,
  opts: CompositionCompileOptions = {},
): Promise<CompositionCompileResult> {
  // Brand is LLM-decided. The prompt requires @brand; if the LLM omits it,
  // throw so the runner can retry instead of silently using a generic name.
  const brand = opts.brand ?? parsed.brand
  if (!brand) {
    throw new Error(
      'Composition missing @brand — the LLM must always emit a brand name.',
    )
  }
  const title = opts.title ?? parsed.title ?? brand
  const designStr = serializeDesignIntent(parsed.design)
  const pages = parsed.pages.length > 0 ? parsed.pages : ['home']

  // Build nav labels from pages
  const navLabels = parsed.navLabels ?? defaultNavLabels(pages)
  const navLinkLabels = pages.map((p) => navLabels[p] ?? capitalize(p))

  // ── Compile each section into OpenUI statements ───────────────────

  const allStmts: string[] = []
  const pageSources: Record<string, string> = {}

  // Group sections by page. Sections without a page tag (or page="home")
  // go to the home page. Sections with @page tags go to their respective pages.
  const hasPageTags = parsed.sections.some((s) => s.page && s.page !== 'home')
  const homeSections = parsed.sections.filter(
    (s) => !s.page || s.page === 'home',
  )

  // Home page: all home sections in order
  const homeStmts: string[] = []
  const homeRefs: string[] = []

  for (const section of homeSections) {
    const { statements, ref } = await compileCompositionSection(
      section,
      'home',
      brand,
      navLinkLabels,
      opts.navbarVariant,
    )
    if (ref) {
      homeStmts.push(...statements)
      homeRefs.push(ref)
    }
  }

  homeStmts.push(`home = Stack([${homeRefs.join(', ')}])`)
  pageSources.home = homeStmts.join('\n')
  allStmts.push(...homeStmts)

  // ── Secondary pages ───────────────────────────────────────────────
  // If the LLM used @page directives, use the page-tagged sections directly.
  // Otherwise, fall back to findFocusedSection (legacy behavior).

  const validPageIds = pages.filter((p) => p !== 'home')

  // Find navbar and footer from home page for reuse on sub-pages
  const navbarSection = homeSections.find((s) => s.motif === 'Navbar')
  const footerSection = homeSections.find((s) => s.motif === 'Footer')

  for (const pageId of validPageIds) {
    const pageStmts: string[] = []
    const pageRefs: string[] = []

    if (hasPageTags) {
      // New behavior: use @page-tagged sections directly
      const pageSections = parsed.sections.filter((s) => s.page === pageId)

      // Navbar (reuse from home if not already on this page)
      const pageHasNavbar = pageSections.some((s) => s.motif === 'Navbar')
      if (!pageHasNavbar && navbarSection) {
        const { statements, ref } = await compileCompositionSection(
          navbarSection,
          pageId,
          brand,
          navLinkLabels,
          opts.navbarVariant,
        )
        if (ref) {
          pageStmts.push(...statements)
          pageRefs.push(ref)
        }
      }

      // Page-specific sections
      for (const section of pageSections) {
        const { statements, ref } = await compileCompositionSection(
          section,
          pageId,
          brand,
          navLinkLabels,
          opts.navbarVariant,
        )
        if (ref) {
          pageStmts.push(...statements)
          pageRefs.push(ref)
        }
      }

      // Footer (reuse from home if not already on this page)
      const pageHasFooter = pageSections.some((s) => s.motif === 'Footer')
      if (!pageHasFooter && footerSection) {
        const { statements, ref } = await compileCompositionSection(
          footerSection,
          pageId,
          brand,
          navLinkLabels,
          opts.navbarVariant,
        )
        if (ref) {
          pageStmts.push(...statements)
          pageRefs.push(ref)
        }
      }

      // If the page has no content sections (only navbar/footer), inject a
      // fallback section so the page is never empty. PROVABLE INVARIANT:
      // every page in PageSwitch routes must have ≥1 content section.
      const contentRefs = pageRefs.filter(
        (r) => !r.includes('navbar') && !r.includes('footer'),
      )
      if (contentRefs.length === 0) {
        const fallback = createFallbackSection(pageId, brand)
        const { statements, ref } = await compileCompositionSection(
          fallback,
          pageId,
          brand,
          navLinkLabels,
          opts.navbarVariant,
        )
        if (ref) {
          pageStmts.push(...statements)
          pageRefs.push(ref)
        }
      }
    } else {
      // Legacy behavior: find a focused section from the home page
      let focused = findFocusedSection(parsed.sections, pageId)
      // If no focused section found, use a fallback so the page is never empty
      if (!focused) {
        focused = createFallbackSection(pageId, brand)
      }

      // Navbar
      if (navbarSection) {
        const { statements, ref } = await compileCompositionSection(
          navbarSection,
          pageId,
          brand,
          navLinkLabels,
          opts.navbarVariant,
        )
        if (ref) {
          pageStmts.push(...statements)
          pageRefs.push(ref)
        }
      }

      // Focused section
      {
        const { statements, ref } = await compileCompositionSection(
          focused,
          pageId,
          brand,
          navLinkLabels,
          opts.navbarVariant,
        )
        if (ref) {
          pageStmts.push(...statements)
          pageRefs.push(ref)
        }
      }

      // Footer
      if (footerSection) {
        const { statements, ref } = await compileCompositionSection(
          footerSection,
          pageId,
          brand,
          navLinkLabels,
          opts.navbarVariant,
        )
        if (ref) {
          pageStmts.push(...statements)
          pageRefs.push(ref)
        }
      }
    }

    pageStmts.push(`${pageId} = Stack([${pageRefs.join(', ')}])`)
    pageSources[pageId] = pageStmts.join('\n')
    allStmts.push(...pageStmts)
  }

  // ── Skeleton ──────────────────────────────────────────────────────
  const validAllPageIds = ['home', ...validPageIds]

  const skeleton = `root = PageSwitch(${JSON.stringify(navLinkLabels)}, [${validAllPageIds.join(', ')}], "", ${JSON.stringify(validAllPageIds)})`

  const source = `${allStmts.join('\n')}\n${skeleton}`

  // ── Infer lakebed from composition sections ───────────────────────
  const lakebed = inferLakebedFromComposition(homeSections)
  const hasAuth = lakebed.tables.some((t) => t.name === 'authSessions')

  // ── Generate data bindings for interactive motifs ─────────────────
  const dataBindings: Record<string, DataBinding> = {}
  const seedData: Record<string, unknown[]> = {}

  for (const section of homeSections) {
    const profile = getInteraction(section.motif)
    if (!profile || profile.profiles[0] === 'none') continue

    const componentId = `home_${section.motif.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    const binding: DataBinding = {
      componentId,
      component: section.motif,
      profiles: profile.profiles,
      queries: {},
      mutations: {},
    }

    for (const [opKey, opName] of Object.entries(profile.operations)) {
      if (
        opKey.startsWith('list') ||
        opKey.startsWith('saved') ||
        opKey.startsWith('session') ||
        opKey.startsWith('search') ||
        opKey.startsWith('order') ||
        opKey.startsWith('submission')
      ) {
        binding.queries[opKey] = opName
      } else {
        binding.mutations[opKey] = opName
      }
    }

    if (profile.seedTable) {
      binding.seedTable = profile.seedTable
      binding.seedPath = profile.seedPath
      const props = sectionToProps(section)
      if (profile.seedPath && props) {
        const pathParts = profile.seedPath.split('.')
        let extracted: unknown = props
        for (const part of pathParts) {
          extracted = (extracted as Record<string, unknown>)?.[part]
        }
        if (Array.isArray(extracted)) {
          seedData[profile.seedTable] = extracted
        }
      }
    }

    dataBindings[componentId] = binding
  }

  // ── Generate Convex backend ───────────────────────────────────────
  const convexBackend = generateConvexBackend(lakebed, seedData)

  // ── Compile svelte blocks (if any sections have @svelte) ──────────
  const svelteScripts: Record<string, string> = {}
  for (const section of parsed.sections) {
    if (section.svelte?.source) {
      try {
        const compiled = await compileSvelteBlock(
          section.svelte.source,
          section.motif,
        )
        const scriptPath = `scripts/svelte-home-${section.motif.toLowerCase()}.js`
        svelteScripts[scriptPath] = compiled.domJs
      } catch {
        // Svelte compilation failed — skip, the runner will validate and retry
      }
    }
  }

  return {
    source,
    pageSources,
    skeleton,
    brand,
    title,
    design: designStr,
    pages: validAllPageIds,
    navLabels,
    lakebed,
    convexBackend,
    dataBindings,
    svelteScripts,
    fullstackManifest: {
      tables: lakebed.tables.map((t) => t.name),
      schemaVersion: 1,
      auth: hasAuth,
    },
  }
}

// ─── Section compilation ─────────────────────────────────────────────────

async function compileCompositionSection(
  section: CompositionSection,
  pageId: string,
  brand: string,
  nav: string[],
  navbarVariant?: string,
): { statements: string[]; ref: string | null } {
  const id = `${pageId}_${section.motif.toLowerCase().replace(/[^a-z0-9]/g, '')}`
  const props = sectionToProps(section)

  // Fix placeholder imageAlt values — the LLM sometimes passes "imageAlt"
  // (the field name) instead of a real description. Replace with a generic
  // but useful query based on the motif type.
  fixPlaceholderImageAlt(props, section.motif)

  // Inject brand for Navbar/Footer motifs
  if (section.motif === 'Navbar' && !props.brand) {
    props.brand = brand
  }
  if (section.motif === 'Footer' && !props.brand) {
    props.brand = brand
  }

  // Inject nav links for Navbar — always use the canonical navLinkLabels
  // (derived from @navLabels or page names). The targetMap is generated from
  // these same labels, so they must match deterministically. The LLM should
  // use the @navLabels directive to customize display labels, not provide
  // custom links in the Navbar section.
  if (section.motif === 'Navbar') {
    props.links = nav
    // Inject navbar variant from genome if the LLM didn't specify one
    if (!props.variant && navbarVariant) {
      props.variant = navbarVariant
    }
  }
  // Inject nav links for Footer only when the LLM didn't provide columns.
  // Footer columns are intentionally different from Navbar links (Product,
  // Company, Legal, etc.) so we preserve LLM-provided columns as-is.
  if (section.motif === 'Footer') {
    const llmColumns = props.columns as
      | Array<{ title: string; links: string[] }>
      | undefined
    if (!llmColumns || llmColumns.length === 0) {
      props.columns = [{ title: 'Pages', links: nav }]
    }
  }

  // Build the OpenUI call — buildComponentCall maps named props to positional
  // args in the correct order defined by the component spec signature.
  const call = buildComponentCall({
    component: section.motif,
    props,
    brand,
    nav,
  })

  if (!call) {
    // Motif not recognized — check for svelte block (LLM-generated component)
    if (section.svelte?.source) {
      try {
        const compiledSvelte = await compileSvelteBlock(
          section.svelte.source,
          section.motif,
        )
        const scriptPath = `/scripts/svelte-${pageId}-${section.motif.toLowerCase()}.js`
        const htmlJson = JSON.stringify(compiledSvelte.ssrHtml)
        const scriptPathJson = JSON.stringify(scriptPath)
        const cssJson = JSON.stringify(compiledSvelte.css)
        const callStmt = `${id} = SvelteIsland(${htmlJson}, ${scriptPathJson}, ${cssJson})`
        const anchorId = `${id}_anchor`
        const anchorStmt = `${anchorId} = SectionAnchor("${id}", ${id}, "scroll-mt-28")`
        return { statements: [callStmt, anchorStmt], ref: anchorId }
      } catch {
        // Svelte compilation failed — skip
        return { statements: [], ref: null }
      }
    }
    // Motif not recognized and no svelte — skip silently
    return { statements: [], ref: null }
  }

  const callStmt = `${id} = ${call}`
  const anchorId = `${id}_anchor`
  const isNavbar = section.motif === 'Navbar'
  const anchorStmt = isNavbar
    ? `${anchorId} = SectionAnchor("${id}", ${id})`
    : `${anchorId} = SectionAnchor("${id}", ${id}, "scroll-mt-28")`

  return { statements: [callStmt, anchorStmt], ref: anchorId }
}

// ─── Helpers ─────────────────────────────────────────────────────────────

// ─── Fallback content for empty pages ───────────────────────────────────
// PROVABLE INVARIANT: Every page in the PageSwitch routes list MUST have at
// least one content section. An empty page (only navbar/footer) is broken by
// definition. When the LLM omits content for a page, this map selects a
// page-type-appropriate motif, and createFallbackSection generates generic
// but useful content so the page is never empty.

const FALLBACK_MOTIF_FOR_PAGE: Record<string, string> = {
  about: 'MediaSplit',
  team: 'PersonGrid',
  blog: 'ArticlePreview',
  news: 'ArticlePreview',
  contact: 'ContactForm',
  pricing: 'PricingTable',
  menu: 'GroupedList',
  services: 'FeatureList',
  events: 'EventSchedule',
  portfolio: 'ProjectGallery',
  gallery: 'ImageGallery',
  collections: 'ProductGrid',
  lookbook: 'ImageGallery',
  product: 'ProductDetail',
  products: 'ProductGrid',
  shop: 'ProductGrid',
  store: 'ProductGrid',
  post: 'BlogPost',
  article: 'BlogPost',
  story: 'BlogPost',
  docs: 'SidebarNav',
  documentation: 'SidebarNav',
  help: 'SidebarNav',
  dashboard: 'SidebarNav',
  admin: 'SidebarNav',
  faq: 'FaqAccordion',
  newsletter: 'NewsletterCta',
}

function pageTypeFromId(pageId: string): string | null {
  const lower = pageId.toLowerCase()
  for (const key of Object.keys(FALLBACK_MOTIF_FOR_PAGE)) {
    if (
      lower === key ||
      lower.startsWith(key + '-') ||
      lower.startsWith(key + '_') ||
      lower.endsWith('-' + key) ||
      lower.endsWith('_' + key)
    ) {
      return key
    }
  }
  return null
}

function createFallbackSection(
  pageId: string,
  brand: string,
): CompositionSection {
  const pageType = pageTypeFromId(pageId)
  const motif = (pageType && FALLBACK_MOTIF_FOR_PAGE[pageType]) || 'CardGrid'
  const heading = capitalize(pageId)
  const label = brand || 'Brand'

  // Generate minimal but useful props per motif type
  const props: Record<string, string> = { heading }

  switch (motif) {
    case 'ProductGrid':
    case 'ImageGallery':
      props.cards = JSON.stringify([
        { title: `${heading} item 1`, imageAlt: `${label} ${heading} item 1` },
        { title: `${heading} item 2`, imageAlt: `${label} ${heading} item 2` },
        { title: `${heading} item 3`, imageAlt: `${label} ${heading} item 3` },
      ])
      break
    case 'ContactForm':
      props.heading = `Contact ${label}`
      break
    case 'PricingTable':
      props.heading = `${label} pricing`
      break
    case 'ArticlePreview':
      props.heading = `${label} articles`
      break
    case 'PersonGrid':
      props.heading = `Meet the ${label} team`
      break
    case 'FaqAccordion':
      props.heading = `Frequently asked questions`
      break
    default:
      props.subheading = `Explore ${label}'s ${heading.toLowerCase()}`
      break
  }

  return {
    motif,
    props,
    nested: {},
    line: 0,
    page: pageId,
  }
}

function findFocusedSection(
  sections: CompositionSection[],
  pageId: string,
): CompositionSection | null {
  // Try to find a section whose motif matches the page name
  const pageMotif = capitalize(pageId)
  const exact = sections.find((s) => s.motif === pageMotif)
  if (exact) return exact

  // Try common page→motif mappings
  const PAGE_MOTIF_MAP: Record<string, string[]> = {
    about: ['MediaSplit', 'AboutStory', 'PersonGrid', 'TeamShowcase'],
    philosophy: ['MediaSplit', 'AboutStory', 'ValueProps', 'CardGrid'],
    values: ['ValueProps', 'CardGrid', 'MediaSplit'],
    pricing: ['PricingTable'],
    contact: ['ContactForm', 'MapBlock', 'BookingForm'],
    menu: ['GroupedList'],
    services: ['CardGrid', 'ValueProps', 'SimpleList'],
    team: ['PersonGrid', 'TeamShowcase'],
    gallery: ['ImageGallery', 'ProjectGallery'],
    work: ['ProjectGallery', 'ImageGallery'],
    projects: ['ProjectGallery', 'ImageGallery', 'CardGrid'],
    products: ['ProductGrid'],
    shop: ['ProductGrid'],
    store: ['ProductGrid'],
    product: ['ProductDetail', 'ProductGrid'],
    blog: ['ArticlePreview', 'BlogPost'],
    post: ['BlogPost'],
    article: ['BlogPost'],
    story: ['BlogPost'],
    news: ['ArticlePreview', 'BlogPost'],
    docs: ['SidebarNav'],
    documentation: ['SidebarNav'],
    help: ['SidebarNav'],
    dashboard: ['SidebarNav'],
    admin: ['SidebarNav'],
    faq: ['FaqAccordion'],
    newsletter: ['NewsletterCta'],
  }

  const motifNames = PAGE_MOTIF_MAP[pageId.toLowerCase()]
  if (motifNames) {
    for (const name of motifNames) {
      const found = sections.find((s) => s.motif === name)
      if (found) return found
    }
  }

  // Fallback: first non-navbar, non-footer, non-hero section — sub-pages
  // should never render the home page's hero as their focused section.
  const HERO_MOTIFS = new Set([
    'SplitHero',
    'CenteredHero',
    'PosterHero',
    'ComingSoonHero',
  ])
  return (
    sections.find(
      (s) =>
        s.motif !== 'Navbar' &&
        s.motif !== 'Footer' &&
        !HERO_MOTIFS.has(s.motif),
    ) ?? null
  )
}

function defaultNavLabels(pages: string[]): Record<string, string> {
  const labels: Record<string, string> = {}
  for (const page of pages) {
    labels[page] = capitalize(page)
  }
  return labels
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ─── Image alt text repair ────────────────────────────────────────────────
//
// The LLM sometimes passes "imageAlt" (the field name) or generic placeholders
// like "image", "photo", "picture" as the alt value. Since imageAlt is used as
// the Pexels stock photo search query, these produce irrelevant images.
// This function detects and replaces them with motif-appropriate fallbacks.

const PLACEHOLDER_ALT_VALUES = new Set([
  'imagealt',
  'image',
  'photo',
  'picture',
  'placeholder',
  'img',
  'alt',
  'src',
  'imagesrc',
])

const MOTIF_FALLBACK_ALT: Record<string, string> = {
  SplitHero: 'Modern product hero shot on clean background',
  PosterHero: 'Cinematic hero background image',
  CenteredHero: 'Abstract gradient background',
  ComingSoonHero: 'Minimalist product teaser image',
  CardGrid: 'Modern product card imagery',
  BentoGrid: 'Editorial bento grid layout image',
  ImageGallery: 'Professional photography gallery image',
  MediaSplit: 'Editorial split layout photograph',
  PersonGrid: 'Professional headshot portrait',
  TeamShowcase: 'Professional team headshot portrait',
  ProductGrid: 'Product photography on clean background',
  ProjectGallery: 'Creative project portfolio showcase image',
  CategoryNav: 'Category navigation thumbnail image',
  FeatureList: 'Feature illustration on clean background',
  ProductDetail: 'Product photo on clean white background',
  BlogPost: 'Editorial article hero image',
}

function fixPlaceholderImageAlt(
  props: Record<string, unknown>,
  motif: string,
): void {
  const fixValue = (val: unknown): unknown => {
    if (typeof val !== 'string') return val
    if (PLACEHOLDER_ALT_VALUES.has(val.toLowerCase().trim())) {
      return MOTIF_FALLBACK_ALT[motif] ?? 'Professional editorial photograph'
    }
    return val
  }

  // Fix top-level imageAlt
  if ('imageAlt' in props) {
    props.imageAlt = fixValue(props.imageAlt)
  }

  // Fix imageAlt inside nested arrays (cards, people, products, etc.)
  for (const value of Object.values(props)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === 'object' && 'imageAlt' in item) {
          item.imageAlt = fixValue(item.imageAlt)
        }
      }
    }
  }
}

// ─── Motif call builder ──────────────────────────────────────────────────
// (Removed — now using buildComponentCall from openui-signature.ts which
// maps named props to positional args in the correct order from the component
// spec. The old buildMotifCall emitted named args which the OpenUI parser
// doesn't understand — it treated them as positional and dropped "excess".)
