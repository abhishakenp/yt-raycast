import { useQuery } from 'convex/react'
import { Database, History, RotateCcw, Save, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import type { CmsBlogPostFields } from '../hooks/useCmsController'
import { useCmsController } from '../hooks/useCmsController'

type CmsPanelProps = {
  sessionId: string
  prompt?: string
}

type DraftField = {
  bindingId?: Id<'cmsBindings'>
  entryId?: Id<'cmsEntries'>
  selector: string
  field: string
  label: string
  type: 'text' | 'richtext' | 'image' | 'link'
  value: string
  beforeValue: string
  contentType: string
  updatedAt?: number
}

type CmsTab = 'fields' | 'blogPosts'

const emptyBlogPostDraft: CmsBlogPostFields = {
  title: '',
  slug: '',
  excerpt: '',
  author: '',
  category: '',
  coverImageUrl: '',
  body: '',
  status: 'draft',
}

const cmsTabStorageKey = (sessionId: string): string =>
  `ship-fast:cms:${sessionId}:active-tab`

const cmsBlogPostDraftStorageKey = (sessionId: string): string =>
  `ship-fast:cms:${sessionId}:blog-post-draft`

const cmsEditingBlogPostStorageKey = (sessionId: string): string =>
  `ship-fast:cms:${sessionId}:editing-blog-post`

const isCmsTab = (value: string | null): value is CmsTab =>
  value === 'fields' || value === 'blogPosts'

const readStoredCmsTab = (sessionId: string): CmsTab => {
  if (typeof window === 'undefined') {
    return 'fields'
  }

  const storedTab = window.localStorage.getItem(cmsTabStorageKey(sessionId))
  return isCmsTab(storedTab) ? storedTab : 'fields'
}

const writeStoredCmsTab = (sessionId: string, tab: CmsTab): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(cmsTabStorageKey(sessionId), tab)
  }
}

const readStoredEditingBlogPostId = (
  sessionId: string,
): Id<'cmsCollectionItems'> | undefined => {
  if (typeof window === 'undefined') {
    return undefined
  }

  return (
    (window.localStorage.getItem(
      cmsEditingBlogPostStorageKey(sessionId),
    ) as Id<'cmsCollectionItems'> | null) ?? undefined
  )
}

const writeStoredEditingBlogPostId = (
  sessionId: string,
  itemId: Id<'cmsCollectionItems'> | undefined,
): void => {
  if (typeof window === 'undefined') {
    return
  }

  if (itemId === undefined) {
    window.localStorage.removeItem(cmsEditingBlogPostStorageKey(sessionId))
    return
  }

  window.localStorage.setItem(cmsEditingBlogPostStorageKey(sessionId), itemId)
}

const readStoredBlogPostDraft = (
  sessionId: string,
): CmsBlogPostFields | undefined => {
  if (typeof window === 'undefined') {
    return undefined
  }

  const storedDraft = window.localStorage.getItem(
    cmsBlogPostDraftStorageKey(sessionId),
  )

  if (storedDraft === null) {
    return undefined
  }

  try {
    const parsed = JSON.parse(storedDraft) as Partial<CmsBlogPostFields>
    return {
      ...emptyBlogPostDraft,
      title: parsed.title ?? '',
      slug: parsed.slug ?? '',
      excerpt: parsed.excerpt ?? '',
      author: parsed.author ?? '',
      category: parsed.category ?? '',
      coverImageUrl: parsed.coverImageUrl ?? '',
      body: parsed.body ?? '',
      status: parsed.status === 'published' ? 'published' : 'draft',
    }
  } catch {
    return undefined
  }
}

const writeStoredBlogPostDraft = (
  sessionId: string,
  draft: CmsBlogPostFields,
): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      cmsBlogPostDraftStorageKey(sessionId),
      JSON.stringify(draft),
    )
  }
}

const clearStoredBlogPostDraft = (sessionId: string): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(cmsBlogPostDraftStorageKey(sessionId))
  window.localStorage.removeItem(cmsEditingBlogPostStorageKey(sessionId))
}

const labelFromField = (field: string): string =>
  field
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

