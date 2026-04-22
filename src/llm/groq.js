import { withLLMRetry } from './retry.js'
import {
  ECOMMERCE_AWWWARDS_GALLERY_URL,
  ECOMMERCE_DRIBBBLE_TAG_URL,
  ECOMMERCE_EDITORIAL_CANVAS_PATTERN,
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
import { calculateCost, stripGroqReasoningLeak } from './utils.js'

async function groqFetch({
  model = GROQ_MODEL,
  system,
  prompt,
  temperature = LLM_CONFIG.default.temperature,
  maxTokens = LLM_CONFIG.default.maxTokens,
  reasoningEffort = null,
  reasoningFormat = null,
}) {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set')

  const messages = [
    ...(system ? [{ role: 'system', content: system }] : []),
    { role: 'user', content: prompt },
  ]

  const body = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: false,
  }
  if (reasoningEffort != null) body.reasoning_effort = reasoningEffort
  if (reasoningFormat != null) body.reasoning_format = reasoningFormat

  const res = await withLLMRetry(() => fetch(`${GROQ_HOST}/openai/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }))

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
  const rawContent = data.choices?.[0]?.message?.content ?? ''

  return {
    content: stripGroqReasoningLeak(rawContent),
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
  if (!trimmed) {
    return `\n── MEDIA URLS ──\nNo verified stock URLs were supplied for this run. Do not fabricate https://images.pexels.com or https://images.unsplash.com links—invalid photo IDs break in the browser. For ecommerce storefronts, still use real merchandising structure: \`<div class="img"></div>\` inside each product-card and collection-card, and an empty \`<div class="hero-visual"></div>\` split hero— the server fills those slots with verified stock photos. Avoid only flat gradient blocks with no \`.img\` hooks when you intend product tiles.\n`
  }
  return `\n${trimmed}\nUse only the image and video URLs from the block above. Assign each URL to the section whose subject matches the photo. When a video URL and poster are listed together, use them as the video source and poster attribute. Write short, literal img alt text that matches the photo. Reuse the closest listed URL when you need more slots. If nothing fits, use gradients, patterns, or type-only panels instead of inventing URLs.`
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

async function groqHomepageCore(
  prompt,
  model,
  imageHints = null,
  indiaMode = null,
  brandProfile = null,
  hasDesignReferenceUrls = false,
  maxTokensOverride = null,
) {
  const mixedAppend = mixedEnglishHomepageAppend(indiaMode)
  const mixedEnglish = Boolean(mixedAppend)
  const scriptFontHint = mixedEnglish
    ? (indiaMode?.fontFamily || indiaMode?.language?.fontFamily || '').split(',')[0].trim()
    : ''
  const brandBlock = brandProfilePromptBlock(brandProfile)
  const storefrontIntent =
    /\b(ecommerce|e-commerce|online store|shop|shopping cart|product catalog|checkout|retail|dtc|storefront)\b/i.test(
      String(prompt || ''),
    )
  const referenceFirstAppend = hasDesignReferenceUrls
    ? `\n\nREFERENCE-FIRST: The user message includes "Primary stylistic direction (user-supplied reference links)" with HTTPS URLs, optional path hints, and optional user notes. You cannot fetch URLs or see screenshots. Prioritize the user's product description, notes, and path hints for header layout, hero composition, navigation density, and visual personality. Named external exemplar sites in these instructions are a loose pattern library for section checklist and density only—not a default aesthetic when they conflict with the user's direction.\n${
        storefrontIntent
          ? ''
          : `\nNON-STORE LAYOUT: For landing, SaaS, portfolio, docs, or app-marketing prompts, still apply those reference hints to real layout choices—hero structure (split vs centered vs bento), section order, nav density, and typographic scale—instead of interchangeable boilerplate when hints imply a different composition.\n`
      }`
    : ''
  const storefrontRetailReminder = storefrontIntent
    ? '\n\nStorefront finish: lead with merchandising—categories, product grids, prices, cart/search in header—not a SaaS pricing table or icon-feature grid as the dominant hero. Let palette and layout personality follow this project (sport vs beauty vs electronics vs home, etc.), not a single default boutique aesthetic.'
    : ''
  const mid = String(model)
  let reasoningEffort = null
  let reasoningFormat = null
  if (mid === 'openai/gpt-oss-120b') {
    reasoningEffort = 'high'
    reasoningFormat = 'hidden'
  } else if (mid === 'openai/gpt-oss-20b') {
    reasoningEffort = 'medium'
    reasoningFormat = 'hidden'
  }
  return groqFetch({
    model,
    system: `You are a world-class frontend engineer and visual designer. Your first priority is bespoke UI design for this brief: layout composition, typography, palette, surface depth, and motion must read as intentional art direction—not a reusable template. Output ONLY a complete, self-contained HTML file. No markdown, no explanation, no code fences.
Before writing HTML, infer ONE strong aesthetic direction from the user's topic and tone (e.g. editorial luxury, brutalist tech, soft organic wellness, neon nightlife, quiet museum minimal, festival maximalism). Execute it consistently; never drift back to neutral gray-violet SaaS sameness.
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
- Ecommerce (storefront): ${ECOMMERCE_EDITORIAL_CANVAS_PATTERN} Match section depth of premium retail (${ECOMMERCE_REFERENCE_EXEMPLAR_URLS.join(' | ')} — structure and rhythm only, not one shared look). Implement in HTML and CSS with a palette and mood taken from the user brief (category, tone, brand colors)—utility SVGs including cart bag + badge, hero with dual CTAs, collection rail or grid with scrim, featured grid with full-width add-to-cart and star ratings, curated pair, materials two-column, three review cards, newsletter band, four-column footer. Document title and hero headline must be specific (craft, materials, product story), not generic AI slogans. Commerce: real button elements for add-to-cart, quantity, newsletter submit; cart control must include a visible bag or cart icon as inline SVG next to label or count. Put \`id="cart-toggle"\` on the header cart button so the mini-cart drawer can attach. Full homepage must include all sections implied above plus six or more SKUs in featured areas. BANNED: sparse SaaS storefronts, violet-gray template, icon-only merchandising, link-only fake cart actions. FORBIDDEN above-fold: pricing tables, three icon columns as hero, bento-as-hero without product, dashboard framing. Desktop collections may be grid or rail; mobile may scroll. Curated: two equal offers or carousel with dots. Reviews: verified buyer, stars in accent color. Carousel rails need three or more visible product cards. Study ${ECOMMERCE_AWWWARDS_GALLERY_URL}, ${ECOMMERCE_ENVATO_TEMPLATES_URL}, ${ECOMMERCE_DRIBBBLE_TAG_URL} for craft only. Medusa (${ECOMMERCE_MEDUSA_DOCS_LEARN}): strong imagery discipline; use only approved media URLs from the user message block.
- Portfolio: project showcase with images, about section, skills, contact form.
- Docs: search bar, quick start code block, topic cards grid.
- Community: member stats, trending topics, activity feed.
Shared: ecommerce storefronts may use a disciplined light canvas with near-black type and one restrained accent when it reads more premium; other site types default to a rich dark base (tinted slate or zinc, not flat gray). In every case keep strong readable contrast. Rounded-xl cards, subtle borders, one confident accent. Layout may break center-only symmetry when it improves impact.

── DISTINCTIVE CRAFT (websites + marketing pages; skip for raw app UIs and games) ──
The output must feel art-directed for this specific prompt, not like interchangeable AI SaaS. Banned vibes: default violet-on-gray template, wall-to-wall Inter, perfectly symmetric boring hero, feature cards that all look identical.
- Anti-sameness: infer palette, hero topology (centered vs split vs full-bleed vs bento), rhythm (airy vs editorial-dense), and type pairing from the user's industry and adjectives—do not default every storefront to the same light editorial + wine accent recipe or every SaaS to the same centered hero. When the brief allows, vary light vs dark themes across projects; refuse the recurring purple-gradient-on-white cliché.
- Spatial composition: use asymmetry, overlap, diagonal flow, a grid-breaking focal element, or a tight editorial column—employ at least one move that defeats dull center-only symmetry.
- Type: pair a distinctive display or editorial Google Font for headings (e.g. Fraunces, Syne, Outfit, Cabinet Grotesk, Bebas Neue, DM Serif Display, Playfair Display, Newsreader) with a readable body font. Lazy defaults to avoid unless the brief demands neutral tech utility: Inter-only stacks, Roboto, Arial, Space Grotesk as the primary voice, or system-ui alone.
- Backgrounds and atmosphere: never a flat solid color as the only above-the-fold treatment—add depth with mesh or aurora gradients, subtle CSS noise or grain, geometric ornament, layered translucency, or volumetric gradient shapes.
- Visual hook: include at least ONE memorable composition — bento grid with unequal cells, diagonal or angled section edge, split hero (text vs gradient panel), oversized numeral or word as background watermark, aurora or mesh gradient blob (CSS radial-gradient + blur), or editorial left-aligned column with a strong pull-quote.
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
- Critical safety: Every feature MUST guard nulls (querySelector can return null). Never call .classList/.addEventListener on null. A single missing element must never break the whole script.
- Reveal behavior: If you use [data-reveal], CSS MUST keep content visible by default (no-JS safe). Only animate when JS opts in (e.g. add class "reveal-ready" to <html> then apply opacity transforms under .reveal-ready [data-reveal]).
- No external analytics, no external JS files, and never include <script src="/js/script.js"> or any site-level scripts you don’t define in this HTML.
- Reveal on scroll: optional [data-reveal] sections get class is-visible when intersecting (CSS transition opacity/transform you define).
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
- Styling: no Tailwind or other CSS framework CDNs. Put layout and visuals in a single plain CSS block in head or body. Load Google Fonts in head${mixedEnglish && scriptFontHint ? ` (body font plus ${scriptFontHint} plus a display font for headings)` : ' (a readable body font plus a display font for headings — avoid Inter-only stacks)'}.
- Icons: no icon CDNs. Use text labels for social and utility actions, or small inline SVGs you embed yourself. No emojis as icons.
- Default mood for non-store sites: rich dark surfaces with intentional borders; ecommerce may follow the light editorial bar above when it suits the brief.
- Vanilla JS only. No frameworks.
- IMAGES & VIDEO: use only the image and MP4 URLs in the media block below; never invent hosts or IDs. When the block lists a video with a poster, pair them on the same video element. Never use placeholder.com, picsum, or other off-list URLs. Avoid laptop or phone stock for non-tech subjects. If no listed asset fits, use gradients, pattern, or type instead of guessing URLs.`,
    prompt: `${prompt}${brandBlock}${buildImagePrompt(imageHints?.promptBlock)}${storefrontRetailReminder}\n${
      brandProfile
        ? 'Use the verified brand details above as exact source data. Do not invent missing logo, contact, or social fields.'
        : ''
    }\nShip something that looks deliberately designed: bold typography hierarchy, layered surfaces, tasteful motion, and at least one surprising layout choice — not interchangeable template output.`,
    temperature: LLM_CONFIG.homepage.temperature,
    maxTokens: maxTokensOverride ?? LLM_CONFIG.homepage.maxTokens,
    reasoningEffort,
    reasoningFormat,
  })
}

export async function groqHomepage(
  prompt,
  imageHints = null,
  indiaMode = null,
  brandProfile = null,
  hasDesignReferenceUrls = false,
) {
  return groqHomepageCore(
    prompt,
    HOMEPAGE_MODEL,
    imageHints,
    indiaMode,
    brandProfile,
    hasDesignReferenceUrls,
  )
}

export async function groqHomepageWithModel(
  prompt,
  model,
  imageHints = null,
  indiaMode = null,
  brandProfile = null,
  hasDesignReferenceUrls = false,
  maxTokensOverride = null,
) {
  return groqHomepageCore(
    prompt,
    model,
    imageHints,
    indiaMode,
    brandProfile,
    hasDesignReferenceUrls,
    maxTokensOverride,
  )
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
