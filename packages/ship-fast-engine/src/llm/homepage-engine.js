import { SHIPFAST_HYBRID_ENGINE } from '../config.js'
import { groqHomepage } from './groq.js'
import { generateHybridHomepage, hybridEngineAvailable } from './hybrid-homepage.js'

const LOCAL_BRIEF_RE =
  /\b(restaurant|coffee|roaster|cafe|bakery|portfolio|agency|hotel|wellness|fitness|studio|boutique|local|shop|butchery|zine|print studio)\b/i

const OPS_BRIEF_RE =
  /\b(dashboard|console|monitor|operations|fleet|admin panel|control room|telemetry|incident timeline)\b/i

/**
 * Pick homepage generation strategy for production.
 * - hybrid: Gemini top + Groq tail (default when GEMINI key present)
 * - groq: legacy single-pass Groq homepage (Mobbin-heavy, design refs, or explicit opt-out)
 */
export function resolveHomepageEngineStrategy({
  prompt = '',
  siteType = '',
  hasDesignReferenceUrls = false,
  mobbinAnchor = null,
} = {}) {
  if (!SHIPFAST_HYBRID_ENGINE || !hybridEngineAvailable()) return 'groq'
  if (hasDesignReferenceUrls) return 'groq'
  if (mobbinAnchor?.app && process.env.SHIPFAST_HYBRID_WITH_MOBBIN !== '1') return 'groq'
  if (process.env.SHIPFAST_ENGINE_FAST === '1' && LOCAL_BRIEF_RE.test(String(prompt))) return 'groq'
  if (String(siteType).toLowerCase() === 'dashboard' || OPS_BRIEF_RE.test(String(prompt))) {
    return 'hybrid-app-shell'
  }
  return 'hybrid'
}

/**
 * Unified homepage LLM entry — hybrid with automatic Groq fallback.
 */
export async function generateHomepageHtml(prompt, groqArgs, { engine, specAppend = '', revision = '' } = {}) {
  const strategy = engine || 'groq'
  const [
    imageHints,
    indiaMode,
    brandProfile,
    hasDesignReferenceUrls,
    designRef,
    businessProfile,
    contentPlanRef,
    thinSiteSpecJson,
    mobbinAnchor,
  ] = groqArgs

  if (strategy === 'groq') {
    const result = await groqHomepage(
      prompt,
      imageHints,
      indiaMode,
      brandProfile,
      hasDesignReferenceUrls,
      designRef,
      businessProfile,
      contentPlanRef,
      thinSiteSpecJson,
      mobbinAnchor,
    )
    return { ...result, engine: 'groq' }
  }

  try {
    const hybrid = await generateHybridHomepage(prompt, { specAppend, revision })
    return hybrid
  } catch (err) {
    if (process.env.SHIPFAST_HYBRID_FALLBACK === '0') throw err
    const result = await groqHomepage(
      prompt,
      imageHints,
      indiaMode,
      brandProfile,
      hasDesignReferenceUrls,
      designRef,
      businessProfile,
      contentPlanRef,
      thinSiteSpecJson,
      mobbinAnchor,
    )
    return {
      ...result,
      engine: 'groq',
      hybridFallback: true,
      hybridError: String(err?.message || err),
    }
  }
}
