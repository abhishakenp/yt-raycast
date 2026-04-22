import {
  GROQ_MODEL,
  getEcommerceGenerationGuidelines,
  GLOBAL_UI_CRAFT_GUIDELINES,
  HOMEPAGE_MODEL,
  INDIAN_DESIGN_TOKENS,
  MOTION_DEV_DOCS_REACT,
} from '../config.js'
import { isMixedEnglishIndicCode } from '../config/languages.js'
import { inferSiteTypeHint } from '../lib/infer-site-type.js'
import { businessProfilePromptBlock } from './business-profile.js'
import { designRefSystemAppendix } from './design-refs.js'

function languageDesignAppendix(indiaMode) {
  if (!indiaMode || indiaMode.code === 'en') return ''

  if (indiaMode.isIndian) {
    const { language } = indiaMode
    const colors = INDIAN_DESIGN_TOKENS.colors
    const patterns = INDIAN_DESIGN_TOKENS.patterns
    if (isMixedEnglishIndicCode(language?.code)) {
      const scriptPrimary = (language.fontFamily || '').split(',')[0].trim()
      const pairLabel =
        language?.code === 'hinglish'
          ? 'Hindi–English mixed copy (natural Hinglish, not pure Hindi or pure English)'
          : `${language.name} mixed copy for Indian audiences (natural blend of the local language and English, not purely one language)`
      return `

### India Mode — ${language.name}
${pairLabel}:
- **Fonts**: Load ${scriptPrimary} and Inter from Google Fonts. Use the script font for local-language words and Inter for English.
- **Color palette**: Root the palette in Indian tradition — saffron (${colors.primary[1]}), gold (${colors.primary[2]}), deep red (${colors.decorative[0]}), peacock blue (${colors.secondary[0]}), India green (${colors.accent[0]}). Choose 1–2 as accent.
- **Decorative motifs**: Subtle Indian geometric patterns: ${patterns.join(', ')}.
- **Tailwind config**: Indian-inspired semantic tokens (primary, accent, decorative, surface).`
    }
    return `

### India Mode — Additional Requirements
This is an Indian-language (${language.name}) website. Apply these constraints on top of the standard design system:
- **Font**: Use "${language.fontFamily}" as the primary font for body text. Load it from Google Fonts. Pair with a complementary heading font if desired.
- **Color palette**: Root the palette in Indian tradition — saffron (${colors.primary[1]}), gold (${colors.primary[2]}), deep red (${colors.decorative[0]}), peacock blue (${colors.secondary[0]}), India green (${colors.accent[0]}). Choose 1–2 as accent, keep the rest as supporting tones.
- **Decorative motifs**: Incorporate subtle Indian geometric patterns: ${patterns.join(', ')}. These should accent section boundaries and card borders — tasteful, not overwhelming.
- **Tailwind config**: Include the chosen Indian-inspired colors as semantic tokens (primary, accent, decorative, surface).`
  }

  // Non-English, non-Indian language
  const fontName = indiaMode.fontFamily?.split(',')[0]?.trim() || 'Inter'
  return `

### Language — ${indiaMode.name}
This website is in ${indiaMode.name} (${indiaMode.nativeName}). Apply these constraints:
- **Font**: Use "${fontName}" as the primary font for body text. Load it from Google Fonts.${indiaMode.isRTL ? '\n- **Direction**: Use right-to-left (RTL) layout with dir="rtl" on the html element.' : ''}`
}

export function designBriefPrompt(
  prompt,
  indiaMode = null,
  siteType = null,
  hasUserDesignReferences = false,
  designRef = null,
  businessProfile = null,
) {
  const effectiveSiteType = siteType || inferSiteTypeHint(prompt)
  const ecommerceGuidelines = getEcommerceGenerationGuidelines({ hasUserDesignReferences })
  return {
    system:
      `You are an award-caliber product designer. You ship design systems that look unmistakably crafted — bold type, memorable color, and layout tension — never generic purple-gradient SaaS slop. Typography-first dark UIs. ${GLOBAL_UI_CRAFT_GUIDELINES} Output ONLY markdown. No preamble.${designRefSystemAppendix(designRef)}`,
    user: `Create a design system for this project:
${prompt}
${businessProfilePromptBlock(businessProfile)}
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
Valid JSON for tailwind.config.theme.extend with semantic color names. Map \`background\` (or \`ink\`) to the deepest page canvas, \`primary\` to the CTA/brand accent (not the same role as the canvas), \`surface\`/\`elev\` to card layers — not mid-gray for body text. Include font family if not Inter.

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
11. Footer: four or five columns (Shop, Learn, Resources, About, Partner) + bottom legal strip` : `### Sections (homepage order) — SaaS / product marketing (Nova-caliber depth, not a thin template)
1. Nav: logo lockup with mono micro-label; anchor links to \`#features\` \`#pricing\` \`#faq\` (and customers/enterprise if used); primary + secondary header actions
2. Hero: layered mesh or stacked radial+\`blur-3xl\` gradients (Tailwind utilities); pill badge; massive headline + subcopy; primary + secondary CTAs; optional terminal or UI mock panel using borders+\`font-mono\` (no hero photo)
3. Proof strip: stat row and/or logo text row; mono or tabular numerals where relevant
4. Features: bento with unequal cells OR split narrative + divided list rows (mono descriptors); avoid three identical icon cards as the only pattern
5. Deeper capability or integration band: secondary headline + 2\u20134 concrete rows or cards
6. Pricing: section id \`pricing\`; monthly/year toggle; at least three tiers; one featured/\u201cpopular\u201d tier with stronger ring or shadow
7. FAQ: section id \`faq\` or clear FAQ heading; real Q&A pairs; accordion-friendly markup
8. Penultimate CTA band: bold headline + supporting line + two buttons on gradient or elevated surface
9. Footer: multi-column link groups + legal strip (not a single centered line only)`}

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

Max 70 lines. Output ONLY markdown.${languageDesignAppendix(indiaMode)}`,
    model: HOMEPAGE_MODEL,
    temperature: 0.4,
    maxTokens: 3000,
  }
}
