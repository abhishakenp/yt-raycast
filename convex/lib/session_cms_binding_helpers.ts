import { ConvexError } from 'convex/values'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { assertCanMutateSession } from './session_access_helpers'
import { applyTextEditToCurrentArtifacts } from './session_edit_mutation_helpers'
import {
  applyCmsPreviewEdit,
  extractCmsBindingCandidatesFromHtml,
  extractCmsBindingCandidatesFromSiteSpec,
} from './cms_helpers'

type CmsBindingSeedCtx = Pick<MutationCtx, 'db'>
type CmsReadCtx = Pick<QueryCtx, 'db'>
type CmsMutationCtx = MutationCtx

export type UpsertSessionCmsConfigInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  projectId?: string
  dataset?: string
  configJson?: string
}

export type UpsertSessionCmsContentInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  bindingId?: Id<'cmsBindings'>
  selector?: string
  type?: 'text' | 'richtext' | 'image' | 'link'
  field?: string
  content: string
  contentType?: string
  beforeContent?: string
}

export type RestoreSessionCmsContentRevisionInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
  revisionId: Id<'cmsRevisions'>
}

export type InsertSessionCmsBindingInput = {
  sessionId: Id<'sessions'>
  selector: string
  type: 'text' | 'richtext' | 'image' | 'link'
  field?: string
}

export type UpdateSessionCmsEntryInput = {
  sessionId: Id<'sessions'>
  bindingId: Id<'cmsBindings'>
  content: string
  contentType?: string
  updatedBy?: string
}

export type RestoreSessionCmsRevisionInput = {
  sessionId: Id<'sessions'>
  revisionId: Id<'cmsRevisions'>
}

const requireSession = async (
  ctx: MutationCtx,
  sessionId: Id<'sessions'>,
): Promise<Doc<'sessions'>> => {
  const session = await ctx.db.get(sessionId)

  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  return session
}

export const serializeCmsConfig = (config: Doc<'cmsConfigs'>) => ({
  configId: config._id,
  status: config.status,
  projectId: config.projectId,
  dataset: config.dataset,
  configJson: config.configJson,
  errorMessage: config.errorMessage,
  createdAt: config.createdAt,
  updatedAt: config.updatedAt,
})

const loadCmsConfigDoc = async (ctx: CmsReadCtx, sessionId: Id<'sessions'>) =>
  await ctx.db
    .query('cmsConfigs')
    .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
    .first()

export const upsertSessionCmsConfig = async (
  ctx: CmsMutationCtx,
  args: UpsertSessionCmsConfigInput,
) => {
  const session = await requireSession(ctx, args.sessionId)
  const now = Date.now()

  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

  const existing = await loadCmsConfigDoc(ctx, args.sessionId)

  if (existing !== null) {
    await ctx.db.patch(existing._id, {
      projectId: args.projectId,
      dataset: args.dataset,
      configJson: args.configJson,
      status: 'ready',
      updatedAt: now,
    })
  } else {
    await ctx.db.insert('cmsConfigs', {
      sessionId: args.sessionId,
      status: 'ready',
      projectId: args.projectId,
      dataset: args.dataset,
      configJson: args.configJson,
      createdAt: now,
      updatedAt: now,
    })
  }

  return { sessionId: args.sessionId }
}

export const loadSessionCmsConfig = async (
  ctx: CmsReadCtx,
  sessionId: Id<'sessions'>,
) => {
  const config = await loadCmsConfigDoc(ctx, sessionId)
  return config === null ? null : serializeCmsConfig(config)
}

const getOrCreateCmsBinding = async (
  ctx: MutationCtx,
  args: UpsertSessionCmsContentInput,
  now: number,
): Promise<Doc<'cmsBindings'>> => {
  const binding =
    args.bindingId === undefined ? null : await ctx.db.get(args.bindingId)

  if (binding !== null && binding.sessionId !== args.sessionId) {
    throw new ConvexError({
      code: 'NOT_FOUND',
      message: 'CMS binding not found',
    })
  }

  if (binding !== null) return binding

  const selector =
    args.selector?.trim() ||
    (args.field === undefined ? undefined : `field:${args.field}`)

  if (selector === undefined || selector.length === 0) {
    throw new ConvexError({
      code: 'INVALID_CMS_BINDING',
      message: 'CMS binding selector or field is required',
    })
  }

  const existingBinding = await ctx.db
    .query('cmsBindings')
    .withIndex('by_sessionId_selector', (index) =>
      index.eq('sessionId', args.sessionId).eq('selector', selector),
    )
    .first()

  if (existingBinding !== null) return existingBinding

  const bindingId = await ctx.db.insert('cmsBindings', {
    sessionId: args.sessionId,
    selector,
    type: args.type ?? 'text',
    field: args.field,
    createdAt: now,
  })
  const createdBinding = await ctx.db.get(bindingId)

  if (createdBinding === null) {
    throw new ConvexError({
      code: 'NOT_FOUND',
      message: 'CMS binding not found',
    })
  }

  return createdBinding
}

