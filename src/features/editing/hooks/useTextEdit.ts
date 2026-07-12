import { useEffect, useRef } from 'react'
import { isInRadixPortal } from '../lib/radix-portal'

interface CapturedTextNode {
  node: Text
  value: string
}

interface TemporaryEditingStyleSnapshot {
  cursor: string
  outline: string
  outlineOffset: string
}

export interface TextEditChange {
  oldText: string
  newText: string
  originalNodeIndex?: number
}

export interface TextEditState {
  element: HTMLElement
  originalText: string
  /** Snapshot of the element's text nodes at activation, in document order.
   *  Edits are diffed per-node so inline structure (<br>, <span>, <strong>, …)
   *  is preserved and each change yields a precise, matchable text run instead
   *  of the element's flattened textContent. */
  originalNodes: CapturedTextNode[]
  /** Element children that were locked (contenteditable=false) during editing
   *  to prevent the user from accidentally deleting non-text content like SVG
   *  icons or images. Cleaned up in cleanupElement. */
  lockedChildren?: HTMLElement[]
  /** Inline styles overwritten only as temporary editing affordances. */
  temporaryStyle?: TemporaryEditingStyleSnapshot
}

/** Collect every Text node under `el` in document order (including those nested
 *  in inline wrappers like <span>/<strong>). */
export function collectTextNodes(el: HTMLElement): Text[] {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  let current = walker.nextNode()
  while (current) {
    nodes.push(current as Text)
    current = walker.nextNode()
  }
  return nodes
}

/** 0-based index of `target` among identical occurrences in document order
 *  before `element`, so the server edits the clicked run rather than the first
 *  textual match (e.g. the same word in the nav vs. a heading). */
function computeOccurrenceIndex(
  container: HTMLElement,
  element: HTMLElement,
  target: string,
): number {
  if (!target) return 0
  try {
    const range = document.createRange()
    range.setStart(container, 0)
    range.setEndBefore(element)
    const before = range.toString()
    let count = 0
    let at = before.indexOf(target)
    while (at !== -1) {
      count += 1
      at = before.indexOf(target, at + target.length)
    }
    return count
  } catch {
    return 0
  }
}

function computeOccurrenceIndexWithinOriginalNodes(
  active: TextEditState,
  target: string,
  originalNodeIndex: number | undefined,
): number {
  if (!target || originalNodeIndex === undefined) return 0
  let count = 0
  for (
    let nodeIndex = 0;
    nodeIndex < Math.min(originalNodeIndex, active.originalNodes.length);
    nodeIndex += 1
  ) {
    const value = active.originalNodes[nodeIndex].value
    let at = value.indexOf(target)
    while (at !== -1) {
      count += 1
      at = value.indexOf(target, at + target.length)
    }
  }
  return count
}

/** Diff the element's current text nodes against the snapshot taken at
 *  activation and return one change per modified node. Preserves structure:
 *  a node's value changes, the surrounding <br>/<span>/etc. do not. Falls back
 *  to a minimal diff of the flattened textContent when node structure changed
 *  (e.g. user deleted across a <br>, merging nodes).
 *  Exported for testing. */
