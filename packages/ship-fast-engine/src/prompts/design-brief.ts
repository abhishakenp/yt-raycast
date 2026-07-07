import {
  GROQ_MODEL,
  getEcommerceGenerationGuidelines,
  GLOBAL_UI_CRAFT_GUIDELINES,
  MOTION_DEV_DOCS_REACT,
} from '../config'
import { inferSiteTypeHint } from '../lib/infer-site-type'
import {
  mobbinDoctrineBlock,
  mobbinSessionBlock,
} from '../lib/mobbin/prompt-blocks'
import type { MobbinAnchor } from '../lib/mobbin/types'

function mobbinAnchorAppendix(anchor: MobbinAnchor | null): {
  systemAppend: string
  userAppend: string
} {
  if (!anchor?.app) return { systemAppend: '', userAppend: '' }
  const session = mobbinSessionBlock(anchor)
  const doctrine = mobbinDoctrineBlock()
  const accents = anchor.accents?.length
    ? anchor.accents
    : anchor.dna?.accents || []
  const accentLine = accents.length
    ? `Required palette base — the design.md palette MUST inherit from ${anchor.app}'s sampled hex values: ${accents.join(', ')}. Use these as the literal hex tokens in your tailwind.config (background / surface / primary / accent slots). DO NOT substitute or "round" them.`
    : ''
  return {
    systemAppend: `\n\n${doctrine}\n${session}`,
    userAppend: accentLine
      ? `\n\n── MOBBIN PRO ANCHOR PALETTE LOCK ──\n${accentLine}\nThe design system you output must be unmistakably ${anchor.app}-family at thumbnail glance.`
      : `\n\n── MOBBIN PRO ANCHOR ──\nThe design system you output should be unmistakably ${anchor.app}-family at thumbnail glance.`,
  }
}

