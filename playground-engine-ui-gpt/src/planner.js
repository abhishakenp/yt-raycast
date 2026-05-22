import { mobbinDoctrineBlock, mobbinSessionBlock } from './mobbin-blocks.js'

const PLANNER_SYSTEM = `You are a fast art director for a homepage generation engine. Return only compact JSON. No prose, no markdown.`

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
  if (route?.primary?.app === 'Figma' && /portfolio|agency|designer|brand|creative|studio/.test(text)) {
    return {
      ...world,
      bg: '#f6f1e9',
      surface: '#ffffff',
      text: '#1f2937',
      muted: '#64748b',
      accent: '#6d28d9',
      accent2: '#0f766e',
    }
  }
  return world
}

export function fallbackGenome(brief, route, variety) {
  const primary = route.primary
  const palette = primary?.palette || []
  const appShell = route.siteHint === 'ops-console'
  const blog = route.siteHint === 'blog'
  return {
    pageKind: appShell ? 'app-shell' : 'vertical-doc',
    archetype: appShell ? 'operator command surface' : blog ? 'blog home index' : `${route.siteHint} homepage`,
    visualWorld: {
      bg: cleanHex(palette[1], appShell ? '#08090a' : '#f8f4ec'),
      surface: cleanHex(palette[2], appShell ? '#15161d' : '#ffffff'),
      text: appShell ? '#f4f4f5' : '#171717',
      muted: appShell ? '#a1a1aa' : '#525252',
      accent: cleanHex(palette[0], '#5e6ad2'),
      accent2: cleanHex(palette[2], '#14b8a6'),
      fontDisplay: primary?.dna?.display?.split(/ or |,/i)[0]?.replace(/\d.+$/, '').trim() || 'Manrope',
      fontBody: 'DM Sans',
      mood: `${variety.ground}, ${variety.edgeLanguage}`,
      decor: `${variety.motion}; ${variety.proofRhythm}; ${variety.layoutGrammar}`,
      layoutGrammar: variety.layoutGrammar,
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
      { role: 'conversion', contains: 'CTA, social proof, footer' },
    ],
    appIslands: [
      { slot: 'primary', contains: 'main operational surface with realistic rows and status pills' },
      { slot: 'secondary', contains: 'registry table, queue, activity log, or analytics panel' },
      { slot: 'tertiary', contains: 'controls, timeline, alerts, or secondary proof' },
    ],
    signatureMoves: [variety.layoutGrammar, variety.proofRhythm, variety.edgeLanguage],
    brief,
  }
}

export function normalizeGenome(raw, { brief, route, variety } = {}) {
  const base = fallbackGenome(brief, route, variety)
  const plannerKind = raw?.pageKind === 'app-shell' ? 'app-shell' : raw?.pageKind === 'vertical-doc' ? 'vertical-doc' : base.pageKind
  const pageKind = route?.siteHint === 'ops-console' ? 'app-shell' : plannerKind
  const art = raw?.visualWorld || raw?.art || {}
  const visualWorld = adaptVisualWorldForBrief({
    ...base.visualWorld,
    bg: cleanHex(art.bg, base.visualWorld.bg),
    surface: cleanHex(art.surface, base.visualWorld.surface),
    text: cleanHex(art.text, base.visualWorld.text),
    muted: cleanHex(art.muted, base.visualWorld.muted),
    accent: cleanHex(art.accent, base.visualWorld.accent),
    accent2: cleanHex(art.accent2, base.visualWorld.accent2),
    fontDisplay: String(art.fontDisplay || base.visualWorld.fontDisplay || 'Manrope').slice(0, 40),
    fontBody: String(art.fontBody || base.visualWorld.fontBody || 'DM Sans').slice(0, 40),
    mood: String(art.mood || base.visualWorld.mood).slice(0, 100),
    decor: String(art.decor || base.visualWorld.decor).slice(0, 180),
    layoutGrammar: String(art.layoutGrammar || base.visualWorld.layoutGrammar).slice(0, 80),
  }, { brief, route })
  return {
    ...base,
    ...raw,
    pageKind,
    archetype: String(raw?.archetype || base.archetype).slice(0, 80),
    visualWorld,
    contentInventory: Array.isArray(raw?.contentInventory) && raw.contentInventory.length ? raw.contentInventory.slice(0, 10) : base.contentInventory,
    sections: Array.isArray(raw?.sections) && raw.sections.length >= 3 ? raw.sections.slice(0, 9) : base.sections,
    appIslands: Array.isArray(raw?.appIslands) && raw.appIslands.length >= 2 ? raw.appIslands.slice(0, 5) : base.appIslands,
    signatureMoves: Array.isArray(raw?.signatureMoves) && raw.signatureMoves.length ? raw.signatureMoves.slice(0, 8) : base.signatureMoves,
  }
}

export function buildPlannerPrompt(brief, route, variety) {
  return `Brief:
${brief}

Site hint, not a template: ${route.siteHint}
Run fingerprint: ${variety.fingerprint}
Variety axes:
- ground: ${variety.ground}
- layout grammar: ${variety.layoutGrammar}
- proof rhythm: ${variety.proofRhythm}
- edge language: ${variety.edgeLanguage}
- motion: ${variety.motion}

${mobbinDoctrineBlock()}
${mobbinSessionBlock(route.primary, route.secondary)}

Decide a compact page genome. Avoid deterministic site-type packs; use the hint only to avoid category mistakes. Prefer vertical-doc unless the brief is truly an operational tool that a logged-in operator stares at all day.
${route.siteHint === 'blog' ? '\nThis is a BLOG/PUBLICATION home — plan an article index (featured post + post grid), not a SaaS landing or open-source developer platform.' : ''}

Return only JSON:
{
  "pageKind": "vertical-doc" | "app-shell",
  "archetype": "short concrete label",
  "visualWorld": {
    "bg": "#hex", "surface": "#hex", "text": "#hex", "muted": "#hex",
    "accent": "#hex", "accent2": "#hex",
    "fontDisplay": "Google Font name", "fontBody": "Google Font name",
    "mood": "3-8 words", "decor": "specific craft treatment", "layoutGrammar": "specific grammar"
  },
  "contentInventory": ["concrete item", "..."],
  "sections": [{"role":"opening","contains":"brand-specific content"}],
  "appIslands": [{"slot":"primary","contains":"operator surface content"}],
  "signatureMoves": ["specific visible move"]
}`
}

export async function planPageGenome({ brief, route, variety, llm }) {
  const t0 = Date.now()
  const prompt = buildPlannerPrompt(brief, route, variety)
  let result
  try {
    result = await llm({
      system: PLANNER_SYSTEM,
      prompt,
      temperature: 0.72,
      maxTokens: 1400,
      reasoningEffort: 'low',
      responseFormat: { type: 'json_object' },
    })
  } catch (error) {
    result = await llm({
      system: PLANNER_SYSTEM,
      prompt: `${prompt}\n\nReturn compact JSON only. Do not use markdown fences.`,
      temperature: 0.55,
      maxTokens: 1400,
      reasoningEffort: 'low',
    }).catch(() => ({ content: '{}', model: `fallback-after-${error.message}` }))
  }
  const raw = parseJsonObject(result.content)
  return {
    plan: normalizeGenome(raw, { brief, route, variety }),
    rawPlan: raw,
    plannerMs: Date.now() - t0,
    plannerModel: result.model,
  }
}