export function diffEdits(active: TextEditState): TextEditChange[] {
  const current = collectTextNodes(active.element)
  if (current.length === active.originalNodes.length) {
    const changes: TextEditChange[] = []
    for (let i = 0; i < current.length; i += 1) {
      const oldText = active.originalNodes[i].value
      const newText = current[i].nodeValue ?? ''
      if (
        oldText !== newText &&
        oldText.trim() &&
        // Allow empty newText (deletion) but skip whitespace-only changes.
        (newText.length === 0 || newText.trim())
      ) {
        changes.push({ oldText, newText, originalNodeIndex: i })
      }
    }
    return changes
  }
  // Node structure changed (e.g. user selected across a <br>, merging
  // text nodes). Fall back to a minimal diff of the flattened textContent
  // so we only send the changed portion — not the entire flattened string,
  // which would span multiple OpenUI source arguments and corrupt them.
  const flattened = active.element.textContent ?? ''
  if (
    flattened !== active.originalText &&
    // Allow empty flattened (full deletion) but skip whitespace-only.
    (flattened.length === 0 || flattened.trim())
  ) {
    const oldText = active.originalText
    const newText = flattened
    let prefixLen = 0
    const maxPrefix = Math.min(oldText.length, newText.length)
    while (prefixLen < maxPrefix && oldText[prefixLen] === newText[prefixLen]) {
      prefixLen += 1
    }
    let suffixLen = 0
    const maxSuffix = Math.min(
      oldText.length - prefixLen,
      newText.length - prefixLen,
    )
    while (
      suffixLen < maxSuffix &&
      oldText[oldText.length - 1 - suffixLen] ===
        newText[newText.length - 1 - suffixLen]
    ) {
      suffixLen += 1
    }
    const oldMid = oldText.slice(prefixLen, oldText.length - suffixLen)
    const newMid = newText.slice(prefixLen, newText.length - suffixLen)
    if (oldMid.trim() && oldMid.length < oldText.length) {
      return [{ oldText: oldMid, newText: newMid }]
    }
    const originalTextRuns = active.originalNodes
      .map((node) => node.value)
      .filter((value) => value.trim())
    if (
      oldMid.trim() &&
      newMid.trim() &&
      originalTextRuns.length > 1 &&
      collectTextNodes(active.element).length === 1
    ) {
      const [firstRun, ...remainingRuns] = originalTextRuns
      return [
        { oldText: firstRun, newText: newMid },
        ...remainingRuns.map((runText) => ({
          oldText: runText,
          newText: '',
        })),
      ]
    }
    return [{ oldText, newText }]
  }
  return []
}

