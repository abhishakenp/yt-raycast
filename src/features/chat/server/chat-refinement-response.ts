import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type ChatRefinementClient = Pick<ConvexHttpClient, 'query' | 'mutation'>

type JsonBody = Record<string, unknown>

type ChatRefinementPlan = {
  headline?: string
  ctaLabel?: string
  replacements?: Array<{ oldText: string; newText: string }>
  sections?: Array<{ kind?: string; title?: string; body?: string }>
  assistantSummary?: string
}

type GenerateText = (
  model: string,
  system: string,
  user: string,
  signal: AbortSignal,
  retries?: number,
) => Promise<string>
type GenerateTextRuntime = {
  generateText: GenerateText
  DEFAULT_MODEL: string
}

const MAX_CONTEXT_CHARS = 9000
const MAX_CONTENT_CHARS = 4000
const CHAT_REFINEMENT_TIMEOUT_MS = 25000
const DEFAULT_INJECTED_CHAT_MODEL = 'openai/gpt-oss-120b'

const asSessionId = (sessionId: string): Id<'sessions'> =>
  sessionId as Id<'sessions'>

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

const loadGenerateTextRuntime = async (): Promise<GenerateTextRuntime> => {
  const [{ generateText }, { DEFAULT_MODEL }] = await Promise.all([
    import('@ship-fast/engine'),
    import('@ship-fast/engine/model-list.js'),
  ])

  return { generateText, DEFAULT_MODEL }
}

const getString = (body: JsonBody, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = body[key]
    if (typeof value === 'string') return value
  }
  return undefined
}

const readJsonBody = async (request: Request): Promise<JsonBody> => {
  const text = await request.text()
  if (!text.trim()) return {}
  const parsed = JSON.parse(text) as unknown
  return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
    ? (parsed as JsonBody)
    : {}
}

const getOwnerSecret = (request: Request, body: JsonBody): string | undefined =>
  getString(body, ['anonymousOwnerSecret', 'anonOwnerSecret']) ??
  request.headers.get('x-ship-fast-owner-secret') ??
  undefined

const truncate = (value: unknown, max: number): string =>
  String(value ?? '').slice(0, max)

const normalizePlanString = (
  value: unknown,
  max: number,
): string | undefined =>
  typeof value === 'string' && value.trim()
    ? value.trim().slice(0, max)
    : undefined

const normalizePlan = (value: unknown): ChatRefinementPlan | undefined => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return undefined
  }

  const record = value as Record<string, unknown>
  const replacements = Array.isArray(record.replacements)
    ? record.replacements
        .map((entry) => {
          if (
            entry === null ||
            typeof entry !== 'object' ||
            Array.isArray(entry)
          ) {
            return null
          }
          const item = entry as Record<string, unknown>
          const oldText = normalizePlanString(item.oldText, 500)
          const newText = normalizePlanString(item.newText, 500)
          return oldText && newText ? { oldText, newText } : null
        })
        .filter(
          (entry): entry is { oldText: string; newText: string } =>
            entry !== null,
        )
        .slice(0, 8)
    : undefined

  const sections = Array.isArray(record.sections)
    ? record.sections
        .map((entry) => {
          if (
            entry === null ||
            typeof entry !== 'object' ||
            Array.isArray(entry)
          ) {
            return null
          }
          const item = entry as Record<string, unknown>
          const kind = normalizePlanString(item.kind, 80)
          const title = normalizePlanString(item.title, 140)
          const body = normalizePlanString(item.body, 800)
          const section: NonNullable<ChatRefinementPlan['sections']>[number] =
            {}
          if (kind) section.kind = kind
          if (title) section.title = title
          if (body) section.body = body
          return section.title || section.body ? section : null
        })
        .filter(
          (
            entry,
          ): entry is NonNullable<ChatRefinementPlan['sections']>[number] =>
            entry !== null,
        )
        .slice(0, 4)
    : undefined

  const plan: ChatRefinementPlan = {
    headline: normalizePlanString(record.headline, 180),
    ctaLabel: normalizePlanString(record.ctaLabel, 120),
    replacements,
    sections,
    assistantSummary: normalizePlanString(record.assistantSummary, 500),
  }

  return plan.headline ||
    plan.ctaLabel ||
    (plan.replacements?.length ?? 0) > 0 ||
    (plan.sections?.length ?? 0) > 0
    ? plan
    : undefined
}

