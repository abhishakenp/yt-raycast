import { getEcommerceGenerationGuidelines, GLOBAL_UI_CRAFT_GUIDELINES } from '../config.js'
import { siteSpecSchema } from '../spec/schema.js'
import { brandProfilePromptBlock } from './brand-profile.js'
import { dnaSectionsBlock, mobbinDoctrineBlock, mobbinSessionBlock } from '../lib/mobbin/prompt-blocks.js'

function mobbinSiteSpecBlock(anchor) {
  if (!anchor?.app) return ''
  const session = mobbinSessionBlock(anchor)
  const accents = anchor.accents?.length ? anchor.accents : anchor.dna?.accents || []
  const accentLine = accents.length
    ? `theme.colors.primary, accent, background, surface MUST be derived from these ${anchor.app} hex tokens: ${accents.join(', ')}. Use them verbatim — never substitute or "round".`
    : `theme palette MUST match the ${anchor.app} register described above.`
  const sectionsBlock = dnaSectionsBlock(anchor.dna, anchor.app)
  const sectionsPart = sectionsBlock
    ? `\n\n── MOBBIN PRO ANCHOR SECTION PATTERN ──\n${sectionsBlock}\n\nForbidden in pages[].sections[] for this anchor: any section type / variant the anchor's composition does NOT use. Examples of forbidden substitutions for this anchor: ${(anchor.dna?.avoid || []).slice(0, 6).join('; ') || '(see "anti-patterns" above)'}.`
    : ''
  return `\n${mobbinDoctrineBlock()}\n${session}\n\n── MOBBIN PRO ANCHOR (site spec) ──\n${accentLine}\nThe spec's typography (theme.typography.heading/body) MUST match the anchor's display + body family register. The pages[] list must include sections that mirror ${anchor.app}'s composition signature.${sectionsPart}\n`
}

