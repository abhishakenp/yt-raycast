/**
 * Mobbin Pro DNA resolution — curated bank + copy-example bank + palette synth.
 *
 * Lifted from scripts/forge-mobbin.mjs during the v1 production port. The forge
 * sandbox now imports these helpers from here instead of duplicating; the
 * sandbox keeps only the live-Mobbin auth/Playwright/fetch layer.
 *
 * Pure module — no side-effects, no I/O beyond reading the bundled DNA JSON.
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { MobbinDna } from './types'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DNA_FILE = join(__dirname, '../../data/mobbin-dna.json')

let _dnaCache: Record<string, MobbinDna> | null = null

function loadDna(): Record<string, MobbinDna> {
  if (_dnaCache) return _dnaCache
  try {
    _dnaCache = JSON.parse(readFileSync(DNA_FILE, 'utf8')) as Record<
      string,
      MobbinDna
    >
  } catch {
    _dnaCache = {}
  }
  return _dnaCache
}

export function listDnaAppNames(): string[] {
  return Object.keys(loadDna()).filter((k) => !k.startsWith('_'))
}

export function resolveDna(appName: string): MobbinDna | null {
  if (!appName) return null
  const dna = loadDna()
  const norm = appName.toLowerCase().replace(/[^a-z0-9]+/g, '')
  for (const [key, val] of Object.entries(dna)) {
    if (key.startsWith('_')) continue
    const keyNorm = key.toLowerCase().replace(/[^a-z0-9]+/g, '')
    if (keyNorm === norm) return { ...val, _bankApp: key }
    if (norm.startsWith(keyNorm)) return { ...val, _bankApp: key }
  }
  return null
}

export function synthesizeDna(palette: string[] = []): MobbinDna | null {
  if (!palette.length) return null
  const norm = palette
    .map((h) => h.toLowerCase())
    .filter((h) => /^#[0-9a-f]{6}$/.test(h))
  const isDark = norm.some((h) => {
    const r = parseInt(h.slice(1, 3), 16)
    const g = parseInt(h.slice(3, 5), 16)
    const b = parseInt(h.slice(5, 7), 16)
    return (r + g + b) / 3 < 60
  })
  return {
    display: 'Inter Display 600 (substitute Outfit/Manrope if needed)',
    body: 'Inter 14-16px',
    weights: 'precise',
    layout: isDark
      ? 'Dark-bg single-screen story. Hero + product-preview band + feature grid + pricing as 3 cards + named-customer band + footer.'
      : 'Light-bg editorial flow. Hero with serif/semi-bold headline + product preview + use-case bands + pricing comparison + multi-column footer.',
    copy: 'Outcome-driven verbs, concrete product nouns, no generic SaaS hyperbole.',
    accents: norm.slice(0, 2),
    doctrine: [
      'Map sampled palette directly into theme.extend.colors (background/surface/primary/body roles)',
      'Every section must echo at least one sampled color from the anchor palette',
      'No exclamation marks; sentence-case headings; named pricing tiers',
    ],
    avoid: [
      'aurora-only hero',
      'generic stock testimonials',
      'Lorem-style copy',
    ],
    _synthesized: true,
  }
}

export const COPY_EXAMPLES = {
  Linear: {
    headlines: [
      'Move work forward',
      'Linear is a purpose-built tool for planning and building products',
      'The best tool for software teams',
    ],
    subs: [
      'Streamline issues, projects, and product roadmaps.',
      'Meet the system for modern software development.',
    ],
    products: ['Cycles', 'Triage', 'Initiatives', 'Insights', 'Roadmaps'],
  },
  Stripe: {
    headlines: [
      'Financial infrastructure to grow your revenue',
      'Payments for platforms and marketplaces',
      'Accept payments online',
    ],
    subs: [
      'Join the millions of businesses that use Stripe to accept payments, send payouts, and manage their businesses online.',
    ],
    products: ['Payments', 'Connect', 'Atlas', 'Radar', 'Issuing', 'Treasury'],
  },
  Vercel: {
    headlines: [
      'Frontend cloud, built for AI agents',
      'Develop. Preview. Ship.',
      'The native Next.js platform',
    ],
    subs: [
      'Vercel provides the developer tools and cloud infrastructure to build, scale, and secure a faster, more personalized web.',
    ],
    products: [
      'Next.js',
      'AI SDK',
      'Edge Functions',
      'Analytics',
      'KV',
      'Postgres',
    ],
  },
  Cloudflare: {
    headlines: [
      'The connectivity cloud',
      'Make employees more productive. Make applications more performant. Make networks more secure.',
    ],
    subs: [
      'Cloudflare helps build a better Internet.',
      'Run your apps from one of our 320+ cities in 120+ countries.',
    ],
    products: ['Workers', 'R2', 'D1', 'Pages', 'Stream', 'Zero Trust'],
  },
  Notion: {
    headlines: [
      'Your AI everything app',
      'Write, plan, share. With AI at your side.',
    ],
    subs: [
      'Notion is the connected workspace where better, faster work happens.',
    ],
    products: ['Wiki', 'Docs', 'Projects', 'AI', 'Calendar', 'Sites'],
  },
  Figma: {
    headlines: [
      'Nothing great is made alone',
      'A complete design system, built into Figma',
    ],
    subs: [
      'Design and build great products from start to finish, on a single platform.',
    ],
    products: ['Design', 'FigJam', 'Slides', 'Dev Mode', 'Make', 'Sites'],
  },
  Databricks: {
    headlines: [
      'The Data Intelligence Platform',
      'Better unified analytics for your enterprise',
    ],
    subs: [
      'Databricks delivers the unified, AI-ready data platform for the modern enterprise.',
    ],
    products: [
      'Lakehouse',
      'Unity Catalog',
      'Mosaic AI',
      'Delta Lake',
      'Photon',
    ],
  },
  OpenAI: {
    headlines: [
      'Models built for reasoning, multimodality, and tool use',
      'Pioneering research on the path to AGI',
    ],
    subs: [
      'Build with the most capable, secure, and easy-to-use AI models in the world.',
    ],
    products: ['ChatGPT', 'API', 'Codex', 'Sora', 'Realtime API', 'Embeddings'],
  },
  Anthropic: {
    headlines: [
      'AI research and products that put safety at the frontier',
      'Models built to think',
    ],
    subs: [
      'Claude is a next-generation AI assistant for your tasks, no matter the scale.',
    ],
    products: [
      'Claude',
      'Claude Code',
      'Computer Use',
      'Sonnet',
      'Opus',
      'Haiku',
    ],
  },
  ElevenLabs: {
    headlines: ['The most realistic AI voices', 'Voice AI for every developer'],
    subs: [
      'Generate human-quality voices in 32 languages, from real-time AI agents to dubbed video.',
    ],
    products: [
      'Voice Library',
      'Voice Cloning',
      'Conversational AI',
      'Dubbing',
      'Sound Effects',
    ],
  },
  Supabase: {
    headlines: [
      'Build in a weekend. Scale to millions.',
      'The open source Firebase alternative',
    ],
    subs: [
      'Postgres database, auth, storage, edge functions, realtime — every backend feature you need.',
    ],
    products: [
      'Database',
      'Auth',
      'Storage',
      'Edge Functions',
      'Realtime',
      'Vector',
    ],
  },
  Cursor: {
    headlines: [
      'The AI code editor',
      'Built to make you extraordinarily productive',
    ],
    subs: [
      'Cursor is the best way to code with AI. Predict your next edit with the cursor in your editor.',
    ],
    products: ['Tab', 'Composer', 'Agent', 'Background Agents', 'Inline Edit'],
  },
  GitHub: {
    headlines: [
      'The complete developer platform to build, scale, and deliver secure software',
      'Built for the modern developer',
    ],
    subs: ['Where the world builds software, now with AI built in.'],
    products: [
      'Actions',
      'Codespaces',
      'Copilot',
      'Packages',
      'Issues',
      'Discussions',
    ],
  },
  Loom: {
    headlines: ['Async video for work', 'Replace meetings with messages'],
    subs: [
      'Loom is the easiest way to share your screen, voice, and presence with your team — at any scale.',
    ],
    products: ['Loom AI', 'Transcripts', 'Embeds', 'Comments', 'Reactions'],
  },
  Sentry: {
    headlines: [
      'Application performance monitoring & error tracking software',
      'Code-level observability that helps you ship faster',
    ],
    subs: [
      'Sentry helps developers monitor and fix crashes in real time. Iterate continuously. Boost workflow efficiency. Improve user experience.',
    ],
    products: [
      'Error Monitoring',
      'Performance',
      'Session Replay',
      'Profiling',
      'Insights',
    ],
  },
  Mercury: {
    headlines: [
      'Banking built for the unbanked startup era',
      'Banking engineered for the ambitious',
    ],
    subs: [
      'Apply in 10 minutes for online business banking that transforms how companies operate.',
    ],
    products: [
      'Treasury',
      'Credit Card',
      'Bill Pay',
      'IO Connections',
      'Invoicing',
    ],
  },
  Posthog: {
    headlines: [
      'How developers build successful products',
      'The single platform to analyze, test, observe, and deploy new features',
    ],
    subs: [
      'Product analytics, session replay, feature flags, A/B testing, surveys, and more — all in one developer-first platform.',
    ],
    products: [
      'Analytics',
      'Session Replay',
      'Feature Flags',
      'Experiments',
      'Surveys',
    ],
  },
  Airbnb: {
    headlines: ['Live anywhere', 'Made possible by hosts'],
    subs: ['Discover places to stay and unique experiences around the world.'],
    products: ['Stays', 'Experiences', 'Online Experiences', 'Luxe', 'Plus'],
  },
  Hopper: {
    headlines: [
      'Save up to 40% on flights and hotels',
      'Travel with confidence',
    ],
    subs: [
      'Hopper predicts when prices will rise or fall so you can book at the right time.',
    ],
    products: ['Flights', 'Hotels', 'Cars', 'Homes', 'Carrot Cash'],
  },
  Patagonia: {
    headlines: [
      "We're in business to save our home planet",
      'Built to last, made to be repaired',
    ],
    subs: [
      'Outdoor clothing and gear for the silent sports: climbing, skiing, surfing, fly fishing, and trail running.',
    ],
    products: [
      'Worn Wear',
      'Provisions',
      'Films',
      'Action Works',
      'Ironclad Guarantee',
    ],
  },
  Apple: {
    headlines: ['Think different', 'The most personal computer ever'],
    subs: [
      'Innovative products and services that empower people and enrich their lives.',
    ],
    products: ['iPhone', 'Mac', 'iPad', 'Watch', 'Vision Pro', 'Services'],
  },
  Nike: {
    headlines: ['Just do it', 'Move to zero'],
    subs: ['Bring inspiration and innovation to every athlete in the world.'],
    products: ['Air Max', 'Air Force 1', 'Pegasus', 'SNKRS', 'Training Club'],
  },
  Allbirds: {
    headlines: [
      'Better things in a better way',
      'Made with nature, designed for everyday',
    ],
    subs: [
      'Comfortable shoes and apparel made with natural and recycled materials.',
    ],
    products: [
      'Wool Runners',
      'Tree Dashers',
      'Trail Runners',
      'Apparel',
      'Plant Pacer',
    ],
  },
  Glossier: {
    headlines: [
      'Skin first. Makeup second. Smile always.',
      'A beauty brand inspired by real life',
    ],
    subs: [
      'Beauty products that celebrate and enhance what makes you uniquely you.',
    ],
    products: ['Boy Brow', 'Cloud Paint', 'Balm Dotcom', 'Futuredew', 'You'],
  },
  Lululemon: {
    headlines: [
      'The future of well-being is here',
      'Engineered for life in motion',
    ],
    subs: [
      'Technical athletic apparel for yoga, running, training, and most other sweaty pursuits.',
    ],
    products: ['Align', 'Wunder Train', 'ABC', 'Scuba', 'Define'],
  },
  Headspace: {
    headlines: ['Be kind to your mind', 'Better mental health, made simple'],
    subs: [
      'Meditation, sleep, and movement exercises to help you feel less stressed and more present.',
    ],
    products: ['Meditation', 'Sleep', 'Move', 'Focus', 'Soundscapes'],
  },
  Calm: {
    headlines: [
      'Sleep more. Stress less. Live better.',
      'The #1 app for meditation and sleep',
    ],
    subs: [
      'Guided meditations, sleep stories, breathing programs, and relaxing music.',
    ],
    products: ['Sleep Stories', 'Daily Calm', 'Body', 'Music', 'Masterclass'],
  },
  Spotify: {
    headlines: ['Music for everyone', 'A sound for every mood'],
    subs: [
      'Listen to millions of songs and podcasts, ad-free or with ads, on any device.',
    ],
    products: ['Premium', 'DJ', 'Wrapped', 'Blend', 'Podcasts'],
  },
  MasterClass: {
    headlines: ['Learn from the best', 'Be inspired by extraordinary people'],
    subs: [
      "Online classes taught by the world's greatest minds in their craft.",
    ],
    products: ['Sessions', 'Articles', 'On Call', 'Annual Membership', 'Gift'],
  },
  Substack: {
    headlines: [
      'The home for great culture',
      'Independent voices, paid directly by readers',
    ],
    subs: [
      'Subscribe to writers, podcasters, and video creators who deserve your time.',
    ],
    products: ['Notes', 'Chat', 'Podcasts', 'Video', 'Recommendations'],
  },
  NYT: {
    headlines: [
      "All the news that's fit to print",
      'The truth requires our attention',
    ],
    subs: ['Independent journalism, opinion, cooking, games, and audio.'],
    products: ['News', 'Cooking', 'Games', 'Wirecutter', 'Athletic'],
  },
  Vogue: {
    headlines: [
      'The fashion authority',
      'Setting the pace of style since 1892',
    ],
    subs: [
      "Fashion, beauty, culture, and runway shows from the world's style capitals.",
    ],
    products: ['Runway', 'Archive', 'Forces of Fashion', 'Beauty', 'Living'],
  },
}

export function resolveCopyExamples(
  appName: string,
): { headlines: string[]; subs: string[]; products: string[] } | null {
  if (!appName) return null
  const norm = appName.toLowerCase().replace(/[^a-z0-9]+/g, '')
  for (const [key, val] of Object.entries(COPY_EXAMPLES)) {
    const keyNorm = key.toLowerCase().replace(/[^a-z0-9]+/g, '')
    if (keyNorm === norm) return val
    if (norm.startsWith(keyNorm)) return val
  }
  return null
}
