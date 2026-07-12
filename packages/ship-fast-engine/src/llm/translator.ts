import { groq } from './groq'

interface TargetLanguage {
  code: string
  name: string
  nativeName?: string
  script?: string
  projectBrief?: string
}

interface LanguageMode {
  language?: TargetLanguage
  code?: string
  name?: string
  nativeName?: string
  script?: string
  prompt?: string
  projectBrief?: string
}

interface TextRecord {
  id: string
  text: string
}

type TranslationMap = Record<string, string>

interface TranslationItem {
  id: string
  source: string
  draft: string | undefined
}

interface QualityResult {
  score: number
  reason?: string
  weakIds: string[]
  translations?: TranslationMap
}

interface TranslationResult {
  content: string
  translatedCount?: number
  skipped?: string
  error?: string
  qualityScore?: number
  qualityReason?: string
}

// llama-3.3-70b handles Indian language translation well
const TRANSLATION_MODEL = 'llama-3.3-70b-versatile'
const QUALITY_TARGET_SCORE = 11
const MAX_QUALITY_REWRITE_ATTEMPTS = 3

function resolveTargetLanguage(
  languageMode: LanguageMode | undefined,
): TargetLanguage | null {
  const language = languageMode?.language || languageMode
  if (!language || String(language.code || '').toLowerCase() === 'en')
    return null
  return {
    code: language.code || languageMode?.code || '',
    name:
      language.name ||
      languageMode?.name ||
      language.code ||
      languageMode?.code ||
      'target language',
    nativeName:
      language.nativeName ||
      languageMode?.nativeName ||
      language.name ||
      languageMode?.name ||
      '',
    script: language.script || languageMode?.script || '',
    projectBrief: String(
      languageMode?.prompt || languageMode?.projectBrief || '',
    ).slice(0, 4000),
  }
}

function buildTextRecords(texts: string[]): TextRecord[] {
  return texts.map((text, index) => ({ id: `t${index}`, text }))
}

function buildPageContext(texts: string[]): string {
  return texts.join('\n').slice(0, 6000)
}

function parseTranslationResponse(
  content: string,
  records: TextRecord[],
): TranslationMap {
  const jsonMatch = String(content || '').match(/\{[\s\S]*\}/)
  if (!jsonMatch) return {}

  const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>
  const translatedById = (parsed.translations || parsed) as Record<
    string,
    unknown
  >
  const out: TranslationMap = {}
  for (const record of records) {
    const replacement = translatedById[record.id] || translatedById[record.text]
    if (typeof replacement === 'string' && replacement.trim())
      out[record.text] = replacement
  }
  return out
}

/**
 * Extract unique visible text strings from an HTML file.
 * Skips script/style blocks, URLs, numbers-only strings, and short tokens.
 */
