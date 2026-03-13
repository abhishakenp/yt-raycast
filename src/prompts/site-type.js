export function siteTypePrompt(prompt) {
  return {
    system: 'You classify projects. Output only one category word.',
    user: `Project: "${prompt.slice(0, 150)}"

Categories: game, saas, landing, portfolio, ecommerce, blog, docs, dashboard, marketplace, community

What category? Reply with just the word:`,
    temperature: 0,
    maxTokens: 10,
  }
}
