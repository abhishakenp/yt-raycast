// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import LanguagePicker from './LanguagePicker'

// jsdom lacks ResizeObserver / IntersectionObserver — provide stubs so Radix
// Popover + ScrollArea mount cleanly.
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
if (
  typeof Element !== 'undefined' &&
  typeof Element.prototype.scrollIntoView !== 'function'
) {
  Element.prototype.scrollIntoView = function scrollIntoView() {}
}

// --- Convex mocks -----------------------------------------------------------
// The picker subscribes to custom languages from the DB and calls an AI action
// to resolve unknown languages. Both are mocked so tests stay deterministic.
const convexState = vi.hoisted(() => ({
  customLanguages: [] as Array<{
    code: string
    name: string
    nativeName: string
    fontFamily: string
    keywords: string[]
  }>,
  resolveImpl: null as
    | null
    | ((args: { languageInput: string }) => Promise<any>),
  resolveCalls: [] as Array<{ languageInput: string }>,
}))

vi.mock('convex/react', () => ({
  useQuery: vi.fn(() => convexState.customLanguages),
  useAction: vi.fn(() => async (args: { languageInput: string }) => {
    convexState.resolveCalls.push(args)
    if (convexState.resolveImpl) return convexState.resolveImpl(args)
    return {
      code: 'klingon',
      name: 'Klingon',
      nativeName: 'tlhIngan Hol',
      fontFamily: 'Inter, system-ui, sans-serif',
      keywords: ['klingon'],
    }
  }),
}))

vi.mock('../../../convex/_generated/api', () => ({
  api: {
    customLanguages: {
      list: 'customLanguages.list',
      resolveOrCreate: 'customLanguages.resolveOrCreate',
    },
  },
}))

async function openPicker(trigger: HTMLElement) {
  // Radix Popover opens on pointerdown; fire both pointer + click for jsdom.
  fireEvent.pointerDown(trigger)
  fireEvent.pointerUp(trigger)
  fireEvent.click(trigger)
  await waitFor(() => {
    expect(screen.getByPlaceholderText('Search languages…')).toBeTruthy()
  })
  return screen.getByPlaceholderText('Search languages…')
}

