import { post } from '../bridge'
import { createIconRow } from '../controls'
import type { EditorController } from '../shell'
import type { TabContext, TabDef } from '../types'

const ICON =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2 L9.2 6.4 L13.6 7.6 L10.4 10.8 L11.2 15.2 L8 12.8 L4.8 15.2 L5.6 10.8 L2.4 7.6 L6.8 6.4 Z"/></svg>'

const ICON_EL =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="10" height="10" rx="1.5"/></svg>'
const ICON_SECTION =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="12" height="4" rx="0.5"/><rect x="2" y="9" width="12" height="4" rx="0.5"/></svg>'
const ICON_PAGE =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="2" width="10" height="12" rx="1"/><line x1="5" y1="5" x2="11" y2="5"/><line x1="5" y1="8" x2="11" y2="8"/><line x1="5" y1="11" x2="9" y2="11"/></svg>'

function render(body: HTMLElement, ctx: TabContext): () => void {
  let scope: 'element' | 'section' | 'page' = 'element'
  let busy = false
  let appliedDiffCount = 0
  let lastWasHtml = false

  const scopeRow = createIconRow({
    label: 'Scope',
    icons: [
      { id: 'element', label: 'This element', svg: ICON_EL },
      { id: 'section', label: 'Section', svg: ICON_SECTION },
      { id: 'page', label: 'Whole page', svg: ICON_PAGE },
    ],
    current: scope,
    onPick: (id) => {
      if (id === 'element' || id === 'section' || id === 'page') scope = id
    },
  })
  body.appendChild(scopeRow.root)

  const inputGroup = document.createElement('div')
  inputGroup.className = 'sf-control-group'
  const inputLabel = document.createElement('div')
  inputLabel.className = 'sf-control-label'
  inputLabel.textContent = 'Instruction'
  inputGroup.appendChild(inputLabel)

  const textarea = document.createElement('textarea')
  textarea.rows = 3
  textarea.placeholder = 'Make it bolder, add breathing room...'
  Object.assign(textarea.style, {
    width: '100%',
    background: 'rgba(0,0,0,0.28)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.9)',
    padding: '8px 10px',
    fontSize: '12px',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
  })
  inputGroup.appendChild(textarea)

  const sendBtn = document.createElement('button')
  sendBtn.type = 'button'
  sendBtn.textContent = 'Send'
  Object.assign(sendBtn.style, {
    marginTop: '6px',
    padding: '6px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(167,139,250,0.55)',
    background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  })
  inputGroup.appendChild(sendBtn)

  body.appendChild(inputGroup)

  const status = document.createElement('div')
  Object.assign(status.style, {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.6)',
    padding: '4px 0',
    minHeight: '16px',
  })
  body.appendChild(status)

  const result = document.createElement('div')
  Object.assign(result.style, {
    display: 'none',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '6px',
  })
  body.appendChild(result)

  function setStatus(text: string, isError?: boolean): void {
    status.textContent = text
    status.style.color = isError ? '#fca5a5' : 'rgba(255,255,255,0.6)'
  }

  function setBusy(v: boolean): void {
    busy = v
    sendBtn.disabled = v
    sendBtn.style.opacity = v ? '0.5' : '1'
    sendBtn.style.pointerEvents = v ? 'none' : ''
  }

  function clearResult(): void {
    result.style.display = 'none'
    while (result.firstChild) result.removeChild(result.firstChild)
  }

  function renderResult(tokensUsed?: number): void {
    clearResult()
    result.style.display = 'flex'
    const row = document.createElement('div')
    Object.assign(row.style, { display: 'flex', gap: '6px', alignItems: 'center' })
    const keep = document.createElement('button')
    keep.type = 'button'
    keep.textContent = 'Keep'
    Object.assign(keep.style, {
      padding: '4px 10px',
      borderRadius: '7px',
      border: '1px solid rgba(167,139,250,0.5)',
      background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
      color: '#fff',
      fontSize: '11px',
      fontWeight: '600',
      cursor: 'pointer',
    })
    keep.addEventListener('click', () => {
      appliedDiffCount = 0
      lastWasHtml = false
      clearResult()
      setStatus('Kept.')
    })
    const undo = document.createElement('button')
    undo.type = 'button'
    undo.textContent = lastWasHtml ? 'Revert' : 'Undo'
    Object.assign(undo.style, {
      padding: '4px 10px',
      borderRadius: '7px',
      border: '1px solid rgba(255,255,255,0.15)',
      background: 'transparent',
      color: 'rgba(255,255,255,0.8)',
      fontSize: '11px',
      fontWeight: '600',
      cursor: 'pointer',
    })
    undo.addEventListener('click', () => {
      const n = lastWasHtml ? 1 : appliedDiffCount
      for (let i = 0; i < n; i++) post('SF_PANEL_UNDO')
      appliedDiffCount = 0
      lastWasHtml = false
      clearResult()
      setStatus('Reverted.')
    })
    row.appendChild(keep)
    row.appendChild(undo)
    if (typeof tokensUsed === 'number') {
      const hint = document.createElement('span')
      hint.textContent = `${tokensUsed} tok`
      Object.assign(hint.style, { fontSize: '10px', opacity: '0.55' })
      row.appendChild(hint)
    }
    result.appendChild(row)
  }

  sendBtn.addEventListener('click', async () => {
    if (busy) return
    const instruction = textarea.value.trim()
    if (!instruction) {
      setStatus('Write a short instruction first.', true)
      return
    }
    clearResult()
    setBusy(true)
    setStatus('Sending...')
    appliedDiffCount = 0
    lastWasHtml = false
    try {
      const res = await ctx.requestAi(instruction, scope)
      setBusy(false)
      if (res.error) {
        setStatus(res.error, true)
        return
      }
      if (res.html && !res.styleDiff) {
        lastWasHtml = true
        setStatus('AI returned a structural change — not applied from this panel.', true)
        return
      }
      if (res.styleDiff && res.styleDiff.length) {
        for (const entry of res.styleDiff) {
          ctx.apply(entry.prop, entry.value, {
            token: entry.token,
            important: entry.important,
          })
          appliedDiffCount += 1
        }
        setStatus(`Applied ${appliedDiffCount} change${appliedDiffCount === 1 ? '' : 's'}.`)
        renderResult(res.tokensUsed)
        return
      }
      setStatus('No changes returned.', true)
    } catch {
      setBusy(false)
      setStatus('Failed to send request.', true)
    }
  })

  return () => {
    setBusy(false)
  }
}

const tab: TabDef = {
  id: 'ai',
  label: 'AI',
  icon: ICON,
  render,
}

export function registerWith(controller: EditorController): void {
  controller.registerTab(tab)
}

export default tab
