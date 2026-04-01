import { RUNPOD_API_URL, RUNPOD_API_KEY, RUNPOD_MODEL, LLM_CONFIG } from '../config.js'

const HEX1_TIMEOUT_MS = 180_000 // 3 minutes — accounts for cold starts

async function hex1Fetch({ system, prompt, temperature = LLM_CONFIG.default.temperature, maxTokens = LLM_CONFIG.default.maxTokens }) {
  if (!RUNPOD_API_URL) throw new Error('RUNPOD_API_URL not set')
  if (!RUNPOD_API_KEY) throw new Error('RUNPOD_API_KEY not set')

  const messages = [
    ...(system ? [{ role: 'system', content: system }] : []),
    { role: 'user', content: prompt },
  ]

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), HEX1_TIMEOUT_MS)

  let res
  try {
    res = await fetch(`${RUNPOD_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RUNPOD_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: RUNPOD_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false,
      }),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`hex-1 RunPod request failed (${res.status}): ${text.slice(0, 200)}`)
  }

  const data = await res.json()
  if (data.error) return { content: '', error: data.error.message ?? String(data.error), tps: 0 }

  const usage = data.usage ?? {}
  const inputTokens = usage.prompt_tokens ?? 0
  const outputTokens = usage.completion_tokens ?? 0

  return {
    content: data.choices?.[0]?.message?.content ?? '',
    tps: 0,
    inputTokens,
    outputTokens,
    model: RUNPOD_MODEL,
    cost: 0,
  }
}

export async function hex1(prompt, opts = {}) {
  return hex1Fetch({ prompt, ...opts })
}

export async function hex1Homepage(prompt, indiaMode) {
  const { language } = indiaMode
  const langName = language?.name ?? 'Hindi'
  const nativeName = language?.nativeName ?? ''
  const notLanguages = language?.notLanguages ?? ''
  const fontFamily = language?.fontFamily ?? 'Noto Sans Devanagari, sans-serif'
  const googleFont = fontFamily.split(',')[0].trim()

  return hex1Fetch({
    system: `You are a world-class frontend engineer specialising in Indian-language websites. Output ONLY a complete, self-contained HTML file. No markdown, no explanation, no code fences.

LANGUAGE: Generate ALL visible text content in ${langName} (${nativeName}, BCP-47 code: ${language?.code ?? 'hi'}). This is ${notLanguages}. This includes headings, subtitles, button labels, nav links, feature descriptions, pricing copy, footer text — everything the user reads. Do NOT leave any user-visible text in English. Do NOT use any other Indian language — specifically ${notLanguages}.

FONT: Load "${googleFont}" from Google Fonts. Apply it as the primary font-family across the entire page so ${langName} script renders correctly.

DESIGN: Use a modern Indian-inspired design system:
- Color palette rooted in Indian tradition: saffron (#FF9933), deep red (#9B2335), gold (#FFD700), India green (#138808), peacock blue (#003580). Choose 1–2 as primary accent.
- Subtle decorative touches: thin mandala-inspired borders, paisley motif dividers, lotus icon accents — tasteful, not loud.
- Dark theme: deep dark background, lighter surfaces, one vibrant accent.
- Tailwind CSS via CDN. Lucide icons via CDN (<script src="https://unpkg.com/lucide@latest"></script>, call lucide.createIcons() after render, use <i data-lucide="icon-name"></i>). No inline SVGs, no emojis.
- Vanilla JS only. No frameworks.

CLASSIFY: If the prompt describes functionality (app, tool, dashboard), build an APPLICATION UI. If it describes a business/product/service, build a LANDING PAGE.

── APPLICATION UI ──
Real interactive app (sidebar + main content). All UI driven by a single JS state object with a render() function.

── LANDING PAGE ──
- Hero: pill badge + massive headline + subtitle + 1 CTA (all in ${langName})
- Sections: features → pricing → testimonials → CTA → footer
- Typography-first, centered max-w-4xl layout, 2-column grids, py-20 spacing

Output ONLY the complete HTML file.`,
    prompt,
    temperature: LLM_CONFIG.homepage.temperature,
    maxTokens: LLM_CONFIG.homepage.maxTokens,
  })
}

export async function hex1Parallel(calls, opts = {}) {
  return Promise.all(
    calls.map((call) =>
      hex1Fetch({
        prompt: call.prompt,
        system: call.system,
        temperature: call.temperature ?? opts.temperature ?? LLM_CONFIG.parallel.temperature,
        maxTokens: call.maxTokens ?? opts.maxTokens ?? LLM_CONFIG.parallel.maxTokens,
      }),
    ),
  )
}

/**
 * Extract unique visible text strings from an HTML file.
 * Skips script/style blocks, URLs, numbers-only strings, and very short tokens.
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
 * Ask hex-1 to translate a batch of plain text strings.
 * Sends a JSON object {text: ''} and expects {text: 'translation'} back.
 */
async function hex1TranslateTexts(texts, language) {
  if (texts.length === 0) return {}

  const payload = Object.fromEntries(texts.map((t) => [t, '']))

  const result = await hex1Fetch({
    system: `You are a translator. You receive a JSON object where each key is an English string and each value is empty. Fill every value with the ${language.name} (${language.nativeName}) translation of its key. Return ONLY the JSON object. No explanation.`,
    prompt: JSON.stringify(payload),
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
 * language. Extracts text nodes, translates them, injects back.
 * HTML structure, CSS, and JavaScript are never touched.
 */
export async function hex1Translate(html, indiaMode) {
  const { language } = indiaMode
  const texts = extractTextNodes(html)
  if (texts.length === 0) return { content: html }

  const translations = await hex1TranslateTexts(texts, language)
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
export async function hex1TranslateParallel(htmlArray, indiaMode) {
  const out = []
  for (let i = 0; i < htmlArray.length; i++) {
    try {
      const result = await hex1Translate(htmlArray[i], indiaMode)
      if (result?.content && !result.error) {
        out.push(result.content)
      } else {
        console.error(`  hex-1 translation failed for page ${i + 1}: ${result?.error ?? 'empty'} — keeping English`)
        out.push(htmlArray[i])
      }
    } catch (err) {
      console.error(`  hex-1 translation error for page ${i + 1}: ${err.message} — keeping English`)
      out.push(htmlArray[i])
    }
  }
  return out
}

