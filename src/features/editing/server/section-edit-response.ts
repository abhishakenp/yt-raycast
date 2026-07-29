import { Buffer } from 'node:buffer'
import { brotliDecompressSync } from 'node:zlib'

import type { Tool } from '@tanstack/ai'
import { createCodeMode } from '@tanstack/ai-code-mode'
import { createNodeIsolateDriver } from '@tanstack/ai-isolate-node'
import { ConvexHttpClient } from 'convex/browser'
import { renderToStaticMarkup } from 'react-dom/server'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import type { InspectorSelection } from '@/features/editing/element-path'
import {
  buildElementDeleteCommand,
  buildImageRemoveCommand,
  buildImageReplaceCommand,
  buildLinkEditCommand,
  buildSectionMoveCommand,
  buildSectionRewriteCommand,
  buildStyleApplyCommand,
  buildTextRewriteCommand,
  buildUndoCommand,
  type InlineEditPersistenceCommand,
} from '@/features/editing/lib/inline-edit-commands'
import { INLINE_EDIT_TOOL_DEFINITIONS } from '@/features/editing/lib/inline-edit-tool-definitions'

type SectionEditClient = Pick<ConvexHttpClient, 'query' | 'mutation'>

type InlineEditEntitlementCode =
  | 'ok'
  | 'auth_required'
  | 'not_found'
  | 'forbidden'
  | 'payment_required'

type InlineEditEntitlementResult = {
  allowed: boolean
  code: InlineEditEntitlementCode
  message?: string
}

type InlineEditEntitlementClient = (input: {
  sessionId: string
  anonymousOwnerSecret?: string
  bearerToken: string | null
}) => Promise<InlineEditEntitlementResult>

type JsonBody = Record<string, unknown>

type GenerateText = (
  model: string,
  system: string,
  user: string,
  signal: AbortSignal,
  retries?: number,
) => Promise<string>
type GenerateWithTools = (
  model: string,
  system: string,
  user: string,
  tools: Tool[],
  signal: AbortSignal,
  retries?: number,
) => Promise<unknown>
type GenerateTextRuntime = {
  generateText: GenerateText
  generateWithTools: GenerateWithTools
  DEFAULT_MODEL: string
}
type CapsuleSmokeGlobals = typeof globalThis & {
  React?: typeof import('react')
  __jsxRuntime?: typeof import('react/jsx-runtime')
}

const SECTION_EDIT_TIMEOUT_MS = 45000
const DEFAULT_SECTION_EDIT_MODEL = 'openai/gpt-oss-120b'
const MAX_INSTRUCTION_CHARS = 2000
const MAX_SELECTION_HTML_CHARS = 8000
const MAX_TSX_SOURCE_CHARS = 30000
const MAX_AUTO_FIX_RETRIES = 3

function asSessionId(sessionId: string): Id<'sessions'> {
  return sessionId as Id<'sessions'>
}

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}

async function loadGenerateTextRuntime(): Promise<GenerateTextRuntime> {
  const [{ generateText, generateWithTools }, { DEFAULT_MODEL }] =
    await Promise.all([
      import('@ship-fast/engine'),
      import('@ship-fast/engine/model-list.js'),
    ])
  return {
    generateText,
    generateWithTools,
    DEFAULT_MODEL,
  }
}

const resolveInlineStockImage: ResolveInlineStockImage = async (input) => {
  const { resolveStockImage } = await import('@/lib/stock-image')
  return resolveStockImage(input)
}

function getString(body: JsonBody, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = body[key]
    if (typeof value === 'string') return value
  }
  return undefined
}

function getOwnerSecret(request: Request, body: JsonBody): string | undefined {
  return (
    getString(body, ['anonymousOwnerSecret']) ??
    request.headers.get('x-anonymous-owner-secret') ??
    undefined
  )
}

function getBearerToken(request: Request): string | null {
  const auth = request.headers.get('authorization') ?? ''
  const match = auth.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || null
}

function isClerkAuthDisabled(): boolean {
  return (process.env.VITE_DISABLE_CLERK ?? '').trim().toLowerCase() === 'true'
}

/**
 * Default entitlement client: calls the Convex `checkInlineEditEntitlementQuery`
 * with the caller's Clerk token (setAuth) so ownership + Pro status are verified
 * server-side against signed auth identity — no forgeable client claim.
 */
function createDefaultInlineEditEntitlementClient(
  client: SectionEditClient,
): InlineEditEntitlementClient {
  return async ({ sessionId, anonymousOwnerSecret, bearerToken }) => {
    const httpClient = client as ConvexHttpClient
    if (bearerToken) httpClient.setAuth?.(bearerToken)
    return await httpClient.query(
      api.sessions.checkInlineEditEntitlementQuery,
      {
        sessionId: sessionId as never,
        anonymousOwnerSecret,
      },
    )
  }
}

