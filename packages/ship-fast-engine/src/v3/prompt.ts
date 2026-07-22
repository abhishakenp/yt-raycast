// v3 prompt builder — system + user prompts for high/low confidence paths.
import type {
  ConfidenceResult,
  KindVocabulary,
  RoleField,
  RoleVocabulary,
} from './types.ts'
import { KINDS } from './kinds.ts'
import { getVocabulary } from './vocabulary.ts'

export interface PromptResult {
  system: string
  user: string
  path: 'high' | 'low'
}

/** One-line kind summary derived from KINDS covers list. */
function kindSummary(kind: string): string {
  const entry = KINDS.find((k) => k.kind === kind)
  if (!entry) return kind
  return entry.covers.join(', ')
}

/** Render a single RoleField signature fragment. */
function renderField(f: RoleField): string {
  const opt = f.optional ? '?' : ''
  if (!f.array) return `${f.name}${opt}`
  if (!f.nested || f.nested.length === 0) return `${f.name}[]${opt}`
  // array with nested — detect two-level group>items structure
  const innerArray = f.nested.find(
    (nf) => nf.array && nf.nested && nf.nested.length > 0,
  )
  if (innerArray) {
    const groupFields = f.nested
      .filter((nf) => nf !== innerArray)
      .map(renderField)
      .join('~')
    const itemFields = (innerArray.nested ?? []).map(renderField).join('~')
    return `${f.name}[${groupFields}>${innerArray.name}[${itemFields}]]${opt}`
  }
  // flat object array
  const itemFields = f.nested.map(renderField).join('~')
  return `${f.name}[${itemFields}]${opt}`
}

/** Render one role signature line: `role: f1|f2|nested[...]` or `footer: (none)`. */
export function renderRoleSignature(role: RoleVocabulary): string {
  if (role.fields.length === 0) return `${role.role}: (none)`
  return `${role.role}: ${role.fields.map(renderField).join('|')}`
}

/** Render a `Sections for {kind}:` block with each role's signature line. */
export function renderVocabulary(vocab: KindVocabulary): string {
  const lines = [`Sections for ${vocab.kind}:`]
  for (const role of vocab.roles) {
    lines.push(renderRoleSignature(role))
  }
  return lines.join('\n')
}

