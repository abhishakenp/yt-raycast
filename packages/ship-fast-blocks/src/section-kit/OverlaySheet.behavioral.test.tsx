// @vitest-environment jsdom

import type { ReactNode } from 'react'
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import {
  OverlaySheet,
  OverlaySheetBody,
  OverlaySheetClose,
  OverlaySheetContent,
  OverlaySheetDescription,
  OverlaySheetEyebrow,
  OverlaySheetFooter,
  OverlaySheetHeader,
  OverlaySheetTitle,
  OverlaySheetTrigger,
  overlaySheetContentVariants,
} from './OverlaySheet.tsx'

afterEach(cleanup)

// The overlay renders through a Radix portal; render it open so the content
// mounts synchronously, then assert against the portalled content node.
const renderOpen = (children: ReactNode) =>
  render(
    <OverlaySheet open>
      <OverlaySheetTrigger>open</OverlaySheetTrigger>
      {children}
    </OverlaySheet>,
  )

const getContent = () =>
  document.querySelector(
    '[data-slot="overlay-sheet-content"]',
  ) as HTMLElement | null

describe('OverlaySheet', () => {
  it('renders the full compound with stable data-slots, title and description', () => {
    renderOpen(
      <OverlaySheetContent>
        <OverlaySheetHeader>
          <OverlaySheetEyebrow>Menu</OverlaySheetEyebrow>
          <OverlaySheetTitle>Acme</OverlaySheetTitle>
          <OverlaySheetDescription>Navigate sections.</OverlaySheetDescription>
        </OverlaySheetHeader>
        <OverlaySheetBody>
          <a href="#a">Home</a>
        </OverlaySheetBody>
        <OverlaySheetFooter>
          <OverlaySheetClose aria-label="Close menu" />
        </OverlaySheetFooter>
      </OverlaySheetContent>,
    )

    const content = getContent()
    expect(content).not.toBeNull()
    const scope = within(content as HTMLElement)

    expect(scope.getByText('Acme')).toBeTruthy()
    expect(scope.getByText('Navigate sections.')).toBeTruthy()
    expect(scope.getByRole('link', { name: 'Home' }).getAttribute('href')).toBe(
      '#a',
    )

    for (const slot of [
      'overlay-sheet-header',
      'overlay-sheet-body',
      'overlay-sheet-footer',
      'overlay-sheet-title',
    ]) {
      expect(content?.querySelector(`[data-slot="${slot}"]`)).not.toBeNull()
    }
  })

  it('eyebrow is decorative (aria-hidden) with the mono micro-label grammar', () => {
    renderOpen(
      <OverlaySheetContent>
        <OverlaySheetEyebrow>Your cart</OverlaySheetEyebrow>
      </OverlaySheetContent>,
    )
    const eyebrow = document.querySelector(
      '[data-slot="overlay-sheet-eyebrow"]',
    ) as HTMLElement
    expect(eyebrow).not.toBeNull()
    expect(eyebrow.textContent).toBe('Your cart')
    expect(eyebrow.getAttribute('aria-hidden')).toBe('true')
    expect(eyebrow.className).toContain('font-mono')
    expect(eyebrow.className).toContain('uppercase')
    expect(eyebrow.className).toContain('tracking-[0.18em]')
  })

  it('close button defaults to a × labelled button of type button', () => {
    renderOpen(
      <OverlaySheetContent>
        <OverlaySheetClose aria-label="Close cart" />
      </OverlaySheetContent>,
    )
    const close = screen.getByRole('button', { name: 'Close cart' })
    expect(close.getAttribute('type')).toBe('button')
    expect(close.textContent).toBe('×')
    expect(close.className).toContain('rounded-none')
  })

  it('close button accepts custom children', () => {
    renderOpen(
      <OverlaySheetContent>
        <OverlaySheetClose aria-label="Dismiss">Done</OverlaySheetClose>
      </OverlaySheetContent>,
    )
    const close = screen.getByRole('button', { name: 'Dismiss' })
    expect(close.textContent).toBe('Done')
  })

  describe('overlaySheetContentVariants (byte-identical chrome contract)', () => {
    it('drawer variant is the square hairline panel (rounded-none + shadow-none)', () => {
      const cls = overlaySheetContentVariants({ variant: 'drawer', size: 'sm' })
      expect(cls).toContain('rounded-none')
      expect(cls).toContain('shadow-none')
      expect(cls).toContain('border-l')
      expect(cls).toContain('w-[min(100%,22rem)]')
      expect(cls).toContain('sm:max-w-[22rem]')
    })

    it('panel variant keeps the base sheet shadow (no rounded-none / shadow-none injected)', () => {
      const cls = overlaySheetContentVariants({ variant: 'panel', size: 'sm' })
      expect(cls).not.toContain('rounded-none')
      expect(cls).not.toContain('shadow-none')
      expect(cls).toContain('border-l')
      expect(cls).toContain('bg-background')
      expect(cls).toContain('p-0')
      expect(cls).toContain('text-foreground')
    })

    it('md size widens to 24rem', () => {
      const cls = overlaySheetContentVariants({ variant: 'drawer', size: 'md' })
      expect(cls).toContain('w-[min(100%,24rem)]')
      expect(cls).toContain('sm:max-w-[24rem]')
    })

    it('defaults to drawer + sm', () => {
      const cls = overlaySheetContentVariants({})
      expect(cls).toContain('rounded-none')
      expect(cls).toContain('w-[min(100%,22rem)]')
    })
  })

  it('className overrides win via twMerge (caller keeps exact deviations)', () => {
    renderOpen(
      <OverlaySheetContent variant="panel" size="sm" className="gap-0">
        <OverlaySheetTitle>x</OverlaySheetTitle>
      </OverlaySheetContent>,
    )
    const content = getContent() as HTMLElement
    expect(content.className).toContain('gap-0')
    expect(content.className).toContain('w-[min(100%,22rem)]')
    expect(content.className).not.toContain('rounded-none')
  })

  it('header with no className reproduces the shared nav-drawer header chrome', () => {
    renderOpen(
      <OverlaySheetContent>
        <OverlaySheetHeader>
          <OverlaySheetTitle>Acme</OverlaySheetTitle>
        </OverlaySheetHeader>
      </OverlaySheetContent>,
    )
    const header = document.querySelector(
      '[data-slot="overlay-sheet-header"]',
    ) as HTMLElement
    for (const c of [
      'border-b',
      'border-border',
      'px-5',
      'py-4',
      'text-left',
    ]) {
      expect(header.className).toContain(c)
    }
  })
})
