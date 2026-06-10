import { MessageSquare, Send } from 'lucide-react'
import { useState } from 'react'

import { useChatController } from '../hooks/useChatController'
import styles from './ChatPanel.module.css'

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
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <MessageSquare className="size-4 text-cyan-200" />
        <h2 className={styles.panelTitle}>Chat</h2>
      </div>
      <div className={styles.messageList}>
        {messages?.map((msg) => (
          <div
            className={`${styles.messageCard} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
            key={msg.messageId}
          >
            <p className={styles.messageRole}>{msg.role}</p>
            <p className="mt-1">{msg.content}</p>
          </div>
        ))}
        {messages?.length === 0 && (
          <p className={styles.emptyText}>No messages yet. Start a conversation!</p>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div className={styles.inputRow}>
          <input
            className={styles.input}
            disabled={isSending}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            value={input}
          />
          <button
            className={styles.sendButton}
            disabled={!input.trim() || isSending}
            type="submit"
          >
            <Send className="size-4" />
          </button>
        </div>
      </form>
      {chatError && <p className={styles.errorText}>{chatError}</p>}
    </div>
  )
}
