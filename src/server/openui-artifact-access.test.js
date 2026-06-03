import { describe, expect, it } from 'vitest'
import { canReadOpenUIArtifactWithoutOwner } from './index.js'

describe('OpenUI artifact access policy', () => {
  it('allows public anonymous preview artifacts to be read without the owner secret', () => {
    expect(canReadOpenUIArtifactWithoutOwner({ userId: null, isPrivate: false })).toBe(true)
    expect(canReadOpenUIArtifactWithoutOwner({ isPrivate: false })).toBe(true)
  })

  it('keeps private and user-owned preview artifacts behind the owner gate', () => {
    expect(canReadOpenUIArtifactWithoutOwner({ userId: null, isPrivate: true })).toBe(false)
    expect(canReadOpenUIArtifactWithoutOwner({ userId: 'user_123', isPrivate: false })).toBe(false)
    expect(canReadOpenUIArtifactWithoutOwner(null)).toBe(false)
  })
})
