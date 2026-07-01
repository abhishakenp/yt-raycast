// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { EvilArea } from './evil-area'
import { EvilBar } from './evil-bar'
import { EvilLine } from './evil-line'
import { EvilPie } from './evil-pie'
import { EvilRadar } from './evil-radar'

describe('placeholder chart components', () => {
  afterEach(cleanup)

  it('renders every chart barrel export with its user-visible chart type', () => {
    render(
      <div>
        <EvilArea />
        <EvilBar />
        <EvilLine />
        <EvilPie />
        <EvilRadar />
      </div>,
    )

    expect(screen.getByText('Area Chart Placeholder')).toBeTruthy()
    expect(screen.getByText('Bar Chart Placeholder')).toBeTruthy()
    expect(screen.getByText('Line Chart Placeholder')).toBeTruthy()
    expect(screen.getByText('Pie Chart Placeholder')).toBeTruthy()
    expect(screen.getByText('Radar Chart Placeholder')).toBeTruthy()
  })

  it('preserves height and variant state that generated UIs rely on', () => {
    const { container } = render(
      <div>
        <EvilArea height={320} chartFrame="emphasis" />
        <EvilBar height={180} stacked chartFrame="flush" />
        <EvilPie donut />
      </div>,
    )

    expect(screen.getByText('Bar Chart Placeholder (stacked)')).toBeTruthy()
    expect(screen.getByText('Pie Chart Placeholder (donut)')).toBeTruthy()

    const frames = Array.from(container.querySelectorAll('div[style]'))
    expect(frames[0]?.getAttribute('style')).toContain('height: 320px')
    expect(frames[0]?.className).toContain('border-primary/30')
    expect(frames[1]?.getAttribute('style')).toContain('height: 180px')
    expect(frames[1]?.className).toContain('bg-muted/30')
    expect(frames[2]?.getAttribute('style')).toContain('height: 200px')
  })
})
