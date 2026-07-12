import { useState, useRef, useEffect } from 'react'
import { Wand2, X, Loader2 } from 'lucide-react'

interface AIPromptBoxProps {
  text: string
  rect: DOMRect
  onSubmit: (instruction: string) => void
  onCancel: () => void
  isLoading?: boolean
}

export function AIPromptBox({
  text,
  rect,
  onSubmit,
  onCancel,
  isLoading,
}: AIPromptBoxProps) {
  const [instruction, setInstruction] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleEsc = (e) => {
      // Don't close on Escape while a rewrite is loading — the request is
      // in-flight and dismissing the box would orphan the pending result.
      if (e.key === 'Escape' && !isLoading) onCancel()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onCancel, isLoading])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (instruction.trim() && !isLoading) {
      onSubmit(instruction.trim())
    }
  }

  const left = rect.left + rect.width / 2
  const top = rect.bottom + 8

  return (
    <div
      className="fixed z-[100] flex flex-col gap-2 rounded-lg border border-border bg-background p-3 shadow-lg"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        transform: 'translateX(-50%)',
        minWidth: 280,
        maxWidth: 400,
      }}
    >
      <div className="max-h-[60px] overflow-hidden text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Selected:</span> "{text}"
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder='e.g. "make it punchier", "more formal"'
          disabled={isLoading}
          className="flex-1 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground outline-none ring-ring placeholder:text-muted-foreground focus-visible:ring-1"
        />
        <button
          type="submit"
          disabled={isLoading || !instruction.trim()}
          className="inline-flex size-7 items-center justify-center rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
          title="Rewrite with AI"
        >
          {isLoading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Wand2 className="size-3.5" />
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          title="Cancel"
        >
          <X className="size-3.5" />
        </button>
      </form>

      <div
        className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-border bg-background"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  )
}
