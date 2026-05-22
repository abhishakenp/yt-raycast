import { htmlLooksDegenerate } from './homepage-degeneracy.js'

/**
 * Verification tuned for Gemini-top + Groq-tail hybrid pages.
 * Skips Nova motion hooks (data-reveal, canvas hero) that the hybrid contract bans.
 */
export function passesHybridHomepageVerification(html, prompt = '', siteType = '') {
  const s = String(html || '')
  if (!s.trim()) {
    return { ok: false, feedback: 'Emit a full single-file homepage with Tailwind CDN and multiple sections.' }
  }

  if (htmlLooksDegenerate(s, { prompt })) {
    return {
      ok: false,
      feedback:
        'Revise: valid HTML structure, no repetition walls, full-width section bands with real copy — avoid narrow-column collapse.',
    }
  }

  const reasons = []
  const sections = (s.match(/<section\b/gi) || []).length
  const minSections = String(siteType || '').toLowerCase() === 'docs' ? 4 : 5
  if (sections < minSections) reasons.push(`need >=${minSections} <section> bands (have ${sections})`)
  if (!/cdn\.tailwindcss\.com/i.test(s)) reasons.push('missing cdn.tailwindcss.com')
  if (s.length < 8000) reasons.push(`html length ${s.length} (target >= 8000)`)
  if (!/<nav\b/i.test(s)) reasons.push('missing sticky nav')
  if (!/<footer\b/i.test(s)) reasons.push('missing footer')

  if (reasons.length) {
    return { ok: false, feedback: `Revise the hybrid homepage: ${reasons.join('; ')}.` }
  }
  return { ok: true, feedback: '' }
}
