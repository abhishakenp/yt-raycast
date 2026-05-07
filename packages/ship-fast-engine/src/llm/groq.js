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
  OLLAMA_API_KEY,
  OLLAMA_HOST,
  OPENROUTER_API_KEY,
  OPENROUTER_HOST,
} from '../config.js'
import { isMixedEnglishIndicCode, lookupKnownLanguage } from '../config/languages.js'
import { brandProfilePromptBlock } from '../prompts/brand-profile.js'
import { businessProfilePromptBlock } from '../prompts/business-profile.js'
import { contentPlanPromptAppendix } from '../prompts/content-refs.js'
import { designRefSystemAppendix } from '../prompts/design-refs.js'
import { publicDesignExemplarAppendix } from '../prompts/public-design-exemplar-append.js'
import { DYNAMIC_UI_LIBRARY_APPEND } from '../prompts/dynamic-ui-append.js'
import { PUBLIC_DESIGNS_QUALITY_APPENDIX } from '../prompts/public-designs-quality-bar.js'
import { calculateCost, stripGroqReasoningLeak } from './utils.js'

const OPENROUTER_MODELS = new Set(['moonshotai/kimi-k2-0905', 'moonshotai/kimi-k2.6'])

function resolveProvider(model) {
  if (model.endsWith(':cloud') || model === 'kimi-k2.5' || model === 'kimi-k2:1t') {
    if (!OLLAMA_API_KEY) throw new Error('OLLAMA_API_KEY not set')
    return {
      url: `${OLLAMA_HOST}/v1/chat/completions`,
      key: OLLAMA_API_KEY,
      extraHeaders: {},
    }
  }
  if (OPENROUTER_MODELS.has(model)) {
    if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not set')
    return {
      url: `${OPENROUTER_HOST}/v1/chat/completions`,
      key: OPENROUTER_API_KEY,
      extraHeaders: {
        'HTTP-Referer': 'https://ship-fast.io',
        'X-Title': 'Ship Fast',
      },
    }
  }
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set')
  return {
    url: `${GROQ_HOST}/openai/v1/chat/completions`,
    key: GROQ_API_KEY,
    extraHeaders: {},
  }
}

