import { siteSpecSchema } from '../spec/schema.js'

export function siteSpecPrompt({ prompt, ctx, designBrief, fallbackSpec, mode = 'generate' }) {
  const actionLine =
    mode === 'edit'
      ? 'Update the canonical site spec so the requested changes are reflected structurally.'
      : 'Generate a canonical site spec that can drive multiple renderers.'

  return {
    system:
      'You are a product architect who outputs only valid JSON. No markdown. No explanation. Keep the result strongly structured and renderer-friendly.',
    user:
      `${actionLine}\n\n` +
      `User prompt:\n${prompt}\n\n` +
      `Existing project context:\n${JSON.stringify(ctx, null, 2)}\n\n` +
      `Design brief:\n${designBrief}\n\n` +
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
      `      "seo": { "title": "string", "description": "string" },\n` +
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
      `  "seo": { "title": "", "description": "" },\n` +
      `  "backendFeatureHints": []\n` +
      `}\n\n` +
      `Rules:\n` +
      `- The output must be directly renderable into HTML, React, and Next.js.\n` +
      `- Prefer structured content and interaction descriptors over raw scripts.\n` +
      `- Include enough pages and sections to satisfy the prompt.\n` +
      `- Do not omit required project metadata.\n` +
      `- Use the fallback structure when uncertain rather than inventing a malformed schema.`,
    temperature: 0.2,
    maxTokens: 4000,
  }
}
