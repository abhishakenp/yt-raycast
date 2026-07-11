// @vitest-environment jsdom

import { createRef } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Container } from './Container.tsx'

afterEach(() => {
  cleanup()
})

const hasAll = (el: Element, ...classes: string[]) =>
  classes.every((c) => el.classList.contains(c))

describe('Container', () => {
  it('renders a div with the shared gutter and default xl width', () => {
    render(<Container>content</Container>)
    const el = screen.getByText('content')
    expect(el.tagName).toBe('DIV')
    expect(
      hasAll(el, 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8', 'max-w-7xl'),
    ).toBe(true)
    expect(el.getAttribute('data-slot')).toBe('container')
  })

  it.each([
    ['sm', 'max-w-3xl'],
    ['md', 'max-w-5xl'],
    ['lg', 'max-w-6xl'],
    ['xl', 'max-w-7xl'],
  ] as const)('maps size=%s to %s', (size, expected) => {
    render(<Container size={size}>c</Container>)
    expect(screen.getByText('c').classList.contains(expected)).toBe(true)
  })

  it('lets className twMerge-override the max width', () => {
    render(<Container className="max-w-4xl">c</Container>)
    const el = screen.getByText('c')
    expect(el.classList.contains('max-w-4xl')).toBe(true)
    expect(el.classList.contains('max-w-7xl')).toBe(false)
  })

  it('merges extra layout classes without dropping the gutter', () => {
    render(
      <Container className="flex items-center justify-between">c</Container>,
    )
    expect(
      hasAll(
        screen.getByText('c'),
        'flex',
        'items-center',
        'px-4',
        'max-w-7xl',
      ),
    ).toBe(true)
  })

  it('renders as the child element when asChild is set', () => {
    render(
      <Container asChild>
        <section>c</section>
      </Container>,
    )
    const el = screen.getByText('c')
    expect(el.tagName).toBe('SECTION')
    expect(hasAll(el, 'max-w-7xl', 'mx-auto')).toBe(true)
  })

  it('forwards the ref to the underlying node', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Container ref={ref}>c</Container>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current?.getAttribute('data-slot')).toBe('container')
  })

  it('forwards arbitrary props (id, aria) to the node', () => {
    render(
      <Container id="hero-wrap" aria-label="hero">
        c
      </Container>,
    )
    const el = screen.getByText('c')
    expect(el.id).toBe('hero-wrap')
    expect(el.getAttribute('aria-label')).toBe('hero')
  })
})
