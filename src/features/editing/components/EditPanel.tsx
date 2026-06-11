import { Edit } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'

import { useEditController } from '../hooks/useEditController'

type EditPanelProps = {
  sessionId: string
}

export const EditPanel = ({ sessionId }: EditPanelProps) => {
  const { applyEdit, editError, edits, history, isEditing, restoreVersion } = useEditController(sessionId)
  const [targetLabel, setTargetLabel] = useState('Hero text')
  const [beforeText, setBeforeText] = useState('')
  const [afterText, setAfterText] = useState('')

  const submitTextEdit = async (event: FormEvent) => {
    event.preventDefault()
    if (!beforeText.trim() || !afterText.trim()) return

    await applyEdit(
      'text',
      targetLabel.trim() || 'Text edit',
      beforeText,
      afterText,
      'Manual dashboard text edit',
    )
    setBeforeText('')
    setAfterText('')
  }

  return (
    <div className="rounded-[var(--radius-xl)] bg-[var(--glass-bg)] p-4 shadow-[var(--glass-shadow)] border border-[var(--glass-border)] backdrop-blur-[12px]">
      <div className="mb-3 flex items-center gap-2 border-b border-[var(--border-primary)] pb-2">
        <Edit className="size-4 text-cyan-200" />
        <h2 className="m-0 font-sans text-sm font-semibold uppercase tracking-[0.1em] text-[var(--text-primary)]">Edits</h2>
      </div>

      <form className="mb-4 grid gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-3" onSubmit={submitTextEdit}>
        <label className="grid gap-1 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
          Label
          <input
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm normal-case tracking-normal text-white outline-none"
            disabled={isEditing}
            onChange={(event) => setTargetLabel(event.target.value)}
            value={targetLabel}
          />
        </label>
        <label className="grid gap-1 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
          Find text
          <textarea
            className="min-h-16 resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm normal-case leading-5 tracking-normal text-white outline-none"
            disabled={isEditing}
            onChange={(event) => setBeforeText(event.target.value)}
            value={beforeText}
          />
        </label>
        <label className="grid gap-1 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
          Replace with
          <textarea
            className="min-h-16 resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm normal-case leading-5 tracking-normal text-white outline-none"
            disabled={isEditing}
            onChange={(event) => setAfterText(event.target.value)}
            value={afterText}
          />
        </label>
        <button
          className="min-h-9 rounded-full bg-cyan-300 px-3 py-2 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45"
          disabled={isEditing || !beforeText.trim() || !afterText.trim()}
          type="submit"
        >
          {isEditing ? 'Applying...' : 'Apply text edit'}
        </button>
      </form>

      <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="m-0 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">Preview history</p>
          <p className="m-0 font-mono text-[0.7rem] text-[var(--text-muted)]">{history?.length ?? 0} versions</p>
        </div>
        <div className="grid max-h-40 gap-2 overflow-y-auto">
          {history?.map((preview) => (
            <button
              className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-left text-sm text-white/70 transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-45"
              disabled={isEditing}
              key={preview.previewId}
              onClick={() => void restoreVersion(preview.version)}
              type="button"
            >
              <span>Version {preview.version}</span>
              <span className="font-mono text-[0.68rem] uppercase text-white/38">{preview.source}</span>
            </button>
          ))}
          {history?.length === 0 && (
            <p className="m-0 py-4 text-center text-sm italic text-[var(--text-muted)]">No preview versions yet.</p>
          )}
        </div>
      </div>

      <div className="mb-3 flex max-h-48 flex-col gap-2 overflow-y-auto [scrollbar-color:var(--border-primary)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-[3px] [&::-webkit-scrollbar-thumb]:bg-[var(--border-primary)]">
        {edits?.map((edit) => (
          <div className="rounded-[var(--radius-sm)] border border-[var(--border-primary)] bg-[var(--bg-input)] p-3 transition-all duration-200 ease-[var(--ease-out)] hover:border-[var(--border-hover)] hover:bg-white/5" key={edit.editId}>
            <div className="mb-1 flex items-center justify-between">
              <p className="m-0 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">{edit.editType}</p>
              <p className="m-0 font-mono text-[0.7rem] text-[var(--text-muted)]">v{edit.previewVersion}</p>
            </div>
            {edit.targetLabel && <p className="m-0 mt-1 text-sm font-medium text-[var(--text-secondary)]">{edit.targetLabel}</p>}
            {edit.instruction && <p className="m-0 mt-1 text-xs italic leading-[1.4] text-[var(--text-muted)]">{edit.instruction}</p>}
          </div>
        ))}
        {edits?.length === 0 && (
          <p className="py-8 text-center text-sm italic text-[var(--text-muted)]">No edits yet. Select text in the preview to edit.</p>
        )}
      </div>
      {editError && <p className="mt-3 rounded-[var(--radius-sm)] border border-rose-500/30 bg-rose-500/12 p-3 text-sm text-rose-400">{editError}</p>}
      {isEditing && <p className="mt-3 text-sm italic text-[var(--text-muted)]">Applying edit...</p>}
    </div>
  )
}
