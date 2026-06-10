import { useEffect, useRef } from 'react'

interface TextEditState {
  element: HTMLElement
  originalText: string
}

export function useTextEdit(
  containerRef: React.RefObject<HTMLElement | null>,
  editMode: boolean,
  onTextChange: (change: { oldText: string; newText: string }) => void,
) {
  const activeEditRef = useRef<TextEditState | null>(null)
  const callbackRef = useRef(onTextChange)
  callbackRef.current = onTextChange

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const finishEdit = () => {
      const active = activeEditRef.current
      if (!active) return

      const newText = active.element.textContent || ''
      if (newText !== active.originalText && newText.trim()) {
        callbackRef.current({ oldText: active.originalText, newText })
      }

      cleanupElement(active.element)
      activeEditRef.current = null
    }

    const cancelEdit = () => {
      const active = activeEditRef.current
      if (!active) return

      active.element.textContent = active.originalText
      cleanupElement(active.element)
      activeEditRef.current = null
    }

    const handleClick = (e: MouseEvent) => {
      if (!editMode) return

      const target = e.target as HTMLElement

      finishEdit()

      const textEl = findTextElement(target)
      if (!textEl) return

      const originalText = textEl.textContent || ''
      if (!originalText.trim()) return

      textEl.contentEditable = 'true'
      textEl.focus()

      const range = document.createRange()
      range.selectNodeContents(textEl)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)

      textEl.style.outline = '2px solid hsl(var(--primary))'
      textEl.style.outlineOffset = '2px'
      textEl.style.cursor = 'text'

      activeEditRef.current = { element: textEl, originalText }

      e.stopPropagation()
      e.preventDefault()
    }

    const handleBlur = () => {
      finishEdit()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        finishEdit()
      }
      if (e.key === 'Escape') {
        cancelEdit()
      }
    }

    container.addEventListener('click', handleClick)
    container.addEventListener('blur', handleBlur, true)
    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('click', handleClick)
      container.removeEventListener('blur', handleBlur, true)
      container.removeEventListener('keydown', handleKeyDown)
      finishEdit()
    }
  }, [containerRef, editMode])
}

function findTextElement(el: HTMLElement): HTMLElement | null {
  let current: HTMLElement | null = el
  while (current) {
    const tag = current.tagName.toLowerCase()
    if (
      ['button', 'a', 'input', 'textarea', 'select', 'svg', 'path', 'img', 'video', 'audio', 'script', 'style'].includes(
        tag,
      )
    ) {
      return null
    }

    const text = (current.textContent || '').trim()
    if (text.length > 0 && text.length < 500) {
      if (
        [
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'p',
          'span',
          'div',
          'li',
          'td',
          'th',
          'label',
          'figcaption',
          'strong',
          'em',
          'small',
          'blockquote',
        ].includes(tag)
      ) {
        return current
      }
    }

    current = current.parentElement
  }
  return null
}

function cleanupElement(el: HTMLElement) {
  el.contentEditable = 'inherit'
  el.style.outline = ''
  el.style.outlineOffset = ''
  el.style.cursor = ''
}
