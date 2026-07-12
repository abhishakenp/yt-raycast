import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ActionCtx } from './_generated/server'
import { renderSmoke } from './openui_ssr_health'

// Mock the dynamically-imported SSR engine module.
vi.mock('@ship-fast/engine/openui-ssr.js', () => ({
  renderOpenUIToHTMLWithTheme: vi.fn(),
}))

import { renderOpenUIToHTMLWithTheme } from '@ship-fast/engine/openui-ssr.js'

/** Convex action objects store the raw handler on `_handler` at runtime. */
type ActionWithHandler<Args, Ret> = {
  _handler: (ctx: ActionCtx, args: Args) => Promise<Ret>
}

type RenderSmokeResult = { ok: true; htmlLength: number }

const handler = (
  renderSmoke as unknown as ActionWithHandler<
    Record<string, never>,
    RenderSmokeResult
  >
)._handler

// The handler does not use ctx, so a minimal stub suffices.
const mockCtx = {} as unknown as ActionCtx

describe('openui_ssr_health.renderSmoke', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns {ok: true, htmlLength} on a successful render', async () => {
    const html = '<html><body><div>Convex OpenUI SSR smoke</div></body></html>'
    ;(
      renderOpenUIToHTMLWithTheme as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ html })

    const result = await handler(mockCtx, {})

    expect(result).toEqual({ ok: true, htmlLength: html.length })
    // Verify the SSR function was called with the expected smoke source.
    expect(renderOpenUIToHTMLWithTheme).toHaveBeenCalledTimes(1)
    const callArgs = (renderOpenUIToHTMLWithTheme as ReturnType<typeof vi.fn>)
      .mock.calls[0]
    expect(callArgs[0]).toBe('root = Text("Convex OpenUI SSR smoke")')
    expect(callArgs[2]).toBe('en')
  })

  it('throws when the rendered HTML contains an openui-error class', async () => {
    ;(
      renderOpenUIToHTMLWithTheme as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      html: '<div class="openui-error">Render failed</div>',
    })

    await expect(handler(mockCtx, {})).rejects.toThrow(
      'Convex OpenUI SSR smoke did not render real HTML',
    )
  })

  it('throws when the rendered HTML is missing the expected smoke text', async () => {
    ;(
      renderOpenUIToHTMLWithTheme as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      html: '<html><body><div>Some other content</div></body></html>',
    })

    await expect(handler(mockCtx, {})).rejects.toThrow(
      'Convex OpenUI SSR smoke did not render real HTML',
    )
  })

  it('throws when the rendered HTML is empty', async () => {
    ;(
      renderOpenUIToHTMLWithTheme as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ html: '' })

    await expect(handler(mockCtx, {})).rejects.toThrow(
      'Convex OpenUI SSR smoke did not render real HTML',
    )
  })
})