describe('LanguagePicker — search behavior', () => {
  afterEach(() => cleanup())

  it('filters languages by English name (typing "hindi" shows the Hindi option)', async () => {
    const onSelect = vi.fn()
    render(
      <LanguagePicker
        value={null}
        onSelect={onSelect}
        trigger={<button type="button">Pick language</button>}
      />,
    )

    const input = await openPicker(screen.getByText('Pick language'))
    fireEvent.change(input, { target: { value: 'hindi' } })

    // The Hindi option should be visible (its English name is "Hindi").
    await waitFor(() => {
      expect(screen.getByText('Hindi')).toBeTruthy()
    })
    // And it should NOT show the empty state.
    expect(screen.queryByText('No language found.')).toBeNull()
  })

  it('filters languages by native name (typing "हिंदी" shows the Hindi option)', async () => {
    const onSelect = vi.fn()
    render(
      <LanguagePicker
        value={null}
        onSelect={onSelect}
        trigger={<button type="button">Pick language</button>}
      />,
    )

    const input = await openPicker(screen.getByText('Pick language'))
    fireEvent.change(input, { target: { value: 'हिंदी' } })

    await waitFor(() => {
      expect(screen.getByText('Hindi')).toBeTruthy()
    })
    expect(screen.queryByText('No language found.')).toBeNull()
  })

  it('filters languages by keyword (typing "tanglish" shows the Tamil option)', async () => {
    const onSelect = vi.fn()
    render(
      <LanguagePicker
        value={null}
        onSelect={onSelect}
        trigger={<button type="button">Pick language</button>}
      />,
    )

    const input = await openPicker(screen.getByText('Pick language'))
    fireEvent.change(input, { target: { value: 'tanglish' } })

    // "tanglish" is a keyword on the Tamil+English entry (ta-en), whose name
    // is "Tamil+English". It should appear; the empty state should not.
    await waitFor(() => {
      expect(screen.getByText('Tamil+English')).toBeTruthy()
    })
    expect(screen.queryByText('No language found.')).toBeNull()
  })

  it('shows the empty state for a query that matches no language', async () => {
    const onSelect = vi.fn()
    render(
      <LanguagePicker
        value={null}
        onSelect={onSelect}
        trigger={<button type="button">Pick language</button>}
      />,
    )

    const input = await openPicker(screen.getByText('Pick language'))
    fireEvent.change(input, { target: { value: 'zzz-no-such-lang' } })

    await waitFor(() => {
      expect(screen.getByText('No language found.')).toBeTruthy()
    })
  })

  it('includes custom languages from the DB in the searchable list', async () => {
    convexState.customLanguages = [
      {
        code: 'klingon',
        name: 'Klingon',
        nativeName: 'tlhIngan Hol',
        fontFamily: 'Inter, system-ui, sans-serif',
        keywords: ['klingon'],
      },
    ]
    try {
      const onSelect = vi.fn()
      render(
        <LanguagePicker
          value={null}
          onSelect={onSelect}
          trigger={<button type="button">Pick language</button>}
        />,
      )

      const input = await openPicker(screen.getByText('Pick language'))
      fireEvent.change(input, { target: { value: 'klingon' } })

      await waitFor(() => {
        expect(screen.getByText('Klingon')).toBeTruthy()
      })
      expect(screen.queryByText('No language found.')).toBeNull()
    } finally {
      convexState.customLanguages = []
    }
  })

  it('dedupes stale custom rows by language name and keeps the native-script entry', async () => {
    convexState.customLanguages = [
      {
        code: 'chinese',
        name: 'Chinese',
        nativeName: 'chinese',
        fontFamily: 'Inter, system-ui, sans-serif',
        keywords: ['chinese'],
      },
      {
        code: 'zh',
        name: 'Chinese',
        nativeName: '中文',
        fontFamily: 'Noto Sans SC, sans-serif',
        keywords: ['chinese', 'mandarin'],
      },
    ]
    try {
      const onSelect = vi.fn()
      render(
        <LanguagePicker
          value={null}
          onSelect={onSelect}
          trigger={<button type="button">Pick language</button>}
        />,
      )

      const input = await openPicker(screen.getByText('Pick language'))
      fireEvent.change(input, { target: { value: 'chinese' } })

      await waitFor(() => {
        expect(screen.getByText('中文')).toBeTruthy()
      })
      expect(screen.getAllByText('Chinese')).toHaveLength(1)
      expect(screen.queryByText('chinese')).toBeNull()

      const chineseItem = screen
        .getByText('Chinese')
        .closest('[role="option"]')!
      fireEvent.pointerUp(chineseItem)
      fireEvent.click(chineseItem)

      await waitFor(() => {
        expect(onSelect).toHaveBeenCalledWith('zh')
      })
    } finally {
      convexState.customLanguages = []
    }
  })

  it('repairs a real stale browser-native custom row before showing it in search results', async () => {
    ;(globalThis as Record<string, unknown>).Translator = {
      availability: vi.fn(async ({ targetLanguage }) =>
        targetLanguage === 'zh' ? 'available' : 'unavailable',
      ),
      create: vi.fn(),
    }
    convexState.customLanguages = [
      {
        code: 'chinese',
        name: 'Chinese',
        nativeName: 'Chinese',
        fontFamily: 'Noto Sans CJK SC, sans-serif',
        keywords: ['chinese', 'chinese'],
      },
    ]
    try {
      const onSelect = vi.fn()
      render(
        <LanguagePicker
          value={null}
          onSelect={onSelect}
          trigger={<button type="button">Pick language</button>}
        />,
      )

      const input = await openPicker(screen.getByText('Pick language'))
      fireEvent.change(input, { target: { value: 'chinese' } })

      const nativeName = await screen.findByText('中文')
      expect((nativeName as HTMLElement).style.fontFamily).toContain(
        'Noto Sans SC',
      )
      expect(screen.getAllByText('Chinese')).toHaveLength(1)

      const chineseItem = screen
        .getByText('Chinese')
        .closest('[role="option"]')!
      fireEvent.pointerUp(chineseItem)
      fireEvent.click(chineseItem)

      await waitFor(() => {
        expect(onSelect).toHaveBeenCalledWith('zh')
      })
    } finally {
      convexState.customLanguages = []
      delete (globalThis as Record<string, unknown>).Translator
    }
  })

  it('repairs the live stale Lithuanian custom row before rendering the search result', async () => {
    ;(globalThis as Record<string, unknown>).Translator = {
      availability: vi.fn(async ({ targetLanguage }) =>
        targetLanguage === 'lt' ? 'available' : 'unavailable',
      ),
      create: vi.fn(),
    }
    convexState.customLanguages = [
      {
        code: 'lt',
        name: 'Lithuanian',
        nativeName: 'Lithuanian',
        fontFamily: 'Inter, system-ui, sans-serif',
        keywords: ['lithuanian', 'lithuanian', 'lt'],
      },
    ]
    try {
      const onSelect = vi.fn()
      render(
        <LanguagePicker
          value={null}
          onSelect={onSelect}
          trigger={<button type="button">Pick language</button>}
        />,
      )

      const input = await openPicker(screen.getByText('Pick language'))
      fireEvent.change(input, { target: { value: 'Lithuanian' } })

      const nativeName = await screen.findByText(/lietu/i)
      expect((nativeName as HTMLElement).style.fontFamily).toContain(
        'Inter, system-ui, sans-serif',
      )
      expect(screen.getAllByText('Lithuanian')).toHaveLength(1)

      const lithuanianItem = screen
        .getByText('Lithuanian')
        .closest('[role="option"]')!
      fireEvent.pointerUp(lithuanianItem)
      fireEvent.click(lithuanianItem)

      await waitFor(() => {
        expect(onSelect).toHaveBeenCalledWith('lt')
      })
    } finally {
      convexState.customLanguages = []
      delete (globalThis as Record<string, unknown>).Translator
    }
  })

  it('shows browser-native Mexican Spanish instead of the live stale Nahuatl row in search results', async () => {
    ;(globalThis as Record<string, unknown>).Translator = {
      availability: vi.fn(async ({ targetLanguage }) =>
        targetLanguage === 'es-MX' ? 'available' : 'unavailable',
      ),
      create: vi.fn(),
    }
    convexState.customLanguages = [
      {
        code: 'nahuatl',
        name: 'Nahuatl',
        nativeName: 'Nāhuatl',
        fontFamily: 'Inter, system-ui, sans-serif',
        keywords: ['mexican', 'nahuatl'],
      },
    ]
    try {
      const onSelect = vi.fn()
      render(
        <LanguagePicker
          value={null}
          onSelect={onSelect}
          trigger={<button type="button">Pick language</button>}
        />,
      )

      const input = await openPicker(screen.getByText('Pick language'))
      fireEvent.change(input, { target: { value: 'mexican' } })

      expect(await screen.findByText('Mexican Spanish')).toBeTruthy()
      expect(screen.getByText('español de México')).toBeTruthy()
      expect(screen.queryByText('Nahuatl')).toBeNull()
      expect(screen.queryByText('Nāhuatl')).toBeNull()

      const mexicanItem = screen
        .getByText('Mexican Spanish')
        .closest('[role="option"]')!
      fireEvent.pointerUp(mexicanItem)
      fireEvent.click(mexicanItem)

      await waitFor(() => {
        expect(onSelect).toHaveBeenCalledWith('es-MX')
      })
    } finally {
      convexState.customLanguages = []
      delete (globalThis as Record<string, unknown>).Translator
    }
  })

  it('renders custom native names with the stored script font', async () => {
    convexState.customLanguages = [
      {
        code: 'ja',
        name: 'Japanese',
        nativeName: '日本語',
        fontFamily: 'Noto Sans JP, sans-serif',
        keywords: ['japanese'],
      },
    ]
    try {
      render(
        <LanguagePicker
          value={null}
          onSelect={() => {}}
          trigger={<button type="button">Pick language</button>}
        />,
      )

      const input = await openPicker(screen.getByText('Pick language'))
      fireEvent.change(input, { target: { value: 'japanese' } })

      const nativeName = await screen.findByText('日本語')
      expect((nativeName as HTMLElement).style.fontFamily).toContain(
        'Noto Sans JP',
      )
    } finally {
      convexState.customLanguages = []
    }
  })
})

