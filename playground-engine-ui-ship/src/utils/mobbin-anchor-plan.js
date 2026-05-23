import { categoryOfApp } from './dna.js'
import { isPublicationRoute } from './publication-route.js'

const KNOWN_FONTS = [
  'Source Serif 4',
  'Playfair Display',
  'DM Serif Display',
  'DM Sans',
  'Space Grotesk',
  'Instrument Serif',
  'IBM Plex Sans',
  'IBM Plex Mono',
  'JetBrains Mono',
  'Barlow Condensed',
  'Inter Display',
  'Inter',
  'Outfit',
  'Manrope',
  'Fraunces',
  'Lora',
  'Syne',
  'Unbounded',
  'Geist',
  'Charter',
]

function cleanHex(value, fallback) {
  const text = String(value ?? '').trim()
  return /^#[0-9a-f]{6}$/i.test(text) ? text.toLowerCase() : fallback
}

function hexLuminance(hex) {
  const h = String(hex || '').replace('#', '')
  if (h.length !== 6) return 0.5
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function extractGoogleFont(hint) {
  const text = String(hint || '')
  if (!text) return null
  for (const font of KNOWN_FONTS) {
    if (text.toLowerCase().includes(font.toLowerCase())) return font.replace(' Inter Display', 'Inter').replace('Inter Display', 'Inter')
  }
  const match = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/)
  return match?.[1] || null
}

export function applyMobbinAnchorToPlan(plan, route, brief) {
  const primary = route?.primary
  if (!primary?.app) return plan

  const dna = primary.dna || {}
  const accents = (primary.palette?.length ? primary.palette : dna.accents || [])
    .map((hex) => cleanHex(hex, ''))
    .filter(Boolean)

  const world = { ...(plan.visualWorld || {}) }
  const publication = isPublicationRoute(route, brief)

  if (accents.length) {
    world.accent = cleanHex(accents[0], world.accent)
    world.accent2 = cleanHex(accents[1] || accents[0], world.accent2)

    const darkAnchor = accents.some((hex) => hexLuminance(hex) < 0.18)
    if (darkAnchor && !publication && hexLuminance(world.bg) > 0.82) {
      const sorted = [...accents].sort((a, b) => hexLuminance(a) - hexLuminance(b))
      world.bg = sorted[0]
      world.surface =
        sorted.find((hex) => hexLuminance(hex) > 0.06 && hexLuminance(hex) < 0.22) || '#171717'
      world.text = '#f5f5f4'
      world.muted = '#a8a29e'
    }
  }

  const displayFont = extractGoogleFont(dna.display)
  const bodyFont = extractGoogleFont(dna.body)
  if (displayFont) world.fontDisplay = displayFont
  if (bodyFont) world.fontBody = bodyFont

  if (dna.layout && !world.layoutGrammar) {
    world.layoutGrammar = String(dna.layout).slice(0, 80)
  }
  if (dna.weights === 'editorial' && publication && !/serif|editorial|hairline|print/i.test(world.decor || '')) {
    world.decor = world.decor || 'editorial hairline rules, serif rhythm, warm paper ground'
  }

  const reference = plan.reference?.includes(primary.app)
    ? plan.reference
    : `${primary.app}${publication ? ' editorial' : ''} grade`

  const signatureMoves = [
    ...(Array.isArray(dna.doctrine) ? dna.doctrine.slice(0, 3) : []),
    ...(Array.isArray(plan.signatureMoves) ? plan.signatureMoves : []),
  ].slice(0, 8)

  return {
    ...plan,
    reference,
    visualWorld: world,
    signatureMoves,
  }
}

export function mobbinAnchorFromRoute(route, brief = '') {
  const primary = route?.primary
  if (!primary?.app) return null
  return {
    app: primary.app,
    category: primary.category || categoryOfApp(primary.app),
    palette: primary.palette?.length ? primary.palette : primary.dna?.accents || [],
    accents: primary.dna?.accents || primary.palette || [],
    reason: `ship-engine:${route.siteHint}${isPublicationRoute(route, brief) ? ':publication' : ''}`,
  }
}
