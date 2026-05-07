import { registerTab, type PanelTab, type PanelContext } from '../host'
import { createIconRow, type IconRowItem } from '../controls/icon-row'
import { writeValue, readValue } from '../../style-apply'
import { undo as historyUndo } from '../../history'
import { buildTokensVocabulary } from '../../palette'
import { post, on, type MessageEnvelope } from '../../bridge'

const ICON =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2l1.6 3.4L13 7l-3.4 1.6L8 12l-1.6-3.4L3 7l3.4-1.6L8 2z"/><path d="M13 11.5l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5.5-1z"/></svg>'

type Scope = 'element' | 'section' | 'page'

interface StyleDiffEntry {
  prop: string
  value: string
  token?: string
  important?: boolean
}

interface AiResponsePayload {
  id?: string
  html?: string
  styleDiff?: StyleDiffEntry[]
  tokensUsed?: number
  error?: string
}

interface SnapshotState {
  kind: 'html' | 'styleDiff'
  beforeHtml?: string
  afterHtml?: string
  diffEntries?: number
  appliedDiff?: StyleDiffEntry[]
  beforeValues?: Record<string, string>
  showingAfter: boolean
}

const COMPUTED_PROPS: string[] = [
  'display', 'position', 'width', 'height', 'min-width', 'min-height',
  'max-width', 'max-height', 'margin', 'padding', 'background',
  'background-color', 'background-image', 'color', 'border',
  'border-radius', 'box-shadow', 'opacity', 'font-family', 'font-size',
  'font-weight', 'font-style', 'line-height', 'letter-spacing',
  'text-align', 'text-decoration', 'text-transform', 'flex',
  'flex-direction', 'flex-wrap', 'gap', 'grid-template-columns',
  'justify-content', 'align-items', 'align-content', 'overflow',
  'z-index', 'cursor', 'transition', 'transform', 'filter',
  'visibility', 'outline',
]

function serializeComputed(el: Element): Record<string, string> {
  const out: Record<string, string> = {}
  try {
    const cs = window.getComputedStyle(el as HTMLElement)
    for (const prop of COMPUTED_PROPS) {
      const v = cs.getPropertyValue(prop)
      if (v) out[prop] = v.trim()
    }
  } catch {
    /* ignore */
  }
  return out
}

function newRequestId(): string {
  return 'ai_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)
}

function scopeIcons(): IconRowItem[] {
  return [
    {
      id: 'element',
      label: 'Just this thing',
      svg: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="5" width="6" height="6" rx="1"/></svg>',
    },
    {
      id: 'section',
      label: 'This whole section',
      svg: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="12" height="10" rx="1"/><line x1="2" y1="7" x2="14" y2="7"/></svg>',
    },
    {
      id: 'page',
      label: 'The whole page',
      svg: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="12" height="12" rx="1"/><line x1="2" y1="5" x2="14" y2="5"/><line x1="2" y1="9" x2="14" y2="9"/></svg>',
    },
  ]
}

function label(text: string): HTMLElement {
  const d = document.createElement('div')
  d.textContent = text
  Object.assign(d.style, {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    opacity: '0.7',
    fontWeight: '700',
    margin: '6px 0 4px',
  })
  return d
}

function primaryBtn(text: string): HTMLButtonElement {
  const b = document.createElement('button')
  b.type = 'button'
  b.textContent = text
  Object.assign(b.style, {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(167, 139, 250, 0.55)',
    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.95), rgba(167, 139, 250, 0.75))',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '12px',
  })
  return b
}

function secondaryBtn(text: string): HTMLButtonElement {
  const b = document.createElement('button')
  b.type = 'button'
  b.textContent = text
  Object.assign(b.style, {
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #3d3758',
    background: 'transparent',
    color: '#e8e4ff',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '11px',
  })
  return b
}

