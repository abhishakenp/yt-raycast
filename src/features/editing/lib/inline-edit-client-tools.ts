import type { ConvexReactClient } from 'convex/react'

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
  type InlineEditCommandContext,
  type InlineEditPersistenceCommand,
} from './inline-edit-commands'
import {
  elementDeleteToolDefinition,
  imageRemoveToolDefinition,
  imageReplaceToolDefinition,
  linkEditToolDefinition,
  sectionMoveToolDefinition,
  sectionRewriteToolDefinition,
  styleApplyToolDefinition,
  textRewriteToolDefinition,
  undoLastEditToolDefinition,
} from './inline-edit-tool-definitions'
import { resolveStockImage as defaultResolveStockImage } from '@/lib/stock-image'

type InlineEditConvexClient = Pick<ConvexReactClient, 'mutation'>

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

type InlineEditClientToolContext = InlineEditCommandContext & {
  convex: InlineEditConvexClient
  getSource?: () => Promise<string | undefined>
  resolveStockImage?: ResolveInlineStockImage
}

const runInlineEditCommand = (
  ctx: InlineEditClientToolContext,
  command: InlineEditPersistenceCommand,
) => ctx.convex.mutation(command.mutation, command.args)

const stockDimension = (
  value: number | string | undefined,
  fallback: number,
): number => {
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

const resolveImageReplaceInput = async (
  ctx: InlineEditClientToolContext,
  input: Parameters<typeof buildImageReplaceCommand>[0],
): Promise<Parameters<typeof buildImageReplaceCommand>[0]> => {
  if (input.src || !input.query) return input

  const resolveStockImage = ctx.resolveStockImage ?? defaultResolveStockImage
  const resolved = await resolveStockImage({
    query: input.query,
    alt: input.alt ?? input.query,
    w: stockDimension(input.width, 800),
    h: stockDimension(input.height, 600),
  })
  return { ...input, src: resolved.imageUrl }
}

export const createInlineEditClientTools = (
  ctx: InlineEditClientToolContext,
) => [
  textRewriteToolDefinition.client((input) =>
    runInlineEditCommand(ctx, buildTextRewriteCommand(input, ctx)),
  ),
  styleApplyToolDefinition.client((input) =>
    runInlineEditCommand(ctx, buildStyleApplyCommand(input, ctx)),
  ),
  imageReplaceToolDefinition.client(async (input) =>
    runInlineEditCommand(
      ctx,
      buildImageReplaceCommand(await resolveImageReplaceInput(ctx, input), ctx),
    ),
  ),
  imageRemoveToolDefinition.client((input) =>
    runInlineEditCommand(ctx, buildImageRemoveCommand(input, ctx)),
  ),
  linkEditToolDefinition.client(async (input) => {
    const currentSource = ctx.currentSource ?? (await ctx.getSource?.())
    return runInlineEditCommand(
      ctx,
      buildLinkEditCommand(input, { ...ctx, currentSource }),
    )
  }),
  elementDeleteToolDefinition.client((input) =>
    runInlineEditCommand(ctx, buildElementDeleteCommand(input, ctx)),
  ),
  sectionMoveToolDefinition.client(async (input) => {
    const currentSource = ctx.currentSource ?? (await ctx.getSource?.())
    return runInlineEditCommand(
      ctx,
      buildSectionMoveCommand(input, { ...ctx, currentSource }),
    )
  }),
  sectionRewriteToolDefinition.client((input) =>
    runInlineEditCommand(ctx, buildSectionRewriteCommand(input, ctx)),
  ),
  undoLastEditToolDefinition.client((input) =>
    runInlineEditCommand(ctx, buildUndoCommand(input, ctx)),
  ),
]