describe('LanguagePicker — selection behavior', () => {
  afterEach(() => cleanup())

  it('calls onSelect with the language code (not the search value) when an item is chosen', async () => {
    const onSelect = vi.fn()
    render(
      <LanguagePicker
        value={null}
        onSelect={onSelect}
        trigger={<button type="button">Pick language</button>}
      />,
    )

    const input = await openPicker(screen.getByText('Pick language'))
    fireEvent.change(input, { target: { value: 'hindi' } })

    await waitFor(() => {
      expect(screen.getByText('Hindi')).toBeTruthy()
    })

    // Click the Hindi option. cmdk fires onSelect on pointerup/click.
    const hindiItem = screen.getByText('Hindi').closest('[role="option"]')!
    fireEvent.pointerUp(hindiItem)
    fireEvent.click(hindiItem)

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith('hi')
    })
  })

  it('marks the currently-selected language with a visible Check', async () => {
    render(
      <LanguagePicker
        value="hi"
        onSelect={() => {}}
        trigger={<button type="button">Pick language</button>}
      />,
    )

    await openPicker(screen.getByText('Pick language'))

    // The Hindi option should be present and its Check icon should be visible.
    // cmdk renders all items; the Check opacity is driven by `value === entry.code`.
    const hindiItem = screen.getByText('Hindi').closest('[role="option"]')!
    const check = hindiItem.querySelector('svg.lucide-check')
    expect(check).toBeTruthy()
    // The Check uses opacity-100 when selected (opacity-0 otherwise). Use
    // getAttribute('class') — SVG className is SVGAnimatedString in jsdom.
    const checkClass = check?.getAttribute('class') ?? ''
    expect(checkClass).toContain('opacity-100')
    expect(checkClass).not.toContain('opacity-0')
  })

  it('does not show a visible Check on a non-selected language', async () => {
    render(
      <LanguagePicker
        value="hi"
        onSelect={() => {}}
        trigger={<button type="button">Pick language</button>}
      />,
    )

    await openPicker(screen.getByText('Pick language'))

    // Tamil is NOT the selected language (value="hi"), so its Check should be hidden.
    const tamilItem = screen.getByText('Tamil').closest('[role="option"]')!
    const check = tamilItem.querySelector('svg.lucide-check')
    expect(check).toBeTruthy()
    const checkClass = check?.getAttribute('class') ?? ''
    expect(checkClass).toContain('opacity-0')
    expect(checkClass).not.toContain('opacity-100')
  })
})