function render(root: HTMLElement, ctx: PanelContext): () => void {
  root.innerHTML = ''
  Object.assign(root.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  })

  let scope: Scope = 'element'
  let currentRequestId: string | null = null
  let snapshot: SnapshotState | null = null
  let targetEl: Element = ctx.el

  root.appendChild(label('What do you want to change?'))

  const textarea = document.createElement('textarea')
  textarea.placeholder = 'Tell me what you want to change on this...'
  textarea.rows = 5
  Object.assign(textarea.style, {
    width: '100%',
    boxSizing: 'border-box',
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid #3d3758',
    background: 'rgba(0,0,0,0.3)',
    color: '#e8e4ff',
    fontFamily: 'system-ui, sans-serif',
    fontSize: '12px',
    resize: 'vertical',
    minHeight: '72px',
  })
  root.appendChild(textarea)

  root.appendChild(label('Scope'))
  const scopeRow = createIconRow({
    icons: scopeIcons(),
    current: scope,
    onPick: (id) => {
      scope = id as Scope
    },
  })
  root.appendChild(scopeRow.root)

  const actionsRow = document.createElement('div')
  Object.assign(actionsRow.style, {
    display: 'flex',
    gap: '6px',
    marginTop: '6px',
  })
  const sendBtn = primaryBtn('Send')
  actionsRow.appendChild(sendBtn)
  root.appendChild(actionsRow)

  const statusEl = document.createElement('div')
  Object.assign(statusEl.style, {
    fontSize: '11px',
    opacity: '0.75',
    minHeight: '14px',
  })
  root.appendChild(statusEl)

  const resultEl = document.createElement('div')
  Object.assign(resultEl.style, {
    display: 'none',
    flexDirection: 'column',
    gap: '6px',
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid rgba(124, 58, 237, 0.35)',
    background: 'rgba(124, 58, 237, 0.08)',
    marginTop: '4px',
  })
  root.appendChild(resultEl)

  const tokensLine = document.createElement('div')
  Object.assign(tokensLine.style, {
    fontSize: '10px',
    opacity: '0.6',
    marginTop: '2px',
  })
  root.appendChild(tokensLine)

  function setBusy(busy: boolean): void {
    sendBtn.disabled = busy
    sendBtn.style.opacity = busy ? '0.6' : '1'
    sendBtn.style.cursor = busy ? 'default' : 'pointer'
    sendBtn.textContent = busy ? 'Thinking...' : 'Send'
  }

  function setStatus(text: string, isError?: boolean): void {
    statusEl.textContent = text
    statusEl.style.color = isError ? '#ffb4b4' : 'rgba(232, 228, 255, 0.75)'
  }

  function clearResult(): void {
    resultEl.innerHTML = ''
    resultEl.style.display = 'none'
    tokensLine.textContent = ''
  }

  function applyHtmlReplacement(html: string): void {
    const beforeHtml = (targetEl as HTMLElement).outerHTML
    const holder = document.createElement('div')
    holder.innerHTML = html.trim()
    const next = holder.firstElementChild
    if (!next || !targetEl.parentNode) return
    targetEl.parentNode.replaceChild(next, targetEl)
    targetEl = next
    snapshot = {
      kind: 'html',
      beforeHtml,
      afterHtml: (next as HTMLElement).outerHTML,
      showingAfter: true,
    }
  }

  function applyStyleDiff(diff: StyleDiffEntry[]): void {
    const before: Record<string, string> = {}
    for (const d of diff) {
      before[d.prop] = readValue(targetEl, d.prop).raw
    }
    for (const d of diff) {
      writeValue(targetEl, d.prop, d.value, {
        token: d.token,
        important: d.important,
      })
    }
    snapshot = {
      kind: 'styleDiff',
      appliedDiff: diff.slice(),
      beforeValues: before,
      diffEntries: diff.length,
      showingAfter: true,
    }
  }

  function showBefore(): void {
    if (!snapshot) return
    if (snapshot.kind === 'html' && snapshot.beforeHtml && targetEl.parentNode) {
      const holder = document.createElement('div')
      holder.innerHTML = snapshot.beforeHtml.trim()
      const prev = holder.firstElementChild
      if (!prev) return
      targetEl.parentNode.replaceChild(prev, targetEl)
      targetEl = prev
      snapshot.showingAfter = false
      return
    }
    if (snapshot.kind === 'styleDiff' && snapshot.beforeValues) {
      const htmlEl = targetEl as HTMLElement
      for (const prop of Object.keys(snapshot.beforeValues)) {
        const raw = snapshot.beforeValues[prop]
        if (!raw) htmlEl.style.removeProperty(prop)
        else htmlEl.style.setProperty(prop, raw)
      }
      snapshot.showingAfter = false
    }
  }

  function showAfter(): void {
    if (!snapshot) return
    if (snapshot.kind === 'html' && snapshot.afterHtml && targetEl.parentNode) {
      const holder = document.createElement('div')
      holder.innerHTML = snapshot.afterHtml.trim()
      const next = holder.firstElementChild
      if (!next) return
      targetEl.parentNode.replaceChild(next, targetEl)
      targetEl = next
      snapshot.showingAfter = true
      return
    }
    if (snapshot.kind === 'styleDiff' && snapshot.appliedDiff) {
      const htmlEl = targetEl as HTMLElement
      for (const d of snapshot.appliedDiff) {
        htmlEl.style.setProperty(d.prop, d.value, d.important ? 'important' : '')
      }
      snapshot.showingAfter = true
    }
  }

  function renderResultUi(tokensUsed?: number): void {
    resultEl.innerHTML = ''
    resultEl.style.display = 'flex'

    const toggleRow = document.createElement('div')
    Object.assign(toggleRow.style, { display: 'flex', gap: '4px' })
    const beforeBtn = secondaryBtn('Before')
    const afterBtn = secondaryBtn('After')
    function paintToggle(): void {
      const showingAfter = !!(snapshot && snapshot.showingAfter)
      afterBtn.style.background = showingAfter ? 'rgba(124, 58, 237, 0.35)' : 'transparent'
      beforeBtn.style.background = !showingAfter ? 'rgba(124, 58, 237, 0.35)' : 'transparent'
    }
    beforeBtn.addEventListener('click', () => {
      showBefore()
      paintToggle()
    })
    afterBtn.addEventListener('click', () => {
      showAfter()
      paintToggle()
    })
    toggleRow.appendChild(beforeBtn)
    toggleRow.appendChild(afterBtn)
    resultEl.appendChild(toggleRow)
    paintToggle()

    const commitRow = document.createElement('div')
    Object.assign(commitRow.style, { display: 'flex', gap: '4px' })
    const keepBtn = primaryBtn('Keep')
    keepBtn.style.padding = '6px 10px'
    keepBtn.style.fontSize = '11px'
    const undoBtn = secondaryBtn('Undo')
    keepBtn.addEventListener('click', () => {
      if (snapshot && !snapshot.showingAfter) showAfter()
      snapshot = null
      clearResult()
      setStatus('Change kept.')
    })
    undoBtn.addEventListener('click', () => {
      if (!snapshot) return
      if (snapshot.kind === 'html') {
        if (snapshot.showingAfter) showBefore()
      } else if (snapshot.kind === 'styleDiff' && snapshot.diffEntries) {
        if (snapshot.showingAfter) {
          for (let i = 0; i < snapshot.diffEntries; i++) historyUndo()
        }
      }
      snapshot = null
      clearResult()
      setStatus('Change undone.')
    })
    commitRow.appendChild(keepBtn)
    commitRow.appendChild(undoBtn)
    resultEl.appendChild(commitRow)

    if (typeof tokensUsed === 'number' && tokensUsed > 0) {
      tokensLine.textContent = `Used ~${tokensUsed} tokens.`
    } else {
      tokensLine.textContent = ''
    }
  }

  function handleResponse(data: AiResponsePayload): void {
    if (!data || data.id !== currentRequestId) return
    currentRequestId = null
    setBusy(false)

    if (data.error) {
      setStatus(String(data.error), true)
      return
    }
    if (data.html) {
      applyHtmlReplacement(data.html)
      setStatus('')
      renderResultUi(data.tokensUsed)
      return
    }
    if (Array.isArray(data.styleDiff) && data.styleDiff.length > 0) {
      applyStyleDiff(data.styleDiff)
      setStatus('')
      renderResultUi(data.tokensUsed)
      return
    }
    setStatus('No changes returned.', true)
  }

  const disposeListener = on('SF_PREVIEW_STYLE_AI_RES', (envelope: MessageEnvelope) => {
    handleResponse(envelope as unknown as AiResponsePayload)
  })

  sendBtn.addEventListener('click', () => {
    const instruction = textarea.value.trim()
    if (!instruction) {
      setStatus('Write a short instruction first.', true)
      return
    }
    if (currentRequestId) return
    clearResult()
    setStatus('Sending...')
    setBusy(true)
    const id = newRequestId()
    currentRequestId = id
    targetEl = ctx.el
    try {
      post('SF_PREVIEW_STYLE_AI_REQ', {
        id,
        fragmentHtml: (targetEl as HTMLElement).outerHTML,
        instruction,
        scope,
        computedStyles: serializeComputed(targetEl),
        tokens: buildTokensVocabulary(),
        friendlyLabel: ctx.classification.friendlyLabel,
      })
    } catch {
      currentRequestId = null
      setBusy(false)
      setStatus('Failed to send request.', true)
    }
  })

  return () => {
    try { disposeListener() } catch { /* ignore */ }
    currentRequestId = null
    snapshot = null
  }
}

const tab: PanelTab = {
  id: 'ai',
  label: 'AI',
  icon: ICON,
  render,
  isVisible: () => true,
}

registerTab(tab)

export default tab
