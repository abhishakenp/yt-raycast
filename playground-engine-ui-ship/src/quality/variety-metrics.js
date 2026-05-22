import { stableHash } from '../utils/hash.js'

export function detectVisualSignature(html, { plan, route, seed } = {}) {
  const text = String(html ?? '')
  const classTokens = [...text.matchAll(/\b(?:grid-cols-[^\s"']+|rounded-[^\s"']+|bg-\[[^\]]+\]|font-[a-zA-Z0-9_-]+|max-w-[^\s"']+)/g)]
    .map((m) => m[0])
  return {
    seed,
    anchor: route?.primary?.app || null,
    grammarId: plan?.grammarId || route?.grammar?.id || null,
    pageKind: plan?.pageKind || null,
    archetype: plan?.archetype || null,
    palette: plan?.visualWorld
      ? [plan.visualWorld.bg, plan.visualWorld.surface, plan.visualWorld.accent, plan.visualWorld.accent2].filter(Boolean)
      : [],
    fonts: plan?.visualWorld ? [plan.visualWorld.fontDisplay, plan.visualWorld.fontBody] : [],
    treatment: plan?.mediaStrategy?.treatment || null,
    contentStrategy: plan?.mediaStrategy?.contentStrategy || null,
    sectionCount: (text.match(/<section\b/gi) || []).length,
    tokenSample: [...new Set(classTokens)].slice(0, 28),
    fingerprint: stableHash(`${seed}:${text.slice(0, 2000)}`).toString(16),
  }
}

export function compareSignatures(a, b) {
  const diffs = []
  if (a.anchor !== b.anchor) diffs.push('anchor')
  if (a.grammarId !== b.grammarId) diffs.push('grammarId')
  if (JSON.stringify(a.palette) !== JSON.stringify(b.palette)) diffs.push('palette')
  if (JSON.stringify(a.fonts) !== JSON.stringify(b.fonts)) diffs.push('fonts')
  if (a.treatment !== b.treatment) diffs.push('treatment')
  if (a.contentStrategy !== b.contentStrategy) diffs.push('contentStrategy')
  if (a.pageKind !== b.pageKind) diffs.push('pageKind')
  const shared = a.tokenSample.filter((t) => b.tokenSample.includes(t)).length
  const minLen = Math.min(a.tokenSample.length, b.tokenSample.length) || 1
  const similarity = shared / minLen
  return {
    ok: diffs.length >= 3 || similarity < 0.42,
    diffs,
    sharedTokens: shared,
    similarity,
    fingerprintMatch: a.fingerprint === b.fingerprint,
  }
}

export function varietyDistance(signatures) {
  const comparisons = []
  for (let i = 0; i < signatures.length; i++) {
    for (let j = i + 1; j < signatures.length; j++) {
      comparisons.push(compareSignatures(signatures[i], signatures[j]))
    }
  }
  const distinct = comparisons.filter((c) => c.ok).length
  return {
    pairs: comparisons.length,
    distinctPairs: distinct,
    varietyOk: distinct === comparisons.length && comparisons.length > 0,
    comparisons,
  }
}
