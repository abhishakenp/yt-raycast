import { state } from './state'
import {
  pickTarget,
  syncHighlight,
  setOverlayRefs,
  classify,
  isOverlayNode,
} from './targeting'
import type { TextEditorHandle } from './editors/text'
import type { ImageEditorHandle } from './editors/image'
import type { ElementEditorHandle } from './editors/element'

export interface SelectModeHandle {
  activate(): void
  deactivate(): void
  isActive(): boolean
}

export interface AnnotateModeHandle {
  activate(): void
  deactivate(): void
  isActive(): boolean
  clear(): void
}

export interface SelectModeOpts {
  textEditor: TextEditorHandle
  imageEditor: ImageEditorHandle
  elementEditor: ElementEditorHandle
}

const Z_VEIL_OFFSET = 0
const Z_HIGHLIGHT_OFFSET = 1
const Z_CANVAS_OFFSET = 2

function ensureVeil(): HTMLElement {
  if (state.veil && document.contains(state.veil)) return state.veil
  const v = document.createElement('div')
  v.setAttribute('data-sf-pt-veil', '1')
  Object.assign(v.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    right: '0',
    bottom: '0',
    zIndex: String(state.zBase + Z_VEIL_OFFSET),
    background: 'transparent',
    cursor: 'crosshair',
  } as Partial<CSSStyleDeclaration>)
  document.documentElement.appendChild(v)
  state.veil = v
  setOverlayRefs({ veil: v })
  return v
}

function ensureHighlight(): HTMLElement {
  if (state.highlight && document.contains(state.highlight)) return state.highlight
  const h = document.createElement('div')
  h.setAttribute('data-sf-pt-hl', '1')
  Object.assign(h.style, {
    position: 'fixed',
    pointerEvents: 'none',
    border: '2px solid #a78bfa',
    borderRadius: '4px',
    boxShadow: '0 0 0 1px rgba(0,0,0,0.2)',
    zIndex: String(state.zBase + Z_HIGHLIGHT_OFFSET),
    display: 'none',
    boxSizing: 'border-box',
  } as Partial<CSSStyleDeclaration>)
  document.documentElement.appendChild(h)
  state.highlight = h
  setOverlayRefs({ highlight: h })
  return h
}

function removeVeil(): void {
  if (state.veil) {
    try {
      state.veil.remove()
    } catch {
      /* ignore */
    }
    state.veil = null
    setOverlayRefs({ veil: null })
  }
}

function removeHighlight(): void {
  if (state.highlight) {
    try {
      state.highlight.remove()
    } catch {
      /* ignore */
    }
    state.highlight = null
    setOverlayRefs({ highlight: null })
  }
}

export function createSelectMode(opts: SelectModeOpts): SelectModeHandle {
  let active = false
  let veil: HTMLElement | null = null

  const onMove = (ev: MouseEvent): void => {
    if (!active) return
    const el = pickTarget(ev)
    syncHighlight(el)
  }

  const onClick = (ev: MouseEvent): void => {
    if (!active) return
    ev.preventDefault()
    ev.stopPropagation()
    ev.stopImmediatePropagation()
    const el = pickTarget(ev)
    if (!el || el === document.documentElement || el === document.body) return
    if (isOverlayNode(el)) return
    // Tear down veil/highlight: the panel/editor owns the UI from here.
    deactivate()
    const cls = classify(el)
    if (cls.canImage) {
      opts.imageEditor.open(el as HTMLImageElement)
      return
    }
    if (cls.canText) {
      opts.textEditor.open(el)
      return
    }
    if (cls.isContainer) {
      opts.elementEditor.open(el, cls)
      return
    }
    // Fallback for other elements (controls, etc.) — open container-style panel.
    opts.elementEditor.open(el, cls)
  }

  function activate(): void {
    if (active) return
    active = true
    state.mode = 'select'
    veil = ensureVeil()
    ensureHighlight()
    veil.addEventListener('mousemove', onMove, true)
    veil.addEventListener('click', onClick, true)
  }

  function deactivate(): void {
    if (!active && !state.veil && !state.highlight) return
    active = false
    if (state.mode === 'select') state.mode = 'inactive'
    if (veil) {
      try {
        veil.removeEventListener('mousemove', onMove, true)
        veil.removeEventListener('click', onClick, true)
      } catch {
        /* ignore */
      }
      veil = null
    }
    removeVeil()
    removeHighlight()
  }

  function isActive(): boolean {
    return active
  }

  return { activate, deactivate, isActive }
}

interface AnnotatePoint {
  x: number
  y: number
}

export function createAnnotateMode(): AnnotateModeHandle {
  let active = false
  let canvas: HTMLCanvasElement | null = null
  let ctx: CanvasRenderingContext2D | null = null
  let drawing = false
  let last: AnnotatePoint | null = null
  let resizeFn: (() => void) | null = null

  function doResize(): void {
    if (!canvas || !ctx) return
    const dpr = window.devicePixelRatio || 1
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function ensureCanvas(): HTMLCanvasElement {
    if (canvas && document.contains(canvas)) return canvas
    const c = document.createElement('canvas')
    c.setAttribute('data-sf-pt-draw', '1')
    Object.assign(c.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      width: '100%',
      height: '100%',
      zIndex: String(state.zBase + Z_CANVAS_OFFSET),
      touchAction: 'none',
      cursor: 'crosshair',
    } as Partial<CSSStyleDeclaration>)
    ctx = c.getContext('2d')
    document.documentElement.appendChild(c)
    canvas = c
    state.canvas = c
    setOverlayRefs({ canvas: c })
    resizeFn = () => doResize()
    window.addEventListener('resize', resizeFn)
    doResize()
    return c
  }

  function bind(c: HTMLCanvasElement): void {
    const draw = (ev: PointerEvent): void => {
      const x = ev.clientX
      const y = ev.clientY
      if (!drawing) {
        last = { x, y }
        return
      }
      if (!ctx || !last) return
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.95)'
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(last.x, last.y)
      ctx.lineTo(x, y)
      ctx.stroke()
      last = { x, y }
    }
    c.addEventListener('pointerdown', (ev: PointerEvent) => {
      drawing = true
      last = { x: ev.clientX, y: ev.clientY }
      try {
        c.setPointerCapture(ev.pointerId)
      } catch {
        /* ignore */
      }
    })
    c.addEventListener('pointermove', draw)
    c.addEventListener('pointerup', () => {
      drawing = false
      last = null
    })
    c.addEventListener('pointercancel', () => {
      drawing = false
      last = null
    })
  }

  function activate(): void {
    if (active) return
    active = true
    state.mode = 'annotate'
    const c = ensureCanvas()
    bind(c)
  }

  function deactivate(): void {
    if (!active && !canvas) return
    active = false
    if (state.mode === 'annotate') state.mode = 'inactive'
    if (resizeFn) {
      window.removeEventListener('resize', resizeFn)
      resizeFn = null
    }
    if (canvas) {
      try {
        canvas.remove()
      } catch {
        /* ignore */
      }
      canvas = null
      ctx = null
      state.canvas = null
      setOverlayRefs({ canvas: null })
    }
    drawing = false
    last = null
  }

  function clear(): void {
    if (!canvas || !ctx) return
    doResize()
  }

  function isActive(): boolean {
    return active
  }

  return { activate, deactivate, isActive, clear }
}
