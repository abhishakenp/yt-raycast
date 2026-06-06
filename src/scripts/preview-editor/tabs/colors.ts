import { createSwatchRow } from '../controls'
import type { EditorController } from '../shell'
import type { PanelOpenPayload, TabContext, TabDef, TokenSwatch } from '../types'

const ICON =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><circle cx="5.5" cy="7" r="0.6" fill="currentColor"/><circle cx="8" cy="5" r="0.6" fill="currentColor"/><circle cx="10.5" cy="7" r="0.6" fill="currentColor"/><circle cx="9" cy="10" r="0.6" fill="currentColor"/></svg>'

const COMMON_NEUTRALS = ['#ffffff', '#f3f4f6', '#d1d5db', '#6b7280', '#1f2937', '#000000']
const TEXT_NEUTRALS = ['#ffffff', '#e5e7eb', '#9ca3af', '#4b5563', '#111827', '#000000']
const BORDER_NEUTRALS = ['#ffffff', '#d1d5db', '#9ca3af', '#4b5563', '#1f2937', '#000000']

function tokensFor(category: 'background' | 'color' | 'border', all: TokenSwatch[]): TokenSwatch[] {
  // Keep all tokens visible for now — categorization in palette.ts is
  // brand/neutral/semantic, all of which are reasonable for any of these
  // properties. If downstream wants filtering, adjust here.
  void category
  return all
}

function readCurrent(state: PanelOpenPayload, prop: string): string | undefined {
  const raw = state.rawStyles[prop]
  if (raw) return raw
  const comp = state.computedStyles[prop]
  return comp
}

function render(body: HTMLElement, ctx: TabContext): () => void {
  const state = ctx.state

  const bg = createSwatchRow({
    label: 'Background',
    tokens: tokensFor('background', state.tokens),
    neutrals: COMMON_NEUTRALS,
    current: readCurrent(state, 'background-color') || readCurrent(state, 'background'),
    allowGradient: true,
    onPick: (v) => {
      ctx.apply('background', v.css, {
        token: v.tokenCssVar,
        important: true,
        shorthand: true,
      })
    },
    onUnlink: () => {
      ctx.apply('background-color', 'inherit', { important: true, shorthand: true })
    },
  })
  body.appendChild(bg.root)

  if (state.classification.canText) {
    const text = createSwatchRow({
      label: 'Text color',
      tokens: tokensFor('color', state.tokens),
      neutrals: TEXT_NEUTRALS,
      current: readCurrent(state, 'color'),
      onPick: (v) => {
        ctx.apply('color', v.css, { token: v.tokenCssVar, important: true })
      },
      onUnlink: () => {
        ctx.apply('color', 'inherit', { important: true })
      },
    })
    body.appendChild(text.root)
  }

  const border = createSwatchRow({
    label: 'Border color',
    tokens: tokensFor('border', state.tokens),
    neutrals: BORDER_NEUTRALS,
    current: readCurrent(state, 'border-color') || readCurrent(state, 'border'),
    onPick: (v) => {
      ctx.apply('border-color', v.css, { token: v.tokenCssVar, important: true })
    },
    onUnlink: () => {
      ctx.apply('border-color', 'transparent', { important: true })
    },
  })
  body.appendChild(border.root)

  return () => {
    /* no listeners to remove */
  }
}

const tab: TabDef = {
  id: 'colors',
  label: 'Colors',
  icon: ICON,
  render,
}

export function registerWith(controller: EditorController): void {
  controller.registerTab(tab)
}

export default tab
