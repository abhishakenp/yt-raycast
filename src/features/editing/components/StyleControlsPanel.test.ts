// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Radix ToggleGroup requires ResizeObserver
if (typeof ResizeObserver === 'undefined') {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: class ResizeObserver {
      disconnect() {}
      observe() {}
      unobserve() {}
    },
    writable: true,
  })
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn()
}

// BackgroundPanel uses convex hooks — mock them
vi.mock('convex/react', () => ({
  useMutation: vi.fn(() => vi.fn(async () => {})),
  useQuery: vi.fn(() => undefined),
}))
vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    sessions: {
      generateImageUploadUrl: 'generateImageUploadUrl',
      saveUserImage: 'saveUserImage',
      listUserImages: 'listUserImages',
    },
  },
}))
vi.mock('@/features/session/services/anonymous-owner-secret', () => ({
  readAnonymousOwnerSecret: vi.fn(() => undefined),
}))
vi.mock('@/lib/stock-image', () => ({
  searchStockImages: vi.fn(async () => []),
  buildBackgroundImageUrl: (result: { baseUrl?: string; imageUrl?: string }, resolution: string) =>
    result.baseUrl ? `${result.baseUrl}?res=${resolution}` : result.imageUrl,
}))

import { StyleControlsPanel } from './StyleControlsPanel'

const onModified = vi.fn<() => void>()

function renderPanel(activeElement: HTMLElement) {
  return render(
    createElement(StyleControlsPanel, { activeElement, onModified }),
  )
}

function makeComputed(
  overrides: Partial<Record<string, string>> = {},
): CSSStyleDeclaration {
  const values = {
    paddingTop: '10px',
    paddingRight: '10px',
    paddingBottom: '10px',
    paddingLeft: '10px',
    marginTop: '0px',
    marginRight: '0px',
    marginBottom: '0px',
    marginLeft: '0px',
    borderTopWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgb(0, 0, 0)',
    borderRadius: '4px',
    backgroundColor: 'rgb(255, 255, 255)',
    boxShadow: 'none',
    width: '100px',
    height: 'auto',
    ...overrides,
  }
  return {
    ...values,
    getPropertyValue: (property) =>
      values[property as keyof typeof values] ?? '',
  } as CSSStyleDeclaration
}

