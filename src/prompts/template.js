import { SITE_TYPE_INSTRUCTIONS } from '../config.js'

export function templatePrompt(siteType = 'landing', designSystem = null) {
  const typeInstructions = SITE_TYPE_INSTRUCTIONS[siteType] || SITE_TYPE_INSTRUCTIONS.landing

  const designBlock =
    designSystem ||
    `Dark mode. Inter font. Minimalist, typography-first.
- Primary: 50-100 hue range (cyan/blue)
- Surface: #0f172a (slate-950)
- Border: #1e293b (slate-800)
- Text: #f1f5f9 (slate-100 for headlines), #94a3b8 (slate-400 for body)
- Accent: #06b6d4 (cyan-500)`

  return `You are a world-class frontend engineer generating premium website templates.

SITE TYPE: ${siteType.toUpperCase()}
LAYOUT STRUCTURE:
${typeInstructions}

DESIGN SYSTEM (follow exactly):
${designBlock}

RULES:
- Output ONLY complete, self-contained HTML file. No markdown, no fences, no explanation.
- Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Load fonts from Google Fonts in <head>
- Use Lucide icons via CDN with exact placeholders like <i data-lucide="heart"></i>; call lucide.createIcons() after render, use x / instagram / whatsapp for brand socials, and never use class="lucide-heart" placeholders
- Images only if needed: use relevant verified provider images first. If no good photo exists, use gradients, patterns, icons, or strong typography instead of random stock images
- NO screenshots, mockups, or hero images for SaaS/landing pages
- Typography-first, minimal, premium aesthetic
- 2-column grids (never 3)
- Centered max-w-4xl layout
- py-20 md:py-28 section spacing
- All buttons rounded-full with proper gradient/outline states
- Responsive: work on mobile, tablet, desktop

SECTION FLOW (for all types):
1. Navigation bar (logo left, 2-3 links, 1 CTA button right)
2. Hero section (NO images - use badge + massive headline + subtitle + 1 CTA)
3. Features/core content (depends on type)
4. Pricing (if applicable - 2 col, featured has "Popular" badge)
5. Highlight/social proof (gradient card or stats)
6. Call-to-action (headline + 2 buttons)
7. Footer (logo, links, copyright)

Generate a complete, production-ready template for a ${siteType} homepage.`
}
