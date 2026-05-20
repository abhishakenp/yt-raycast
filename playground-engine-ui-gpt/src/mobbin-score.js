import { COPY_EXAMPLES } from './dna.js'

export function scoreMobbinCoverage(html, anchor) {
  const text = String(html ?? '').toLowerCase()
  const normalizedText = text.replace(/[^a-z0-9]+/g, ' ')
  const palette = anchor?.palette?.length ? anchor.palette : anchor?.dna?.accents || []
  const allHex = [...new Set(palette.filter((hex) => /^#[0-9a-f]{6}$/i.test(hex)))]
  const hexHits = allHex.filter((hex) => text.includes(hex.toLowerCase()))

  const markers = []
  const dna = anchor?.dna
  if (dna?.display) markers.push(...(dna.display.toLowerCase().match(/[a-z][a-z0-9]+/g) || []))
  if (dna?.layout) markers.push(...(dna.layout.toLowerCase().match(/[a-z][a-z0-9-]{4,}/g) || []).slice(0, 8))
  if (Array.isArray(dna?.doctrine)) {
    for (const line of dna.doctrine) markers.push(...(String(line).toLowerCase().match(/[a-z][a-z0-9-]{5,}/g) || []).slice(0, 3))
  }
  const uniqueMarkers = [...new Set(markers)].filter((marker) => marker.length > 4)
  const markerHits = uniqueMarkers.filter((marker) => {
    const normalizedMarker = marker.replace(/[^a-z0-9]+/g, ' ').trim()
    return normalizedMarker && normalizedText.includes(normalizedMarker)
  })

  return {
    palette: {
      hits: hexHits.length,
      total: allHex.length,
      ratio: allHex.length ? hexHits.length / allHex.length : 0,
      hexHits,
    },
    doctrine: {
      hits: markerHits.length,
      total: uniqueMarkers.length,
      ratio: uniqueMarkers.length ? markerHits.length / uniqueMarkers.length : 0,
      markerHits,
    },
  }
}

export function detectVerbatimAnchorCopy(html) {
  if (!html) return { count: 0, matches: [] }
  const text = String(html).toLowerCase()
  const matches = []
  for (const [app, examples] of Object.entries(COPY_EXAMPLES)) {
    for (const h of examples.headlines || []) {
      if (h.length >= 14 && h.split(/\s+/).length >= 3 && text.includes(h.toLowerCase())) {
        matches.push({ app, location: 'headline', verbatim: h })
      }
    }
    for (const s of examples.subs || []) {
      if (s.split(/\s+/).length >= 6 && text.includes(s.toLowerCase())) {
        matches.push({ app, location: 'sub', verbatim: s.slice(0, 100) })
      }
    }
    if ((examples.products || []).length >= 3) {
      const hits = examples.products.filter((product) => {
        const escaped = product.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return new RegExp(`\\b${escaped}\\b`, 'i').test(html)
      })
      const threshold = app === 'Notion' || app === 'Figma' ? 5 : 3
      if (hits.length >= threshold) {
        matches.push({ app, location: 'product-noun-cluster', verbatim: hits.join(' + ') })
      }
    }
  }
  return { count: matches.length, matches }
}

function adaptedPaletteCoverage(html, plan) {
  const text = String(html ?? '').toLowerCase()
  const palette = plan?.visualWorld
    ? [plan.visualWorld.bg, plan.visualWorld.surface, plan.visualWorld.accent, plan.visualWorld.accent2].filter(Boolean)
    : []
  const valid = [...new Set(palette.filter((hex) => /^#[0-9a-f]{6}$/i.test(hex)))]
  const hits = valid.filter((hex) => text.includes(hex.toLowerCase()))
  return { hits: hits.length, total: valid.length, ratio: valid.length ? hits.length / valid.length : 0, hexHits: hits }
}

export function auditMobbinCoverage(html, anchor, context = {}) {
  const score = scoreMobbinCoverage(html, anchor)
  const verbatim = detectVerbatimAnchorCopy(html)
  const adaptedPalette = adaptedPaletteCoverage(html, context.plan)
  const contextualPaletteOverride = adaptedPalette.ratio >= 0.5 && (
    (context.route?.siteHint === 'local-experience' && anchor?.app === 'Airbnb')
    || (context.route?.siteHint === 'portfolio' && anchor?.app === 'Figma')
  )
  const warnings = []
  const blocking = []
  if (score.palette.total && score.palette.ratio < 0.4) {
    const warning = `palette inheritance weak: ${score.palette.hits}/${score.palette.total} anchor hex values appeared`
    warnings.push(warning)
    if (contextualPaletteOverride) {
      warnings.push(`anchor palette adapted to brief: ${adaptedPalette.hits}/${adaptedPalette.total} planned colors appeared`)
    } else {
      blocking.push(warning)
    }
  }
  if (score.doctrine.total && score.doctrine.ratio < 0.15) {
    warnings.push(`doctrine inheritance weak: ${score.doctrine.hits}/${score.doctrine.total} marker tokens appeared`)
  }
  if (verbatim.count) {
    const warning = `verbatim anchor copy detected: ${verbatim.matches.map((m) => `${m.app}:${m.location}`).join(', ')}`
    warnings.push(warning)
    blocking.push(warning)
  }
  return { ok: blocking.length === 0, score, adaptedPalette, verbatim, warnings, blocking }
}