describe('StyleControlsPanel', () => {
  let activeElement: HTMLElement
  let originalGetComputedStyle: typeof window.getComputedStyle

  beforeEach(() => {
    onModified.mockReset()
    activeElement = document.createElement('div')
    activeElement.setAttribute('class', 'test-element')
    document.body.appendChild(activeElement)
    originalGetComputedStyle = window.getComputedStyle
    window.getComputedStyle = vi.fn(() =>
      makeComputed(),
    ) as typeof window.getComputedStyle
  })

  afterEach(() => {
    window.getComputedStyle = originalGetComputedStyle
    activeElement.remove()
    cleanup()
  })

  it('renders all style editor tabs', () => {
    const { getByLabelText } = renderPanel(activeElement)
    expect(getByLabelText('Spacing')).toBeTruthy()
    expect(getByLabelText('Border')).toBeTruthy()
    expect(getByLabelText('BG')).toBeTruthy()
    expect(getByLabelText('Size')).toBeTruthy()
    expect(getByLabelText('Effects')).toBeTruthy()
    expect(getByLabelText('Layout')).toBeTruthy()
  })

  it('keeps tab panels reachable through accessible controls after switching tabs', () => {
    const { getByLabelText, getByRole } = renderPanel(activeElement)

    fireEvent.click(getByLabelText('BG'))
    expect(
      getByRole('textbox', { name: 'Search background images' }),
    ).toBeTruthy()

    fireEvent.click(getByLabelText('Border'))
    expect(getByRole('spinbutton', { name: 'Border width' })).toBeTruthy()

    fireEvent.click(getByLabelText('Size'))
    expect(getByRole('textbox', { name: 'Width' })).toBeTruthy()

    fireEvent.click(getByLabelText('Effects'))
    expect(getByRole('slider', { name: 'Opacity' })).toBeTruthy()

    fireEvent.click(getByLabelText('Layout'))
    expect(getByRole('radiogroup', { name: 'Display' })).toBeTruthy()
  })

  it('exposes active tab state to assistive tech while switching tabs', () => {
    const { getByLabelText } = renderPanel(activeElement)
    const spacing = getByLabelText('Spacing')
    const border = getByLabelText('Border')
    const background = getByLabelText('BG')
    const size = getByLabelText('Size')
    const effects = getByLabelText('Effects')
    const layout = getByLabelText('Layout')

    expect(spacing.getAttribute('aria-pressed')).toBe('true')
    expect(border.getAttribute('aria-pressed')).toBe('false')
    expect(background.getAttribute('aria-pressed')).toBe('false')
    expect(size.getAttribute('aria-pressed')).toBe('false')
    expect(effects.getAttribute('aria-pressed')).toBe('false')
    expect(layout.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(effects)

    expect(spacing.getAttribute('aria-pressed')).toBe('false')
    expect(border.getAttribute('aria-pressed')).toBe('false')
    expect(background.getAttribute('aria-pressed')).toBe('false')
    expect(size.getAttribute('aria-pressed')).toBe('false')
    expect(effects.getAttribute('aria-pressed')).toBe('true')
    expect(layout.getAttribute('aria-pressed')).toBe('false')
  })

  it('routes effects tab edits through the shared modified callback', () => {
    const { getByLabelText, getByRole } = renderPanel(activeElement)

    fireEvent.click(getByLabelText('Effects'))
    fireEvent.keyDown(getByRole('slider', { name: 'Opacity' }), {
      key: 'ArrowLeft',
    })

    expect(activeElement.style.opacity).toBe('0.99')
    expect(onModified).toHaveBeenCalled()
  })

  it('routes layout tab edits through the shared modified callback', () => {
    const { getByLabelText, getByRole } = renderPanel(activeElement)

    fireEvent.click(getByLabelText('Layout'))
    fireEvent.click(getByRole('radio', { name: 'Flex' }))

    expect(activeElement.style.display).toBe('flex')
    expect(onModified).toHaveBeenCalled()
  })

  it('exposes linked spacing toggle state to assistive tech', () => {
    const { getByLabelText } = renderPanel(activeElement)
    const paddingToggle = getByLabelText('Unlink padding')
    const marginToggle = getByLabelText('Unlink margin')

    expect(paddingToggle.getAttribute('aria-pressed')).toBe('true')
    expect(marginToggle.getAttribute('aria-pressed')).toBe('true')

    fireEvent.click(paddingToggle)
    fireEvent.click(marginToggle)

    const relinkPadding = getByLabelText('Link padding')
    const relinkMargin = getByLabelText('Link margin')
    expect(relinkPadding.getAttribute('aria-pressed')).toBe('false')
    expect(relinkMargin.getAttribute('aria-pressed')).toBe('false')
  })

  it('exposes spacing inputs and unit controls by side', () => {
    const { getByRole } = renderPanel(activeElement)

    for (const side of ['top', 'right', 'bottom', 'left']) {
      expect(getByRole('spinbutton', { name: `Padding ${side}` })).toBeTruthy()
      expect(
        getByRole('combobox', { name: `Padding ${side} unit` }),
      ).toBeTruthy()
      expect(getByRole('spinbutton', { name: `Margin ${side}` })).toBeTruthy()
      expect(
        getByRole('combobox', { name: `Margin ${side} unit` }),
      ).toBeTruthy()
    }
  })

  it('switches to border tab', () => {
    const { getByLabelText, getByText } = renderPanel(activeElement)
    fireEvent.click(getByLabelText('Border'))
    expect(getByText('Style')).toBeTruthy()
    expect(getByText('Color')).toBeTruthy()
  })

  it('exposes border controls by accessible name', () => {
    const { getByLabelText, getByRole } = renderPanel(activeElement)
    fireEvent.click(getByLabelText('Border'))

    expect(getByRole('spinbutton', { name: 'Border width' })).toBeTruthy()
    expect(getByRole('combobox', { name: 'Border width unit' })).toBeTruthy()
    expect(getByRole('combobox', { name: 'Border style' })).toBeTruthy()
    expect(getByLabelText('Border color')).toBeTruthy()
    expect(getByRole('spinbutton', { name: 'Border radius' })).toBeTruthy()
    expect(getByRole('combobox', { name: 'Border radius unit' })).toBeTruthy()
  })

  it('switches to background tab', () => {
    const { getByLabelText, getByText } = renderPanel(activeElement)
    fireEvent.click(getByLabelText('BG'))
    // BackgroundPanel renders Solid/Gradient mode toggle
    expect(getByText('Solid')).toBeTruthy()
    expect(getByText('Gradient')).toBeTruthy()
  })

  it('switches to size tab', () => {
    const { getByLabelText } = renderPanel(activeElement)
    fireEvent.click(getByLabelText('Size'))
    // Size tab has W and H labels (shortened from Width/Height)
    const inputs = document.querySelectorAll('input[type="text"]')
    expect(inputs.length).toBeGreaterThanOrEqual(2)
  })

  it('exposes size controls by accessible name', () => {
    const { getByLabelText, getByRole } = renderPanel(activeElement)
    fireEvent.click(getByLabelText('Size'))

    expect(getByRole('textbox', { name: 'Width' })).toBeTruthy()
    expect(getByRole('combobox', { name: 'Width unit' })).toBeTruthy()
    expect(getByRole('textbox', { name: 'Height' })).toBeTruthy()
    expect(getByRole('combobox', { name: 'Height unit' })).toBeTruthy()
  })

  it('modifying border width calls onModified and applies live style', () => {
    const { getByLabelText } = renderPanel(activeElement)
    fireEvent.click(getByLabelText('Border'))
    const widthInput = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[type="number"]'),
    ).find((i) => i.value === '1')!
    fireEvent.change(widthInput, { target: { value: '3' } })
    expect(activeElement.style.borderWidth).toBe('3px')
    expect(onModified).toHaveBeenCalled()
  })

  it('changing a spacing unit reapplies the current value and marks the edit modified', async () => {
    const { getByRole } = renderPanel(activeElement)

    fireEvent.click(getByRole('combobox', { name: 'Padding top unit' }))
    fireEvent.click(await screen.findByRole('option', { name: 'rem' }))

    expect(activeElement.style.paddingTop).toBe('10rem')
    expect(activeElement.style.paddingRight).toBe('10rem')
    expect(activeElement.style.paddingBottom).toBe('10rem')
    expect(activeElement.style.paddingLeft).toBe('10rem')
    expect(onModified).toHaveBeenCalled()
  })

  it('changing the border width unit does not rewrite border radius', async () => {
    const { getByLabelText, getByRole } = renderPanel(activeElement)
    fireEvent.click(getByLabelText('Border'))

    fireEvent.click(getByRole('combobox', { name: 'Border width unit' }))
    fireEvent.click(await screen.findByRole('option', { name: 'rem' }))

    expect(activeElement.style.borderWidth).toBe('1rem')
    expect(activeElement.style.borderRadius).toBe('')
    expect(onModified).toHaveBeenCalled()
  })

  it('changing the border radius unit does not rewrite border width', async () => {
    const { getByLabelText, getByRole } = renderPanel(activeElement)
    fireEvent.click(getByLabelText('Border'))

    fireEvent.click(getByRole('combobox', { name: 'Border radius unit' }))
    fireEvent.click(await screen.findByRole('option', { name: 'rem' }))

    expect(activeElement.style.borderRadius).toBe('4rem')
    expect(activeElement.style.borderWidth).toBe('')
    expect(onModified).toHaveBeenCalled()
  })

  it('typing a unitless size value applies it with the selected size unit', () => {
    const { getByLabelText, getByRole } = renderPanel(activeElement)
    fireEvent.click(getByLabelText('Size'))

    fireEvent.change(getByRole('textbox', { name: 'Width' }), {
      target: { value: '320' },
    })

    expect(activeElement.style.width).toBe('320px')
    expect(onModified).toHaveBeenCalled()
  })

  it('changing the width unit does not rewrite the height style', async () => {
    window.getComputedStyle = vi.fn(() =>
      makeComputed({ width: '100px', height: '60px' }),
    ) as typeof window.getComputedStyle
    const { getByLabelText, getByRole } = renderPanel(activeElement)
    fireEvent.click(getByLabelText('Size'))

    fireEvent.click(getByRole('combobox', { name: 'Width unit' }))
    fireEvent.click(await screen.findByRole('option', { name: '%' }))

    expect(activeElement.style.width).toBe('100%')
    expect(activeElement.style.height).toBe('')
    expect(onModified).toHaveBeenCalled()
  })

  it('BG tab renders BackgroundPanel with gradient mode', () => {
    const { getByLabelText, getByText } = renderPanel(activeElement)
    fireEvent.click(getByLabelText('BG'))
    // BackgroundPanel renders Solid/Gradient mode toggle
    expect(getByText('Gradient')).toBeTruthy()
  })
})
