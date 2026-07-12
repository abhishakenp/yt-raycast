import {
  buildEcommerceSiteTypeInstructions,
  getEcommerceGenerationGuidelines,
  ECOMMERCE_MEDUSA_DOCS_LEARN,
  GLOBAL_UI_CRAFT_GUIDELINES,
  HOME_LABELS,
  MOTION_DEV_DOCS_REACT,
  MOTION_REACT_GUIDELINES,
  SITE_TYPE_INSTRUCTIONS,
} from '../config'
import { slug } from '../pipeline/workspace'

interface HomepageCtx {
  site_type?: string
  pages?: string[]
  features?: string[]
  entities?: string[]
  tagline?: string
  project_name?: string
}

export function homepagePrompt(
  prompt: string,
  ctx: HomepageCtx,
  designBrief: string | null,
  hasUserDesignReferences = false,
): string {
  const st = ctx?.site_type ?? 'saas'
  const ecommerceGuidelines = getEcommerceGenerationGuidelines({
    hasUserDesignReferences,
  })
  const otherPages = (ctx?.pages ?? []).filter(
    (p: string) => !HOME_LABELS.includes(p.toLowerCase()),
  )
  const isOnePager =
    ['landing', 'portfolio', 'game'].includes(st) || otherPages.length === 0

  const navLinks = (ctx?.pages ?? [])
    .map((p: string) => {
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

FLIGHT SIMULATOR SPECIFIC (for aircraft/pilot games):
- Use GLTFLoader for aircraft models from /public folder (e.g., /Shenyang J-11.glb)
- Use TextureLoader for terrain/cloud textures from /public folder (e.g., /Road from vibe-jet.jpg, /Cloud 10 from vibe-jet.png)
- Build complete 3D world: terrain with hills, water bodies, clouds, landmarks (skyscrapers, castles)
- Third-person camera following aircraft with smooth interpolation
- Flight HUD: altitude, speed, heading, throttle indicator
- Flight controls: W/S for pitch, A/D for roll, Q/E for yaw, Shift/Space for throttle
- All asset paths must be absolute starting with / (e.g., /Shenyang J-11.glb)

GAME MUST BE:
- Fully functional and playable without errors. NO Canvas 2D games—only THREE.js 3D.
- Smooth 60fps gameplay (optimize THREE.js renderer).
- All code in ONE HTML file (no external assets except THREE.js CDN and /public assets for models/textures).
- Menu screen: "Press SPACE to Start" before gameplay.
- Score tracking and visual feedback for actions.
- Realistic mechanics with 3D camera, lighting, and terrain/objects.

DO NOT:
- Use 2D Canvas games. MUST use THREE.js for 3D rendering.
- Use placeholder mechanics or empty screens.
- Include non-functional UI elements.
- Create slow/laggy experiences.
- Depend on external assets from CDNs (only use /public folder for models/textures).`
      : st === 'ecommerce'
        ? buildEcommerceSiteTypeInstructions(hasUserDesignReferences)
        : SITE_TYPE_INSTRUCTIONS[st as keyof typeof SITE_TYPE_INSTRUCTIONS] ||
          SITE_TYPE_INSTRUCTIONS.landing

  const pagesBlock = isOnePager
    ? 'ONE-PAGER. All content in this file. Anchor links (#features, #pricing) for nav.'
    : `MULTI-PAGE. This is ONLY the homepage. Other pages are separate files.\nNav hrefs:\n${navLinks}`

  const featuresBlock = ctx?.features?.length
    ? `\nProduct features (MUST showcase these on the homepage):\n${ctx.features.map((f) => `- ${f}`).join('\n')}\n`
    : ''
  const entitiesBlock = ctx?.entities?.length
    ? `\nKey entities: ${ctx.entities.join(', ')}\n`
    : ''
  const taglineBlock = ctx?.tagline ? `\nTagline: "${ctx.tagline}"\n` : ''

  const ecommerceBlock =
    st === 'ecommerce'
      ? `\n${ecommerceGuidelines}

E-COMMERCE INTEGRATION (Medusa):
This site uses Medusa.js as the e-commerce backend per ${ECOMMERCE_MEDUSA_DOCS_LEARN}. The generated Next.js export includes lib/medusa.js with these SDK functions:
- getProducts(params) — fetch product listings for shop/catalog pages
- getProductByHandle(handle) — fetch single product for detail pages
- getCategories() — fetch product categories for navigation/filtering
- createCart(regionId) — initialize a shopping cart
- addLineItem(cartId, variantId, quantity) — add product to cart
- getCart(cartId) — retrieve cart with items and totals
- getRegions() — fetch available shipping regions

Homepage must match the structural depth in the ecommerce block above (patterns only — original copy and brand for this project; when user reference URLs are present they steer layout and mood ahead of generic exemplars), not a thin SaaS-style page:
- Implement the full section stack from the design brief: promo strip, rich header (search, account, cart count, multi-link shop nav), hero + benefit chips, four-plus category tiles, six-plus featured product cards with reviews and prices, bundle band, learn trio, stats/testimonials, review quotes, newsletter, multi-column footer
- Product cards: onClick handlers that call addLineItem(); Intl.NumberFormat for money; hover: image zoom, add-to-cart reveal
- ${MOTION_REACT_GUIDELINES} Next.js export includes \`framer-motion\`; import from \`framer-motion\` (${MOTION_DEV_DOCS_REACT}) for marquees, cart, cards, and section motion.
- Use data-carousel for testimonials if needed; data-counter for stat percentages; mobile nav pattern from BUILD RULES\n`
      : ''

  const dynamicUiRule =
    st === 'game'
      ? '- For games: follow LAYOUT game rules; use the THREE.js loop and HUD instead of marketing carousels or pricing toggles.\n'
      : '- Include dynamic client behavior for marketing pages: mobile nav toggle (data-mobile-nav / data-mobile-nav-toggle), at least one of FAQ accordion (data-accordion), tabbed content (data-tab-group / data-tab / data-tab-panel), carousel (data-carousel / data-carousel-track / prev-next), animated stat counters (data-counter / data-counter-target), or billing period toggle (data-pricing-billing / data-billing / data-show-monthly / data-show-yearly), implemented in one inline <script> before </body> with vanilla JS.\n' +
        `- For Next.js or React component exports (not this static HTML task): ${MOTION_REACT_GUIDELINES} Prefer Motion over static-only layouts for interactive sections.\n`

  const craftBlock =
    st === 'game'
      ? ''
      : `\nUI CRAFT (apply with the design system):\n${GLOBAL_UI_CRAFT_GUIDELINES}\n`

  const imageryRule =
    st === 'ecommerce'
      ? '- Ecommerce: hero and category sections must show merchandise — large lifestyle or product photos from verified image lines when provided. Product cards: small category label, price (and compare-at strike when discounted), review stars or count line, primary “Add to cart” CTA, square or 4:3 imagery with hover zoom — never icon-only SaaS feature tiles for products.\n'
      : '- NO hero images or screenshots for SaaS/landing pages. Typography and cards only.\n'

  const verifiedImagesRule =
    st === 'ecommerce'
      ? '- Product and category images: use only verified image URLs from the prompt when present; match each URL to the closest product/category. If none fit, use rich gradient panels with clear product-shaped frames and Shop CTAs — not empty colored blocks.\n'
      : '- If images are needed (blog, ecommerce, portfolio), use only the provided verified image lines (description before URL) and pick the URL whose description fits each card. Reuse the closest matching verified URL across multiple cards if needed. If no relevant photo exists, replace that image area with a gradient, pattern, icon, or typography treatment instead of inserting a random stock image.\n'

  const designQualityBlock =
    st === 'ecommerce'
      ? `STOREFRONT DESIGN (must look like a DTC shop, not SaaS):\n- Slim promo strip first (shipping threshold, sale, or guarantee).\n- Header reads as retail: multi-link Shop menu, visible search field, cart with numeric badge.\n- Hero is editorial commerce: dominant product or lifestyle visual + headline + subcopy + Shop CTA + 2–3 benefit chips.\n- Category grid: four+ large tiles with photography, titles, blurbs, Shop links.\n- Product grid: six+ cards with photo, label, title, stars/reviews line, price row, Add to cart; optional horizontal product marquee.\n- Lower page: bundle/subscription, education cards, stats or testimonials with names, review quotes, email capture, multi-column footer with shop/legal columns.\n- Full width: use max-w-7xl for shop grids; avoid narrow single-column SaaS layouts for the whole page.\n`
      : `DESIGN QUALITY \u2014 MUST FEEL PREMIUM, NOT GENERIC:\n- Hero: NO photos. Use the design system display font. Headline at text-5xl md:text-8xl if it fits — dramatic scale. Either centered OR a deliberate split (text block + gradient/blur panel). Optional subtle CSS gradient mesh or noise behind the hero. ONE primary CTA with glow or ring on hover.\n- Avoid template sameness: vary section rhythm — one band full-bleed with different bg, one section with asymmetric padding or offset column.\n- Section pattern: small caps label + big headline + subtitle; at least one section uses left-aligned or split layout instead of everything centered.\n- Cards: glass or elevated surfaces (backdrop-blur, ring, shadow-xl), not flat boxes only. 2-col or bento; hover lift or border brighten.\n- Highlight / featured: gradient border, inner glow, or animated gradient — must stand out from plain cards.\n- Pricing: 2-col; featured plan visually dominant (scale, border glow, "Popular").\n- Logo cloud: text-only names; tight letter-spacing or mono treatment for a refined look.\n- Final CTA: high contrast band; two buttons with clear hierarchy.\n- Footer: refined typography hierarchy; ShipFast pill integrated.\n- Width: default max-w-4xl\u2013max-w-5xl; one section may go max-w-6xl for impact. No cluttered 3-col feature grids.\n- Motion: CSS transitions on scroll reveals, buttons, cards; respect reduced-motion.\n- All interactive elements: hover, focus-visible, transition.\n`

  return `Build: index.html \u2014 ${st} homepage
Project: ${ctx?.project_name ?? 'My App'}${taglineBlock}
Description: ${prompt}
${featuresBlock}${entitiesBlock}${ecommerceBlock}
LAYOUT: ${typeBlock}
${pagesBlock}

DESIGN SYSTEM (follow these colors, fonts, and patterns exactly):
${designBrief || 'Dark mode. Inter font. Minimalist, typography-first. Choose an accent color that fits the project.'}${craftBlock}
BUILD RULES:
- Follow the design system colors and component patterns exactly. Do NOT invent your own palette.
- Use the Tailwind config from the design system in a <script> block after the CDN script.
- Load the fonts specified in the design system via Google Fonts <link> in <head>.
${dynamicUiRule}- Use Lucide icons via CDN with exact placeholders like <i data-lucide="heart"></i>. Call lucide.createIcons() after render. For brand socials use x, instagram, and whatsapp. NEVER use class="lucide-heart" placeholders. NEVER emojis.
${imageryRule}${verifiedImagesRule}
${designQualityBlock}
Output ONLY the complete HTML file. No markdown fences. No explanation.`
}
