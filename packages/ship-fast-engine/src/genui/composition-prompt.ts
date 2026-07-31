/**
 * composition-prompt.ts — LLM prompt for the generative composition DSL.
 *
 * Uses a structural genome (random per session) to constrain motif selection,
 * design axes, and chrome palette. This replaces the old fixed "vertical →
 * structure" mapping, so two identical prompts produce structurally different
 * sites.
 */
import type { StructuralGenome } from './genome.ts'

export interface CompositionPromptResult {
  system: string
  user: string
}

/** The 40 available motifs with their prop signatures. */
const MOTIF_SIGNATURES: Record<string, string> = {
  SplitHero:
    'badge? heading? highlight? subheading? primaryCta? secondaryCta? stats>value~label? watermark? imageAlt? imageSrc? variant? chrome? index? decor?',
  CenteredHero:
    'heading? subheading? primaryCta? secondaryCta? stats>value~label?',
  PosterHero: 'heading? subheading? cta? imageAlt? imageSrc?',
  ComingSoonHero: 'heading? subheading? cta?',
  CardGrid:
    'eyebrow? heading? subheading? cards>title~description~imageAlt~imageSrc? cols? variant? chrome? index? watermark? decor?',
  BentoGrid:
    'heading? cells>title~description~imageAlt~imageSrc~span? layout? chrome? index?',
  ImageGallery: 'heading? images>alt~src? cols? chrome? index?',
  LogoStrip: 'heading? logos>name?',
  TestimonialRow:
    'heading? testimonials>quote~author~role? cols? chrome? index?',
  PersonGrid: 'heading? people>name~role~bio~imageAlt~imageSrc? cols?',
  PricingTable:
    'heading? subheading? tiers>name~price~features~cta~highlighted? chrome? index? watermark?',
  StatsStrip:
    'heading? stats>value~label~sparkBars? cols? chrome? index? watermark? decor?',
  FeatureList:
    'features>heading~description~imageAlt~imageSrc? chrome? index? watermark?',
  GroupedList:
    'heading? subheading? groups>name~items>title~description~price?',
  NumberedList: 'heading? subheading? steps>title~description? chrome? index?',
  SimpleList: 'heading? items>title~description~price~meta?',
  FaqAccordion: 'heading? items>question~answer? chrome? index?',
  Timeline: 'heading? events>date~title~description? chrome? index?',
  CtaBand: 'heading? subheading? cta? variant? chrome? watermark?',
  NewsletterCta: 'heading? subheading? cta? variant? chrome? watermark?',
  ContactForm: 'heading? subheading?',
  BookingForm: 'heading? subheading?',
  Navbar:
    'brand? links>Home, About, Contact cta? variant>default, centered, minimal, split?',
  Footer: 'brand? columns>title~links social>Twitter, Instagram, Facebook',
  MediaSplit:
    'heading? text? imageAlt? imageSrc? reversed? variant? chrome? index?',
  MapBlock: 'heading? address? hours?',
  ArticlePreview:
    'heading? featured>title~excerpt~imageAlt~imageSrc? articles>title~excerpt?',
  CategoryNav: 'heading? categories>name~imageAlt~imageSrc? cols?',
  ComparisonTable: 'heading? columns>name? rows>feature~values?',
  StepProcess: 'heading? steps>title~description?',
  ValueProps: 'heading? values>title~description? cols? chrome? index?',
  QuoteBand: 'quote? author? role? variant? chrome? watermark?',
  LogosMarquee: 'logos>name?',
  ContentTabs: 'heading? tabs>label~content?',
  SearchBar: 'heading? placeholder? filters>name?',
  EventSchedule: 'heading? events>time~title~description?',
  ProductGrid: 'heading? products>name~price~imageAlt~imageSrc? cols?',
  TeamShowcase: 'heading? people>name~role~bio~imageAlt~imageSrc? cols?',
  ProjectGallery: 'heading? projects>title~category~imageAlt~imageSrc? cols?',
  DonationBand: 'heading? subheading? amounts>name?',
  ProductDetail:
    'title? price? comparePrice? rating? reviewCount? description? imageAlt? imageSrc? variants>name? primaryCta? specs>label~value?',
  BlogPost:
    'title? author? date? readTime? imageAlt? imageSrc? excerpt? sections>heading~body? pullQuote? authorBio? authorImageAlt?',
  SidebarNav: 'heading? groups>label~items>name? contentTitle? contentBody?',
}

