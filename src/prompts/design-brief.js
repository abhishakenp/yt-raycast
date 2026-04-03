import { INDIAN_DESIGN_TOKENS } from '../config.js'

function indianDesignAppendix(indiaMode) {
  if (!indiaMode?.isIndian) return ''
  const { language } = indiaMode
  const colors = INDIAN_DESIGN_TOKENS.colors
  const patterns = INDIAN_DESIGN_TOKENS.patterns
  if (language?.code === 'hinglish') {
    return `

### India Mode — Hinglish
Hindi–English mixed copy for Indian audiences (natural Hinglish, not pure Hindi or pure English):
- **Fonts**: Load Noto Sans Devanagari and Inter from Google Fonts. Devanagari for Hindi words, Inter for English.
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

export function designBriefPrompt(prompt, indiaMode = null) {
  return {
    system:
      'You are a world-class design system architect. You create minimalist, typography-first dark SaaS design systems. Output ONLY markdown. No preamble.',
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
- Pick a heading + body font pairing that fits the project (can be the same font). Must be available on Google Fonts.
- Google Fonts import URL with required weights (at least 400, 500, 600, 700, 800)
- Size scale: hero (very large, extrabold, tracking-tight), section headline (large, extrabold), section label (tiny, uppercase, tracking-widest, accent color), body (medium), small

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

### Sections (homepage order)
1. Nav
2. Hero (pill badge + massive headline + subtitle + 1 CTA button \u2014 NO images)
3. Features (section label + headline + 2x2 card grid with SVG icon + title + desc)
4. Pricing (section label + headline + 2-col cards, featured has "Popular" badge)
5. Highlight/custom section (section label + headline + gradient featured card with icon)
6. Logo cloud (headline + company names as plain text, muted color \u2014 NO images)
7. Final CTA (bold headline + subtitle + 2 buttons)
8. Footer (centered: logo + links row + copyright)

### Key Principles
- Typography-first: NO hero images, NO screenshots, NO floating mockups
- Centered narrow layout: max-w-4xl mx-auto, everything text-center
- 2-column grids, NEVER 3-column
- Generous spacing: py-20 md:py-28 per section
- Restraint: less is more, no clutter, no busy layouts
- If images are truly needed (ecommerce/portfolio), use relevant verified provider photos first. If no close match exists, avoid random stock-photo fallbacks and use gradients, patterns, icons, or typography-driven panels instead

Max 70 lines. Output ONLY markdown.${indianDesignAppendix(indiaMode)}`,
    model: 'moonshotai/kimi-k2-instruct-0905',
    temperature: 0.4,
    maxTokens: 3000,
  }
}
