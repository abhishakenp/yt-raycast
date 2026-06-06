const EID_ATTR = 'data-sf-eid'

function randomHex8(): string {
  let out = ''
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const buf = new Uint8Array(4)
    crypto.getRandomValues(buf)
    for (let i = 0; i < buf.length; i++) {
      const hex = buf[i].toString(16).padStart(2, '0')
      out += hex
    }
    return out
  }
  for (let i = 0; i < 8; i++) {
    out += Math.floor(Math.random() * 16).toString(16)
  }
  return out
}

function newEid(): string {
  return `e_${randomHex8()}`
}

export function ensureEid(el: Element): string {
  const existing = el.getAttribute(EID_ATTR)
  if (existing && existing.length > 0) return existing
  const id = newEid()
  el.setAttribute(EID_ATTR, id)
  return id
}

export function findByEid(eid: string): Element | null {
  if (!eid) return null
  if (typeof document === 'undefined') return null
  const escaped =
    typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
      ? CSS.escape(eid)
      : eid.replace(/"/g, '\\"')
  try {
    return document.querySelector(`[${EID_ATTR}="${escaped}"]`)
  } catch {
    return null
  }
}

export function ensureAncestorEids(el: Element): string[] {
  const ids: string[] = []
  let cur: Element | null = el
  const body = typeof document !== 'undefined' ? document.body : null
  while (cur && cur !== body && cur.nodeType === 1) {
    ids.push(ensureEid(cur))
    cur = cur.parentElement
  }
  return ids
}

export const SF_EID_ATTR = EID_ATTR
