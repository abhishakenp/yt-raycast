// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from './dialog'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from './popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'

describe('overlay UI primitives', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('renders dialog content as a labelled modal and closes through built-in close controls', () => {
    const onOpenChange = vi.fn()
    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Confirm publish</DialogTitle>
          <DialogDescription>
            Publish the current preview to the public URL.
          </DialogDescription>
          <DialogFooter showCloseButton>
            <button type="button">Keep editing</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    )

    const dialog = screen.getByRole('dialog', { name: 'Confirm publish' })
    expect(dialog.getAttribute('data-slot')).toBe('dialog-content')
    expect(dialog.textContent).toContain('Publish the current preview')
    expect(
      document.querySelector('[data-slot="dialog-overlay"]'),
    ).not.toBeNull()

    fireEvent.click(screen.getAllByRole('button', { name: 'Close' })[0])
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('renders popover content in a portal with header title and description slots', () => {
    render(
      <Popover open>
        <PopoverTrigger>Open settings</PopoverTrigger>
        <PopoverContent align="start">
          <PopoverHeader>
            <PopoverTitle>Theme</PopoverTitle>
            <PopoverDescription>Choose a visual preset.</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>,
    )

    expect(screen.getByText('Theme').getAttribute('data-slot')).toBe(
      'popover-title',
    )
    expect(screen.getByText('Choose a visual preset.')).toBeTruthy()
    expect(
      document.querySelector('[data-slot="popover-content"]'),
    ).not.toBeNull()
  })

  it('renders controlled tooltip content and links it to the trigger description', () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>Export</TooltipTrigger>
          <TooltipContent>Download the generated site</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )

    const trigger = screen.getByRole('button', { name: 'Export' })
    const tooltip = screen.getByRole('tooltip')

    expect(tooltip.textContent).toBe('Download the generated site')
    expect(trigger.getAttribute('aria-describedby')).toBe(tooltip.id)
  })
})
