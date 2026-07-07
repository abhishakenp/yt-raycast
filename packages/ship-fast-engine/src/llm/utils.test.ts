import { describe, it, expect } from 'vitest'
import {
  trimInlineAiText,
  trimInlineAiHtmlFragment,
  stripFences,
  stripGroqReasoningLeak,
  calculateCost,
  formatTps,
} from './utils.js'

describe('trimInlineAiText', () => {
  it('trims whitespace', () => {
    expect(trimInlineAiText('  hello  ')).toBe('hello')
  })
  it('strips surrounding double quotes', () => {
    expect(trimInlineAiText('"hello world"')).toBe('hello world')
  })
  it('strips surrounding single quotes', () => {
    expect(trimInlineAiText("'hello world'")).toBe('hello world')
  })
  it('strips code fences', () => {
    expect(trimInlineAiText('```js\nconsole.log(1)\n```')).toBe(
      'console.log(1)',
    )
  })
  it('handles empty string', () => {
    expect(trimInlineAiText('')).toBe('')
  })
  it('handles null/undefined gracefully', () => {
    expect(trimInlineAiText(null)).toBe('')
    expect(trimInlineAiText(undefined)).toBe('')
  })
})

describe('trimInlineAiHtmlFragment', () => {
  it('strips leading code fences', () => {
    const input = '```html\n<div>hi</div>\n```'
    expect(trimInlineAiHtmlFragment(input)).toBe('<div>hi</div>')
  })
  it('trims text before first < tag', () => {
    const input = 'Sure! <div>hi</div>'
    expect(trimInlineAiHtmlFragment(input)).toBe('<div>hi</div>')
  })
  it('returns plain html untouched', () => {
    expect(trimInlineAiHtmlFragment('<p>ok</p>')).toBe('<p>ok</p>')
  })
})

describe('stripFences', () => {
  it('strips trailing code fences', () => {
    expect(stripFences('<div>hi</div>\n```')).toBe('<div>hi</div>')
  })
  it('strips leading preamble before first <', () => {
    expect(stripFences('Here is the code:\n<html>')).toBe('<html>')
  })
})

describe('stripGroqReasoningLeak', () => {
  it('removes think/redacted blocks', () => {
    const input =
      '<think>internal reasoning</redacted_thinking>\n<html>ok</html>'
    expect(stripGroqReasoningLeak(input)).toBe('<html>ok</html>')
  })
  it('returns original if no leak', () => {
    expect(stripGroqReasoningLeak('<html>ok</html>')).toBe('<html>ok</html>')
  })
})

describe('calculateCost', () => {
  it('calculates known model cost', () => {
    const cost = calculateCost('llama3-8b-8192', 1_000_000, 1_000_000)
    expect(cost).toBeCloseTo(0.13, 2)
  })
  it('uses default pricing for unknown model', () => {
    const cost = calculateCost('unknown-model', 1_000_000, 1_000_000)
    expect(cost).toBeCloseTo(1.5, 2)
  })
  it('returns 0 for zero tokens', () => {
    expect(calculateCost('llama3-8b-8192', 0, 0)).toBe(0)
  })
})

describe('formatTps', () => {
  it('formats with tps and tokens', () => {
    const result = formatTps({
      outputTokens: 100,
      inputTokens: 50,
      tps: 42,
      model: 'llama3-8b-8192',
    })
    expect(result).toContain('42 tps')
    expect(result).toContain('100 out')
  })
  it('falls back when tps is 0', () => {
    const result = formatTps({
      outputTokens: 100,
      inputTokens: 50,
      tps: 0,
      model: '',
    })
    expect(result).toContain('100 out')
  })
  it('returns empty string when no tokens', () => {
    expect(
      formatTps({ outputTokens: 0, inputTokens: 0, tps: 0, model: '' }),
    ).toBe('')
  })
})
