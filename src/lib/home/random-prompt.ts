const FALLBACK_PROMPTS = [
  'A cinematic travel landing page for curated weekend escapes with reviews and fast booking.',
  'A polished SaaS homepage for an AI sales copilot with pipeline analytics and clear pricing.',
  'A premium architecture studio site with immersive case studies, awards, and inquiry scheduling.',
  'A bold ecommerce homepage for handcrafted coffee gear with bundles and subscriptions.',
  'A sleek fintech landing page for founders tracking runway, burn, and investor updates.',
  'A modern fitness club website with class schedules, trainer profiles, and membership plans.',
]

// Fallback prompts; JSON fixture is not available in prod
const randomPrompts = FALLBACK_PROMPTS

function resolveNodeEnv(): string {
  if (typeof process === 'undefined') return 'development'
  return (
    process.env?.NEXT_PUBLIC_NODE_ENV ?? process.env?.NODE_ENV ?? 'development'
  )
}

function withNodeEnvPrefill(prompt: string): string {
  return prompt.replace(/process\.env\.NODE_ENV/g, `"${resolveNodeEnv()}"`)
}

export function getRandomPrompt(): string {
  const index = Math.floor(Math.random() * randomPrompts.length)
  return withNodeEnvPrefill(randomPrompts[index])
}
