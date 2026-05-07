const STATE_KEY = 'sfEmbeddedSession'

let shell: HTMLDivElement | null = null
let frame: HTMLIFrameElement | null = null
let listenersBound: boolean = false

export const isMarketingHomePath = (): boolean => {
  const p: string = location.pathname
  return p === '/' || p === ''
}

export const setMainInert = (on: boolean): void => {
  if (!shell) return
  for (const el of Array.from(document.body.children)) {
    if (el === shell) continue
    if (on) el.setAttribute('inert', '')
    else el.removeAttribute('inert')
  }
}

const hideShell = (): void => {
  if (!shell) return
  shell.hidden = true
  setMainInert(false)
}

const clearStrayEmbedInert = (): void => {
  const el: HTMLElement | null = document.getElementById('sf-home-session-shell')
  if (el && !el.hidden) return
  document.querySelectorAll('body > [inert]').forEach((node: Element) => {
    if (node.id !== 'sf-home-session-shell') node.removeAttribute('inert')
  })
}

const bindListeners = (): void => {
  if (listenersBound) return
  listenersBound = true
  window.addEventListener('pageshow', clearStrayEmbedInert)
  window.addEventListener('popstate', (ev: PopStateEvent) => {
    const state = ev.state as Record<string, unknown> | null
    const id = state && state[STATE_KEY]
    if (id) {
      showShellForSession(String(id))
      try {
        frame?.focus()
      } catch {}
    } else {
      hideShell()
    }
  })
  window.addEventListener('message', (ev: MessageEvent<{ type?: string }>) => {
    if (ev.origin !== location.origin) return
    if (ev.data?.type !== 'sf-close-embedded-session') return
    if (!shell || shell.hidden) return
    if ((history.state as Record<string, unknown> | null)?.[STATE_KEY]) {
      history.back()
    } else {
      history.replaceState(null, '', '/')
      hideShell()
    }
  })
}

export const ensureShell = (): void => {
  if (shell && frame) {
    bindListeners()
    return
  }
  shell = document.createElement('div') as HTMLDivElement
  shell.id = 'sf-home-session-shell'
  shell.className = 'sf-home-session-shell'
  shell.hidden = true
  shell.setAttribute('role', 'dialog')
  shell.setAttribute('aria-modal', 'true')
  shell.setAttribute('aria-label', 'Live session dashboard')
  frame = document.createElement('iframe') as HTMLIFrameElement
  frame.className = 'sf-home-session-frame'
  frame.setAttribute('title', 'Live session dashboard')
  document.body.appendChild(shell)
  shell.appendChild(frame)
  bindListeners()
}

export const showShellForSession = (sessionId: string | number): void => {
  ensureShell()
  const idStr: string = String(sessionId)
  const path: string = `/session/${encodeURIComponent(idStr)}?embed=1`
  const wasHidden: boolean = !!shell?.hidden
  if (frame && (frame.dataset.sfSessionId !== idStr || wasHidden)) {
    frame.dataset.sfSessionId = idStr
    frame.src = path
  }
  if (shell) {
    shell.hidden = false
  }
  setMainInert(true)
}

export const openEmbeddedSession = (sessionId: string | number): void => {
  const idStr: string = String(sessionId)
  if (!isMarketingHomePath()) {
    location.href = `/session/${idStr}`
    return
  }
  ensureShell()
  history.pushState({ [STATE_KEY]: idStr }, '', `/session/${idStr}`)
  showShellForSession(idStr)
  try {
    frame?.focus()
  } catch {}
}