const promoteCmsPreviewEdit = async (
  ctx: MutationCtx,
  args: {
    sessionId: Id<'sessions'>
    binding: Doc<'cmsBindings'>
    beforeContent: string
    content: string
    previewVersion: number
    source: 'edit' | 'cms'
    messagePrefix: string
    now: number
  },
): Promise<number> => {
  if (args.previewVersion <= 0 || args.beforeContent === args.content) {
    return args.previewVersion
  }

  const preview = await ctx.db
    .query('previews')
    .withIndex('by_sessionId_version', (index) =>
      index.eq('sessionId', args.sessionId),
    )
    .order('desc')
    .first()

  if (preview === null) return args.previewVersion

  const editedPreview = applyCmsPreviewEdit(
    preview.html,
    args.binding,
    args.beforeContent,
    args.content,
  )

  if (!editedPreview.replaced) return args.previewVersion

  const previewVersion = preview.version + 1
  const artifactSnapshot = await applyTextEditToCurrentArtifacts(
    ctx,
    args.sessionId,
    args.beforeContent,
    args.content,
    args.now,
  )

  await ctx.db.insert('previews', {
    sessionId: args.sessionId,
    version: previewVersion,
    html: editedPreview.html,
    openUiSource: artifactSnapshot.openUiSource,
    siteSpecJson: artifactSnapshot.siteSpecJson,
    source: args.source,
    createdAt: args.now,
  })
  await ctx.db.patch(args.sessionId, {
    previewVersion,
    updatedAt: args.now,
  })
  await ctx.db.insert('generationEvents', {
    sessionId: args.sessionId,
    eventType: 'preview_reload',
    message: `${args.messagePrefix}: ${args.binding.field ?? args.binding.selector}`,
    previewVersion,
    createdAt: args.now,
  })

  return previewVersion
}

export const upsertSessionCmsContentEntry = async (
  ctx: MutationCtx,
  args: UpsertSessionCmsContentInput,
  now = Date.now(),
) => {
  const session = await requireSession(ctx, args.sessionId)
  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

  const binding = await getOrCreateCmsBinding(ctx, args, now)
  const existingEntry = await ctx.db
    .query('cmsEntries')
    .withIndex('by_bindingId', (index) => index.eq('bindingId', binding._id))
    .first()

  if (existingEntry !== null) {
    await ctx.db.insert('cmsRevisions', {
      entryId: existingEntry._id,
      content: existingEntry.content,
      contentType: existingEntry.contentType,
      updatedBy: existingEntry.updatedBy,
      createdAt: now,
    })

    await ctx.db.patch(existingEntry._id, {
      content: args.content,
      contentType: args.contentType,
      updatedAt: now,
      updatedBy: session.userId,
    })
  } else {
    await ctx.db.insert('cmsEntries', {
      sessionId: args.sessionId,
      bindingId: binding._id,
      content: args.content,
      contentType: args.contentType,
      updatedAt: now,
      updatedBy: session.userId,
    })
  }

  const startingPreviewVersion = session.previewVersion ?? 0
  const previewVersion =
    args.beforeContent === undefined
      ? startingPreviewVersion
      : await promoteCmsPreviewEdit(ctx, {
          sessionId: args.sessionId,
          binding,
          beforeContent: args.beforeContent,
          content: args.content,
          previewVersion: startingPreviewVersion,
          source: 'edit',
          messagePrefix: 'CMS content updated',
          now,
        })

  return {
    sessionId: args.sessionId,
    bindingId: binding._id,
    previewVersion,
  }
}

