import { useState, useEffect, useRef } from 'react'
import { Check, X, Link as LinkIcon } from 'lucide-react'

interface LinkEditPopoverProps {
  activeElement: HTMLAnchorElement | null
  onApply: (payload: {
    oldHref: string
    newHref: string
    occurrenceIndex: number
  }) => void
  onClose: () => void
}

export function LinkEditPopover({
  activeElement,
  onApply,
  onClose,
}: LinkEditPopoverProps) {
  const [href, setHref] = useState('')
  const [text, setText] = useState('')
  const originalHrefRef = useRef('')
  const prevElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!activeElement) return
    if (prevElementRef.current !== activeElement) {
      prevElementRef.current = activeElement
      originalHrefRef.current = activeElement.getAttribute('href') ?? ''
      setHref(originalHrefRef.current)
      setText(activeElement.textContent ?? '')
    }
  }, [activeElement])

  const handleApply = () => {
    if (!activeElement) {
      onClose()
      return
    }
    const oldHref = originalHrefRef.current
    const newHref = href
    if (oldHref === newHref) {
      onClose()
      return
    }
    // Find occurrence index by counting all elements with the same href
    const doc = activeElement.ownerDocument
    const peers = Array.from(doc.querySelectorAll(`a[href="${oldHref}"]`))
    const occurrenceIndex = peers.indexOf(activeElement)
    onApply({
      oldHref,
      newHref,
      occurrenceIndex: occurrenceIndex < 0 ? 0 : occurrenceIndex,
    })
  }

  const handleClose = () => {
    onClose()
  }

  if (!activeElement) return null

  return (
    <div className="flex w-full min-w-[280px] flex-col gap-2 p-2">
      <div className="flex items-center gap-1.5">
        <LinkIcon className="size-3.5 text-cyan-300" />
        <span className="text-xs font-medium text-white/60">Edit Link</span>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-medium uppercase tracking-wider text-white/40">
          URL
        </label>
        <input
          type="text"
          value={href}
          onChange={(e) => setHref(e.target.value)}
          placeholder="https://..."
          className="h-7 rounded border border-white/10 bg-white/5 px-2 text-xs text-white outline-none transition-colors focus-visible:border-cyan-300/50 focus-visible:ring-1 focus-visible:ring-cyan-300/20"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-medium uppercase tracking-wider text-white/40">
          Link Text
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Link text"
          className="h-7 rounded border border-white/10 bg-white/5 px-2 text-xs text-white outline-none transition-colors focus-visible:border-cyan-300/50 focus-visible:ring-1 focus-visible:ring-cyan-300/20"
        />
      </div>

      <div className="flex items-center gap-1 border-t border-white/10 pt-2">
        <button
          type="button"
          onClick={handleApply}
          className="flex h-7 items-center gap-1 rounded bg-cyan-300 px-3 text-xs font-bold text-slate-950 transition-colors hover:bg-cyan-200"
        >
          <Check className="size-3" />
          Apply
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="grid size-7 place-items-center rounded text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
