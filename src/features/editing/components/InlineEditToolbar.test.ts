import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  resolve(__dirname, 'InlineEditToolbar.tsx'),
  'utf-8',
)

describe('InlineEditToolbar — style restore on close', () => {
  it('saves original style attribute into a ref when activeElement changes', () => {
    expect(source).toContain('originalStyleRef')
    expect(source).toContain("activeElement.getAttribute('style')")
  })

  it('restores original style in handleClose', () => {
    const handleCloseMatch = source.match(
      /const handleClose[\s\S]*?(?=\n {2}const |\n {2}if \(!isOpen)/,
    )
    expect(handleCloseMatch).not.toBeNull()
    const handleCloseBody = handleCloseMatch![0]
    expect(handleCloseBody).toContain('originalStyleRef')
    expect(handleCloseBody).toContain("removeAttribute('style')")
    expect(handleCloseBody).toContain("setAttribute('style'")
  })

  it('does NOT restore original style in handleApply', () => {
    const handleApplyMatch = source.match(
      /const handleApply[\s\S]*?(?=\n {2}const handleClose)/,
    )
    expect(handleApplyMatch).not.toBeNull()
    const handleApplyBody = handleApplyMatch![0]
    expect(handleApplyBody).not.toContain('originalStyleRef')
  })

  it('handles computed textAlign "start" by mapping to left', () => {
    expect(source).not.toContain("as 'left' | 'center' | 'right'")
    const alignBlock = source.match(
      /const textAlign[\s\S]*?setAlignment\('left'\)/,
    )
    expect(alignBlock).not.toBeNull()
  })
})
