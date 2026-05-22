import { grammarPromptBlock } from './grammars.js'
import { mediaStrategyBlock } from './media/media-presets.js'
import { mobbinDoctrineBlock, mobbinSessionBlock } from './utils/mobbin-blocks.js'

const PLANNER_SYSTEM = `You are a fast art director for a Kimi-grade homepage engine. Return only compact JSON. No prose, no markdown.`

export function parseJsonObject(text) {
  const raw = String(text ?? '').trim()
  try {
    return JSON.parse(raw)
  } catch {}
  const fenced = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
  try {
    return JSON.parse(fenced)
  } catch {}
  const start = fenced.indexOf('{')
  const end = fenced.lastIndexOf('}')
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(fenced.slice(start, end + 1))
    } catch {}
  }
  return null
}

function cleanHex(value, fallback) {
  const text = String(value ?? '').trim()
  return /^#[0-9a-f]{6}$/i.test(text) ? text : fallback
}

function adaptVisualWorldForBrief(world, { brief, route } = {}) {
  const text = String(brief || '').toLowerCase()
  if (route?.siteHint === 'local-experience' && /hotel|room|suite|coast|guest|spa/.test(text)) {
    return {
      ...world,
      bg: '#f6f1e9',
      surface: '#ffffff',
      text: '#17211f',
      muted: '#647067',
      accent: '#0f766e',
      accent2: '#b45309',
    }
  }
  if (route?.siteHint === 'portfolio') {
    return {
      ...world,
      bg: '#f4f0e8',
      surface: '#fffdf8',
      text: '#14110f',
      muted: '#6b645c',
      accent: '#c2410c',
      accent2: '#1d4ed8',
      fontDisplay: 'Syne',
      fontBody: 'Source Serif 4',
      mood: 'editorial print, solo practitioner',
    }
  }
  if (route?.siteHint === 'agency') {
    return {
      ...world,
      bg: '#0c0c0c',
      surface: '#171717',
      text: '#f5f5f4',
      muted: '#a8a29e',
      accent: '#ea580c',
      accent2: '#38bdf8',
      fontDisplay: 'Unbounded',
      fontBody: 'DM Sans',
      mood: 'studio noir, confident systems work',
    }
  }
  if (route?.siteHint === 'fitness') {
    return {
      ...world,
      bg: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
      muted: '#94a3b8',
      accent: '#f97316',
      accent2: '#22c55e',
      fontDisplay: 'Barlow Condensed',
      fontBody: 'Inter',
      mood: 'high-energy training floor',
    }
  }
  if (route?.siteHint === 'blog') {
    return {
      ...world,
      bg: cleanHex(world.bg, '#faf7f2'),
      surface: '#ffffff',
      text: '#1c1917',
      muted: '#78716c',
      accent: '#b45309',
      accent2: '#0369a1',
      fontDisplay: 'Fraunces',
      fontBody: 'Source Serif 4',
      mood: 'warm editorial reading room',
    }
  }
  if (route?.siteHint === 'software' || /kubernetes|saas|b2b|developer|platform|open-?source|infrastructure|datadog/i.test(text)) {
    return {
      ...world,
      bg: cleanHex(world.bg === '#ffffff' || world.bg === '#0a0a0a' ? undefined : world.bg, '#0d1b2a'),
      surface: '#112138',
      text: '#e0e6ed',
      muted: '#6b7c93',
      accent: world.accent === '#ffffff' || world.accent === world.bg ? '#ff6b6b' : world.accent,
      accent2: '#4ecdc4',
      fontDisplay: /inter/i.test(world.fontDisplay) && /inter/i.test(world.fontBody) ? 'Space Grotesk' : world.fontDisplay,
      fontBody: /inter/i.test(world.fontDisplay) && /inter/i.test(world.fontBody) ? 'IBM Plex Sans' : world.fontBody,
    }
  }
  return world
}

