import { getEcommerceGenerationGuidelines, GLOBAL_UI_CRAFT_GUIDELINES } from '../config.js'
import { siteSpecSchema } from '../spec/schema.js'
import { brandProfilePromptBlock } from './brand-profile.js'

export function siteSpecPrompt({
  prompt,
  ctx,
  designBrief,
  fallbackSpec,
  brandProfile = null,
  mode = 'generate',
  hasUserDesignReferences = false,
}) {
  const ecommerceGuidelines = getEcommerceGenerationGuidelines({ hasUserDesignReferences })
  const actionLine =
    mode === 'edit'
      ? 'Update the canonical site spec so the requested changes are reflected structurally.'
      : 'Generate a canonical site spec that can drive multiple renderers.'
  const brandBlock = brandProfilePromptBlock(brandProfile)

  const editThemeRules =
    mode === 'edit'
      ? `\n- Edit mode — theme safety: Whenever you change theme.colors, mood, or palette, you MUST keep strong readable contrast. Body text must stay clearly visible on both background and surface (avoid near-identical luminance between text and background). Prefer coherent light OR dark schemes; do not produce dark gray text on black backgrounds or other low-contrast combinations.\n- Edit mode — navigation: If the user reports header, nav, or link text being hard to see, set theme.colors.text and theme.colors.mutedText so they contrast clearly with theme.colors.background and theme.colors.surface, and keep the home page’s first section as type navbar with non-empty link labels.\n`
      : ''

  const ecommerceRules =
    ctx?.site_type === 'ecommerce' || ctx?.siteType === 'ecommerce'
      ? `\n- Ecommerce (Luxury DTC): ${ecommerceGuidelines} Set siteType to "ecommerce". Include pages and backendFeatureHints appropriate for a Medusa-backed store (catalog, cart, checkout-related flows per Medusa docs). Encode a premium funnel (collection → PDP → cart → checkout) and make the site spec structurally enforce retail depth and luxury craft.\n` +
        `  - Navigation must include shop/collections/categories, search affordance, account, and cart (numeric badge in rendered UIs).\n` +
        `  - Homepage must read as a storefront (not SaaS): promo/benefit strip + store-style header + art-directed hero with heroImage when possible + shop-by-collection/category tiles with images + featured products (6+ items; populate from ecommerce.products when available) + gift set/bundle band + editorial story/learn section + social proof + newsletter + rich multi-column footer with policy links.\n` +
        `  - Collections/category browsing: include at least one dedicated collection/category page (not just a generic shop grid). It should support sorting (optional) and visually consistent product grids.\n` +
        `  - PDP richness: include a product detail page route with gallery, variant selector (size/color), delivery/returns/warranty info near CTA, and cross-sell (related / complete-the-look).\n` +
        `  - Cart & checkout: include cart and checkout pages (or a combined flow) with visible progress indicator, order summary with subtotal/shipping/tax/total, and trust badges. Use guest checkout framing.\n`
      : ''

  const institutionalRules =
    ctx?.site_type === 'institutional' || ctx?.siteType === 'institutional'
      ? `\n- Institutional / PSU-style: Set siteType to "institutional". Include pages such as Home, Notices, Careers, Contact. Use section types notice-board, document-list, and careers-table on the home page where appropriate; prefer clear dated list items, formal tone, accessible contrast, and navbar links to notices and careers routes. Avoid ecommerce sections unless the prompt asks for a store.\n`
      : ''

  const craftRules = `\n- Visual craft: ${GLOBAL_UI_CRAFT_GUIDELINES} Encode spacing and typographic intent in theme.spacing, theme.typography.scale, and theme.radius; keep sections scannable without clutter.\n`

  return {
    system:
      'You are a product architect who outputs only valid JSON. No markdown. No explanation. Keep the result strongly structured and renderer-friendly.',
    user:
      `${actionLine}\n\n` +
      `User prompt:\n${prompt}\n\n` +
      `Existing project context:\n${JSON.stringify(ctx, null, 2)}\n\n` +
      `Design brief:\n${designBrief}\n\n` +
      `${brandBlock ? `${brandBlock}\n` : ''}` +
      `${institutionalRules}` +
      `Required section types (use only when relevant):\n${siteSpecSchema.supportedSectionTypes.join(', ')}\n\n` +
      `Required export targets:\n${siteSpecSchema.supportedExportTargets.join(', ')}\n\n` +
      `Use this fallback structure as a shape reference and minimum completeness baseline:\n${JSON.stringify(fallbackSpec, null, 2)}\n\n` +
      `Output a single valid JSON object that matches this project-level schema:\n` +
      `{\n` +
      `  "projectName": "string",\n` +
      `  "slug": "string",\n` +
      `  "siteType": "string",\n` +
      `  "userPrompt": "string",\n` +
      `  "generatedTimestamp": "ISO string",\n` +
      `  "exportableFrameworks": ["html", "react", "nextjs"],\n` +
      `  "version": "${siteSpecSchema.version}",\n` +
      `  "theme": {\n` +
      `    "colors": { "primary": "", "secondary": "", "accent": "", "background": "", "surface": "", "text": "", "mutedText": "", "border": "" },\n` +
      `    "typography": { "heading": "", "body": "", "mono": "", "scale": { "hero": "", "h1": "", "h2": "", "h3": "", "body": "", "small": "" } },\n` +
      `    "radius": { "sm": "", "md": "", "lg": "" },\n` +
      `    "spacing": { "sectionY": "", "container": "", "gap": "" },\n` +
      `    "shadows": { "soft": "", "card": "" },\n` +
      `    "appearance": { "darkMode": true, "lightMode": false },\n` +
      `    "mood": "string",\n` +
      `    "tailwind": { "primary": "", "secondary": "", "accent": "" }\n` +
      `  },\n` +
      `  "navigation": { "global": [], "footer": [], "ctas": [] },\n` +
      `  "pages": [\n` +
      `    {\n` +
      `      "id": "string",\n` +
      `      "name": "string",\n` +
      `      "route": "/string",\n` +
      `      "title": "string",\n` +
      `      "description": "string",\n` +
      `      "seo": { "title": "string", "description": "string", "keywords": ["string"], "canonicalPath": "/string", "canonicalUrl": "", "ogImage": "", "ogImageAlt": "", "noIndex": false },\n` +
      `      "layoutType": "marketing|app-shell|editorial",\n` +
      `      "sections": [\n` +
      `        {\n` +
      `          "id": "string",\n` +
      `          "type": "one of the supported section types",\n` +
      `          "variant": "string",\n` +
      `          "headline": "string",\n` +
      `          "subheadline": "string",\n` +
      `          "body": "string",\n` +
      `          "items": [],\n` +
      `          "actions": [],\n` +
      `          "fields": [],\n` +
      `          "links": [],\n` +
      `          "interactions": [],\n` +
      `          "styling": {},\n` +
      `          "visibility": {},\n` +
      `          "form": { "successMessage": "", "errorMessage": "", "action": { "type": "", "target": "" } },\n` +
      `          "children": []\n` +
      `        }\n` +
      `      ]\n` +
      `    }\n` +
      `  ],\n` +
      `  "components": [],\n` +
      `  "interactions": [],\n` +
      `  "forms": [],\n` +
      `  "assets": [],\n` +
      `  "seo": { "title": "", "description": "", "siteName": "", "siteUrl": "", "keywords": ["string"], "ogImage": "", "ogImageAlt": "", "twitterCard": "summary_large_image", "locale": "en_US", "robots": "index, follow" },\n` +
      `  "backendFeatureHints": []\n` +
      `}\n\n` +
      `Rules:\n` +
      `- When siteType is ecommerce or the user asks for a carousel/slider/gallery/marquee, expect Swiper-powered product strips in framework exports and matching Swiper markup in static HTML (policy-driven).\n` +
      `- The output must be directly renderable into HTML, React, and Next.js.\n` +
      `- Prefer structured content and interaction descriptors over raw scripts.\n` +
      `- Include enough pages and sections to satisfy the prompt.\n` +
      `- Do not omit required project metadata.\n` +
      `- If the prompt mentions a production domain, preserve it in seo.siteUrl and page canonicals.\n` +
      `- Programmatic SEO: use clean subfolder routes only for indexable pages (no query-string permutations); each indexable page needs a distinct title and description; link hub pages to spokes via navigation or footer.\n` +
      `- Keep page seo.noIndex false for public pages unless the user explicitly asks for private routes.\n` +
      `- For public marketing sites, prefer Home plus 2-4 meaningful secondary pages unless the user explicitly requests a single-page site.\n` +
      `- Secondary pages should be internally linkable through navigation, footer links, or CTAs.\n` +
      `- Homepage copy should support SEO with a clear product headline, descriptive supporting copy, and at least one FAQ section when relevant.\n` +
      `- Use clean title patterns: homepage as "Project Name | Core benefit" and secondary pages as "Topic | Project Name" or "Project Name Topic | Benefit". Avoid keyword stuffing.\n` +
      `- When you include FAQ content, write realistic buyer or user questions rather than placeholder copy.\n` +
      `- When verified brand details are provided, use them for logo/contact/footer/social sections and keep those fields exact.\n` +
      `- Do not invent physical addresses or phone numbers in contact/footer; omit them if not in the prompt or brand block.\n` +
      `- Do not put generator/tool branding strings in any page content.\n` +
      `- Use the fallback structure when uncertain rather than inventing a malformed schema.${craftRules}${ecommerceRules}${editThemeRules}`,
    temperature: 0.2,
    maxTokens: 4000,
  }
}
