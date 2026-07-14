import { describe, expect, it } from 'vitest'

import {
  applyCachedTranslationsToSource,
  extractOpenUISourceStrings,
} from './session_translation_cache_helpers'

const bakerySource = `
home_navbar = BakeryNavbar("Sweet Crumb Bakery", ["Home","Menu"], "Order Online", "#menu", "0")
home_hero = BakeryHero("Welcome", "Sweet Crumb Bakery", "Artisan breads made daily", "Order Online", "View Menu", "#menu", "#gallery", "Chocolate Chip Cookie", "$2.50")
home_hero_anchor = SectionAnchor("home_hero", home_hero, "scroll-mt-28")
menu = BakeryMenu("Our Daily Menu", [{"name":"Classic Sourdough","description":"Crisp crust","price":"$4.50"}], "Add to Cart")
root = PageSwitch(["Home","Menu"], [home_hero,menu], "", {"Home":"Home","Menu":"Menu#menu_menu","home_hero":"Home#home_hero"})
`

describe('OpenUI translation structure release gates', () => {
  it('extracts only translatable content, never schema keys, IDs, classes, prices, counts, or route targets', () => {
    const strings = extractOpenUISourceStrings(bakerySource)

    expect(strings).toEqual(
      expect.arrayContaining([
        'Sweet Crumb Bakery',
        'Welcome',
        'Artisan breads made daily',
        'Our Daily Menu',
        'Classic Sourdough',
        'Crisp crust',
        'Add to Cart',
      ]),
    )
    const forbidden = [
      'name',
      'description',
      'price',
      'home_hero',
      'scroll-mt-28',
      'Home#home_hero',
      'Menu#menu_menu',
      '0',
      '$2.50',
      '$4.50',
    ]
    for (const value of forbidden) expect.soft(strings).not.toContain(value)
  })

  it('preserves executable OpenUI structure even when the shared cache contains poisoned structural rows', () => {
    const translated = applyCachedTranslationsToSource(bakerySource, [
      { sourceText: 'Sweet Crumb Bakery', translation: 'स्वीट क्रम्ब बेकरी' },
      { sourceText: 'Home', translation: 'होम' },
      { sourceText: 'Menu', translation: 'मेनू' },
      { sourceText: 'Order Online', translation: 'ऑनलाइन ऑर्डर करें' },
      { sourceText: 'Our Daily Menu', translation: 'हमारा दैनिक मेनू' },
      { sourceText: 'Classic Sourdough', translation: 'क्लासिक सोरडो' },
      { sourceText: 'Crisp crust', translation: 'कुरकुरी परत' },
      { sourceText: 'Add to Cart', translation: 'कार्ट में जोड़ें' },
      { sourceText: 'name', translation: 'नाम' },
      { sourceText: 'description', translation: 'विवरण' },
      { sourceText: 'price', translation: 'मूल्य' },
      { sourceText: 'home_hero', translation: 'होम हीरो' },
      { sourceText: 'scroll-mt-28', translation: 'स्क्रोल-एमटी-28' },
      { sourceText: 'Home#home_hero', translation: 'होम#होम-हीरो' },
      { sourceText: 'Menu#menu_menu', translation: 'मेनू#मेनू' },
      { sourceText: '0', translation: 'कूट' },
      { sourceText: '$2.50', translation: '₹2.50' },
      { sourceText: '$4.50', translation: '₹4.50' },
    ])

    expect
      .soft(translated)
      .toContain(
        '{"name":"क्लासिक सोरडो","description":"कुरकुरी परत","price":"$4.50"}',
      )
    expect
      .soft(translated)
      .toContain('SectionAnchor("home_hero", home_hero, "scroll-mt-28")')
    expect.soft(translated).toContain('"Home#home_hero"')
    expect.soft(translated).toContain('"Menu#menu_menu"')
    expect.soft(translated).toContain('"0"')
    expect.soft(translated).toContain('"$2.50"')
    expect.soft(translated).not.toMatch(/"(?:नाम|विवरण|मूल्य)":/)
  })

  it('is idempotent when the cache also contains a translation of already-translated text', () => {
    const translations = [
      { sourceText: 'Sweet Crumb Bakery', translation: 'स्वीट क्रम्ब बेकरी' },
      {
        sourceText: 'स्वीट क्रम्ब बेकरी',
        translation: 'स्वीट क्रस्वीट क्रम्ब बेकरी रिलीज़म्ब बेकरी',
      },
    ]
    const source = 'hero = BakeryHero("Sweet Crumb Bakery")'
    const once = applyCachedTranslationsToSource(source, translations)
    const twice = applyCachedTranslationsToSource(once, translations)

    expect(once).toBe('hero = BakeryHero("स्वीट क्रम्ब बेकरी")')
    expect(twice).toBe(once)
  })
})
