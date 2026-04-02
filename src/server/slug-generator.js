import { groq } from '../llm/groq.js'
import { isSlugTaken } from './deployments.js'

const ADJECTIVES = [
  'swift',
  'bright',
  'rapid',
  'bold',
  'fresh',
  'sleek',
  'vivid',
  'prime',
  'quiet',
  'crisp',
  'warm',
  'cool',
  'silver',
  'golden',
  'pixel',
  'neon',
  'cosmic',
  'crystal',
  'velvet',
  'calm',
  'river',
  'pine',
  'sunny',
  'stormy',
  'amber',
  'lunar',
  'urban',
  'sierra',
  'misty',
  'mint',
  'graph',
  'glow',
]

const NOUNS = [
  'falcon',
  'rocket',
  'spark',
  'wave',
  'pulse',
  'forge',
  'orbit',
  'mango',
  'drift',
  'bloom',
  'reef',
  'mesa',
  'flare',
  'prism',
  'comet',
  'ember',
  'tide',
  'leaf',
  'summit',
  'ripple',
  'forest',
  'studio',
  'canyon',
  'lattice',
  'harbor',
  'river',
  'atlas',
  'voyage',
  'zenith',
]

function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function isValidSlug(value) {
  const normalized = normalizeSlug(value)
  return /^[a-z][a-z0-9-]{1,28}[a-z0-9]$/.test(normalized)
}

function parseSlugFromText(text) {
  const normalized = normalizeSlug(text)
  const extracted = String(normalized || '').match(/[a-z][a-z0-9-]{1,28}[a-z0-9]/g)?.[0]
  return extracted && isValidSlug(extracted) ? extracted : ''
}

function pickFallbackSlug() {
  for (let attempt = 0; attempt < 12; attempt++) {
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
    const base = `${adjective}-${noun}`
    if (!isSlugTaken(base)) return base
    const withSuffix = `${base}-${attempt + 10}`
    if (!isSlugTaken(withSuffix)) return withSuffix
  }
  const random = Math.random().toString(36).slice(2, 7)
  return `ship-${random}`
}

async function generateWithLLM(context) {
  const system = [
    'Generate one short, memorable, brandable subdomain slug for a website.',
    'Return only the slug, lowercase kebab-case, 2-3 words, no punctuation, no explanation.',
    'The slug must be unique, URL-friendly and suitable for a public brand domain.',
  ].join(' ')

  const prompt = [
    `Project name: ${String(context?.project_name || context?.name || '').trim() || 'Unnamed project'}`,
    `Tagline: ${String(context?.tagline || '').trim() || 'No tagline provided'}`,
    `Site type: ${String(context?.site_type || '').trim() || 'General'}`,
  ].join('\\n')

  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await groq(prompt, {
      model: 'llama-3.3-70b-versatile',
      system,
      temperature: 0.8,
      maxTokens: 30,
    })
    const slug = parseSlugFromText(response?.content ?? '')
    if (!slug || (attempt === 0 && isSlugTaken(slug))) continue
    if (!isSlugTaken(slug)) return slug
  }
  return ''
}

export const generateSlug = async (projectContext) => {
  const context = projectContext || {}
  const llmSlug = await generateWithLLM(context)
  if (llmSlug) return llmSlug
  return pickFallbackSlug()
}
