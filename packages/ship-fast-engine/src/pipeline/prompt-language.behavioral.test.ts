import { describe, expect, it } from 'vitest'

import { resolvePipelineLanguage } from './prompt-language'

describe('pipeline language behavior from live session preferences', () => {
  it('treats a live DB "english" preference as English and skips translation', async () => {
    const mode = await resolvePipelineLanguage({
      prompt:
        'a boutique coffee roastery with subscription delivery and tasting events',
      preferredLanguage: 'english',
    })

    expect(mode.code).toBe('en')
    expect(mode.needsTranslation).toBe(false)
    expect(mode.prompt).toContain('English only')
    expect(mode.prompt).not.toContain('server language code')
    expect(mode.prompt).not.toContain('english')
  })
})
