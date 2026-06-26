Output a single valid JSON object that matches this project-level schema:

{
"projectName": "string",
"slug": "string",
"siteType": "string",
"userPrompt": "string",
"generatedTimestamp": "ISO string",
"exportableFrameworks": ["html", "react", "nextjs"],
"version": "{{SITE_SPEC_VERSION}}",
"planMeta": {
"schemaRevision": "{{SITE_SPEC_VERSION}}",
"contentRefId": "string — archetype id matching resolution",
"contentRefStashName": "string — content plan file basename",
"archetypePresetKey": "string",
"resolutionReason": "keyword|site-base|fallback|workspace",
"qualityChecklist": ["concrete verifiable criteria"]
},
"theme": {
"colors": { "primary": "", "secondary": "", "accent": "", "background": "", "surface": "", "text": "", "mutedText": "", "border": "" },
"typography": { "heading": "", "body": "", "mono": "", "scale": { "hero": "", "h1": "", "h2": "", "h3": "", "body": "", "small": "" } },
"radius": { "sm": "", "md": "", "lg": "" },
"spacing": { "sectionY": "", "container": "", "gap": "" },
"shadows": { "soft": "", "card": "" },
"appearance": { "darkMode": true, "lightMode": false },
"mood": "string",
"tailwind": { "primary": "", "secondary": "", "accent": "" }
},
"navigation": { "global": [], "footer": [], "ctas": [] },
"pages": [
{
"id": "string",
"name": "string",
"route": "/string",
"title": "string",
"description": "string",
"seo": { "title": "string", "description": "string", "keywords": ["string"], "canonicalPath": "/string", "canonicalUrl": "", "ogImage": "", "ogImageAlt": "", "noIndex": false },
"layoutType": "marketing|app-shell|editorial",
"pageRole": "string e.g. conversion|docs|checkout|citizen-service",
"contentGoals": ["short strings describing what this page must accomplish"],
"sections": [
{
"id": "string",
"type": "one of the supported section types",
"variant": "string",
"headline": "string",
"subheadline": "string",
"body": "string",
"contentBlocks": [{ "id": "string", "kind": "paragraph|list|quote|stat", "text": "string", "items": ["string"] }],
"items": [],
"actions": [],
"fields": [],
"links": [],
"interactions": [],
"styling": {},
"visibility": {},
"form": { "successMessage": "", "errorMessage": "", "action": { "type": "", "target": "" } },
"children": []
}
]
}
],
"components": [],
"interactions": [],
"forms": [],
"assets": [],
"seo": { "title": "", "description": "", "siteName": "", "siteUrl": "", "keywords": ["string"], "ogImage": "", "ogImageAlt": "", "twitterCard": "summary_large_image", "locale": "en_US", "robots": "index, follow" },
"businessProfile": {
"customerModel": "e.g. B2B SaaS | B2C DTC | multi-sided platform | nonprofit | public sector",
"industry": "concrete industry label (not generic technology)",
"industryCode": { "system": "NACE|NAICS", "code": "62.01", "label": "Computer programming services" },
"legalForm": "optional — when inferable (LLC, BV, GmbH)",
"jurisdiction": "EU | United States | UK | country name",
"segment": "SMB | mid-market | enterprise | growth",
"revenueModel": "subscription | usage | transactional | grants | mixed",
"taxFootprint": "high-level invoicing/VAT hint for marketing copy tone — no fake IDs",
"trustSignals": ["optional strings e.g. SOC2 if prompt mentions"]
},
"backendFeatureHints": []
}

Infer businessProfile from the user prompt and siteType (and regional hints). Prefer NACE Rev. 2 codes for EU-facing businesses and NAICS when the business is clearly US-centric. Stay truthful: omit legalForm rather than inventing a registration. Align customerModel with retail vs B2B vs institutional vs nonprofit signals.

Every page MUST include pageRole and at least one contentGoal. Every non-trivial section SHOULD include contentBlocks when long-form copy improves renderer and LLM page output.
