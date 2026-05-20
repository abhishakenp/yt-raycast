import { describe, expect, it } from 'vitest'
import { auditVisualSnapshot } from '../src/visual-audit.js'

describe('visual audit', () => {
  it('flags flat placeholders and internal generator language', () => {
    const audit = auditVisualSnapshot({
      text: 'Proof point 1 Signature moves: hero with brand asset placeholder',
      dataImgs: [{ className: 'w-full aspect-[4/3] bg-current/10', text: '', childElementCount: 0 }],
      overflowCount: 0,
    })
    expect(audit.ok).toBe(false)
    expect(audit.flatMediaCount).toBe(1)
    expect(audit.internalHits.length).toBeGreaterThan(0)
  })

  it('accepts art-directed media surfaces', () => {
    const audit = auditVisualSnapshot({
      text: 'Training Rhythm with useful customer copy',
      dataImgs: [{
        className: 'relative w-full aspect-[4/3] bg-gradient-to-br from-[#111827] to-[#f97316]',
        text: 'training floor',
        childElementCount: 3,
        outerHTML: '<div data-img="training floor" data-visual="art-surface"></div>',
      }],
      overflowCount: 0,
    })
    expect(audit.ok).toBe(true)
  })
})
