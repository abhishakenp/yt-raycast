import { describe, expect, it } from 'vitest'

import {
  buildSectionSeedPatch,
  mergeSectionProps,
} from './section-realtime.tsx'

describe('buildSectionSeedPatch', () => {
  it('seeds every generated prop when live data is empty', () => {
    expect(
      buildSectionSeedPatch(
        { headingTop: 'Launch', primaryCta: 'Start', stats: [{ value: '1' }] },
        {},
      ),
    ).toEqual({
      headingTop: 'Launch',
      primaryCta: 'Start',
      stats: [{ value: '1' }],
    })
  })

  it('never overwrites keys already present in live data (admin edits win)', () => {
    expect(
      buildSectionSeedPatch(
        { headingTop: 'Launch', primaryCta: 'Start' },
        { headingTop: 'Edited' },
      ),
    ).toEqual({ primaryCta: 'Start' })
  })

  it('drops reserved bookkeeping keys and undefined values', () => {
    expect(
      buildSectionSeedPatch(
        { id: 'x', createdAt: 1, headingTop: 'Launch', missing: undefined },
        {},
      ),
    ).toEqual({ headingTop: 'Launch' })
  })

  it('returns an empty patch when everything is already seeded', () => {
    expect(
      buildSectionSeedPatch({ a: 1, b: 2 }, { a: 1, b: 2 }),
    ).toEqual({})
  })
})

describe('mergeSectionProps', () => {
  it('returns generated props unchanged when there is no live data', () => {
    const generated = { headingTop: 'Launch' }
    expect(mergeSectionProps(generated, null)).toBe(generated)
  })

  it('overrides generated props with admin-edited live values', () => {
    expect(
      mergeSectionProps(
        { headingTop: 'Launch', primaryCta: 'Start' },
        { headingTop: 'Edited' },
      ),
    ).toEqual({ headingTop: 'Edited', primaryCta: 'Start' })
  })

  it('passes through live keys not present in generated props', () => {
    expect(
      mergeSectionProps({ headingTop: 'Launch' }, { badge: 'New' }),
    ).toEqual({ headingTop: 'Launch', badge: 'New' })
  })

  it('ignores reserved bookkeeping keys from live data', () => {
    expect(
      mergeSectionProps(
        { headingTop: 'Launch' },
        { _id: 'doc', updatedAt: 123, headingTop: 'Edited' },
      ),
    ).toEqual({ headingTop: 'Edited' })
  })
})
