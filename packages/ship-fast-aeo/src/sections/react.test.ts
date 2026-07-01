// @vitest-environment jsdom

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { AeoDirectAnswer } from './react/index.tsx'

describe('AEO React section exports', () => {
  it('server-renders the direct-answer section as labelled overview content', () => {
    const html = renderToStaticMarkup(
      React.createElement(AeoDirectAnswer, {
        answer: 'Acme helps teams understand their cloud spend.',
        className: 'custom-aeo',
        heading: 'What is Acme?',
        whoFor: 'Platform teams',
      }),
    )
    const document = new DOMParser().parseFromString(html, 'text/html')
    const section = document.querySelector('section')

    expect(section?.getAttribute('aria-label')).toBe('Overview')
    expect(section?.className).toContain('custom-aeo')
    expect(document.querySelector('h1')).toBeNull()
    expect(document.querySelector('h2')?.textContent).toBe('What is Acme?')
    expect(document.body.textContent).toContain(
      'Acme helps teams understand their cloud spend.',
    )
    expect(document.body.textContent).toContain('Who this is for:')
    expect(document.body.textContent).toContain('Platform teams')
  })

  it('omits optional heading and audience copy without leaving empty wrappers', () => {
    const html = renderToStaticMarkup(
      React.createElement(AeoDirectAnswer, {
        answer: 'Acme is a planning workspace.',
      }),
    )
    const document = new DOMParser().parseFromString(html, 'text/html')

    expect(document.querySelector('section')).not.toBeNull()
    expect(document.querySelector('h1')).toBeNull()
    expect(document.querySelector('h2')).toBeNull()
    expect(document.body.textContent).toBe('Acme is a planning workspace.')
  })
})
