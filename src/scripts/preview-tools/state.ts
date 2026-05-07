export type PreviewMode = 'inactive' | 'select' | 'annotate'

export interface PreviewState {
  active: Element | null
  hoverTarget: Element | null
  mode: PreviewMode
  panelOpen: boolean
  zBase: number

  veil: HTMLElement | null
  highlight: HTMLElement | null
  canvas: HTMLCanvasElement | null

  inlineToolbar: HTMLElement | null
  inlineSnapshot: string | null

  pendingTextAiId: string | null
  pendingStyleAiId: string | null

  imgPanCleanup: (() => void) | null
}

const ZBASE_DEFAULT = 2147482000

export const state: PreviewState = {
  active: null,
  hoverTarget: null,
  mode: 'inactive',
  panelOpen: false,
  zBase: ZBASE_DEFAULT,

  veil: null,
  highlight: null,
  canvas: null,

  inlineToolbar: null,
  inlineSnapshot: null,

  pendingTextAiId: null,
  pendingStyleAiId: null,

  imgPanCleanup: null,
}

export function getState(): PreviewState {
  return state
}

export function setMode(mode: PreviewMode): void {
  state.mode = mode
}

export function setActive(el: Element | null): void {
  state.active = el
}

export function setHoverTarget(el: Element | null): void {
  state.hoverTarget = el
}

export function setPanelOpen(open: boolean): void {
  state.panelOpen = open
}

export function resetState(): void {
  state.active = null
  state.hoverTarget = null
  state.mode = 'inactive'
  state.panelOpen = false
  state.veil = null
  state.highlight = null
  state.canvas = null
  state.inlineToolbar = null
  state.inlineSnapshot = null
  state.pendingTextAiId = null
  state.pendingStyleAiId = null
  state.imgPanCleanup = null
}
