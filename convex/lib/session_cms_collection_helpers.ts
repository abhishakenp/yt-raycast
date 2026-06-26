import { ConvexError } from 'convex/values'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { assertCanMutateSession } from './session_access_helpers'

type CmsCollectionReadCtx = Pick<QueryCtx, 'db'>
type CmsCollectionMutationCtx = MutationCtx

export type CmsCollectionKey = 'blogPosts'

export type CmsBlogPostFields = {
  title: string
  slug: string
  excerpt: string
  author: string
  category: string
  coverImageUrl: string
  body: string
  status: 'draft' | 'published'
}

const BLOG_COLLECTION_KEY: CmsCollectionKey = 'blogPosts'
const BLOG_COLLECTION_LABEL = 'Blog posts'
const BLOG_CMS_START = '<!-- ship-fast-cms:blogPosts:start -->'
const BLOG_CMS_END = '<!-- ship-fast-cms:blogPosts:end -->'

const assertSessionExists = (
  session: Doc<'sessions'> | null,
): Doc<'sessions'> => {
  session !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Session not found',
      })
    })()

  return session
}

const trim = (value: string): string => value.trim()

const slugify = (value: string): string => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug.length > 0 ? slug : 'post'
}

const normalizeBlogPostFields = (
  fields: CmsBlogPostFields,
  existing?: Doc<'cmsCollectionItems'>,
): CmsBlogPostFields => ({
  title: trim(fields.title),
  slug: slugify(fields.slug || fields.title),
  excerpt: trim(fields.excerpt),
  author: trim(fields.author),
  category: trim(fields.category),
  coverImageUrl: trim(fields.coverImageUrl),
  body: fields.body.trim(),
  status: fields.status ?? existing?.status ?? 'draft',
})

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const markdownToHtml = (value: string): string =>
  escapeHtml(value)
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .split(/\n{2,}/)
    .map((chunk) =>
      /^<h[1-3]>/.test(chunk)
        ? chunk
        : `<p>${chunk.replace(/\n/g, '<br />')}</p>`,
    )
    .join('\n')