export function useTextEdit(
  containerRef: React.RefObject<HTMLElement | null>,
  editMode: boolean,
  onTextChange: (change: {
    oldText: string
    newText: string
    element: HTMLElement
    occurrenceIndex: number
  }) => void,
  onImageChange?: (change: {
    oldSrc: string
    newSrc: string
    element: HTMLImageElement
    alt: string
  }) => void,
  onElementActivate?: (element: HTMLElement, rect: DOMRect) => void,
): { commitEdit: () => void; cancelEdit: () => void } {
  const activeEditRef = useRef<TextEditState | null>(null)
  const callbackRef = useRef(onTextChange)
  const imageCallbackRef = useRef(onImageChange)
  const elementActivateCallbackRef = useRef(onElementActivate)
  const blurRafRef = useRef<number | null>(null)
  const finishEditRef = useRef<() => void>(() => {})
  const cancelEditRef = useRef<() => void>(() => {})
  const editModeRef = useRef(editMode)
  callbackRef.current = onTextChange
  imageCallbackRef.current = onImageChange
  elementActivateCallbackRef.current = onElementActivate

  useEffect(() => {
    editModeRef.current = editMode
    if (!editMode) {
      cancelEditRef.current()
    }
  }, [editMode])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const finishEdit = () => {
      const active = activeEditRef.current
      if (!active) return
      // Clear the ref BEFORE anything that can re-enter this handler. cleanupElement
      // resets contentEditable, which blurs the focused element and synchronously
      // fires the capture `blur` listener → finishEdit again. Clearing first makes
      // that re-entrant call a no-op, preventing a duplicate (stale) edit submit.
      activeEditRef.current = null

      const changes = diffEdits(active)
      cleanupElement(
        active.element,
        active.lockedChildren,
        active.temporaryStyle,
      )
      for (const change of changes) {
        const occurrenceIndex = computeOccurrenceIndex(
          container,
          active.element,
          change.oldText,
        )
        const occurrenceIndexWithinElement =
          computeOccurrenceIndexWithinOriginalNodes(
            active,
            change.oldText,
            change.originalNodeIndex,
          )
        callbackRef.current({
          oldText: change.oldText,
          newText: change.newText,
          element: active.element,
          occurrenceIndex: occurrenceIndex + occurrenceIndexWithinElement,
        })
      }
    }
    finishEditRef.current = finishEdit

    const cancelEdit = () => {
      const active = activeEditRef.current
      if (!active) return
      activeEditRef.current = null
      // Restore original text-node values (preserves structure); fall back to a
      // flat restore only if the node structure changed during editing.
      const current = collectTextNodes(active.element)
      if (current.length === active.originalNodes.length) {
        for (let i = 0; i < current.length; i += 1) {
          current[i].nodeValue = active.originalNodes[i].value
        }
      } else {
        active.element.textContent = active.originalText
      }
      cleanupElement(
        active.element,
        active.lockedChildren,
        active.temporaryStyle,
      )
    }
    cancelEditRef.current = cancelEdit

    const handleClick = (e) => {
      if (!editModeRef.current) return

      const target = e.target as HTMLElement

      // If the click lands on the element currently being edited, ignore it.
      // This happens when a <button> or <a> being edited receives a synthetic
      // click from keyboard activation (Space fires click on keyup, Enter on
      // keydown). Without this guard, the synthetic click calls finishEdit(),
      // interrupting the edit session — the user can't type spaces because
      // every space commits the edit and re-activates the element.
      const active = activeEditRef.current
      if (active && isClickOnActiveEdit(target, active.element)) {
        e.stopPropagation()
        e.preventDefault()
        return
      }

      // Route to image swap when the click lands on an image itself, or on a
      // container that holds an image but no editable text. A container with
      // its own text AND a descendant image routes to text editing — the user
      // clicked the text region; the image is clickable directly.
      const textEl = findTextElement(target)
      const imgEl =
        target.tagName.toLowerCase() === 'img'
          ? (target as HTMLImageElement)
          : textEl
            ? null
            : (target.querySelector('img') as HTMLImageElement | null)

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

      if (!textEl) return

      const originalText = textEl.textContent || ''
      if (!originalText.trim()) return

      textEl.contentEditable = 'true'
      textEl.dataset.shipFastInlineEditing = 'true'
      const temporaryStyle: TemporaryEditingStyleSnapshot = {
        cursor: textEl.style.cursor,
        outline: textEl.style.outline,
        outlineOffset: textEl.style.outlineOffset,
      }
      // Lock non-text children (SVG icons, images) so the user can't
      // accidentally delete them while editing the text.
      const lockedChildren = lockNonTextChildren(textEl)
      // preventScroll: the user just clicked this element, so it is already
      // in view. Without it, focus() scrolls every scrollable ancestor
      // (including the nested .genui-preview scroller) to "reveal" the
      // element, which can yank the page and push the clicked text out of
      // view — especially inside transformed/nested scroll containers.
      textEl.focus({ preventScroll: true })

      // Place the caret where the user clicked instead of selecting the whole
      // element. Select-all means the first keystroke replaces ALL of the
      // element's content, flattening <br>/<span> structure into a single text
      // run. Per-character caret editing keeps the structure intact.
      const caretRange =
        typeof document.caretRangeFromPoint === 'function'
          ? document.caretRangeFromPoint(e.clientX, e.clientY)
          : null
      const sel = window.getSelection()
      sel?.removeAllRanges()
      if (caretRange && textEl.contains(caretRange.startContainer)) {
        sel?.addRange(caretRange)
      } else {
        const fallback = document.createRange()
        // For a mixed container (direct text + locked block children), park
        // the caret at the end of the last direct text node — collapsing to
        // the end of the whole element would place it after the locked
        // children, so typing would create a new text node outside every
        // original run and force the lossy flattened-diff path.
        const directTextNodes = Array.from(textEl.childNodes).filter(
          (node): node is Text =>
            node.nodeType === Node.TEXT_NODE && !!node.nodeValue?.trim(),
        )
        const lastDirect = directTextNodes[directTextNodes.length - 1]
        if (lockedChildren.length > 0 && lastDirect) {
          fallback.setStart(lastDirect, lastDirect.nodeValue?.length ?? 0)
          fallback.collapse(true)
        } else {
          fallback.selectNodeContents(textEl)
          fallback.collapse(false)
        }
        sel?.addRange(fallback)
      }

      textEl.style.outline = '2px solid hsl(var(--primary))'
      textEl.style.outlineOffset = '2px'
      textEl.style.cursor = 'text'

      // Notify parent that element is now editable
      const rect = textEl.getBoundingClientRect()
      elementActivateCallbackRef.current?.(textEl, rect)

      activeEditRef.current = {
        element: textEl,
        originalText,
        originalNodes: collectTextNodes(textEl).map((node) => ({
          node,
          value: node.nodeValue ?? '',
        })),
        lockedChildren,
        temporaryStyle,
      }

      e.stopPropagation()
      e.preventDefault()
    }

    const handleBlur = () => {
      // Defer by one animation frame. React re-renders (e.g. the toolbar
      // opening via setToolbarState) can cause a transient blur when the DOM
      // reconciles; focus usually returns within the same frame. By deferring,
      // we can check if focus actually left the container + toolbar before
      // killing the edit. Without this, the cursor appears then immediately
      // disappears because the blur fires before the user types anything.
      if (blurRafRef.current !== null) {
        cancelAnimationFrame(blurRafRef.current)
      }
      blurRafRef.current = requestAnimationFrame(() => {
        blurRafRef.current = null
        const active = activeEditRef.current
        if (!active) return
        // If focus is still within the container, the blur was transient.
        const focused = document.activeElement
        if (focused && container.contains(focused)) return
        // If focus moved to the inline edit toolbar (which lives outside the
        // container as a fixed overlay), keep the edit alive so the user can
        // apply style changes.
        if (focused && focused.closest('.inline-edit-toolbar')) return
        // Radix overlays (Select dropdown, popover, AlertDialog) portal to
        // document.body. Keep the edit alive while focus is inside one so
        // toolbar controls (e.g. the gap unit select) can be operated.
        if (isInRadixPortal(focused)) return
        finishEdit()
      })
    }

    const handleKeyDown = (e) => {
      if (
        activeEditRef.current &&
        (e.ctrlKey || e.metaKey) &&
        !e.altKey &&
        e.key.toLowerCase() === 'a'
      ) {
        e.preventDefault()
        const range = document.createRange()
        range.selectNodeContents(activeEditRef.current.element)
        const sel = window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(range)
        return
      }
      if (e.key === ' ' && activeEditRef.current) {
        // Prevent the button's native Space activation (which fires a click on
        // keyup and doesn't insert a space character). Manually insert the space
        // so the user can type spaces in button/link text.
        e.preventDefault()
        document.execCommand('insertText', false, ' ')
      }
      // Intercept Backspace/Delete at keydown level to prevent deletion of
      // locked children (SVG icons). beforeinput may not fire reliably in all
      // browsers, and the selection may already be extended by the time it
      // fires. keydown fires before any selection changes.
      if (
        (e.key === 'Backspace' || e.key === 'Delete') &&
        activeEditRef.current
      ) {
        const active = activeEditRef.current
        if (active.lockedChildren && active.lockedChildren.length > 0) {
          const sel = window.getSelection()
          if (sel) {
            const range = sel.getRangeAt(0)
            if (sel.isCollapsed) {
              // Collapsed selection: check if the node that would be deleted
              // is a locked child
              if (
                shouldPreventLockedDeletion(
                  e.key === 'Backspace'
                    ? 'deleteContentBackward'
                    : 'deleteContentForward',
                  range.startContainer,
                  range.startOffset,
                  active.lockedChildren,
                )
              ) {
                e.preventDefault()
              } else if (
                // Chrome quirk: when a text node adjacent to a
                // contenteditable=false element is emptied via Backspace,
                // Chrome may also delete the contenteditable=false element.
                // Prevent this by intercepting the deletion when the text
                // node has exactly 1 character left and the adjacent node
                // is a locked child. Manually clear the text node instead.
                range.startContainer.nodeType === Node.TEXT_NODE &&
                active.lockedChildren.length > 0
              ) {
                const textNode = range.startContainer as Text
                const textLen = textNode.textContent?.length ?? 0
                if (
                  e.key === 'Backspace' &&
                  textLen === 1 &&
                  range.startOffset === 1
                ) {
                  const prev = textNode.previousSibling
                  if (prev && active.lockedChildren.some((l) => l === prev)) {
                    e.preventDefault()
                    textNode.nodeValue = ''
                    // Collapse selection to start of the now-empty text node
                    const newRange = document.createRange()
                    newRange.setStart(textNode, 0)
                    newRange.collapse(true)
                    sel.removeAllRanges()
                    sel.addRange(newRange)
                  }
                } else if (
                  e.key === 'Delete' &&
                  textLen === 1 &&
                  range.startOffset === 0
                ) {
                  const next = textNode.nextSibling
                  if (next && active.lockedChildren.some((l) => l === next)) {
                    e.preventDefault()
                    textNode.nodeValue = ''
                  }
                }
              }
            } else {
              // Non-collapsed selection: check if the selection range
              // includes any locked child, and if so, prevent deletion
              for (const locked of active.lockedChildren) {
                if (range.intersectsNode(locked)) {
                  e.preventDefault()
                  break
                }
              }
            }
          }
        }
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        // Enter commits the text edit (same as clicking Save/Apply).
        e.preventDefault()
        finishEdit()
      }
      if (e.key === 'Escape') {
        cancelEdit()
      }
    }

    const handleBeforeInput = (e) => {
      const active = activeEditRef.current
      if (!active || !active.lockedChildren) return
      const sel = window.getSelection()
      if (!sel) return
      // Handle both collapsed and non-collapsed selections
      const range = sel.getRangeAt(0)
      const isDirectFill =
        e.inputType === 'insertText' &&
        !e.isComposing &&
        typeof e.data === 'string' &&
        e.data.length > 1 &&
        sel.isCollapsed &&
        active.originalNodes.length === 1 &&
        active.lockedChildren.length === 0 &&
        active.element.textContent === active.originalText

      if (isDirectFill) {
        e.preventDefault()
        const textNode = active.originalNodes[0].node
        textNode.nodeValue = e.data
        const nextRange = document.createRange()
        nextRange.setStart(textNode, e.data.length)
        nextRange.collapse(true)
        sel.removeAllRanges()
        sel.addRange(nextRange)
        return
      }

      if (sel.isCollapsed) {
        if (
          shouldPreventLockedDeletion(
            e.inputType,
            range.startContainer,
            range.startOffset,
            active.lockedChildren,
          )
        ) {
          e.preventDefault()
        }
      } else {
        // Non-collapsed selection: prevent deletion if range includes any
        // locked child
        for (const locked of active.lockedChildren) {
          if (range.intersectsNode(locked)) {
            e.preventDefault()
            break
          }
        }
      }
    }

    container.addEventListener('click', handleClick)
    container.addEventListener('blur', handleBlur, true)
    container.addEventListener('keydown', handleKeyDown)
    container.addEventListener('beforeinput', handleBeforeInput)

    return () => {
      container.removeEventListener('click', handleClick)
      container.removeEventListener('blur', handleBlur, true)
      container.removeEventListener('keydown', handleKeyDown)
      container.removeEventListener('beforeinput', handleBeforeInput)
      if (blurRafRef.current !== null) {
        cancelAnimationFrame(blurRafRef.current)
        blurRafRef.current = null
      }
      finishEdit()
    }
  }, [containerRef])

  return {
    commitEdit: () => finishEditRef.current(),
    cancelEdit: () => cancelEditRef.current(),
  }
}