export const CmsPanel = ({ sessionId, prompt = '' }: CmsPanelProps) => {
  const {
    blogPosts,
    cmsError,
    content,
    deleteBlogPost,
    isRestoring,
    isSaving,
    isSavingBlogPost,
    restoreRevision,
    saveBlogPost,
    saveContent,
  } = useCmsController(sessionId)
  const [activeTab, setActiveTabState] = useState<CmsTab>(() =>
    readStoredCmsTab(sessionId),
  )
  const [historyEntryId, setHistoryEntryId] = useState<Id<'cmsEntries'> | null>(
    null,
  )
  const [editingBlogPostId, setEditingBlogPostIdState] = useState<
    Id<'cmsCollectionItems'> | undefined
  >(() => readStoredEditingBlogPostId(sessionId))
  const [blogPostDraft, setBlogPostDraftState] = useState<CmsBlogPostFields>(
    () => readStoredBlogPostDraft(sessionId) ?? emptyBlogPostDraft,
  )
  const revisions = useQuery(
    api.sessions.listCmsEntryRevisions,
    historyEntryId === null
      ? 'skip'
      : {
          sessionId: sessionId as Id<'sessions'>,
          entryId: historyEntryId,
        },
  )
  const fallbackFields = useMemo<DraftField[]>(
    () => [
      {
        selector: 'field:hero.headline',
        field: 'hero.headline',
        label: 'Hero headline',
        type: 'text',
        value: prompt,
        beforeValue: prompt,
        contentType: 'text/plain',
      },
      {
        selector: 'field:page.summary',
        field: 'page.summary',
        label: 'Page summary',
        type: 'richtext',
        value: '',
        beforeValue: '',
        contentType: 'text/plain',
      },
    ],
    [prompt],
  )
  const loadedFields = useMemo<DraftField[]>(
    () =>
      (content ?? []).map((item) => ({
        bindingId: item.bindingId,
        entryId: item.entryId,
        selector: item.selector,
        field: item.field ?? item.selector,
        label: labelFromField(item.field ?? item.selector),
        type: item.type,
        value: item.content,
        beforeValue: item.content,
        contentType: item.contentType ?? 'text/plain',
        updatedAt: item.updatedAt,
      })),
    [content],
  )
  const sourceFields = loadedFields.length > 0 ? loadedFields : fallbackFields
  const [drafts, setDrafts] = useState<DraftField[]>(sourceFields)

  useEffect(() => {
    setDrafts(sourceFields)
  }, [sourceFields])

  useEffect(() => {
    setActiveTabState(readStoredCmsTab(sessionId))
    setEditingBlogPostIdState(readStoredEditingBlogPostId(sessionId))
    setBlogPostDraftState(
      readStoredBlogPostDraft(sessionId) ?? emptyBlogPostDraft,
    )
  }, [sessionId])

  const setActiveTab = (tab: CmsTab) => {
    setActiveTabState(tab)
    writeStoredCmsTab(sessionId, tab)
  }

  const setEditingBlogPostId = (
    itemId: Id<'cmsCollectionItems'> | undefined,
  ) => {
    setEditingBlogPostIdState(itemId)
    writeStoredEditingBlogPostId(sessionId, itemId)
  }

  const setBlogPostDraft = (draft: CmsBlogPostFields) => {
    setBlogPostDraftState(draft)
    writeStoredBlogPostDraft(sessionId, draft)
  }

  const clearBlogPostDraft = () => {
    setEditingBlogPostIdState(undefined)
    setBlogPostDraftState(emptyBlogPostDraft)
    clearStoredBlogPostDraft(sessionId)
  }

  const updateDraft = (field: string, value: string) => {
    setDrafts((current) =>
      current.map((draft) =>
        draft.field === field ? { ...draft, value } : draft,
      ),
    )
  }

  const saveDraft = async (draft: DraftField) => {
    await saveContent({
      bindingId: draft.bindingId,
      selector: draft.selector,
      type: draft.type,
      field: draft.field,
      content: draft.value,
      contentType: draft.contentType,
      beforeContent: draft.beforeValue,
    })
  }

  const updateBlogPostDraft = (
    field: keyof CmsBlogPostFields,
    value: string,
  ) => {
    setBlogPostDraftState((current) => {
      const nextValue =
        field === 'status'
          ? value === 'published'
            ? 'published'
            : 'draft'
          : value
      const nextDraft = {
        ...current,
        [field]: nextValue,
        slug:
          field === 'title' && current.slug.trim().length === 0
            ? value
                .trim()
                .toLowerCase()
                .replace(/['"]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
            : current.slug,
      } as CmsBlogPostFields
      writeStoredBlogPostDraft(sessionId, nextDraft)
      return nextDraft
    })
  }

  const editBlogPost = (post: NonNullable<typeof blogPosts>[number]) => {
    setActiveTab('blogPosts')
    setEditingBlogPostId(post.itemId)
    setBlogPostDraft({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      author: post.author,
      category: post.category,
      coverImageUrl: post.coverImageUrl ?? '',
      body: post.body,
      status: post.status,
    })
  }

  const saveBlogPostDraft = async () => {
    const didSave = await saveBlogPost({
      itemId: editingBlogPostId,
      fields: blogPostDraft,
    })

    if (didSave) {
      clearBlogPostDraft()
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <Database className="size-4 text-cyan-200" />
        <div>
          <h2 className="m-0 text-sm font-semibold uppercase tracking-[0.1em] text-white">
            Content
          </h2>
          <p className="m-0 mt-1 text-xs leading-5 text-white/48">
            First-party Convex content entries for this generated site.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/[0.035] p-1">
        <button
          className={`min-h-9 rounded-lg px-3 text-sm font-semibold transition-colors ${
            activeTab === 'fields'
              ? 'bg-cyan-300 text-slate-950'
              : 'text-white/68 hover:bg-white/[0.06] hover:text-white'
          }`}
          onClick={() => setActiveTab('fields')}
          type="button"
        >
          Page fields
        </button>
        <button
          className={`min-h-9 rounded-lg px-3 text-sm font-semibold transition-colors ${
            activeTab === 'blogPosts'
              ? 'bg-cyan-300 text-slate-950'
              : 'text-white/68 hover:bg-white/[0.06] hover:text-white'
          }`}
          onClick={() => setActiveTab('blogPosts')}
          type="button"
        >
          Blog posts
        </button>
      </div>

      {activeTab === 'fields' ? (
        <div className="grid gap-3">
          {drafts.map((draft) => (
            <section
              className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-3"
              key={draft.field}
            >
              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/45">
                <span>{draft.label}</span>
                {draft.type === 'richtext' ? (
                  <textarea
                    className="min-h-24 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm normal-case leading-6 tracking-normal text-white outline-none"
                    data-cms-field={draft.field}
                    disabled={isSaving}
                    onChange={(event) =>
                      updateDraft(draft.field, event.target.value)
                    }
                    value={draft.value}
                  />
                ) : (
                  <input
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm normal-case tracking-normal text-white outline-none"
                    data-cms-field={draft.field}
                    disabled={isSaving}
                    onChange={(event) =>
                      updateDraft(draft.field, event.target.value)
                    }
                    type={
                      draft.type === 'image' || draft.type === 'link'
                        ? 'url'
                        : 'text'
                    }
                    value={draft.value}
                  />
                )}
              </label>
              <button
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full bg-cyan-300 px-3 py-2 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45"
                data-cms-save={draft.field}
                disabled={isSaving || draft.value === draft.beforeValue}
                onClick={() => void saveDraft(draft)}
                type="button"
              >
                <Save className="size-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              {draft.entryId && (
                <button
                  className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-sm font-semibold text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
                  data-cms-history={draft.field}
                  disabled={isRestoring}
                  onClick={() =>
                    setHistoryEntryId((current) =>
                      current === draft.entryId
                        ? null
                        : (draft.entryId ?? null),
                    )
                  }
                  type="button"
                >
                  <History className="size-4" />
                  History
                </button>
              )}
              {historyEntryId === draft.entryId && (
                <div className="grid gap-2 rounded-xl border border-white/10 bg-black/18 p-2">
                  {revisions === undefined ? (
                    <p className="m-0 px-1 py-2 text-xs text-white/42">
                      Loading revisions...
                    </p>
                  ) : revisions.length === 0 ? (
                    <p className="m-0 px-1 py-2 text-xs text-white/42">
                      No previous revisions.
                    </p>
                  ) : (
                    revisions.map((revision) => (
                      <button
                        className="grid gap-1 rounded-lg border border-white/8 bg-white/[0.035] p-2 text-left transition-colors hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-45"
                        disabled={isRestoring}
                        key={revision.revisionId}
                        onClick={() =>
                          void restoreRevision(revision.revisionId)
                        }
                        type="button"
                      >
                        <span className="flex items-center justify-between gap-2 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-white/38">
                          <span>
                            {new Date(revision.createdAt).toLocaleString()}
                          </span>
                          <RotateCcw className="size-3.5" />
                        </span>
                        <span className="line-clamp-2 text-xs leading-5 text-white/68">
                          {revision.content}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </section>
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          <div className="grid gap-2">
            {(blogPosts ?? []).map((post) => (
              <section
                className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-3"
                key={post.itemId}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="m-0 text-sm font-semibold text-white">
                      {post.title}
                    </h3>
                    <p className="m-0 mt-1 text-xs text-white/45">
                      /blog/{post.slug} · {post.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="min-h-8 rounded-lg border border-white/10 px-2 text-xs font-semibold text-white/70 hover:bg-white/[0.08] hover:text-white"
                      onClick={() => editBlogPost(post)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      aria-label={`Delete ${post.title}`}
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-white/10 text-white/55 hover:bg-rose-500/12 hover:text-rose-200"
                      disabled={isSavingBlogPost}
                      onClick={() => void deleteBlogPost(post.itemId)}
                      type="button"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                <p className="m-0 text-xs leading-5 text-white/58">
                  {post.excerpt}
                </p>
              </section>
            ))}
          </div>

          <section className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <div>
              <h3 className="m-0 text-sm font-semibold text-white">
                {editingBlogPostId === undefined
                  ? 'New blog post'
                  : 'Edit blog post'}
              </h3>
              <p className="m-0 mt-1 text-xs leading-5 text-white/45">
                Structured first-party content for generated blog sections.
              </p>
            </div>

            <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/45">
              <span>Title</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm normal-case tracking-normal text-white outline-none"
                disabled={isSavingBlogPost}
                onChange={(event) =>
                  updateBlogPostDraft('title', event.target.value)
                }
                value={blogPostDraft.title}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/45">
              <span>Slug</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm normal-case tracking-normal text-white outline-none"
                disabled={isSavingBlogPost}
                onChange={(event) =>
                  updateBlogPostDraft('slug', event.target.value)
                }
                value={blogPostDraft.slug}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/45">
              <span>Excerpt</span>
              <textarea
                className="min-h-20 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm normal-case leading-6 tracking-normal text-white outline-none"
                disabled={isSavingBlogPost}
                onChange={(event) =>
                  updateBlogPostDraft('excerpt', event.target.value)
                }
                value={blogPostDraft.excerpt}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/45">
                <span>Author</span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm normal-case tracking-normal text-white outline-none"
                  disabled={isSavingBlogPost}
                  onChange={(event) =>
                    updateBlogPostDraft('author', event.target.value)
                  }
                  value={blogPostDraft.author}
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/45">
                <span>Category</span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm normal-case tracking-normal text-white outline-none"
                  disabled={isSavingBlogPost}
                  onChange={(event) =>
                    updateBlogPostDraft('category', event.target.value)
                  }
                  value={blogPostDraft.category}
                />
              </label>
            </div>
            <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/45">
              <span>Cover image URL</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm normal-case tracking-normal text-white outline-none"
                disabled={isSavingBlogPost}
                onChange={(event) =>
                  updateBlogPostDraft('coverImageUrl', event.target.value)
                }
                type="url"
                value={blogPostDraft.coverImageUrl}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/45">
              <span>Body</span>
              <textarea
                className="min-h-32 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm normal-case leading-6 tracking-normal text-white outline-none"
                disabled={isSavingBlogPost}
                onChange={(event) =>
                  updateBlogPostDraft('body', event.target.value)
                }
                value={blogPostDraft.body}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/45">
              <span>Status</span>
              <select
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm normal-case tracking-normal text-white outline-none"
                disabled={isSavingBlogPost}
                onChange={(event) =>
                  updateBlogPostDraft('status', event.target.value)
                }
                value={blogPostDraft.status}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
            <button
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full bg-cyan-300 px-3 py-2 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45"
              disabled={isSavingBlogPost || blogPostDraft.title.trim() === ''}
              onClick={() => void saveBlogPostDraft()}
              type="button"
            >
              <Save className="size-4" />
              {isSavingBlogPost ? 'Saving...' : 'Save blog post'}
            </button>
          </section>
        </div>
      )}

      {cmsError && (
        <p className="m-0 rounded-xl border border-rose-500/30 bg-rose-500/12 p-3 text-sm text-rose-200">
          {cmsError}
        </p>
      )}
    </div>
  )
}
