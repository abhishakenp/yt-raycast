import { state } from '../state'
import { Classification } from '../targeting'
import { undo as historyUndo, redo as historyRedo, size as historySize } from '../history'
import { createPanelHeader } from './header'

export interface PanelContext {
  el: Element
  classification: Classification
  refresh(): void
  close(): void
}

export interface PanelTab {
  id: string
  label: string
  icon: string
  render(root: HTMLElement, ctx: PanelContext): () => void
  isVisible?(classification: Classification): boolean
}

export interface PanelHostHandle {
  open(el: Element, classification: Classification): void
  close(): void
  refresh(): void
  registerTab(tab: PanelTab): void
}

export interface PanelHostOpts {
  onSave: () => void
  onReselect?: (next: Element) => void
}

const PANEL_WIDTH = 320
const RAIL_WIDTH = 44

const tabRegistry: PanelTab[] = []

export function registerTab(tab: PanelTab): void {
  if (tabRegistry.some((t) => t.id === tab.id)) return
  tabRegistry.push(tab)
}

export function createPanelHost(opts: PanelHostOpts): PanelHostHandle {
  let rootEl: HTMLElement | null = null
  let railEl: HTMLElement | null = null
  let bodyEl: HTMLElement | null = null
  let headerHandle: ReturnType<typeof createPanelHeader> | null = null
  let tabBodyEl: HTMLElement | null = null
  let footerEl: HTMLElement | null = null
  let activeEl: Element | null = null
  let activeClassification: Classification | null = null
  let activeTabId: string | null = null
  let disposeActiveTab: (() => void) | null = null

  function localRegister(tab: PanelTab): void {
    registerTab(tab)
    if (rootEl && activeEl && activeClassification) refresh()
  }

  function buildRoot(): HTMLElement {
    const r = document.createElement('div')
    r.setAttribute('data-sf-panel', '1')
    Object.assign(r.style, {
      position: 'fixed',
      top: '0',
      right: '0',
      bottom: '0',
      width: PANEL_WIDTH + 'px',
      zIndex: String(state.zBase + 20),
      display: 'flex',
      flexDirection: 'row',
      fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
      fontSize: '12px',
      color: '#e8e4ff',
      background: 'linear-gradient(180deg, #1e1a2e 0%, #12101c 100%)',
      borderLeft: '1px solid rgba(124, 58, 237, 0.45)',
      boxShadow: '-12px 0 32px rgba(0,0,0,0.45)',
      boxSizing: 'border-box',
    })
    return r
  }

  function buildRail(): HTMLElement {
    const rail = document.createElement('div')
    Object.assign(rail.style, {
      width: RAIL_WIDTH + 'px',
      flex: '0 0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '10px 0',
      gap: '6px',
      borderRight: '1px solid rgba(124, 58, 237, 0.25)',
      background: 'rgba(0,0,0,0.25)',
    })
    return rail
  }

  function buildBody(): HTMLElement {
    const b = document.createElement('div')
    Object.assign(b.style, {
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'column',
      minWidth: '0',
      minHeight: '0',
    })
    return b
  }

  function buildTabBody(): HTMLElement {
    const t = document.createElement('div')
    Object.assign(t.style, {
      flex: '1 1 auto',
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '10px',
      boxSizing: 'border-box',
    })
    return t
  }

  function buildFooter(): HTMLElement {
    const f = document.createElement('div')
    Object.assign(f.style, {
      flex: '0 0 auto',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '6px',
      padding: '10px',
      borderTop: '1px solid rgba(124, 58, 237, 0.25)',
      background: 'rgba(0,0,0,0.2)',
    })
    return f
  }

  function footerBtn(label: string, primary: boolean): HTMLButtonElement {
    const b = document.createElement('button')
    b.type = 'button'
    b.textContent = label
    Object.assign(b.style, {
      padding: '7px 10px',
      borderRadius: '8px',
      border: primary ? '1px solid rgba(167, 139, 250, 0.55)' : '1px solid #3d3758',
      background: primary
        ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.95), rgba(167, 139, 250, 0.75))'
        : 'transparent',
      color: '#fff',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '11px',
    })
    return b
  }

  function railIconBtn(tab: PanelTab, isActive: boolean): HTMLButtonElement {
    const b = document.createElement('button')
    b.type = 'button'
    b.title = tab.label
    b.setAttribute('aria-label', tab.label)
    b.innerHTML = tab.icon || ''
    Object.assign(b.style, {
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      border: isActive ? '1px solid rgba(167, 139, 250, 0.6)' : '1px solid transparent',
      background: isActive ? 'rgba(124, 58, 237, 0.35)' : 'transparent',
      color: '#e8e4ff',
      cursor: 'pointer',
      padding: '0',
    })
    return b
  }

  function visibleTabs(): PanelTab[] {
    if (!activeClassification) return []
    return tabRegistry.filter((t) =>
      typeof t.isVisible === 'function' ? !!t.isVisible(activeClassification as Classification) : true,
    )
  }

  function renderRail(): void {
    if (!railEl) return
    railEl.innerHTML = ''
    const tabs = visibleTabs()
    for (const tab of tabs) {
      const isActive = tab.id === activeTabId
      const b = railIconBtn(tab, isActive)
      b.addEventListener('click', () => {
        activeTabId = tab.id
        renderRail()
        renderTabBody()
      })
      railEl.appendChild(b)
    }
  }

  function renderTabBody(): void {
    if (!tabBodyEl || !activeEl || !activeClassification) return
    if (disposeActiveTab) {
      try {
        disposeActiveTab()
      } catch {
        /* ignore */
      }
      disposeActiveTab = null
    }
    tabBodyEl.innerHTML = ''
    const tabs = visibleTabs()
    if (tabs.length === 0) {
      const empty = document.createElement('div')
      empty.textContent = 'No controls available for this element.'
      Object.assign(empty.style, {
        padding: '12px',
        color: 'rgba(232, 228, 255, 0.7)',
        fontSize: '12px',
      })
      tabBodyEl.appendChild(empty)
      return
    }
    if (!activeTabId || !tabs.some((t) => t.id === activeTabId)) {
      activeTabId = tabs[0].id
    }
    const tab = tabs.find((t) => t.id === activeTabId)
    if (!tab) return
    const ctx: PanelContext = {
      el: activeEl,
      classification: activeClassification,
      refresh,
      close,
    }
    try {
      disposeActiveTab = tab.render(tabBodyEl, ctx) || null
    } catch {
      disposeActiveTab = null
    }
  }

  function renderFooter(): void {
    if (!footerEl) return
    footerEl.innerHTML = ''
    const sizes = historySize()
    const done = footerBtn('Done', true)
    done.addEventListener('click', () => {
      try {
        opts.onSave()
      } catch {
        /* ignore */
      }
    })
    const revert = footerBtn('Revert this change', false)
    revert.addEventListener('click', () => {
      historyUndo()
      refresh()
      renderFooter()
    })
    const undoBtn = footerBtn('Undo last', false)
    undoBtn.disabled = sizes.undo === 0
    if (sizes.undo === 0) undoBtn.style.opacity = '0.45'
    undoBtn.addEventListener('click', () => {
      historyUndo()
      refresh()
      renderFooter()
    })
    const redoBtn = footerBtn('Redo', false)
    redoBtn.disabled = sizes.redo === 0
    if (sizes.redo === 0) redoBtn.style.opacity = '0.45'
    redoBtn.addEventListener('click', () => {
      historyRedo()
      refresh()
      renderFooter()
    })
    footerEl.appendChild(done)
    footerEl.appendChild(revert)
    footerEl.appendChild(undoBtn)
    footerEl.appendChild(redoBtn)
  }

  function mountOnce(): void {
    if (rootEl && document.contains(rootEl)) return
    rootEl = buildRoot()
    railEl = buildRail()
    bodyEl = buildBody()
    tabBodyEl = buildTabBody()
    footerEl = buildFooter()

    const headerHost = document.createElement('div')
    Object.assign(headerHost.style, { flex: '0 0 auto' })
    bodyEl.appendChild(headerHost)
    bodyEl.appendChild(tabBodyEl)
    bodyEl.appendChild(footerEl)

    rootEl.appendChild(railEl)
    rootEl.appendChild(bodyEl)
    document.body.appendChild(rootEl)

    // Header is (re)built per-open via refresh() so the ref stays fresh.
    headerHandle = createPanelHeader({
      el: activeEl as Element,
      onReselect: (next: Element) => {
        if (opts.onReselect) {
          try { opts.onReselect(next) } catch { /* ignore */ }
        }
      },
    })
    headerHost.appendChild(headerHandle.root)
  }

  function refresh(): void {
    if (!rootEl || !activeEl || !activeClassification) return
    if (headerHandle) headerHandle.refresh(activeEl)
    renderRail()
    renderTabBody()
    renderFooter()
  }

  function open(el: Element, classification: Classification): void {
    activeEl = el
    activeClassification = classification
    mountOnce()
    refresh()
  }

  function close(): void {
    if (disposeActiveTab) {
      try { disposeActiveTab() } catch { /* ignore */ }
      disposeActiveTab = null
    }
    if (rootEl && rootEl.parentNode) {
      try { rootEl.parentNode.removeChild(rootEl) } catch { /* ignore */ }
    }
    rootEl = null
    railEl = null
    bodyEl = null
    tabBodyEl = null
    footerEl = null
    headerHandle = null
    activeEl = null
    activeClassification = null
    activeTabId = null
  }

  return {
    open,
    close,
    refresh,
    registerTab: localRegister,
  }
}
