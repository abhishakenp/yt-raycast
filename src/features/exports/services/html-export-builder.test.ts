import { parseHTML } from 'linkedom'
import { describe, expect, it } from 'vitest'
import { buildHtmlExport, injectShipFastBadge } from './html-export-builder'

const parseBadge = (html: string) => {
  const { document } = parseHTML(html)
  return document.querySelector('[data-ship-fast-export-badge]')
}

describe('html-export-builder', () => {
  describe('injectShipFastBadge', () => {
    it('should inject badge before closing body tag', () => {
      const html = '<html><body><h1>Test</h1></body></html>'
      const result = injectShipFastBadge(html)
      const { document } = parseHTML(result)
      const body = document.querySelector('body')
      const badge = document.querySelector('[data-ship-fast-export-badge]')

      expect(body).not.toBeNull()
      expect(badge).not.toBeNull()
      expect(badge?.getAttribute('data-ship-fast-export-badge')).toBe('1')
      expect(badge?.textContent).toContain('Built with Ship Fast')
      // Badge is the last child of body (injected before </body>)
      expect(body?.lastElementChild).toBe(badge)
    })

    it('should append badge if no body tag exists', () => {
      const html = '<div><h1>Test</h1></div>'
      const result = injectShipFastBadge(html)
      const badge = parseBadge(result)

      expect(badge).not.toBeNull()
      expect(badge?.getAttribute('data-ship-fast-export-badge')).toBe('1')
      expect(badge?.textContent).toContain('Built with Ship Fast')
      expect(result.endsWith('</a>')).toBe(true)
    })

    it('should remove existing badge before injecting new one', () => {
      const html =
        '<html><body><h1>Test</h1><a data-ship-fast-export-badge="1">Old Badge</a></body></html>'
      const result = injectShipFastBadge(html)
      const { document } = parseHTML(result)
      const badges = document.querySelectorAll('[data-ship-fast-export-badge]')

      expect(badges).toHaveLength(1)
      expect(badges[0]?.textContent).not.toContain('Old Badge')
      expect(badges[0]?.getAttribute('data-ship-fast-export-badge')).toBe('1')
    })

    it('should handle empty string', () => {
      const result = injectShipFastBadge('')
      const badge = parseBadge(result)

      expect(badge).not.toBeNull()
      expect(badge?.getAttribute('data-ship-fast-export-badge')).toBe('1')
      expect(badge?.textContent).toContain('Built with Ship Fast')
    })

    it('should handle null/undefined', () => {
      const result1 = injectShipFastBadge(null as unknown as string)
      const result2 = injectShipFastBadge(undefined as unknown as string)
      const badge1 = parseBadge(result1)
      const badge2 = parseBadge(result2)

      expect(badge1?.getAttribute('data-ship-fast-export-badge')).toBe('1')
      expect(badge2?.getAttribute('data-ship-fast-export-badge')).toBe('1')
    })
  })

  describe('buildHtmlExport', () => {
    it('should include badge by default', () => {
      const html = '<html><body><h1>Test</h1></body></html>'
      const result = buildHtmlExport(html)
      const badge = parseBadge(result)

      expect(badge).not.toBeNull()
      expect(badge?.getAttribute('data-ship-fast-export-badge')).toBe('1')
    })

    it('should skip badge when includeBadge is false', () => {
      const html = '<html><body><h1>Test</h1></body></html>'
      const result = buildHtmlExport(html, { includeBadge: false })
      const badge = parseBadge(result)

      expect(badge).toBeNull()
      expect(result).toBe(html)
    })

    it('should pass through options to injectShipFastBadge', () => {
      const html = '<html><body><h1>Test</h1></body></html>'
      const result = buildHtmlExport(html, { includeBadge: true })
      const badge = parseBadge(result)

      expect(badge?.textContent).toContain('Built with Ship Fast')
    })
  })
})