export const restoreSessionCmsContentRevision = async (
  ctx: MutationCtx,
  args: RestoreSessionCmsContentRevisionInput,
  now = Date.now(),
) => {
  const session = await requireSession(ctx, args.sessionId)
  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

  const revision = await ctx.db.get(args.revisionId)
  if (revision === null) {
    throw new ConvexError({
      code: 'NOT_FOUND',
      message: 'CMS revision not found',
    })
  }

  const entry = await ctx.db.get(revision.entryId)
  if (entry === null || entry.sessionId !== args.sessionId) {
    throw new ConvexError({
      code: 'NOT_FOUND',
      message: 'CMS entry not found',
    })
  }

  const binding = await ctx.db.get(entry.bindingId)
  if (binding === null || binding.sessionId !== args.sessionId) {
    throw new ConvexError({
      code: 'NOT_FOUND',
      message: 'CMS binding not found',
    })
  }

  await ctx.db.insert('cmsRevisions', {
    entryId: entry._id,
    content: entry.content,
    contentType: entry.contentType,
    updatedBy: entry.updatedBy,
    createdAt: now,
  })

  await ctx.db.patch(entry._id, {
    content: revision.content,
    contentType: revision.contentType,
    updatedAt: now,
    updatedBy: session.userId,
  })

  const previewVersion = await promoteCmsPreviewEdit(ctx, {
    sessionId: args.sessionId,
    binding,
    beforeContent: entry.content,
    content: revision.content,
    previewVersion: session.previewVersion ?? 0,
    source: 'cms',
    messagePrefix: 'CMS revision restored',
    now,
  })

  return {
    sessionId: args.sessionId,
    entryId: entry._id,
    bindingId: binding._id,
    previewVersion,
  }
}

export const insertSessionCmsBinding = async (
  ctx: CmsBindingSeedCtx,
  args: InsertSessionCmsBindingInput,
  now = Date.now(),
) =>
  await ctx.db.insert('cmsBindings', {
    sessionId: args.sessionId,
    selector: args.selector,
    type: args.type,
    field: args.field,
    createdAt: now,
  })

export const updateSessionCmsEntry = async (
  ctx: CmsMutationCtx,
  args: UpdateSessionCmsEntryInput,
  now = Date.now(),
) => {
  const binding = await ctx.db.get(args.bindingId)
  if (binding === null || binding.sessionId !== args.sessionId) {
    throw new ConvexError({
      code: 'NOT_FOUND',
      message: 'CMS binding not found',
    })
  }

  const existingEntry = await ctx.db
    .query('cmsEntries')
    .withIndex('by_bindingId', (index) => index.eq('bindingId', args.bindingId))
    .first()

  if (existingEntry !== null) {
    await ctx.db.insert('cmsRevisions', {
      entryId: existingEntry._id,
      content: existingEntry.content,
      contentType: existingEntry.contentType,
      updatedBy: existingEntry.updatedBy,
      createdAt: now,
    })

    await ctx.db.patch(existingEntry._id, {
      content: args.content,
      contentType: args.contentType,
      updatedAt: now,
      updatedBy: args.updatedBy,
    })
  } else {
    await ctx.db.insert('cmsEntries', {
      sessionId: args.sessionId,
      bindingId: args.bindingId,
      content: args.content,
      contentType: args.contentType,
      updatedAt: now,
      updatedBy: args.updatedBy,
    })
  }

  return { success: true }
}

export const restoreSessionCmsRevision = async (
  ctx: CmsMutationCtx,
  args: RestoreSessionCmsRevisionInput,
  now = Date.now(),
) => {
  const revision = await ctx.db.get(args.revisionId)
  if (revision === null) {
    throw new ConvexError({
      code: 'NOT_FOUND',
      message: 'CMS revision not found',
    })
  }

  const entry = await ctx.db.get(revision.entryId)
  if (entry === null) {
    throw new ConvexError({
      code: 'NOT_FOUND',
      message: 'CMS entry not found',
    })
  }

  const binding = await ctx.db.get(entry.bindingId)
  if (binding === null || binding.sessionId !== args.sessionId) {
    throw new ConvexError({
      code: 'NOT_FOUND',
      message: 'CMS binding not found',
    })
  }

  await ctx.db.insert('cmsRevisions', {
    entryId: entry._id,
    content: entry.content,
    contentType: entry.contentType,
    updatedBy: entry.updatedBy,
    createdAt: now,
  })

  await ctx.db.patch(entry._id, {
    content: revision.content,
    contentType: revision.contentType,
    updatedAt: now,
    updatedBy: revision.updatedBy,
  })

  return { success: true }
}

