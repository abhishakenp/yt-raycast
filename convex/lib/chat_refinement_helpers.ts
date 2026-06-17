import { applyPreviewTextEdit, escapeHtml } from './cms_helpers'

/* ------------------------------------------------------------------ */
/*  Local utility duplicates (same as cms-helpers / sessions.ts)      */
/* ------------------------------------------------------------------ */

type JsonObject = Record<string, unknown>

const isJsonObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const normalizeSpaces = (value: string): string =>
  value.replace(/\s+/g, ' ').trim()

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

export const MAX_CHAT_MESSAGE_LENGTH = 4000
export const CHAT_REFINEMENT_RE =
  /\s*<!-- ship-fast-chat-refinement:\d+ -->\s*<section\b[^>]*data-ship-fast-chat-refinement="1"[\s\S]*?<\/section>/gi

export const CHAT_LEGACY_REFINEMENT_NOTE_RE =
  /\s*<!-- ship-fast-chat-refinement-note:\d+ -->\s*<section\b[^>]*data-ship-fast-chat-note="1"[\s\S]*?<\/section>/gi

export const CHAT_OPENUI_REFINEMENT_RE =
  /\n*\/\/ ship-fast-chat-refinement:\d+\n\/\/ instruction: .*\n\/\/ summary: .*/g

export const truncateText = (value: string, max: number): string =>
  value.length <= max ? value : value.slice(0, max)

export type ChatPreviewRefinement = {
  html: string
  summary: string
  changed: boolean
}

export type ChatRefinementPlan = {
  headline?: string
  ctaLabel?: string
  replacements?: Array<{
    oldText?: string
    newText?: string
  }>
  sections?: Array<{
    kind?: string
    title?: string
    body?: string
  }>
  assistantSummary?: string
}

export type ChatInstructionIntent =
  | {
      kind: 'headline' | 'cta'
      targetText: string
    }
  | {
      kind: 'replace'
      oldText: string
      newText: string
    }
  | {
      kind: 'section'
      sectionKind: string
    }
  | {
      kind: 'note'
    }


