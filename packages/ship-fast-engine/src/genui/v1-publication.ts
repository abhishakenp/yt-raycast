import { mergeStatements } from '@openuidev/lang-core'
import {
  formatLlmFailureMessage,
  generateText,
  isHardLlmFailure,
} from '../generate.ts'
import { stripFences } from './parser.ts'
import { THEME_CATALOG } from '../../../ship-fast-blocks/src/theme-apply.ts'

export type V1ArtifactKey =
  | 'category-grammar'
  | 'resolved-variant-map'
  | 'theme-genome'
  | 'openui-manifest'
  | 'fullstack-manifest'
  | 'admin-policy'

export type V1GeneratedArtifact = {
  key: V1ArtifactKey
  contentJson: string
}

export type V1PublicationResult = {
  source: string
  theme: string | null
  locale: string
  brand: string
  category: string
  artifacts: V1GeneratedArtifact[]
}

export type V1PublicationEvent =
  | { type: 'status'; message: string }
  | { type: 'skeleton'; text: string }
  | { type: 'plan'; ids: string[] }
  | { type: 'theme'; name: string }
  | { type: 'locale'; code: string }
  | { type: 'module_start'; id: string }
  | { type: 'module_retry'; id: string; attempt: number }
  | { type: 'module'; id: string; text: string; failed?: boolean }
  | { type: 'source'; text: string }
  | { type: 'done'; modules: number; ms: number; source?: string }
  | { type: 'error'; message: string }

type PublicationPage = {
  id: string
  label: string
  alias: PublicationAlias
  purpose: string
}

type PublicationAlias =
  | 'PublicationHome'
  | 'PublicationPost'
  | 'PublicationArchive'
  | 'PublicationTopics'
  | 'PublicationAuthors'
  | 'PublicationAdmin'

type VariantMap = Record<PublicationAlias, string>

const CATEGORY_RETRIES = 0
const PAGE_RETRIES = 1
const PAGE_TIMEOUT_MS = 45_000

const PUBLICATION_ALIASES: Record<PublicationAlias, string[]> = {
  PublicationHome: [
    'BlogKimiPage',
    'BlogKimiPage2',
    'NewsKimiPage',
    'NewsKimiPage2',
  ],
  PublicationPost: ['BlogPostKimiPage', 'BlogPostKimiPage2'],
  PublicationArchive: ['BlogKimiPage', 'BlogKimiPage2'],
  PublicationTopics: ['NewsKimiPage', 'NewsKimiPage2'],
  PublicationAuthors: ['NewsletterKimiPage', 'NewsletterKimiPage2'],
  PublicationAdmin: ['BlogKimiPage2'],
}

const PUBLICATION_PAGES: PublicationPage[] = [
  {
    id: 'home',
    label: 'Home',
    alias: 'PublicationHome',
    purpose:
      'the publication homepage with masthead, featured story, dense story discovery, topics, subscribe CTA, and footer',
  },
  {
    id: 'post',
    label: 'Latest',
    alias: 'PublicationPost',
    purpose:
      'a complete long-form featured article with header, cover, body, tags, author, related stories, newsletter, and footer',
  },
  {
    id: 'archive',
    label: 'Archive',
    alias: 'PublicationArchive',
    purpose:
      'an archive/index page for browsing recent and older stories with editorial cards and issue-style context',
  },
  {
    id: 'topics',
    label: 'Topics',
    alias: 'PublicationTopics',
    purpose:
      'a topic discovery page with categories, trending lists, latest stories, and newsletter/sidebar context',
  },
  {
    id: 'authors',
    label: 'Authors',
    alias: 'PublicationAuthors',
    purpose:
      'an author/newsletter page for readers to follow contributors, issues, testimonials, and subscription options',
  },
  {
    id: 'admin',
    label: 'Admin',
    alias: 'PublicationAdmin',
    purpose:
      'a schema-owned newsroom admin placeholder summarizing posts, drafts, authors, tags, media, invites, analytics, and owner-gated access',
  },
]

const compact = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '')

