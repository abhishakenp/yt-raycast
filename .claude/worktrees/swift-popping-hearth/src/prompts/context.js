export function contextPrompt(prompt, designBrief, siteType) {
  const briefBlock = designBrief
    ? `\n\nDesign system reference (use this for mood, colors, typography, and style decisions):\n${designBrief}\n`
    : ''

  return {
    system:
      'You extract structured project context from descriptions. Output ONLY valid JSON. No markdown, no explanation.',
    user:
      `Analyze this project description and extract structured context.\n\n` +
      `Project description:\n${prompt}\n${briefBlock}\nSite type (pre-detected): ${siteType}\n\n` +
      `Output ONLY a valid JSON object (no markdown fences, no explanation) with this exact schema:\n` +
      `{\n` +
      `  "project_name": "string \u2014 short product name",\n` +
      `  "slug": "string \u2014 url-safe slug",\n` +
      `  "tagline": "string \u2014 one-line product tagline",\n` +
      `  "site_type": "${siteType}",\n` +
      `  "pages": ["Home", "..."],\n` +
      `  "entities": ["...data entities like User, Product, Order"],\n` +
      `  "features": ["...backend features like auth, payments, search"],\n` +
      `  "mood": "string \u2014 from design brief if available, else derive from prompt",\n` +
      `  "color_direction": "string \u2014 from design brief colors if available",\n` +
      `  "typography": "string \u2014 font pairing from design brief if available (e.g. Inter + Open Sans)",\n` +
      `  "style_keywords": "string \u2014 key CSS/design keywords from design brief"\n` +
      `}\n\n` +
      `The site_type is "${siteType}". Use it to decide page count:\n` +
      `- saas/ecommerce/marketplace/docs/blog/dashboard/community \u2192 4-8 pages\n` +
      `- landing/portfolio \u2192 just ["Home"]`,
    temperature: 0.2,
    maxTokens: 2000,
  }
}
