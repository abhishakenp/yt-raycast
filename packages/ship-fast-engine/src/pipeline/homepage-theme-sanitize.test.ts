import { describe, expect, it } from 'vitest'
import { stripDestructiveEmptyDesignTheme } from './homepage-theme-sanitize'

const EMPTY_THEME_BLOCK = `<!-- sf-design-theme -->
<script>tailwind.config = { theme: { extend: { colors: {}, fontFamily: {} } } }</script>
<!-- /sf-design-theme -->`

describe('stripDestructiveEmptyDesignTheme', () => {
  describe('empty / null html', () => {
    it('returns empty string for empty input', () => {
      expect(stripDestructiveEmptyDesignTheme('')).toBe('')
    })

    it('returns empty string for null', () => {
      expect(stripDestructiveEmptyDesignTheme(null as unknown as string)).toBe(
        '',
      )
    })

    it('returns empty string for undefined', () => {
      expect(
        stripDestructiveEmptyDesignTheme(undefined as unknown as string),
      ).toBe('')
    })
  })

  describe('no theme block', () => {
    it('returns html unchanged when no theme block present', () => {
      const html = '<!DOCTYPE html><html><body><p>Hello</p></body></html>'
      expect(stripDestructiveEmptyDesignTheme(html)).toBe(html)
    })

    it('returns html unchanged with other comments', () => {
      const html = '<!-- some other comment --><html><body>Hi</body></html>'
      expect(stripDestructiveEmptyDesignTheme(html)).toBe(html)
    })
  })

  describe('empty colors + fontFamily theme block', () => {
    it('strips empty colors and fontFamily theme block', () => {
      const html = `<html><head>${EMPTY_THEME_BLOCK}</head><body>Hi</body></html>`
      const result = stripDestructiveEmptyDesignTheme(html)
      expect(result).not.toContain('sf-design-theme')
      expect(result).not.toContain('colors: {}')
      expect(result).toContain('<html>')
      expect(result).toContain('Hi')
    })

    it('strips theme block with whitespace variations in markers', () => {
      const html = `<html><!-- sf-design-theme --><script>tailwind.config={theme:{extend:{colors:   {},   fontFamily:   {}}}}</script><!-- /sf-design-theme --></html>`
      const result = stripDestructiveEmptyDesignTheme(html)
      expect(result).not.toContain('sf-design-theme')
    })
  })

  describe('theme block with patchColors / Object.assign', () => {
    it('preserves theme block with patchColors', () => {
      const block = `<!-- sf-design-theme -->
<script>tailwind.config = { theme: { extend: { colors: {}, fontFamily: {} } } }; patchColors(tailwind.config);</script>
<!-- /sf-design-theme -->`
      const html = `<html><head>${block}</head><body>Hi</body></html>`
      const result = stripDestructiveEmptyDesignTheme(html)
      expect(result).toContain('sf-design-theme')
      expect(result).toContain('patchColors')
    })

    it('preserves theme block with Object.assign', () => {
      const block = `<!-- sf-design-theme -->
<script>Object.assign(tailwind.config, { theme: { extend: { colors: {}, fontFamily: {} } } });</script>
<!-- /sf-design-theme -->`
      const html = `<html><head>${block}</head><body>Hi</body></html>`
      const result = stripDestructiveEmptyDesignTheme(html)
      expect(result).toContain('sf-design-theme')
      expect(result).toContain('Object.assign')
    })

    it('preserves theme block with patchFonts', () => {
      const block = `<!-- sf-design-theme -->
<script>tailwind.config = { theme: { extend: { colors: {}, fontFamily: {} } } }; patchFonts(tailwind.config);</script>
<!-- /sf-design-theme -->`
      const html = `<html><head>${block}</head><body>Hi</body></html>`
      const result = stripDestructiveEmptyDesignTheme(html)
      expect(result).toContain('sf-design-theme')
      expect(result).toContain('patchFonts')
    })
  })

  describe('theme block with non-empty colors', () => {
    it('preserves theme block with non-empty colors', () => {
      const block = `<!-- sf-design-theme -->
<script>tailwind.config = { theme: { extend: { colors: { brand: '#ff0000' }, fontFamily: {} } } }</script>
<!-- /sf-design-theme -->`
      const html = `<html><head>${block}</head><body>Hi</body></html>`
      const result = stripDestructiveEmptyDesignTheme(html)
      expect(result).toContain('sf-design-theme')
      expect(result).toContain('brand')
    })

    it('preserves theme block with non-empty fontFamily', () => {
      const block = `<!-- sf-design-theme -->
<script>tailwind.config = { theme: { extend: { colors: {}, fontFamily: { sans: ['Inter'] } } } }</script>
<!-- /sf-design-theme -->`
      const html = `<html><head>${block}</head><body>Hi</body></html>`
      const result = stripDestructiveEmptyDesignTheme(html)
      expect(result).toContain('sf-design-theme')
      expect(result).toContain('Inter')
    })
  })

  describe('multiple theme blocks', () => {
    it('strips empty block but preserves non-empty block', () => {
      const emptyBlock = EMPTY_THEME_BLOCK
      const nonEmptyBlock = `<!-- sf-design-theme -->
<script>tailwind.config = { theme: { extend: { colors: { brand: '#000' }, fontFamily: {} } } }</script>
<!-- /sf-design-theme -->`
      const html = `<html><head>${emptyBlock}${nonEmptyBlock}</head><body>Hi</body></html>`
      const result = stripDestructiveEmptyDesignTheme(html)
      // The empty block should be stripped, the non-empty preserved
      const themeCount = (result.match(/sf-design-theme/g) || []).length
      expect(themeCount).toBe(2) // opening + closing markers of the preserved block
      expect(result).toContain('brand')
    })

    it('strips both empty blocks', () => {
      const html = `<html><head>${EMPTY_THEME_BLOCK}${EMPTY_THEME_BLOCK}</head><body>Hi</body></html>`
      const result = stripDestructiveEmptyDesignTheme(html)
      expect(result).not.toContain('sf-design-theme')
    })
  })
})
