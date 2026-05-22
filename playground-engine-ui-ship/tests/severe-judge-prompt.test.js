import { describe, expect, it } from 'vitest'
import {
  buildSevereJudgePrompt,
  truncateHtml,
  SEVERE_JUDGE_PASS_SCORE,
} from '../src/quality/severe-judge-prompt.js'

describe('severe-judge-prompt', () => {
  it('includes pass score threshold and brief', () => {
    const prompt = buildSevereJudgePrompt({
      brief: 'A blog about dogs',
      htmlExcerpt: '<html></html>',
    })
    expect(prompt).toContain(String(SEVERE_JUDGE_PASS_SCORE))
    expect(prompt).toContain('A blog about dogs')
    expect(prompt).toContain('"verdict": "pass" | "fail"')
  })

  it('truncates long html', () => {
    const html = '<div>' + 'x'.repeat(50000) + '</div>'
    const out = truncateHtml(html, 1000)
    expect(out.length).toBeLessThan(2000)
    expect(out).toContain('truncated')
  })
})
