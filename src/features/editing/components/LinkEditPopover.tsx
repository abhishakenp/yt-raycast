import { useState, useEffect, useRef } from 'react'
import { Check, X, Link as LinkIcon } from 'lucide-react'
import { cn } from '#/lib/utils'

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
  const [openInNewTab, setOpenInNewTab] = useState(false)
  const [noindex, setNoindex] = useState(false)
  const originalHrefRef = useRef('')
  const prevElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!activeElement) return
    if (prevElementRef.current !== activeElement) {
      prevElementRef.current = activeElement
      originalHrefRef.current = activeElement.getAttribute('href') ?? ''
      setHref(originalHrefRef.current)
      setText(activeElement.textContent ?? '')
      // Read current target/rel from the element on mount.
      setOpenInNewTab(activeElement.getAttribute('target') === '_blank')
      const currentRel = activeElement.getAttribute('rel') ?? ''
      setNoindex(currentRel.split(/\s+/).includes('nofollow'))
    }
  }, [activeElement])

  // Apply "open in new tab" changes directly to the element.
  const handleToggleNewTab = (next: boolean) => {
    setOpenInNewTab(next)
    if (!activeElement) return
    if (next) {
      activeElement.setAttribute('target', '_blank')
      // Preserve existing rel tokens (e.g. nofollow) and add noopener+noreferrer.
      const existingRel = activeElement.getAttribute('rel') ?? ''
      const tokens = new Set(existingRel.split(/\s+/).filter(Boolean))
      tokens.add('noopener')
      tokens.add('noreferrer')
      activeElement.setAttribute('rel', Array.from(tokens).join(' '))
    } else {
      activeElement.removeAttribute('target')
      // Remove only noopener+noreferrer, keep other rel tokens (e.g. nofollow).
      const existingRel = activeElement.getAttribute('rel') ?? ''
      const tokens = existingRel
        .split(/\s+/)
        .filter((t) => t !== 'noopener' && t !== 'noreferrer')
      if (tokens.length > 0) {
        activeElement.setAttribute('rel', tokens.join(' '))
      } else {
        activeElement.removeAttribute('rel')
      }
    }
  }

  // Apply "noindex" (nofollow) changes directly to the element, appending to
  // the existing rel attribute rather than overwriting it.
  const handleToggleNoindex = (next: boolean) => {
    setNoindex(next)
    if (!activeElement) return
    const existingRel = activeElement.getAttribute('rel') ?? ''
    const tokens = new Set(existingRel.split(/\s+/).filter(Boolean))
    if (next) {
      tokens.add('nofollow')
    } else {
      tokens.delete('nofollow')
    }
    if (tokens.size > 0) {
      activeElement.setAttribute('rel', Array.from(tokens).join(' '))
    } else {
      activeElement.removeAttribute('rel')
    }
  }

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
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
          Edit Link
        </span>
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
          className="h-7 w-full rounded border border-white/10 bg-white/5 px-2 text-xs text-white outline-none transition-colors focus-visible:border-cyan-300/50 focus-visible:ring-1 focus-visible:ring-cyan-300/20"
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
          className="h-7 w-full rounded border border-white/10 bg-white/5 px-2 text-xs text-white outline-none transition-colors focus-visible:border-cyan-300/50 focus-visible:ring-1 focus-visible:ring-cyan-300/20"
        />
      </div>

      <div className="flex flex-col gap-1.5 pt-1">
        <div className="flex items-center justify-between gap-2">
          <label className="text-[10px] font-medium uppercase tracking-wider text-white/40">
            Open in new tab
          </label>
          <button
            type="button"
            role="switch"
            aria-checked={openInNewTab}
            aria-label="Open in new tab"
            onClick={() => handleToggleNewTab(!openInNewTab)}
            className={cn(
              'relative h-4 w-7 rounded-full transition-colors',
              openInNewTab ? 'bg-cyan-300/15' : 'bg-white/10',
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 size-3 rounded-full transition-all',
                openInNewTab ? 'left-3.5 bg-cyan-200' : 'left-0.5 bg-white/60',
              )}
            />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <label className="text-[10px] font-medium uppercase tracking-wider text-white/40">
            Noindex
          </label>
          <button
            type="button"
            role="switch"
            aria-checked={noindex}
            aria-label="Noindex"
            onClick={() => handleToggleNoindex(!noindex)}
            className={cn(
              'relative h-4 w-7 rounded-full transition-colors',
              noindex ? 'bg-cyan-300/15' : 'bg-white/10',
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 size-3 rounded-full transition-all',
                noindex ? 'left-3.5 bg-cyan-200' : 'left-0.5 bg-white/60',
              )}
            />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 pt-1">
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