function hashString(value: string): number {
  let h = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function makeSeededRng(seed: string): () => number {
  let state = hashString(seed) || 1
  return () => {
    state += 0x6d2b79f5
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(rng: () => number, values: readonly T[]): T {
  return values[Math.min(values.length - 1, Math.floor(rng() * values.length))]
}

function brandFromPrompt(prompt: string): string {
  const cleaned = prompt
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^A-Za-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter(
      (word) =>
        word.length > 2 &&
        !/^(the|and|for|with|about|site|blog|news|make|build)$/i.test(word),
    )
    .slice(0, 2)
  if (cleaned.length === 0) return 'Field Notes'
  return cleaned.map((word) => word[0].toUpperCase() + word.slice(1)).join(' ')
}

function normalCategory(raw: string): string {
  const word = stripFences(raw)
    .trim()
    .split(/[\s,.;:/|]+/)[0]
    ?.toLowerCase()
    .replace(/[^a-z]/g, '')
  if (!word) return 'publication'
  if (['blog', 'news', 'newsletter', 'magazine', 'media'].includes(word)) {
    return 'publication'
  }
  return word
}

/**
 * Classify the requested website into a normalized category word.
 *
 * Shared so callers (e.g. the orchestrator) can gate on the category without
 * duplicating the prompt + normalization. Hard LLM failures (auth/config) are
 * re-thrown so they surface instead of silently degrading; any other (soft)
 * failure defaults to 'publication'.
 */
export async function classifySiteCategory(
  prompt: string,
  modelId: string,
  signal?: AbortSignal,
): Promise<string> {
  try {
    const rawCategory = await generateText(
      modelId,
      categorySystemPrompt(),
      categoryUserPrompt(prompt),
      signal ?? new AbortController().signal,
      CATEGORY_RETRIES,
    )
    return normalCategory(rawCategory)
  } catch (error) {
    if (isHardLlmFailure(error)) throw error
    return 'publication'
  }
}

function buildVariantMap(seed: string): VariantMap {
  const rng = makeSeededRng(seed)
  return Object.fromEntries(
    Object.entries(PUBLICATION_ALIASES).map(([alias, variants]) => [
      alias,
      pick(rng, variants),
    ]),
  ) as VariantMap
}

function resolveAliases(source: string, variantMap: VariantMap): string {
  return (Object.entries(variantMap) as Array<[PublicationAlias, string]>)
    .reduce(
      (next, [alias, concrete]) =>
        next.replace(new RegExp(`\\b${alias}\\s*\\(`, 'g'), `${concrete}(`),
      source,
    )
}

function buildSkeleton(labels: string[], ids: string[]): string {
  return `$page = ${JSON.stringify(labels[0])}
root = PageSwitch(${JSON.stringify(labels)}, [${ids.join(', ')}])`
}

function categorySystemPrompt(): string {
  return 'Classify the requested website. Output exactly one lowercase category word. Good words: publication, commerce, software, portfolio, restaurant, community, auth, dashboard. No prose.'
}

function categoryUserPrompt(prompt: string): string {
  return `Request: ${prompt}

Output one category word only.`
}

function pageSystemPrompt(alias: PublicationAlias): string {
  return `You fill a fixed OpenUI form for a publication generator. Output exactly one OpenUI assignment statement. Use only the component alias ${alias}; never use concrete component names, markdown, comments, imports, low-level primitives, or extra statements.`
}

function pageUserPrompt(input: {
  prompt: string
  brand: string
  nav: string[]
  page: PublicationPage
}): string {
  const { prompt, brand, nav, page } = input
  return `Build request: ${prompt}

Publication brand: ${brand}
Navigation labels, verbatim: ${JSON.stringify(nav)}
This page id: ${page.id}
This page purpose: ${page.purpose}

Output exactly:
${page.id} = ${page.alias}({...props})

Rules:
- First argument must be ${JSON.stringify(brand)} when the alias supports brand.
- Second argument must be ${JSON.stringify(nav)} when the alias supports nav.
- Fill rich publication content for every visible field you include.
- Include at least 6 stories/posts/items where the alias supports lists.
- Use newsroom language, real headlines, categories, authors, dates, read times, topic tags, issue/newsletter context, and media alt text.
- The user prompt overrides creative structure and editorial focus, but not schema, auth, or export safety.
- No placeholder copy, no lorem ipsum, no generic SaaS hero, no pricing/features/testimonials unless they belong to publication subscriptions.`
}

function fallbackPage(input: {
  page: PublicationPage
  brand: string
  nav: string[]
  prompt: string
}): string {
  const { page, brand, nav, prompt } = input
  const topic = prompt.replace(/\s+/g, ' ').trim().slice(0, 90) || brand
  if (page.alias === 'PublicationPost') {
    return `${page.id} = PublicationPost(${JSON.stringify(brand)}, ${JSON.stringify(nav)}, {category:"Analysis", title:${JSON.stringify(`${brand} investigates ${topic}`)}, dek:${JSON.stringify(`A reported feature for readers following ${topic}.`)}, authorName:"Editorial Desk", authorRole:"Senior Editor", date:"Today", readTime:"8 min read"}, {imageAlt:${JSON.stringify(`${brand} editorial cover for ${topic}`)}, caption:"Lead image"}, [${JSON.stringify(`The newsroom is tracking ${topic} with a focus on useful context, primary questions, and practical implications for readers.`)}], [{heading:"What readers need to know", blocks:[{p:${JSON.stringify(`This story explains the signal behind ${topic}, why it matters now, and how the publication will continue covering it.`)}},{h3:"The editorial lens"},{p:"Our coverage prioritizes verified context, clear stakes, and concrete next steps."},{callout:"The takeaway: readers should leave with a clear understanding of what changed and what comes next."}]}], {quote:"Useful journalism makes the next decision easier.", attribution:"Editorial Desk"}, ["This is a living coverage area with more reporting, interviews, and analysis to follow."], ["Analysis","Newsroom","Field Notes"], {name:"Editorial Desk", bio:"A rotating group of editors and reporters maintaining the publication desk.", avatarAlt:"Editorial desk portrait"}, {heading:"Related reporting", items:[{category:"Briefing", date:"Today", title:"The context behind the latest shift", excerpt:"A short guide to the facts, stakeholders, and open questions.", imageAlt:"Related reporting image"},{category:"Interview", date:"This week", title:"What practitioners are watching", excerpt:"A Q&A with people closest to the story.", imageAlt:"Interview image"},{category:"Guide", date:"This month", title:"How to follow this beat", excerpt:"A reader guide to terms, sources, and signals.", imageAlt:"Guide image"}]}, {heading:"Get the newsroom briefing", description:"Weekly context from the editors.", placeholder:"Email address", submit:"Subscribe", footnote:"No spam."}, {blurb:${JSON.stringify(`${brand} publishes useful reporting for curious readers.`)}, columns:[{heading:"Sections", links:["Latest","Topics","Authors"]}], note:"Independent publication", legal:["Privacy","Terms"]})`
  }
  return `${page.id} = ${page.alias}(${JSON.stringify(brand)}, ${JSON.stringify(nav)}, {title:${JSON.stringify(`${brand} ${page.label}`)}, viewAll:"View all"}, {badge:"Featured", topic:"Editorial", title:${JSON.stringify(`${brand}: ${topic}`)}, excerpt:${JSON.stringify(`A publication-grade overview of ${topic}, with reporting, analysis, and useful context for readers.`)}, author:"Editorial Desk", readTime:"6 min read", date:"Today", readLabel:"Read story", alt:${JSON.stringify(`${brand} featured story image`)}}, [{tag:"Analysis", title:"What changed this week", excerpt:"A concise look at the developments readers should understand.", author:"Maya Chen", date:"Today", alt:"Analysis story cover"},{tag:"Guide", title:"A reader's guide to the beat", excerpt:"Key terms, sources, and questions to keep nearby.", author:"Noah Reeves", date:"Yesterday", alt:"Guide story cover"},{tag:"Interview", title:"Voices from the field", excerpt:"Practitioners explain what they are seeing and why it matters.", author:"Ava Morales", date:"This week", alt:"Interview story cover"},{tag:"Opinion", title:"The argument worth testing", excerpt:"A sharp column with caveats, counterpoints, and clear stakes.", author:"Liam Park", date:"This week", alt:"Opinion story cover"},{tag:"Archive", title:"The background you missed", excerpt:"Earlier reporting that still explains the current moment.", author:"Sofia Andersson", date:"This month", alt:"Archive story cover"},{tag:"Briefing", title:"Five signals to watch next", excerpt:"A short list of indicators for readers following the story.", author:"Raj Patel", date:"This month", alt:"Briefing story cover"}], {links:["Latest","Topics","Authors","Subscribe","Privacy"], copyright:${JSON.stringify(`© ${new Date().getFullYear()} ${brand}`)}})`
}

function sanitizePageModule(raw: string, page: PublicationPage): string {
  return stripFences(raw)
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim()
      return (
        trimmed.length > 0 &&
        !/^root\s*=/.test(trimmed) &&
        !/^\$\w+\s*=/.test(trimmed)
      )
    })
    .join('\n')
    .trim()
    .replace(new RegExp(`^\\s*(?!${page.id}\\s*=)[A-Za-z_$][\\w$]*\\s*=`), `${page.id} =`)
}

function validateResolvedPage(input: {
  page: PublicationPage
  raw: string
  variantMap: VariantMap
  fallback: string
}): { text: string; failed: boolean } {
  const sanitized = sanitizePageModule(input.raw, input.page)
  const resolved = resolveAliases(sanitized, input.variantMap)
  const definesId = new RegExp(`(^|\\n)\\s*${input.page.id}\\s*=`).test(
    resolved,
  )
  if (definesId) {
    try {
      const probe = mergeStatements(`root = Box([${input.page.id}])`, resolved)
      if (probe && probe.includes(`${input.page.id} =`)) {
        return { text: resolved, failed: false }
      }
    } catch {
      // fall back below
    }
  }
  return {
    text: resolveAliases(input.fallback, input.variantMap),
    failed: true,
  }
}

function artifacts(input: {
  category: string
  brand: string
  theme: string
  sessionSeed: string
  variantMap: VariantMap
  ownerEmail?: string
}): V1GeneratedArtifact[] {
  const grammar = {
    version: 1,
    kind: input.category,
    grammar: 'publication.full-newsroom',
    aliases: PUBLICATION_ALIASES,
    pages: PUBLICATION_PAGES,
    fixedSchema: 'publication-newsroom-v1',
  }
  const adminPolicy = {
    version: 1,
    mode: input.ownerEmail ? 'baked-owner' : 'direct-preview-bootstrap',
    authProvider: 'shoo',
    ownerEmail: input.ownerEmail ?? null,
    adminEmails: input.ownerEmail ? [input.ownerEmail] : [],
    roles: ['owner', 'editor', 'author'],
    exportRequiresVerifiedOwnerEmail: true,
  }
  const fullstackManifest = {
    version: 1,
    kind: 'publication',
    schema: 'publication-newsroom-v1',
    auth: { provider: 'shoo', adminPolicyKey: 'admin-policy' },
    storage: {
      html: 'browser-storage',
      react: 'browser-storage',
      next: 'app-data-runtime',
      lakebed: 'lakebed',
    },
    tables: [
      'posts',
      'authors',
      'categories',
      'tags',
      'media',
      'comments',
      'invites',
      'analytics',
      'subscribers',
    ],
  }
  const openuiManifest = {
    version: 1,
    sourceKind: 'concrete-openui',
    pages: PUBLICATION_PAGES.map((page) => ({
      id: page.id,
      label: page.label,
      alias: page.alias,
      component: input.variantMap[page.alias],
    })),
  }
  return [
    { key: 'category-grammar', contentJson: JSON.stringify(grammar) },
    {
      key: 'resolved-variant-map',
      contentJson: JSON.stringify({
        version: 1,
        seed: input.sessionSeed,
        variants: input.variantMap,
      }),
    },
    {
      key: 'theme-genome',
      contentJson: JSON.stringify({ version: 1, theme: input.theme }),
    },
    { key: 'openui-manifest', contentJson: JSON.stringify(openuiManifest) },
    {
      key: 'fullstack-manifest',
      contentJson: JSON.stringify(fullstackManifest),
    },
    { key: 'admin-policy', contentJson: JSON.stringify(adminPolicy) },
  ]
}

function withTimeout(parent: AbortController, ms: number) {
  const controller = new AbortController()
  const abort = () => controller.abort()
  parent.signal.addEventListener('abort', abort, { once: true })
  const timer = setTimeout(() => controller.abort(), ms)
  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer)
      parent.signal.removeEventListener('abort', abort)
    },
  }
}

