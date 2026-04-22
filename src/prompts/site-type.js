import { promptSnippet } from '../prompt.js'

export function siteTypePrompt(prompt) {
  return {
    system: 'You classify projects. Output only one category word.',
    user: `Project: "${promptSnippet(prompt, 150, 'Generated Project')}"

Categories: game, saas, landing, portfolio, ecommerce, blog, docs, dashboard, marketplace, community

Rules: B2B software, platforms, APIs, workflows, or generic "modern/clean/scalable" product sites → saas. Consumer retail, cart, catalog → ecommerce. Internal tools, KPIs, admin → dashboard.

What category? Reply with just the word:`,
    temperature: 0,
    maxTokens: 10,
  }
}