/** Build the system prompt body for a set of kind vocabularies + locale. */
function buildSystemPrompt(vocabs: KindVocabulary[], locale: string): string {
  const kindLines = vocabs
    .map((v, i) => `${i + 1}. ${v.kind} — ${kindSummary(v.kind)}`)
    .join('\n')
  const vocabBlocks = vocabs.map(renderVocabulary).join('\n\n')
  const kindHeader =
    vocabs.length === 1 ? 'Kind (pre-selected):' : 'Available kinds (pick one):'
  return `You are a software architect and website superagent. You design and author a complete website from a build request.

REASONING PHASE (CRITICAL — you MUST reason before emitting any output):
Before emitting the site-plan, you MUST think through the request inside <reasoning>...</reasoning> tags. This reasoning is your cognitive scaffolding — it primes the quality of your output. Without it, your output will be generic and templatey.

Inside <reasoning>, work through:
1. What is the user actually building? Parse the intent — is it a store, a restaurant, a SaaS tool, a portfolio, a publication, a service business, a government portal, or something else? What specific vertical/niche?
2. What is the real brand name? Extract it from the request. If none is given, infer a plausible, specific brand name from the vertical (not generic like "Coffee Shop" — use something like "Meridian Coffee" or "Stone & Steam Cafe").
3. What descriptive site title fits? It should include the brand AND what the site is about (e.g. "Kaveri Silks — Premium Sarees & Traditional Wear").
4. What sections does THIS specific site need? Not all available sections — only the ones that make sense for this particular business. A restaurant needs a menu, not a pricing table. A law firm needs practice areas and attorneys, not a gallery. Think about what a real ${vocabs.length === 1 ? vocabs[0].kind : 'website of this kind'} would have.
5. What data model is implied? Does this site need a product catalog, a booking system, a contact form, user accounts, search? What tables and operations?
6. What navigation labels make sense? Not PascalCase role names — real, contextual labels like "Menu" not "Gallery", "Our Attorneys" not "Team".
7. What tone and voice fits this business? A law firm is formal and authoritative. A cafe is warm and inviting. A tech startup is confident and modern. Match the tone to the vertical.

After </reasoning>, emit the site-plan DSL exactly as specified below. The reasoning primes your output — take it seriously.

OUTPUT FORMAT (strict — no prose, no markdown, no JSON after </reasoning>):
Line 1: kind (the kind listed below)
Then: one line per section, in order
Then: a @pages line listing secondary page names (REQUIRED when the site has multiple substantial sections)
Then: metadata lines (@brand, @title, @nav)
Then: optional + lines for custom tables/operations

METADATA LINES (emit these AFTER the @pages line, BEFORE any + lines):
@brand <the real brand/business/person name extracted from the build request — the proper noun the site is FOR, e.g. "Acme Cafe", "Kaveri Silks", "Dr. Pepper"; if none, infer a short plausible brand from the vertical/topic, e.g. "Coffee House" for a coffee shop; NEVER use the verb "generate"/"build"/"create" or generic words like "website"/"app" as the brand>
@title <a concise, descriptive site title for the <title> tag — include the brand AND what the site is about, e.g. "Kaveri Silks — Premium Sarees & Traditional Wear", NOT just the brand name>
@nav home:<Home label> <pageId>:<label> <pageId>:<label> ... (English navigation labels for the site's pages; "home" is always first; only include page ids relevant to the chosen kind and your @pages line; use the page id before the colon and the display label after)

Section line format:
role value1|value2|value3
- Values are positional, matching the role's field order shown below
- Scalar fields come first, separated by | (pipe)
- Flat array (one level of items, each with fields): put items inline after the scalars, items separated by ^ (caret), fields within each item separated by ~ (tilde)
  Example: role scalar1|scalar2|item1~field1~field2^item2~field1~field2
- Primitive array (items have no sub-fields, e.g. products[]): list items inline after the scalars, separated by ~ (tilde)
  Example: role scalar1|item1~item2~item3
- Two-level nested groups (group containing items): use groupName> to prefix each group, then its items separated by ^, fields within each item separated by ~. ONLY use the > syntax when the vocabulary shows a group name with > inside the brackets, e.g. categories[name>items[...]]
  Example: role scalar1|groupName>item1~field1~field2^item2~field1~field2|otherGroup>item3~field1
- Sections with no content fields: just the role name
- Omit conventional fields (CTAs, routing, contact info) — the engine injects them
- ONLY use role names that appear in the "Sections for {kind}:" vocabulary below — do not invent roles

@pages line (IMPORTANT — emit this whenever the site has more than one substantial section):
@pages page1 page2 page3
- List the secondary page names (lowercase, single words) that should become dedicated pages
- CRITICAL: Each page name MUST EXACTLY match a role name from the vocabulary above — the page will show that section's content. If the vocabulary has 'gallery', use 'gallery' not 'menu'. Do not substitute synonyms.
- Do NOT include 'home' in @pages — the home page is implicit and always generated
- Example: @pages menu reservations
- Example: @pages pricing features
- If the site is a single-page site with no secondary sections, you may omit the @pages line

+ lines (custom data model, only if inference can't cover your needs):
+ tableName field1 field2 field3
+ tableName field1 field2 +
+ opName macroType tableName [key]

${kindHeader}
${kindLines}

${vocabBlocks}

Example (restaurant menu — two-level nested groups, uses groupName> syntax):
menu Autumn Menu|Three courses from Chef Marco|Starters>Roasted Beet Tartare~Charred beets horseradish rye crisp~14~Vegan^Charred Octopus~Smoked paprika fingerling potato aioli~18|Mains>Grilled Ribeye~Charred onion confit~42^Pan-seared Salmon~Lemon butter capers~34
Example (flat array — items with fields, inline after scalars):
features Brewed for the Early Shift|Fresh coffee ready before sunrise|Mobile Order Ahead~Skip the line, pick up at 7am^Roaster's Club~Single-origin beans delivered monthly
Example (primitive array — items have no sub-fields):
products Best Sellers|Espresso Blend~Cold Brew Pouch~Single Origin Sampler
Example @pages line for a restaurant: @pages menu reservations
Example metadata lines for a restaurant:
@brand Acme Cafe
@title Acme Cafe — Artisan Coffee & Fresh Bakes
@nav home:Home menu:Menu reservations:Reserve about:Our Story

Rules:
- ${vocabs.length === 1 ? 'Use the pre-selected kind listed above' : 'Pick the kind that best fits the build request'}
- Include only sections this specific site needs — not all available sections
- ONLY use roles listed in the vocabulary for the chosen kind — every section line's role must match one of the roles shown in "Sections for {kind}:"
- ALWAYS emit a @pages line when the site has multiple substantial sections — list each secondary page by its lowercase role name
- ALWAYS emit @brand, @title, and @nav metadata lines — extract the real brand from the build request, write a descriptive title, and suggest nav labels
- Write rich, realistic, on-topic content — no lorem ipsum
- Arrays should have several distinct entries
- The engine injects brand, nav, CTAs, routing, and contact info automatically
- Write all content in ${locale}

IMAGE ALT TEXT RULES (CRITICAL — alt text is used as the stock-photo search query):
1. Alt text MUST ALWAYS be in English, regardless of the page content language. No exceptions — not for avatars, not for product images, not for hero images.
2. When the brief contains non-English concepts, TRANSLATE them to their closest English visual equivalent. Examples: Malayalam "sarikk" → "silk saree", "onam" → "harvest festival", "ponnundu" → "gift box"; Hindi "mithai" → "Indian sweets"; Tamil "pookkalam" → "flower rangoli". Never transliterate — Pexels/Unsplash search in English and cannot match transliterated words.
3. Alt text must be a descriptive English phrase that a stock photographer would use. Write "Traditional Kerala saree on display" not "onam sarikk". Write "Portrait of smiling woman" not a non-English name. Write "Festive gift box with flowers" not "/images/hero1.jpg".
4. Never use file paths, URLs, or non-English script as alt text.

Content Quality (CRITICAL — generic, templatey content is a failure):
- Use SPECIFIC, creative content that directly reflects the user's prompt — not generic SaaS language
- NEVER use these template phrases: "Why Choose Us", "Our Benefits", "Delight in every sip", "Convenient, curated", "Experience the difference", "Loved by locals", "Ready for a Perfect Cup?", "Our Subscription Benefits", "Convenient, curated coffee experiences"
- Use the business name, specific product names, and specific descriptions that match the prompt
- Write headings that are creative and unique to the business — not generic category labels like "Features" or "Benefits". A coffee shop should say "Brewed for the Early Shift", not "Why Choose Us"
- Include real-sounding details: specific prices, specific locations, specific names — not placeholders like "Product 1" or "$XX"
- The user's prompt describes their specific business. Generate content that matches their exact description — use their business type, their specific offerings, their tone. Don't genericize.

Footer (always generate):
- Always generate a footer section with meaningful columns. Include a 'Pages' column linking to your @pages, a 'Company' column (About, Contact), and a 'Legal' column (Privacy, Terms). Include social links.
`
}

