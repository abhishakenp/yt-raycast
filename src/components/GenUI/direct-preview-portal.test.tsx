import { act } from 'react'
import { createRoot } from 'react-dom/client'
// @ts-expect-error jsdom is already used by repo tests without installed types.
import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'

import DirectPreview from './DirectPreview'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '../../../packages/ship-fast-blocks/src/components/ui/sheet'

type ReactActGlobal = typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean
}

describe('DirectPreview portal scope', () => {
  it('mounts shadcn sheet portals inside the preview container', async () => {
    const dom = new JSDOM(
      '<!doctype html><html><body><div id="root"></div></body></html>',
      {
        pretendToBeVisual: true,
      },
    )
    const previousWindow = globalThis.window
    const previousDocument = globalThis.document
    const previousHTMLElement = globalThis.HTMLElement
    const previousMutationObserver = globalThis.MutationObserver
    const previousGetComputedStyle = globalThis.getComputedStyle
    const reactActGlobal = globalThis as ReactActGlobal
    const previousActEnvironment = reactActGlobal.IS_REACT_ACT_ENVIRONMENT
    const previousEvent = globalThis.Event
    const previousCustomEvent = globalThis.CustomEvent
    const previousNodeFilter = globalThis.NodeFilter
    const previousElement = globalThis.Element
    const previousNode = globalThis.Node
    const previousHTMLInputElement = globalThis.HTMLInputElement
    const previousHTMLTextAreaElement = globalThis.HTMLTextAreaElement
    const previousSVGElement = globalThis.SVGElement

    reactActGlobal.IS_REACT_ACT_ENVIRONMENT = true
    globalThis.window = dom.window as unknown as Window & typeof globalThis
    globalThis.document = dom.window.document
    globalThis.HTMLElement = dom.window.HTMLElement
    globalThis.MutationObserver = dom.window.MutationObserver
    globalThis.getComputedStyle = dom.window.getComputedStyle
    globalThis.Event = dom.window.Event
    globalThis.CustomEvent = dom.window.CustomEvent
    globalThis.NodeFilter = dom.window.NodeFilter
    globalThis.Element = dom.window.Element
    globalThis.Node = dom.window.Node
    globalThis.HTMLInputElement = dom.window.HTMLInputElement
    globalThis.HTMLTextAreaElement = dom.window.HTMLTextAreaElement
    globalThis.SVGElement = dom.window.SVGElement

    const rootElement = dom.window.document.querySelector('#root')
    if (!rootElement) throw new Error('Missing test root')

    const root = createRoot(rootElement)

    try {
      await act(async () => {
        root.render(
          <DirectPreview themeStyles={null} isDark={false}>
            <Sheet open>
              <SheetContent side="right">
                <SheetTitle>Cart</SheetTitle>
                <SheetDescription>Scoped cart drawer.</SheetDescription>
              </SheetContent>
            </Sheet>
          </DirectPreview>,
        )
      })

      await act(async () => {
        await Promise.resolve()
      })

      const preview = dom.window.document.querySelector('.genui-preview')
      const sheetContent = dom.window.document.querySelector(
        '[data-slot="sheet-content"]',
      )

      expect(preview).toBeTruthy()
      expect(sheetContent).toBeTruthy()
      expect(preview?.contains(sheetContent)).toBe(true)
    } finally {
      await act(async () => {
        root.unmount()
      })
      await new Promise((resolve) => setTimeout(resolve, 0))
      globalThis.window = previousWindow
      globalThis.document = previousDocument
      globalThis.HTMLElement = previousHTMLElement
      globalThis.MutationObserver = previousMutationObserver
      globalThis.getComputedStyle = previousGetComputedStyle
      reactActGlobal.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment
      globalThis.Event = previousEvent
      globalThis.CustomEvent = previousCustomEvent
      globalThis.NodeFilter = previousNodeFilter
      globalThis.Element = previousElement
      globalThis.Node = previousNode
      globalThis.HTMLInputElement = previousHTMLInputElement
      globalThis.HTMLTextAreaElement = previousHTMLTextAreaElement
      globalThis.SVGElement = previousSVGElement
    }
  })
})
