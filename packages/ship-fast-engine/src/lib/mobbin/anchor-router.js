/**
 * inferMobbinAnchor — single Groq call that maps a user brief + project
 * context to ONE app in the DNA bank. Returns null on any failure so the
 * production pipeline falls through to the vanilla path cleanly.
 *
 * Cost target: ~500 input + 80 output tokens, gpt-oss-120b low effort, ~600ms.
 */
import { SHIPFAST_MOBBIN } from '../../config.js'
import { groq } from '../../llm/groq.js'
import { listDnaAppNames, resolveDna, resolveCopyExamples } from './dna.js'

export function isMobbinEnabled() {
  return SHIPFAST_MOBBIN
}

const ECOMMERCE_BRIEF_RE =
  /\b(ecommerce|e-commerce|online store|web store|shop|storefront|retail|boutique|catalog|merchandise|product grid|add to cart|shopping cart|gadget|gadgets|early adopter|consumer tech|tech store|buy now|shop now|free shipping|wishlist|pdp|sku)\b/i

const FINTECH_ANCHOR_RE = /^(Stripe|Mercury|Plaid)$/i
const GENERIC_SAAS_ANCHOR_RE = /^(Linear|Vercel|Notion|Sentry|Posthog|HubSpot|Cloudflare|Supabase)$/i

