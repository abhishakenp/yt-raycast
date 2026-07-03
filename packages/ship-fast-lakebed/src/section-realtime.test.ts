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
      shipFastGeneratedProps: {
        headingTop: 'Launch',
        primaryCta: 'Start',
        stats: [{ value: '1' }],
      },
      stats: [{ value: '1' }],
    })
  })

  it('never overwrites keys already present in live data (admin edits win)', () => {
    expect(
      buildSectionSeedPatch(
        { headingTop: 'Launch', primaryCta: 'Start' },
        { headingTop: 'Edited', shipFastGeneratedProps: { headingTop: 'Old' } },
      ),
    ).toEqual({
      primaryCta: 'Start',
      shipFastGeneratedProps: { headingTop: 'Launch', primaryCta: 'Start' },
    })
  })

  it('drops reserved bookkeeping keys and undefined values', () => {
    expect(
      buildSectionSeedPatch(
        { id: 'x', createdAt: 1, headingTop: 'Launch', missing: undefined },
        {},
      ),
    ).toEqual({
      headingTop: 'Launch',
      shipFastGeneratedProps: { headingTop: 'Launch' },
    })
  })

  it('returns an empty patch when everything is already seeded', () => {
    expect(buildSectionSeedPatch({ a: 1, b: 2 }, { a: 1, b: 2 })).toEqual({
      shipFastGeneratedProps: { a: 1, b: 2 },
    })
  })

  it('updates stale auto-seeded values when generated props change', () => {
    expect(
      buildSectionSeedPatch(
        { heading: 'Fresh source heading', cta: 'Start' },
        {
          heading: 'Old seeded heading',
          cta: 'Start',
          shipFastGeneratedProps: {
            heading: 'Old seeded heading',
            cta: 'Start',
          },
        },
      ),
    ).toEqual({
      heading: 'Fresh source heading',
      shipFastGeneratedProps: {
        heading: 'Fresh source heading',
        cta: 'Start',
      },
    })
  })

  it('does not overwrite live admin edits that differ from the previous generated seed', () => {
    expect(
      buildSectionSeedPatch(
        { heading: 'Fresh source heading', cta: 'Start' },
        {
          heading: 'Admin heading',
          cta: 'Start',
          shipFastGeneratedProps: {
            heading: 'Old seeded heading',
            cta: 'Start',
          },
        },
      ),
    ).toEqual({
      shipFastGeneratedProps: {
        heading: 'Fresh source heading',
        cta: 'Start',
      },
    })
  })

  it('repairs legacy unmarked seeded values to the latest generated props', () => {
    expect(
      buildSectionSeedPatch(
        { heading: 'Fresh source heading' },
        { heading: 'Legacy stale heading' },
      ),
    ).toEqual({
      heading: 'Fresh source heading',
      shipFastGeneratedProps: { heading: 'Fresh source heading' },
    })
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
        {
          headingTop: 'Edited',
          shipFastGeneratedProps: { headingTop: 'Launch' },
        },
      ),
    ).toEqual({ headingTop: 'Edited', primaryCta: 'Start' })
  })

  it('does not let stale auto-seeded values override fresher generated props', () => {
    expect(
      mergeSectionProps(
        { headingTop: 'Fresh source heading', primaryCta: 'Start' },
        {
          headingTop: 'Old seeded heading',
          primaryCta: 'Start',
          shipFastGeneratedProps: {
            headingTop: 'Old seeded heading',
            primaryCta: 'Start',
          },
        },
      ),
    ).toEqual({ headingTop: 'Fresh source heading', primaryCta: 'Start' })
  })

  it('treats legacy unmarked section data as seed data for generated prop keys', () => {
    expect(
      mergeSectionProps(
        { headingTop: 'Fresh source heading', primaryCta: 'Start' },
        { headingTop: 'Legacy stale heading', customAdminField: 'keep me' },
      ),
    ).toEqual({
      headingTop: 'Fresh source heading',
      primaryCta: 'Start',
      customAdminField: 'keep me',
    })
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
        {
          _id: 'doc',
          updatedAt: 123,
          headingTop: 'Edited',
          shipFastGeneratedProps: { headingTop: 'Launch' },
        },
      ),
    ).toEqual({ headingTop: 'Edited' })
  })
})
