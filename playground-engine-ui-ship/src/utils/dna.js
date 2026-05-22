import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DNA_FILE = join(__dirname, '../../data/mobbin-dna.json')

let dnaCache = null

function loadDna() {
  if (dnaCache) return dnaCache
  try {
    dnaCache = JSON.parse(readFileSync(DNA_FILE, 'utf8'))
  } catch {
    dnaCache = {}
  }
  return dnaCache
}

export function listDnaAppNames() {
  return Object.keys(loadDna()).filter((key) => !key.startsWith('_'))
}

function norm(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '')
}

export function resolveDna(appName) {
  if (!appName) return null
  const target = norm(appName)
  for (const [key, value] of Object.entries(loadDna())) {
    if (key.startsWith('_')) continue
    const candidate = norm(key)
    if (target === candidate || target.startsWith(candidate)) {
      return { ...value, _bankApp: key }
    }
  }
  return null
}

export function synthesizeDna(palette = []) {
  const hex = palette
    .map((value) => String(value).toLowerCase())
    .filter((value) => /^#[0-9a-f]{6}$/.test(value))
  if (!hex.length) return null
  const dark = hex.some((value) => {
    const r = parseInt(value.slice(1, 3), 16)
    const g = parseInt(value.slice(3, 5), 16)
    const b = parseInt(value.slice(5, 7), 16)
    return (r + g + b) / 3 < 70
  })
  return {
    display: 'precise display sans, 600 weight',
    body: 'compact readable sans at 14-16px',
    layout: dark
      ? 'Dark single-screen story with dense product surface, proof strip, cards, CTA, and footer.'
      : 'Light editorial flow with confident hero, proof strip, feature surfaces, CTA, and footer.',
    copy: 'Concrete product nouns, outcome verbs, no generic hype.',
    accents: hex.slice(0, 3),
    doctrine: [
      'Use supplied hex values literally in Tailwind arbitrary-value classes',
      'Make the hero visual a real product/content surface, not a gradient placeholder',
      'Use named proof, real numbers, and proprietary product nouns',
    ],
    avoid: ['generic SaaS copy', 'empty screenshot rectangles', 'placeholder testimonials'],
    _synthesized: true,
  }
}

export function resolveCopyExamples(app) {
  const dna = resolveDna(app)
  return dna?.copyExamples || null
}

export function categoryOfApp(app) {
  const dna = resolveDna(app)
  return dna?.category || 'software'
}

export function resolveAnchor({ app, category, palette } = {}) {
  if (!app) return null
  const dna = resolveDna(app) || synthesizeDna(palette || [])
  if (!dna) return null
  return {
    app: dna._bankApp || app,
    category: category || null,
    palette: palette?.length ? palette : Array.isArray(dna.accents) ? dna.accents : [],
    dna,
    copyExamples: resolveCopyExamples(dna._bankApp || app),
  }
}
