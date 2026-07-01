// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from './alert-dialog'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from './command'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from './combobox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'

describe('shared overlay UI primitives', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'PointerEvent', {
      configurable: true,
      value: globalThis.window?.MouseEvent ?? globalThis.window?.Event,
    })
    Object.defineProperty(globalThis, 'ResizeObserver', {
      configurable: true,
      value: class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    })

    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    })
    Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
      configurable: true,
      value: vi.fn(() => false),
    })
    Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
      configurable: true,
      value: vi.fn(),
    })
    Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
      configurable: true,
      value: vi.fn(),
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders a dialog with accessible title, description, and close actions', async () => {
    const onOpenChange = vi.fn()
    render(
      <Dialog defaultOpen onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export ready</DialogTitle>
            <DialogDescription>
              Download the latest production artifact.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <button type="button">Download</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    )

    expect(screen.getByRole('dialog', { name: 'Export ready' })).toBeTruthy()
    expect(
      screen.getByText('Download the latest production artifact.'),
    ).toBeTruthy()

    fireEvent.click(screen.getAllByRole('button', { name: 'Close' })[0])

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('renders alert dialogs with media, copy, and decision callbacks', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia aria-label="Warning">!</AlertDialogMedia>
            <AlertDialogTitle>Delete generation?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the session from the gallery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    )

    expect(
      screen.getByRole('alertdialog', { name: 'Delete generation?' }),
    ).toBeTruthy()
    expect(screen.getByLabelText('Warning')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('opens popover content from its trigger and keeps header copy visible', () => {
    render(
      <Popover>
        <PopoverTrigger>Choose language</PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Language</PopoverTitle>
            <PopoverDescription>Pick the preview locale.</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Choose language' }))

    expect(screen.getByText('Language')).toBeTruthy()
    expect(screen.getByText('Pick the preview locale.')).toBeTruthy()
  })

  it('exposes tooltip copy while the tooltip is open', () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>Deploy</TooltipTrigger>
          <TooltipContent>Publish this version</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )

    expect(screen.getByRole('tooltip').textContent).toBe('Publish this version')
  })

  it('runs command item callbacks and renders keyboard shortcut hints', () => {
    const onSelect = vi.fn()
    render(
      <Command>
        <CommandInput placeholder="Search actions" />
        <CommandList>
          <CommandEmpty>No actions found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem value="deploy" onSelect={onSelect}>
              Deploy preview
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    )

    expect(screen.getByPlaceholderText('Search actions')).toBeTruthy()
    expect(screen.getByText('⌘D')).toBeTruthy()

    fireEvent.click(screen.getByText('Deploy preview'))

    expect(onSelect).toHaveBeenCalledWith('deploy')
  })

  it('renders an open combobox with searchable options and selection callbacks', () => {
    const onValueChange = vi.fn()
    render(
      <Combobox
        items={['Next.js', 'Astro']}
        defaultOpen
        onValueChange={onValueChange}
      >
        <ComboboxInput placeholder="Search frameworks" />
        <ComboboxContent>
          <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
          <ComboboxList>
            <ComboboxItem value="Next.js">Next.js</ComboboxItem>
            <ComboboxItem value="Astro">Astro</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    )

    expect(screen.getByPlaceholderText('Search frameworks')).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Astro' })).toBeTruthy()

    fireEvent.click(screen.getByRole('option', { name: 'Astro' }))

    expect(onValueChange.mock.calls[0]?.[0]).toBe('Astro')
  })

  it('renders command dialogs with accessible hidden title and description', () => {
    render(
      <CommandDialog
        open
        title="Open command palette"
        description="Search dashboard actions"
      >
        <CommandInput placeholder="Search commands" />
        <CommandList>
          <CommandItem value="preview">Open preview</CommandItem>
        </CommandList>
      </CommandDialog>,
    )

    expect(
      screen.getByRole('dialog', { name: 'Open command palette' }),
    ).toBeTruthy()
    expect(screen.getByPlaceholderText('Search commands')).toBeTruthy()
    expect(screen.getByText('Open preview')).toBeTruthy()
  })

  it('selects an item from the open select menu and reports its value', () => {
    const onValueChange = vi.fn()
    render(
      <Select open value="draft" onValueChange={onValueChange}>
        <SelectTrigger aria-label="Deployment target">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="production">Production</SelectItem>
        </SelectContent>
      </Select>,
    )

    expect(screen.getByRole('listbox')).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Draft' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Production' })).toBeTruthy()

    fireEvent.click(screen.getByRole('option', { name: 'Production' }))

    expect(onValueChange).toHaveBeenCalledWith('production')
  })
})