export function siteSpecPrompt({
  prompt,
  ctx,
  designBrief,
  fallbackSpec,
  brandProfile = null,
  mode = 'generate',
  hasUserDesignReferences = false,
  mobbinAnchor = null,
}) {
  const ecommerceGuidelines = getEcommerceGenerationGuidelines({ hasUserDesignReferences })
  const actionLine =
    mode === 'edit'
      ? 'Update the canonical site spec so the requested changes are reflected structurally.'
      : 'Generate a canonical site spec that can drive multiple renderers.'
  const brandBlock = brandProfilePromptBlock(brandProfile)

  const editThemeRules =
    mode === 'edit'
      ? `\n- Edit mode — theme safety: Whenever you change theme.colors, mood, or palette, you MUST keep strong readable contrast. Body text must stay clearly visible on both background and surface (avoid near-identical luminance between text and background). Prefer coherent light OR dark schemes; do not produce dark gray text on black backgrounds or other low-contrast combinations.\n- Edit mode — navigation: If the user reports header, nav, or link text being hard to see, set theme.colors.text and theme.colors.mutedText so they contrast clearly with theme.colors.background and theme.colors.surface, and keep the home page’s first section as type navbar with non-empty link labels.\n`
      : ''

  const ecommerceRules =
    ctx?.site_type === 'ecommerce' || ctx?.siteType === 'ecommerce'
      ? `\n- Ecommerce (Luxury DTC): ${ecommerceGuidelines} Set siteType to "ecommerce". Include pages and backendFeatureHints appropriate for a Medusa-backed store (catalog, cart, checkout-related flows per Medusa docs). Encode a premium funnel (collection → PDP → cart → checkout) and make the site spec structurally enforce retail depth and luxury craft.\n` +
        `  - Theme default for luxury storefronts: light canvas (cream or off-white background), near-black text, deep wine or burgundy accent on primary CTAs and rating emphasis unless the user specifies otherwise.\n` +
        `  - Navigation must include shop/collections/categories, search affordance, account, and cart with icon + numeric badge in rendered UIs.\n` +
        `  - Navigation depth: include a Shop dropdown/mega-nav model via navigation.global items with children (New arrivals, Bestsellers, Gift sets, Wallets, Bags, Leather care; plus optional Sale when prompt implies promotions).\n` +
        `  - Homepage must match the editorial canvas pattern: thin dark promo strip; sticky header with centered primary links; split hero (headline, dual CTAs, large product image); horizontal shop-by-collection with image tiles; featured product grid with per-card add-to-cart and star ratings; curated sets (two-up or carousel); materials two-column; three review cards; inverted dark newsletter band; four-column footer.\n` +
        `  - If the user prompt omits layout or visual detail, default to that full editorial luxury DTC canvas in English unless they specify otherwise.\n` +
        `  - Homepage must read as a storefront (not SaaS): populate featured products (6+ items from ecommerce.products when available) and keep photo-forward merchandising.\n` +
        `  - Collections module: desktop may use grid or horizontal rail with image scrims; carousel dots acceptable for curated or collection strips on desktop when multiple slides exist.\n` +
        `  - Collections/category browsing: include at least one dedicated collection/category page (not just a generic shop grid). It should support sorting (optional) and visually consistent product grids.\n` +
        `  - PDP richness: include a product detail page route with gallery, variant selector (size/color), delivery/returns/warranty info near CTA, and cross-sell (related / complete-the-look).\n` +
        `  - Reviews credibility: include testimonials/reviews with reviewer name, product name, verified purchaser flag, and a date; add a rating summary line at section intro.\n` +
        `  - Newsletter form: the submit button label must be non-empty (e.g. "Subscribe"). Include helper text "No spam. Unsubscribe anytime."\n` +
        `  - Cart & checkout: include cart and checkout pages (or a combined flow) with visible progress indicator, order summary with subtotal/shipping/tax/total, and trust badges. Use guest checkout framing. Model add-to-cart, quantity changes, and checkout progression as explicit button actions in interactions or actions arrays, not link-only CTAs.\n` +
        `  - SEO and naming: homepage seo.title must pair the invented brand with a concrete value proposition (roughly six to twelve words), not a bland generic title.\n`
      : ''

  const institutionalRules =
    ctx?.site_type === 'institutional' || ctx?.siteType === 'institutional'
      ? `\n- Institutional / PSU-style: Set siteType to "institutional". Include pages such as Home, Notices, Careers, Contact. Use section types notice-board, document-list, and careers-table on the home page where appropriate; prefer clear dated list items, formal tone, accessible contrast, and navbar links to notices and careers routes. Avoid ecommerce sections unless the prompt asks for a store.\n`
      : ''

  const craftRules = `\n- Visual craft: ${GLOBAL_UI_CRAFT_GUIDELINES} Encode spacing and typographic intent in theme.spacing, theme.typography.scale, and theme.radius; keep sections scannable without clutter.\n`

  // Strong palette + typography discipline. Without this, the LLM frequently
  // returns 5 shades of gray + a jarring border accent, regardless of vibe.
  const themeDisciplineRules = `\n- Palette discipline (MANDATORY): theme.colors.primary, secondary, and accent must be visibly distinct hues (not three near-blacks or three near-whites). At least one of {primary, accent} must be a saturated brand-appropriate hue, not gray or black. Read the prompt's domain and vibe to pick hues:
  - Coffee / cafe / bakery: warm earth tones — espresso brown (#3B2415–#5A2E1A), caramel/latte (#C8966B), cream/oat (#F5EBDD). Primary brown, accent caramel.
  - Wellness / spa / yoga / herbal: sage green, terracotta, dusty rose, warm cream backgrounds.
  - Fitness / gym / sports: high-contrast — black background with neon lime / electric blue / energetic red accent.
  - Jewelry / luxury / cosmetics: champagne gold (#C9A96E), rose gold, ivory, deep burgundy or charcoal text.
  - Fashion / streetwear: bold black/white with one saturated pop (cobalt, oxblood, safety-orange).
  - Tech / SaaS / dashboard: indigo, violet, cyan, or emerald primary on near-black surface.
  - Kids / toys / candy: playful saturated primaries (sunshine yellow, sky blue, candy pink) on cream.
  - Food delivery / restaurant: appetizing warm reds, paprika, mustard, deep green.
  - Real estate / construction: navy, gold accent, ivory background, cream surface.
  - Outdoors / travel: forest green, ochre, sky blue, sand.
- theme.colors.border MUST be a low-saturation neutral derived from text or background (e.g. ~10% opacity of text on background, OR a desaturated near-neighbor of background). NEVER set border to a saturated brand color like bright orange, red, or yellow — borders frame, they don't shout.
- text vs background contrast: WCAG AA at minimum. Don't pair near-black text with dark gray backgrounds or near-white text with cream backgrounds. Pick a coherent light OR dark scheme — not both at once.
- Typography (MANDATORY): match the vibe, don't default to Inter for everything.
  - Luxury / editorial / cafe / boutique: heading uses a serif (Playfair Display, Cormorant Garamond, DM Serif Display, Fraunces); body remains a clean sans (Inter, Manrope) for readability.
  - Streetwear / sports / nightlife: heading uses a condensed or display sans (Bebas Neue, Anton, Archivo Black); body Inter or Space Grotesk.
  - SaaS / tech / dashboard: heading and body both clean modern sans (Inter, Manrope, Space Grotesk, Geist).
  - Handcraft / artisan / wellness: heading a humanist serif or warm sans (Cormorant, Fraunces, Lora, DM Sans).
  - Only use Inter for both heading and body when the prompt is generic SaaS/dashboard with no vibe signal.
`

  const mobbinBlock = mobbinSiteSpecBlock(mobbinAnchor)

  return {
    system:
      'You are a product architect who outputs only valid JSON. No markdown. No explanation. Keep the result strongly structured and renderer-friendly.' +
      mobbinBlock,
    user:
      `${actionLine}\n\n` +
      `User prompt:\n${prompt}\n\n` +
      `Existing project context:\n${JSON.stringify(ctx, null, 2)}\n\n` +
      `Design brief:\n${designBrief}\n\n` +
      `${brandBlock ? `${brandBlock}\n` : ''}` +
      `${institutionalRules}` +
      `Required section types (use only when relevant):\n${siteSpecSchema.supportedSectionTypes.join(', ')}\n\n` +
      `Required export targets:\n${siteSpecSchema.supportedExportTargets.join(', ')}\n\n` +
      `Use this fallback structure as a shape reference and minimum completeness baseline:\n${JSON.stringify(fallbackSpec, null, 2)}\n\n` +
      `Output a single valid JSON object that matches this project-level schema:\n` +
      `{\n` +
      `  "projectName": "string",\n` +
      `  "slug": "string",\n` +
      `  "siteType": "string",\n` +
      `  "userPrompt": "string",\n` +
      `  "generatedTimestamp": "ISO string",\n` +
      `  "exportableFrameworks": ["html", "react", "nextjs"],\n` +
      `  "version": "${siteSpecSchema.version}",\n` +
      `  "theme": {\n` +
      `    "colors": { "primary": "", "secondary": "", "accent": "", "background": "", "surface": "", "text": "", "mutedText": "", "border": "" },\n` +
      `    "typography": { "heading": "", "body": "", "mono": "", "scale": { "hero": "", "h1": "", "h2": "", "h3": "", "body": "", "small": "" } },\n` +
      `    "radius": { "sm": "", "md": "", "lg": "" },\n` +
      `    "spacing": { "sectionY": "", "container": "", "gap": "" },\n` +
      `    "shadows": { "soft": "", "card": "" },\n` +
      `    "appearance": { "darkMode": true, "lightMode": false },\n` +
      `    "mood": "string",\n` +
      `    "tailwind": { "primary": "", "secondary": "", "accent": "" }\n` +
      `  },\n` +
      `  "navigation": { "global": [], "footer": [], "ctas": [] },\n` +
      `  "pages": [\n` +
      `    {\n` +
      `      "id": "string",\n` +
      `      "name": "string",\n` +
      `      "route": "/string",\n` +
      `      "title": "string",\n` +
      `      "description": "string",\n` +
      `      "seo": { "title": "string", "description": "string", "keywords": ["string"], "canonicalPath": "/string", "canonicalUrl": "", "ogImage": "", "ogImageAlt": "", "noIndex": false },\n` +
      `      "aeo": { "objective": "string", "targetIntent": "string", "suggestedQueries": ["string"], "entitySignals": { "brandName": "string", "category": "string", "audience": "string", "useCases": ["string"], "benefits": ["string"], "differentiators": ["string"], "contact": { "email": "", "phone": "", "location": "" } } },\n` +
      `      "breadcrumbs": [{ "label": "string", "href": "/string" }],\n` +
      `      "layoutType": "marketing|app-shell|editorial",\n` +
      `      "sections": [\n` +
      `        {\n` +
      `          "id": "string",\n` +
      `          "type": "one of the supported section types",\n` +
      `          "variant": "string",\n` +
      `          "headline": "string",\n` +
      `          "subheadline": "string",\n` +
      `          "body": "string",\n` +
      `          "items": [],\n` +
      `          "actions": [],\n` +
      `          "fields": [],\n` +
      `          "links": [],\n` +
      `          "interactions": [],\n` +
      `          "styling": {},\n` +
      `          "visibility": {},\n` +
      `          "form": { "successMessage": "", "errorMessage": "", "action": { "type": "", "target": "" } },\n` +
      `          "children": []\n` +
      `        }\n` +
      `      ]\n` +
      `    }\n` +
      `  ],\n` +
      `  "components": [],\n` +
      `  "interactions": [],\n` +
      `  "forms": [],\n` +
      `  "assets": [],\n` +
      `  "seo": { "title": "", "description": "", "siteName": "", "siteUrl": "", "keywords": ["string"], "ogImage": "", "ogImageAlt": "", "twitterCard": "summary_large_image", "locale": "en_US", "robots": "index, follow" },\n` +
      `  "backendFeatureHints": []\n` +
      `}\n\n` +
      `Rules:\n` +
      `- When siteType is ecommerce or the user asks for a carousel/slider/gallery/marquee, expect Swiper-powered product strips in framework exports and matching Swiper markup in static HTML (policy-driven).\n` +
      `- The output must be directly renderable into HTML, React, and Next.js.\n` +
      `- Prefer structured content and interaction descriptors over raw scripts.\n` +
      `- Include enough pages and sections to satisfy the prompt.\n` +
      `- Do not omit required project metadata.\n` +
      `- If the prompt mentions a production domain, preserve it in seo.siteUrl and page canonicals.\n` +
      `- Programmatic SEO: use clean subfolder routes only for indexable pages (no query-string permutations); each indexable page needs a distinct title and description; link hub pages to spokes via navigation or footer.\n` +
      `- Keep page seo.noIndex false for public pages unless the user explicitly asks for private routes.\n` +
      `- For public marketing sites, prefer Home plus 2-4 meaningful secondary pages unless the user explicitly requests a single-page site.\n` +
      `- Secondary pages should be internally linkable through navigation, footer links, or CTAs.\n` +
      `- Homepage copy should support SEO with a clear product headline, descriptive supporting copy, and at least one FAQ section when relevant.\n` +
      `- AEO structure (MANDATORY for public marketing/home pages): include a direct-answer section immediately after hero/nav with a concise first-paragraph answer to "what is this?" and who it serves; avoid generic headings like "Welcome".\n` +
      `- Populate page.aeo on every indexable page with objective, targetIntent, suggestedQueries (3-6 natural-language queries), and entitySignals (brandName, category, audience, useCases, benefits, differentiators, contact when known).\n` +
      `- Use intent-shaped section headings and include use-cases, how-it-works, comparison, or who-for sections when they help answer buyer questions for the site kind.\n` +
      `- Software/SaaS sites should read as a product with clear benefits and differentiators; ecommerce product pages should support Product schema with concrete product copy.\n` +
      `- Use clean title patterns: homepage as "Project Name | Core benefit" and secondary pages as "Topic | Project Name" or "Project Name Topic | Benefit". Avoid keyword stuffing.\n` +
      `- When you include FAQ content, write realistic buyer or user questions rather than placeholder copy (5-8 items on home or dedicated /faq when relevant).\n` +
      `- When verified brand details are provided, use them for logo/contact/footer/social sections and keep those fields exact.\n` +
      `- Do not invent physical addresses or phone numbers in contact/footer; omit them if not in the prompt or brand block.\n` +
      `- Do not put generator/tool branding strings in any page content.\n` +
      `- Use the fallback structure when uncertain rather than inventing a malformed schema.${craftRules}${themeDisciplineRules}${ecommerceRules}${editThemeRules}`,
    temperature: 0.2,
    // Bumped from 4000: with themeDiscipline + ecommerce rules, the model
    // emits richer spec JSON and was hitting the cap mid-output, producing
    // truncated invalid JSON and forcing the pipeline to fall back to the
    // boilerplate site-spec (the "Built for high-output teams" effect).
    maxTokens: 8000,
  }
}
