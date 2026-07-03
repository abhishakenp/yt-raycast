import { describe, expect, it } from 'vitest'

import { shouldPreserveNativeLocaleText } from './native-script'

describe('shouldPreserveNativeLocaleText', () => {
  it('preserves Hindi text in native Hindi previews', () => {
    expect(shouldPreserveNativeLocaleText('पॉलिश किया हुआ', 'hi')).toBe(true)
    expect(shouldPreserveNativeLocaleText('मानक कांचमानक शीशा', 'hi')).toBe(
      true,
    )
  })

  it('does not skip English source copy for native-script locales', () => {
    expect(shouldPreserveNativeLocaleText('Standard Glass', 'hi')).toBe(false)
  })

  it('keeps romanized and code-mixed locale modes translatable', () => {
    expect(shouldPreserveNativeLocaleText('पॉलिश किया हुआ', 'hi-Latn')).toBe(
      false,
    )
    expect(shouldPreserveNativeLocaleText('पॉलिश किया हुआ', 'hinglish')).toBe(
      false,
    )
  })

  it('preserves native-script text for other browser translation locales', () => {
    expect(shouldPreserveNativeLocaleText('ガラス施工', 'ja')).toBe(true)
    expect(shouldPreserveNativeLocaleText('玻璃施工', 'zh-CN')).toBe(true)
    expect(shouldPreserveNativeLocaleText('유리 시공', 'ko')).toBe(true)
    expect(shouldPreserveNativeLocaleText('زجاج مصقول', 'ar')).toBe(true)
  })
})
