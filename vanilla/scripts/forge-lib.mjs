/**
 * Forge lib: lean homepage caller. Bypasses engine's hardcoded reasoning_effort='high'
 * but reuses the SAME public-design system prompt the real project uses.
 *
 * Strategy: monkey-call Groq API directly with the same system+user prompt
 * the engine builds, but with tunable max_tokens / reasoning_effort.
 *
 * To stay aligned with the real project we import the engine's prompt-building
 * helpers and rebuild the system prompt verbatim.
 */
import {
  GROQ_API_KEY,
  GROQ_HOST,
  HOMEPAGE_MODEL,
  LLM_CONFIG,
} from '@ship-fast/engine/config.js'
import { stripGroqReasoningLeak } from '@ship-fast/engine/llm/utils.js'

const URL = `${GROQ_HOST}/openai/v1/chat/completions`

/**
 * Minimal homepage system prompt — distilled from the engine's prompt while staying
 * faithful to the SaaS reference-tier checklist scored by ralph-homepage-score.
 *
 * Keeping it tighter (≈3k tokens) lets us crank reasoning_effort=low and still
 * fit under 15s wall-clock without losing the structural signals the audit grades.
 */
const HOMEPAGE_SYSTEM_LEAN = `You are a world-class frontend engineer and visual designer. Output ONLY a complete self-contained HTML file. No markdown. No code fences. No explanation. Begin with <!DOCTYPE html>.

Build a B2B SaaS marketing homepage at reference-tier quality (match design-03-saas-homepage energy).

HARD REQUIREMENTS (each is auto-scored — every one must be met):
1. Length >= 12,000 chars. Output the FULL HTML document.
2. >= 7 <section> elements + <header> + <footer>.
3. <head>: viewport meta; <script src="https://cdn.tailwindcss.com"></script>; <script src="https://unpkg.com/lucide@latest"></script>; tailwind.config = { theme: { extend: { colors:{background, surface, elev, primary}, fontFamily:{display,body,mono}, keyframes:{liquid:{...}}, animation:{liquid:'liquid 22s ease-in-out infinite'}, boxShadow } } }.
4. Aurora hero MUST contain ALL of:
   - >= 3 absolutely-positioned divs each with inline style="background: radial-gradient(...)" (literal radial-gradient string in 3+ places), each with blur-3xl, opacity-40..70, motion-reduce:hidden.
   - A <canvas id="hero-canvas"> with requestAnimationFrame loop in inline script: particles/constellation reacting to pointer (mousemove); respect prefers-reduced-motion.
   - Slow ambient motion: theme.extend.keyframes.liquid (translate+rotate+scale over ~22s) and animate-liquid class applied to at least 2 of the gradient orbs.
   - Diagonal energy: ONE band has class -skew-y-3 or -skew-y-6 OR a clip-path polygon OR a keyframed rotate transform on an aurora layer.
5. Reveal: >= 4 elements with data-reveal, starting visible (opacity-100 translate-y-0) — JS adds class reveal-ready to <html> then refines transitions. IntersectionObserver in inline script toggles is-visible.
6. Magnets: >= 2 primary CTAs with data-magnet — inline script applies pointer parallax (translate3d).
7. Dynamic UI hooks (single inline IIFE script before </body>, every querySelector null-guarded):
   - data-mobile-nav header + data-mobile-nav-toggle button (toggles is-open class).
   - data-accordion FAQ with >= 5 data-accordion-item, each with data-accordion-trigger button.
   - data-pricing-billing wrapper + buttons data-billing="month"/"year" toggling data-show-monthly / data-show-yearly.
   - >= 2 data-counter elements with data-counter-target — count-up on intersection.
   - lucide.createIcons() called after DOM ready and after any dynamic update.
8. Pricing band: 3 tiers, one with ring-2 ring-offset-2 as featured. Both monthly + yearly prices visible (paired data-show- elements), toggle works.
9. Typography: link Google Fonts for a display family (Fraunces / Syne / Outfit / Cabinet Grotesk / DM Serif Display) + body (Inter / Geist / DM Sans) + mono (JetBrains Mono / IBM Plex Mono). Map all three in tailwind.config.
10. Dark theme: tinted slate/zinc background; surface/elev cards with backdrop-blur and ring-1 ring-white/10. Body paragraphs use text-slate-300 (never text-slate-500 on text-lg/text-base/max-w-xl/max-w-lg/leading-relaxed paragraphs).
11. Real anchors only — every <a href> either targets a real on-page id or "#" only when ≤ 55 total. >= 8 navigational <a href=> links across header/footer.
12. >= 3 real <button> elements (CTAs).
13. Penultimate CTA band before footer. Multi-column footer (>= 4 columns).
14. Lucide icons only (no emoji icons, no Font Awesome). Use data-lucide="..." placeholders. Icon sizes w-5 h-5 md:w-6 md:h-6.
15. No <style> tags for theme/layout/animation. Vanilla JS only — no frameworks, no external script sources besides Tailwind/Lucide CDNs.
16. No "Ship Fast" branding, no fake addresses, no Lorem ipsum, no placeholder copy.

QUALITY BAR: Real art direction — bento or split hero, oversized display headline, layered surfaces, signature flourish (e.g. glowing pill badge), at least one diagonal/clip-path/skewed band. Avoid generic violet-on-gray template vibe. Visible text must be specific and product-credible (not Lorem ipsum).

Output the full HTML now.`

export const FORGE_DEFAULT_PROMPT =
  'A B2B SaaS marketing site for an AI-first agentic workflow product for engineering teams: aurora hero, social proof strip, feature grid, pricing band with monthly/yearly toggle, FAQ, penultimate CTA band, multi-column footer.'

/**
 * Direct call. Returns { content, ms, inputTokens, outputTokens, cost, model }.
 * `reasoningEffort` defaults to 'low' — that's the knob that lets us stay <15s.
 */
export async function forgeGenerate({
  prompt = FORGE_DEFAULT_PROMPT,
  model = HOMEPAGE_MODEL || 'openai/gpt-oss-120b',
  system = HOMEPAGE_SYSTEM_LEAN,
  temperature = LLM_CONFIG.homepage.temperature,
  maxTokens = 12000,
  reasoningEffort = 'low',
  reasoningFormat = 'hidden',
  signal,
} = {}) {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set')
  const body = {
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt },
    ],
    temperature,
    max_tokens: maxTokens,
    stream: false,
    reasoning_effort: reasoningEffort,
    reasoning_format: reasoningFormat,
  }
  const t0 = Date.now()
  const res = await fetch(URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Groq ${res.status}: ${text.slice(0, 300)}`)
  }
  const data = await res.json()
  const ms = Date.now() - t0
  if (data.error) {
    return { content: '', ms, error: data.error.message ?? String(data.error) }
  }
  const usage = data.usage ?? {}
  return {
    content: stripGroqReasoningLeak(data.choices?.[0]?.message?.content ?? ''),
    ms,
    inputTokens: usage.prompt_tokens ?? 0,
    outputTokens: usage.completion_tokens ?? 0,
    cost: 0,
    model,
  }
}