describe('LanguagePicker — custom language submission', () => {
  beforeEach(() => {
    convexState.resolveCalls = []
    convexState.resolveImpl = null
    convexState.customLanguages = []
  })
  afterEach(() => cleanup())

  it('selects an existing known language by name without calling the AI action', async () => {
    const onSelect = vi.fn()
    render(
      <LanguagePicker
        value={null}
        onSelect={onSelect}
        trigger={<button type="button">Pick language</button>}
      />,
    )

    await openPicker(screen.getByText('Pick language'))

    const customInput = screen.getByPlaceholderText('Custom language…')
    // "Sanskrit" is a known language (code 'sa'); it should resolve locally.
    fireEvent.change(customInput, { target: { value: 'Sanskrit' } })
    const form = customInput.closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith('sa')
    })
    // The AI action must NOT have been invoked.
    expect(convexState.resolveCalls).toHaveLength(0)
  })

  it('selects Lithuanian as browser-native code lt without calling the AI action', async () => {
    ;(globalThis as Record<string, unknown>).Translator = {
      availability: vi.fn(async ({ targetLanguage }) =>
        targetLanguage === 'lt' ? 'available' : 'unavailable',
      ),
      create: vi.fn(),
    }
    const onSelect = vi.fn()
    render(
      <LanguagePicker
        value={null}
        onSelect={onSelect}
        trigger={<button type="button">Pick language</button>}
      />,
    )

    await openPicker(screen.getByText('Pick language'))

    const customInput = screen.getByPlaceholderText('Custom language…')
    fireEvent.change(customInput, { target: { value: 'Lithuanian' } })
    const form = customInput.closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith('lt')
    })
    expect(convexState.resolveCalls).toHaveLength(0)
  })

  it('selects Mexican Spanish as browser-native es-MX without calling the AI action', async () => {
    ;(globalThis as Record<string, unknown>).Translator = {
      availability: vi.fn(async ({ targetLanguage }) =>
        targetLanguage === 'es-MX' ? 'available' : 'unavailable',
      ),
      create: vi.fn(),
    }
    const onSelect = vi.fn()
    render(
      <LanguagePicker
        value={null}
        onSelect={onSelect}
        trigger={<button type="button">Pick language</button>}
      />,
    )

    await openPicker(screen.getByText('Pick language'))

    const customInput = screen.getByPlaceholderText('Custom language…')
    fireEvent.change(customInput, { target: { value: 'Mexican' } })
    const form = customInput.closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith('es-MX')
    })
    expect(convexState.resolveCalls).toHaveLength(0)
  })

  it('prefers browser-native Mexican Spanish over the live stale Nahuatl custom row', async () => {
    ;(globalThis as Record<string, unknown>).Translator = {
      availability: vi.fn(async ({ targetLanguage }) =>
        targetLanguage === 'es-MX' ? 'available' : 'unavailable',
      ),
      create: vi.fn(),
    }
    convexState.customLanguages = [
      {
        code: 'nahuatl',
        name: 'Nahuatl',
        nativeName: 'Nāhuatl',
        fontFamily: 'Inter, system-ui, sans-serif',
        keywords: ['mexican', 'nahuatl'],
      },
    ]
    try {
      const onSelect = vi.fn()
      render(
        <LanguagePicker
          value={null}
          onSelect={onSelect}
          trigger={<button type="button">Pick language</button>}
        />,
      )

      await openPicker(screen.getByText('Pick language'))

      const customInput = screen.getByPlaceholderText('Custom language…')
      fireEvent.change(customInput, { target: { value: 'Mexican' } })
      const form = customInput.closest('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(onSelect).toHaveBeenCalledWith('es-MX')
      })
      expect(onSelect).not.toHaveBeenCalledWith('nahuatl')
      expect(convexState.resolveCalls).toHaveLength(0)
    } finally {
      convexState.customLanguages = []
      delete (globalThis as Record<string, unknown>).Translator
    }
  })

  it('selects an existing known language by native script without calling the AI action', async () => {
    const onSelect = vi.fn()
    render(
      <LanguagePicker
        value={null}
        onSelect={onSelect}
        trigger={<button type="button">Pick language</button>}
      />,
    )

    await openPicker(screen.getByText('Pick language'))

    const customInput = screen.getByPlaceholderText('Custom language…')
    // "नेपाली" is the nativeName of Nepali (code 'ne').
    fireEvent.change(customInput, { target: { value: 'नेपाली' } })
    const form = customInput.closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith('ne')
    })
    expect(convexState.resolveCalls).toHaveLength(0)
  })

  it('selects an existing custom language (from DB) without calling the AI action', async () => {
    convexState.customLanguages = [
      {
        code: 'klingon',
        name: 'Klingon',
        nativeName: 'tlhIngan Hol',
        fontFamily: 'Inter, system-ui, sans-serif',
        keywords: ['klingon'],
      },
    ]
    const onSelect = vi.fn()
    render(
      <LanguagePicker
        value={null}
        onSelect={onSelect}
        trigger={<button type="button">Pick language</button>}
      />,
    )

    await openPicker(screen.getByText('Pick language'))

    const customInput = screen.getByPlaceholderText('Custom language…')
    fireEvent.change(customInput, { target: { value: 'Klingon' } })
    const form = customInput.closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith('klingon')
    })
    expect(convexState.resolveCalls).toHaveLength(0)
  })

  it('calls the AI action for an unknown language and selects the returned code', async () => {
    const onSelect = vi.fn()
    convexState.resolveImpl = async (args) => ({
      code: 'dothraki',
      name: 'Dothraki',
      nativeName: 'Dothraki',
      fontFamily: 'Inter, system-ui, sans-serif',
      keywords: [args.languageInput.toLowerCase()],
    })
    render(
      <LanguagePicker
        value={null}
        onSelect={onSelect}
        trigger={<button type="button">Pick language</button>}
      />,
    )

    await openPicker(screen.getByText('Pick language'))

    const customInput = screen.getByPlaceholderText('Custom language…')
    fireEvent.change(customInput, { target: { value: '  Dothraki  ' } })
    const form = customInput.closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith('dothraki')
    })
    // The action receives the trimmed input.
    expect(convexState.resolveCalls).toEqual([{ languageInput: 'Dothraki' }])
  })

  it('shows a loader and disables the plus button while the AI is resolving', async () => {
    let resolveFn: (() => void) | null = null
    convexState.resolveImpl = () =>
      new Promise((resolve) => {
        resolveFn = () =>
          resolve({
            code: 'elvish',
            name: 'Elvish',
            nativeName: 'Quenya',
            fontFamily: 'Inter, system-ui, sans-serif',
            keywords: ['elvish'],
          })
      })
    const onSelect = vi.fn()
    render(
      <LanguagePicker
        value={null}
        onSelect={onSelect}
        trigger={<button type="button">Pick language</button>}
      />,
    )

    await openPicker(screen.getByText('Pick language'))

    const customInput = screen.getByPlaceholderText('Custom language…')
    fireEvent.change(customInput, { target: { value: 'Elvish' } })
    const form = customInput.closest('form')!
    fireEvent.submit(form)

    // While resolving: the plus button is disabled and shows a spinner.
    await waitFor(() => {
      const addBtn = screen.getByLabelText('Add custom language')
      expect(addBtn.hasAttribute('disabled')).toBe(true)
      // Loader2 renders a spinner with the `animate-spin` class (lucide aliases
      // Loader2 → loader-circle, so the lucide class name is version-dependent).
      expect(addBtn.querySelector('svg.animate-spin')).toBeTruthy()
    })
    // The input is also disabled while resolving.
    expect(customInput.hasAttribute('disabled')).toBe(true)

    // Complete the action.
    resolveFn!()
    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith('elvish')
    })

    // After resolving: the button is re-enabled and shows the Plus icon again.
    const addBtn = screen.getByLabelText('Add custom language')
    expect(addBtn.hasAttribute('disabled')).toBe(false)
    expect(addBtn.querySelector('svg.lucide-plus')).toBeTruthy()
  })

  it('shows an error message when the AI action rejects', async () => {
    convexState.resolveImpl = async () => {
      throw new Error('GROQ_API_KEY is not configured.')
    }
    const onSelect = vi.fn()
    render(
      <LanguagePicker
        value={null}
        onSelect={onSelect}
        trigger={<button type="button">Pick language</button>}
      />,
    )

    await openPicker(screen.getByText('Pick language'))

    const customInput = screen.getByPlaceholderText('Custom language…')
    fireEvent.change(customInput, { target: { value: 'Volapük' } })
    const form = customInput.closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText('GROQ_API_KEY is not configured.')).toBeTruthy()
    })
    // onSelect must not fire on failure.
    expect(onSelect).not.toHaveBeenCalled()
    // The button returns to the Plus icon (no longer loading).
    const addBtn = screen.getByLabelText('Add custom language')
    expect(addBtn.hasAttribute('disabled')).toBe(false)
  })

  it('does not call onSelect when the custom language input is empty/whitespace', async () => {
    const onSelect = vi.fn()
    render(
      <LanguagePicker
        value={null}
        onSelect={onSelect}
        trigger={<button type="button">Pick language</button>}
      />,
    )

    await openPicker(screen.getByText('Pick language'))

    const customInput = screen.getByPlaceholderText('Custom language…')
    fireEvent.change(customInput, { target: { value: '   ' } })
    const form = customInput.closest('form')!
    fireEvent.submit(form)

    // Give any pending state a chance to flush, then assert no call.
    await waitFor(() => {
      expect(onSelect).not.toHaveBeenCalled()
    })
    expect(convexState.resolveCalls).toHaveLength(0)
  })
})
