import { Bot, Trash2 } from 'lucide-react'

import { useAgentationController } from '../hooks/useAgentationController'

type AgentationPanelProps = {
  sessionId: string
}

export const AgentationPanel = ({ sessionId }: AgentationPanelProps) => {
  const { annotations, annotationError, isCreating, isDeleting, remove } = useAgentationController(sessionId)

  const handleDelete = async (annotationId: string) => {
    await remove(annotationId as any)
  }

  return (
    <div className="rounded-[var(--radius-xl)] bg-[var(--glass-bg)] p-4 shadow-[var(--glass-shadow)] border border-[var(--glass-border)] backdrop-blur-[12px]">
      <div className="mb-3 flex items-center gap-2 border-b border-[var(--border-primary)] pb-2">
        <Bot className="size-4 text-cyan-200" />
        <h2 className="m-0 font-sans text-sm font-semibold uppercase tracking-[0.1em] text-[var(--text-primary)]">Agentation</h2>
      </div>
      <div className="mb-3 flex max-h-48 flex-col gap-2 overflow-y-auto [scrollbar-color:var(--border-primary)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-[3px] [&::-webkit-scrollbar-thumb]:bg-[var(--border-primary)]">
        {annotations?.map((ann) => (
          <div className="rounded-[var(--radius-sm)] border border-[var(--border-primary)] bg-[var(--bg-input)] p-3 transition-all duration-200 ease-[var(--ease-out)] hover:border-[var(--border-hover)] hover:bg-white/5" key={ann.annotationId}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="m-0 mb-1 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">{ann.elementLabel}</p>
                <p className="m-0 text-sm leading-[1.4] text-[var(--text-secondary)]">{ann.comment}</p>
              </div>
              <button
                className="grid size-8 cursor-pointer place-items-center rounded-md border border-[var(--border-primary)] bg-transparent text-[var(--text-muted)] transition-all duration-200 ease-[var(--ease-out)] hover:not-disabled:border-rose-500/30 hover:not-disabled:bg-rose-500/10 hover:not-disabled:text-rose-400 disabled:cursor-not-allowed disabled:opacity-30"
                disabled={isDeleting}
                onClick={() => void handleDelete(ann.annotationId)}
                type="button"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
        {annotations?.length === 0 && (
          <p className="py-8 text-center text-sm italic text-[var(--text-muted)]">No annotations yet. Use AI agent to add annotations.</p>
        )}
      </div>
      {annotationError && <p className="mt-3 rounded-[var(--radius-sm)] border border-rose-500/30 bg-rose-500/12 p-3 text-sm text-rose-400">{annotationError}</p>}
      {isCreating && <p className="mt-3 text-sm italic text-[var(--text-muted)]">Creating annotation...</p>}
    </div>
  )
}
