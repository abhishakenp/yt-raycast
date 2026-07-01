import { v } from 'convex/values'
import { action, mutation, query } from './_generated/server'
import { api } from './_generated/api'
import type { Doc } from './_generated/dataModel'

export type CustomLanguageEntry = {
  code: string
  name: string
  nativeName: string
  fontFamily: string
  keywords: string[]
}

const toEntry = (doc: Doc<'customLanguages'>): CustomLanguageEntry => ({
  code: doc.code,
  name: doc.name,
  nativeName: doc.nativeName,
  fontFamily: doc.fontFamily,
  keywords: doc.keywords,
})

/**
 * All custom languages, newest first. Bounded so the picker can merge them
 * with the static KNOWN_LANGUAGES list client-side.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query('customLanguages').order('desc').take(500)
    return docs.filter((doc) => !isStaleCanonicalAlias(doc)).map(toEntry)
  },
})

/**
 * Full-text search across name + nativeName + keywords (Roman + native script).
 */
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const q = args.query.trim()
    if (!q) return []
    const docs = await ctx.db
      .query('customLanguages')
      .withSearchIndex('search_all', (sq) => sq.search('searchText', q))
      .take(50)
    return docs.filter((doc) => !isStaleCanonicalAlias(doc)).map(toEntry)
  },
})

/**
 * Exact case-insensitive match by code, name, or nativeName. Used by the
 * resolve action to avoid creating a duplicate when the typed text already
 * matches an existing custom language exactly.
 */
export const findExact = query({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const needle = args.text.trim().toLowerCase()
    if (!needle) return null
    // Search index gives fuzzy matches; scan the small result set for an exact
    // hit on code / name / nativeName / any keyword.
    const candidates = await ctx.db
      .query('customLanguages')
      .withSearchIndex('search_all', (sq) => sq.search('searchText', needle))
      .take(50)
    for (const doc of candidates) {
      if (
        doc.code.toLowerCase() === needle ||
        doc.name.toLowerCase() === needle ||
        doc.nativeName.toLowerCase() === needle ||
        doc.keywords.some((k) => k.toLowerCase() === needle)
      ) {
        return toEntry(doc)
      }
    }
    return null
  },
})

/**
 * Idempotent insert — if a language with the same code already exists, return
 * the existing entry instead of creating a duplicate.
 */
export const add = mutation({
  args: {
    code: v.string(),
    name: v.string(),
    nativeName: v.string(),
    fontFamily: v.string(),
    keywords: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('customLanguages')
      .withIndex('by_code', (q) => q.eq('code', args.code))
      .unique()
    if (existing) return toEntry(existing)

    const searchText = [args.name, args.nativeName, ...args.keywords]
      .join(' ')
      .trim()
    const id = await ctx.db.insert('customLanguages', {
      code: args.code,
      name: args.name,
      nativeName: args.nativeName,
      fontFamily: args.fontFamily,
      keywords: args.keywords,
      searchText,
      createdAt: Date.now(),
    })
    const doc = await ctx.db.get(id)
    return doc ? toEntry(doc) : null
  },
})

const slugify = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32) || 'custom'

const GROQ_HOST = process.env.GROQ_HOST ?? 'https://api.groq.com'
const GROQ_AUX_MODEL =
  (process.env.GROQ_AUX_MODEL ?? '').trim() || 'llama-3.3-70b-versatile'

interface AiLanguageResult {
  code?: string
  name: string
  nativeName: string
  fontFamily: string
}

const CANONICAL_LANGUAGE_METADATA: Record<
  string,
  { code: string; name: string; nativeName: string; fontFamily: string }
> = {
  chinese: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    fontFamily: 'Noto Sans SC, sans-serif',
  },
  mandarin: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    fontFamily: 'Noto Sans SC, sans-serif',
  },
  japanese: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    fontFamily: 'Noto Sans JP, sans-serif',
  },
  korean: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    fontFamily: 'Noto Sans KR, sans-serif',
  },
  arabic: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    fontFamily: 'Noto Naskh Arabic, sans-serif',
  },
}

const canonicalLanguageMetadata = (value: string) =>
  CANONICAL_LANGUAGE_METADATA[value.trim().toLowerCase().replace(/\s+/g, ' ')]

const isStaleCanonicalAlias = (doc: Doc<'customLanguages'>): boolean =>
  [doc.name, doc.nativeName, doc.code, ...doc.keywords].some((value) => {
    const canonical = canonicalLanguageMetadata(value)
    return Boolean(canonical && doc.code !== canonical.code)
  })

const normalizeAiLocaleCode = (
  value: string | undefined,
): string | undefined => {
  const code = value?.trim()
  if (!code) return undefined
  if (/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(code)) {
    try {
      return Intl.getCanonicalLocales(code)[0] ?? code
    } catch {
      return code
    }
  }
  return undefined
}

const withCanonicalLanguageMetadata = (
  languageInput: string,
  ai: AiLanguageResult,
): AiLanguageResult & { code: string } => {
  const canonical =
    canonicalLanguageMetadata(languageInput) ??
    canonicalLanguageMetadata(ai.name)
  if (!canonical) {
    return { ...ai, code: normalizeAiLocaleCode(ai.code) ?? slugify(ai.name) }
  }
  return {
    code: canonical.code,
    name: canonical.name,
    nativeName: canonical.nativeName,
    fontFamily: canonical.fontFamily,
  }
}

