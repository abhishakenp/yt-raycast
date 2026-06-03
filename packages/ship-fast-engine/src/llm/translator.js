import { groq } from './groq.js'

// llama-3.3-70b handles Indian language translation well
const TRANSLATION_MODEL = 'llama-3.3-70b-versatile'

/**
 * Extract unique visible text strings from an HTML file.
 * Skips script/style blocks, URLs, numbers-only strings, and short tokens.
 */
function extractTextNodes(html) {
  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')

  const seen = new Set()
  const texts = []
  const re = />([^<]+)</g
  let m
  while ((m = re.exec(clean)) !== null) {
    const text = m[1].trim()
    if (
      text.length < 3 ||
      seen.has(text) ||
      /^[\d\s.,!@#$%^&*()\-_+=[\]{}|;:<>?/\\]*$/.test(text) ||
      text.startsWith('http') ||
      text.startsWith('/') ||
      text.startsWith('#')
    ) continue
    seen.add(text)
    texts.push(text)
  }
  return texts
}

/**
 * Translate an array of English strings to the target Indian language via Groq.
 * Sends a JSON map {text: ''} and expects {text: 'translation'} back.
 */
async function translateTexts(texts, language) {
  if (texts.length === 0) return {}

  const payload = Object.fromEntries(texts.map((t) => [t, '']))

  const result = await groq(JSON.stringify(payload), {
    model: TRANSLATION_MODEL,
    system: `You are a precise translator. You receive a JSON object where each key is an English string and each value is empty. Fill every value with the ${language.name} (${language.nativeName}) translation of its key. Return ONLY valid JSON with no extra text or explanation.`,
    temperature: 0.1,
    maxTokens: 4000,
  })

  if (!result?.content || result.error) return {}

  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {}
  } catch {
    return {}
  }
}

/**
 * Translate the visible text content of an HTML string into the target Indian
 * language using Groq. HTML structure, CSS, and JavaScript are never touched.
 */
export async function translateHtml(html, indiaMode) {
  const { language } = indiaMode
  const texts = extractTextNodes(html)
  if (texts.length === 0) return { content: html }

  const translations = await translateTexts(texts, language)
  const translatedCount = Object.values(translations).filter(Boolean).length
  if (translatedCount === 0) return { content: html, error: 'no translations returned' }

  let translated = html
  for (const [original, replacement] of Object.entries(translations)) {
    if (!replacement || replacement === original) continue
    const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    translated = translated.replace(new RegExp(escaped, 'g'), replacement)
  }

  return { content: translated, translatedCount }
}

/**
 * Translate an array of HTML strings sequentially.
 * Falls back to original HTML if translation fails for any item.
 */
export async function translateHtmlSequential(htmlArray, indiaMode) {
  const out = []
  for (let i = 0; i < htmlArray.length; i++) {
    try {
      const result = await translateHtml(htmlArray[i], indiaMode)
      if (result?.content && !result.error) {
        out.push(result.content)
      } else {
        console.error(`  translation failed for page ${i + 1}: ${result?.error ?? 'empty'} — keeping English`)
        out.push(htmlArray[i])
      }
    } catch (err) {
      console.error(`  translation error for page ${i + 1}: ${err.message} — keeping English`)
      out.push(htmlArray[i])
    }
  }
  return out
}
