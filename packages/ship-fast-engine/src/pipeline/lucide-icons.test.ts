import { describe, expect, it, vi } from 'vitest'
import { ensureLucideIconRuntime } from './lucide-icons'

const LUCIDE_CDN = 'https://unpkg.com/lucide@latest'
const BOOTSTRAP_ID = 'sf-lucide-bootstrap'

describe('ensureLucideIconRuntime', () => {
  describe('empty / null / non-string html', () => {
    it('returns empty string unchanged', () => {
      expect(ensureLucideIconRuntime('')).toBe('')
    })

    it('returns null unchanged', () => {
      expect(ensureLucideIconRuntime(null as unknown as string)).toBe(null)
    })

    it('returns undefined unchanged', () => {
      expect(ensureLucideIconRuntime(undefined as unknown as string)).toBe(
        undefined,
      )
    })

    it('returns non-string unchanged', () => {
      expect(ensureLucideIconRuntime(42 as unknown as string)).toBe(42)
    })
  })

  describe('no lucide usage', () => {
    it('returns html unchanged when no lucide usage', () => {
      const html = '<html><head></head><body><p>Hello</p></body></html>'
      expect(ensureLucideIconRuntime(html)).toBe(html)
    })

    it('returns html unchanged with regular scripts', () => {
      const html =
        '<html><head><script>console.log("hi")</script></head><body></body></html>'
      expect(ensureLucideIconRuntime(html)).toBe(html)
    })
  })

  describe('lucide CDN present but no bootstrap', () => {
    it('injects bootstrap when CDN present but no bootstrap', () => {
      const html = `<html><head><script src="${LUCIDE_CDN}"></script></head><body><i data-lucide="home"></i></body></html>`
      const result = ensureLucideIconRuntime(html)
      expect(result).toContain(`id="${BOOTSTRAP_ID}"`)
      expect(result).toContain(LUCIDE_CDN)
    })

    it('does not double-inject CDN when already present', () => {
      const html = `<html><head><script src="${LUCIDE_CDN}"></script></head><body><i data-lucide="home"></i></body></html>`
      const result = ensureLucideIconRuntime(html)
      const cdnCount = (result.match(/unpkg\.com\/lucide@latest/gi) || [])
        .length
      expect(cdnCount).toBe(1)
    })
  })

  describe('lucide placeholder triggers injection', () => {
    it('injects CDN + bootstrap for data-lucide attribute', () => {
      const html = `<html><head></head><body><i data-lucide="home"></i></body></html>`
      const result = ensureLucideIconRuntime(html)
      expect(result).toContain(LUCIDE_CDN)
      expect(result).toContain(`id="${BOOTSTRAP_ID}"`)
    })

    it('injects CDN + bootstrap for lucide-* class', () => {
      const html = `<html><head></head><body><span class="lucide-home"></span></body></html>`
      const result = ensureLucideIconRuntime(html)
      expect(result).toContain(LUCIDE_CDN)
      expect(result).toContain(`id="${BOOTSTRAP_ID}"`)
    })

    it('injects CDN + bootstrap for span with data-lucide', () => {
      const html = `<html><head></head><body><span data-lucide="user"></span></body></html>`
      const result = ensureLucideIconRuntime(html)
      expect(result).toContain(LUCIDE_CDN)
      expect(result).toContain(`id="${BOOTSTRAP_ID}"`)
    })
  })

  describe('existing bootstrap stripped before re-injection', () => {
    it('strips old bootstrap and injects fresh one', () => {
      const oldBootstrap = `<script id="${BOOTSTRAP_ID}">OLD CONTENT</script>`
      const html = `<html><head><script src="${LUCIDE_CDN}"></script></head><body><i data-lucide="home"></i>${oldBootstrap}</body></html>`
      const result = ensureLucideIconRuntime(html)
      expect(result).not.toContain('OLD CONTENT')
      // Should have exactly one bootstrap script
      const bootstrapCount = (
        result.match(new RegExp(`id="${BOOTSTRAP_ID}"`, 'g')) || []
      ).length
      expect(bootstrapCount).toBe(1)
    })
  })

  describe('log callback', () => {
    it('calls log callback when changes are made', () => {
      const log = vi.fn()
      const html = `<html><head></head><body><i data-lucide="home"></i></body></html>`
      ensureLucideIconRuntime(html, log)
      expect(log).toHaveBeenCalledTimes(1)
      expect(log).toHaveBeenCalledWith('  ✓ Lucide icon runtime injected')
    })

    it('does not call log when no changes needed', () => {
      const log = vi.fn()
      const html = '<html><body><p>No icons</p></body></html>'
      ensureLucideIconRuntime(html, log)
      expect(log).not.toHaveBeenCalled()
    })

    it('does not call log when null log provided', () => {
      const html = `<html><head></head><body><i data-lucide="home"></i></body></html>`
      // Should not throw
      const result = ensureLucideIconRuntime(html, null)
      expect(result).toContain(LUCIDE_CDN)
    })
  })

  describe('injection placement', () => {
    it('injects CDN before closing head tag', () => {
      const html = `<html><head><title>Test</title></head><body><i data-lucide="home"></i></body></html>`
      const result = ensureLucideIconRuntime(html)
      const cdnIdx = result.indexOf(LUCIDE_CDN)
      const headCloseIdx = result.indexOf('</head>')
      expect(cdnIdx).toBeGreaterThan(-1)
      expect(cdnIdx).toBeLessThan(headCloseIdx)
    })

    it('injects bootstrap before closing body tag', () => {
      const html = `<html><head></head><body><i data-lucide="home"></i></body></html>`
      const result = ensureLucideIconRuntime(html)
      const bootstrapIdx = result.indexOf(`id="${BOOTSTRAP_ID}"`)
      const bodyCloseIdx = result.indexOf('</body>')
      expect(bootstrapIdx).toBeGreaterThan(-1)
      expect(bootstrapIdx).toBeLessThan(bodyCloseIdx)
    })

    it('appends CDN at end when no head tag', () => {
      const html = `<i data-lucide="home"></i>`
      const result = ensureLucideIconRuntime(html)
      expect(result).toContain(LUCIDE_CDN)
      expect(result).toContain(`id="${BOOTSTRAP_ID}"`)
    })
  })
})