async function readJsonBody(request: Request): Promise<JsonBody> {
  const text = await request.text()
  return JSON.parse(text) as JsonBody
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}…` : value
}

type GenerationViewSnapshot = {
  homeModule?: { source: string } | null
  latestPreview?: { version?: number } | null
}

type InlineToolExecutionResult = {
  tool: string
  sessionId: string
  previewVersion: number
  saved: boolean
  translatedEdit?: {
    locale: string
    sourceText: string
    translation: string
  }
}
type ResolveInlineStockImage = (input: {
  alt?: string
  query?: string
  w?: number
  h?: number
}) => Promise<{
  imageUrl: string
  source: 'pexels' | 'unsplash' | 'picsum'
  query: string
}>

const INLINE_EDIT_CODE_MODE_TOOL_DEFINITIONS = INLINE_EDIT_TOOL_DEFINITIONS

function isTranslatedEditOutput(
  value: unknown,
): value is NonNullable<InlineToolExecutionResult['translatedEdit']> {
  return Boolean(
    value &&
    typeof value === 'object' &&
    typeof (value as { locale?: unknown }).locale === 'string' &&
    typeof (value as { sourceText?: unknown }).sourceText === 'string' &&
    typeof (value as { translation?: unknown }).translation === 'string',
  )
}

/** Determine if the session is HTML (iframe srcDoc) or OpenUI (component tree). */
function isHtmlSession(snapshot: GenerationViewSnapshot): boolean {
  const source = snapshot.homeModule?.source ?? ''
  return /^\s*(?:<!DOCTYPE\s+html|<html[\s>]|<[a-z][\w:-]*(?:\s|>|\/>))/i.test(
    source.trim(),
  )
}

// ─── LLM Prompt Builders ────────────────────────────────────────────────────

function buildHtmlToolOnlyEditPrompt(
  selection: InspectorSelection,
  instruction: string,
  previewHtml: string,
): { system: string; user: string } {
  const system = [
    'You are editing an HTML page with inline editor tools.',
    'Use only the available tools when the requested edit can be represented as text, style, image, link, deletion, or section rewrite operations.',
    'For visual styling requests, call styleApply. For copy requests, call textRewrite.',
    'If no available tool can perform the edit, return no tool calls.',
  ].join('\n')

  const user = [
    `User instruction: ${truncate(instruction, MAX_INSTRUCTION_CHARS)}`,
    '',
    `Selected element tag: ${selection.tag}`,
    `Selected element path: ${selection.elementPath}`,
    `Selected element text: ${truncate(selection.textContent, 1000)}`,
    `Selected element outerHTML: ${truncate(
      selection.outerHTML,
      MAX_SELECTION_HTML_CHARS,
    )}`,
    '',
    'Current full page HTML:',
    truncate(previewHtml, 50000),
    '',
    'Call the smallest sufficient inline editor tools now.',
  ].join('\n')

  return { system, user }
}

function buildHtmlSectionEditPrompt(
  selection: InspectorSelection,
  instruction: string,
  previewHtml: string,
): { system: string; user: string } {
  const system = [
    'You are a frontend engineer editing a section of an HTML page.',
    'You will receive the current full HTML of the page and a user instruction.',
    'Return ONLY the complete replacement HTML page (full <!DOCTYPE html>...</html>).',
    'Preserve all content outside the targeted section unless the instruction explicitly asks to change it.',
    'Keep all existing styles, scripts, and structure intact except for the requested edit.',
    'Do not add comments or explanations — output only the HTML.',
  ].join('\n')

  const user = [
    `User instruction: ${truncate(instruction, MAX_INSTRUCTION_CHARS)}`,
    '',
    `Selected element tag: ${selection.tag}`,
    `Selected element path: ${selection.elementPath}`,
    `Selected element outerHTML: ${truncate(
      selection.outerHTML,
      MAX_SELECTION_HTML_CHARS,
    )}`,
    '',
    'Current full page HTML:',
    truncate(previewHtml, 50000),
    '',
    'Return the complete replacement HTML page now.',
  ].join('\n')

  return { system, user }
}

function buildOpenUiCapsuleEditPrompt(
  selection: InspectorSelection,
  instruction: string,
  capsuleSource: string,
  similarCapsules: string[],
): { system: string; user: string } {
  const system = [
    'You are a React/TypeScript engineer rewriting an OpenUI capsule component.',
    'The capsule is a React component that receives props and renders a UI section.',
    'You will receive the capsule source code and a user instruction.',
    'The component must accept a props object and render the section.',
    'Use inline Tailwind classes for styling. Do not import external CSS.',
    'You may import from "react" only. Do not import other modules.',
    'Preserve interactivity (onClick, useState, etc.) where appropriate.',
    'Do not add comments or explanations — output only the TSX code.',
    'The component signature must be: `function ComponentName(props: Record<string, any>): JSX.Element`',
    'Export it as default: `export default ComponentName`',
  ].join('\n')

  const user = [
    `User instruction: ${truncate(instruction, MAX_INSTRUCTION_CHARS)}`,
    '',
    `Target capsule: ${selection.openuiComponent}`,
    `Source variable: ${selection.openuiVar ?? '(none)'}`,
    `Selected element: ${selection.tag} at ${selection.elementPath}`,
    `Selected element outerHTML: ${truncate(
      selection.outerHTML,
      MAX_SELECTION_HTML_CHARS,
    )}`,
    '',
    'Current capsule source:',
    truncate(capsuleSource, MAX_TSX_SOURCE_CHARS),
    '',
    similarCapsules.length > 0
      ? `Similar capsules for reference (do not copy, just for pattern awareness): ${similarCapsules.join(', ')}`
      : '',
    '',
    'Return the complete TSX module now.',
  ].join('\n')

  return { system, user }
}

function buildOpenUiToolOnlyEditPrompt(
  selection: InspectorSelection,
  instruction: string,
  source: string,
): { system: string; user: string } {
  const system = [
    'You are editing an OpenUI-generated page with inline editor tools.',
    'Use only the available tools when the requested edit can be represented as text, style, image, link, deletion, section move, or section rewrite operations.',
    'For visual styling requests, call styleApply. For copy requests, call textRewrite.',
    'Do not write TSX source in the response.',
    'If no available tool can perform the edit, return no tool calls.',
  ].join('\n')

  const user = [
    `User instruction: ${truncate(instruction, MAX_INSTRUCTION_CHARS)}`,
    '',
    `Selected element tag: ${selection.tag}`,
    `Selected element path: ${selection.elementPath}`,
    `Selected element text: ${truncate(selection.textContent, 1000)}`,
    `Selected element outerHTML: ${truncate(
      selection.outerHTML,
      MAX_SELECTION_HTML_CHARS,
    )}`,
    '',
    'Current OpenUI page source:',
    truncate(source, MAX_TSX_SOURCE_CHARS),
    '',
    'Call the smallest sufficient inline editor tools now.',
  ].join('\n')

  return { system, user }
}

function selectionClassAnchor(selection: InspectorSelection): string {
  const match = selection.outerHTML?.match(/\sclass=(["'])(.*?)\1/i)
  return match?.[2]?.trim() ?? ''
}

function selectionIdAnchor(selection: InspectorSelection): string {
  const match = selection.outerHTML?.match(/\sid=(["'])(.*?)\1/i)
  const id = match?.[2]?.trim()
  return id ? `#${id}` : ''
}