// Block-level descendants that mark an element as a multi-block container
// rather than an editable leaf text block. Also used to lock block children
// while a mixed container's direct text is being edited.
const BLOCK_CHILD_SELECTOR =
  'div,p,ul,ol,section,article,header,footer,nav,main,aside,table,form,h1,h2,h3,h4,h5,h6,li,blockquote,figure,figcaption,pre,dl,dt,dd,details,summary,address,hgroup,fieldset,tr,td,th,caption'

// Elements that can never host a text edit — interactive controls, media,
// and void/replaced elements. Everything else with real text is editable.
const NON_TEXT_TAGS = new Set([
  'input',
  'textarea',
  'select',
  'option',
  'optgroup',
  'svg',
  'path',
  'img',
  'picture',
  'source',
  'track',
  'video',
  'audio',
  'canvas',
  'iframe',
  'object',
  'embed',
  'script',
  'style',
  'br',
  'hr',
])

// Sanity ceiling so a pathological single text run (e.g. inlined JSON) never
// becomes contentEditable. Generous enough for real long-form paragraphs.
const MAX_EDITABLE_TEXT_LENGTH = 5000

/** True when `el` has at least one non-whitespace text node as a DIRECT child
 *  (as opposed to text living only inside descendant elements). */
export function hasDirectText(el: HTMLElement): boolean {
  return Array.from(el.childNodes).some(
    (node) => node.nodeType === Node.TEXT_NODE && node.nodeValue?.trim(),
  )
}

