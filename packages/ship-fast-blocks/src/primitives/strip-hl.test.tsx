import { describe, expect, it } from 'vitest'
import { stripHlTags } from './index.tsx'

describe('stripHlTags', () => {
  it('strips [hl] and [/hl] markers, keeping inner text', () => {
    expect(stripHlTags('Hello [hl]world[/hl]!')).toBe('Hello world!')
  })

  it('handles multiple [hl] blocks', () => {
    expect(stripHlTags('[hl]A[/hl] and [hl]B[/hl]')).toBe('A and B')
  })

  it('returns text unchanged when no [hl] markers', () => {
    expect(stripHlTags('Plain text')).toBe('Plain text')
  })

  it('handles empty string', () => {
    expect(stripHlTags('')).toBe('')
  })

  it('handles [hl] with no closing tag (malformed)', () => {
    expect(stripHlTags('Hello [hl]world')).toBe('Hello world')
  })

  it('handles just [hl][/hl]', () => {
    expect(stripHlTags('[hl][/hl]')).toBe('')
  })
})