const STYLE_SOURCE_ATTRIBUTE_ANCHORS = [
  'data-sf-export-page', // DOM-based, not capsule-specific
  'data-openui-var', // Legacy capsule support, deprecated
  'data-openui-component', // Legacy capsule support, deprecated
] as const

function escapeAttributeSelectorValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function selectionAttributeAnchor(selection: InspectorSelection): string {
  for (const attributeName of STYLE_SOURCE_ATTRIBUTE_ANCHORS) {
    const pattern = new RegExp(`\\s${attributeName}=(["'])(.*?)\\1`, 'i')
    const match = selection.outerHTML?.match(pattern)
    const value = match?.[2]?.trim()
    if (value) {
      return `[${attributeName}="${escapeAttributeSelectorValue(value)}"]`
    }
  }
  return ''
}

function selectionOpenUiVar(selection: InspectorSelection): string {
  if (selection.openuiVar) return selection.openuiVar
  const match = selection.outerHTML?.match(/\sdata-openui-var=(["'])(.*?)\1/i)
  return match?.[2]?.trim() ?? ''
}

function selectionStyleAnchor(selection: InspectorSelection): string {
  return (
    selectionClassAnchor(selection) ||
    selectionIdAnchor(selection) ||
    selectionAttributeAnchor(selection)
  )
}

function selectionHasAnchor(
  selection: InspectorSelection,
  anchor: string | undefined,
): boolean {
  const normalizedAnchor = anchor?.trim()
  if (!normalizedAnchor) return false
  const selectedTag = selection.tag.trim().toLowerCase()
  if (normalizedAnchor.toLowerCase() === selectedTag) return false

  const attributeAnchor = normalizedAnchor.match(
    /^\[(data-openui-var|data-openui-component|data-sf-export-page)=(["'])(.*?)\2\]$/,
  )
  if (attributeAnchor) {
    const [, attributeName, , rawExpected] = attributeAnchor
    const expected = rawExpected.replace(/\\(["'\\])/g, '$1')
    const pattern = new RegExp(`\\s${attributeName}=(["'])(.*?)\\1`, 'i')
    const actual = selection.outerHTML?.match(pattern)?.[2]?.trim()
    return actual === expected
  }

  if (normalizedAnchor.startsWith('#')) {
    return selectionIdAnchor(selection) === normalizedAnchor
  }

  const classTokens = new Set(
    selectionClassAnchor(selection).split(/\s+/).filter(Boolean),
  )
  const anchorTokens = normalizedAnchor.split(/\s+/).filter(Boolean)
  return (
    anchorTokens.length > 0 &&
    anchorTokens.every((token) => classTokens.has(token))
  )
}

function normalizeStyleApplyInput(
  input: Parameters<typeof buildStyleApplyCommand>[0],
  selection: InspectorSelection,
): Parameters<typeof buildStyleApplyCommand>[0] {
  if (input.targetScope && input.targetScope !== 'element') {
    const scopedAnchor = selectionScopedAnchor(selection, input.targetScope)
    if (scopedAnchor) {
      return {
        ...input,
        sourceAnchor: scopedAnchor,
        className: undefined,
        selector: undefined,
        targetLabel: input.targetLabel ?? scopedAnchor,
      }
    }
  }

  const selectedAnchor = selectionStyleAnchor(selection)
  const requestedAnchor =
    input.sourceAnchor ?? input.className ?? input.selector
  if (!requestedAnchor || selectionHasAnchor(selection, requestedAnchor)) {
    return input
  }
  return {
    ...input,
    sourceAnchor: selectedAnchor || input.sourceAnchor,
    className: undefined,
    selector: undefined,
    targetLabel:
      input.targetLabel === requestedAnchor
        ? selectedAnchor
        : input.targetLabel,
  }
}

function normalizeElementDeleteInput(
  input: Parameters<typeof buildElementDeleteCommand>[0],
  selection: InspectorSelection,
): Parameters<typeof buildElementDeleteCommand>[0] {
  if (input.targetScope && input.targetScope !== 'element') {
    const scopedAnchor = selectionScopedAnchor(selection, input.targetScope)
    if (scopedAnchor) {
      return {
        ...input,
        sourceAnchor: scopedAnchor,
      }
    }
  }
  return input
}

function normalizeImageReplaceInput(
  input: Parameters<typeof buildImageReplaceCommand>[0],
  selection: InspectorSelection,
): Parameters<typeof buildImageReplaceCommand>[0] {
  if (input.targetScope && input.targetScope !== 'element') {
    const scopedAnchor = selectionScopedAnchor(selection, input.targetScope)
    if (scopedAnchor) {
      return {
        ...input,
        sourceAnchor: scopedAnchor,
      }
    }
  }
  return input
}

function normalizeImageRemoveInput(
  input: Parameters<typeof buildImageRemoveCommand>[0],
  selection: InspectorSelection,
): Parameters<typeof buildImageRemoveCommand>[0] {
  if (input.targetScope && input.targetScope !== 'element') {
    const scopedAnchor = selectionScopedAnchor(selection, input.targetScope)
    if (scopedAnchor) {
      return {
        ...input,
        sourceAnchor: scopedAnchor,
      }
    }
  }
  return input
}

function selectionOpenUiVarAnchor(selection: InspectorSelection): string {
  const openUiVar = selectionOpenUiVar(selection)
  return openUiVar
    ? `[data-openui-var="${escapeAttributeSelectorValue(openUiVar)}"]`
    : ''
}

function selectionSectionAnchor(selection: InspectorSelection): string {
  return selection.sectionAnchor ?? selectionOpenUiVarAnchor(selection)
}

function selectionPageAnchor(selection: InspectorSelection): string {
  if (selection.pageLabel) {
    return `[data-sf-export-page="${escapeAttributeSelectorValue(
      selection.pageLabel,
    )}"]`
  }
  return selectionAttributeAnchor(selection)
}

function selectionScopedAnchor(
  selection: InspectorSelection,
  targetScope: 'section' | 'page',
): string {
  return targetScope === 'section'
    ? selectionSectionAnchor(selection)
    : selectionPageAnchor(selection) || selectionSectionAnchor(selection)
}

function selectionImageSrcAnchor(selection: InspectorSelection): string {
  const match = selection.outerHTML?.match(/\ssrc=(["'])(.*?)\1/i)
  return match?.[2]?.trim() ?? ''
}

function selectionImageAltAnchor(selection: InspectorSelection): string {
  const imageMatch = selection.outerHTML?.match(/<img\b[^>]*>/i)
  const altMatch = imageMatch?.[0].match(/\salt=(["'])(.*?)\1/i)
  return altMatch?.[2]?.trim() ?? ''
}

function selectionLinkHref(selection: InspectorSelection): string {
  const anchorMatch = selection.outerHTML?.match(/<a\b[^>]*>/i)
  const hrefMatch = anchorMatch?.[0].match(/\shref=(["'])(.*?)\1/i)
  return hrefMatch?.[2]?.trim() ?? ''
}

function stockDimension(
  value: number | string | undefined,
  fallback: number,
): number {
  const numeric =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value.trim())
        : undefined
  return numeric !== undefined && Number.isFinite(numeric) && numeric > 0
    ? Math.round(numeric)
    : fallback
}

function getStockImageDimensions(
  input: {
    width?: number | string
    height?: number | string
    targetScope?: 'element' | 'section' | 'page'
  },
  selection: InspectorSelection,
): { w: number; h: number } {
  const selectedWidth = Math.round(selection.boundingBox.width) || 800
  const selectedHeight = Math.round(selection.boundingBox.height) || 600

  if (input.targetScope && input.targetScope !== 'element') {
    const fallbackWidth = Math.max(selectedWidth, 1200)
    const fallbackHeight = Math.max(selectedHeight, 600)
    return {
      w: stockDimension(input.width, fallbackWidth),
      h: stockDimension(input.height, fallbackHeight),
    }
  }

  return {
    w: stockDimension(input.width, selectedWidth),
    h: stockDimension(input.height, selectedHeight),
  }
}

function executeInlineEditCommand(
  client: SectionEditClient,
  command: InlineEditPersistenceCommand,
): Promise<unknown> {
  return client.mutation(command.mutation, command.args)
}

async function buildServerInlineEditCommand({
  anonymousOwnerSecret,
  currentPreviewVersion,
  currentSource,
  input,
  instruction,
  resolveStockImage,
  selection,
  sessionId,
  toolName,
}: {
  anonymousOwnerSecret: string | undefined
  currentPreviewVersion?: number
  currentSource?: string
  input: unknown
  instruction: string
  resolveStockImage: ResolveInlineStockImage
  selection: InspectorSelection
  sessionId: string
  toolName: string
}): Promise<InlineEditPersistenceCommand> {
  const sourceAnchor =
    toolName === 'styleApply'
      ? selectionStyleAnchor(selection) ||
        selectionSectionAnchor(selection) ||
        selectionImageAltAnchor(selection) ||
        selectionImageSrcAnchor(selection) ||
        selection.textContent
      : toolName === 'imageReplace' || toolName === 'imageRemove'
        ? selectionImageAltAnchor(selection) ||
          selectionImageSrcAnchor(selection) ||
          selectionStyleAnchor(selection) ||
          selectionSectionAnchor(selection) ||
          selection.textContent
        : selectionStyleAnchor(selection) ||
          selectionImageAltAnchor(selection) ||
          selectionImageSrcAnchor(selection) ||
          selectionSectionAnchor(selection) ||
          selection.textContent
  const commandContext = {
    sessionId,
    anonymousOwnerSecret,
    currentSource,
    instruction,
    openuiVar: selectionOpenUiVar(selection) || undefined,
    linkHref: selectionLinkHref(selection) || undefined,
    selectedText: selection.textContent,
    sourceAnchor,
    selectionHtml: selection.outerHTML || undefined,
    selectedTag: selection.tag || undefined,
    currentPreviewVersion,
  }

  if (toolName === 'textRewrite') {
    return buildTextRewriteCommand(
      input as Parameters<typeof buildTextRewriteCommand>[0],
      commandContext,
    )
  }
  if (toolName === 'styleApply') {
    return buildStyleApplyCommand(
      normalizeStyleApplyInput(
        input as Parameters<typeof buildStyleApplyCommand>[0],
        selection,
      ),
      commandContext,
    )
  }
  if (toolName === 'imageReplace') {
    const imageInput = normalizeImageReplaceInput(
      input as Parameters<typeof buildImageReplaceCommand>[0],
      selection,
    )
    if (!imageInput.src && imageInput.query) {
      const dimensions = getStockImageDimensions(imageInput, selection)
      const resolved = await resolveStockImage({
        query: imageInput.query,
        alt: imageInput.alt ?? imageInput.query,
        ...dimensions,
      })
      return buildImageReplaceCommand(
        { ...imageInput, src: resolved.imageUrl },
        commandContext,
      )
    }
    return buildImageReplaceCommand(imageInput, commandContext)
  }
  if (toolName === 'imageRemove') {
    return buildImageRemoveCommand(
      normalizeImageRemoveInput(
        input as Parameters<typeof buildImageRemoveCommand>[0],
        selection,
      ),
      commandContext,
    )
  }
  if (toolName === 'linkEdit') {
    return buildLinkEditCommand(
      input as Parameters<typeof buildLinkEditCommand>[0],
      commandContext,
    )
  }
  if (toolName === 'elementDelete') {
    return buildElementDeleteCommand(
      normalizeElementDeleteInput(
        input as Parameters<typeof buildElementDeleteCommand>[0],
        selection,
      ),
      commandContext,
    )
  }
  if (toolName === 'sectionMove') {
    return buildSectionMoveCommand(
      input as Parameters<typeof buildSectionMoveCommand>[0],
      commandContext,
    )
  }
  if (toolName === 'sectionRewrite') {
    return buildSectionRewriteCommand(
      input as Parameters<typeof buildSectionRewriteCommand>[0],
      commandContext,
    )
  }
  if (toolName === 'undoLastEdit') {
    return buildUndoCommand(
      input as Parameters<typeof buildUndoCommand>[0],
      commandContext,
    )
  }
  throw new Error(`Unsupported inline editor tool: ${toolName}`)
}

async function runInlineEditsWithCodeMode({
  anonymousOwnerSecret,
  client,
  currentPreviewVersion,
  currentSource,
  generateWithTools,
  instruction,
  model,
  prompt,
  resolveStockImage,
  selection,
  sessionId,
  signal,
}: {
  anonymousOwnerSecret: string | undefined
  client: SectionEditClient
  currentPreviewVersion?: number
  currentSource?: string
  generateWithTools: GenerateWithTools
  instruction: string
  model: string
  prompt: { system: string; user: string }
  resolveStockImage: ResolveInlineStockImage
  selection: InspectorSelection
  sessionId: string
  signal: AbortSignal
}): Promise<InlineToolExecutionResult[]> {
  const results: InlineToolExecutionResult[] = []
  let workingSource = currentSource
  let workingPreviewVersion = currentPreviewVersion
  const serverTools = INLINE_EDIT_CODE_MODE_TOOL_DEFINITIONS.map((tool) =>
    tool.server(async (input) => {
      const command = await buildServerInlineEditCommand({
        anonymousOwnerSecret,
        currentPreviewVersion: workingPreviewVersion,
        currentSource: workingSource,
        input,
        instruction,
        resolveStockImage,
        selection,
        sessionId,
        toolName: tool.name,
      })
      const mutationResult = await executeInlineEditCommand(client, command)
      const record = mutationResult as {
        translatedEdit?: unknown
        previewVersion?: unknown
        saved?: unknown
      }
      if (
        typeof record.previewVersion !== 'number' ||
        typeof record.saved !== 'boolean'
      ) {
        throw new Error('Inline edit mutation returned invalid tool output')
      }
      const result = {
        tool: tool.name,
        sessionId,
        previewVersion: record.previewVersion,
        saved: record.saved,
        ...(isTranslatedEditOutput(record.translatedEdit)
          ? { translatedEdit: record.translatedEdit }
          : {}),
      } satisfies InlineToolExecutionResult
      if (
        command.kind === 'createEdit' &&
        command.args.editType === 'ai_rewrite' &&
        typeof command.args.afterText === 'string'
      ) {
        workingSource = command.args.afterText
      }
      // Keep the working preview version current across multiple tool calls
      // in the same code-mode session — otherwise a later undoLastEdit call
      // would compute its target against the STALE version read at session
      // start, undoing further back than the single edit it's meant to undo.
      workingPreviewVersion = record.previewVersion
      results.push(result)
      return result
    }),
  )
  const codeMode = createCodeMode({
    driver: createNodeIsolateDriver(),
    tools: serverTools,
    timeout: 30_000,
  })

  await generateWithTools(
    model,
    [prompt.system, codeMode.systemPrompt].filter(Boolean).join('\n\n'),
    prompt.user,
    [codeMode.tool],
    signal,
    1,
  )

  return results
}

// ─── TSX Compilation + Validation ───────────────────────────────────────────

type CompileResult =
  | { ok: true; compiledJs: string }
  | { ok: false; error: string }

async function compileTsx(tsxSource: string): Promise<CompileResult> {
  try {
    // Dynamic import so esbuild (and its native fsevents dep) is only loaded
    // server-side, not pulled into Vite's client dependency scan.
    const esbuild = await import('esbuild')
    const result = await esbuild.build({
      stdin: {
        contents: tsxSource,
        resolveDir: process.cwd(),
        loader: 'tsx',
      },
      bundle: true,
      format: 'esm',
      target: 'es2020',
      jsx: 'automatic',
      write: false,
      // Keep react external — we'll rewrite the import statements to use
      // global React (available in the browser) so the compiled JS can be
      // loaded via Blob URL without an import map.
      external: ['react', 'react/jsx-runtime'],
    })
    const output = result.outputFiles[0]
    if (!output) {
      return { ok: false, error: 'esbuild produced no output' }
    }
    let compiledJs = new TextDecoder().decode(output.contents)
    // Replace external React imports with global references so the compiled
    // JS can be loaded via Blob URL in the browser (where there's no import
    // map) and via data: URL in Node.js (where globalThis.React is set up
    // by the smoke test).
    compiledJs = compiledJs
      .replace(
        /import\s+React\s+from\s+["']react["'];?\s*/g,
        'const React = globalThis.React;',
      )
      .replace(
        /import\s+\{\s*([^}]+)\s*\}\s+from\s+["']react\/jsx-runtime["'];?\s*/g,
        'const { $1 } = globalThis.__jsxRuntime;',
      )
      .replace(
        /import\s+\{\s*([^}]+)\s*\}\s+from\s+["']react["'];?\s*/g,
        'const { $1 } = globalThis.React;',
      )
    return { ok: true, compiledJs }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, error: message }
  }
}

type SmokeTestResult = { ok: true } | { ok: false; error: string }

/** Dynamic-import the compiled JS and verify it exports a renderable component.
 *  Uses a data: URL which works in both Node.js (>=20) and browsers.
 *  Sets up globalThis.React and globalThis.__jsxRuntime so the compiled JS
 *  (which references these globals instead of importing 'react') can run. */
async function smokeTestCapsule(compiledJs: string): Promise<SmokeTestResult> {
  try {
    const smokeGlobals: CapsuleSmokeGlobals = globalThis
    // Set up globals that the compiled JS references instead of 'react' imports
    if (!smokeGlobals.React) {
      smokeGlobals.React = await import('react')
    }
    if (!smokeGlobals.__jsxRuntime) {
      smokeGlobals.__jsxRuntime = await import('react/jsx-runtime')
    }

    // data: URL with base64 encoding works in Node.js 20+ and all browsers
    const dataUrl = `data:text/javascript;base64,${Buffer.from(compiledJs).toString('base64')}`
    const module = await import(/* @vite-ignore */ dataUrl)

    const Component = module.default
    if (typeof Component !== 'function') {
      return { ok: false, error: 'Module does not export a default function' }
    }

    // Try rendering with empty props — if it throws, the capsule is broken
    const element = Component({})
    const html = renderToStaticMarkup(element)
    if (typeof html !== 'string') {
      return { ok: false, error: 'Component did not render to HTML string' }
    }
    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, error: message }
  }
}

type AutoFixResult =
  | { ok: true; compiledJs: string; tsxSource: string }
  | { ok: false; error: string; attempts: number }

/** Compile + smoke-test the TSX. On failure, ask the LLM to fix, up to 3 retries. */
async function compileAndValidateWithAutoFix(
  tsxSource: string,
  generate: GenerateText,
  model: string,
  originalInstruction: string,
): Promise<AutoFixResult> {
  let currentSource = tsxSource

  for (let attempt = 0; attempt <= MAX_AUTO_FIX_RETRIES; attempt++) {
    const compiled = await compileTsx(currentSource)
    if (!compiled.ok) {
      if (attempt >= MAX_AUTO_FIX_RETRIES) {
        return {
          ok: false,
          error: `Compilation failed after ${attempt} attempts: ${compiled.error}`,
          attempts: attempt,
        }
      }
      currentSource = await requestAutoFix(
        generate,
        model,
        currentSource,
        compiled.error,
        originalInstruction,
      )
      continue
    }

    const smoke = await smokeTestCapsule(compiled.compiledJs)
    if (smoke.ok) {
      return {
        ok: true,
        compiledJs: compiled.compiledJs,
        tsxSource: currentSource,
      }
    }

    if (attempt >= MAX_AUTO_FIX_RETRIES) {
      return {
        ok: false,
        error: `Smoke test failed after ${attempt} attempts: ${smoke.error}`,
        attempts: attempt,
      }
    }
    currentSource = await requestAutoFix(
      generate,
      model,
      currentSource,
      smoke.error,
      originalInstruction,
    )
  }

  return {
    ok: false,
    error: 'Exhausted auto-fix retries',
    attempts: MAX_AUTO_FIX_RETRIES,
  }
}

async function requestAutoFix(
  generate: GenerateText,
  model: string,
  brokenSource: string,
  error: string,
  originalInstruction: string,
): Promise<string> {
  const system = [
    'You are fixing a broken React/TypeScript component.',
    'The previous version failed to compile or render.',
    'Return ONLY the fixed TSX code — no explanations.',
    'Keep the same component signature and export default.',
  ].join('\n')

  const user = [
    `Original instruction: ${truncate(originalInstruction, 500)}`,
    '',
    `Error: ${error}`,
    '',
    'Broken source:',
    truncate(brokenSource, MAX_TSX_SOURCE_CHARS),
    '',
    'Return the fixed TSX code now.',
  ].join('\n')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), SECTION_EDIT_TIMEOUT_MS)
  try {
    return await generate(model, system, user, controller.signal, 1)
  } finally {
    clearTimeout(timeout)
  }
}

// ─── OpenUI Source Patching ─────────────────────────────────────────────────

/** Replace the capsule reference in OpenUI source with the AI capsule name. */
export function patchOpenUiSourceWithAiCapsule(
  source: string,
  originalCapsuleName: string,
  aiCapsuleName: string,
  varName?: string,
): string {
  // OpenUI source looks like: `hero = SaasHero({...})`
  // We replace `SaasHero` with `AICustom_SaasHero_v1`
  if (varName) {
    // Replace the specific variable assignment
    const pattern = new RegExp(
      `(${escapeRegExp(varName)}\\s*=\\s*)${escapeRegExp(originalCapsuleName)}\\b`,
      'g',
    )
    return source.replace(pattern, `$1${aiCapsuleName}`)
  }
  // Fallback: replace all references to the capsule name
  return source.replace(
    new RegExp(`\\b${escapeRegExp(originalCapsuleName)}\\b`, 'g'),
    aiCapsuleName,
  )
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ─── Main Handler ───────────────────────────────────────────────────────────

export async function createSectionEditResponse(
  sessionId: string,
  request: Request,
  options: {
    client?: SectionEditClient
    generate?: GenerateText
    generateWithTools?: GenerateWithTools
    model?: string
    resolveStockImage?: ResolveInlineStockImage
    entitlementClient?: InlineEditEntitlementClient
  } = {},
): Promise<Response> {
  let body: JsonBody
  try {
    body = await readJsonBody(request)
  } catch {
    return json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const instruction = getString(body, ['instruction', 'prompt'])?.trim()
  if (!instruction) {
    return json({ error: 'Instruction is required.' }, { status: 400 })
  }

  const selectionRaw = body.selection as unknown
  if (
    !selectionRaw ||
    typeof selectionRaw !== 'object' ||
    !('elementPath' in selectionRaw)
  ) {
    return json({ error: 'Selection is required.' }, { status: 400 })
  }
  const selection = selectionRaw as InspectorSelection

  const client = options.client ?? createRuntimeConvexHttpClient(60000)
  const anonymousOwnerSecret = getOwnerSecret(request, body)

  // Load current artifacts
  let generationView: GenerationViewSnapshot | null
  try {
    generationView = (await client.query(api.sessions.getGenerationView, {
      sessionId: asSessionId(sessionId),
    })) as GenerationViewSnapshot | null
  } catch {
    return json({ error: 'Unable to edit section.' }, { status: 503 })
  }

  if (!generationView) {
    return json({ error: 'Session not found.' }, { status: 404 })
  }

  // Pro + same-user guard (mirrors /api/translate + export API). Fail-closed
  // before the LLM call so non-owners / non-Pro callers can't spend LLM money.
  // Bypassed when Clerk is disabled (dev/test).
  if (!isClerkAuthDisabled()) {
    const bearerToken = getBearerToken(request)
    if (!bearerToken) {
      return json(
        { error: 'Authentication required', code: 'auth_required' },
        { status: 401 },
      )
    }
    const entitlementClient =
      options.entitlementClient ??
      createDefaultInlineEditEntitlementClient(client)
    let entitlement: InlineEditEntitlementResult
    try {
      entitlement = await entitlementClient({
        sessionId,
        anonymousOwnerSecret,
        bearerToken,
      })
    } catch {
      return json(
        { error: 'Could not verify entitlement.', code: 'auth_required' },
        { status: 401 },
      )
    }
    if (!entitlement.allowed) {
      const statusByCode: Record<InlineEditEntitlementCode, number> = {
        ok: 200,
        auth_required: 401,
        not_found: 404,
        forbidden: 403,
        payment_required: 402,
      }
      return json(
        {
          error: entitlement.message ?? 'AI inline edit not allowed',
          code: entitlement.code,
        },
        { status: statusByCode[entitlement.code] ?? 403 },
      )
    }
  }

  const htmlSession = isHtmlSession(generationView)
  const needsRuntime = !options.generate || !options.generateWithTools
  const runtime = needsRuntime ? await loadGenerateTextRuntime() : null
  const generate = options.generate ?? runtime!.generateText
  const generateWithTools =
    options.generateWithTools ?? runtime!.generateWithTools
  const model =
    options.model ?? runtime?.DEFAULT_MODEL ?? DEFAULT_SECTION_EDIT_MODEL
  const resolveStockImage = options.resolveStockImage ?? resolveInlineStockImage

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), SECTION_EDIT_TIMEOUT_MS)

  try {
    if (htmlSession) {
      // ─── HTML Session: generate replacement HTML ───
      const previewHtml = generationView.homeModule?.source ?? ''
      const toolPrompt = buildHtmlToolOnlyEditPrompt(
        selection,
        instruction,
        previewHtml,
      )

      const results = await runInlineEditsWithCodeMode({
        anonymousOwnerSecret,
        client,
        currentPreviewVersion: generationView.latestPreview?.version,
        currentSource: generationView.homeModule?.source,
        generateWithTools,
        instruction,
        model,
        prompt: toolPrompt,
        resolveStockImage,
        selection,
        sessionId,
        signal: controller.signal,
      })
      if (results.length > 0) {
        const last = results.at(-1)
        return json({
          mode: 'tools',
          applied: results.length,
          previewVersion: last?.previewVersion,
          results,
        })
      }

      const prompt = buildHtmlSectionEditPrompt(
        selection,
        instruction,
        previewHtml,
      )
      const replacementHtml = await generate(
        model,
        prompt.system,
        prompt.user,
        controller.signal,
        1,
      )

      // Basic validation: must contain <html or <!DOCTYPE
      if (!/<(?:!DOCTYPE\s+)?html/i.test(replacementHtml)) {
        return json(
          { error: 'AI did not return valid HTML. Please try again.' },
          { status: 502 },
        )
      }

      const result = await client.mutation(api.sessions.applySectionEdit, {
        sessionId: asSessionId(sessionId),
        anonymousOwnerSecret,
        replacementHtml,
        instruction,
      })

      return json({ ...result, mode: 'html' })
    } else {
      // ─── OpenUI Session: generate AI capsule ───
      // Legacy capsule path, deprecated in favor of DOM-based anchors — see
      // docs/DOM_BASED_ANCHORS.md#migration-from-openui-capsule-markers.
      console.warn(
        `[ship-fast] Deprecated: section edit on OpenUI session uses the ` +
          `legacy capsule source path (openuiComponent=${selection.openuiComponent ?? '(none)'}, ` +
          `openuiVar=${selection.openuiVar ?? '(none)'}). Prefer DOM-based ` +
          `anchors — see docs/DOM_BASED_ANCHORS.md#migration-from-openui-capsule-markers.`,
      )
      const capsuleName = selection.openuiComponent
      if (!capsuleName) {
        const source = generationView.homeModule?.source ?? ''
        const prompt = buildOpenUiToolOnlyEditPrompt(
          selection,
          instruction,
          source,
        )
        const results = await runInlineEditsWithCodeMode({
          anonymousOwnerSecret,
          client,
          currentPreviewVersion: generationView.latestPreview?.version,
          currentSource: source,
          generateWithTools,
          instruction,
          model,
          prompt,
          resolveStockImage,
          selection,
          sessionId,
          signal: controller.signal,
        })
        if (results.length > 0) {
          const last = results.at(-1)
          return json({
            mode: 'tools',
            applied: results.length,
            previewVersion: last?.previewVersion,
            results,
          })
        }

        return json(
          { error: 'No OpenUI capsule found in selection.' },
          { status: 400 },
        )
      }

      // Load capsule source from the generated manifest
      const { findSimilarCapsules } =
        await import('@ship-fast/blocks/generated')
      const similar = findSimilarCapsules(capsuleName, 5)

      // Load the capsule source for the LLM prompt
      const capsuleSource = await loadCapsuleSource(capsuleName)

      const toolPrompt = buildOpenUiToolOnlyEditPrompt(
        selection,
        instruction,
        generationView.homeModule?.source ?? capsuleSource,
      )

      const results = await runInlineEditsWithCodeMode({
        anonymousOwnerSecret,
        client,
        currentPreviewVersion: generationView.latestPreview?.version,
        currentSource: generationView.homeModule?.source,
        generateWithTools,
        instruction,
        model,
        prompt: toolPrompt,
        resolveStockImage,
        selection,
        sessionId,
        signal: controller.signal,
      })
      if (results.length > 0) {
        const last = results.at(-1)
        return json({
          mode: 'tools',
          applied: results.length,
          previewVersion: last?.previewVersion,
          results,
        })
      }

      const prompt = buildOpenUiCapsuleEditPrompt(
        selection,
        instruction,
        capsuleSource,
        similar,
      )
      const tsxSource = await generate(
        model,
        prompt.system,
        prompt.user,
        controller.signal,
        1,
      )

      // Compile + validate with auto-fix loop
      const validationResult = await compileAndValidateWithAutoFix(
        tsxSource,
        generate,
        model,
        instruction,
      )

      if (!validationResult.ok) {
        return json(
          {
            error: 'AI capsule failed validation.',
            details: validationResult.error,
            attempts: validationResult.attempts,
          },
          { status: 502 },
        )
      }

      // Generate deterministic AI capsule name (re-edits update same row)
      const aiCapsuleName = generateAiCapsuleName(
        capsuleName,
        selection.openuiVar,
      )

      // Patch the OpenUI source to reference the new AI capsule
      const originalSource = generationView.homeModule?.source ?? ''
      const patchedSource = patchOpenUiSourceWithAiCapsule(
        originalSource,
        capsuleName,
        aiCapsuleName,
        selection.openuiVar,
      )

      const result = await client.mutation(api.sessions.applySectionEdit, {
        sessionId: asSessionId(sessionId),
        anonymousOwnerSecret,
        replacementOpenUiSource: patchedSource,
        aiCapsule: {
          capsuleName: aiCapsuleName,
          parentCapsule: capsuleName,
          compiledJs: validationResult.compiledJs,
          description: instruction.slice(0, 200),
        },
        instruction,
      })

      return json({ ...result, mode: 'openui', aiCapsuleName })
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Section edit failed'
    return json({ error: message }, { status: 500 })
  } finally {
    clearTimeout(timeout)
  }
}

/** Generate a deterministic AI capsule name based on the parent capsule and
 *  optional source variable. This ensures re-edits update the same capsule
 *  row instead of creating orphan duplicates. */
function generateAiCapsuleName(parentName: string, varName?: string): string {
  if (parentName.startsWith('AICustom_')) return parentName
  if (varName) {
    return `AICustom_${parentName}_${varName}`
  }
  return `AICustom_${parentName}`
}

// Cache for decompressed capsule source manifest
let capsuleSourceIndex: Record<
  string,
  { file: string; source: string } | undefined
> | null = null

/** Load the actual TSX source code of a capsule by name from the compressed
 *  react-export-sources manifest. This gives the LLM the real source to edit. */
async function loadCapsuleSource(capsuleName: string): Promise<string> {
  try {
    if (capsuleSourceIndex === null) {
      const { reactExportSourcesBase64, reactExportSourcesEncoding } =
        await import('@ship-fast/blocks/generated')
      if (reactExportSourcesEncoding !== 'br+base64') {
        throw new Error(`Unsupported encoding: ${reactExportSourcesEncoding}`)
      }
      const manifestJson = brotliDecompressSync(
        Buffer.from(reactExportSourcesBase64, 'base64'),
      ).toString('utf8')
      capsuleSourceIndex = JSON.parse(manifestJson)
    }
    const entry = capsuleSourceIndex?.[capsuleName]
    if (!entry?.source) {
      return `// Source not available for ${capsuleName}`
    }
    return entry.source
  } catch {
    return `// Could not load source for ${capsuleName}`
  }
}
