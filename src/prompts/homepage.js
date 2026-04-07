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

  const ecommerceBlock = st === 'ecommerce'
    ? `\nE-COMMERCE INTEGRATION:
This site uses Medusa.js as the e-commerce backend. The generated Next.js export includes lib/medusa.js with these SDK functions:
- getProducts(params) — fetch product listings for shop/catalog pages
- getProductByHandle(handle) — fetch single product for detail pages
- getCategories() — fetch product categories for navigation/filtering
- createCart(regionId) — initialize a shopping cart
- addLineItem(cartId, variantId, quantity) — add product to cart
- getCart(cartId) — retrieve cart with items and totals
- getRegions() — fetch available shipping regions

Build the homepage to showcase products prominently:
- Hero should feature a flagship product or seasonal collection with a bold CTA to shop
- Include a featured products section with product cards (image, title, price, quick-add button)
- Category navigation section with visual category cards linking to filtered views
- Trust signals: shipping info, return policy, secure payment badges
- The AI-generated product cards should use onClick handlers that call addLineItem()
- Price display should use Intl.NumberFormat for currency formatting
- Product cards need hover states: image zoom, quick-view overlay, add-to-cart button reveal\n`
    : ''

  const dynamicUiRule =
    st === 'game'
      ? '- For games: follow LAYOUT game rules; use the THREE.js loop and HUD instead of marketing carousels or pricing toggles.\n'
      : '- Include dynamic client behavior for marketing pages: mobile nav toggle (data-mobile-nav / data-mobile-nav-toggle), at least one of FAQ accordion (data-accordion), tabbed content (data-tab-group / data-tab / data-tab-panel), carousel (data-carousel / data-carousel-track / prev-next), animated stat counters (data-counter / data-counter-target), or billing period toggle (data-pricing-billing / data-billing / data-show-monthly / data-show-yearly), implemented in one inline <script> before </body> with vanilla JS.\n'

  return `Build: index.html \u2014 ${st} homepage
Project: ${ctx?.project_name ?? 'My App'}${taglineBlock}
Description: ${prompt}
${featuresBlock}${entitiesBlock}${ecommerceBlock}
LAYOUT: ${typeBlock}
${pagesBlock}

DESIGN SYSTEM (follow these colors, fonts, and patterns exactly):
${designBrief || 'Dark mode. Inter font. Minimalist, typography-first. Choose an accent color that fits the project.'}

BUILD RULES:
- Follow the design system colors and component patterns exactly. Do NOT invent your own palette.
- Use the Tailwind config from the design system in a <script> block after the CDN script.
- Load the fonts specified in the design system via Google Fonts <link> in <head>.
${dynamicUiRule}- Use Lucide icons via CDN with exact placeholders like <i data-lucide="heart"></i>. Call lucide.createIcons() after render. For brand socials use x, instagram, and whatsapp. NEVER use class="lucide-heart" placeholders. NEVER emojis.
- NO hero images or screenshots for SaaS/landing pages. Typography and cards only.
- If images are needed (blog, ecommerce, portfolio), use only the provided verified image lines (description before URL) and pick the URL whose description fits each card. Reuse the closest matching verified URL across multiple cards if needed. If no relevant photo exists, replace that image area with a gradient, pattern, icon, or typography treatment instead of inserting a random stock image.

DESIGN QUALITY \u2014 MUST FEEL PREMIUM, NOT GENERIC:
- Hero: NO photos. Use the design system display font. Headline at text-5xl md:text-8xl if it fits — dramatic scale. Either centered OR a deliberate split (text block + gradient/blur panel). Optional subtle CSS gradient mesh or noise behind the hero. ONE primary CTA with glow or ring on hover.
- Avoid template sameness: vary section rhythm — one band full-bleed with different bg, one section with asymmetric padding or offset column.
- Section pattern: small caps label + big headline + subtitle; at least one section uses left-aligned or split layout instead of everything centered.
- Cards: glass or elevated surfaces (backdrop-blur, ring, shadow-xl), not flat boxes only. 2-col or bento; hover lift or border brighten.
- Highlight / featured: gradient border, inner glow, or animated gradient — must stand out from plain cards.
- Pricing: 2-col; featured plan visually dominant (scale, border glow, "Popular").
- Logo cloud: text-only names; tight letter-spacing or mono treatment for a refined look.
- Final CTA: high contrast band; two buttons with clear hierarchy.
- Footer: refined typography hierarchy; ShipFast pill integrated.
- Width: default max-w-4xl\u2013max-w-5xl; one section may go max-w-6xl for impact. No cluttered 3-col feature grids.
- Motion: CSS transitions on scroll reveals, buttons, cards; respect reduced-motion.
- All interactive elements: hover, focus-visible, transition.

Output ONLY the complete HTML file. No markdown fences. No explanation.`
}