/** Core editability predicate shared by findTextElement (walk-up) and
 *  isEditableTextLeaf (single element). An element is text-editable when it
 *  isn't an interactive/media element and either
 *  (a) it's a leaf text block — real text, no block-level children — or
 *  (b) it's a mixed container with direct text of its own (the block children
 *      get locked contenteditable=false during the edit, so only the direct
 *      text and inline runs are mutable). */
function isEditableTextElement(el: HTMLElement): boolean {
  const tag = el.tagName.toLowerCase()
  if (NON_TEXT_TAGS.has(tag)) return false
  const text = (el.textContent || '').trim()
  if (!text) return false
  const hasBlockChild = !!el.querySelector(BLOCK_CHILD_SELECTOR)
  if (!hasBlockChild) return text.length < MAX_EDITABLE_TEXT_LENGTH
  return hasDirectText(el)
}

/** Check if a click event should be ignored because it targets the element
 *  currently being edited. When a `<button>` or `<a>` is contentEditable and
 *  focused, pressing Space triggers the browser's default activation → a
 *  synthetic `click` event lands on the element. Without this guard, that
 *  click calls `finishEdit()`, interrupting the edit session so the user
 *  can't type spaces (every space commits and re-activates the element).
 *  Returns true when `target` is `activeElement` or nested inside it. */
