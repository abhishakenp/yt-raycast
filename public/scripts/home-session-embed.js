const STATE_KEY = 'sfEmbeddedSession'

let shell = null
let frame = null
let listenersBound = false

export const isMarketingHomePath = () => {
  const p = location.pathname
  return p === '/' || p === ''
}

const setMainInert = (on) => {
  if (!shell) return
  for (const el of document.body.children) {
    if (el === shell) continue
    if (on) el.setAttribute('inert', '')
    else el.removeAttribute('inert')
  }
}

const hideShell = () => {
  if (!shell) return
  shell.hidden = true
  setMainInert(false)
}

const clearStrayEmbedInert = () => {
  const el = document.getElementById('sf-home-session-shell')
  if (el && !el.hidden) return
  document.querySelectorAll('body > [inert]').forEach((node) => {
    if (node.id !== 'sf-home-session-shell') node.removeAttribute('inert')
  })
}

const bindListeners = () => {
  if (listenersBound) return
  listenersBound = true
  window.addEventListener('pageshow', clearStrayEmbedInert)
  window.addEventListener('popstate', (ev) => {
    const id = ev.state && ev.state[STATE_KEY]
    if (id) {
      showShellForSession(String(id))
      try {
        frame?.focus()
      } catch {}
    } else {
      hideShell()
    }
  })
  window.addEventListener('message', (ev) => {
    if (ev.origin !== location.origin) return
    if (ev.data?.type !== 'sf-close-embedded-session') return
    if (!shell || shell.hidden) return
    if (history.state?.[STATE_KEY]) {
      history.back()
    } else {
      history.replaceState(null, '', '/')
      hideShell()
    }
  })
}

const ensureShell = () => {
  if (shell && frame) {
    bindListeners()
    return
  }
  shell = document.createElement('div')
  shell.id = 'sf-home-session-shell'
  shell.className = 'sf-home-session-shell'
  shell.hidden = true
  shell.setAttribute('role', 'dialog')
  shell.setAttribute('aria-modal', 'true')
  shell.setAttribute('aria-label', 'Live session dashboard')
  frame = document.createElement('iframe')
  frame.className = 'sf-home-session-frame'
  frame.setAttribute('title', 'Live session dashboard')
  document.body.appendChild(shell)
  shell.appendChild(frame)
  bindListeners()
}

const showShellForSession = (sessionId) => {
  ensureShell()
  const idStr = String(sessionId)
  const path = `/session/${encodeURIComponent(idStr)}?embed=1`
  const wasHidden = shell.hidden
  if (frame.dataset.sfSessionId !== idStr || wasHidden) {
    frame.dataset.sfSessionId = idStr
    frame.src = path
  }
  shell.hidden = false
  setMainInert(true)
}

export const openEmbeddedSession = (sessionId) => {
  const idStr = String(sessionId)
  if (!isMarketingHomePath()) {
    location.href = `/session/${idStr}`
    return
  }
  ensureShell()
  history.pushState({ [STATE_KEY]: idStr }, '', `/session/${idStr}`)
  showShellForSession(idStr)
  try {
    frame.focus()
  } catch {}
}