export async function runV1PublicationGeneration(input: {
  prompt: string
  modelId: string
  category?: string
  preferredLanguage?: string
  sessionSeed?: string
  ownerEmail?: string
  signal?: AbortSignal
  onEvent?: (event: V1PublicationEvent) => void
  onSource?: (source: string) => void
}): Promise<V1PublicationResult> {
  const startedAt = Date.now()
  const abort = new AbortController()
  input.signal?.addEventListener('abort', () => abort.abort(), { once: true })
  const sessionSeed = input.sessionSeed || compact(input.prompt) || 'session'
  const rng = makeSeededRng(sessionSeed)
  const variantMap = buildVariantMap(sessionSeed)
  const theme = pick(rng, THEME_CATALOG).name
  const brand = brandFromPrompt(input.prompt)
  const locale = input.preferredLanguage || 'en'
  let source = ''

  const emit = (event: V1PublicationEvent) => input.onEvent?.(event)
  const mergeIn = (text: string) => {
    if (!text.trim()) return
    if (!source) {
      source = text
    } else {
      try {
        source = mergeStatements(source, text) || source
      } catch {
        // skip an unmergeable fragment rather than wiping/propagating
        return
      }
    }
    input.onSource?.(source)
    emit({ type: 'source', text: source })
  }

  emit({ type: 'status', message: 'Classifying site kind' })

  let category = input.category
  if (category === undefined) {
    try {
      category = await classifySiteCategory(
        input.prompt,
        input.modelId,
        abort.signal,
      )
    } catch (error) {
      if (isHardLlmFailure(error)) {
        emit({ type: 'error', message: formatLlmFailureMessage(error) })
        throw error
      }
      throw new Error('Category classification failed')
    }
  }

  emit({ type: 'status', message: `Grammar ready: ${category}` })
  emit({ type: 'theme', name: theme })
  emit({ type: 'locale', code: locale })

  const labels = PUBLICATION_PAGES.map((page) => page.label)
  const ids = PUBLICATION_PAGES.map((page) => page.id)
  const skeleton = buildSkeleton(labels, ids)
  emit({ type: 'skeleton', text: skeleton })
  emit({ type: 'plan', ids })
  mergeIn(skeleton)

  await Promise.all(
    PUBLICATION_PAGES.map(async (page) => {
      emit({ type: 'module_start', id: page.id })
      const fallback = fallbackPage({
        page,
        brand,
        nav: labels,
        prompt: input.prompt,
      })
      const { signal, cleanup } = withTimeout(abort, PAGE_TIMEOUT_MS)
      try {
        const raw = await generateText(
          input.modelId,
          pageSystemPrompt(page.alias),
          pageUserPrompt({ prompt: input.prompt, brand, nav: labels, page }),
          signal,
          0,
        )
        let validated = validateResolvedPage({
          page,
          raw,
          variantMap,
          fallback,
        })
        if (validated.failed) {
          emit({ type: 'module', id: page.id, text: validated.text, failed: true })
          mergeIn(validated.text)
          emit({ type: 'module_retry', id: page.id, attempt: 1 })
          const retryRaw = await generateText(
            input.modelId,
            `${pageSystemPrompt(page.alias)} The previous output failed validation. Return one valid assignment only.`,
            pageUserPrompt({ prompt: input.prompt, brand, nav: labels, page }),
            signal,
            PAGE_RETRIES,
          )
          validated = validateResolvedPage({
            page,
            raw: retryRaw,
            variantMap,
            fallback,
          })
        }
        emit({
          type: 'module',
          id: page.id,
          text: validated.text,
          failed: validated.failed,
        })
        mergeIn(validated.text)
      } catch (error) {
        const fallbackText = resolveAliases(fallback, variantMap)
        emit({ type: 'module', id: page.id, text: fallbackText, failed: true })
        mergeIn(fallbackText)
      } finally {
        cleanup()
      }
    }),
  )

  if (!source.trim()) {
    throw new Error('v1 publication generator produced an empty program')
  }

  const generatedArtifacts = artifacts({
    category,
    brand,
    theme,
    sessionSeed,
    variantMap,
    ownerEmail: input.ownerEmail,
  })
  emit({
    type: 'done',
    modules: PUBLICATION_PAGES.length,
    ms: Date.now() - startedAt,
    source,
  })

  return {
    source,
    theme,
    locale,
    brand,
    category,
    artifacts: generatedArtifacts,
  }
}