function resolvePageKind(plannerKind, brief, route) {
  if (/\bhomepage\b/i.test(brief)) return 'vertical-doc'
  if (route?.siteHint === 'ops-console') return 'app-shell'
  return plannerKind === 'app-shell' ? 'app-shell' : 'vertical-doc'
}

export function fallbackGenome(brief, route, variety, grammar) {
  const primary = route.primary
  const palette = primary?.palette || []
  const appShell = route.siteHint === 'ops-console' && !/\bhomepage\b/i.test(brief)
  const blog = route.siteHint === 'blog'
  return {
    pageKind: appShell ? 'app-shell' : 'vertical-doc',
    archetype: appShell ? 'operator command surface' : blog ? 'blog home index' : `${route.siteHint} homepage`,
    grammarId: grammar?.id || 'hero-editorial-split',
    visualWorld: {
      bg: cleanHex(palette[1], appShell ? '#08090a' : '#f8f4ec'),
      surface: cleanHex(palette[2], appShell ? '#15161d' : '#ffffff'),
      text: appShell ? '#f4f4f5' : '#171717',
      muted: appShell ? '#a1a1aa' : '#525252',
      accent: cleanHex(palette[0], '#5e6ad2'),
      accent2: cleanHex(palette[2], '#14b8a6'),
      fontDisplay: 'Manrope',
      fontBody: 'DM Sans',
      mood: `${variety.ground}, ${variety.edgeLanguage}`,
      decor: `${variety.mediaTreatment}; ${variety.proofRhythm}`,
      layoutGrammar: variety.layoutGrammar,
    },
    mediaStrategy: {
      heroKind: grammar?.mediaKinds?.[0] || 'product-console',
      treatment: variety.mediaTreatment,
      contentStrategy: variety.contentStrategy,
    },
    contentInventory: blog
      ? [
          'nav with Home, Archive, About, Subscribe',
          'featured post masthead with title, byline, date, excerpt',
          'latest posts grid with categories and read links',
          'topics/tags or series band',
          'newsletter signup band',
          'footer with archive links',
        ]
      : [
      'nav with specific product links',
      'identity-defining hero or shell header',
      'proof strip using real numbers or named entities',
      'deep product/content surface',
      'secondary feature/catalog/editorial sections',
      'penultimate CTA and footer',
    ],
    sections: blog
      ? [
          { role: 'featured', contains: 'nav + featured post masthead (cover, title, byline, date, excerpt, read link)' },
          { role: 'latest', contains: 'grid of 6+ recent posts with category chips and short excerpts' },
          { role: 'topics', contains: 'topic/tag chips or series list' },
          { role: 'about', contains: 'short author/publication blurb' },
          { role: 'newsletter', contains: 'email signup with concrete promise' },
          { role: 'footer', contains: 'archive, about, subscribe links' },
        ]
      : [
      { role: 'opening', contains: 'nav, hero, primary visual surface' },
      { role: 'proof', contains: 'numbers, names, product artifacts, or location details' },
      { role: 'depth', contains: 'feature grid, catalog wall, table, event calendar, or editorial modules' },
      { role: 'story', contains: 'brand-specific narrative with concrete nouns' },
      { role: 'social', contains: 'reviews, logos, or named clients' },
      { role: 'conversion', contains: 'CTA, pricing path, booking, or signup' },
      { role: 'footer', contains: 'multi-column footer with real links' },
    ],
    appIslands: [
      { slot: 'identity', contains: 'status strip with live indicators' },
      { slot: 'primary', contains: 'main operational surface with realistic rows' },
      { slot: 'secondary', contains: 'registry table, queue, or analytics panel' },
      { slot: 'tertiary', contains: 'controls, timeline, alerts, or secondary proof' },
    ],
    signatureMoves: [variety.layoutGrammar, variety.proofRhythm, variety.edgeLanguage],
    brief,
  }
}

