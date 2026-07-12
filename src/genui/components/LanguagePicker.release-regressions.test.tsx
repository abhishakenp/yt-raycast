// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const customLanguages = vi.hoisted<Array<unknown>>(() => [])

vi.mock('convex/react', () => ({
  useAction: () => vi.fn(),
  useQuery: () => customLanguages,
}))

vi.mock('../../../convex/_generated/api', () => ({
  api: {
    customLanguages: {
      list: 'customLanguages.list',
      resolveOrCreate: 'customLanguages.resolveOrCreate',
    },
  },
}))

import LanguagePicker from './LanguagePicker'

const openPicker = async () => {
  const trigger = screen.getByRole('button', { name: 'Choose language' })
  fireEvent.pointerDown(trigger)
  fireEvent.pointerUp(trigger)
  fireEvent.click(trigger)
  await waitFor(() => {
    expect(screen.getByPlaceholderText('Search languages…')).toBeTruthy()
  })
}

describe('LanguagePicker release regressions', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn()
    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserver {
        disconnect() {}
        observe() {}
        unobserve() {}
      },
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('offers English as the selected option when the persisted locale is en', async () => {
    render(
      <LanguagePicker
        value="en"
        onSelect={vi.fn()}
        trigger={<button type="button">Choose language</button>}
      />,
    )
    await openPicker()

    const englishOption = screen
      .queryByText('English')
      ?.closest('[role="option"]')
    expect(englishOption).toBeTruthy()
    expect(englishOption?.getAttribute('aria-selected')).toBe('true')
  })

  it('does not expose Hinglish as selected when the persisted locale is en', async () => {
    render(
      <LanguagePicker
        value="en"
        onSelect={vi.fn()}
        trigger={<button type="button">Choose language</button>}
      />,
    )
    await openPicker()

    const hinglishOption = screen
      .getByText('Hinglish')
      .closest('[role="option"]')
    expect(hinglishOption?.getAttribute('aria-selected')).toBe('false')
  })
})
