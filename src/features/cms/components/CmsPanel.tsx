import { useQuery } from 'convex/react'
import { Database, History, RotateCcw, Save } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
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

const labelFromField = (field: string): string =>
  field
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

export const CmsPanel = ({ sessionId, prompt = '' }: CmsPanelProps) => {
  const { cmsError, content, isRestoring, isSaving, restoreRevision, saveContent } = useCmsController(sessionId)
  const [historyEntryId, setHistoryEntryId] = useState<Id<'cmsEntries'> | null>(null)
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

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <Database className="size-4 text-cyan-200" />
        <div>
          <h2 className="m-0 text-sm font-semibold uppercase tracking-[0.1em] text-white">Content</h2>
          <p className="m-0 mt-1 text-xs leading-5 text-white/48">First-party Convex content entries for this generated site.</p>
        </div>
      </div>

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
                  onChange={(event) => updateDraft(draft.field, event.target.value)}
                  value={draft.value}
                />
              ) : (
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm normal-case tracking-normal text-white outline-none"
                  data-cms-field={draft.field}
                  disabled={isSaving}
                  onChange={(event) => updateDraft(draft.field, event.target.value)}
                  type={draft.type === 'image' || draft.type === 'link' ? 'url' : 'text'}
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
                    current === draft.entryId ? null : draft.entryId ?? null,
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
                  <p className="m-0 px-1 py-2 text-xs text-white/42">Loading revisions...</p>
                ) : revisions.length === 0 ? (
                  <p className="m-0 px-1 py-2 text-xs text-white/42">No previous revisions.</p>
                ) : (
                  revisions.map((revision) => (
                    <button
                      className="grid gap-1 rounded-lg border border-white/8 bg-white/[0.035] p-2 text-left transition-colors hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-45"
                      disabled={isRestoring}
                      key={revision.revisionId}
                      onClick={() => void restoreRevision(revision.revisionId)}
                      type="button"
                    >
                      <span className="flex items-center justify-between gap-2 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-white/38">
                        <span>{new Date(revision.createdAt).toLocaleString()}</span>
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

      {cmsError && (
        <p className="m-0 rounded-xl border border-rose-500/30 bg-rose-500/12 p-3 text-sm text-rose-200">
          {cmsError}
        </p>
      )}
    </div>
  )
}
