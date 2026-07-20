import { describe, expect, it } from 'vitest'

import {
  DEFAULT_EXAMPLES_THEME,
  parseExamplesThemeSearch,
} from './examples-theme-search'

describe('parseExamplesThemeSearch', () => {
  it('keeps known themes and defaults unknown search params', () => {
    expect(parseExamplesThemeSearch({ theme: 'vercel', mode: 'dark' })).toEqual(
      {
        theme: 'vercel',
        mode: 'dark',
      },
    )

    expect(
      parseExamplesThemeSearch({ theme: 'not-a-theme', mode: 'invalid' }),
    ).toEqual({
      theme: DEFAULT_EXAMPLES_THEME,
      mode: 'light',
    })
  })
})