export function designBriefPrompt(
  prompt: string,
  _indiaMode: string | null = null,
  siteType: string | null = null,
  hasUserDesignReferences = false,
  mobbinAnchor: MobbinAnchor | null = null,
): {
  system: string
  user: string
  model: string
  temperature: number
  maxTokens: number
} {
  const effectiveSiteType = siteType || inferSiteTypeHint(prompt)
  const ecommerceGuidelines = getEcommerceGenerationGuidelines({
    hasUserDesignReferences,
  })
  const { systemAppend, userAppend } = mobbinAnchorAppendix(mobbinAnchor)
  return {
    system: `You are an award-caliber product designer. You ship design systems that look unmistakably crafted — bold type, memorable color, and layout tension — never generic purple-gradient SaaS slop. Typography-first dark UIs. ${GLOBAL_UI_CRAFT_GUIDELINES} Output ONLY markdown. No preamble.${systemAppend}`,
    user: `Create a design system for this project:
${prompt}

Output a concise design.md with these sections:

### Colors
Choose a color palette that fits the project's personality and mood. Provide:
- Background: a very dark shade (the darkest in your chosen palette)
- Surface/cards: slightly lighter than background
- Borders: subtle, between surface and background
- Text: bright for headlines, muted for body, more muted for footer/secondary
- Accent: ONE vibrant, saturated color that fits the project's mood and domain. Be creative \u2014 don't always pick violet or indigo. Consider the project's industry, audience, and energy.
- Accent gradient for CTAs: a gradient using two close shades of the accent
- Provide Tailwind class names AND hex values for each color.

### Typography
- Pick a distinctive heading font (display or editorial: e.g. Fraunces, Syne, Outfit, Cabinet Grotesk, Playfair, DM Serif) plus a readable body font — avoid Inter-only for both. Must be on Google Fonts.
- Google Fonts import URL with required weights (at least 400, 500, 600, 700, 800)
- Size scale: hero (very large, extrabold, dramatic tracking), section headline (large, extrabold), section label (tiny, uppercase, tracking-widest, accent color), body (medium), small

### Tailwind Config
Valid JSON for tailwind.config.theme.extend with semantic color names (primary, accent, background, surface, border) mapped to the hex values above. Include font family if not Inter.

### Component Patterns
Using YOUR chosen colors (not hardcoded grays), define Tailwind classes for:
- Nav: dark bg, subtle bottom border. Logo left, links + button right. Simple, not sticky.
- Pill badge: dark bg, subtle border, rounded-full, small text
- Cards: surface bg, subtle border, rounded-xl, p-6. Hover: slightly lighter border, transition
- Featured card: gradient bg using accent at low opacity, accent-tinted border
- Buttons primary: accent gradient, white text, rounded-full, px-8 py-3, hover transition
- Buttons secondary: outline with subtle border, rounded-full, hover: slightly lighter bg
- CTA link: accent color, hover: lighter accent, text-sm, with \u2192 arrow
- Footer: dark bg, subtle top border, centered
${
  effectiveSiteType === 'ecommerce'
    ? `- ${ecommerceGuidelines}
- Product card: surface bg, rounded-xl, overflow-hidden. Image top (aspect-ratio: 4/3, object-cover), hover: scale-105 transition. Title bold, price accent-colored font-semibold, "Add to Cart" button primary small
- Category card: relative, rounded-xl, overflow-hidden. Background image with dark overlay gradient, title white text-lg font-bold centered
- Price tag: font-semibold, text-lg for main price. Strike-through for original price if on sale
- Cart badge: absolute top-right on cart icon, accent bg, white text, rounded-full, text-xs min-w-5
- Trust badge row: flex gap-8 justify-center, each badge: icon + text, muted color, text-sm
- Promo banner: accent gradient bg, white text, py-4, text-center, uppercase tracking-wide`
    : ''
}

${
  effectiveSiteType === 'ecommerce'
    ? `### Sections (homepage order) — DTC retail depth (${hasUserDesignReferences ? 'user reference URLs in the prompt override exemplar aesthetics for layout and mood; ' : ''}patterns-only guidance is in the ecommerce block above)
1. Top promo strip (shipping threshold, subscribe-and-save, or limited offer)
2. Nav: logo, search field or icon, Account, Cart with count; Shop mega-paths (categories, bestsellers, bundles, by benefit); Learn/Blog/Help as needed
3. Hero: dominant headline + supporting line + primary Shop CTA; optional three benefit chips; lifestyle or product imagery
4. Shop by category: minimum four large tiles — image, title, one-line benefit, Shop link each
5. Featured products: minimum six cards in a responsive grid — image, small category label, title, review count or stars, price (strikethrough compare-at if on sale), Add to cart; section title + Shop all link row
6. Bundles or subscription band (save %, flexible delivery copy, CTA)
7. Learn / editorial: three cards (guides, FAQs, success themes) with Read more
8. Social proof: stat row and/or success stories (headline + pull quotes + names)
9. Customer reviews: aggregate rating line + several quote cards with initials or avatars
10. Newsletter: headline + email field + submit; optional social row
11. Footer: four or five columns (Shop, Learn, Resources, About, Partner) + bottom legal strip`
    : `### Sections (homepage order)
1. Nav
2. Hero (pill badge + massive headline + subtitle + 1 CTA button \u2014 NO images)
3. Features (section label + headline + 2x2 card grid with SVG icon + title + desc)
4. Pricing (section label + headline + 2-col cards, featured has "Popular" badge)
5. Highlight/custom section (section label + headline + gradient featured card with icon)
6. Logo cloud (headline + company names as plain text, muted color \u2014 NO images)
7. Final CTA (bold headline + subtitle + 2 buttons)
8. Footer (centered: logo + links row + copyright)`
}

### Key Principles
- Apply the UI craft line in your system instructions to spacing rhythm, typographic hierarchy, accent restraint, and interactive states across every pattern below.
${
  effectiveSiteType === 'ecommerce'
    ? `- Minimum viable homepage is long-form retail: at least ten distinct sections below the nav (see section list). A short page reads as failed output.
- Product-first: hero with lifestyle or product imagery; category and product blocks must feel photo-led like major retail sites, not icon-led SaaS.
- Product cards: consistent aspect ratio (4:3 or 1:1), hover zoom, review line, clear price + compare-at when on sale, prominent Add to Cart
- Price styling: font-semibold or bold, currency symbol first
- Cart icon in nav with numeric badge; search visible in header
- Footer: multi-column link groups, not a single centered row
- Growth design: state one primary success metric for this storefront (e.g. conversion rate, cart abandonment, AOV, or page-load perception) and one hypothesis for the hero CTA; repeat for checkout (e.g. guest-first clarity vs. account upsell) — design choices should map to those KPIs in prose, not analytics code`
    : `- Typography-first: NO hero images, NO screenshots, NO floating mockups`
}
- Layout: default centered max-w-4xl, but allow ONE section to break the grid (asymmetric split, bento, or full-bleed band) if it increases wow factor
- 2-column grids by default; bento-style unequal cells allowed for features when it improves hierarchy
- Generous spacing: py-20 md:py-28 per section; use whitespace as a luxury
- Anti-slop: do NOT default to violet/indigo accent + gray-950 without reason — anchor accent in the project domain and mood
- Signature: specify one motion or depth token (e.g. card hover lift, gradient mesh hero bg, blur glass panel)
${effectiveSiteType !== 'game' ? `- Next.js/React exports: plan Framer Motion (\`framer-motion\`, ${MOTION_DEV_DOCS_REACT}) for interactive motion — not purely static UI; respect reduced-motion preferences.\n` : ''}- If images are truly needed (ecommerce/portfolio), use relevant verified provider photos first. If no close match exists, avoid random stock-photo fallbacks and use gradients, patterns, icons, or typography-driven panels instead

Max 70 lines. Output ONLY markdown.${userAppend}`,
    model: GROQ_MODEL,
    temperature: 0.4,
    maxTokens: 3000,
  }
}
