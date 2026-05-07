import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../public/designs')

const SITE_TO_FILE = {
  saas: 'design-03-saas-homepage.html',
  landing: 'design-03-saas-homepage.html',
  ecommerce: 'design-05-ecommerce.html',
  docs: 'design-04-docs-site.html',
  institutional: 'design-01-government-portal.html',
  dashboard: 'design-02-admin-panel.html',
  portfolio: 'design-03-saas-homepage.html',
  blog: 'design-03-saas-homepage.html',
  marketplace: 'design-03-saas-homepage.html',
  community: 'design-03-saas-homepage.html',
}

const maxChars = () => {
  const n = parseInt(process.env.SHIPFAST_EXEMPLAR_MAX_CHARS || '52000', 10)
  if (!Number.isFinite(n) || n < 8000) return 52000
  return Math.min(120000, n)
}

export const getPublicDesignExemplarPath = (siteType) => {
  const st = String(siteType || '').toLowerCase()
  if (st === 'game') return ''
  const file = SITE_TO_FILE[st] || SITE_TO_FILE.landing
  const p = join(ROOT, file)
  return existsSync(p) ? p : ''
}

export const publicDesignExemplarAppendix = ({
  siteType = '',
  hasDesignReferenceUrls = false,
  designRef = null,
} = {}) => {
  if (hasDesignReferenceUrls) return ''
  let st = String(siteType || '').toLowerCase()
  if (!st && designRef?.stashName) {
    const m = String(designRef.stashName).match(/^([a-z]+)-base$/i)
    if (m) st = m[1].toLowerCase()
  }
  if (!st) st = 'landing'
  if (st === 'game') return ''
  const file = SITE_TO_FILE[st] || SITE_TO_FILE.landing
  const p = join(ROOT, file)
  if (!existsSync(p)) return ''
  const cap = maxChars()
  const full = readFileSync(p, 'utf8')
  const truncated = full.length > cap
  const raw = truncated ? full.slice(0, cap) : full
  const label = file.replace(/\.html$/i, '')
  return `

── SHIP FAST PUBLIC DESIGN EXEMPLAR (${label}) — match this tier (structure, density, motion, interactivity); adapt all names and copy to the user's project; do not copy placeholder brand text verbatim ──
${raw}
${truncated ? `\n… truncated at ${cap} chars; full file: public/designs/${file} …` : ''}
── END EXEMPLAR ──`
}