function normalizeBriefText(brief = '', projectContext = {}) {
  return [
    brief,
    projectContext.project_name,
    projectContext.tagline,
    projectContext.site_type,
    projectContext.style_keywords,
    ...(projectContext.features || []),
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

/** Block anchors whose DNA contradicts the user's actual product category. */
export function anchorMatchesBrief(brief, projectContext = {}, app = '') {
  const name = String(app || '').trim()
  if (!name) return false
  const text = normalizeBriefText(brief, projectContext)
  const ecommerce =
    ECOMMERCE_BRIEF_RE.test(text) || String(projectContext.site_type || '').toLowerCase() === 'ecommerce'

  if (ecommerce && (FINTECH_ANCHOR_RE.test(name) || GENERIC_SAAS_ANCHOR_RE.test(name))) return false

  if (/\b(gadget|gadgets|consumer tech|tech store|product comparison|interactive demo)\b/i.test(text)) {
    if (FINTECH_ANCHOR_RE.test(name) || GENERIC_SAAS_ANCHOR_RE.test(name)) return false
  }

  return true
}

const SYSTEM = `You are an expert design router. Given a user brief for a website and a project context, pick the ONE app from the supplied list whose marketing-site DNA (palette / typography / layout / copy register) is the closest natural fit.

Rules:
- You MUST return JSON: {"app": "<name>", "category": "<short label>", "reason": "<one sentence>"}
- "app" must be one of the names from the list, EXACTLY as written (case + spelling matter).
- If no app fits well (the brief is wildly off any anchor's territory), return {"app": null, "category": null, "reason": "<one sentence on why nothing fits>"}.
- Prefer matches based on register and product type, NOT brand prestige. A travel brief should pick Airbnb or Hopper, not Apple. A B2B observability tool should pick Linear / Vercel / Sentry, not Notion.
- One sentence in "reason" — name the dimension that drove the pick.

PALETTE BIAS (important):
Warm-accent anchors carry saturated orange / coral / red / amber / pink brand colors and should ONLY be picked when the brief EXPLICITLY signals a domain those brands occupy. Default to cool / neutral anchors otherwise — same registers exist on the cool side.

  Warm-accent anchors — pick ONLY when the brief explicitly maps to their domain:
    - Headspace / Calm           → only for meditation, mindfulness, sleep, mental-health apps
    - Nike / Lululemon / Allbirds → only for athletic apparel, sport, fitness apparel
    - Patagonia / Glossier        → only for outdoor / activism brands, beauty brands
    - Airbnb / Hopper             → only for travel, stays, hospitality, booking
    - Substack / MasterClass / Vogue / NYT → only for publishing, editorial, magazine, courses
    - Cloudflare / HubSpot / Anthropic    → only for infrastructure-CDN / marketing-CRM / AI-research specifically (NOT generic SaaS — for generic SaaS use Linear/Stripe/Vercel)

  Cool / neutral anchors — DEFAULT picks for ambiguous, generic, B2B SaaS, dev-tool, infra, fintech, data, productivity, design-tool briefs:
    - Linear, Vercel, Stripe, Notion, Apple, Cursor, Sentry, Mercury, Figma, Supabase, Posthog, OpenAI, Loom, GitHub, Databricks

  Heuristic: if the brief uses words like "SaaS", "B2B", "platform", "tool", "dashboard", "API", "developer", "engineering", "infrastructure", "analytics", "workspace", "tech", or "polished/clean/professional" without a domain-warm signal — pick a COOL anchor. Generic "homepage for X" with no warm-domain signal should ALSO go cool.

  Anti-pattern: do NOT pick HubSpot for any generic marketing/SaaS brief just because it mentions "client logos" or "conversions" — pick Linear/Stripe/Vercel/Notion instead. HubSpot is reserved for actual marketing-CRM products.
  Anti-pattern: do NOT pick Cloudflare for generic infra/SaaS — pick Vercel or Supabase instead. Cloudflare is reserved for actual CDN/edge-networking products.
  Anti-pattern: do NOT pick Stripe/Mercury/Plaid for ecommerce, retail, gadget shops, product catalogs, or consumer product stores — even if the brief mentions "checkout" or "secure payments". Those are store UX concerns, not fintech marketing DNA. For ecommerce/retail/gadget briefs pick Apple, Nike, Allbirds, Glossier, or return null if none fit.`

function categoryOf(app) {
  const norm = app.toLowerCase()
  if (/airbnb|hopper/.test(norm)) return 'Travel & Hospitality'
  if (/patagonia|nike|allbirds|glossier|lululemon|apple/.test(norm)) return 'Consumer & Retail'
  if (/headspace|calm/.test(norm)) return 'Wellness'
  if (/spotify|masterclass|substack|nyt|vogue/.test(norm)) return 'Media & Editorial'
  if (/linear|vercel|github|cursor|sentry/.test(norm)) return 'Developer Tools'
  if (/openai|anthropic|elevenlabs/.test(norm)) return 'AI'
  if (/notion|loom/.test(norm)) return 'Productivity'
  if (/stripe|mercury|plaid/.test(norm)) return 'Finance'
  if (/figma/.test(norm)) return 'Design'
  if (/hubspot|intercom|segment/.test(norm)) return 'Marketing'
  if (/posthog|databricks/.test(norm)) return 'Data & Analytics'
  if (/cloudflare|supabase|okta/.test(norm)) return 'Infrastructure'
  return 'Other'
}

/**
 * @param {object} params
 * @param {string} params.brief - user prompt
 * @param {object} [params.projectContext] - parsed project-context.json
 * @returns {Promise<null | {app: string, category: string, dna: object, copyExamples: object|null, accents: string[], reason: string}>}
 */
export async function inferMobbinAnchor({ brief, projectContext = {} } = {}) {
  if (!SHIPFAST_MOBBIN) return null
  if (!brief || typeof brief !== 'string' || brief.trim().length < 8) return null

  const appNames = listDnaAppNames()
  if (!appNames.length) return null

  const ctxParts = []
  if (projectContext.project_name) ctxParts.push(`project_name: ${projectContext.project_name}`)
  if (projectContext.tagline) ctxParts.push(`tagline: ${projectContext.tagline}`)
  if (projectContext.site_type) ctxParts.push(`site_type: ${projectContext.site_type}`)
  if (projectContext.mood) ctxParts.push(`mood: ${projectContext.mood}`)
  if (projectContext.style_keywords) ctxParts.push(`style_keywords: ${projectContext.style_keywords}`)
  if (projectContext.color_direction) ctxParts.push(`color_direction: ${projectContext.color_direction}`)

  const userPrompt = `BRIEF: ${brief.trim()}

PROJECT CONTEXT:
${ctxParts.length ? ctxParts.join('\n') : '(no additional context)'}

AVAILABLE ANCHORS (pick one):
${appNames.join(', ')}

Return JSON only.`

  let result
  try {
    result = await groq(userPrompt, {
      model: 'openai/gpt-oss-120b',
      system: SYSTEM,
      temperature: 0.2,
      maxTokens: 200,
      reasoningEffort: 'low',
      responseFormat: { type: 'json_object' },
    })
  } catch (e) {
    return null
  }
  if (!result?.content || result.error) return null

  let parsed
  try {
    parsed = JSON.parse(result.content)
  } catch {
    return null
  }
  if (!parsed?.app || typeof parsed.app !== 'string') return null
  if (!anchorMatchesBrief(brief, projectContext, parsed.app)) return null

  const dna = resolveDna(parsed.app)
  if (!dna) return null

  const copyExamples = resolveCopyExamples(parsed.app)
  const accents = Array.isArray(dna.accents) ? dna.accents.filter((h) => /^#[0-9a-f]{6}$/i.test(h)) : []

  return {
    app: dna._bankApp || parsed.app,
    category: parsed.category || categoryOf(parsed.app),
    dna,
    copyExamples,
    accents,
    palette: accents,
    reason: parsed.reason || '',
  }
}