const needsCanonicalRepair = (
  entry: CustomLanguageEntry,
  languageInput: string,
): boolean => {
  const canonical =
    canonicalLanguageMetadata(languageInput) ??
    canonicalLanguageMetadata(entry.name)
  if (!canonical) return false
  return (
    entry.code !== canonical.code ||
    entry.name !== canonical.name ||
    entry.nativeName !== canonical.nativeName ||
    entry.fontFamily !== canonical.fontFamily
  )
}

/**
 * Calls the Groq aux model to produce the native-script name + font family for
 * a language the user typed. Returns a compact JSON object.
 */
async function generateNativeName(
  languageInput: string,
): Promise<AiLanguageResult> {
  const apiKey = process.env.GROQ_API_KEY?.trim()
  if (!apiKey) {
    throw new Error(
      'GROQ_API_KEY is not configured — cannot generate custom language.',
    )
  }

  const system =
    'You are a localization expert. Given a language, regional dialect, or demonym, return the best website translation locale. Prefer a real BCP-47 locale code supported by browser translation APIs when the input is a regional variant (for example Mexican => es-MX, Brazilian => pt-BR). Do not reinterpret demonyms as indigenous languages unless the user explicitly names that language. Respond ONLY with a compact JSON object, no prose.'
  const prompt = `Language input: "${languageInput}"

Return JSON with exactly these keys:
{
  "code": "<BCP-47 locale code for translation, e.g. es-MX, hu, ja, am>",
  "name": "<English display name, Title Case>",
  "nativeName": "<endonym in the language's own script, or the Roman name if it uses Latin script>",
  "fontFamily": "<a CSS font-family stack using Noto fonts, e.g. "Noto Sans Devanagari, sans-serif" or "Inter, system-ui, sans-serif" for Latin-script languages>"
}

Rules:
- For country adjectives/demonyms, return the dominant translation locale for that region, not an indigenous language unless explicitly named.
- "Mexican" means Mexican Spanish: code "es-MX", name "Mexican Spanish", nativeName "Español (México)".
- nativeName must be the endonym (how speakers write their own language's name), NOT a transliteration.
- If the language uses the Latin/Roman script, set nativeName equal to the English name.
- fontFamily must use the matching Noto Sans/Noto Naskh/Noto Nastaliq family for the script, falling back to "Inter, system-ui, sans-serif" for Latin.`

  const res = await fetch(`${GROQ_HOST}/openai/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_AUX_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      temperature: 0,
      max_tokens: 260,
      stream: false,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Groq API error ${res.status}: ${text.slice(0, 200)}`)
  }

  const data = await res.json()
  const rawContent = data.choices?.[0]?.message?.content ?? ''
  // Strip reasoning/thinking blocks that some Groq models leak into content.
  const raw = String(rawContent)
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .replace(/<\|thinking\|>[\s\S]*?<\|\/thinking\|>/gi, '')
    .trim()
  console.log('[customLanguages] AI raw response:', JSON.stringify(raw))

  let obj: Record<string, unknown>
  try {
    obj = JSON.parse(raw)
  } catch {
    // Some models wrap JSON in prose; extract the first {...} block.
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match)
      throw new Error('AI returned malformed JSON for custom language.')
    obj = JSON.parse(match[0])
  }

  // Normalize keys — models may return snake_case or PascalCase variants.
  const pick = (keys: string[]): string | undefined => {
    for (const k of keys) {
      const value = obj[k]
      if (typeof value === 'string' && value.trim()) return value.trim()
      // Case-insensitive fallback for any other casing.
      const found = Object.entries(obj).find(
        ([key]) => key.toLowerCase() === k.toLowerCase(),
      )
      if (
        found &&
        typeof found[1] === 'string' &&
        (found[1] as string).trim()
      ) {
        return (found[1] as string).trim()
      }
    }
    return undefined
  }

  const name = pick(['name', 'englishName', 'english_name', 'language'])
  const code = normalizeAiLocaleCode(
    pick([
      'code',
      'locale',
      'bcp47',
      'bcp_47',
      'languageCode',
      'language_code',
    ]),
  )
  const nativeName =
    pick(['nativeName', 'native_name', 'endonym', 'native']) ?? name
  const fontFamily =
    pick(['fontFamily', 'font_family', 'font', 'fontStack', 'font_stack']) ??
    'Inter, system-ui, sans-serif'

  if (!name) {
    throw new Error(
      `AI response missing required "name" field. Raw: ${raw.slice(0, 300)}`,
    )
  }

  return { code, name, nativeName: nativeName!, fontFamily }
}

/**
 * Main orchestrator called from the picker when a user submits a language that
 * does not match any known language client-side.
 *
 * 1. Re-check the DB for an exact match (race safety).
 * 2. If not found, ask the AI for the native name + font family.
 * 3. Persist the new language so future users find it via search.
 * 4. Return the entry (code + display fields).
 */
export const resolveOrCreate = action({
  args: { languageInput: v.string() },
  handler: async (ctx, args): Promise<CustomLanguageEntry | null> => {
    const input = args.languageInput.trim()
    if (!input) {
      throw new Error('Language input is empty.')
    }

    // Race-safety: another user may have just added this language.
    const existing = await ctx.runQuery(api.customLanguages.findExact, {
      text: input,
    })
    if (existing && !needsCanonicalRepair(existing, input)) return existing

    const resolved = withCanonicalLanguageMetadata(
      input,
      await generateNativeName(input),
    )

    // If the slug collides with an existing code, reuse that entry.
    return await ctx.runMutation(api.customLanguages.add, {
      code: resolved.code,
      name: resolved.name,
      nativeName: resolved.nativeName,
      fontFamily: resolved.fontFamily,
      keywords: [
        input.toLowerCase(),
        resolved.name.toLowerCase(),
        resolved.code.toLowerCase(),
      ],
    })
  },
})
