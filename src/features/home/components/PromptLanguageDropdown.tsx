'use client'

import { useEffect, useId, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

export interface PromptLanguageDropdownProps {
  /** Currently selected BCP-47 code (controlled). */
  value: string
  /** Available `[code, label]` options to choose from. */
  options: ReadonlyArray<readonly [string, string]>
  /** Called with the chosen code when the user picks an option. */
  onSelect: (code: string) => void
  /** Form field name — a hidden input carries the value into FormData. */
  name: string
  /** Accessible label for the trigger button. */
  ariaLabel?: string
  className?: string
}

/**
 * Custom language dropdown that replaces the native `<select>`.
 *
 * The native control on the homepage proved unreliable: on macOS the OS-drawn
 * popup could not be reliably interacted with (and is impossible to drive in
 * automated tests). This is a plain button + listbox rendered in the DOM, so
 * selection works consistently across browsers and is fully testable. A hidden
 * input preserves the existing `FormData.get('prompt-language')` contract.
 */
export const PromptLanguageDropdown = ({
  value,
  options,
  onSelect,
  name,
  ariaLabel = 'Preferred generation language',
  className,
}: PromptLanguageDropdownProps) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const listboxId = useId()

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const selectedLabel = options.find(([code]) => code === value)?.[1] ?? value
  const hasChoices = options.length > 1

  return (
    <div className="prompt-language-dropdown" ref={rootRef}>
      <input type="hidden" id="prompt-language" name={name} value={value} />
      <button
        type="button"
        className={cn('prompt-language-select', className)}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        data-language-code={value}
        onClick={() => {
          if (hasChoices) setOpen((current) => !current)
        }}
      >
        <span className="prompt-language-select-label">{selectedLabel}</span>
      </button>
      {open && hasChoices ? (
        <ul
          className="prompt-language-menu"
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
        >
          {options.map(([code, label]) => (
            <li key={code} role="option" aria-selected={code === value}>
              <button
                type="button"
                className={cn(
                  'prompt-language-option',
                  code === value && 'is-selected',
                )}
                data-language-code={code}
                onClick={() => {
                  onSelect(code)
                  setOpen(false)
                }}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
