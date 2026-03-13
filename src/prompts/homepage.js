import { HOME_LABELS, SITE_TYPE_INSTRUCTIONS } from '../config.js'
import { slug } from '../pipeline/workspace.js'

export function homepagePrompt(prompt, ctx, designBrief) {
  const st = ctx?.site_type ?? 'saas'
  const otherPages = (ctx?.pages ?? []).filter((p) => !HOME_LABELS.includes(p.toLowerCase()))
  const isOnePager = ['landing', 'portfolio', 'game'].includes(st) || otherPages.length === 0

  const navLinks = (ctx?.pages ?? [])
    .map((p) => {
      const label = p.toLowerCase()
      if (HOME_LABELS.includes(label)) return '- Home: index.html'
      return `- ${p}: ${slug(p)}.html`
    })
    .join('\n')

  const typeBlock =
    st === 'game'
      ? `GAME BUILD RULES:
BUILD A REAL, FULLY PLAYABLE GAME - NOT A DEMO OR LANDING PAGE.

MUST HAVE:
- Fullscreen 3D game using THREE.js (via CDN) - NOT a 2D Canvas game.
- Create THREE.Scene, THREE.PerspectiveCamera, THREE.WebGLRenderer, and populate with 3D geometries.
- Sophisticated game loop with proper state machine (MENU, PLAYING, PAUSED, GAMEOVER).
- Realistic physics: gravity, momentum, collisions, 3D acceleration curves.
- Professional HUD: health/ammo/score/radar overlaid on game (NOT Tailwind cards).
- Responsive controls: WASD movement, mouse for aiming/camera, smooth input handling.
- Win/lose conditions with proper progression.

GAME MUST BE:
- Fully functional and playable without errors. NO Canvas 2D games—only THREE.js 3D.
- Smooth 60fps gameplay (optimize THREE.js renderer).
- All code in ONE HTML file (no external assets except THREE.js CDN).
- Menu screen: "Press SPACE to Start" before gameplay.
- Score tracking and visual feedback for actions.
- Realistic mechanics with 3D camera, lighting, and terrain/objects.

DO NOT:
- Use 2D Canvas games. MUST use THREE.js for 3D rendering.
- Use placeholder mechanics or empty screens.
- Include non-functional UI elements.
- Create slow/laggy experiences.
- Depend on external assets or image files.`
      : SITE_TYPE_INSTRUCTIONS[st] || SITE_TYPE_INSTRUCTIONS.landing

  const pagesBlock = isOnePager
    ? 'ONE-PAGER. All content in this file. Anchor links (#features, #pricing) for nav.'
    : `MULTI-PAGE. This is ONLY the homepage. Other pages are separate files.\nNav hrefs:\n${navLinks}`

  const featuresBlock = ctx?.features?.length
    ? `\nProduct features (MUST showcase these on the homepage):\n${ctx.features.map((f) => `- ${f}`).join('\n')}\n`
    : ''
  const entitiesBlock = ctx?.entities?.length ? `\nKey entities: ${ctx.entities.join(', ')}\n` : ''
  const taglineBlock = ctx?.tagline ? `\nTagline: "${ctx.tagline}"\n` : ''

  return `Build: index.html \u2014 ${st} homepage
Project: ${ctx?.project_name ?? 'My App'}${taglineBlock}
Description: ${prompt}
${featuresBlock}${entitiesBlock}
LAYOUT: ${typeBlock}
${pagesBlock}

DESIGN SYSTEM (follow these colors, fonts, and patterns exactly):
${designBrief || 'Dark mode. Inter font. Minimalist, typography-first. Choose an accent color that fits the project.'}

BUILD RULES:
- Follow the design system colors and component patterns exactly. Do NOT invent your own palette.
- Use the Tailwind config from the design system in a <script> block after the CDN script.
- Load the fonts specified in the design system via Google Fonts <link> in <head>.
- Inline SVG for all icons. NEVER emojis. NEVER icon CDNs.
- NO hero images or screenshots for SaaS/landing pages. Typography and cards only.
- If images are truly needed (ecommerce, portfolio), use Lorem Picsum: https://picsum.photos/seed/{seed}/{w}/{h}. NEVER placeholder.com or other services.

DESIGN QUALITY \u2014 MUST FOLLOW:
- Hero: NO images. Small pill badge (rounded-full, subtle dark bg + border) above headline. Massive headline (text-5xl md:text-7xl font-extrabold tracking-tight text-center). Subtitle in muted color, text-center, max-w-2xl mx-auto. ONE primary CTA (rounded-full, accent gradient bg, px-8 py-3).
- Section pattern: uppercase label in accent color (text-xs tracking-widest font-semibold) + bold headline (text-3xl md:text-4xl font-extrabold) + subtitle in muted color. All centered.
- Cards: dark surface bg, subtle border, rounded-xl p-6. Use 2-col grids (NOT 3). Hover states.
- Highlight card: gradient bg using accent at low opacity, accent-tinted border, icon at top.
- Pricing: 2-col layout (NOT 3). Featured plan has "Popular" badge. CTA as text link with arrow.
- Logo cloud: company names as plain text (font-medium, muted), NO images. Flex-wrap centered row.
- Final CTA: bold headline + subtitle + 2 buttons (primary accent gradient + secondary outline).
- Footer: centered, simple. Logo + links row + copyright.
- Centered layout: max-w-4xl mx-auto. NOT wide 7xl.
- Generous spacing: py-20 md:py-28 per section. space-y-6 within sections.
- All interactive elements have hover/transition states.

Output ONLY the complete HTML file. No markdown fences. No explanation.`
}
