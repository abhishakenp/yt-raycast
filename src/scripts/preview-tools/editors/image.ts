import { push } from '../history'
import { ensureEid } from '../identity'
import { writeValue } from '../style-apply'

export interface ImageEditorHandle {
  open(img: HTMLImageElement): void
  close(): void
  isOpen(): boolean
  activeElement(): HTMLImageElement | null
}

interface CreateOpts {
  onChange?: (img: HTMLImageElement) => void
}

const TOOLBAR_ATTR = 'data-sf-image-toolbar'
const CONTROL_ATTR = 'data-sf-panel-control'
const Z_BASE = 2147482010

function markControl(el: HTMLElement): void {
  el.setAttribute(CONTROL_ATTR, '1')
}

function makeButton(label: string, primary: boolean): HTMLButtonElement {
  const b = document.createElement('button')
  b.type = 'button'
  b.textContent = label
  markControl(b)
  Object.assign(b.style, {
    padding: '6px 10px',
    borderRadius: '8px',
    border: primary ? '1px solid rgba(167, 139, 250, 0.55)' : '1px solid #3d3758',
    background: primary
      ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.95), rgba(167, 139, 250, 0.75))'
      : 'transparent',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '11px',
    lineHeight: '1',
  } as CSSStyleDeclaration)
  return b
}

function buildToolbar(): HTMLDivElement {
  const bar = document.createElement('div')
  bar.setAttribute(TOOLBAR_ATTR, '1')
  markControl(bar)
  Object.assign(bar.style, {
    position: 'fixed',
    zIndex: String(Z_BASE),
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 8px',
    borderRadius: '10px',
    background: 'linear-gradient(180deg, #1e1a2e 0%, #12101c 100%)',
    border: '1px solid rgba(124, 58, 237, 0.45)',
    boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
    fontFamily: 'system-ui, sans-serif',
    fontSize: '12px',
    color: '#e8e4ff',
  } as CSSStyleDeclaration)
  return bar
}

function positionNear(bar: HTMLElement, img: HTMLImageElement): void {
  const rect = img.getBoundingClientRect()
  const pad = 8
  const barRect = bar.getBoundingClientRect()
  const bw = barRect.width || 240
  const bh = barRect.height || 36
  let top = rect.top - bh - 10
  if (top < pad) top = Math.min(window.innerHeight - bh - pad, rect.bottom + 10)
  let left = rect.left + rect.width / 2 - bw / 2
  left = Math.max(pad, Math.min(window.innerWidth - bw - pad, left))
  bar.style.top = `${Math.max(pad, top)}px`
  bar.style.left = `${left}px`
}

function makeReadout(): HTMLSpanElement {
  const r = document.createElement('span')
  markControl(r)
  Object.assign(r.style, {
    fontVariantNumeric: 'tabular-nums',
    fontSize: '11px',
    color: '#c4b5fd',
    padding: '0 4px',
    minWidth: '72px',
    textAlign: 'center',
    display: 'none',
  } as CSSStyleDeclaration)
  return r
}

interface PanState {
  detach: () => void
  snapshot: string
}

function parseObjectPosition(img: HTMLImageElement): { x: number; y: number } {
  const parts = getComputedStyle(img).objectPosition.trim().split(/\s+/)
  const p1 = parts[0] || '50%'
  const p2 = parts[1] || parts[0] || '50%'
  const num = (v: string): number => {
    if (v === 'left' || v === 'top') return 0
    if (v === 'center') return 50
    if (v === 'right' || v === 'bottom') return 100
    const m = /^([\d.]+)%$/.exec(String(v))
    return m ? Number(m[1]) : 50
  }
  return { x: num(p1), y: num(p2) }
}

