import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DNA_FILE = join(__dirname, '../data/mobbin-dna.json')

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
    mono: 'JetBrains Mono for technical labels',
    weights: 'precise',
    layout: dark
      ? 'Dark single-screen story with dense product surface, proof strip, cards, CTA, and footer.'
      : 'Light editorial flow with confident hero, proof strip, feature surfaces, CTA, and footer.',
    copy: 'Concrete product nouns, outcome verbs, no generic hype.',
    accents: hex.slice(0, 3),
    doctrine: [
      'Use supplied hex values literally in the Tailwind config and arbitrary-value classes',
      'Make the hero visual a real product/content surface, not a gradient placeholder',
      'Use named proof, real numbers, and proprietary product nouns',
    ],
    avoid: ['generic SaaS copy', 'empty screenshot rectangles', 'placeholder testimonials'],
    _synthesized: true,
  }
}

export const COPY_EXAMPLES = {
  Linear: {
    headlines: ['Move work forward', 'Linear is a purpose-built tool for planning and building products', 'The best tool for software teams'],
    subs: ['Streamline issues, projects, and product roadmaps.', 'Meet the system for modern software development.'],
    products: ['Cycles', 'Triage', 'Initiatives', 'Insights', 'Roadmaps'],
  },
  Stripe: {
    headlines: ['Financial infrastructure to grow your revenue', 'Payments for platforms and marketplaces', 'Accept payments online'],
    subs: ['Join the millions of businesses that use Stripe to accept payments, send payouts, and manage their businesses online.'],
    products: ['Payments', 'Connect', 'Atlas', 'Radar', 'Issuing', 'Treasury'],
  },
  Vercel: {
    headlines: ['Frontend cloud, built for AI agents', 'Develop. Preview. Ship.', 'The native Next.js platform'],
    subs: ['Vercel provides the developer tools and cloud infrastructure to build, scale, and secure a faster, more personalized web.'],
    products: ['Next.js', 'AI SDK', 'Edge Functions', 'Analytics', 'KV', 'Postgres'],
  },
  Notion: {
    headlines: ['Your AI everything app', 'Write, plan, share. With AI at your side.'],
    subs: ['Notion is the connected workspace where better, faster work happens.'],
    products: ['Wiki', 'Docs', 'Projects', 'AI', 'Calendar', 'Sites'],
  },
  Figma: {
    headlines: ['Nothing great is made alone', 'A complete design system, built into Figma'],
    subs: ['Design and build great products from start to finish, on a single platform.'],
    products: ['Design', 'FigJam', 'Slides', 'Dev Mode', 'Make', 'Sites'],
  },
  Cursor: {
    headlines: ['The AI code editor', 'Built to make you extraordinarily productive'],
    subs: ['Cursor is the best way to code with AI. Predict your next edit with the cursor in your editor.'],
    products: ['Tab', 'Composer', 'Agent', 'Background Agents', 'Inline Edit'],
  },
  Sentry: {
    headlines: ['Application performance monitoring & error tracking software', 'Code-level observability that helps you ship faster'],
    subs: ['Sentry helps developers monitor and fix crashes in real time. Iterate continuously. Boost workflow efficiency. Improve user experience.'],
    products: ['Error Monitoring', 'Performance', 'Session Replay', 'Profiling', 'Insights'],
  },
  Airbnb: {
    headlines: ['Live anywhere', 'Made possible by hosts'],
    subs: ['Discover places to stay and unique experiences around the world.'],
    products: ['Stays', 'Experiences', 'Online Experiences', 'Luxe', 'Plus'],
  },
  Patagonia: {
    headlines: ["We're in business to save our home planet", 'Built to last, made to be repaired'],
    subs: ['Outdoor clothing and gear for the silent sports: climbing, skiing, surfing, fly fishing, and trail running.'],
    products: ['Worn Wear', 'Provisions', 'Films', 'Action Works', 'Ironclad Guarantee'],
  },
  Apple: {
    headlines: ['Think different', 'The most personal computer ever'],
    subs: ['Innovative products and services that empower people and enrich their lives.'],
    products: ['iPhone', 'Mac', 'iPad', 'Watch', 'Vision Pro', 'Services'],
  },
  Headspace: {
    headlines: ['Be kind to your mind', 'Better mental health, made simple'],
    subs: ['Meditation, sleep, and movement exercises to help you feel less stressed and more present.'],
    products: ['Meditation', 'Sleep', 'Move', 'Focus', 'Soundscapes'],
  },
  Spotify: {
    headlines: ['Music for everyone', 'A sound for every mood'],
    subs: ['Listen to millions of songs and podcasts, ad-free or with ads, on any device.'],
    products: ['Premium', 'DJ', 'Wrapped', 'Blend', 'Podcasts'],
  },
  Vogue: {
    headlines: ['The fashion authority', 'Setting the pace of style since 1892'],
    subs: ['Fashion, beauty, culture, and runway shows from the world\'s style capitals.'],
    products: ['Runway', 'Archive', 'Forces of Fashion', 'Beauty', 'Living'],
  },
  Mercury: {
    headlines: ['Banking built for the unbanked startup era', 'Banking engineered for the ambitious'],
    subs: ['Apply in 10 minutes for online business banking that transforms how companies operate.'],
    products: ['Treasury', 'Credit Card', 'Bill Pay', 'IO Connections', 'Invoicing'],
  },
  Posthog: {
    headlines: ['How developers build successful products', 'The single platform to analyze, test, observe, and deploy new features'],
    subs: ['Product analytics, session replay, feature flags, A/B testing, surveys, and more - all in one developer-first platform.'],
    products: ['Analytics', 'Session Replay', 'Feature Flags', 'Experiments', 'Surveys'],
  },
}

export function resolveCopyExamples(appName) {
  if (!appName) return null
  const target = norm(appName)
  for (const [key, value] of Object.entries(COPY_EXAMPLES)) {
    const candidate = norm(key)
    if (target === candidate || target.startsWith(candidate)) return value
  }
  return null
}

export function resolveAnchor({ app, category, palette } = {}) {
  if (!app) return null
  const dna = resolveDna(app) || synthesizeDna(palette || [])
  if (!dna) return null
  return {
    app: dna._bankApp || app,
    category: category || categoryOfApp(dna._bankApp || app),
    palette: palette?.length ? palette : Array.isArray(dna.accents) ? dna.accents : [],
    dna,
    copyExamples: resolveCopyExamples(dna._bankApp || app),
  }
}

export function categoryOfApp(app) {
  const value = String(app ?? '').toLowerCase()
  if (/airbnb|hopper|hotel/.test(value)) return 'Travel'
  if (/patagonia|nike|allbirds|glossier|lululemon|apple/.test(value)) return 'Consumer'
  if (/headspace|calm/.test(value)) return 'Wellness'
  if (/spotify|masterclass|substack|nyt|vogue/.test(value)) return 'Editorial'
  if (/linear|vercel|github|cursor|sentry|supabase|cloudflare/.test(value)) return 'Developer Tools'
  if (/openai|anthropic|elevenlabs/.test(value)) return 'AI'
  if (/notion|loom|figma/.test(value)) return 'Productivity'
  if (/stripe|mercury|plaid|brex|ramp/.test(value)) return 'Finance'
  if (/posthog|databricks|segment|mixpanel/.test(value)) return 'Data'
  return 'General'
}
