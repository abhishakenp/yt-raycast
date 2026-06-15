import { describe, expect, it } from 'vitest'

import { preprocessOpenUIResponse } from '../lib/openui-preprocess.ts'

describe('preprocessOpenUIResponse', () => {
  it('strips invalid top-level section labels from saved page block calls', () => {
    const source =
      'home = TourExperiencesKimiPage("Kerala Tourism", ["Home"], {heading: "Kerala"},press: {label: "Featured In"},features: {heading: "Why Kerala", items: [{title: "Backwaters", description: "Houseboats"}]})'

    const result = preprocessOpenUIResponse(source, { resolveRefs: false })

    expect(result).toContain('TourExperiencesKimiPage("Kerala Tourism"')
    expect(result).not.toContain(',press:')
    expect(result).not.toContain(',features:')
    expect(result).toContain('{label: "Featured In"}')
    expect(result).toContain('{heading: "Why Kerala"')
  })
})
