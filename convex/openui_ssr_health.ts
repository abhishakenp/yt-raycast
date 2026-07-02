'use node'

import { internalAction } from './_generated/server'

export const renderSmoke = internalAction({
  args: {},
  handler: async () => {
    const { renderOpenUIToHTMLWithTheme } =
      await import('@ship-fast/engine/openui-ssr.js')
    const result = (await renderOpenUIToHTMLWithTheme(
      'root = Text("Convex OpenUI SSR smoke")',
      undefined,
      'en',
      undefined,
    )) as { html: string }

    if (
      result.html.includes('openui-error') ||
      !result.html.includes('Convex OpenUI SSR smoke')
    ) {
      throw new Error('Convex OpenUI SSR smoke did not render real HTML')
    }

    return {
      ok: true,
      htmlLength: result.html.length,
    }
  },
})
