import { MessageSquare, Send } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { useChatController } from '../hooks/useChatController'

type ChatPanelProps = {
  sessionId: string
}

export const ChatPanel = ({ sessionId }: ChatPanelProps) => {
  const { chatError, isSending, messages, send } = useChatController(sessionId)
  const [input, setInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    await send(input)
    setInput('')
  }

  return (
    <div className="rounded-[var(--radius-xl)] bg-[var(--glass-bg)] p-4 shadow-[var(--glass-shadow)] border border-[var(--glass-border)] backdrop-blur-[12px]">
      <div className="mb-3 flex items-center gap-2 border-b border-[var(--border-primary)] pb-2">
        <MessageSquare className="size-4 text-cyan-200" />
        <h2 className="m-0 font-sans text-sm font-semibold uppercase tracking-[0.1em] text-[var(--text-primary)]">
          Chat
        </h2>
      </div>
      <div className="mb-3 flex max-h-48 flex-col gap-2 overflow-y-auto [scrollbar-color:var(--border-primary)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-[3px] [&::-webkit-scrollbar-thumb]:bg-[var(--border-primary)]">
        {messages?.map((msg) => (
          <div
            className={cn(
              'rounded-[var(--radius-sm)] p-3 text-sm leading-[1.4] transition-all duration-200 ease-[var(--ease-out)]',
              msg.role === 'user'
                ? 'border border-cyan-400/20 bg-cyan-400/15 text-cyan-200'
                : 'border border-[var(--border-primary)] bg-slate-600/40 text-[var(--text-secondary)]',
            )}
            key={msg.messageId}
          >
            <p className="m-0 mb-1 text-[0.7rem] font-bold uppercase tracking-[0.1em] opacity-60">
              {msg.role}
            </p>
            <p className="mt-1">{msg.content}</p>
          </div>
        ))}
        {messages?.length === 0 && (
          <p className="py-8 text-center text-sm italic text-[var(--text-muted)]">
            No messages yet. Start a conversation!
          </p>
        )}
      </div>
      <form id="chat-form" onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-[var(--radius-sm)] border border-[var(--border-primary)] bg-[var(--bg-input)] px-3.5 py-2.5 font-sans text-sm text-[var(--text-primary)] outline-none transition-all duration-300 ease-[var(--ease-out)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-accent)] focus:shadow-[0_0_0_3px_rgba(138,180,255,0.08),0_0_20px_rgba(138,180,255,0.06)]"
            disabled={isSending}
            id="chat-input"
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            value={input}
          />
          <button
            className="grid size-10 cursor-pointer place-items-center rounded-[var(--radius-sm)] border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-none transition-all duration-300 ease-[var(--ease-out)] hover:not-disabled:-translate-y-px hover:not-disabled:border-[var(--border-hover)] hover:not-disabled:bg-[var(--bg-tertiary)] hover:not-disabled:shadow-[0_4px_12px_rgba(0,0,0,0.2)] active:not-disabled:translate-y-0 active:not-disabled:duration-120 disabled:cursor-not-allowed disabled:opacity-30"
            disabled={!input.trim() || isSending}
            id="chat-send"
            type="submit"
          >
            <Send className="size-4" />
          </button>
        </div>
      </form>
      {chatError && (
        <p className="mt-3 rounded-[var(--radius-sm)] border border-rose-500/30 bg-rose-500/12 p-3 text-sm text-rose-400">
          {chatError}
        </p>
      )}
    </div>
  )
}
