import { brandProfilePromptBlock, type BrandProfile } from './brand-profile'

export function contextPrompt(
  prompt: string,
  designBrief: string | null,
  siteType: string,
  brandProfile: BrandProfile | null = null,
): { system: string; user: string; temperature: number; maxTokens: number } {
  const briefBlock = designBrief
    ? `\n\nDesign system reference (use this for mood, colors, typography, and style decisions):\n${designBrief}\n`
    : ''
  const brandBlock = brandProfilePromptBlock(brandProfile)

  return {
    system:
      'You extract structured project context from descriptions. Output ONLY valid JSON. No markdown, no explanation.',
    user:
      `Analyze this project description and extract structured context.\n\n` +
      `Project description:\n${prompt}\n${briefBlock}${brandBlock}\nSite type (pre-detected): ${siteType}\n\n` +
      `Output ONLY a valid JSON object (no markdown fences, no explanation) with this exact schema:\n` +
      `{\n` +
      `  "project_name": "string — short product name",\n` +
      `  "slug": "string — url-safe slug",\n` +
      `  "tagline": "string — one-line product tagline",\n` +
      `  "site_url": "string — absolute production URL if the prompt mentions a domain, else empty",\n` +
      `  "site_type": "${siteType}",\n` +
      `  "pages": ["Home", "..."],\n` +
      `  "entities": ["...data entities like User, Product, Order"],\n` +
      `  "features": ["...backend features like auth, payments, search"],\n` +
      `  "mood": "string — from design brief if available, else derive from prompt",\n` +
      `  "color_direction": "string — from design brief colors if available",\n` +
      `  "typography": "string — font pairing from design brief if available (e.g. Inter + Open Sans)",\n` +
      `  "style_keywords": "string — key CSS/design keywords from design brief"\n` +
      `}\n\n` +
      `When verified brand details are present, use them for project_name, tagline, and site_url rather than guessing. Do not invent contact details.\n` +
      `The site_type is "${siteType}". Use it to decide page count:\n` +
      `- ecommerce → 6-10 pages (e.g. Shop, product collections, Cart, About, Contact, FAQ, Learn/Blog) — real DTC breadth\n` +
      `- institutional → 4-8 pages (e.g. Home, Notices, Careers, Contact, About) — public-sector information architecture\n` +
      `- saas/marketplace/docs/blog/dashboard/community → 4-8 pages\n` +
      `- game → just ["Home"]\n` +
      `- landing/portfolio → 3-5 pages unless the user explicitly asks for a one-page site\n` +
      `- For public marketing sites, prefer crawlable secondary pages such as Pricing, FAQ, About, Docs, Work, or Contact when they fit the prompt`,
    temperature: 0.2,
    maxTokens: 2000,
  }
}
