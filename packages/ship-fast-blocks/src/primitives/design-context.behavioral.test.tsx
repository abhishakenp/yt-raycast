import { describe, it, expect, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { DesignSystemProvider } from './design-context.tsx'
import { DEFAULT_DESIGN, type DesignIntent } from './design-system.ts'

afterEach(() => {
  cleanup()
})

describe('DesignSystemProvider CSS override layer', () => {
  function renderWithDesign(intent: Partial<DesignIntent>, children: React.ReactNode) {
    const full: DesignIntent = { ...DEFAULT_DESIGN, ...intent }
    return render(
      <DesignSystemProvider intent={full}>
        {children}
      </DesignSystemProvider>,
    )
  }

  it('injects data-radius attribute on wrapper', () => {
    renderWithDesign({ radius: 'sharp' }, <div>test</div>)
    const wrapper = document.querySelector('[data-radius]')
    expect(wrapper?.getAttribute('data-radius')).toBe('sharp')
  })

  it('injects data-shadow attribute on wrapper', () => {
    renderWithDesign({ shadow: 'none' }, <div>test</div>)
    const wrapper = document.querySelector('[data-shadow]')
    expect(wrapper?.getAttribute('data-shadow')).toBe('none')
  })

  it('injects data-gradient attribute on wrapper', () => {
    renderWithDesign({ gradient: 'none' }, <div>test</div>)
    const wrapper = document.querySelector('[data-gradient]')
    expect(wrapper?.getAttribute('data-gradient')).toBe('none')
  })

  it('injects data-motion attribute on wrapper', () => {
    renderWithDesign({ motion: 'none' }, <div>test</div>)
    const wrapper = document.querySelector('[data-motion]')
    expect(wrapper?.getAttribute('data-motion')).toBe('none')
  })

  it('injects data-typography attribute on wrapper', () => {
    renderWithDesign({ typography: 'editorial' }, <div>test</div>)
    const wrapper = document.querySelector('[data-typography]')
    expect(wrapper?.getAttribute('data-typography')).toBe('editorial')
  })

  it('injects a <style> block with override CSS', () => {
    renderWithDesign({ radius: 'sharp', shadow: 'none' }, <div>test</div>)
    const style = document.querySelector('[data-radius] style')
    expect(style).toBeTruthy()
    const css = style?.textContent ?? ''
    // Should contain radius override rules
    expect(css).toContain('border-radius')
    // Should contain shadow override rules
    expect(css).toContain('box-shadow')
  })

  it('shadow:none override CSS targets shadow-* classes', () => {
    renderWithDesign({ shadow: 'none' }, <div className="shadow-lg">test</div>)
    const style = document.querySelector('[data-shadow] style')
    const css = style?.textContent ?? ''
    expect(css).toContain('shadow-lg')
    expect(css).toContain('box-shadow: none')
  })

  it('gradient:none override CSS targets bg-gradient-* classes', () => {
    renderWithDesign({ gradient: 'none' }, <div className="bg-gradient-to-r">test</div>)
    const style = document.querySelector('[data-gradient] style')
    const css = style?.textContent ?? ''
    expect(css).toContain('bg-gradient-to-r')
    expect(css).toContain('background-image: none')
  })

  it('motion:none override CSS targets transition-* classes', () => {
    renderWithDesign({ motion: 'none' }, <div className="transition-all">test</div>)
    const style = document.querySelector('[data-motion] style')
    const css = style?.textContent ?? ''
    expect(css).toContain('transition-all')
    expect(css).toContain('transition: none')
  })

  it('does not inject gradient override CSS when gradient is not none', () => {
    renderWithDesign({ gradient: 'vibrant' }, <div>test</div>)
    const style = document.querySelector('[data-gradient] style')
    const css = style?.textContent ?? ''
    // gradient:vibrant should not produce gradient override rules
    expect(css).not.toContain('bg-gradient-to-r')
  })

  it('d-shadow-lock opts out of shadow override', () => {
    renderWithDesign({ shadow: 'none' }, <div className="shadow-lg d-shadow-lock">test</div>)
    const style = document.querySelector('[data-shadow] style')
    const css = style?.textContent ?? ''
    // The override rule should exclude d-shadow-lock
    expect(css).toContain(':not(.d-shadow-lock)')
  })

  it('d-gradient-lock opts out of gradient override', () => {
    renderWithDesign({ gradient: 'none' }, <div className="bg-gradient-to-r d-gradient-lock">test</div>)
    const style = document.querySelector('[data-gradient] style')
    const css = style?.textContent ?? ''
    expect(css).toContain(':not(.d-gradient-lock)')
  })
})
