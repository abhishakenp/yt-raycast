import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Image } from '../../packages/ship-fast-blocks/src/lib/img'

describe('generated image relevance', () => {
  it('uses semantic stock-photo queries instead of lossy slug-only alt text', () => {
    const html = renderToStaticMarkup(
      <Image
        alt="Elegant dental clinic waiting room with patients"
        h={540}
        w={960}
      />,
    )

    expect(html).toContain(
      'query=medical+clinic+healthcare+dental+waiting+room+patients',
    )
    expect(html).toContain(
      'seed=Elegant+dental+clinic+waiting+room+with+patients',
    )
  })
})
