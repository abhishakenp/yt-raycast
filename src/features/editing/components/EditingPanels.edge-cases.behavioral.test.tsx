// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ── Polyfills: jsdom lacks ResizeObserver / IntersectionObserver ──────────────
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
if (typeof IntersectionObserver === 'undefined') {
  Object.defineProperty(globalThis, 'IntersectionObserver', {
    configurable: true,
    value: class IntersectionObserver {
      readonly root: Element | null = null
      readonly rootMargin: string = ''
      readonly thresholds: ReadonlyArray<number> = []
      disconnect() {}
      observe() {}
      takeRecords(): IntersectionObserverEntry[] {
        return []
      }
      unobserve() {}
    },
    writable: true,
  })
}

// ── Mock variables for convex / stock-image ───────────────────────────────────
const searchStockImagesMock = vi.fn(
  async () =>
    [] as Array<{
      imageUrl: string
      source: 'pexels' | 'unsplash' | 'picsum'
      query: string
    }>,
)

let generateUploadUrlMock = vi.fn(async () => 'https://upload.test/url')
let saveUserImageMock = vi.fn(async () => undefined)
let userImagesValue:
  | Array<{ url: string | null; filename: string | null }>
  | undefined = undefined
const originalFetch = globalThis.fetch

// ── Mock external dependencies ───────────────────────────────────────────────
vi.mock('convex/react', () => ({
  useMutation: (fn: unknown) => {
    if (fn === 'generateImageUploadUrl') return generateUploadUrlMock
    if (fn === 'saveUserImage') return saveUserImageMock
    return vi.fn(async () => undefined)
  },
  useQuery: () => userImagesValue,
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
vi.mock('@/lib/stock-image', () => ({
  searchStockImages: (...args: unknown[]) =>
    searchStockImagesMock(...(args as [])),
}))
vi.mock('@/features/session/services/anonymous-owner-secret', () => ({
  readAnonymousOwnerSecret: vi.fn(() => undefined),
}))

// ── Mock UI primitives with native equivalents ────────────────────────────────
// cn — simple string concatenation (no tailwind-merge needed in tests)
vi.mock('#/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

// Tooltip — pass-through (decorative only)
vi.mock('#/components/ui/tooltip', async () => {
  const { Fragment } = await import('react')
  return {
    TooltipProvider: ({ children }: any) =>
      createElement(Fragment, null, children),
    Tooltip: ({ children }: any) => createElement(Fragment, null, children),
    TooltipTrigger: ({ children }: any) =>
      createElement(Fragment, null, children),
    TooltipContent: () => null,
  }
})

// Select — context-based mock rendering a native <select> + <option> tree
vi.mock('#/components/ui/select', async () => {
  const { createContext, useContext } = await import('react')
  const Ctx = createContext<{
    value: string
    onValueChange: (v: string) => void
  } | null>(null)

  function Select({ value, onValueChange, children }: any) {
    return createElement(
      Ctx.Provider,
      { value: { value, onValueChange } },
      children,
    )
  }
  function SelectTrigger({ children, ...props }: any) {
    return createElement('span', props, children)
  }
  function SelectValue({ children, ...props }: any) {
    const ctx = useContext(Ctx)
    return createElement('span', props, ctx?.value ?? children)
  }
  function SelectContent({ children, ...props }: any) {
    const ctx = useContext(Ctx)
    return createElement(
      'select',
      {
        value: ctx?.value,
        onChange: (e: any) => ctx?.onValueChange?.(e.target.value),
        ...props,
      },
      children,
    )
  }
  function SelectItem({ value, children, ...props }: any) {
    return createElement('option', { value, ...props }, children)
  }
  return { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
})

// Slider — native range input
vi.mock('#/components/ui/slider', async () => {
  const { createElement: ce3 } = await import('react')
  function Slider({ value, onValueChange, min, max, step, ...props }: any) {
    return ce3('input', {
      type: 'range',
      value: Array.isArray(value) ? value[0] : value,
      min,
      max,
      step,
      onChange: (e: any) => onValueChange?.([Number(e.target.value)]),
      ...props,
    })
  }
  return { Slider }
})

// ToggleGroup — context-based mock with native buttons
vi.mock('#/components/ui/toggle-group', async () => {
  const { createContext, useContext } = await import('react')
  const Ctx = createContext<{
    value: string
    onValueChange: (v: string) => void
  } | null>(null)

  function ToggleGroup({ value, onValueChange, children, ...props }: any) {
    return createElement(
      Ctx.Provider,
      { value: { value, onValueChange } },
      createElement('div', { role: 'group', ...props }, children),
    )
  }
  function ToggleGroupItem({ value, children, ...props }: any) {
    const ctx = useContext(Ctx)
    return createElement(
      'button',
      {
        type: 'button',
        'data-state': ctx?.value === value ? 'on' : 'off',
        onClick: () => ctx?.onValueChange?.(value),
        ...props,
      },
      children,
    )
  }
  return { ToggleGroup, ToggleGroupItem }
})

// InputGroup — native HTML elements
vi.mock('#/components/ui/input-group', async () => {
  const { createElement: ce4 } = await import('react')
  function InputGroup({ children, ...props }: any) {
    return ce4('div', props, children)
  }
  function InputGroupAddon({ children, ...props }: any) {
    return ce4('div', props, children)
  }
  function InputGroupInput(props: any) {
    return ce4('input', props)
  }
  function InputGroupText({ children, ...props }: any) {
    return ce4('span', props, children)
  }
  function InputGroupButton({ children, ...props }: any) {
    return ce4('button', props, children)
  }
  function InputGroupTextarea(props: any) {
    return createElement('textarea', props)
  }
  return {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
    InputGroupButton,
    InputGroupTextarea,
  }
})

// ── Dynamic imports (deferred until mocks are registered) ─────────────────────
const { StyleControlsPanel } = await import('./StyleControlsPanel')
const { BackgroundPanel } = await import('./BackgroundPanel')
const { EffectsPanel } = await import('./EffectsPanel')
const { LayoutPanel } = await import('./LayoutPanel')
const { TypographyControlsPanel } = await import('./TypographyControlsPanel')

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeActiveElement(): HTMLElement {
  const el = document.createElement('div')
  el.id = 'test-active-element'
  document.body.appendChild(el)
  return el
}

/** Find a <select> whose <option>s include the given value. */
function findSelectByOptionValue(
  container: HTMLElement,
  value: string,
): HTMLSelectElement | undefined {
  return Array.from(container.querySelectorAll('select')).find((s) =>
    Array.from(s.options).some((o) => o.value === value),
  )
}

// ─── Shared setup / teardown ──────────────────────────────────────────────────
beforeEach(() => {
  searchStockImagesMock.mockReset()
  searchStockImagesMock.mockResolvedValue([])
  generateUploadUrlMock = vi.fn(async () => 'https://upload.test/url')
  saveUserImageMock = vi.fn(async () => undefined)
  userImagesValue = undefined
})
afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
  globalThis.fetch = originalFetch
})

// ═══════════════════════════════════════════════════════════════════════════════
// StyleControlsPanel
// ═══════════════════════════════════════════════════════════════════════════════
describe('StyleControlsPanel (edge cases)', () => {
  function renderPanel(
    props?: Partial<{
      activeElement: HTMLElement | null
      onModified: () => void
      sessionId: string
    }>,
  ) {
    const activeElement = props?.activeElement ?? makeActiveElement()
    const onModified = props?.onModified ?? vi.fn()
    const result = render(
      createElement(StyleControlsPanel, {
        activeElement,
        onModified,
        sessionId: 'sess-1',
        ...props,
      }),
    )
    return { ...result, activeElement, onModified }
  }

  it('1. Spacing — link padding: changing top changes all 4; unlink: top only', () => {
    const { container } = renderPanel()
    // Default tab is 'spacing'; padding is linked by default.
    const numberInputs = container.querySelectorAll('input[type="number"]')
    // First 4 inputs = padding (T, R, B, L); next 4 = margin.
    const [top, right, bottom, left] = Array.from(
      numberInputs,
    ) as HTMLInputElement[]

    // Linked: changing top → all 4 padding sides update.
    fireEvent.change(top, { target: { value: '10' } })
    expect(top.value).toBe('10')
    expect(right.value).toBe('10')
    expect(bottom.value).toBe('10')
    expect(left.value).toBe('10')

    // Unlink padding.
    fireEvent.click(screen.getByLabelText('Unlink padding'))

    // Unlinked: changing top → only top updates.
    fireEvent.change(top, { target: { value: '20' } })
    expect(top.value).toBe('20')
    expect(right.value).toBe('10')
    expect(bottom.value).toBe('10')
    expect(left.value).toBe('10')
  })

  it('2. Spacing — unit selector px→rem changes all unit displays', () => {
    const { container } = renderPanel()
    const selects = container.querySelectorAll('select')
    // First 4 selects = padding unit selectors (px/rem/em).
    const paddingSelects = Array.from(selects).slice(
      0,
      4,
    ) as HTMLSelectElement[]

    // Verify initial unit is px.
    paddingSelects.forEach((s) => expect(s.value).toBe('px'))

    // Change first padding unit select to rem.
    fireEvent.change(paddingSelects[0], { target: { value: 'rem' } })

    // All 4 padding unit selects should now display rem (shared state).
    paddingSelects.forEach((s) => expect(s.value).toBe('rem'))
  })

  it('3. Border — style selector none→solid→dashed→dotted cycles correctly', () => {
    const { container, activeElement } = renderPanel()
    // Switch to Border tab.
    fireEvent.click(screen.getByLabelText('Border'))

    const borderStyleSelect = findSelectByOptionValue(container, 'solid')!
    expect(borderStyleSelect).toBeTruthy()

    // none → solid
    fireEvent.change(borderStyleSelect, { target: { value: 'solid' } })
    expect(activeElement.style.getPropertyValue('border-style')).toBe('solid')

    // solid → dashed
    fireEvent.change(borderStyleSelect, { target: { value: 'dashed' } })
    expect(activeElement.style.getPropertyValue('border-style')).toBe('dashed')

    // dashed → dotted
    fireEvent.change(borderStyleSelect, { target: { value: 'dotted' } })
    expect(activeElement.style.getPropertyValue('border-style')).toBe('dotted')
  })

  it('4. Border — color picker changes border color value', () => {
    const { container, activeElement } = renderPanel()
    fireEvent.click(screen.getByLabelText('Border'))

    const colorInput = container.querySelector(
      'input[type="color"]',
    ) as HTMLInputElement
    expect(colorInput).toBeTruthy()

    fireEvent.change(colorInput, { target: { value: '#ff0000' } })
    // jsdom normalizes hex to rgb in CSS property values.
    expect(activeElement.style.getPropertyValue('border-color')).toBe(
      'rgb(255, 0, 0)',
    )
    // Hex display (from React state, not CSS) shows the original hex.
    expect(screen.getByText('#ff0000')).toBeTruthy()
  })

  it('5. Size — width "100" + unit "%" stored; "auto" → auto mode', () => {
    const { container, activeElement } = renderPanel()
    fireEvent.click(screen.getByLabelText('Size'))

    const textInputs = container.querySelectorAll('input[type="text"]')
    const widthInput = textInputs[0] as HTMLInputElement
    const sizeSelect = findSelectByOptionValue(container, '%')!
    expect(sizeSelect).toBeTruthy()

    // Type "100" in width → value stored in state (CSS needs a unit, so the
    // style property may not be set by jsdom for a bare number).
    fireEvent.change(widthInput, { target: { value: '100' } })
    expect(widthInput.value).toBe('100')

    // Change unit to "%" → unit stored in state.
    fireEvent.change(sizeSelect, { target: { value: '%' } })
    expect(sizeSelect.value).toBe('%')

    // Type "auto" → width applied as "auto" (valid CSS keyword).
    fireEvent.change(widthInput, { target: { value: 'auto' } })
    expect(widthInput.value).toBe('auto')
    expect(activeElement.style.getPropertyValue('width')).toBe('auto')
  })

  it('6. Tab switching — click Background tab → BackgroundPanel visible, Spacing hidden', () => {
    renderPanel()
    // Initially on Spacing tab — "Padding" label visible.
    expect(screen.queryByText('Padding')).not.toBeNull()

    // Click the "BG" tab button.
    fireEvent.click(screen.getByLabelText('BG'))

    // Spacing content ("Padding") is now hidden.
    expect(screen.queryByText('Padding')).toBeNull()
    // BackgroundPanel content is visible — "Solid" toggle button appears.
    expect(screen.queryByText('Solid')).not.toBeNull()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// BackgroundPanel
// ═══════════════════════════════════════════════════════════════════════════════
describe('BackgroundPanel (edge cases)', () => {
  function renderPanel(
    props?: Partial<{
      activeElement: HTMLElement | null
      onModified: () => void
      sessionId: string
    }>,
  ) {
    const activeElement = props?.activeElement ?? makeActiveElement()
    const onModified = props?.onModified ?? vi.fn()
    const result = render(
      createElement(BackgroundPanel, {
        activeElement,
        onModified,
        sessionId: 'sess-1',
        ...props,
      }),
    )
    return { ...result, activeElement, onModified }
  }

  it('7. Solid color mode — pick color → hex display updates', () => {
    const { container } = renderPanel()
    // Default mode is 'solid'.
    const colorInput = container.querySelector(
      'input[type="color"]',
    ) as HTMLInputElement
    expect(colorInput).toBeTruthy()

    fireEvent.change(colorInput, { target: { value: '#3b82f6' } })
    // Hex display span updates.
    expect(screen.getByText('#3b82f6')).toBeTruthy()
  })

  it('8. Gradient mode — toggle linear→radial → angle slider disappears', () => {
    renderPanel()
    // Switch to gradient mode.
    fireEvent.click(screen.getByText('Gradient'))

    // In linear mode, angle slider is present.
    expect(
      screen.queryByRole('slider', { name: 'Gradient angle' }),
    ).not.toBeNull()

    // Toggle to radial.
    fireEvent.click(screen.getByText('Radial'))

    // Radial has no angle slider.
    expect(screen.queryByRole('slider', { name: 'Gradient angle' })).toBeNull()
  })

  it('9. Gradient mode — change color stop 1 → preview swatch updates', () => {
    const { container, activeElement } = renderPanel()
    fireEvent.click(screen.getByText('Gradient'))

    // Two color inputs in gradient mode: color1, color2.
    const colorInputs = container.querySelectorAll('input[type="color"]')
    const color1Input = colorInputs[0] as HTMLInputElement
    expect(color1Input).toBeTruthy()

    fireEvent.change(color1Input, { target: { value: '#ff0000' } })

    // The active element's background-image (same source as preview swatch) reflects new color.
    // jsdom normalizes hex to rgb in CSS values.
    const bgImage = activeElement.style.getPropertyValue('background-image')
    expect(bgImage).toContain('rgb(255, 0, 0)')
  })

  it('10. Presets — click "Sunset" → gradient colors + angle set to preset values', () => {
    const { activeElement } = renderPanel()
    // Click the Sunset preset button.
    fireEvent.click(screen.getByLabelText('Sunset'))

    const bgImage = activeElement.style.getPropertyValue('background-image')
    // Sunset = linear-gradient(90deg, #ff7e5f 0%, #feb47b 100%)
    // jsdom normalizes hex to rgb in CSS values.
    expect(bgImage).toContain('rgb(255, 126, 95)')
    expect(bgImage).toContain('rgb(254, 180, 123)')
    expect(bgImage).toContain('90deg')
  })

  it('11. BG image — apply sets URL; remove clears it', async () => {
    searchStockImagesMock.mockResolvedValue([
      {
        imageUrl: 'https://stock.test/sunset.jpg',
        source: 'pexels',
        query: 'sunset',
      },
    ])
    const { activeElement, onModified } = renderPanel()

    // Search for images.
    const searchInput = screen.getByPlaceholderText('Search stock images...')
    fireEvent.change(searchInput, { target: { value: 'sunset' } })
    fireEvent.keyDown(searchInput, { key: 'Enter' })

    // Wait for results to appear.
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Select image 1' }),
      ).not.toBeNull()
    })

    // Click the first result → applyBgImage.
    fireEvent.click(screen.getByRole('button', { name: 'Select image 1' }))
    expect(activeElement.style.getPropertyValue('background-image')).toContain(
      'https://stock.test/sunset.jpg',
    )
    expect(onModified).toHaveBeenCalled()

    // Remove image.
    fireEvent.click(screen.getByRole('button', { name: 'Remove image' }))
    expect(activeElement.style.getPropertyValue('background-image')).toBe('')
    expect(onModified).toHaveBeenCalledTimes(2)
  })

  it('11b. Upload image — malformed storage JSON shows stable error without saving', async () => {
    globalThis.fetch = vi.fn(
      async () =>
        new Response('<!doctype html><h1>Gateway failure</h1>', {
          headers: { 'Content-Type': 'text/html' },
          status: 200,
        }),
    ) as unknown as typeof fetch
    const file = new File(['data'], 'background.png', { type: 'image/png' })
    const { container } = renderPanel()
    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement

    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => expect(screen.getByText(/upload failed/i)).toBeTruthy())
    expect(container.textContent).not.toMatch(
      /unexpected token|valid json|doctype|gateway failure/i,
    )
    expect(saveUserImageMock).not.toHaveBeenCalled()
  })

  it('12. Backdrop blur — slider 0→50 → value updates', () => {
    const { activeElement } = renderPanel()
    const blurSlider = screen.getByRole('slider', {
      name: 'Backdrop blur',
    }) as HTMLInputElement
    expect(blurSlider).toBeTruthy()

    // Change from 0 to 50.
    fireEvent.change(blurSlider, { target: { value: '50' } })
    expect(activeElement.style.getPropertyValue('backdrop-filter')).toContain(
      'blur(50px)',
    )
    // Display value updates.
    expect(screen.getByText('50px')).toBeTruthy()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// EffectsPanel
// ═══════════════════════════════════════════════════════════════════════════════
describe('EffectsPanel (edge cases)', () => {
  function renderPanel(
    props?: Partial<{
      activeElement: HTMLElement | null
      onModified: () => void
    }>,
  ) {
    const activeElement = props?.activeElement ?? makeActiveElement()
    const onModified = props?.onModified ?? vi.fn()
    const result = render(
      createElement(EffectsPanel, { activeElement, onModified, ...props }),
    )
    return { ...result, activeElement, onModified }
  }

  it('13. Opacity slider 50% → value displays "50"', () => {
    const { activeElement } = renderPanel()
    const opacitySlider = screen.getByRole('slider', {
      name: 'Opacity',
    }) as HTMLInputElement
    expect(opacitySlider).toBeTruthy()

    fireEvent.change(opacitySlider, { target: { value: '50' } })
    // Display shows "50%".
    expect(screen.getByText('50%')).toBeTruthy()
    // Applied style is 0.5.
    expect(activeElement.style.getPropertyValue('opacity')).toBe('0.5')
  })

  it('14. Filters — blur 5px + brightness 150% stored; reset → cleared', () => {
    const { activeElement } = renderPanel()

    // Set blur to 5.
    const blurSlider = screen.getByRole('slider', {
      name: 'Blur',
    }) as HTMLInputElement
    fireEvent.change(blurSlider, { target: { value: '5' } })

    // Set brightness to 150.
    const brightnessSlider = screen.getByRole('slider', {
      name: 'Brightness',
    }) as HTMLInputElement
    fireEvent.change(brightnessSlider, { target: { value: '150' } })

    // Both stored in the applied filter string.
    const filterVal = activeElement.style.getPropertyValue('filter')
    expect(filterVal).toContain('blur(5px)')
    expect(filterVal).toContain('brightness(150%)')

    // Reset filters.
    fireEvent.click(screen.getByLabelText('Reset filters'))
    expect(activeElement.style.getPropertyValue('filter')).toBe('none')
  })

  it('15. Transform — rotate 90deg + scale 1.5 stored; reset → cleared', () => {
    const { activeElement } = renderPanel()

    const rotateSlider = screen.getByRole('slider', {
      name: 'Rotate',
    }) as HTMLInputElement
    fireEvent.change(rotateSlider, { target: { value: '90' } })

    const scaleSlider = screen.getByRole('slider', {
      name: 'Scale',
    }) as HTMLInputElement
    fireEvent.change(scaleSlider, { target: { value: '1.5' } })

    const transformVal = activeElement.style.getPropertyValue('transform')
    expect(transformVal).toContain('rotate(90deg)')
    expect(transformVal).toContain('scale(1.5)')

    // Reset transform.
    fireEvent.click(screen.getByLabelText('Reset transform'))
    expect(activeElement.style.getPropertyValue('transform')).toBe('none')
  })

  it('16. Transitions — duration 500ms + easing "ease-in" stored; reset → cleared', () => {
    const { container, activeElement } = renderPanel()

    const durationSlider = screen.getByRole('slider', {
      name: 'Duration',
    }) as HTMLInputElement
    fireEvent.change(durationSlider, { target: { value: '500' } })

    // Change easing to ease-in via the Select.
    const easingSelect = findSelectByOptionValue(container, 'ease-in')!
    expect(easingSelect).toBeTruthy()
    fireEvent.change(easingSelect, { target: { value: 'ease-in' } })

    const transitionVal = activeElement.style.getPropertyValue('transition')
    expect(transitionVal).toContain('500ms')
    expect(transitionVal).toContain('ease-in')

    // Reset transition.
    fireEvent.click(screen.getByLabelText('Reset transition'))
    expect(activeElement.style.getPropertyValue('transition')).toBe('none')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// LayoutPanel
// ═══════════════════════════════════════════════════════════════════════════════
describe('LayoutPanel (edge cases)', () => {
  function renderPanel(
    props?: Partial<{
      activeElement: HTMLElement | null
      onModified: () => void
    }>,
  ) {
    const activeElement = props?.activeElement ?? makeActiveElement()
    const onModified = props?.onModified ?? vi.fn()
    const result = render(
      createElement(LayoutPanel, { activeElement, onModified, ...props }),
    )
    return { ...result, activeElement, onModified }
  }

  it('17. Display Block→Flex → flex controls appear (direction, justify, align, gap, wrap)', () => {
    renderPanel()
    // Initially block — no flex controls.
    expect(screen.queryByText('Direction')).toBeNull()

    // Switch to Flex.
    fireEvent.click(screen.getByText('Flex'))

    // All flex controls appear.
    expect(screen.queryByText('Direction')).not.toBeNull()
    expect(screen.queryByText('Justify')).not.toBeNull()
    expect(screen.queryByText('Align')).not.toBeNull()
    expect(screen.queryByText('Gap')).not.toBeNull()
    // "Wrap" appears as both a label <span> and a toggle <button> — verify at least one exists.
    expect(screen.queryAllByText('Wrap').length).toBeGreaterThanOrEqual(2)
  })

  it('18. Flex direction Row→Column → value updates', () => {
    const { activeElement } = renderPanel()
    fireEvent.click(screen.getByText('Flex'))

    // Click "Column" direction toggle (aria-label).
    fireEvent.click(screen.getByLabelText('Column'))
    expect(activeElement.style.getPropertyValue('flex-direction')).toBe(
      'column',
    )
  })

  it('19. Justify start→space-between → value updates', () => {
    const { activeElement } = renderPanel()
    fireEvent.click(screen.getByText('Flex'))

    fireEvent.click(screen.getByText('Between'))
    expect(activeElement.style.getPropertyValue('justify-content')).toBe(
      'space-between',
    )
  })

  it('20. Gap 16 + unit rem → value+unit stored', () => {
    const { container, activeElement } = renderPanel()
    fireEvent.click(screen.getByText('Flex'))

    // Change gap unit to rem first.
    const gapSelect = findSelectByOptionValue(container, 'rem')!
    expect(gapSelect).toBeTruthy()
    fireEvent.change(gapSelect, { target: { value: 'rem' } })

    // Type 16 in the gap input.
    const gapInput = container.querySelector(
      'input[type="number"]',
    ) as HTMLInputElement
    expect(gapInput).toBeTruthy()
    fireEvent.change(gapInput, { target: { value: '16' } })

    // Applied style uses value + unit.
    expect(activeElement.style.getPropertyValue('gap')).toBe('16rem')
  })

  it('21. Flex wrap No Wrap→Wrap → toggle state changes', () => {
    const { activeElement } = renderPanel()
    fireEvent.click(screen.getByText('Flex'))

    // Click the "Wrap" toggle button (not the "Wrap" label span).
    fireEvent.click(screen.getByRole('button', { name: 'Wrap' }))
    expect(activeElement.style.getPropertyValue('flex-wrap')).toBe('wrap')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// TypographyControlsPanel
// ═══════════════════════════════════════════════════════════════════════════════
describe('TypographyControlsPanel (edge cases)', () => {
  function renderPanel(
    props?: Partial<{
      activeElement: HTMLElement | null
      onModified: () => void
    }>,
  ) {
    const activeElement = props?.activeElement ?? makeActiveElement()
    const onModified = props?.onModified ?? vi.fn()
    const result = render(
      createElement(TypographyControlsPanel, {
        activeElement,
        onModified,
        ...props,
      }),
    )
    return { ...result, activeElement, onModified }
  }

  it('22. Font family select → choose "Inter" → value updates', () => {
    const { container, activeElement } = renderPanel()
    const fontSelect = findSelectByOptionValue(container, 'Inter, sans-serif')!
    expect(fontSelect).toBeTruthy()

    fireEvent.change(fontSelect, { target: { value: 'Inter, sans-serif' } })
    expect(activeElement.style.getPropertyValue('font-family')).toBe(
      'Inter, sans-serif',
    )
  })

  it('23. Font weight select → choose "700" → value updates', () => {
    const { container, activeElement } = renderPanel()
    const weightSelect = findSelectByOptionValue(container, '700')!
    expect(weightSelect).toBeTruthy()

    fireEvent.change(weightSelect, { target: { value: '700' } })
    expect(activeElement.style.getPropertyValue('font-weight')).toBe('700')
  })

  it('24. Line height — toggle Auto → input disabled; toggle off → enabled, type "1.5"', () => {
    const { activeElement } = renderPanel()
    const lineHeightInput = screen.getByPlaceholderText(
      'normal',
    ) as HTMLInputElement
    expect(lineHeightInput).toBeTruthy()

    // Ensure we start in non-auto mode (input enabled).
    // If jsdom returns "normal" for computed line-height, lineHeightNormal starts true.
    if (lineHeightInput.disabled) {
      fireEvent.click(screen.getByText('Auto'))
    }
    expect(lineHeightInput.disabled).toBe(false)

    // Toggle Auto → input disabled.
    fireEvent.click(screen.getByText('Auto'))
    expect(lineHeightInput.disabled).toBe(true)

    // Toggle off → input enabled.
    fireEvent.click(screen.getByText('Auto'))
    expect(lineHeightInput.disabled).toBe(false)

    // Type "1.5".
    fireEvent.change(lineHeightInput, { target: { value: '1.5' } })
    expect(lineHeightInput.value).toBe('1.5')
    expect(activeElement.style.getPropertyValue('line-height')).toBe('1.5')
  })

  it('25. Text transform — None→Upper → value updates', () => {
    const { activeElement } = renderPanel()
    fireEvent.click(screen.getByText('Upper'))
    expect(activeElement.style.getPropertyValue('text-transform')).toBe(
      'uppercase',
    )
  })
})
