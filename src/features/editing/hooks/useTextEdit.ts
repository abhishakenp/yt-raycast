import { useEffect, useRef } from 'react'

interface TextEditState {
  element: HTMLElement
  originalText: string
}

export function useTextEdit(
  containerRef: React.RefObject<HTMLElement | null>,
  editMode: boolean,
  onTextChange: (change: { oldText: string; newText: string; element: HTMLElement }) => void,
  onImageChange?: (change: { oldSrc: string; newSrc: string; element: HTMLImageElement; alt: string }) => void,
  onElementActivate?: (element: HTMLElement, rect: DOMRect) => void,
) {
  const activeEditRef = useRef<TextEditState | null>(null)
  const callbackRef = useRef(onTextChange)
  const imageCallbackRef = useRef(onImageChange)
  const elementActivateCallbackRef = useRef(onElementActivate)
  callbackRef.current = onTextChange
  imageCallbackRef.current = onImageChange
  elementActivateCallbackRef.current = onElementActivate

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const finishEdit = () => {
      const active = activeEditRef.current
      if (!active) return

      const newText = active.element.textContent || ''
      if (newText !== active.originalText && newText.trim()) {
        callbackRef.current({ oldText: active.originalText, newText, element: active.element })
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

      // Check if target is an image or contains an image
      const imgEl = target.tagName.toLowerCase() === 'img'
        ? (target as HTMLImageElement)
        : target.querySelector('img') as HTMLImageElement | null

      if (imgEl) {
        const currentSrc = imgEl.src
        const currentAlt = imgEl.alt || ''

        // Emit custom event for image target
        const event = new CustomEvent('image-target', {
          detail: { element: imgEl, src: currentSrc, alt: currentAlt },
          bubbles: true,
        })
        target.dispatchEvent(event)

        e.stopPropagation()
        e.preventDefault()
        return
      }

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

      // Notify parent that element is now editable
      const rect = textEl.getBoundingClientRect()
      elementActivateCallbackRef.current?.(textEl, rect)

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
