import { describe, expect, it } from 'vitest'
import { formatRunAllReport, formatEditReport } from './report'

import type { RunAllStats } from './report'

const FULL_TIMINGS: Record<string, number> = {
  t0: 0,
  design_end: 10_000,
  ctx_end: 20_000,
  site_spec_end: 30_000,
  homepage_end: 40_000,
  derive_start: 40_000,
  derive_end: 42_000,
  gen_start: 42_000,
  gen_end: 60_000,
  navfix_start: 60_000,
  navfix_end: 62_000,
}

const FULL_STATS: RunAllStats = {
  elapsed: 62,
  done: 10,
  total: 10,
  ctxPages: 5,
  homepageChars: 12000,
  tasks: [{ id: 1 }, { id: 2 }, { id: 3 }],
  designStats: { inputTokens: 1000, outputTokens: 500, cost: 0.01 },
  detectStats: { inputTokens: 2000, outputTokens: 800, cost: 0.02 },
  ctxStats: { inputTokens: 3000, outputTokens: 1200, cost: 0.03 },
  siteSpecStats: { inputTokens: 1500, outputTokens: 600, cost: 0.015 },
  homepageStats: { inputTokens: 5000, outputTokens: 3000, cost: 0.05 },
  genStats: {
    pages: { inputTokens: 8000, outputTokens: 6000, cost: 0.08, count: 5 },
    backend: { inputTokens: 4000, outputTokens: 2000, cost: 0.04, count: 3 },
  },
  navFixStats: { inputTokens: 1000, outputTokens: 500, cost: 0.01 },
}

describe('formatRunAllReport', () => {
  describe('full stats', () => {
    const report = formatRunAllReport(FULL_TIMINGS, FULL_STATS)

    it('contains the SHIP-FAST REPORT header', () => {
      expect(report).toContain('SHIP-FAST REPORT')
    })

    it('contains correct task count', () => {
      expect(report).toContain('3 tasks')
    })

    it('contains correct done/total', () => {
      expect(report).toContain('10/10 tasks completed')
    })

    it('contains correct ctxPages', () => {
      expect(report).toContain('5 pages extracted')
    })

    it('contains correct homepageChars', () => {
      expect(report).toContain('12000 chars')
    })

    it('contains correct total input tokens', () => {
      // 1000 + 2000 + 3000 + 1500 + 5000 + 8000 + 4000 + 1000 = 25500
      expect(report).toContain('25,500')
    })

    it('contains correct total output tokens', () => {
      // 500 + 800 + 1200 + 600 + 3000 + 6000 + 2000 + 500 = 14600
      expect(report).toContain('14,600')
    })

    it('contains correct cost formatting', () => {
      // 0.01 + 0.02 + 0.03 + 0.015 + 0.05 + 0.08 + 0.04 + 0.01 = 0.255
      // toFixed(4) = "0.2550", padStart(8) = "   0.2550"
      expect(report).toContain('0.2550')
    })

    it('contains page generation counts', () => {
      expect(report).toContain('5 pages, 3 backend')
    })

    it('contains timing values', () => {
      expect(report).toContain('10.0s')
    })
  })

  describe('empty / minimal stats', () => {
    const minimalTimings: Record<string, number> = {}
    const minimalStats: RunAllStats = {
      elapsed: 0,
      done: 0,
      total: 0,
      ctxPages: 0,
      homepageChars: 0,
      tasks: [],
    }

    const report = formatRunAllReport(minimalTimings, minimalStats)

    it('contains em-dashes for missing timing values', () => {
      expect(report).toContain('\u2014')
    })

    it('contains 0 tasks', () => {
      expect(report).toContain('0 tasks')
    })

    it('contains 0/0 tasks completed', () => {
      expect(report).toContain('0/0 tasks completed')
    })

    it('contains em-dash for tokens when no stats provided', () => {
      // With no stats, totalInput = 0, tokFmt(0) returns em-dash
      expect(report).toContain('\u2014')
    })

    it('contains 0.0000 for cost when no stats provided', () => {
      // totalCost = 0, toFixed(4) = "0.0000", padStart(8) = "   0.0000"
      expect(report).toContain('0.0000')
    })
  })

  describe('indiaMode', () => {
    const indiaStats: RunAllStats = {
      ...FULL_STATS,
      indiaMode: { code: 'hi', name: 'Krutrim' },
    }

    const report = formatRunAllReport(FULL_TIMINGS, indiaStats)

    it('uses localized homepage label', () => {
      expect(report).toContain('Groq (Krutrim)')
    })

    it('does not use default gpt-oss-120b label for homepage', () => {
      // The homepage label should not be the default
      const homepageLine = report
        .split('\n')
        .find((l) => l.includes('Homepage'))
      expect(homepageLine).toBeDefined()
      expect(homepageLine).toContain('Krutrim')
    })
  })

  describe('non-india mode (default)', () => {
    const report = formatRunAllReport(FULL_TIMINGS, FULL_STATS)

    it('uses default gpt-oss-120b label', () => {
      expect(report).toContain('gpt-oss-120b')
    })
  })
})

describe('formatEditReport', () => {
  it('contains file counts', () => {
    const report = formatEditReport(3, 5, 12, 1000, 500, 0.02)
    expect(report).toContain('SHIP-FAST EDIT REPORT')
    expect(report).toContain('Files edited')
    expect(report).toContain('3')
    expect(report).toContain('5')
  })

  it('contains time', () => {
    const report = formatEditReport(3, 5, 12, 1000, 500, 0.02)
    expect(report).toContain('Total time')
    expect(report).toContain('12s')
  })

  it('contains token counts', () => {
    const report = formatEditReport(3, 5, 12, 1000, 500, 0.02)
    expect(report).toContain('1,000')
    expect(report).toContain('500')
  })

  it('contains cost', () => {
    const report = formatEditReport(3, 5, 12, 1000, 500, 0.02)
    expect(report).toContain('0.0200')
  })

  it('handles zero values', () => {
    const report = formatEditReport(0, 0, 0, 0, 0, 0)
    expect(report).toContain('Files edited')
    expect(report).toContain('0s')
    expect(report).toContain('0.0000')
  })
})
