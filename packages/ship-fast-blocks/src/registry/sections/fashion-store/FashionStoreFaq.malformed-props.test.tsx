// @vitest-environment jsdom

/**
 * Regression test for the quiet-ridge lakebed deployment crash (2026-07-05).
 *
 * The LLM generated FAQ items with {question, answer} (singular string) instead
 * of the block's schema {q, a} (array of strings). In the lakebed export path,
 * defineCapsule (and thus sanitizeProps) is stripped, so the raw component
 * received {question, answer} and crashed on `item.a.map(...)` because `a` was
 * undefined. This test renders FashionStoreFaq with the exact malformed props
 * from that session and asserts no crash + content renders.
 *
 * The lakebed export path (without sanitizeProps) is covered by the companion
 * test in openui-lakebed-export-builder.test.ts. This file covers the
 * defineCapsule-wrapped path (dev/preview/SSR).
 */

import { cleanup, render, screen } from '@testing-library/react'
import type { ComponentRenderProps } from '@openuidev/react-lang'
import type { ReactElement } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FashionStoreFaq } from './FashionStoreFaq.tsx'

const navigate = vi.fn()

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => navigate,
}))

vi.mock('@ship-fast/lakebed/react', () => ({
  createLakebedClient: () => ({
    useAuth: () => ({
      isAuthenticated: false,
      isGuest: true,
      isLoading: false,
      user: null,
    }),
    useMutation: () =>
      Object.assign(vi.fn().mockResolvedValue(null), {
        isPending: false,
        lastError: null,
        pendingCount: 0,
        reset: vi.fn(),
      }),
    useQuery: () => undefined,
  }),
}))

const renderCapsule = <P,>(
  component: (props: ComponentRenderProps<P>) => ReactElement,
  props: P,
) => {
  const Component = component
  return render(<Component props={props} statementId="faq-malformed-test" />)
}

afterEach(() => {
  cleanup()
})

describe('FashionStoreFaq malformed LLM props', () => {
  it('renders without crashing when LLM emits {question, answer} instead of {q, a}', () => {
    // Exact shape from the crashed session k57f7j6b41razt4ta9jg1vwrqh89y5x2.
    // In the defineCapsule-wrapped path, sanitizeProps drops the malformed
    // items (they don't match {q, a} schema) and the component falls back to
    // its rich defaults. The key assertion is NO CRASH.
    renderCapsule(FashionStoreFaq.client.component, {
      eyebrow: 'Questions',
      heading: 'Common Inquiries',
      items: [
        {
          question: 'How long does coffee stay fresh?',
          answer: 'Properly stored, 6 months.',
        },
        {
          question: 'What is the difference between roasts?',
          answer: 'Roasting time and temperature affect flavor and aroma.',
        },
        {
          question: 'Where are allergen info?',
          answer: 'Ingredient lists at the bottom of each product page.',
        },
      ],
    } as unknown as Parameters<
      typeof FashionStoreFaq.client.component
    >[0]['props'])

    // No crash = the test reaching this point. Defaults should render.
    expect(screen.getByText('Common Inquiries')).toBeTruthy()
    expect(screen.getByText('Questions')).toBeTruthy()
  })

  it('renders without crashing when items have missing answer field', () => {
    expect(() =>
      renderCapsule(FashionStoreFaq.client.component, {
        items: [{ q: 'Question with no answer?' }],
      } as unknown as Parameters<
        typeof FashionStoreFaq.client.component
      >[0]['props']),
    ).not.toThrow()

    expect(screen.getByText('Question with no answer?')).toBeTruthy()
  })

  it('renders without crashing when items is null or undefined', () => {
    expect(() =>
      renderCapsule(FashionStoreFaq.client.component, {
        items: undefined,
      } as unknown as Parameters<
        typeof FashionStoreFaq.client.component
      >[0]['props']),
    ).not.toThrow()

    // Should fall back to defaults
    expect(screen.getByText('Common Inquiries')).toBeTruthy()
  })

  it('renders without crashing when items is an array of nulls', () => {
    expect(() =>
      renderCapsule(FashionStoreFaq.client.component, {
        items: [null, null, null],
      } as unknown as Parameters<
        typeof FashionStoreFaq.client.component
      >[0]['props']),
    ).not.toThrow()

    // Should fall back to defaults when all items are invalid
    expect(screen.getByText('Common Inquiries')).toBeTruthy()
  })

  it('renders correct {q, a} schema props without regression', () => {
    renderCapsule(FashionStoreFaq.client.component, {
      eyebrow: 'FAQ',
      heading: 'Test FAQ',
      items: [
        {
          q: 'Is this a test?',
          a: ['Yes it is.', 'Second paragraph.'],
        },
      ],
    } as unknown as Parameters<
      typeof FashionStoreFaq.client.component
    >[0]['props'])

    expect(screen.getByText('Is this a test?')).toBeTruthy()
    expect(screen.getByText('Yes it is.')).toBeTruthy()
    expect(screen.getByText('Second paragraph.')).toBeTruthy()
  })

  it('handles mixed valid and invalid items', () => {
    // sanitizeProps drops invalid items; the valid {q, a} item renders.
    renderCapsule(FashionStoreFaq.client.component, {
      items: [
        null,
        { q: 'Valid question?', a: ['Valid answer.'] },
        { question: 'Alias question?', answer: 'Alias answer.' },
        { garbage: true },
      ],
    } as unknown as Parameters<
      typeof FashionStoreFaq.client.component
    >[0]['props'])

    expect(screen.getByText('Valid question?')).toBeTruthy()
    expect(screen.getByText('Valid answer.')).toBeTruthy()
  })
})