async function groqFetch({
  model = GROQ_MODEL,
  system,
  prompt,
  temperature = LLM_CONFIG.default.temperature,
  maxTokens = LLM_CONFIG.default.maxTokens,
  reasoningEffort = null,
  reasoningFormat = null,
  responseFormat,
}) {
  const provider = resolveProvider(model)

  const messages = [
    ...(system ? [{ role: 'system', content: system }] : []),
    { role: 'user', content: prompt },
  ]

  const body = { model, messages, temperature, max_tokens: maxTokens, stream: false }
  if (reasoningEffort != null) body.reasoning_effort = reasoningEffort
  if (reasoningFormat != null) body.reasoning_format = reasoningFormat
  if (responseFormat) body.response_format = responseFormat

  const res = await withLLMRetry(() =>
    fetch(provider.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${provider.key}`,
        'Content-Type': 'application/json',
        ...provider.extraHeaders,
      },
      body: JSON.stringify(body),
    }),
  )

  const data = await res.json()
  if (data.error) return { content: '', error: data.error.message ?? String(data.error), tps: 0 }

  const usage = data.usage ?? {}
  const tps =
    usage.completion_tokens && usage.total_time
      ? Math.round(usage.completion_tokens / usage.total_time)
      : 0

  const inputTokens = usage.prompt_tokens ?? 0
  const outputTokens = usage.completion_tokens ?? 0
  const cachedInputTokens = usage.prompt_tokens_details?.cached_tokens ?? 0
  const cost = calculateCost(model, inputTokens, outputTokens, cachedInputTokens)
  const rawContent = data.choices?.[0]?.message?.content ?? ''

  return {
    content: stripGroqReasoningLeak(rawContent),
    tps,
    inputTokens,
    outputTokens,
    cachedInputTokens,
    model,
    cost,
  }
}

export async function groq(prompt, opts = {}) {
  return groqFetch({ prompt, ...opts })
}

/**
 * Full completion plus optional chunked `onToken` calls for dashboards (WebSocket deltas).
 * Uses the same `/chat/completions` path as plain `groq`; chunks are synthesized from the final text when streaming APIs are unavailable.
 */
export async function groqStream(prompt, opts = {}) {
  const { onToken, ...fetchOpts } = opts
  const result = await groqFetch({ prompt, ...fetchOpts })
  const content = stripGroqReasoningLeak(String(result?.content ?? ''))
  if (typeof onToken === 'function' && content.length > 0) {
    const chunkSize = Math.max(64, Math.ceil(content.length / 48))
    let accumulated = ''
    for (let i = 0; i < content.length; i += chunkSize) {
      const piece = content.slice(i, i + chunkSize)
      accumulated += piece
      onToken(piece, accumulated)
    }
  }
  return { ...result, content }
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
  designRef = null,
  businessProfile = null,
  contentPlanRef = null,
  thinSiteSpecJson = '',
  maxTokensOverride = null,
) {
  const mixedAppend = mixedEnglishHomepageAppend(indiaMode)
  const mixedEnglish = Boolean(mixedAppend)
  const scriptFontHint = mixedEnglish
    ? (indiaMode?.fontFamily || indiaMode?.language?.fontFamily || '').split(',')[0].trim()
    : ''
  const brandBlock = brandProfilePromptBlock(brandProfile)
  const businessBlock = businessProfilePromptBlock(businessProfile)
  const storefrontIntent = /\b(ecommerce|e-commerce|online store|shop|shopping cart|product catalog|checkout|retail|dtc|storefront)\b/i.test(
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
  const structuredSpec =
    thinSiteSpecJson && String(thinSiteSpecJson).trim()
      ? `\n\n── HOMEPAGE STRUCTURED SPEC (align sections, nav labels, theme tokens, and ecommerce SKUs with this JSON; do not echo the JSON as visible page text) ──\n${thinSiteSpecJson}\n`
      : ''
  let specSiteType = ''
  try {
    const o = JSON.parse(String(thinSiteSpecJson || '{}'))
    specSiteType = String(o.siteType || o.site_type || '').toLowerCase()
  } catch {
    // ignore
  }
  if (!specSiteType && designRef?.stashName === 'landing-base') specSiteType = 'landing'
  if (!specSiteType && designRef?.stashName === 'saas-base') specSiteType = 'saas'
  if (!specSiteType && designRef?.stashName) {
    const bm = String(designRef.stashName).match(/^([a-z]+)-/i)
    if (bm) {
      const cand = bm[1].toLowerCase()
      if (
        [
          'saas',
          'landing',
          'ecommerce',
          'docs',
          'institutional',
          'dashboard',
          'portfolio',
          'blog',
          'marketplace',
          'community',
          'game',
        ].includes(cand)
      )
        specSiteType = cand
    }
  }
  const publicDesignExemplar = publicDesignExemplarAppendix({
    siteType: specSiteType,
    designRef,
    hasDesignReferenceUrls: hasDesignReferenceUrls,
  })
  // FORGE: validated 2026-05-05 across 50-iter Ralph loop on run 1777980514602.
  // reasoning_effort='low' + max_tokens<=10000 collapses gen time from ~30s to
  // 13-18s while keeping score=100/verifyOk=true and vision=100 across kept
  // iters. The structural-only audit run (v1, commit 8ceb703) saw 17/50 kept
  // ≤15s; v2 5-gate composite saw 9/50 kept ≤18s with vision=100 every time.
  // See FORGE_SESSION.md for the full retro.
  const mid = String(model)
  let reasoningEffort = null
  let reasoningFormat = null
  if (mid === 'openai/gpt-oss-120b') {
    reasoningEffort = 'low'
    reasoningFormat = 'hidden'
  } else if (mid === 'openai/gpt-oss-20b') {
    reasoningEffort = 'low'
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
- SaaS/Landing (match public/designs/design-03-saas-homepage.html energy, not a flat template): typography-first, no stock hero photos. HERO MUST feel alive — count yourself: the LITERAL TEXT \`radial-gradient(\` MUST appear 3 OR MORE times in the output, each on an absolutely-positioned div with classes including both \`blur-3xl\` AND \`motion-reduce:hidden\` AND opacity-40..70 (e.g. \`<div class="absolute -top-24 -left-24 w-[520px] h-[520px] blur-3xl opacity-60 motion-reduce:hidden animate-liquid" style="background: radial-gradient(circle at 30% 30%, rgba(167,139,250,0.55), transparent 70%);"></div>\`). Plus: a \`<canvas>\` with \`requestAnimationFrame\` particle/constellation loop reactive to mousemove (respect prefers-reduced-motion); \`theme.extend.keyframes.liquid\` (translate+rotate+scale ~22s) wired via \`animate-liquid\` on at least 2 orbs; ONE band uses \`-skew-y-3\` / \`-skew-y-6\` / \`clip-path\` polygon / keyframed rotate. At least four \`data-reveal\` blocks — CRITICAL: never start them at \`opacity-0\` / \`translate-y-*\` either in markup or via JS on load (the page must be fully readable without JS); JS may only ADD class \`reveal-ready\` to \`<html>\` then animate IN already-visible elements. At least 2 primary hero CTAs with \`data-magnet\` + parallax JS. Every \`<section>\` MUST contain real visible content (heading + paragraph or card grid) — empty bands are forbidden, every section measures ≥200px tall when rendered. Marketing body copy on dark: use \`text-slate-300\`/\`text-slate-400\`, never \`text-slate-500\` on \`text-lg\`/\`text-base\`/\`leading-relaxed\` paragraphs (4.5:1 contrast minimum on body text). Also: elevated nav (mono micro-label), pill + dual CTAs + trust chips; proof strip; bento or split column with divided list rows (forbid three equal icon cards as the whole story); wired pricing band (\`#pricing\`, \`data-pricing-billing\`, three+ tiers, monthly/yearly toggle, middle tier featured with \`ring-2 ring-offset-2\`); \`#faq\` with accordion (≥5 items); penultimate CTA band; multi-column footer (≥4 columns); eight+ bands minimum. Use specific product-credible copy with concrete numbers ("3.2× faster", "14-day trial") and 3+ named testimonial cards. Semantic \`theme.extend.colors\` (background/surface/elev/primary), display+body+mono font families in config.
- Blog: featured article hero with image, article grid with images + titles + excerpts, categories, newsletter signup.
- Ecommerce (storefront): ${ECOMMERCE_EDITORIAL_CANVAS_PATTERN} Match section depth of premium retail (${ECOMMERCE_REFERENCE_EXEMPLAR_URLS.join(' | ')} — structure and rhythm only). Implement in HTML and CSS with a palette and mood taken from the user brief (category, tone, brand colors)—utility SVGs including cart bag + badge, hero with dual CTAs, collection rail or grid with scrim, featured grid with full-width add-to-cart and star ratings, curated pair, materials two-column, three review cards, newsletter band, four-column footer. Document title and hero headline must be specific (craft, materials, product story), not generic AI slogans. Commerce: real button elements for add-to-cart, quantity, newsletter submit; cart control must include a visible bag or cart icon as inline SVG next to label or count. Put \`id="cart-toggle"\` on the header cart button so the mini-cart drawer can attach. Full homepage must include all sections implied above plus six or more SKUs in featured areas. BANNED: sparse SaaS storefronts, violet-gray template, icon-only merchandising, link-only fake cart actions. FORBIDDEN above-fold: pricing tables, three icon columns as hero, bento-as-hero without product, dashboard framing. Desktop collections may be grid or rail; mobile may scroll. Curated: two equal offers or carousel with dots. Reviews: verified buyer, stars in accent color. Carousel rails need three or more visible product cards. Study ${ECOMMERCE_AWWWARDS_GALLERY_URL}, ${ECOMMERCE_ENVATO_TEMPLATES_URL}, ${ECOMMERCE_DRIBBBLE_TAG_URL} for craft only. Medusa (${ECOMMERCE_MEDUSA_DOCS_LEARN}): strong imagery discipline; use only approved media URLs from the user message block.
- Portfolio: project showcase with images, about section, skills, contact form.
- Docs: search bar, quick start code block, topic cards grid; add one soft liquid aurora / mesh band (Tailwind gradient stacks) in hero or masthead where it fits readability—particles optional as CSS-only sparkle dots, not heavy motion.
- Community: member stats, trending topics, activity feed.
Shared: ecommerce storefronts use warm editorial gradients (cream, stone, rose, amber) and slanted section bands—not stark black-on-white; other site types default to a rich dark base (tinted slate or zinc, not flat gray). In every case keep strong readable contrast (WCAG AA–style: body text never low-contrast gray on dark). Rounded-xl cards, subtle borders, one confident accent. Layout may break center-only symmetry when it improves impact. Include viewport meta and mobile-first responsive classes everywhere. Ship Fast verification expects: Tailwind CDN plus tailwind.config theme.extend; a long inline script before </body>; for marketing sites one or two h1 elements; dense real anchors (not dozens of bare href="#"); storefronts must wire cart (data-open-drawer / data-cart-* / data-add); wire at least one recognizable interaction hook from the dynamic-UI list (e.g. data-mobile-nav, data-accordion, data-carousel, data-tab-group, data-bill, data-acc, data-magnet, data-reveal, popovertarget, data-docs-nav, data-copy).

── DISTINCTIVE CRAFT (websites + marketing pages; skip for raw app UIs and games) ──
The output must feel art-directed for this specific prompt, not like interchangeable AI SaaS. Banned vibes: default violet-on-gray template, wall-to-wall Inter, perfectly symmetric boring hero, feature cards that all look identical.
- Type: use a real display / editorial heading font from Google Fonts for hero and section titles (e.g. Fraunces, Syne, Outfit, Space Grotesk, Bricolage Grotesque, Playfair Display, DM Serif Display, Instrument Serif) paired with a readable body font — map families in tailwind.config; not Inter-only. Cabinet Grotesk and Geist are NOT on Google Fonts and silently fall back to default sans, do not use them.
- Visual hook: include at least ONE memorable composition — bento grid with unequal cells, diagonal or angled section edge, split hero (text vs gradient panel), oversized numeral or word as background watermark, aurora/mesh using stacked divs with bg-gradient-to-* blur-3xl opacity-*, or editorial left-aligned column with a strong pull-quote.
- Depth: layered surfaces — backdrop-blur, ring-1 ring-white/5 to ring-white/15, shadow-2xl, ring or shadow on primary CTA — avoid flat rectangles only.
- Motion: Tailwind transitions and theme.extend.keyframes + animate-* (or transition, duration, hover:scale) on hero and cards; use motion-reduce: variants for reduced motion.
- Micro-detail: one signature flourish (e.g. ring-2 ring-offset on featured pricing card, underline decoration on nav hover, glowing pill badge classes).
${PUBLIC_DESIGNS_QUALITY_APPENDIX}
── DYNAMIC MARKETING UI (websites only, not full apps) ──
Do not ship a static brochure unless the user asked for a single static page. For landing/blog/ecommerce/portfolio/docs/community pages, add a single inline <script> before </body> (vanilla JS, one IIFE) that wires real interactivity:
- Mobile nav: header with data-mobile-nav, button data-mobile-nav-toggle (toggle class is-open on header); close when a nav link is clicked on small screens.
- Tabs: wrap sections in data-tab-group; tab buttons [data-tab="x"]; panels [data-tab-panel="x"] with hidden on inactive panels.
- Testimonials or logos: data-carousel on wrapper, [data-carousel-track] with slide children, [data-carousel-prev] and [data-carousel-next] buttons cycling slides (toggle hidden or translate).
- Stats row: elements [data-counter] with data-counter-target="number" and optional data-counter-duration; animate count-up when scrolled into view (IntersectionObserver).
- Pricing: [data-pricing-billing] with buttons [data-billing="month"|"year"] and paired prices in [data-show-monthly] / [data-show-yearly] (toggle hidden).
- FAQ: [data-accordion] + [data-accordion-item] + button [data-accordion-trigger] + panel (already standard); ensure items open/close.
- Critical safety: Every feature MUST guard nulls (querySelector can return null). Never call .classList/.addEventListener on null. A single missing element must never break the whole script.
- Reveal behavior: If you use [data-reveal], Tailwind classes MUST keep content visible by default (opacity-100 translate-y-0, no-JS safe). Only refine motion when JS opts in (e.g. add class "reveal-ready" to <html> then toggle transition classes on [data-reveal]).
- No external analytics, no external JS files, and never include <script src="/js/script.js"> or any site-level scripts you don’t define in this HTML.
- Reveal on scroll: optional [data-reveal] sections get class is-visible when intersecting; use Tailwind transition/opacity/transform utilities on those elements.
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
- Load Tailwind CDN in head; all HTML HUD chrome (health/shield bars, ammo, radar, objectives, crosshair, FPS) uses Tailwind utility classes on divs absolutely positioned over the canvas — not raw styled widgets.
- Professional game overlay: health/shield bars, ammo counter, radar/minimap, objective text.
- Crosshair at center (targeting reticle).
- FPS counter (optional).
- Use HTML elements overlaid on canvas with Tailwind (fixed/inset, flex, text-*, bg-*/backdrop-blur) or canvas text for the 3D view only.
- Font: mono or bold sans via Tailwind font-mono / font-bold and config.
- Color: bright accent colors on dark semi-transparent panels (bg-*/ opacity-*).

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
- Optional carousels: for product or image strips use a root with class "swiper", inner ".swiper-wrapper" / ".swiper-slide", and attribute data-sf-swiper so a Swiper bundle can attach when the export pipeline loads it (ecommerce or slider-style prompts); put **multiple slides** (3+ cards) inside the wrapper—single-card rows break the carousel. Otherwise use Tailwind scroll-snap utilities or data-carousel patterns from the dynamic UI rules above.
- Semantic structure: use a single site <footer> only at the end of <body> (nav links, legal). For feature grids, pricing columns, or card rows use <article> or <div>, never <footer> as a grid cell or card wrapper.
- Links: every anchor \`href\` must be valid—same-page \`#id\` only if that \`id\` exists; no placeholder \`href="#"\` with no target. Multi-page links must use filenames you actually emit.
- Styling — TAILWIND ONLY (no author \`<style>\` for appearance): Load \`https://cdn.tailwindcss.com\` first, then \`tailwind.config\` with theme.extend (colors, fontFamily, keyframes, animation, boxShadow). All layout, color, typography, spacing, borders, shadows, gradients, blur, and motion MUST be Tailwind utilities and/or arbitrary values—including marketing pages, docs, storefronts, and app shells. Forbidden: \`<style>\` blocks for theme, layout, or animation (WebGL/THREE canvas is not CSS). Semantic color tokens: \`background\`/\`ink\` = page canvas; \`primary\` = brand/CTA accent; \`surface\`/\`elev\` = card layers; never set \`background\` to light off-white in theme while using a dark \`bg-*\` canvas on <body> unless the user asked for light mode; never use \`primary\` as the page background color name when it is actually the main ink/background. Map palette in config${mixedEnglish && scriptFontHint ? ` (body plus ${scriptFontHint} plus a display face)` : ' (readable body plus display — avoid Inter-only stacks)'}.
- Icons: no icon font CDNs (Font Awesome). Prefer Lucide (unpkg script + \`lucide.createIcons()\`) with \`data-lucide\`, sizes \`w-5 h-5 md:w-6 md:h-6\`, and sufficient contrast on the icon color; or inline SVG. No emojis as icons. STRICT BAN — these names DO NOT EXIST in lucide@latest and silently render blank: github, twitter, linkedin, discord, facebook, instagram, youtube, "x", "chart", "close", "search-icon". Use inline \`<svg viewBox="0 0 24 24">\` for brand/social glyphs; replace \`x\` → \`x-circle\`, \`chart\` → \`bar-chart-3\` or \`pie-chart\`, \`close\` → \`x-circle\`.
- Fonts: load Google Fonts only (\`https://fonts.googleapis.com\`). Display family MUST be one of: Fraunces, Syne, Outfit, DM Serif Display, Playfair Display, Space Grotesk, Bricolage Grotesque, Instrument Serif, Manrope, Sora — these are confirmed Google-hosted. Do NOT request Cabinet Grotesk, Geist, or any non-Google family — Google Fonts will silently 404 the family and the page falls back to default sans, breaking the design.
- Default mood for non-store sites: rich dark surfaces with intentional borders; ecommerce may follow the light editorial bar above when it suits the brief.
- Vanilla JS only. No frameworks.
- IMAGES & VIDEO: use only the image and MP4 URLs in the media block below; never invent hosts or IDs. When the block lists a video with a poster, pair them on the same video element. Never use placeholder.com, picsum, or other off-list URLs. Avoid laptop or phone stock for non-tech subjects. If no listed asset fits, use gradients, pattern, or type instead of guessing URLs.${designRefSystemAppendix(designRef)}${publicDesignExemplar}`,
    prompt: `${prompt}${brandBlock}${businessBlock}${structuredSpec}${contentPlanPromptAppendix(contentPlanRef)}${buildImagePrompt(imageHints?.promptBlock)}${storefrontRetailReminder}\n${
      brandProfile
        ? 'Use the verified brand details above as exact source data. Do not invent missing logo, contact, or social fields.'
        : ''
    }\nShip something that looks deliberately designed: fully responsive (viewport + mobile stacks), accessible contrast on every surface, working anchors only, Lucide icons at readable sizes, and for shops warm editorial gradients with interactive product hover—not interchangeable template output.`,
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