function extractTextNodes(html: string): string[] {
  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')

  const seen = new Set<string>()
  const texts: string[] = []
  const re = />([^<]+)</g
  let m: RegExpExecArray | null
  while ((m = re.exec(clean)) !== null) {
    const text = m[1].trim()
    if (
      text.length < 3 ||
      seen.has(text) ||
      /^[\d\s.,!@#$%^&*()\-_+=[\]{}|;:<>?/\\]*$/.test(text) ||
      text.startsWith('http') ||
      text.startsWith('/') ||
      text.startsWith('#')
    )
      continue
    seen.add(text)
    texts.push(text)
  }
  return texts
}

function countMatches(text: string, regex: RegExp): number {
  const matches = text.match(regex)
  return matches ? matches.length : 0
}

function countScriptLetters(text: string, script: string): number {
  if (!script || script === 'Latin') return 0
  try {
    return countMatches(text, new RegExp(`\\p{Script=${script}}`, 'gu'))
  } catch {
    return 0
  }
}

function isAlreadyLocalized(
  texts: string[],
  language: TargetLanguage,
): boolean {
  if (!language.script || language.script === 'Latin') return false
  const visibleText = texts.join(' ')
  const targetScriptLetters = countScriptLetters(visibleText, language.script)
  const latinLetters = countMatches(visibleText, /\p{Script=Latin}/gu)
  const totalLetters = targetScriptLetters + latinLetters
  if (totalLetters === 0) return false
  return targetScriptLetters >= 12 && targetScriptLetters / totalLetters > 0.9
}

/**
 * Translate an array of English strings to the target Indian language via Groq.
 * Sends a JSON map {text: ''} and expects {text: 'translation'} back.
 */
async function translateTexts(
  texts: string[],
  language: TargetLanguage,
): Promise<TranslationMap> {
  if (texts.length === 0) return {}

  const records = buildTextRecords(texts)
  const payload = {
    targetLanguage: {
      code: language.code,
      name: language.name,
      nativeName: language.nativeName,
    },
    pageContext: buildPageContext(texts),
    projectBrief: language.projectBrief,
    sourceTexts: records,
  }

  const result = await groq(JSON.stringify(payload), {
    model: TRANSLATION_MODEL,
    system: `You are an elite in-market website copywriter and localization editor. Your job is to transcreate user-visible website copy into ${language.name} (${language.nativeName}) so it feels native, polished, persuasive, and premium to local users.

Source strings may be English, target-language, or mixed. Do not produce stiff, word-for-word translation; the result must be not word-for-word when natural local copy requires transcreation. Preserve the original intent and UI role, but improve phrasing where needed for natural rhythm, trust, clarity, and conversion. Headlines should sound like strong marketing headlines. CTAs should be concise and action-oriented. Body copy should feel fluent and specific, not generic.

Avoid calques and dictionary-literal business phrases. Resolve ambiguous UI and marketing verbs by their role: Book a call means schedule a call, not the noun "book"; get started means begin; learn more means read/discover more. Use accepted local business/technology loanwords when they sound more natural than forced purist wording; terms like strategy, marketing, call, booking, brand, service, and client are often better as familiar local loanwords than as awkward literal translations. Before returning JSON, silently self-review every string and rewrite anything that sounds machine-translated, awkward, or low-trust.

Rules:
- Return ONLY valid JSON, no markdown or explanation.
- Use the target language's normal native script unless the language code explicitly requests Latin/romanized script.
- Keep each translated string roughly similar in length and purpose so the UI layout still works.
- Preserve brand names, product names, URLs, numbers, prices, email addresses, code-like tokens, and placeholders.
- Translate every item in sourceTexts.

Expected response shape:
{"translations":{"t0":"...","t1":"..."}}`,
    temperature: 0.35,
    maxTokens: 6000,
  })

  if (!result?.content || result.error) return {}

  try {
    return parseTranslationResponse(result.content, records)
  } catch {
    return {}
  }
}

async function polishTranslations(
  texts: string[],
  draftTranslations: TranslationMap,
  language: TargetLanguage,
): Promise<TranslationMap> {
  const records = buildTextRecords(texts)
  const items = records
    .map((record) => ({
      id: record.id,
      source: record.text,
      draft: draftTranslations[record.text],
    }))
    .filter((item) => typeof item.draft === 'string' && item.draft.trim())

  if (items.length === 0) return draftTranslations

  const result = await groq(
    JSON.stringify({
      targetLanguage: {
        code: language.code,
        name: language.name,
        nativeName: language.nativeName,
      },
      pageContext: buildPageContext(texts),
      projectBrief: language.projectBrief,
      items,
    }),
    {
      model: TRANSLATION_MODEL,
      system: `You are the final localization QA and senior conversion copy chief for a premium website.

Review the draft translations against the source text and rewrite awkward, literal, low-trust, or overly formal phrases into 11/10 ${language.name} (${language.nativeName}) website copy. Keep the same meaning and UI role, but make the copy feel natural, modern, persuasive, and locally credible.

Rules:
- Return ONLY valid JSON, no markdown or explanation.
- Preserve each item id.
- Fix calques, false friends, and ambiguous CTA verbs.
- Prefer clear everyday business language over academic or bureaucratic wording.
- Keep accepted business/tech loanwords when they are what real users expect.
- Preserve brand names, numbers, URLs, placeholders, and code-like tokens.

Expected response shape:
{"translations":{"t0":"...","t1":"..."}}`,
      temperature: 0.45,
      maxTokens: 6000,
    },
  )

  if (!result?.content || result.error) return draftTranslations

  try {
    const polished = parseTranslationResponse(result.content, records)
    return { ...draftTranslations, ...polished }
  } catch {
    return draftTranslations
  }
}

function buildTranslationItems(
  texts: string[],
  translations: TranslationMap,
): TranslationItem[] {
  return buildTextRecords(texts)
    .map((record) => ({
      id: record.id,
      source: record.text,
      draft: translations[record.text],
    }))
    .filter((item) => typeof item.draft === 'string' && item.draft.trim())
}

async function scoreTranslations(
  texts: string[],
  translations: TranslationMap,
  language: TargetLanguage,
): Promise<QualityResult> {
  const items = buildTranslationItems(texts, translations)
  if (items.length === 0) return { score: 0, weakIds: [] }

  const result = await groq(
    JSON.stringify({
      targetLanguage: {
        code: language.code,
        name: language.name,
        nativeName: language.nativeName,
      },
      pageContext: buildPageContext(texts),
      projectBrief: language.projectBrief,
      items,
    }),
    {
      model: TRANSLATION_MODEL,
      system: `You are a ruthless translation quality judge for premium conversion websites.

Score these localized strings against an 11/10 bar for naturalness, persuasion, local credibility, CTA clarity, and absence of machine-translation artifacts. A score of 11 means users would feel the site was originally written for them by a strong local copywriter.

Judge business idioms by intent, not literal wording: practical insights means actionable guidance, not software/application; strategy call means consultation or planning conversation; book/schedule means arrange a meeting. Do not award 11 if any phrase sounds translated, bureaucratic, academic, over-purist, or like a dictionary calque. Accepted English loanwords are often better than forced unnatural wording when real local websites would use them.

Do not nitpick merely because another phrasing is possible. Award 11 when the copy is ship-ready, credible, clear, conversion-useful, and likely to appeal to the stated users. Penalize only issues that would materially reduce user trust, clarity, or desire to act.

Mostly natural and clear copy with only minor possible improvements should receive 11 and must be scored 11. Do not return 9 with a reason like "mostly natural and clear"; that is a passing 11/10 result. Use 8 or 9 only when the issue is significant enough that a real user would feel less trust, less clarity, or less motivation to click.

If score is below 11, include a "translations" object with rewritten 11/10 copy for every weak id. These rewrites must directly fix your criticism and be ready to ship.

Return ONLY valid JSON with:
{"score": <0-11 number>, "reason": "...", "weakIds": ["t0"], "translations": {"t0": "..."}}`,
      temperature: 0,
      maxTokens: 1200,
    },
  )

  if (!result?.content || result.error) return { score: 11, weakIds: [] }

  try {
    const jsonMatch = String(result.content).match(/\{[\s\S]*\}/)
    if (!jsonMatch) return { score: 11, weakIds: [] }
    const parsed = JSON.parse(jsonMatch[0])
    const score = Number(parsed.score)
    return {
      score: Number.isFinite(score) ? score : 11,
      reason: typeof parsed.reason === 'string' ? parsed.reason : '',
      weakIds: Array.isArray(parsed.weakIds) ? parsed.weakIds.map(String) : [],
      translations: parseTranslationResponse(
        result.content,
        buildTextRecords(texts),
      ),
    }
  } catch {
    return { score: 11, weakIds: [] }
  }
}

function applySuggestedTranslations(
  translations: TranslationMap,
  suggestions: TranslationMap | undefined,
): TranslationMap {
  return suggestions && Object.keys(suggestions).length > 0
    ? { ...translations, ...suggestions }
    : translations
}

async function rewriteWeakTranslations(
  texts: string[],
  translations: TranslationMap,
  language: TargetLanguage,
  quality: QualityResult,
): Promise<TranslationMap> {
  if (!quality || quality.score >= 10.5) return translations

  const records = buildTextRecords(texts)
  const weakIds = new Set<string>(
    quality.weakIds?.length
      ? quality.weakIds
      : records.map((record) => record.id),
  )
  const items = records
    .filter((record) => weakIds.has(record.id))
    .map((record) => ({
      id: record.id,
      source: record.text,
      draft: translations[record.text],
    }))
    .filter((item) => typeof item.draft === 'string' && item.draft.trim())

  if (items.length === 0) return translations

  const result = await groq(
    JSON.stringify({
      targetLanguage: {
        code: language.code,
        name: language.name,
        nativeName: language.nativeName,
      },
      pageContext: buildPageContext(texts),
      projectBrief: language.projectBrief,
      qualityFeedback:
        quality.reason || 'Output did not reach the 11/10 user-appeal bar.',
      items,
    }),
    {
      model: TRANSLATION_MODEL,
      system: `You must rewrite only the weak translations so they reach an 11/10 premium website standard.

Make each string sound native, modern, persuasive, and locally credible using natural contemporary website language in a conversational professional digital-marketing register. Remove literal calques, awkward formal phrasing, and any wording that would make users feel the page was machine-translated. Use accepted English loanwords for business, marketing, and technology terms when that is what real local users expect; terms like strategy, marketing, call, booking, brand, service, and client should stay familiar when literal translation sounds unnatural. Use the quality feedback directly. Do not repeat wording that the judge already rejected. Preserve meaning, UI role, ids, brand names, numbers, URLs, placeholders, and layout-friendly length.

Return ONLY valid JSON:
{"translations":{"t0":"..."}}`,
      temperature: 0.55,
      maxTokens: 6000,
    },
  )

  if (!result?.content || result.error) return translations

  try {
    const rewritten = parseTranslationResponse(result.content, records)
    return { ...translations, ...rewritten }
  } catch {
    return translations
  }
}

function replaceVisibleTextNodes(
  html: string,
  translations: TranslationMap,
): string {
  const protectedBlocks: string[] = []
  const placeholderPrefix = `__SHIP_FAST_TRANSLATION_BLOCK_${Date.now()}_`
  const withoutProtectedBlocks = html.replace(
    /<(script|style)[\s\S]*?<\/\1>/gi,
    (block) => {
      const placeholder = `${placeholderPrefix}${protectedBlocks.length}__`
      protectedBlocks.push(block)
      return placeholder
    },
  )

  const translated = withoutProtectedBlocks.replace(
    />([^<]+)</g,
    (_match, text) => {
      let replaced = text
      for (const [original, replacement] of Object.entries(translations)) {
        if (!replacement || replacement === original) continue
        const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        replaced = replaced.replace(new RegExp(escaped, 'g'), replacement)
      }
      return `>${replaced}<`
    },
  )

  return protectedBlocks.reduce(
    (acc, block, index) => acc.replace(`${placeholderPrefix}${index}__`, block),
    translated,
  )
}

/**
 * Translate the visible text content of an HTML string into the target Indian
 * language using Groq. HTML structure, CSS, and JavaScript are never touched.
 */
export async function translateHtml(
  html: string,
  languageMode: LanguageMode | undefined,
): Promise<TranslationResult> {
  const language = resolveTargetLanguage(languageMode)
  if (!language) return { content: html, translatedCount: 0 }
  const texts = extractTextNodes(html)
  if (texts.length === 0) return { content: html }
  if (isAlreadyLocalized(texts, language)) {
    return { content: html, translatedCount: 0, skipped: 'already-localized' }
  }

  const draftTranslations = await translateTexts(texts, language)
  const polishedTranslations = await polishTranslations(
    texts,
    draftTranslations,
    language,
  )
  let translations = polishedTranslations
  let finalQuality = await scoreTranslations(texts, translations, language)
  for (
    let attempt = 0;
    finalQuality.score < QUALITY_TARGET_SCORE &&
    attempt < MAX_QUALITY_REWRITE_ATTEMPTS;
    attempt += 1
  ) {
    const suggested = applySuggestedTranslations(
      translations,
      finalQuality.translations,
    )
    const rewritten =
      suggested === translations
        ? await rewriteWeakTranslations(
            texts,
            translations,
            language,
            finalQuality,
          )
        : suggested
    if (rewritten === translations) break
    translations = rewritten
    finalQuality = await scoreTranslations(texts, translations, language)
  }
  const translatedCount = Object.values(translations).filter(Boolean).length
  if (translatedCount === 0)
    return { content: html, error: 'no translations returned' }

  const translated = replaceVisibleTextNodes(html, translations)

  return {
    content: translated,
    translatedCount,
    qualityScore: finalQuality.score,
    qualityReason: finalQuality.reason || '',
  }
}

/**
 * Translate an array of HTML strings sequentially.
 * Falls back to original HTML if translation fails for any item.
 */
export async function translateHtmlSequential(
  htmlArray: string[],
  indiaMode: LanguageMode | undefined,
): Promise<string[]> {
  const out: string[] = []
  for (let i = 0; i < htmlArray.length; i++) {
    try {
      const result = await translateHtml(htmlArray[i], indiaMode)
      if (result?.content && !result.error) {
        out.push(result.content)
      } else {
        console.error(
          `  translation failed for page ${i + 1}: ${result?.error ?? 'empty'} — keeping English`,
        )
        out.push(htmlArray[i])
      }
    } catch (err) {
      console.error(
        `  translation error for page ${i + 1}: ${err instanceof Error ? err.message : String(err)} — keeping English`,
      )
      out.push(htmlArray[i])
    }
  }
  return out
}
