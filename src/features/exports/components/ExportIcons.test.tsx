// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { HtmlIcon, LakebedIcon, NextIcon, ReactIcon } from './ExportIcons'

describe('ExportIcons', () => {
  afterEach(() => cleanup())

  it.each([
    ['html export', HtmlIcon],
    ['react export', ReactIcon],
    ['next export', NextIcon],
    ['lakebed export', LakebedIcon],
  ] as const)(
    'renders the %s icon as an accessible svg target',
    (label, Icon) => {
      render(<Icon aria-label={label} data-testid="export-icon" />)

      const icon = screen.getByTestId('export-icon')
      expect(icon.tagName.toLowerCase()).toBe('svg')
      expect(icon.getAttribute('aria-label')).toBe(label)
      expect(icon.getAttribute('viewBox')).toBeTruthy()
    },
  )
})
