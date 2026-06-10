import { Edit } from 'lucide-react'

import { useEditController } from '../hooks/useEditController'

type EditPanelProps = {
  sessionId: string
}

export const EditPanel = ({ sessionId }: EditPanelProps) => {
  const { editError, edits, isEditing } = useEditController(sessionId)

  return (
    <div className="rounded-[var(--radius-xl)] bg-[var(--glass-bg)] p-4 shadow-[var(--glass-shadow)] border border-[var(--glass-border)] backdrop-blur-[12px]">
      <div className="mb-3 flex items-center gap-2 border-b border-[var(--border-primary)] pb-2">
        <Edit className="size-4 text-cyan-200" />
        <h2 className="m-0 font-sans text-sm font-semibold uppercase tracking-[0.1em] text-[var(--text-primary)]">Edits</h2>
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
