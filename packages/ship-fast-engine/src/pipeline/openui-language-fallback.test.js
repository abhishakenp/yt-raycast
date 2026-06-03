import { describe, expect, it } from 'vitest'
import { buildLocalizedPrimitiveOpenUISource } from './openui-language-fallback.js'

describe('buildLocalizedPrimitiveOpenUISource', () => {
  it('builds a primitive localized OpenUI page without KimiPage block defaults', () => {
    const source = buildLocalizedPrimitiveOpenUISource({
      brand: 'शांत योग',
      prompt: 'हिंदी में योग स्टूडियो की वेबसाइट बनाओ',
      labels: {
        eyebrow: 'स्थानीय भाषा',
        heading: 'शांत योग',
        intro: 'योग कक्षाएँ, सदस्यता और संपर्क',
        primaryCta: 'कक्षाएँ देखें',
        secondaryCta: 'संपर्क करें',
        sections: ['कक्षाएँ', 'सदस्यता', 'प्रशिक्षक', 'संपर्क'],
      },
    })

    expect(source).toContain('root = Stack')
    expect(source).toContain('Heading("शांत योग"')
    expect(source).toContain('Text("योग कक्षाएँ, सदस्यता और संपर्क"')
    expect(source).not.toContain('KimiPage')
    expect(source).not.toContain('The Guild')
    expect(source).not.toContain('Base Fitness')
  })
})