export function normalizeGenome(raw, { brief, route, variety, grammar } = {}) {
  const base = fallbackGenome(brief, route, variety, grammar)
  const plannerKind = raw?.pageKind === 'app-shell' ? 'app-shell' : raw?.pageKind === 'vertical-doc' ? 'vertical-doc' : base.pageKind
  const pageKind = resolvePageKind(plannerKind, brief, route)
  const art = raw?.visualWorld || raw?.art || {}
  const visualWorld = adaptVisualWorldForBrief({
    ...base.visualWorld,
    bg: cleanHex(art.bg, base.visualWorld.bg),
    surface: cleanHex(art.surface, base.visualWorld.surface),
    text: cleanHex(art.text, base.visualWorld.text),
    muted: cleanHex(art.muted, base.visualWorld.muted),
    accent: cleanHex(art.accent, base.visualWorld.accent),
    accent2: cleanHex(art.accent2, base.visualWorld.accent2),
    fontDisplay: String(art.fontDisplay || base.visualWorld.fontDisplay).slice(0, 40),
    fontBody: String(art.fontBody || base.visualWorld.fontBody).slice(0, 40),
    mood: String(art.mood || base.visualWorld.mood).slice(0, 100),
    decor: String(art.decor || base.visualWorld.decor).slice(0, 180),
    layoutGrammar: String(art.layoutGrammar || base.visualWorld.layoutGrammar).slice(0, 80),
  }, { brief, route })
  return {
    ...base,
    ...raw,
    pageKind,
    grammarId: raw?.grammarId || grammar?.id || base.grammarId,
    archetype: String(raw?.archetype || base.archetype).slice(0, 80),
    reference: String(raw?.reference || raw?.visualWorld?.reference || '').slice(0, 80),
    visualWorld,
    mediaStrategy: {
      ...base.mediaStrategy,
      ...(raw?.mediaStrategy || {}),
      treatment: raw?.mediaStrategy?.treatment || variety.mediaTreatment,
      contentStrategy: raw?.mediaStrategy?.contentStrategy || variety.contentStrategy,
    },
    contentInventory: Array.isArray(raw?.contentInventory) && raw.contentInventory.length ? raw.contentInventory.slice(0, 10) : base.contentInventory,
    sections: (() => {
      const rawSecs = Array.isArray(raw?.sections) && raw.sections.length >= 4 ? raw.sections.slice(0, 9) : base.sections
      const footerSecs = rawSecs.filter((s) => s.role === 'footer')
      const contentSecs = rawSecs.filter((s) => s.role !== 'footer')
      // Editorial/blog verticals naturally use 4-5 sections — don't pollute them with generic homepage filler.
      const isEditorial = route?.siteHint === 'editorial'
      const minContent = isEditorial ? 4 : 6
      if (contentSecs.length < minContent) {
        // Prefer roles from the grammar's section rhythm so padding stays domain-appropriate.
        const grammarRoles = (grammar?.sectionRhythm || []).filter((r) => r !== 'footer')
        const paddingPool = grammarRoles.length
          ? grammarRoles
              .filter((role) => !contentSecs.some((s) => s.role === role))
              .map((role) => base.sections.find((bs) => bs.role === role) || { role, contains: `${role} content for this brand` })
          : base.sections.filter((bs) => bs.role !== 'footer' && !contentSecs.some((s) => s.role === bs.role))
        const toAdd = paddingPool.slice(0, minContent - contentSecs.length)
        return [...contentSecs, ...toAdd, ...(footerSecs.length ? footerSecs : [{ role: 'footer', contains: 'multi-column footer with real links' }])]
      }
      return rawSecs
    })(),
    appIslands: Array.isArray(raw?.appIslands) && raw.appIslands.length >= 2 ? raw.appIslands.slice(0, 5) : base.appIslands,
    signatureMoves: Array.isArray(raw?.signatureMoves) && raw.signatureMoves.length ? raw.signatureMoves.slice(0, 8) : base.signatureMoves,
  }
}

