import { describe, expect, it } from 'vitest'
import { buildHtmlExport, injectShipFastBadge } from './html-export-builder'

describe('html-export-builder', () => {
  describe('injectShipFastBadge', () => {
    it('should inject badge before closing body tag', () => {
      const html = '<html><body><h1>Test</h1></body></html>'
      const result = injectShipFastBadge(html)
      expect(result).toContain('data-ship-fast-export-badge="1"')
      expect(result).toContain('Built with Ship Fast')
      expect(result).toContain('</body>')
      expect(result.indexOf('data-ship-fast-export-badge')).toBeLessThan(
        result.indexOf('</body>'),
      )
    })

    it('should append badge if no body tag exists', () => {
      const html = '<div><h1>Test</h1></div>'
      const result = injectShipFastBadge(html)
      expect(result).toContain('data-ship-fast-export-badge="1"')
      expect(result).toContain('Built with Ship Fast')
      expect(result.endsWith('</a>')).toBe(true)
    })

    it('should remove existing badge before injecting new one', () => {
      const html =
        '<html><body><h1>Test</h1><a data-ship-fast-export-badge="1">Old Badge</a></body></html>'
      const result = injectShipFastBadge(html)
      expect(result).not.toContain('Old Badge')
      expect(result).toContain('data-ship-fast-export-badge="1"')
    })

    it('should handle empty string', () => {
      const result = injectShipFastBadge('')
      expect(result).toContain('data-ship-fast-export-badge="1"')
      expect(result).toContain('Built with Ship Fast')
    })

    it('should handle null/undefined', () => {
      const result1 = injectShipFastBadge(null as unknown as string)
      const result2 = injectShipFastBadge(undefined as unknown as string)
      expect(result1).toContain('data-ship-fast-export-badge="1"')
      expect(result2).toContain('data-ship-fast-export-badge="1"')
    })
  })

  describe('buildHtmlExport', () => {
    it('should include badge by default', () => {
      const html = '<html><body><h1>Test</h1></body></html>'
      const result = buildHtmlExport(html)
      expect(result).toContain('data-ship-fast-export-badge="1"')
    })

    it('should skip badge when includeBadge is false', () => {
      const html = '<html><body><h1>Test</h1></body></html>'
      const result = buildHtmlExport(html, { includeBadge: false })
      expect(result).not.toContain('data-ship-fast-export-badge="1"')
      expect(result).toBe(html)
    })

    it('should pass through options to injectShipFastBadge', () => {
      const html = '<html><body><h1>Test</h1></body></html>'
      const result = buildHtmlExport(html, { includeBadge: true })
      expect(result).toContain('Built with Ship Fast')
    })
  })
})
