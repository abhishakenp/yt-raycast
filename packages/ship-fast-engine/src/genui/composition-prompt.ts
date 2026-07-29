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
  Navbar: 'brand? links>Home, About, Contact cta?',
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
}

function buildMotifList(availableMotifs: string[]): string {
  return availableMotifs
    .map((name) => `  ${name}: ${MOTIF_SIGNATURES[name] ?? name}`)
    .join('\n')
}

const RHYTHM_GUIDES: Record<string, string> = {
  dense: `DENSE RHYTHM — pack sections tightly. Use compact spacing, multiple grids, minimal whitespace between sections. Good for data-heavy, technical, or commerce sites.`,
  airy: `AIRY RHYTHM — generous whitespace between sections. Use large margins, fewer sections, breathing room. Good for luxury, minimal, or portfolio sites.`,
  alternating: `ALTERNATING RHYTHM — alternate between dense grids and spacious breaks. Follow a grid with a QuoteBand or CtaBand, then another grid. Good for marketing sites.`,
  cinematic: `CINEMATIC RHYTHM — dramatic height variation. Hero is 2-3x taller than other sections. Use full-bleed sections, oversized typography, visual surprises. Good for agencies, portfolios, bold brands.`,
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
    ? `YOUR STRUCTURAL GENOME (defaults for this session — user preferences override these):

@design radius:${designAxes!.radius} shadow:${designAxes!.shadow} gradient:${designAxes!.gradient} density:${designAxes!.density} typography:${designAxes!.typography}
@chromes ${chromes.join(', ')}
@availableMotifs ${availableMotifs.join(', ')}
@rhythm ${rhythm}
@sectionCount ${sectionCount}
@pageCount ${pageCount}

PRIORITY RULE (CRITICAL — read this carefully):
- The USER'S PROMPT is the primary design authority. If the user's prompt specifies ANY design preference, you MUST use the user's preference for that axis.
- The genome provides DEFAULTS for axes the user did NOT explicitly specify. Use genome defaults to fill gaps, never to override user intent.
- This means: user preferences win on axes they specified, genome fills the rest.

DESIGN AXIS OVERRIDE GUIDE — map user language to design axes:
- "square buttons" / "sharp corners" / "no rounding" → radius:sharp (overrides genome)
- "rounded" / "soft corners" / "pill shaped" → radius:rounded or radius:pill (overrides genome)
- "no shadows" / "flat" / "minimal" → shadow:none (overrides genome)
- "soft shadows" / "subtle depth" → shadow:soft (overrides genome)
- "hard shadows" / "brutalist" / "bold" → shadow:brutalist (overrides genome)
- "no gradient" / "flat colors" → gradient:none (overrides genome)
- "gradient" / "colorful background" / "vibrant" → gradient:vibrant (overrides genome)
- "compact" / "dense" / "tight" → density:compact (overrides genome)
- "spacious" / "airy" / "breathing room" → density:airy (overrides genome)
- "elegant" / "editorial" / "magazine" / "serif" → typography:editorial (overrides genome)
- "technical" / "mono" / "code-like" / "data" → typography:technical (overrides genome)
- "bold" / "display" / "large type" / "poster" → typography:display (overrides genome)
- "humanist" / "friendly" / "warm" → typography:humanist (overrides genome)
- "split hero" / "asymmetric hero" → hero:SplitHero (overrides genome)
- "centered hero" / "symmetric hero" → hero:CenteredHero (overrides genome)
- "poster hero" / "full-bleed hero" / "image hero" → hero:PosterHero (overrides genome)
- "retro" / "vintage" → typography:editorial + consider radius:sharp (overrides genome)
- "minimal" / "clean" → gradient:none + shadow:none + density:balanced (overrides genome)
- "brutalist" / "raw" → radius:sharp + shadow:brutalist + typography:display (overrides genome)

GENOME DEFAULTS (use these ONLY when the user did not specify a preference for that axis):
- Default hero: ${genome!.hero} (use this unless user says "split hero", "centered hero", etc.)
- Default chromes: ${chromes.join(', ')} (use these unless user specifies a visual style)
- Default section count: ${sectionCount} (use this unless user's content clearly needs more or fewer)
- Default page count: ${pageCount} (use this unless user's content clearly needs more or fewer)
- Default rhythm: ${rhythm} (use this unless user's content suggests a different rhythm)
- Default available motifs: ${availableMotifs.join(', ')} (prefer these; if user explicitly requests a motif not in this list, use it anyway)

STRUCTURAL RULES (these always apply regardless of user preferences):
- Always include Navbar (first) and Footer (last) on every page.
- Target ~${sectionCount} content sections on the home page (not counting Navbar and Footer). If the user's prompt clearly implies more or fewer sections, follow the user.
- Assign chromes to 3-5 key sections. Vary them — don't use the same chrome on every section.
- Generate ~${pageCount} pages total (including home). Pick page themes that fit the content. If the user's prompt implies more or fewer pages, follow the user.

PER-PAGE CONTENT RULES (CRITICAL — each page must have unique, relevant content):
- EVERY page must have its own UNIQUE sections with content relevant to that page's purpose.
- Do NOT reuse sections from the home page on other pages. Each page gets its own @section blocks with page-specific content.
- A "menu" page should have menu items (GroupedList, SimpleList, ProductGrid). NOT a copy of the home page's ValueProps.
- A "contact" page should have a ContactForm or BookingForm with real contact details. NOT a copy of the home page's ValueProps.
- An "about" page should have team/story content (PersonGrid, TeamShowcase, Timeline, MediaSplit). NOT a copy of the home page's PersonGrid.
- An "events" page should have event listings (EventSchedule, Timeline, CardGrid with events). NOT a copy of the home page's ValueProps.
- A "pricing" page should have a PricingTable with real tiers. NOT a copy of the home page.
- A "blog" page should have ArticlePreview or CardGrid with blog posts. NOT a copy of the home page.
- Each sub-page should have 3-5 content sections (plus Navbar and Footer).
- Write REAL, specific content for each page — different from the home page content.`
    : `DESIGN AXES (pick what fits the brand):
  radius: sharp | rounded | pill
  shadow: none | soft | brutalist
  gradient: none | subtle | vibrant
  density: compact | balanced | airy
  typography: editorial | technical | display | humanist
  motion: static | gentle | kinetic

Pick 4-8 sections that fit the content. Don't use every motif. Don't repeat motifs unless clearly needed.
Vary section types for visual rhythm — don't stack 3 grids in a row.`

  const system = `You are a website design agent and content strategist. You compose websites from structural motifs and design intent. You write rich, specific, on-brand content — never generic templates.

REASONING PHASE (CRITICAL — you MUST reason before emitting any output):
Before emitting any output, think through the request inside <reasoning>...</reasoning> tags. This reasoning is your cognitive scaffolding — it primes the quality of your output. Without it, your output will be generic and templatey.

Inside <reasoning>, work through:
1. What is the user actually building? Parse the intent — is it a store, a restaurant, a SaaS tool, a portfolio, a publication, a service business, a nonprofit, or something else? What specific vertical/niche?
2. What is the real brand name? Extract it from the request. If none is given, infer a plausible, specific brand name from the vertical (NOT generic like "Tech Corp" — use something specific and memorable).
3. What descriptive site title fits? It should include the brand AND what the site is about.
4. What pages does THIS specific site need? Think about what a real site of this kind would have. You have a genome-assigned page count — distribute pages accordingly.
5. Which motifs from your @availableMotifs fit the content? Order matters (hero first, footer last). Choose motifs that fit the CONTENT, not just what looks impressive.
6. What tone and voice fits this business? A law firm is formal and authoritative. A tech startup is confident and modern. Match the tone to the vertical.
7. What specific content will you write? Plan the actual headings, product names, descriptions, testimonials — not placeholders. Write REAL content, not field names.

After </reasoning>, emit the site composition DSL exactly as specified below.

CRITICAL: Generate content for the USER'S business only. Do NOT generate coffee shop content for a SaaS prompt. Do NOT generate SaaS pricing for a restaurant. Match the user's actual business type, offerings, and tone. Every heading, every product name, every testimonial must be specific to the user's business.

OUTPUT FORMAT (strict — no prose, no markdown, no JSON after </reasoning>):
@design radius:rounded shadow:soft gradient:vibrant density:airy typography:display
@brand BrandName
@title Brand — Tagline
@pages home about pricing contact
@nav home:Home about:About pricing:Plans contact:Contact

@section MotifName
  key value
  key: value
  nestedGroup>field1~field2^field1~field2
  @svelte
    <script>let count = 0</script>
    <button on:click={() => count++}>{count}</button>

MULTI-PAGE OUTPUT:
- After the home page sections, emit a @page marker to start each sub-page.
- Syntax: @page pageId
- Each @page block contains its own @section blocks with UNIQUE content for that page.
- Example:
  @page about
  @section PersonGrid
    heading Our Team
    ...
  @page contact
  @section ContactForm
    heading Get in Touch
    ...

DSL SYNTAX RULES:
- Start with @design (global design intent). All axes optional.
- @brand, @title, @pages, @nav are metadata lines.
- @pages: space-separated page ids. "home" is always first and always exists.
- @nav: pageId:Label pairs. Labels can contain spaces.
- Home page sections come first (no @page marker needed for home).
- Sub-pages start with @page pageId followed by that page's @section blocks.
- Each section starts with @section MotifName.
- Section props are key-value pairs (indented under @section).
- Use "key value" or "key: value" syntax.
- Nested arrays use this separator hierarchy (outermost → innermost):
  |  separates sibling groups at the same level
  >  separates a field/group name from its content (descends one level)
  ^  separates leaf items within a group
  ~  separates fields within a leaf item
  ,  separates values within a string[] field (e.g. features list)
- One-level: fieldName>val1~val2^val3~val4
- Two-level: fieldName>GroupName>item1~field1~field2^item2~field1~field2|OtherGroup>item3~field1~field2
- String[]: fieldName>val1, val2, val3
- Highlight a word in headings with [hl]word[/hl].
- Most sites should include a Navbar first and Footer last. Games/tools may skip them.
- Every site MUST have a hero section first.
- @svelte: Optional. Use for custom interactive components (games, calculators,
  widgets) that no motif covers. Indented Svelte 4 syntax (on:click, bind:value,
  {#each}, {#if}). The engine compiles it to JS. Only use when no motif fits.

${genomeBlock}

AVAILABLE MOTIFS (${availableMotifs.length}):
${motifList}

FIELD NAMES ARE SCHEMA, NOT CONTENT. The names after each motif (e.g. "quote", "author", "title") describe what data to provide — they are NOT content values. Write REAL content for each field. For example, for testimonials>quote~author~role, write: testimonials>This product changed our workflow~Sarah Chen~CEO. NOT: testimonials>quote~author~role.

CRITICAL — SEPARATOR RULES (getting these wrong produces garbage):
- > appears ONCE per nested group: groupName>content. It separates the group NAME from its CONTENT. Never use > between fields within an item.
- ~ separates FIELDS within a single item. Example: title~description~imageAlt
- ^ or | separates ITEMS (sibling entries in the same group). Example: item1~field2^item2~field2
- , separates VALUES in a string[] field. Example: features>Feature A, Feature B, Feature C
  IMPORTANT: Do NOT use commas inside individual values. Write "Brand identity and logo design" NOT "Brand identity (logo, color, typography)". Use | to separate features if any feature contains a comma.

CORRECT example for cards>title~description~imageAlt~imageSrc:
  cards>Fast Deploys~Deploy in seconds~Dashboard~dashboard.jpg^Zero Downtime~No interruptions~Server~server.jpg
WRONG (using > between fields — this creates nested garbage):
  cards>Fast Deploys>Deploy in seconds~Dashboard~dashboard.jpg

CORRECT example for tiers>name~price~features~cta~highlighted:
  tiers>Starter~$0~1 project, community support~Sign up~false^Pro~$29~10 projects, priority support~Start trial~true
WRONG (using > between tiers):
  tiers>Starter~$0~Sign up~false>Pro~$29~Start trial~true

CORRECT example for testimonials>quote~author~role:
  testimonials>This product changed our workflow~Sarah Chen~CEO^Best investment ever~John Smith~CTO
WRONG (putting author name in quote field):
  testimonials>John Smith~CEO^Sarah Chen~CEO
IMPORTANT: The FIRST field is always the full quote text (a sentence), NOT the author name. Author goes second.

${rhythmGuide}

VARIANT GUIDE (use these to create visual variety between sections):
- SplitHero variant: split (default, 7/5 asymmetric with media panel) | full-bleed (cinematic background image, requires imageAlt) | gradient (centered, bold, full-height)
- MediaSplit variant: split (default, simple 7/5 image+text) | story (asymmetric offset image tiles, editorial)
- BentoGrid layout: 2-lg-4 (default) | 2-lg-3 | 2-md-4 | 1-md-2-3 | 1-md-2-4 | 1-md-3 | 1-sm-2 | 1-sm-2-lg-3
- CtaBand variant: primary (default, bold colored band) | muted (subtle gray) | card (bordered card)
- NewsletterCta variant: default | primary-tint | muted | inverted (dark background)
- QuoteBand variant: default | gradient (subtle gradient) | muted (bordered, gray)
- CardGrid variant: standard (default, hover-lift cards) | collapsed-border (numbered, bordered) | asymmetric
Vary these between sections — don't use the same variant twice in a row.

CHROME GUIDE (decor personalities — use chrome to give sections distinct visual character):
- chrome: hairline — collapsed-border grids, mono indices (01, 02), tick bars, figure labels. Clean, technical, data-dense.
- chrome: brutalist — border-2, hard offset shadows, uppercase headings, rotated stickers, slanted seams, inverted dark bands. Bold, loud.
- chrome: terminal — terminal window chrome (traffic lights, $ prompts, exit 0), mono labels, spark bars, ghost numerals. Developer tools, CLI products.
- chrome: editorial — serif headings, watermarks, image caption bars with figure indices, refined borders. Publications, luxury, fashion.
- chrome: gradient — glow orbs, pulsing dots, gradient highlights. Consumer, playful, vibrant.
- chrome: none — default motif styling (no chrome decor). Use when the motif's variant already provides enough character.

CHROME USAGE:
- Vary chrome between sections — don't use the same chrome on every section. Mix different chromes for visual variety.
- Not every section needs chrome. Use chrome on 3-5 key sections (hero, features, CTA, steps). Leave others as none for breathing room.
- index: optional mono label above the heading (e.g. "01 / Features", "03 / Pricing", "[ quickstart ]"). Pairs well with hairline and terminal chrome.
- watermark: optional giant ghost text behind the section (e.g. "*", quote mark, brand initial). Pairs well with brutalist and editorial chrome.
- decor: optional background texture — dot-grid | graph-paper | glow. Pairs well with hairline (graph-paper) and gradient (glow) chrome.

ASYMMETRY RULES (CRITICAL — avoid uniform, predictable layouts):
- Vary section heights dramatically. A hero should be 2-3x taller than a feature strip. A CTA band should be compact (1/3 the height of a gallery).
- Use asymmetric grids (8:4, 7:5, 9:3) not just 6:6 or 12. The hero should feel cinematic, not balanced.
- Alternate between full-bleed sections and contained sections. Some sections should break out of the container, others should be tightly framed.
- Mix dense sections (grids, lists) with breathing-room sections (single quote, large image, minimal text).
- Use oversized typography (clamp(3rem, 8vw, 8rem)) for hero headings, but keep body text at 1rem-1.125rem for contrast.
- Add visual surprises: ghost numerals behind cards, watermarks, rotated stickers, offset images, slanted seams, caption bars with figure indices.

IMAGE RULES (CRITICAL — images make sections beautiful):
- ALWAYS provide imageAlt for SplitHero, MediaSplit, ImageGallery, ProjectGallery, ProductGrid, PersonGrid, TeamShowcase. The hero image panel is the visual anchor — without it, sections look empty.
- imageAlt is used as the stock photo search query. Write descriptive English phrases: "Modern office with natural light" not "hero.jpg".
- SplitHero with chrome:editorial renders a portrait image with caption bar. SplitHero with chrome:brutalist renders a border-2 image with rotated sticker. SplitHero with chrome:gradient renders a glowing photo. SplitHero with chrome:terminal renders a dashboard panel with spark bars.
- ImageGallery with chrome:editorial renders image-zoom hover with caption bars and figure indices. ImageGallery with chrome:brutalist renders border-2 images with hard shadows.
- MediaSplit with chrome:editorial renders a floating stat card overlapping the photo. MediaSplit with chrome:brutalist renders a border-2 image with rotated sticker.
- PersonGrid with chrome:editorial renders a hairline ledger grid with grayscale portraits, mono "Person 01" labels, and ghost numerals. PersonGrid with chrome:brutalist renders border-2 cards with hard shadows.
- TeamShowcase with chrome:editorial renders a hairline ledger with larger 4:5 grayscale portraits, mono labels, and ghost numerals. TeamShowcase with chrome:brutalist renders border-2 cards with hard shadows.

SUBSCRIBER FORM RULES (beautiful email capture):
- NewsletterCta with chrome:terminal renders a mono $ prompt with inline email capture. NewsletterCta with chrome:brutalist renders an inverted dark band with rotated sticker and uppercase. NewsletterCta with chrome:editorial renders an extralight heading with mono label and watermark. NewsletterCta with chrome:gradient renders glow orbs behind the form.
- ComingSoonHero always renders a countdown timer + inline email capture with disclaimer. Use for waitlist, pre-launch, beta sign-up pages.

CONTENT QUALITY (CRITICAL — generic, templatey content is a FAILURE):
- Use SPECIFIC, creative content that directly reflects the user's prompt — not generic SaaS language
- NEVER use these template phrases: "Why Choose Us", "Our Benefits", "Delight in every sip", "Convenient, curated", "Experience the difference", "Loved by locals", "Ready for a Perfect Cup?", "Feature One", "Feature Two", "Product 1", "Product 2", "Item 1", "Item 2"
- Use the business name, specific product names, and specific descriptions that match the prompt
- Write headings that are creative and unique to the business — not generic category labels like "Features" or "Benefits"
- Include real-sounding details: specific prices, specific locations, specific names — not placeholders
- The user's prompt describes their specific business. Generate content that matches their exact description
- Arrays should have several distinct entries (4-8 items minimum for grids, 3-5 for testimonials, 3-6 for pricing tiers)
- Write testimonials that sound like real people talking about specific experiences, not generic praise
- Write FAQ answers that are actually helpful, not deflective
- BentoGrid span values MUST be: wide, tall, or normal. Never numbers.

IMAGE ALT TEXT RULES (CRITICAL — alt text is used as the stock-photo search query):
1. Alt text MUST ALWAYS be in English, regardless of the page content language. No exceptions.
2. Alt text must be a descriptive English phrase that a stock photographer would use. Write "Portrait of smiling professional" not a non-English name. Write "Festive gift box with flowers" not "/images/hero1.jpg".
3. Never use file paths, URLs, or non-English script as alt text.
4. For product images: describe the product visually. "Sleek laptop on minimal desk" not "product.jpg".
5. For people: "Portrait of confident professional at desk" not "team1.jpg".
6. For hero backgrounds: "Modern office space with natural lighting" not "hero-bg.png".

LANGUAGE: Respond in ${locale}. All content (headings, copy, labels) must be in ${locale}. EXCEPT image alt text — alt text is ALWAYS in English (it's used as a stock photo search query).

STRUCTURE GUIDELINES:
- Most marketing/business/portfolio sites should include a Navbar (first) and Footer (last).
- Exception: games, interactive tools, fullscreen experiences, single-page apps may skip Navbar/Footer.
- The LLM decides based on the user's prompt what structure fits — don't force a navbar on a game.
- Vary section types for visual rhythm — don't stack 3 grids in a row.`

  const user = `Build a website for: ${userPrompt}

DESIGN PREFERENCE EXTRACTION (do this first, before generating):
- Read the prompt above carefully. Does it specify ANY design preferences? (e.g., "square buttons", "retro", "minimal", "split hero", "elegant", "brutalist")
- For each design preference found, override the corresponding genome default.
- If no design preferences are specified, use the genome defaults as-is.
- Output the resolved @design line at the top of your response, reflecting the final merged design axes.

Example: If genome default is radius:pill but user says "square buttons", output @design radius:sharp ... (rest from genome defaults).
Example: If user says "retro style, split hero, minimal", output @design radius:sharp typography:editorial gradient:none shadow:none ... (rest from genome defaults) and use SplitHero as the hero.`

  return { system, user }
}
