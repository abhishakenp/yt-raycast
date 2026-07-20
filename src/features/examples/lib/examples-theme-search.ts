import { z } from 'zod'

import { isKnownTheme, THEME_CATALOG } from '@/genui/theme-apply'

export const DEFAULT_EXAMPLES_THEME = THEME_CATALOG[0]?.name ?? 'modern-minimal'

export const examplesThemeSearchSchema = z.object({
  theme: z.preprocess(
    (value) =>
      typeof value === 'string' && isKnownTheme(value)
        ? value
        : DEFAULT_EXAMPLES_THEME,
    z.string(),
  ),
  mode: z.preprocess(
    (value) => (value === 'dark' ? 'dark' : 'light'),
    z.enum(['light', 'dark']),
  ),
})

export type ExamplesThemeSearch = z.infer<typeof examplesThemeSearchSchema>

export const parseExamplesThemeSearch = (
  search: Record<string, unknown>,
): ExamplesThemeSearch => examplesThemeSearchSchema.parse(search)