export const listSessionCmsEntries = async (
  ctx: CmsReadCtx,
  sessionId: Id<'sessions'>,
): Promise<Doc<'cmsEntries'>[]> =>
  ctx.db
    .query('cmsEntries')
    .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
    .take(200)

export const serializeCmsContentItem = (
  binding: Doc<'cmsBindings'>,
  entry?: Doc<'cmsEntries'>,
) => ({
  bindingId: binding._id,
  entryId: entry?._id,
  selector: binding.selector,
  type: binding.type,
  field: binding.field,
  content: entry?.content ?? '',
  contentType: entry?.contentType,
  updatedAt: entry?.updatedAt,
  updatedBy: entry?.updatedBy,
  createdAt: binding.createdAt,
})

export const listSessionCmsContent = async (
  ctx: CmsReadCtx,
  sessionId: Id<'sessions'>,
) => {
  const bindings = await ctx.db
    .query('cmsBindings')
    .withIndex('by_sessionId', (index) => index.eq('sessionId', sessionId))
    .take(200)
  const entries = await listSessionCmsEntries(ctx, sessionId)
  const entryByBindingId = new Map(
    entries.map((entry) => [entry.bindingId, entry]),
  )

  return bindings.map((binding) =>
    serializeCmsContentItem(binding, entryByBindingId.get(binding._id)),
  )
}

export const serializeCmsRevision = (revision: Doc<'cmsRevisions'>) => ({
  revisionId: revision._id,
  content: revision.content,
  contentType: revision.contentType,
  updatedBy: revision.updatedBy,
  createdAt: revision.createdAt,
})

export const listSessionCmsEntryRevisions = async (
  ctx: CmsReadCtx,
  args: { sessionId: Id<'sessions'>; entryId: Id<'cmsEntries'> },
) => {
  const entry = await ctx.db.get(args.entryId)
  if (entry === null || entry.sessionId !== args.sessionId) return []

  const revisions = await ctx.db
    .query('cmsRevisions')
    .withIndex('by_entryId_createdAt', (index) =>
      index.eq('entryId', args.entryId),
    )
    .order('desc')
    .take(50)

  return revisions.map(serializeCmsRevision)
}

export const listCmsRevisionsForEntry = async (
  ctx: CmsReadCtx,
  entryId: Id<'cmsEntries'>,
) =>
  await ctx.db
    .query('cmsRevisions')
    .withIndex('by_entryId', (index) => index.eq('entryId', entryId))
    .take(200)

export const seedCmsBindingsForGeneratedArtifacts = async (
  ctx: CmsBindingSeedCtx,
  sessionId: Id<'sessions'>,
  input: { html: string; siteSpecJson?: string },
  now: number,
): Promise<number> => {
  const candidates = [
    ...extractCmsBindingCandidatesFromHtml(input.html),
    ...extractCmsBindingCandidatesFromSiteSpec(input.siteSpecJson),
  ]
  const seen = new Set<string>()
  const seenFields = new Set<string>()
  let created = 0

  for (const candidate of candidates) {
    if (seen.has(candidate.selector)) continue
    const fieldKey = candidate.field?.trim()
    if (fieldKey !== undefined && fieldKey.length > 0) {
      if (seenFields.has(fieldKey)) continue
      seenFields.add(fieldKey)
    }
    seen.add(candidate.selector)

    const existingBinding = await ctx.db
      .query('cmsBindings')
      .withIndex('by_sessionId_selector', (index) =>
        index.eq('sessionId', sessionId).eq('selector', candidate.selector),
      )
      .first()
    const bindingId =
      existingBinding?._id ??
      (await ctx.db.insert('cmsBindings', {
        sessionId,
        selector: candidate.selector,
        type: candidate.type,
        field: candidate.field,
        createdAt: now,
      }))

    if (existingBinding === null) created += 1

    const initialContent = candidate.content?.trim()
    if (initialContent === undefined || initialContent.length === 0) continue

    const existingEntry = await ctx.db
      .query('cmsEntries')
      .withIndex('by_bindingId', (index) => index.eq('bindingId', bindingId))
      .first()

    if (existingEntry === null) {
      await ctx.db.insert('cmsEntries', {
        sessionId,
        bindingId,
        content: initialContent,
        contentType: candidate.contentType,
        updatedAt: now,
      })
    }
  }

  return created
}
