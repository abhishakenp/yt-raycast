export function siteTypePrompt(prompt) {
  return {
    system: 'Classify websites into one category. Output ONLY the single word. Nothing else.',
    user:
      `Classify this project:\n"${prompt.slice(0, 300)}"\n\n` +
      'Reply with ONLY one word from this list, nothing else:\n' +
      'saas, landing, portfolio, ecommerce, blog, docs, dashboard, marketplace, community',
    temperature: 0,
    maxTokens: 20,
  }
}
