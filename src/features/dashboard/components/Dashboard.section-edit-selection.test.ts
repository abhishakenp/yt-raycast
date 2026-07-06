// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'

import type { InspectorSelection } from '@/features/editing/element-path'
import { resolveSectionEditSelection } from './Dashboard'

describe('resolveSectionEditSelection', () => {
  it('uses the current inspector selection when section inspector selected something', () => {
    const root = document.createElement('div')
    root.className = 'genui-preview'
    const activeElement = document.createElement('h1')
    root.appendChild(activeElement)
    const inspectorSelection: InspectorSelection = {
      tag: 'section',
      elementPath: 'section:nth-of-type(1)',
      textContent: 'Inspector selected section',
      outerHTML: '<section>Inspector selected section</section>',
      boundingBox: { x: 1, y: 2, width: 3, height: 4 },
      openuiComponent: 'MarketingAgencyHero',
      openuiVar: 'home_hero',
    }

    expect(
      resolveSectionEditSelection({
        activeElement,
        inspectorSelection,
        previewRoot: root,
      }),
    ).toBe(inspectorSelection)
  })

  it('builds a section-edit selection from the active inline toolbar element', () => {
    const root = document.createElement('div')
    root.className = 'genui-preview'
    root.innerHTML = `
      <section data-openui-component="MarketingAgencyHero" data-openui-var="home_hero">
        <h1>Inline selected hero title</h1>
      </section>
    `
    const activeElement = root.querySelector('h1') as HTMLElement

    const selection = resolveSectionEditSelection({
      activeElement,
      inspectorSelection: null,
      previewRoot: root,
    })

    expect(selection).toMatchObject({
      tag: 'h1',
      elementPath: 'section:nth-of-type(1) > h1:nth-of-type(1)',
      textContent: 'Inline selected hero title',
      openuiComponent: 'MarketingAgencyHero',
      openuiVar: 'home_hero',
    })
    expect(selection?.outerHTML).toContain('Inline selected hero title')
  })

  it('does not build a selection from elements outside the preview root', () => {
    const root = document.createElement('div')
    root.className = 'genui-preview'
    const outside = document.createElement('button')
    outside.textContent = 'Dashboard chrome'
    document.body.append(root, outside)

    expect(
      resolveSectionEditSelection({
        activeElement: outside,
        inspectorSelection: null,
        previewRoot: root,
      }),
    ).toBeNull()
  })
})