function buildMotifList(availableMotifs: string[]): string {
  return availableMotifs
    .map((name) => `  ${name}: ${MOTIF_SIGNATURES[name] ?? name}`)
    .join('\n')
}

const RHYTHM_GUIDES: Record<string, string> = {
  dense: `DENSE — tight spacing, multiple grids, minimal whitespace.`,
  airy: `AIRY — generous whitespace, fewer sections, breathing room.`,
  alternating: `ALTERNATING — alternate dense grids with spacious breaks.`,
  cinematic: `CINEMATIC — dramatic height variation, oversized type, full-bleed sections.`,
}

/**
 * Build the system + user prompts for the generative composition DSL.
 *
 * The genome constrains which motifs, chromes, and design axes are available.
 * This is the primary mechanism for structural diversity — two identical
 * prompts with different session IDs get different genomes → different sites.
 */
export function buildCompositionPrompt(
  userPrompt: string,
  opts: {
    locale?: string
    brand?: string
    genome?: StructuralGenome
  } = {},
): CompositionPromptResult {
  const locale = opts.locale ?? 'en'
  const genome = opts.genome

  // If no genome is provided (e.g. tests), use all motifs and all chromes.
  const availableMotifs =
    genome?.availableMotifs ?? Object.keys(MOTIF_SIGNATURES)
  const chromes = genome?.chromes ?? [
    'hairline',
    'brutalist',
    'terminal',
    'editorial',
    'gradient',
    'none',
  ]
  const designAxes = genome?.design
  const rhythm = genome?.rhythm ?? 'alternating'
  const sectionCount = genome?.sectionCount ?? 7
  const pageCount = genome?.pageCount ?? 4

  const motifList = buildMotifList(availableMotifs)
  const rhythmGuide = RHYTHM_GUIDES[rhythm] ?? RHYTHM_GUIDES.alternating

  const genomeBlock = genome
    ? `YOUR STRUCTURAL GENOME (DEFAULTS — user preferences override):
@design radius:${designAxes!.radius} shadow:${designAxes!.shadow} gradient:${designAxes!.gradient} density:${designAxes!.density} typography:${designAxes!.typography}
@chromes ${chromes.join(', ')}
@availableMotifs ${availableMotifs.join(', ')}
@rhythm ${rhythm}
@sectionCount ${sectionCount}
@pageCount ${pageCount}
@navbarVariant ${genome.navbarVariant}
Default hero: ${genome!.hero}

PRIORITY RULE: user preferences always override genome defaults. If the user says "dark mode" or "sharp corners", use those — the genome is just a starting point.

DESIGN AXIS OVERRIDE GUIDE:
- "sharp corners" / "square buttons" → radius:sharp
- "soft" / "rounded" → radius:rounded
- "minimal" / "flat" → shadow:none, gradient:none
- "brutalist" → radius:sharp, shadow:brutalist, typography:display
- "retro" / "vintage" → typography:editorial, gradient:subtle
- "tech" / "modern" → typography:technical, radius:sharp
- "split hero" / "two-column hero" → hero:SplitHero
- "centered hero" → hero:CenteredHero
- "poster" / "full-bleed" → hero:PosterHero

RHYTHM: ${rhythm.toUpperCase()} — ${rhythmGuide}

Target: ~${sectionCount} content sections across ~${pageCount} pages. This is a target, not a hard requirement — follow the user if they imply more or fewer.

PER-PAGE CONTENT RULES:
- Each page gets UNIQUE sections with page-specific content.
- Do NOT reuse sections from the home page on sub-pages.
- Navbar first, Footer last on every page.
- Assign chromes to 3-5 key sections. Vary them.
- Vary section heights and rhythms. Don't stack 3 grids in a row.`
    : `@design: emit Tailwind classes directly (rounded-xl, shadow-lg, tracking-wide, font-black, uppercase, border-2, grayscale, etc.) plus named concepts for things Tailwind doesn't cover:
  density: compact | balanced | airy
  typography: editorial | technical | display | humanist
  gradient: none | subtle | vibrant | mesh
  motion: none | subtle | lively
  chrome: hairline | brutalist | terminal | editorial | gradient | none
  decor: dot-grid | graph-paper | glow | none
  Per-role: btn:rounded-full card:rounded-2xl

Pick 4-8 sections that fit the content. Don't use every motif. Don't repeat motifs unless clearly needed.
Vary section types for visual rhythm — don't stack 3 grids in a row.`

  const system = `You are a website design agent. Compose websites from structural motifs. Write rich, specific, on-brand content — never generic.

<reasoning>...</reasoning> first: business type, brand, pages, motifs, content. Then DSL only.

DSL:
@design rounded-xl shadow-lg gradient:vibrant density:airy typography:display
@brand BrandName
@title Brand — Tagline
@pages home about pricing contact
@nav home:Home about:About pricing:Plans contact:Contact

@section Navbar
  brand BrandName
  links>Home, About, Pricing, Contact
  variant>split

@section SplitHero
  heading Welcome to BrandName
  subheading Your tagline here
  primaryCta Get Started
  imageAlt Modern office with natural lighting
  chrome>gradient

@section Footer
  brand BrandName
  columns>Pages~Home, About, Pricing, Contact^Company~Our Story, Careers, Press
  social>Twitter, Instagram, Facebook

@page about
@section PersonGrid
  heading Our Team
  people>Jane Doe~CEO~Built 3 startups~Portrait of confident woman in blazer~jane.jpg^John Smith~CTO~10 years in tech~Portrait of man at desk~john.jpg

MULTI-PAGE OUTPUT:
- Home sections first (NO @page home). Then @page id + that page's sections.
- Each page: Navbar first, Footer last.
- Use @page directive to start each sub-page's sections.

RULES:
- @design: Tailwind classes + named concepts (density, typography, gradient, motion, chrome, decor). Per-role: btn:rounded-full card:rounded-2xl.
- Home sections first (NO @page home). Then @page id + that page's sections. Each page: Navbar first, Footer last.
- Separators: | sibling groups, > group→content, ^ items, ~ fields, string[] values
- string[] uses commas: links>Home, About, Contact. NOT ~.
- [hl]word[/hl] to highlight in headings.
- @svelte ONLY for custom interactive components no motif covers (games, calculators). NOT for nav/layout.
- Hero first: SplitHero, CenteredHero, or PosterHero. ComingSoonHero = countdown+email, ONLY for waitlist/pre-launch.
- No repeated motifs across pages (except CtaBand/NewsletterCta as closing CTAs). Each page gets unique content sections.
- Chromes on 3-5 key sections, vary them: hairline, brutalist, terminal, editorial, gradient, none.
- Variants: SplitHero(split|full-bleed|gradient), MediaSplit(split|story), CtaBand(primary|muted|card), CardGrid(standard|collapsed-border|asymmetric).
- Content: real names, prices, locations. 4-8 grid items, 3-5 testimonials, 3-6 tiers.
- imageAlt = descriptive English (stock photo query), NEVER file paths.
- BentoGrid span: wide|tall|normal.
- testimonials: first field is QUOTE, then author, then role.

EXAMPLES:
cards>Fast Deploys~Deploy in seconds~Dashboard~dashboard.jpg^Zero Downtime~No interruptions~Server~server.jpg
tiers>Starter~$0~1 project, community support~Sign up~false^Pro~$29~10 projects, priority support~Start trial~true
testimonials>This product changed our workflow~Sarah Chen~CEO^Best investment ever~John Smith~CTO

${genomeBlock}

AVAILABLE MOTIFS (${availableMotifs.length}):
${motifList}

PAGE GUIDE: Home=hero+3-5 content. About=PersonGrid/Timeline. Portfolio=ProjectGallery/ImageGallery. Blog=ArticlePreview/BlogPost. Menu=GroupedList/SimpleList. Products=ProductGrid/ProductDetail. Pricing=PricingTable. Contact=ContactForm+MapBlock. FAQ=FaqAccordion.

Respond in ${locale}. imageAlt always English.`

  const user = `Build a website for: ${userPrompt}

DESIGN PREFERENCE EXTRACTION: Extract any design preferences from the prompt and override the corresponding genome default. Then generate the COMPLETE site: @design, @brand, @title, @pages, @nav, then all @section blocks for every page. Do not stop after @design.`

  return { system, user }
}
