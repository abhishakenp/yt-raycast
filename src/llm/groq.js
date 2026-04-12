import {
  ECOMMERCE_AWWWARDS_GALLERY_URL,
  ECOMMERCE_DRIBBBLE_TAG_URL,
  ECOMMERCE_ENVATO_TEMPLATES_URL,
  ECOMMERCE_MEDUSA_DOCS_LEARN,
  ECOMMERCE_REFERENCE_EXEMPLAR_URLS,
  GROQ_API_KEY,
  GROQ_HOST,
  GROQ_MODEL,
  HOMEPAGE_MODEL,
  LLM_CONFIG,
} from '../config.js'
import { isMixedEnglishIndicCode, lookupKnownLanguage } from '../config/languages.js'
import { brandProfilePromptBlock } from '../prompts/brand-profile.js'
import { DYNAMIC_UI_LIBRARY_APPEND } from '../prompts/dynamic-ui-append.js'
import { calculateCost } from './utils.js'

async function groqFetch({
  model = GROQ_MODEL,
  system,
  prompt,
  temperature = LLM_CONFIG.default.temperature,
  maxTokens = LLM_CONFIG.default.maxTokens,
}) {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set')

  const messages = [
    ...(system ? [{ role: 'system', content: system }] : []),
    { role: 'user', content: prompt },
  ]

  const res = await fetch(`${GROQ_HOST}/openai/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens, stream: false }),
  })

  const data = await res.json()
  if (data.error) return { content: '', error: data.error.message, tps: 0 }

  const usage = data.usage ?? {}
  const tps =
    usage.completion_tokens && usage.total_time
      ? Math.round(usage.completion_tokens / usage.total_time)
      : 0

  const inputTokens = usage.prompt_tokens ?? 0
  const outputTokens = usage.completion_tokens ?? 0
  const cost = calculateCost(model, inputTokens, outputTokens)

  return {
    content: data.choices?.[0]?.message?.content ?? '',
    tps,
    inputTokens,
    outputTokens,
    model,
    cost,
  }
}

export async function groq(prompt, opts = {}) {
  return groqFetch({ prompt, ...opts })
}

function buildImagePrompt(imageHints = '') {
  const trimmed = String(imageHints || '').trim()
  if (!trimmed) return ''
  return `\n${trimmed}\nUse these verified media URLs first (still images and MP4 videos when listed). Match each URL to the section or hero whose copy fits that topic. For VIDEO entries, use one <video muted loop playsinline><source src="(listed mp4)" type="video/mp4"></video> and the listed poster on the <video> when provided. Set each img alt to a short literal description of the scene so imagery and text stay aligned. Reuse the closest listed URL when you need more slots. If nothing fits a block, use a gradient, pattern, or icon block instead of inventing URLs.`
}

const HINGLISH_HOMEPAGE_APPEND = `

── HINGLISH (Hindi–English) COPY ──
Visible UI text must mix Hindi and English the way Indian brands do: common English for product/UI terms where expected; Hindi for warmth (Devanagari or romanized, matching the user prompt). Never 100% Hindi-only or English-only. Nav, buttons, headings, and body stay in this mixed register.`

function mixedEnglishHomepageAppend(indiaMode) {
  const lang = indiaMode?.language
  const code = lang?.code
  if (!code || !isMixedEnglishIndicCode(code)) return ''
  if (code === 'hinglish') return HINGLISH_HOMEPAGE_APPEND
  const known = lookupKnownLanguage(code)
  const label = known?.name || lang?.name || code
  const native = known?.nativeName || lang?.nativeName || ''
  return `

── ${String(label).toUpperCase()} COPY ──
Visible UI text must mix the local language and English the way Indian audiences expect: common English for product/UI terms where natural; ${native ? `${native} for local phrasing` : 'local language for warmth'} (matching the user prompt). Never 100% local-only or English-only across the whole UI. Nav, buttons, headings, and body stay in this mixed register.`
}

function nonEnglishLanguageAppend(indiaMode) {
  const lc = indiaMode?.language?.code
  if (!indiaMode?.code || indiaMode.code === 'en' || isMixedEnglishIndicCode(lc || '')) return ''
  const fontName = indiaMode.fontFamily?.split(',')[0]?.trim() || ''
  const fontNote = fontName && fontName !== 'Inter' ? ` Load "${fontName}" from Google Fonts.` : ''
  const rtlNote = indiaMode.isRTL ? ' Use dir="rtl" on the <html> element.' : ''
  return `

── ${indiaMode.name.toUpperCase()} LANGUAGE ──
All visible UI text must be in ${indiaMode.name} (${indiaMode.nativeName}). Nav, buttons, headings, and body — everything the user reads.${fontNote}${rtlNote}`
}

export async function groqHomepage(
  prompt,
  imageHints = null,
  indiaMode = null,
  brandProfile = null,
  hasDesignReferenceUrls = false,
) {
  const mixedAppend = mixedEnglishHomepageAppend(indiaMode)
  const mixedEnglish = Boolean(mixedAppend)
  const scriptFontHint = mixedEnglish
    ? (indiaMode?.fontFamily || indiaMode?.language?.fontFamily || '')
        .split(',')[0]
        .trim()
    : ''
  const brandBlock = brandProfilePromptBlock(brandProfile)
  const referenceFirstAppend = hasDesignReferenceUrls
    ? `\n\nREFERENCE-FIRST: The user message includes "Primary stylistic direction (user-supplied reference links)" with HTTPS URLs and optional path hints. You cannot fetch URLs. Prioritize the user's product description and those path hints for header layout, hero composition, navigation density, and visual personality. Named external exemplar sites in these instructions are a loose pattern library for section checklist and density only—not a default aesthetic when they conflict with the user's direction.\n`
    : ''
  const storefrontRetailReminder =
    /\b(ecommerce|e-commerce|online store|shop|shopping cart|product catalog|checkout|retail|dtc|storefront)\b/i.test(
      String(prompt || ''),
    )
      ? '\n\nStorefront finish: lead with merchandising—categories, product grids, prices, cart/search in header—not a SaaS pricing table or icon-feature grid as the dominant hero.'
      : ''
  return groqFetch({
    model: HOMEPAGE_MODEL,
    system: `You are a world-class frontend engineer. Output ONLY a complete, self-contained HTML file. No markdown, no explanation, no code fences.
${mixedAppend || nonEnglishLanguageAppend(indiaMode)}${referenceFirstAppend}

CLASSIFY: If the prompt describes ecommerce, online store, shopping cart, product catalog, checkout, retail, DTC, or selling physical/digital goods, build a WEBSITE (storefront) — product-forward marketing layout with cart in nav, NOT a dashboard app. If the prompt describes application functionality (app, client, editor, dashboard, manager, tool) without retail/store context, build an APPLICATION UI. If it describes a business/product/service without store semantics, build a LANDING PAGE. Portfolio, personal site, resume, photographer/designer showcase, or creative work MUST be a WEBSITE with visible sections (hero, work grid, about, contact) — NEVER an empty application shell. Default to APP when unclear for non-store prompts only if the prompt clearly implies a software product UI.

── APPLICATION UI ──
Build a real, interactive app like Proton Mail, Linear, Notion, or Figma. Not a landing page about the app — the actual app.
- Layout: sidebar (narrow, w-64) + main content area (flex-1, dominant). Primary content always gets the most space.
- Only populate with mock data if the user explicitly asks for it. Otherwise use clean empty states.
- All UI driven by a single JS state object. Write a render() function that re-renders from state after every change.
- SINGLE SOURCE OF TRUTH: All data in ONE array. Badge counts = computed from data. Nav views = filtered from data. If a nav item exists, the data MUST contain items for it. Zero tolerance for empty views that show a badge count > 0.
- Every nav item shows DIFFERENT content. Every button works. Create/New opens a form. Delete removes from state. Selection highlights and shows detail.
- Hover states, transitions, active states on everything interactive.

── WEBSITE (landing, blog, ecommerce, portfolio, docs, etc.) ──
Adapt the layout to the type of site:
- SaaS/Landing: typography-first, no hero images. Massive headlines, pill badge + CTA, features cards, pricing, footer.
- Blog: featured article hero with image, article grid with images + titles + excerpts, categories, newsletter signup.
- Ecommerce: build a FULL retail homepage (match structural depth of exemplar URLs — ${ECOMMERCE_REFERENCE_EXEMPLAR_URLS.join(' | ')}): promo strip, dense header (search, account, cart badge, multi-level shop nav), hero + benefit chips, four-plus category tiles, six-plus product cards with reviews and prices, bundle band, three learn cards, stats/testimonials, review quotes, newsletter, fat multi-column footer. Do not copy third-party brands or assets. BANNED: sparse SaaS-style storefronts with only hero + 3 cards + footer. FORBIDDEN as the dominant above-the-fold story for storefronts: pricing comparison tables, three-column icon "features", symmetric bento-as-hero, dashboard/login framing, or marketing-page pill badge + single CTA without product or category merchandising. REQUIRED: visible shop cues early—product or lifestyle imagery, category entry points, prices + add-to-cart paths, cart/search in header. Also study ${ECOMMERCE_AWWWARDS_GALLERY_URL}, ${ECOMMERCE_ENVATO_TEMPLATES_URL}, and ${ECOMMERCE_DRIBBBLE_TAG_URL} (patterns and craft only — no copying specific shots). Medusa (${ECOMMERCE_MEDUSA_DOCS_LEARN}): Store API, cart, products, regions — editorial type, strong product imagery, many distinct sections. Any section titled like a carousel, "curated/gift sets", bundles, or "shop the …" row MUST place **at least three** product cards in the same horizontal strip (one shared \`grid\` or \`flex flex-row gap-*\` containing multiple cards)—never a single product tile with a large empty area beside it.
- Portfolio: project showcase with images, about section, skills, contact form.
- Docs: search bar, quick start code block, topic cards grid.
- Community: member stats, trending topics, activity feed.
Shared: dark theme with nuanced base (tinted deep slate or zinc, not flat generic gray), rounded-xl cards, subtle borders, one confident accent. Layout may break center-only symmetry when it improves impact.

── DISTINCTIVE CRAFT (websites + marketing pages; skip for raw app UIs and games) ──
The output must feel art-directed for this specific prompt, not like interchangeable AI SaaS. Banned vibes: default violet-on-gray template, wall-to-wall Inter, perfectly symmetric boring hero, feature cards that all look identical.
- Type: use a real display / editorial heading font from Google Fonts for hero and section titles (e.g. Fraunces, Syne, Outfit, Cabinet Grotesk, Playfair Display, DM Serif Display) paired with a readable body font — not Inter-only.
- Visual hook: include at least ONE memorable composition — bento grid with unequal cells, diagonal or angled section edge, split hero (text vs gradient panel), oversized numeral or word as background watermark, aurora/mesh gradient blob (CSS radial-gradient + blur), or editorial left-aligned column with a strong pull-quote.
- Depth: layered surfaces — backdrop-blur on a panel, ring-1 ring-white/5 to ring-white/15, shadow-2xl, subtle inner glow on primary CTA — avoid flat rectangles only.
- Motion: CSS-only polish — @keyframes or transition on hero (fade+rise), hover lift/scale on primary buttons and cards, optional slow gradient shift on a band; respect prefers-reduced-motion with @media (prefers-reduced-motion: reduce).
- Micro-detail: one signature flourish (e.g. gradient border on featured pricing card, animated underline on nav hover, glowing pill badge).

── DYNAMIC MARKETING UI (websites only, not full apps) ──
Do not ship a static brochure unless the user asked for a single static page. For landing/blog/ecommerce/portfolio/docs/community pages, add a single inline <script> before </body> (vanilla JS, one IIFE) that wires real interactivity:
- Mobile nav: header with data-mobile-nav, button data-mobile-nav-toggle (toggle class is-open on header); close when a nav link is clicked on small screens.
- Tabs: wrap sections in data-tab-group; tab buttons [data-tab="x"]; panels [data-tab-panel="x"] with hidden on inactive panels.
- Testimonials or logos: data-carousel on wrapper, [data-carousel-track] with slide children, [data-carousel-prev] and [data-carousel-next] buttons cycling slides (toggle hidden or translate).
- Stats row: elements [data-counter] with data-counter-target="number" and optional data-counter-duration; animate count-up when scrolled into view (IntersectionObserver).
- Pricing: [data-pricing-billing] with buttons [data-billing="month"|"year"] and paired prices in [data-show-monthly] / [data-show-yearly] (toggle hidden).
- FAQ: [data-accordion] + [data-accordion-item] + button [data-accordion-trigger] + panel (already standard); ensure items open/close.
- Reveal on scroll: optional [data-reveal] sections get class is-visible when intersecting (CSS transition opacity/transform you define).
After any JS that injects or swaps nodes with Lucide placeholders, call lucide.createIcons() if window.lucide exists.
${DYNAMIC_UI_LIBRARY_APPEND}
── GAME ──
Build a sophisticated, fully playable 3D game using THREE.js. NOT a landing page, demo, or 2D Canvas game.

ARCHITECTURE:
- Fullscreen canvas. NO UI outside the game viewport. Game fills entire screen.
- MUST USE THREE.js (required): https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js
- Initialize THREE.Scene, THREE.Camera (PerspectiveCamera), THREE.WebGLRenderer
- SINGLE FILE: All game logic, 3D models (procedural THREE.js geometries), and state in ONE HTML file.

SCENE & GRAPHICS:
- Dynamic 3D scene: terrain/landscape (can be procedurally generated), objects, lighting.
- Realistic camera movement (follow/orbit/FPS). Use THREE.js perspective camera.
- Proper lighting: ambient light, directional light (sun), shadows where possible.
- LOD or simple polygon models (use THREE.js geometry: BoxGeometry, SphereGeometry, etc.).
- Particle effects for: explosions, impacts, environmental effects (dust, rain, sparks).

PHYSICS & GAMEPLAY:
- Real game loop with state machine: MENU → PLAYING → PAUSED → GAMEOVER.
- 3D physics simulation: gravity, collisions between 3D objects, acceleration, momentum in 3D space.
- Player controls: WASD (movement), Mouse (camera/aiming in 3D), Space/Enter (action), Q/E (abilities).
- Realistic 3D vehicle/character/spaceship movement with proper camera follow and rotation mechanics.
- Win/lose conditions: objectives, scoring system, progression through 3D environments.

HUD & UI:
- Professional game overlay: health/shield bars, ammo counter, radar/minimap, objective text.
- Crosshair at center (targeting reticle).
- FPS counter (optional).
- Use HTML canvas text or simple HTML elements (absolute positioned) overlaid on canvas.
- Font: monospace or bold sans-serif for that game feel.
- Color: bright accent colors (cyan, green, orange) on dark semi-transparent background.

INTERACTIVITY:
- Smooth 60fps+ gameplay. Optimize renderer (pixelRatio, LOD, frustum culling).
- Responsive controls: no lag, smooth acceleration curves.
- Sound effects: placeholder audio (just console.log or simple Web Audio API tones—no external assets).
- Menu: "Press to Start" screen with difficulty/options before gameplay starts.

QUALITY:
- Code must be clean, well-structured with clear game loop separation.
- Performance: works smoothly on desktop and mobile browsers.
- No errors in browser console.
- Fully functional: all controls work, game is winnable/loseable, score tracks.

── SHARED ──
- Never enter a repetition loop: do not repeat the same words, bigrams, or short phrases hundreds of times. If you catch yourself repeating, stop and emit a short but complete valid HTML document with </body></html> — garbage walls of text are forbidden.
- Never invent street addresses, cities, states, regions, postal codes, phone numbers, or map pins. If the user or verified brand block does not supply a real location, omit address lines entirely; use neutral copy only (e.g. "Remote", "Worldwide", "By appointment") or email/social CTAs without a fake place name.
- Never output the host product name "Ship Fast", builder attribution, or purple rocket-style builder logos in the page body, contact column, hero, or nav—generated sites must not advertise the generator.
- Optional carousels: for product or image strips use a root with class "swiper", inner ".swiper-wrapper" / ".swiper-slide", and attribute data-sf-swiper so a Swiper bundle can attach when the export pipeline loads it (ecommerce or slider-style prompts); put **multiple slides** (3+ cards) inside the wrapper—single-card rows break the carousel. Otherwise use scroll-snap CSS or data-carousel patterns from the dynamic UI rules above.
- Semantic structure: use a single site <footer> only at the end of <body> (nav links, legal). For feature grids, pricing columns, or card rows use <article> or <div>, never <footer> as a grid cell or card wrapper.
- Tailwind CSS via CDN, Google Fonts${mixedEnglish && scriptFontHint ? ` (load Inter + ${scriptFontHint} + a display font for headings)` : ' (load a body font + a display font for headings — not Inter-only)'}, Lucide icons via CDN (<script src="https://unpkg.com/lucide@latest"></script> then call lucide.createIcons() after render). Use exact placeholders like <i data-lucide="heart"></i> for icons, prefer x / instagram / whatsapp for brand socials, and NEVER class="lucide-heart" placeholder syntax. No inline SVGs, no emojis.
- Dark theme: rich dark base (slate/zinc/neutral with subtle hue), not identical gray-950 everywhere; surfaces and borders should feel intentional.
- Vanilla JS only. No frameworks.
- IMAGES & VIDEO: Use ONLY the verified Pexels/Unsplash image URLs and Pexels MP4 URLs listed in the media block below — never invent IDs or domains. For a hero or background loop, prefer a listed MP4 + poster pair when the block includes VERIFIED VIDEOS. Never use placeholder.com, picsum, source.unsplash, or any URL not copied from that list. Never use a laptop, phone, or screen image for animals or nature posts. If no listed URL fits, use a non-photo treatment (gradient, pattern, icon, typography) instead of a random or made-up URL.`,
    prompt: `${prompt}${brandBlock}${buildImagePrompt(imageHints?.promptBlock)}${storefrontRetailReminder}\n${
      brandProfile
        ? 'Use the verified brand details above as exact source data. Do not invent missing logo, contact, or social fields.'
        : ''
    }\nShip something that looks deliberately designed: bold typography hierarchy, layered surfaces, tasteful motion, and at least one surprising layout choice — not interchangeable template output.`,
    temperature: LLM_CONFIG.homepage.temperature,
    maxTokens: LLM_CONFIG.homepage.maxTokens,
  })
}

export async function groqParallel(calls, opts = {}) {
  return Promise.all(
    calls.map((call) =>
      groqFetch({
        prompt: call.prompt,
        system: call.system,
        temperature: call.temperature ?? opts.temperature ?? LLM_CONFIG.parallel.temperature,
        maxTokens: call.maxTokens ?? opts.maxTokens ?? LLM_CONFIG.parallel.maxTokens,
        model: call.model ?? opts.model,
      }),
    ),
  )
}