function attachPan(img: HTMLImageElement, onPercent: (x: number, y: number) => void): PanState {
  const cs0 = getComputedStyle(img)
  if (cs0.objectFit !== 'cover' && cs0.objectFit !== 'contain') {
    img.style.objectFit = 'cover'
  }
  const snapshot = img.style.objectPosition || ''
  let { x, y } = parseObjectPosition(img)
  let dragging = false
  let lastX = 0
  let lastY = 0
  const prevCursor = img.style.cursor
  const prevTouchAction = img.style.touchAction
  const prevUserSelect = img.style.userSelect
  const prevPe = img.style.pointerEvents
  const prevDraggable = img.getAttribute('draggable')
  img.style.cursor = 'grab'
  img.style.touchAction = 'none'
  img.style.pointerEvents = 'auto'
  img.setAttribute('draggable', 'false')

  const onDown = (e: PointerEvent): void => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    dragging = true
    lastX = e.clientX
    lastY = e.clientY
    img.style.cursor = 'grabbing'
    img.style.userSelect = 'none'
    try {
      img.setPointerCapture(e.pointerId)
    } catch {
      void 0
    }
  }
  const onMove = (e: PointerEvent): void => {
    if (!dragging) return
    e.preventDefault()
    const w = Math.max(1, img.clientWidth)
    const h = Math.max(1, img.clientHeight)
    let dx = e.movementX
    let dy = e.movementY
    if (dx === 0 && dy === 0) {
      dx = e.clientX - lastX
      dy = e.clientY - lastY
    }
    lastX = e.clientX
    lastY = e.clientY
    x -= (dx / w) * 100
    y -= (dy / h) * 100
    x = Math.max(0, Math.min(100, x))
    y = Math.max(0, Math.min(100, y))
    img.style.objectPosition = `${x}% ${y}%`
    onPercent(x, y)
  }
  const endDrag = (e: PointerEvent): void => {
    if (!dragging) return
    dragging = false
    img.style.cursor = 'grab'
    img.style.userSelect = prevUserSelect
    try {
      if (e.pointerId != null) img.releasePointerCapture(e.pointerId)
    } catch {
      void 0
    }
  }
  const onDocMove = (e: PointerEvent): void => {
    if (!dragging) return
    onMove(e)
  }
  const onDocUp = (e: PointerEvent): void => {
    if (!dragging) return
    endDrag(e)
  }

  img.addEventListener('pointerdown', onDown, true)
  img.addEventListener('pointerup', endDrag)
  img.addEventListener('pointercancel', endDrag)
  img.addEventListener('lostpointercapture', endDrag)
  document.addEventListener('pointermove', onDocMove, { passive: false, capture: true })
  document.addEventListener('pointerup', onDocUp, true)
  document.addEventListener('pointercancel', onDocUp, true)

  onPercent(x, y)

  return {
    snapshot,
    detach: () => {
      img.removeEventListener('pointerdown', onDown, true)
      img.removeEventListener('pointerup', endDrag)
      img.removeEventListener('pointercancel', endDrag)
      img.removeEventListener('lostpointercapture', endDrag)
      document.removeEventListener('pointermove', onDocMove, { capture: true })
      document.removeEventListener('pointerup', onDocUp, true)
      document.removeEventListener('pointercancel', onDocUp, true)
      img.style.cursor = prevCursor
      img.style.touchAction = prevTouchAction
      img.style.userSelect = prevUserSelect
      img.style.pointerEvents = prevPe
      if (prevDraggable == null) img.removeAttribute('draggable')
      else img.setAttribute('draggable', prevDraggable)
    },
  }
}

