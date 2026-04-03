import { GROQ_API_KEY, GROQ_HOST, GROQ_MODEL, HOMEPAGE_MODEL, LLM_CONFIG } from '../config.js'
import { brandProfilePromptBlock } from '../prompts/brand-profile.js'
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
  return `\n${trimmed}\nUse these verified image URLs first, then only use non-photo treatments if absolutely needed.`
}

const HINGLISH_HOMEPAGE_APPEND = `

── HINGLISH (Hindi–English) COPY ──
Visible UI text must mix Hindi and English the way Indian brands do: common English for product/UI terms where expected; Hindi for warmth (Devanagari or romanized, matching the user prompt). Never 100% Hindi-only or English-only. Nav, buttons, headings, and body stay in this mixed register.`

function nonEnglishLanguageAppend(indiaMode) {
  if (!indiaMode?.code || indiaMode.code === 'en' || indiaMode.language?.code === 'hinglish') return ''
  const fontName = indiaMode.fontFamily?.split(',')[0]?.trim() || ''
  const fontNote = fontName && fontName !== 'Inter' ? ` Load "${fontName}" from Google Fonts.` : ''
  const rtlNote = indiaMode.isRTL ? ' Use dir="rtl" on the <html> element.' : ''
  return `

── ${indiaMode.name.toUpperCase()} LANGUAGE ──
All visible UI text must be in ${indiaMode.name} (${indiaMode.nativeName}). Nav, buttons, headings, and body — everything the user reads.${fontNote}${rtlNote}`
}

export async function groqHomepage(prompt, imageHints = null, indiaMode = null, brandProfile = null) {
  const hinglish = indiaMode?.language?.code === 'hinglish'
  const brandBlock = brandProfilePromptBlock(brandProfile)
  return groqFetch({
    model: HOMEPAGE_MODEL,
    system: `You are a world-class frontend engineer. Output ONLY a complete, self-contained HTML file. No markdown, no explanation, no code fences.
${hinglish ? HINGLISH_HOMEPAGE_APPEND : nonEnglishLanguageAppend(indiaMode)}

CLASSIFY: If the prompt describes functionality (app, client, editor, dashboard, manager, tool), build an APPLICATION UI. If it describes a business/product/service, build a LANDING PAGE. Default to APP when unclear.

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
- Ecommerce: product grid with images + prices, category filters, featured products, cart icon in nav.
- Portfolio: project showcase with images, about section, skills, contact form.
- Docs: search bar, quick start code block, topic cards grid.
- Community: member stats, trending topics, activity feed.
Shared: dark theme, centered max-w-5xl layout, rounded-xl cards, subtle borders, accent color used sparingly.

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
- Tailwind CSS via CDN, Google Fonts${hinglish ? ' (load Inter + Noto Sans Devanagari)' : ' (Inter default)'}, Lucide icons via CDN (<script src="https://unpkg.com/lucide@latest"></script> then call lucide.createIcons() after render). Use exact placeholders like <i data-lucide="heart"></i> for icons, prefer x / instagram / whatsapp for brand socials, and NEVER class="lucide-heart" placeholder syntax. No inline SVGs, no emojis.
- Dark theme: bg-gray-950 base, lighter surfaces, border-gray-800, one accent color.
- Vanilla JS only. No frameworks.
- IMAGES: Use provided verified image URLs first. Each line lists a scene description before the URL — assign the URL whose description best matches that card or section (breed, rescue, bridal, dairy, etc.). Reuse the closest matching provided URL when you need more image slots than unique photos. Never use a laptop, phone, or screen image for animals or nature posts. If no relevant photo exists, use a non-photo treatment such as a gradient panel, pattern, icon, or typography block instead of a random stock image.`,
    prompt: `${prompt}${brandBlock}${buildImagePrompt(imageHints?.promptBlock)}\n${
      brandProfile
        ? 'Use the verified brand details above as exact source data. Do not invent missing logo, contact, or social fields.'
        : ''
    }`,
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
