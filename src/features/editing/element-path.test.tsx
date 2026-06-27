import { describe, expect, it } from 'vitest'
import {
  buildInspectorSelection,
  getElementPath,
} from './element-path'

const buildDOM = () => {
  const root = document.createElement('div')
  root.innerHTML = `
    <section id="hero">
      <div class="card">
        <h2>Hello world</h2>
        <p>Some paragraph text</p>
      </div>
      <div class="card"><p>Second card</p></div>
    </section>
  `
  return root
}

const queryHTMLElement = (root: HTMLElement, selector: string) => {
  const element = root.querySelector(selector)
  if (!(element instanceof HTMLElement)) {
    throw new Error(`Expected ${selector} to match an HTMLElement`)
  }
  return element
}

describe('getElementPath', () => {
  it('builds a path with ids and nth-of-type indices', () => {
    const root = buildDOM()
    const h2 = queryHTMLElement(root, 'h2')
    expect(getElementPath(root, h2)).toBe(
      'section#hero > div:nth-of-type(1) > h2:nth-of-type(1)',
    )
  })

  it('returns the tag when the element is the root', () => {
    const root = buildDOM()
    const section = queryHTMLElement(root, '#hero')
    // section is a direct child of root; path is relative to root
    expect(getElementPath(root, section)).toBe('section#hero')
  })
})

describe('buildInspectorSelection', () => {
  it('serializes tag, path, text and outerHTML without mutating the DOM', () => {
    const root = buildDOM()
    const card = queryHTMLElement(root, '.card')
    const before = card.outerHTML
    const selection = buildInspectorSelection(root, card)
    expect(selection.tag).toBe('div')
    expect(selection.elementPath).toBe('section#hero > div:nth-of-type(1)')
    expect(selection.textContent).toBe('Hello world Some paragraph text')
    expect(selection.outerHTML).toContain('<div class="card">')
    expect(selection.boundingBox).toBeDefined()
    // No mutation: the element is untouched after building the selection.
    expect(card.outerHTML).toBe(before)
    expect(card.getAttribute('style')).toBeNull()
  })

  it('truncates long text content to 500 chars and collapses whitespace', () => {
    const root = document.createElement('div')
    const p = document.createElement('p')
    p.textContent = '  '.concat('a'.repeat(800))
    root.appendChild(p)
    const selection = buildInspectorSelection(root, p)
    expect(selection.textContent.length).toBeLessThanOrEqual(500)
    expect(selection.textContent).not.toMatch(/^\s/)
  })

  it('extracts openuiComponent + openuiVar from nearest ancestor with data attrs', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <section data-openui-component="SaasHero" data-openui-var="hero">
        <div class="card">
          <h2>Hello</h2>
        </div>
      </section>
    `
    const h2 = queryHTMLElement(root, 'h2')
    const selection = buildInspectorSelection(root, h2)
    expect(selection.openuiComponent).toBe('SaasHero')
    expect(selection.openuiVar).toBe('hero')
  })

  it('extracts openuiComponent when element itself has the data attr', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <section data-openui-component="EcommerceNavbar" data-openui-var="navbar">
        <nav>Links</nav>
      </section>
    `
    const section = queryHTMLElement(root, 'section')
    const selection = buildInspectorSelection(root, section)
    expect(selection.openuiComponent).toBe('EcommerceNavbar')
    expect(selection.openuiVar).toBe('navbar')
  })

  it('leaves openuiComponent/openuiVar undefined when no data attrs present (HTML sessions)', () => {
    const root = buildDOM()
    const card = queryHTMLElement(root, '.card')
    const selection = buildInspectorSelection(root, card)
    expect(selection.openuiComponent).toBeUndefined()
    expect(selection.openuiVar).toBeUndefined()
  })

  it('handles data-openui-var being absent while data-openui-component is present', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <div data-openui-component="BlogFooter">
        <p>Footer text</p>
      </div>
    `
    const p = queryHTMLElement(root, 'p')
    const selection = buildInspectorSelection(root, p)
    expect(selection.openuiComponent).toBe('BlogFooter')
    expect(selection.openuiVar).toBeUndefined()
  })
})