export function createImageEditor(opts?: CreateOpts): ImageEditorHandle {
  let activeImg: HTMLImageElement | null = null
  let toolbar: HTMLDivElement | null = null
  let pan: PanState | null = null
  let panSnapshotRaw = ''
  let panBeforeEffective = ''
  let readout: HTMLSpanElement | null = null
  let scrollFn: EventListener | null = null
  let keyFn: ((e: KeyboardEvent) => void) | null = null
  let onLoadFn: (() => void) | null = null

  const notify = (img: HTMLImageElement): void => {
    if (opts && typeof opts.onChange === 'function') {
      try {
        opts.onChange(img)
      } catch {
        void 0
      }
    }
  }

  const stopPan = (commit: boolean): void => {
    if (!pan || !activeImg) {
      pan = null
      if (readout) readout.style.display = 'none'
      return
    }
    const img = activeImg
    const before = panSnapshotRaw
    pan.detach()
    pan = null
    if (readout) readout.style.display = 'none'
    if (!commit) {
      // restore snapshot without history
      if (before) img.style.objectPosition = before
      else img.style.removeProperty('object-position')
      return
    }
    const after = img.style.objectPosition || ''
    if (after === before) return
    // Undo transient per-move writes by restoring `before`, then re-writing via writeValue
    // so history captures a single clean entry.
    if (before) img.style.objectPosition = before
    else img.style.removeProperty('object-position')
    writeValue(img, 'object-position', after, { important: false })
    notify(img)
    void panBeforeEffective
  }

  const startPan = (panBtn: HTMLButtonElement): void => {
    if (!activeImg) return
    if (pan) {
      stopPan(true)
      panBtn.textContent = 'Pan/Crop'
      panBtn.style.background = 'transparent'
      return
    }
    const img = activeImg
    panSnapshotRaw = img.style.objectPosition || ''
    panBeforeEffective = getComputedStyle(img).objectPosition || ''
    pan = attachPan(img, (x, y) => {
      if (readout) {
        readout.style.display = 'inline-block'
        readout.textContent = `${x.toFixed(0)}% ${y.toFixed(0)}%`
      }
    })
    panBtn.textContent = 'Done Pan'
    panBtn.style.background = 'rgba(167, 139, 250, 0.25)'
  }

  const doSwap = (): void => {
    if (!activeImg) return
    const img = activeImg
    const fileIn = document.createElement('input')
    fileIn.type = 'file'
    fileIn.accept = 'image/*'
    fileIn.style.display = 'none'
    markControl(fileIn)
    document.body.appendChild(fileIn)
    fileIn.addEventListener('change', () => {
      const f = fileIn.files && fileIn.files[0] ? fileIn.files[0] : null
      fileIn.remove()
      if (!f) return
      const eid = ensureEid(img)
      const before = img.outerHTML
      let blobUrl: string | null = null
      const commit = (src: string): void => {
        img.src = src
        const after = img.outerHTML
        push({
          eid,
          kind: 'html',
          before,
          after,
          at: Date.now(),
        })
        notify(img)
        if (toolbar) positionNear(toolbar, img)
      }
      // Prefer data URL for persistence across reload; fall back to blob URL if FileReader errors.
      const r = new FileReader()
      r.onload = () => {
        commit(String(r.result || ''))
      }
      r.onerror = () => {
        try {
          blobUrl = URL.createObjectURL(f)
          commit(blobUrl)
        } catch {
          void 0
        }
      }
      try {
        r.readAsDataURL(f)
      } catch {
        try {
          blobUrl = URL.createObjectURL(f)
          commit(blobUrl)
        } catch {
          void 0
        }
      }
    })
    fileIn.click()
  }

  const doAlt = (): void => {
    if (!activeImg) return
    const img = activeImg
    const current = img.getAttribute('alt') || ''
    const next = window.prompt('Alt text (describes the image):', current)
    if (next == null) return
    if (next === current) return
    const eid = ensureEid(img)
    const before = img.outerHTML
    img.setAttribute('alt', next)
    const after = img.outerHTML
    push({
      eid,
      kind: 'html',
      before,
      after,
      at: Date.now(),
    })
    notify(img)
  }

  const close = (): void => {
    if (pan) stopPan(false)
    if (toolbar) {
      toolbar.remove()
      toolbar = null
    }
    if (scrollFn) {
      window.removeEventListener('scroll', scrollFn, true)
      scrollFn = null
    }
    if (keyFn) {
      document.removeEventListener('keydown', keyFn, true)
      keyFn = null
    }
    if (activeImg && onLoadFn) {
      activeImg.removeEventListener('load', onLoadFn)
    }
    onLoadFn = null
    readout = null
    activeImg = null
    panSnapshotRaw = ''
    panBeforeEffective = ''
  }

  const open = (img: HTMLImageElement): void => {
    if (!img || img.tagName !== 'IMG') return
    if (activeImg === img && toolbar) return
    close()
    activeImg = img
    const bar = buildToolbar()
    toolbar = bar

    const swapBtn = makeButton('Swap', true)
    swapBtn.addEventListener('click', doSwap)

    const panBtn = makeButton('Pan/Crop', false)
    panBtn.addEventListener('click', () => startPan(panBtn))

    const altBtn = makeButton('Alt text', false)
    altBtn.addEventListener('click', doAlt)

    const closeBtn = makeButton('Close', false)
    closeBtn.addEventListener('click', () => close())

    readout = makeReadout()

    bar.appendChild(swapBtn)
    bar.appendChild(panBtn)
    bar.appendChild(altBtn)
    bar.appendChild(readout)
    bar.appendChild(closeBtn)

    document.documentElement.appendChild(bar)
    positionNear(bar, img)

    scrollFn = () => {
      if (toolbar && activeImg) positionNear(toolbar, activeImg)
    }
    window.addEventListener('scroll', scrollFn, true)

    keyFn = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      e.stopPropagation()
      close()
    }
    document.addEventListener('keydown', keyFn, true)

    onLoadFn = () => {
      if (activeImg !== img || !toolbar) return
      positionNear(toolbar, img)
    }
    if (!img.complete || img.naturalWidth === 0) {
      img.addEventListener('load', onLoadFn)
    }
  }

  return {
    open,
    close,
    isOpen: () => activeImg !== null,
    activeElement: () => activeImg,
  }
}