export function isClickOnActiveEdit(
  target: HTMLElement,
  activeElement: HTMLElement | null,
): boolean {
  if (!activeElement) return false
  return activeElement === target || activeElement.contains(target)
}

/** Determine whether a `beforeinput` delete event should be prevented
 *  because the node that would be deleted is a locked child (SVG icon, image).
 *  Exported for behavioral testing. */
export function shouldPreventLockedDeletion(
  inputType: string,
  startContainer: Node,
  offset: number,
  lockedChildren: HTMLElement[],
): boolean {
  if (lockedChildren.length === 0) return false
  let nodeToDelete: Node | null = null
  if (inputType === 'deleteContentBackward') {
    if (startContainer.nodeType === Node.TEXT_NODE) {
      if (offset === 0) {
        nodeToDelete = startContainer.previousSibling
      }
    } else if (startContainer.nodeType === Node.ELEMENT_NODE) {
      nodeToDelete =
        (startContainer as HTMLElement).childNodes[offset - 1] ?? null
    }
  } else if (inputType === 'deleteContentForward') {
    if (startContainer.nodeType === Node.TEXT_NODE) {
      if (offset === (startContainer.textContent ?? '').length) {
        nodeToDelete = startContainer.nextSibling
      }
    } else if (startContainer.nodeType === Node.ELEMENT_NODE) {
      nodeToDelete = (startContainer as HTMLElement).childNodes[offset] ?? null
    }
  }
  return (
    nodeToDelete !== null &&
    lockedChildren.some((locked) => locked === nodeToDelete)
  )
}

