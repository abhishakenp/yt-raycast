// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { isInRadixPortal } from './radix-portal'

describe('isInRadixPortal', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('returns false for a plain element outside any portal', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    expect(isInRadixPortal(el)).toBe(false)
  })

  it('returns false for null/undefined', () => {
    expect(isInRadixPortal(null)).toBe(false)
    expect(isInRadixPortal(undefined)).toBe(false)
  })

  // The Select dropdown (gap unit px/rem) is the concrete regression: clicking
  // a portalled option must be recognised as "inside" so dismiss handlers bail.
  it.each([
    ['[role="option"]', 'role', 'option'],
    ['[role="listbox"]', 'role', 'listbox'],
    ['[role="alertdialog"]', 'role', 'alertdialog'],
    ['[data-radix-popper-content-wrapper]', 'data-radix-popper-content-wrapper', ''],
    ['[data-radix-select-content]', 'data-radix-select-content', ''],
    ['[data-radix-dialog-content]', 'data-radix-dialog-content', ''],
    ['[data-radix-dialog-overlay]', 'data-radix-dialog-overlay', ''],
  ])('recognises %s as a portal', (_label, attr, value) => {
    const portal = document.createElement('div')
    portal.setAttribute(attr, value)
    const child = document.createElement('span')
    portal.appendChild(child)
    document.body.appendChild(portal)

    expect(isInRadixPortal(portal)).toBe(true)
    // A descendant (the actual click target, e.g. the "rem" item text) also
    // resolves to inside the portal.
    expect(isInRadixPortal(child)).toBe(true)
  })
})
