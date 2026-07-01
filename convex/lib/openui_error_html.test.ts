import { describe, expect, it } from 'vitest'

import { isOpenUiErrorHtml } from './openui_error_html'

describe('isOpenUiErrorHtml', () => {
  it('flags full OpenUI renderer-error documents', () => {
    expect(
      isOpenUiErrorHtml(
        '<!doctype html><html><body><div class="openui-error">Failed to render: te is not a function</div></body></html>',
      ),
    ).toBe(true)
    expect(
      isOpenUiErrorHtml(
        '<html><body><main>Failed to render: missing component</main></body></html>',
      ),
    ).toBe(true)
  })

  it('does not flag fallback fragments or normal generated documents', () => {
    expect(
      isOpenUiErrorHtml(
        '<div class="openui-error">Failed to render: temporary fallback</div>',
      ),
    ).toBe(false)
    expect(
      isOpenUiErrorHtml(
        '<!doctype html><html><body><main><h1>Ready preview</h1></main></body></html>',
      ),
    ).toBe(false)
    expect(isOpenUiErrorHtml(null)).toBe(false)
  })
})