/** Set contenteditable=false on direct element children that don't contain
 *  text content (SVG icons, images, icon wrappers) and on block-level
 *  children of a mixed container (only its direct text and inline runs are
 *  in scope for the edit; block children are separately editable by clicking
 *  them directly). Prevents the user from accidentally selecting and deleting
 *  content outside the edit's scope.
 *  Returns the list of locked elements so they can be unlocked in cleanup. */
export function lockNonTextChildren(el: HTMLElement): HTMLElement[] {
  const locked: HTMLElement[] = []
  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType !== Node.ELEMENT_NODE) continue
    const childEl = child as HTMLElement
    // Don't lock inline spans/strongs with text the user might want to edit.
    if (
      !childEl.textContent?.trim() ||
      (typeof childEl.matches === 'function' &&
        childEl.matches(BLOCK_CHILD_SELECTOR))
    ) {
      childEl.setAttribute('contenteditable', 'false')
      locked.push(childEl)
    }
  }
  return locked
}

/** Remove the contenteditable=false attribute set by lockNonTextChildren. */
export function unlockNonTextChildren(elements: HTMLElement[]) {
  for (const el of elements) {
    el.removeAttribute('contenteditable')
  }
}

/** Find the element whose text a click should edit: walk up from the click
 *  target to the nearest editable text element. Interactive/media elements
 *  anywhere in the chain abort the search (clicking inside an <input> must
 *  never text-edit an ancestor). */
export function findTextElement(el: HTMLElement): HTMLElement | null {
  let current: HTMLElement | null = el
  while (current) {
    if (NON_TEXT_TAGS.has(current.tagName.toLowerCase())) return null
    if (isEditableTextElement(current)) return current
    current = current.parentElement
  }
  return null
}

/** Check if an element is directly text-editable — same criteria as
 *  findTextElement but without walking up the parent tree. Used by
 *  the toolbar to decide whether to show text-specific controls. */
export function isEditableTextLeaf(el: HTMLElement): boolean {
  return isEditableTextElement(el)
}

function cleanupElement(
  el: HTMLElement,
  lockedChildren?: HTMLElement[],
  temporaryStyle?: TemporaryEditingStyleSnapshot,
) {
  // Remove the attribute (not just reset the property) so it never leaks into
  // the serialized afterHtml payload that gets persisted as preview.html.
  el.removeAttribute('contenteditable')
  delete el.dataset.shipFastInlineEditing
  // Unlock non-text children that were locked during editing.
  if (lockedChildren) {
    unlockNonTextChildren(lockedChildren)
  }
  el.style.outline = temporaryStyle?.outline ?? ''
  el.style.outlineOffset = temporaryStyle?.outlineOffset ?? ''
  el.style.cursor = temporaryStyle?.cursor ?? ''
  if (!el.getAttribute('style')?.trim()) {
    el.removeAttribute('style')
  }
}

/** Revert an element's text to oldText without destroying non-text
 *  children (SVG icons, images). Setting textContent replaces ALL
 *  children with a single text node, deleting icons. Instead, find the
 *  first text node and restore its value; if no text node exists (e.g.
 *  the user deleted all text), insert a new one before the first
 *  non-text child. Exported for testing and reuse by Dashboard. */
export function revertTextPreservingIcons(
  element: HTMLElement,
  oldText: string,
) {
  const textNode = Array.from(element.childNodes).find(
    (n) => n.nodeType === Node.TEXT_NODE,
  ) as Text | undefined
  if (textNode) {
    textNode.nodeValue = oldText
  } else if (oldText) {
    // No text node — insert one before the first element child
    const firstEl = Array.from(element.childNodes).find(
      (n) => n.nodeType === Node.ELEMENT_NODE,
    )
    element.insertBefore(document.createTextNode(oldText), firstEl ?? null)
  }
}