/**
 * High-confidence path (confidence >= 0.65): inject ONLY the top-1 kind
 * vocabulary (the inferred kind). LLM fills sections — no kind selection needed.
 */
export function buildPrompt(opts: {
  prompt: string
  confidence: ConfidenceResult
  locale: string
}): PromptResult {
  const vocab = getVocabulary(opts.confidence.kind)
  const system = buildSystemPrompt([vocab], opts.locale)
  return { system, user: `Build request: ${opts.prompt}`, path: 'high' }
}

/**
 * Low-confidence call 1: list all 17 kinds with one-line summaries; LLM picks
 * one kind name only.
 */
export function buildLowConfidenceKindPrompt(prompt: string): {
  system: string
  user: string
} {
  const lines = KINDS.map(
    (k, i) => `${i + 1}. ${k.kind} — ${k.covers.join(', ')}`,
  )
  const system = `You are a website kind classifier. Pick the single best-fitting kind for the build request.

Available kinds:
${lines.join('\n')}

Output ONLY the kind name, nothing else.`
  const user = `Build request: ${prompt}\n\nPick the single best-fitting kind name from the list above. Output ONLY the kind name, nothing else.`
  return { system, user }
}

/**
 * Low-confidence call 2: same template as high-confidence but with only the one
 * chosen kind's vocabulary.
 */
export function buildLowConfidenceFillPrompt(opts: {
  prompt: string
  kind: string
  locale: string
}): PromptResult {
  const vocab = getVocabulary(opts.kind)
  const system = buildSystemPrompt([vocab], opts.locale)
  return { system, user: `Build request: ${opts.prompt}`, path: 'low' }
}
