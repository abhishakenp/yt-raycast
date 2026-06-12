import { act } from 'react'
import { createRoot } from 'react-dom/client'
// @ts-expect-error jsdom is already used by repo tests without installed types.
import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'

import DirectPreview from './DirectPreview'

type ReactActGlobal = typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean
}

describe('DirectPreview tools', () => {
  it('marks clicked generated elements when select mode is active', async () => {
    const dom = new JSDOM(
      '<!doctype html><html><body><div id="root"></div></body></html>',
      { pretendToBeVisual: true },
    )
    const previousWindow = globalThis.window
    const previousDocument = globalThis.document
    const previousHTMLElement = globalThis.HTMLElement
    const previousMutationObserver = globalThis.MutationObserver
    const previousGetComputedStyle = globalThis.getComputedStyle
    const previousEvent = globalThis.Event
    const previousMouseEvent = globalThis.MouseEvent
    const previousCustomEvent = globalThis.CustomEvent
    const reactActGlobal = globalThis as ReactActGlobal
    const previousActEnvironment = reactActGlobal.IS_REACT_ACT_ENVIRONMENT

    reactActGlobal.IS_REACT_ACT_ENVIRONMENT = true
    globalThis.window = dom.window
    globalThis.document = dom.window.document
    globalThis.HTMLElement = dom.window.HTMLElement
    globalThis.MutationObserver = dom.window.MutationObserver
    globalThis.getComputedStyle = dom.window.getComputedStyle
    globalThis.Event = dom.window.Event
    globalThis.MouseEvent = dom.window.MouseEvent
    globalThis.CustomEvent = dom.window.CustomEvent

    const rootElement = dom.window.document.querySelector('#root')
    if (!rootElement) throw new Error('Missing test root')

    const root = createRoot(rootElement)

    try {
      await act(async () => {
        root.render(
          <DirectPreview
            isDark={false}
            previewToolMode="select"
            themeStyles={null}
          >
            <main>
              <h1>Generated headline</h1>
            </main>
          </DirectPreview>,
        )
      })

      const headline = dom.window.document.querySelector('h1') as HTMLElement
      let selectionDetail: Record<string, unknown> | undefined
      const previewRoot = dom.window.document.querySelector('.genui-preview')
      previewRoot?.addEventListener('ship-fast-preview-select', (event) => {
        selectionDetail = (event as CustomEvent<Record<string, unknown>>).detail
      })

      headline.dispatchEvent(
        new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }),
      )

      expect(headline.getAttribute('data-ship-fast-selected')).toBe('true')
      expect(headline.style.outline).toContain('2px')
      expect(selectionDetail).toMatchObject({
        label: 'Generated headline',
        tagName: 'h1',
        selectedText: 'Generated headline',
        elementPath: expect.stringContaining('h1'),
        html: '<h1>Generated headline</h1>',
      })
    } finally {
      await act(async () => {
        root.unmount()
      })
      reactActGlobal.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment
      globalThis.window = previousWindow
      globalThis.document = previousDocument
      globalThis.HTMLElement = previousHTMLElement
      globalThis.MutationObserver = previousMutationObserver
      globalThis.getComputedStyle = previousGetComputedStyle
      globalThis.Event = previousEvent
      globalThis.MouseEvent = previousMouseEvent
      globalThis.CustomEvent = previousCustomEvent
    }
  })
})
