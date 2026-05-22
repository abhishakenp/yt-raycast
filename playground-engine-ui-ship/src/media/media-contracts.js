export const VISUAL_KINDS = [
  'product-console',
  'ops-map',
  'destination-map',
  'hotel-room',
  'coffee-packaging',
  'fitness-schedule',
  'product-still-life',
  'brand-case-wall',
  'editorial-spread',
]

export const MEDIA_TREATMENTS = {
  'grain-overlay': 'Add subtle film grain via layered pseudo-elements on hero and 2-3 section bands.',
  'duotone-blocks': 'Use duotone gradient blocks behind headlines and media surfaces.',
  'halftone-print': 'Use halftone dot texture bands and print-shop offset shadows on cards.',
  'tape-sticker': 'Use tape-corner accents and sticker labels on editorial cards.',
  'clean-glass': 'Use glassmorphism panels with hairline borders and soft blur.',
  'hard-shadow': 'Use hard offset shadows on cards and media frames (riso/print feel).',
}

export function enrichMediaAttributes(attrs, { kind, treatment, depth = 'layered' }) {
  let out = String(attrs || '')
  if (!/\bdata-visual=/.test(out)) out = out.replace(/^<div\b/, '<div data-visual="art-surface"')
  if (!/\bdata-visual-kind=/.test(out) && kind) {
    out = out.replace(/^<div\b/, `<div data-visual-kind="${kind}"`)
  }
  if (!/\bdata-treatment=/.test(out) && treatment) {
    out = out.replace(/^<div\b/, `<div data-treatment="${treatment}"`)
  }
  if (!/\bdata-depth=/.test(out)) {
    out = out.replace(/^<div\b/, `<div data-depth="${depth}"`)
  }
  return out
}

export function treatmentCssSnippet(treatment) {
  const map = {
    'grain-overlay': '[data-treatment="grain-overlay"]::before{content:"";position:absolute;inset:0;opacity:.12;background-image:url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.35\'/%3E%3C/svg%3E")}',
    'halftone-print': '[data-treatment="halftone-print"]{background-image:radial-gradient(circle,#000 1px,transparent 1px);background-size:6px 6px}',
  }
  return map[treatment] || ''
}