export const parseChatRefinementPlan = (
  raw: string,
): ChatRefinementPlan | undefined => {
  const trimmed = raw
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim()

  try {
    return normalizePlan(JSON.parse(trimmed))
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/)
    if (!match) return undefined
    try {
      return normalizePlan(JSON.parse(match[0]))
    } catch {
      return undefined
    }
  }
}

export const buildChatRefinementPrompt = ({
  content,
  generationView,
}: {
  content: string
  generationView: unknown
}) => {
  const view = generationView as {
    session?: { prompt?: string }
    latestPreview?: { html?: string }
    homeModule?: { source?: string | null }
    siteSpec?: { specJson?: string | null; spec?: string | null }
  } | null

  const context = {
    prompt: view?.session?.prompt ?? '',
    html: truncate(view?.latestPreview?.html, 3500),
    openUiSource: truncate(view?.homeModule?.source, 2500),
    siteSpec: truncate(view?.siteSpec?.specJson ?? view?.siteSpec?.spec, 2500),
  }

  return {
    system:
      "You are Ship Fast's OpenUI site refinement planner. Return only compact JSON. Do not include markdown. Produce a safe edit plan that updates the current generated website while preserving structure and intent.",
    user: truncate(
      [
        'User instruction:',
        content,
        '',
        'Current generated site context:',
        JSON.stringify(context),
        '',
        'Return JSON with this schema:',
        '{"headline":"optional new hero headline","ctaLabel":"optional new primary CTA","replacements":[{"oldText":"exact visible/source text","newText":"replacement"}],"sections":[{"kind":"testimonials|pricing|faq|features|contact|gallery|team|stats|custom","title":"section title","body":"short section content"}],"assistantSummary":"short sentence describing what changed"}',
        '',
        'Rules: include only fields that should change; prefer exact replacements when the user names existing copy; keep copy concise; do not invent fake legal/medical/financial claims; preserve brand names, URLs, numbers, and language/script from the user instruction.',
      ].join('\n'),
      MAX_CONTEXT_CHARS,
    ),
  }
}

export const createChatRefinementResponse = async (
  sessionId: string,
  request: Request,
  options: {
    client?: ChatRefinementClient
    generate?: GenerateText
    model?: string
  } = {},
): Promise<Response> => {
  let body: JsonBody
  try {
    body = await readJsonBody(request)
  } catch {
    return json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const content = getString(body, ['content', 'message', 'instruction'])?.trim()
  if (!content) {
    return json({ error: 'Chat message is required.' }, { status: 400 })
  }

  const client = options.client ?? createRuntimeConvexHttpClient(30000)
  const anonymousOwnerSecret = getOwnerSecret(request, body)
  let refinementPlan: ChatRefinementPlan | undefined
  let plannerError: string | undefined

  try {
    const generationView = await client.query(api.sessions.getGenerationView, {
      sessionId: asSessionId(sessionId),
    })
    const prompt = buildChatRefinementPrompt({
      content: truncate(content, MAX_CONTENT_CHARS),
      generationView,
    })
    const controller = new AbortController()
    const timeout = setTimeout(
      () => controller.abort(),
      CHAT_REFINEMENT_TIMEOUT_MS,
    )
    try {
      const runtime = options.generate ? null : await loadGenerateTextRuntime()
      const rawPlan = await (options.generate ?? runtime!.generateText)(
        options.model ?? runtime?.DEFAULT_MODEL ?? DEFAULT_INJECTED_CHAT_MODEL,
        prompt.system,
        prompt.user,
        controller.signal,
        1,
      )
      refinementPlan = parseChatRefinementPlan(rawPlan)
    } finally {
      clearTimeout(timeout)
    }
  } catch (error) {
    plannerError =
      error instanceof Error ? error.message : 'AI refinement planner failed'
  }

  const result = await client.mutation(api.sessions.sendChatMessage, {
    sessionId: asSessionId(sessionId),
    anonymousOwnerSecret,
    content,
    refinementPlanJson:
      refinementPlan === undefined ? undefined : JSON.stringify(refinementPlan),
  })

  return json({
    ...result,
    usedAiPlan: refinementPlan !== undefined,
    plannerError,
  })
}
