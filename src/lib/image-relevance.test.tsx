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
      'query=medical%20clinic%20healthcare%20dental%20waiting%20room%20patients',
    )
    expect(html).toContain(
      'seed=Elegant%20dental%20clinic%20waiting%20room%20with%20patients',
    )
  })
})
