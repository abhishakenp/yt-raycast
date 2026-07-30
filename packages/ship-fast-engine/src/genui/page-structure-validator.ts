/**
 * Page structure validator — enforces that sub-pages use different motifs
 * from the home page and from each other, and that page-type-specific
 * content requirements are met.
 *
 * This is a post-generation repair step. The LLM is instructed via prompt
 * to follow these rules, but when it doesn't, this validator rewrites
 * the parsed sections to comply.
 */

import type { CompositionSection, ParsedComposition } from './composition-parser.ts'

// ─── Page-type → required motifs ──────────────────────────────────────────
// If a page ID contains these keywords, it should have at least one of
// the listed motifs. If none are present, the first content section
// (excluding Navbar/Footer) is replaced with a required motif.

const PAGE_TYPE_REQUIREMENTS: Record<string, string[]> = {
  about: ['PersonGrid', 'TeamShowcase', 'Timeline', 'MediaSplit'],
  team: ['PersonGrid', 'TeamShowcase', 'Timeline', 'MediaSplit'],
  blog: ['ArticlePreview', 'ContentTabs', 'BlogPost'],
  news: ['ArticlePreview', 'ContentTabs', 'BlogPost'],
  contact: ['ContactForm', 'BookingForm', 'MapBlock'],
  pricing: ['PricingTable', 'ComparisonTable'],
  menu: ['GroupedList', 'SimpleList', 'ProductGrid'],
  services: ['FeatureList', 'StepProcess', 'ValueProps'],
  events: ['EventSchedule', 'Timeline'],
  portfolio: ['ProjectGallery', 'ImageGallery'],
  gallery: ['ImageGallery', 'ProjectGallery'],
  product: ['ProductDetail', 'ProductGrid'],
  post: ['BlogPost'],
  article: ['BlogPost'],
  story: ['BlogPost'],
  docs: ['SidebarNav'],
  documentation: ['SidebarNav'],
  help: ['SidebarNav'],
  dashboard: ['SidebarNav'],
  admin: ['SidebarNav'],
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function isChromeSection(s: CompositionSection): boolean {
  return s.motif === 'Navbar' || s.motif === 'Footer'
}

function contentSectionsForPage(
  parsed: ParsedComposition,
  page: string,
): CompositionSection[] {
  return parsed.sections.filter((s) => s.page === page && !isChromeSection(s))
}

function motifsForPage(
  parsed: ParsedComposition,
  page: string,
): Set<string> {
  return new Set(contentSectionsForPage(parsed, page).map((s) => s.motif))
}

function pageTypeFromId(pageId: string): string | null {
  const lower = pageId.toLowerCase()
  // Collect all matching page types, then return the longest key (most specific).
  // This prevents "documentation-menu" from matching "menu" when "documentation"
  // is a more specific page type that also matches (as a prefix).
  // When two keys have the same length (e.g. "blog" and "post" for "blog-post"),
  // prefer the prefix match (the first segment) as it's the primary page type.
  let bestKey: string | null = null
  let bestIsPrefix = false
  for (const key of Object.keys(PAGE_TYPE_REQUIREMENTS)) {
    // Word-boundary matching: exact, or hyphen/underscore delimited prefix/suffix.
    const isExact = lower === key
    const isPrefix =
      lower.startsWith(key + '-') || lower.startsWith(key + '_')
    const isSuffix =
      lower.endsWith('-' + key) || lower.endsWith('_' + key)
    if (!isExact && !isPrefix && !isSuffix) continue
    const thisIsPrefix = isExact || isPrefix
    if (!bestKey) {
      bestKey = key
      bestIsPrefix = thisIsPrefix
    } else if (key.length > bestKey.length) {
      bestKey = key
      bestIsPrefix = thisIsPrefix
    } else if (key.length === bestKey.length && thisIsPrefix && !bestIsPrefix) {
      // Tiebreaker: equal length, prefer prefix over suffix
      bestKey = key
      bestIsPrefix = thisIsPrefix
    }
  }
  return bestKey
}

// ─── Validation result ────────────────────────────────────────────────────

export interface PageStructureViolation {
  page: string
  type: 'missing_required_motif' | 'duplicate_motif_across_pages'
  message: string
  /** Motifs that are duplicated or missing */
  motifs: string[]
}

export function validatePageStructure(
  parsed: ParsedComposition,
): PageStructureViolation[] {
  const violations: PageStructureViolation[] = []

  if (parsed.pages.length <= 1) return violations

  const homePage = parsed.pages[0]
  const homeMotifs = motifsForPage(parsed, homePage)

  // Check 1: Each sub-page should not share more than 1 content motif with home
  for (let i = 1; i < parsed.pages.length; i++) {
    const page = parsed.pages[i]
    const pageMotifs = motifsForPage(parsed, page)
    const shared = [...pageMotifs].filter((m) => homeMotifs.has(m))
    if (shared.length > 1) {
      violations.push({
        page,
        type: 'duplicate_motif_across_pages',
        message: `Page "${page}" shares ${shared.length} content motifs with the home page: ${shared.join(', ')}. Sub-pages should use different motifs from the home page.`,
        motifs: shared,
      })
    }
  }

  // Check 2: Page-type-specific motif requirements
  for (let i = 1; i < parsed.pages.length; i++) {
    const page = parsed.pages[i]
    const pageType = pageTypeFromId(page)
    if (!pageType) continue
    const required = PAGE_TYPE_REQUIREMENTS[pageType]
    const pageMotifs = motifsForPage(parsed, page)
    const hasRequired = required.some((m) => pageMotifs.has(m))
    if (!hasRequired) {
      violations.push({
        page,
        type: 'missing_required_motif',
        message: `Page "${page}" (type: ${pageType}) should include one of: ${required.join(', ')}. None found.`,
        motifs: required,
      })
    }
  }

  return violations
}

// ─── Repair ───────────────────────────────────────────────────────────────
// When violations are found, replace the first content section on the
// violating page with a page-type-appropriate motif.

const PAGE_TYPE_REPAIR_MOTIF: Record<string, string> = {
  about: 'PersonGrid',
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
  product: 'ProductDetail',
  post: 'BlogPost',
  article: 'BlogPost',
  story: 'BlogPost',
  docs: 'SidebarNav',
  documentation: 'SidebarNav',
  help: 'SidebarNav',
  dashboard: 'SidebarNav',
  admin: 'SidebarNav',
}

export function repairPageStructure(parsed: ParsedComposition): {
  repaired: boolean
  violations: PageStructureViolation[]
} {
  const violations = validatePageStructure(parsed)
  if (violations.length === 0) return { repaired: false, violations: [] }

  let repaired = false

  for (const v of violations) {
    const pageType = pageTypeFromId(v.page)
    if (!pageType) continue

    const repairMotif = PAGE_TYPE_REPAIR_MOTIF[pageType]
    if (!repairMotif) continue

    // Find the first content section on this page that is NOT a required motif
    // and is shared with home (for duplicate violations), or just the first
    // content section (for missing motif violations)
    const contentSections = contentSectionsForPage(parsed, v.page)
    if (contentSections.length === 0) continue

    // For duplicate violations, replace the first duplicated motif
    // For missing motif violations, replace the first content section
    let targetSection: CompositionSection | undefined
    if (v.type === 'duplicate_motif_across_pages') {
      targetSection = contentSections.find((s) => v.motifs.includes(s.motif))
    }
    if (!targetSection) {
      targetSection = contentSections[0]
    }

    // Replace the motif and props
    targetSection.motif = repairMotif
    // Preserve the heading if the original had one. If the original had no
    // heading, leave it empty — the motif renders its own default. Do NOT
    // inject English repair headings (PAGE_TYPE_REPAIR_PROPS) because they
    // break localization for non-English sites.
    // Clear nested groups that don't apply to the new motif
    targetSection.nested = {}
    repaired = true
  }

  return { repaired, violations }
}