const blogBlockPattern = new RegExp(
  `${BLOG_CMS_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${BLOG_CMS_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
  'g',
)

const isBlogCapablePreview = (
  preview: Pick<Doc<'previews'>, 'html' | 'siteSpecJson'>,
  session: Pick<Doc<'sessions'>, 'prompt'>,
): boolean => {
  const haystack = `${session.prompt}\n${preview.siteSpecJson ?? ''}\n${preview.html}`
  return /\b(blog|blogs|post|posts|article|articles|story|stories|publication|journal|news)\b/i.test(
    haystack,
  )
}

const renderImage = (post: Doc<'cmsCollectionItems'>): string =>
  post.coverImageUrl === undefined || post.coverImageUrl.trim().length === 0
    ? ''
    : `<img src="${escapeHtml(post.coverImageUrl)}" alt="${escapeHtml(post.title)}" loading="lazy" />`

const renderBlogCollectionBlock = (
  posts: Doc<'cmsCollectionItems'>[],
): string => `
${BLOG_CMS_START}
<section data-cms-collection="blogPosts" aria-label="Blog posts">
  <div>
    <p>Latest posts</p>
    <h2>From the blog</h2>
  </div>
  <div data-cms-collection-list="blogPosts">
    ${posts
      .map(
        (post) => `
    <article data-cms-collection-item="${escapeHtml(post.slug)}">
      ${renderImage(post)}
      <p>${escapeHtml(post.category)}</p>
      <h3><a href="/blog/${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a></h3>
      <p>${escapeHtml(post.excerpt)}</p>
      <p>By ${escapeHtml(post.author)}</p>
    </article>`,
      )
      .join('\n')}
  </div>
</section>
<section data-cms-routes="blogPosts" hidden>
  ${posts
    .map(
      (post) => `
  <article data-cms-route="/blog/${escapeHtml(post.slug)}">
    ${renderImage(post)}
    <p>${escapeHtml(post.category)}</p>
    <h1>${escapeHtml(post.title)}</h1>
    <p>${escapeHtml(post.excerpt)}</p>
    <p>By ${escapeHtml(post.author)}</p>
    <div>${markdownToHtml(post.body)}</div>
  </article>`,
    )
    .join('\n')}
</section>
${BLOG_CMS_END}
`

export const applyBlogPostsToPreviewHtml = (
  html: string,
  posts: Doc<'cmsCollectionItems'>[],
): string => {
  const cleanHtml = html.replace(blogBlockPattern, '')
  if (posts.length === 0) return cleanHtml

  const block = renderBlogCollectionBlock(posts)

  if (/<\/main>/i.test(cleanHtml)) {
    return cleanHtml.replace(/<\/main>/i, `${block}</main>`)
  }

  if (/<\/body>/i.test(cleanHtml)) {
    return cleanHtml.replace(/<\/body>/i, `${block}</body>`)
  }

  return `${cleanHtml}${block}`
}

const loadCollection = async (
  ctx: CmsCollectionReadCtx,
  sessionId: Id<'sessions'>,
  key: CmsCollectionKey,
) =>
  await ctx.db
    .query('cmsCollections')
    .withIndex('by_sessionId_key', (index) =>
      index.eq('sessionId', sessionId).eq('key', key),
    )
    .first()

const getOrCreateBlogCollection = async (
  ctx: CmsCollectionMutationCtx,
  sessionId: Id<'sessions'>,
  now: number,
): Promise<Doc<'cmsCollections'>> => {
  const existing = await loadCollection(ctx, sessionId, BLOG_COLLECTION_KEY)
  if (existing !== null) return existing

  const collectionId = await ctx.db.insert('cmsCollections', {
    sessionId,
    key: BLOG_COLLECTION_KEY,
    label: BLOG_COLLECTION_LABEL,
    createdAt: now,
    updatedAt: now,
  })
  const collection = await ctx.db.get(collectionId)

  collection !== null ||
    (() => {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'CMS collection not found',
      })
    })()

  return collection
}

const listBlogItems = async (
  ctx: CmsCollectionReadCtx,
  sessionId: Id<'sessions'>,
) =>
  await ctx.db
    .query('cmsCollectionItems')
    .withIndex('by_sessionId_collectionKey', (index) =>
      index.eq('sessionId', sessionId).eq('collectionKey', BLOG_COLLECTION_KEY),
    )
    .order('desc')
    .take(200)

const listPublishedBlogItems = async (
  ctx: CmsCollectionReadCtx,
  sessionId: Id<'sessions'>,
) =>
  await ctx.db
    .query('cmsCollectionItems')
    .withIndex('by_sessionId_collectionKey_status', (index) =>
      index
        .eq('sessionId', sessionId)
        .eq('collectionKey', BLOG_COLLECTION_KEY)
        .eq('status', 'published'),
    )
    .order('desc')
    .take(200)

const assertUniqueSlug = async (
  ctx: CmsCollectionReadCtx,
  args: {
    sessionId: Id<'sessions'>
    slug: string
    itemId?: Id<'cmsCollectionItems'>
  },
) => {
  const existing = await ctx.db
    .query('cmsCollectionItems')
    .withIndex('by_sessionId_collectionKey_slug', (index) =>
      index
        .eq('sessionId', args.sessionId)
        .eq('collectionKey', BLOG_COLLECTION_KEY)
        .eq('slug', args.slug),
    )
    .first()

  if (existing !== null && existing._id !== args.itemId) {
    throw new ConvexError({
      code: 'SLUG_TAKEN',
      message: 'A blog post with this slug already exists.',
    })
  }
}

const promoteBlogCollectionPreview = async (
  ctx: CmsCollectionMutationCtx,
  session: Doc<'sessions'>,
  now: number,
): Promise<number> => {
  const preview = await ctx.db
    .query('previews')
    .withIndex('by_sessionId_version', (index) =>
      index.eq('sessionId', session._id),
    )
    .order('desc')
    .first()

  if (preview === null || !isBlogCapablePreview(preview, session)) {
    return session.previewVersion ?? 0
  }

  const posts = await listPublishedBlogItems(ctx, session._id)
  const html = applyBlogPostsToPreviewHtml(preview.html, posts)
  if (html === preview.html) return preview.version

  const previewVersion = preview.version + 1
  await ctx.db.insert('previews', {
    sessionId: session._id,
    version: previewVersion,
    html,
    openUiSource: preview.openUiSource,
    siteSpecJson: preview.siteSpecJson,
    source: 'cms',
    createdAt: now,
  })
  await ctx.db.patch(session._id, {
    previewVersion,
    updatedAt: now,
  })
  await ctx.db.insert('generationEvents', {
    sessionId: session._id,
    eventType: 'preview_reload',
    message: 'CMS blog posts updated',
    previewVersion,
    createdAt: now,
  })

  return previewVersion
}

export const listSessionCmsCollections = async (
  ctx: CmsCollectionReadCtx,
  sessionId: Id<'sessions'>,
) => {
  const collection = await loadCollection(ctx, sessionId, BLOG_COLLECTION_KEY)
  const items = await listBlogItems(ctx, sessionId)

  return [
    {
      collectionId: collection?._id,
      key: BLOG_COLLECTION_KEY,
      label: collection?.label ?? BLOG_COLLECTION_LABEL,
      itemCount: items.length,
      createdAt: collection?.createdAt,
      updatedAt: collection?.updatedAt,
    },
  ]
}

export const serializeCmsCollectionItem = (
  item: Doc<'cmsCollectionItems'>,
) => ({
  itemId: item._id,
  collectionId: item.collectionId,
  collectionKey: item.collectionKey,
  slug: item.slug,
  title: item.title,
  excerpt: item.excerpt,
  author: item.author,
  category: item.category,
  coverImageUrl: item.coverImageUrl ?? '',
  body: item.body,
  status: item.status,
  publishedAt: item.publishedAt,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  updatedBy: item.updatedBy,
})

export const listSessionCmsCollectionItems = async (
  ctx: CmsCollectionReadCtx,
  args: { sessionId: Id<'sessions'>; collectionKey: CmsCollectionKey },
) => {
  if (args.collectionKey !== BLOG_COLLECTION_KEY) return []
  const items = await listBlogItems(ctx, args.sessionId)
  return items.map(serializeCmsCollectionItem)
}

export const upsertSessionCmsCollectionItem = async (
  ctx: CmsCollectionMutationCtx,
  args: {
    sessionId: Id<'sessions'>
    anonymousOwnerSecret?: string
    collectionKey: CmsCollectionKey
    itemId?: Id<'cmsCollectionItems'>
    fields: CmsBlogPostFields
  },
  now = Date.now(),
) => {
  const session = assertSessionExists(await ctx.db.get(args.sessionId))
  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

  if (args.collectionKey !== BLOG_COLLECTION_KEY) {
    throw new ConvexError({
      code: 'UNSUPPORTED_CMS_COLLECTION',
      message: 'Unsupported CMS collection.',
    })
  }

  const collection = await getOrCreateBlogCollection(ctx, args.sessionId, now)
  const existing =
    args.itemId === undefined ? null : await ctx.db.get(args.itemId)

  if (
    existing !== null &&
    (existing.sessionId !== args.sessionId ||
      existing.collectionKey !== BLOG_COLLECTION_KEY)
  ) {
    throw new ConvexError({
      code: 'NOT_FOUND',
      message: 'CMS collection item not found.',
    })
  }

  const fields = normalizeBlogPostFields(args.fields, existing ?? undefined)
  await assertUniqueSlug(ctx, {
    sessionId: args.sessionId,
    slug: fields.slug,
    itemId: existing?._id,
  })

  const publishedAt =
    fields.status === 'published'
      ? (existing?.publishedAt ?? now)
      : existing?.publishedAt

  const itemFields = {
    slug: fields.slug,
    title: fields.title,
    excerpt: fields.excerpt,
    author: fields.author,
    category: fields.category,
    coverImageUrl:
      fields.coverImageUrl.length === 0 ? undefined : fields.coverImageUrl,
    body: fields.body,
    status: fields.status,
    publishedAt,
    updatedAt: now,
    updatedBy: session.userId,
  }

  const itemId =
    existing === null
      ? await ctx.db.insert('cmsCollectionItems', {
          sessionId: args.sessionId,
          collectionId: collection._id,
          collectionKey: BLOG_COLLECTION_KEY,
          ...itemFields,
          createdAt: now,
        })
      : existing._id

  if (existing !== null) {
    await ctx.db.patch(existing._id, itemFields)
  }

  await ctx.db.patch(collection._id, { updatedAt: now })
  const item = await ctx.db.get(itemId)
  const previewVersion =
    item?.status === 'published' || existing?.status === 'published'
      ? await promoteBlogCollectionPreview(ctx, session, now)
      : (session.previewVersion ?? 0)

  return {
    itemId,
    collectionId: collection._id,
    collectionKey: BLOG_COLLECTION_KEY,
    slug: fields.slug,
    previewVersion,
  }
}

export const deleteSessionCmsCollectionItem = async (
  ctx: CmsCollectionMutationCtx,
  args: {
    sessionId: Id<'sessions'>
    anonymousOwnerSecret?: string
    itemId: Id<'cmsCollectionItems'>
  },
  now = Date.now(),
) => {
  const session = assertSessionExists(await ctx.db.get(args.sessionId))
  await assertCanMutateSession(ctx, session, args.anonymousOwnerSecret)

  const item = await ctx.db.get(args.itemId)
  if (item === null || item.sessionId !== args.sessionId) {
    throw new ConvexError({
      code: 'NOT_FOUND',
      message: 'CMS collection item not found.',
    })
  }

  await ctx.db.delete(item._id)
  const collection = await ctx.db.get(item.collectionId)
  if (collection !== null) {
    await ctx.db.patch(collection._id, { updatedAt: now })
  }

  const previewVersion =
    item.status === 'published'
      ? await promoteBlogCollectionPreview(ctx, session, now)
      : (session.previewVersion ?? 0)

  return { itemId: item._id, previewVersion }
}