export const extractQuotedText = (instruction: string): string | undefined =>
  instruction.match(/["“]([^"”]{2,180})["”]/)?.[1]?.trim()

export const extractTargetText = (instruction: string): string | undefined => {
  const quoted = extractQuotedText(instruction)
  if (quoted) return quoted

  const match = instruction.match(
    /\b(?:to|say|read|headline|title|cta|button|copy)\s*:?\s+(.{3,180})$/i,
  )
  return match?.[1]?.replace(/[.!?]\s*$/, '').trim()
}

export const getChatInstructionIntent = (
  instruction: string,
): ChatInstructionIntent => {
  const normalized = normalizeSpaces(instruction).toLowerCase()
  const targetText = extractTargetText(instruction)

  if (/\b(headline|hero title|h1|title)\b/.test(normalized) && targetText) {
    return { kind: 'headline', targetText }
  }

  if (
    /\b(cta|button|call to action|call-to-action)\b/.test(normalized) &&
    targetText
  ) {
    return { kind: 'cta', targetText }
  }

  const changeMatch = instruction.match(
    /\b(?:change|replace|rename)\s+["“]([^"”]{2,180})["”]\s+(?:to|with)\s+["“]([^"”]{2,180})["”]/i,
  )
  if (changeMatch) {
    return {
      kind: 'replace',
      oldText: changeMatch[1],
      newText: changeMatch[2],
    }
  }

  const sectionKind = normalized.match(
    /\b(add|include|create)\s+(?:a|an|the)?\s*(testimonial|testimonials|pricing|faq|contact|features?|gallery|team|stats?)\b/,
  )?.[2]
  if (sectionKind) return { kind: 'section', sectionKind }

  return { kind: 'note' }
}

export const replaceFirstElementText = (
  html: string,
  tagNames: string[],
  text: string,
): { html: string; replaced: boolean } => {
  const safeText = escapeHtml(truncateText(text, 180))
  for (const tagName of tagNames) {
    const pattern = new RegExp(
      `<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}>`,
      'i',
    )
    const match = html.match(pattern)
    if (!match) continue

    return {
      html: html.replace(
        pattern,
        `<${tagName}${match[1]}>${safeText}</${tagName}>`,
      ),
      replaced: true,
    }
  }

  return { html, replaced: false }
}

export const appendHtmlBeforeClose = (html: string, addition: string): string => {
  if (/<\/main>/i.test(html))
    return html.replace(/<\/main>/i, `${addition}</main>`)
  if (/<\/body>/i.test(html))
    return html.replace(/<\/body>/i, `${addition}</body>`)
  return `${html}${addition}`
}

export const buildGeneratedRefinementSection = (title: string, body: string): string =>
  `<section style="margin:32px auto;padding:24px;max-width:960px;border:1px solid rgba(15,23,42,.12);border-radius:16px;background:rgba(248,250,252,.92);color:#0f172a"><p style="margin:0 0 8px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#0891b2;font-weight:700">${escapeHtml(title)}</p><p style="margin:0;font-size:16px;line-height:1.65">${escapeHtml(truncateText(body, 420))}</p></section>`

export const applyInstructionDrivenHtmlRefinement = (
  html: string,
  instruction: string,
): ChatPreviewRefinement => {
  const intent = getChatInstructionIntent(instruction)

  if (intent.kind === 'headline') {
    const result = replaceFirstElementText(
      html,
      ['h1', 'h2'],
      intent.targetText,
    )
    if (result.replaced) {
      return {
        html: result.html,
        summary: 'Updated the primary headline in the preview.',
        changed: true,
      }
    }
  }

  if (intent.kind === 'cta') {
    const result = replaceFirstElementText(
      html,
      ['button', 'a'],
      intent.targetText,
    )
    if (result.replaced) {
      return {
        html: result.html,
        summary: 'Updated the first call-to-action label in the preview.',
        changed: true,
      }
    }
  }

  if (intent.kind === 'replace') {
    const result = applyPreviewTextEdit(html, intent.oldText, intent.newText)
    if (result.replaced) {
      return {
        html: result.html,
        summary: `Replaced "${truncateText(intent.oldText, 48)}" in the preview.`,
        changed: true,
      }
    }
  }

  if (intent.kind === 'section') {
    const sectionKind = intent.sectionKind
    const title = `${sectionKind.replace(/s$/, '')} section`
    const addition = buildGeneratedRefinementSection(title, instruction)
    return {
      html: appendHtmlBeforeClose(html, addition),
      summary: `Added a ${sectionKind} section to the preview.`,
      changed: true,
    }
  }

  const addition = buildGeneratedRefinementSection(
    'Latest updates',
    instruction,
  )
  return {
    html: appendHtmlBeforeClose(html, addition),
    summary: 'Added the requested update to the preview.',
    changed: true,
  }
}

export const buildChatRefinedPreviewHtml = (
  html: string,
  instruction: string,
  plan?: ChatRefinementPlan,
): ChatPreviewRefinement => {
  const cleanHtml = String(html || '')
    .replace(CHAT_REFINEMENT_RE, '')
    .replace(CHAT_LEGACY_REFINEMENT_NOTE_RE, '')

  if (plan !== undefined) {
    const planned = applyPlanDrivenHtmlRefinement(cleanHtml, instruction, plan)
    if (planned.changed) return planned
  }

  return applyInstructionDrivenHtmlRefinement(cleanHtml, instruction)
}

export const normalizePlanString = (
  value: unknown,
  max: number,
): string | undefined =>
  typeof value === 'string' && value.trim()
    ? truncateText(value.trim(), max)
    : undefined

export const normalizeChatRefinementPlan = (
  value: unknown,
): ChatRefinementPlan | undefined => {
  if (!isJsonObject(value)) return undefined

  const replacements = Array.isArray(value.replacements)
    ? value.replacements
        .map((entry) =>
          isJsonObject(entry)
            ? {
                oldText: normalizePlanString(entry.oldText, 500),
                newText: normalizePlanString(entry.newText, 500),
              }
            : {},
        )
        .filter(
          (entry) => entry.oldText !== undefined && entry.newText !== undefined,
        )
        .slice(0, 8)
    : undefined

  const sections = Array.isArray(value.sections)
    ? value.sections
        .map((entry) =>
          isJsonObject(entry)
            ? {
                kind: normalizePlanString(entry.kind, 80),
                title: normalizePlanString(entry.title, 140),
                body: normalizePlanString(entry.body, 800),
              }
            : {},
        )
        .filter(
          (entry) => entry.title !== undefined || entry.body !== undefined,
        )
        .slice(0, 4)
    : undefined

  const plan: ChatRefinementPlan = {
    headline: normalizePlanString(value.headline, 180),
    ctaLabel: normalizePlanString(value.ctaLabel, 120),
    replacements,
    sections,
    assistantSummary: normalizePlanString(value.assistantSummary, 500),
  }

  return plan.headline !== undefined ||
    plan.ctaLabel !== undefined ||
    (plan.replacements?.length ?? 0) > 0 ||
    (plan.sections?.length ?? 0) > 0
    ? plan
    : undefined
}

export const parseChatRefinementPlanJson = (
  value: string | undefined,
): ChatRefinementPlan | undefined => {
  if (value === undefined || !value.trim()) return undefined

  try {
    return normalizeChatRefinementPlan(JSON.parse(value))
  } catch {
    return undefined
  }
}

export const applyPlanDrivenHtmlRefinement = (
  html: string,
  instruction: string,
  plan: ChatRefinementPlan,
): ChatPreviewRefinement => {
  let refinedHtml = html
  const summaries: string[] = []

  for (const replacement of plan.replacements ?? []) {
    if (replacement.oldText === undefined || replacement.newText === undefined)
      continue
    const result = applyPreviewTextEdit(
      refinedHtml,
      replacement.oldText,
      replacement.newText,
    )
    if (result.replaced) {
      refinedHtml = result.html
      summaries.push(`replaced "${truncateText(replacement.oldText, 48)}"`)
    }
  }

  if (plan.headline !== undefined) {
    const result = replaceFirstElementText(
      refinedHtml,
      ['h1', 'h2'],
      plan.headline,
    )
    if (result.replaced) {
      refinedHtml = result.html
      summaries.push('updated the primary headline')
    }
  }

  if (plan.ctaLabel !== undefined) {
    const result = replaceFirstElementText(
      refinedHtml,
      ['button', 'a'],
      plan.ctaLabel,
    )
    if (result.replaced) {
      refinedHtml = result.html
      summaries.push('updated the main call-to-action')
    }
  }

  for (const section of plan.sections ?? []) {
    const title = section.title ?? `${section.kind ?? 'AI'} refinement`
    const body = section.body ?? instruction
    refinedHtml = appendHtmlBeforeClose(
      refinedHtml,
      buildGeneratedRefinementSection(title, body),
    )
    summaries.push(`added ${truncateText(title, 48)}`)
  }

  return {
    html: refinedHtml,
    summary:
      plan.assistantSummary ??
      (summaries.length > 0
        ? `Applied AI refinement plan: ${summaries.join(', ')}.`
        : 'AI refinement plan did not match an editable target.'),
    changed: refinedHtml !== html,
  }
}

export const escapeOpenUiString = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

export const sanitizeOpenUiComment = (value: string): string =>
  truncateText(normalizeSpaces(value), 240).replace(/\*\//g, '* /')

export const replaceFirstOpenUiCallText = (
  source: string,
  callNames: string[],
  text: string,
): { source: string; replaced: boolean } => {
  const safeText = escapeOpenUiString(truncateText(text, 180))

  for (const callName of callNames) {
    const pattern = new RegExp(`\\b${callName}\\(\\s*"([^"]*)"`, 'i')
    if (!pattern.test(source)) continue

    return {
      source: source.replace(pattern, `${callName}("${safeText}"`),
      replaced: true,
    }
  }

  return { source, replaced: false }
}

export const appendOpenUiRefinementNote = (
  source: string,
  instruction: string,
  summary: string,
  previewVersion: number,
): string => {
  const cleanSource = source.replace(CHAT_OPENUI_REFINEMENT_RE, '').trimEnd()
  const note = [
    `// ship-fast-chat-refinement:${previewVersion}`,
    `// instruction: ${sanitizeOpenUiComment(instruction)}`,
    `// summary: ${sanitizeOpenUiComment(summary)}`,
  ].join('\n')

  return cleanSource.length > 0 ? `${cleanSource}\n${note}` : note
}

export const buildChatRefinedOpenUiSource = (
  source: string | undefined,
  instruction: string,
  summary: string,
  previewVersion: number,
  plan?: ChatRefinementPlan,
): string | undefined => {
  if (source === undefined) return undefined

  const intent = getChatInstructionIntent(instruction)
  const cleanSource = source.replace(CHAT_OPENUI_REFINEMENT_RE, '').trimEnd()
  let refinedSource = cleanSource

  for (const replacement of plan?.replacements ?? []) {
    if (replacement.oldText === undefined || replacement.newText === undefined)
      continue
    refinedSource = applyPreviewTextEdit(
      refinedSource,
      replacement.oldText,
      replacement.newText,
    ).html
  }

  if (plan?.headline !== undefined) {
    const result = replaceFirstOpenUiCallText(
      refinedSource,
      ['Text', 'Heading', 'HeroTitle', 'Title'],
      plan.headline,
    )
    refinedSource = result.source
  } else if (intent.kind === 'headline') {
    const result = replaceFirstOpenUiCallText(
      refinedSource,
      ['Text', 'Heading', 'HeroTitle', 'Title'],
      intent.targetText,
    )
    refinedSource = result.source
  }

  if (plan?.ctaLabel !== undefined) {
    const result = replaceFirstOpenUiCallText(
      refinedSource,
      ['Button', 'Link', 'Action', 'Text'],
      plan.ctaLabel,
    )
    refinedSource = result.source
  } else if (intent.kind === 'cta') {
    const result = replaceFirstOpenUiCallText(
      refinedSource,
      ['Button', 'Link', 'Action', 'Text'],
      intent.targetText,
    )
    refinedSource = result.source
  } else if (intent.kind === 'replace') {
    refinedSource = applyPreviewTextEdit(
      refinedSource,
      intent.oldText,
      intent.newText,
    ).html
  }

  return appendOpenUiRefinementNote(
    refinedSource,
    instruction,
    summary,
    previewVersion,
  )
}

export const replaceFirstMatchingJsonString = (
  value: unknown,
  keyPattern: RegExp,
  newText: string,
): { value: unknown; replaced: boolean } => {
  if (Array.isArray(value)) {
    let replaced = false
    const next = value.map((item) => {
      if (replaced) return item
      const result = replaceFirstMatchingJsonString(item, keyPattern, newText)
      replaced = result.replaced
      return result.value
    })
    return { value: next, replaced }
  }

  if (!isJsonObject(value)) return { value, replaced: false }

  let replaced = false
  const next: JsonObject = {}
  for (const [key, item] of Object.entries(value)) {
    if (!replaced && keyPattern.test(key) && typeof item === 'string') {
      next[key] = truncateText(newText, 500)
      replaced = true
      continue
    }

    if (!replaced) {
      const result = replaceFirstMatchingJsonString(item, keyPattern, newText)
      next[key] = result.value
      replaced = result.replaced
      continue
    }

    next[key] = item
  }

  return { value: next, replaced }
}

export const replaceFirstJsonText = (
  value: unknown,
  oldText: string,
  newText: string,
): { value: unknown; replaced: boolean } => {
  if (typeof value === 'string') {
    const result = applyPreviewTextEdit(value, oldText, newText)
    return { value: result.html, replaced: result.replaced }
  }

  if (Array.isArray(value)) {
    let replaced = false
    const next = value.map((item) => {
      if (replaced) return item
      const result = replaceFirstJsonText(item, oldText, newText)
      replaced = result.replaced
      return result.value
    })
    return { value: next, replaced }
  }

  if (!isJsonObject(value)) return { value, replaced: false }

  let replaced = false
  const next: JsonObject = {}
  for (const [key, item] of Object.entries(value)) {
    if (replaced) {
      next[key] = item
      continue
    }

    const result = replaceFirstJsonText(item, oldText, newText)
    next[key] = result.value
    replaced = result.replaced
  }

  return { value: next, replaced }
}

export const appendChatRefinementToSiteSpec = (
  spec: JsonObject,
  instruction: string,
  summary: string,
  previewVersion: number,
  now: number,
): JsonObject => {
  const existing = spec.shipFastChatRefinements
  const refinements = Array.isArray(existing) ? existing : []

  return {
    ...spec,
    shipFastChatRefinements: [
      ...refinements.slice(-24),
      {
        instruction: truncateText(instruction, 1000),
        summary,
        previewVersion,
        createdAt: now,
      },
    ],
  }
}

export const buildChatRefinedSiteSpecJson = (
  specJson: string | undefined,
  instruction: string,
  summary: string,
  previewVersion: number,
  now: number,
  plan?: ChatRefinementPlan,
): string | undefined => {
  if (specJson === undefined) return undefined

  try {
    const parsed: unknown = JSON.parse(specJson)
    if (!isJsonObject(parsed)) return specJson

    const intent = getChatInstructionIntent(instruction)
    let nextSpec: unknown = parsed

    for (const replacement of plan?.replacements ?? []) {
      if (
        replacement.oldText === undefined ||
        replacement.newText === undefined
      )
        continue
      nextSpec = replaceFirstJsonText(
        nextSpec,
        replacement.oldText,
        replacement.newText,
      ).value
    }

    if (plan?.headline !== undefined) {
      nextSpec = replaceFirstMatchingJsonString(
        nextSpec,
        /headline|heading|heroTitle|title|name/i,
        plan.headline,
      ).value
    } else if (intent.kind === 'headline') {
      nextSpec = replaceFirstMatchingJsonString(
        nextSpec,
        /headline|heading|heroTitle|title|name/i,
        intent.targetText,
      ).value
    }

    if (plan?.ctaLabel !== undefined) {
      nextSpec = replaceFirstMatchingJsonString(
        nextSpec,
        /cta|button|label|action|callToAction/i,
        plan.ctaLabel,
      ).value
    } else if (intent.kind === 'cta') {
      nextSpec = replaceFirstMatchingJsonString(
        nextSpec,
        /cta|button|label|action|callToAction/i,
        intent.targetText,
      ).value
    } else if (intent.kind === 'replace') {
      nextSpec = replaceFirstJsonText(
        nextSpec,
        intent.oldText,
        intent.newText,
      ).value
    }

    if (!isJsonObject(nextSpec)) return specJson

    return JSON.stringify(
      appendChatRefinementToSiteSpec(
        nextSpec,
        instruction,
        summary,
        previewVersion,
        now,
      ),
    )
  } catch {
    return specJson
  }
}