export function buildPlannerPrompt(brief, route, variety, grammar) {
  const quality = process.env.KIMI_FAST !== '1'
  const varietyBlock = quality
    ? `Invent a distinctive visual world for THIS brand (not a template): vary the ground (dark, jewel, paper, high-key), a real Google Fonts pairing (avoid default Inter unless apt), edge language, mood, reference, and a concrete DECOR treatment (grain, duotone, hairline rules, halftone, hard shadow — not generic "clean UI").`
    : `Variety axes: ground ${variety.ground}; layout ${variety.layoutGrammar}; proof ${variety.proofRhythm}; edge ${variety.edgeLanguage}; media ${variety.mediaTreatment}.`

  return `Brief:
${brief}

Site hint: ${route.siteHint}
Grammar: ${grammar.id} — ${grammar.label}
${varietyBlock}

${grammarPromptBlock(grammar, variety)}
${mediaStrategyBlock(route.siteHint, variety, grammar)}

${mobbinSessionBlock(route.primary, route.secondary)}

Decide the best front-door page for this brand. If the brief says "homepage", pageKind MUST be "vertical-doc" (rich marketing story; product UI as a demo section inside the page, not nested app chrome). pageKind "app-shell" ONLY for live operator consoles (fleet ops, incident desk).
${route.siteHint === 'blog' ? 'This is a BLOG/PUBLICATION home — plan an article index (featured post + post grid), not a SaaS landing or product dashboard.' : ''}

List ${quality ? '7-9' : '5-6'} concrete SECTIONS (vertical-doc) or app islands (app-shell), each a full-width band with brand-specific content. For vertical-doc, always include a footer section as the last entry. MINIMUM 7 sections for vertical-doc — never fewer, even for simple brands, so the builder always has enough material.

Each section's "contains" MUST reference at least one concrete brand-specific element: a named product, a real person, a price, a count, a schedule item, a location. Bad: "features section". Good: "3-tier pricing: Starter $29/mo, Studio $79/mo, Agency $199/mo".

Return only JSON:
{
  "pageKind": "vertical-doc" | "app-shell",
  "grammarId": "${grammar.id}",
  "archetype": "short concrete label",
  "reference": "named design reference (product/site/magazine)",
  "visualWorld": {
    "bg": "#hex", "surface": "#hex", "text": "#hex", "muted": "#hex",
    "accent": "#hex", "accent2": "#hex",
    "fontDisplay": "Google Font name", "fontBody": "Google Font name",
    "mood": "3-8 words", "decor": "specific craft treatment", "layoutGrammar": "specific grammar"
  },
  "mediaStrategy": { "heroKind": "...", "treatment": "...", "contentStrategy": "..." },
  "contentInventory": ["concrete item"],
  "sections": [{"role":"opening","contains":"brand-specific content"}],
  "appIslands": [{"slot":"primary","contains":"operator surface content"}],
  "signatureMoves": ["specific visible move"]
}`
}

export async function planPageGenome({ brief, route, variety, grammar, llm }) {
  const t0 = Date.now()
  const prompt = buildPlannerPrompt(brief, route, variety, grammar)
  const result = await llm({
    system: PLANNER_SYSTEM,
    prompt,
    temperature: process.env.KIMI_FAST === '1' ? 0.55 : 0.88,
    maxTokens: process.env.KIMI_FAST === '1' ? 1000 : 1600,
    reasoningEffort: 'low',
    responseFormat: { type: 'json_object' },
  }).catch(() => llm({
    system: PLANNER_SYSTEM,
    prompt: `${prompt}\n\nReturn compact JSON only.`,
    temperature: 0.4,
    maxTokens: 1000,
    reasoningEffort: 'low',
  }))
  const raw = parseJsonObject(result.content)
  return {
    plan: normalizeGenome(raw, { brief, route, variety, grammar }),
    rawPlan: raw,
    plannerMs: Date.now() - t0,
    plannerModel: result.model,
  }
}
