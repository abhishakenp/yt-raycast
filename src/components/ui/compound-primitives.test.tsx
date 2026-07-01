// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from './alert-dialog'
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from './combobox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from './command'
import { ScrollArea } from './scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

describe('compound UI primitives', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
    Element.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('renders alert dialogs as labelled alert modals and wires action/cancel controls', () => {
    const onOpenChange = vi.fn()
    const onConfirm = vi.fn()

    render(
      <AlertDialog open onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete project?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the generated preview and export artifacts.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep project</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    )

    const dialog = screen.getByRole('alertdialog', {
      name: 'Delete project?',
    })

    expect(dialog.textContent).toContain('generated preview')
    expect(
      (
        screen.getByRole('button', {
          name: 'Keep project',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('renders command menus with a searchable input, enabled items, and disabled items', () => {
    const onDeploy = vi.fn()

    render(
      <Command>
        <CommandInput placeholder="Search actions" />
        <CommandList>
          <CommandEmpty>No action found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={onDeploy}>
              Deploy preview
              <CommandShortcut>Enter</CommandShortcut>
            </CommandItem>
            <CommandItem disabled>Delete production</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    )

    expect(
      screen
        .getByRole('option', { name: 'Delete production' })
        .getAttribute('aria-disabled'),
    ).toBe('true')

    fireEvent.change(screen.getByPlaceholderText('Search actions'), {
      target: { value: 'deploy' },
    })
    fireEvent.click(screen.getByRole('option', { name: /Deploy preview/ }))

    expect(
      (screen.getByPlaceholderText('Search actions') as HTMLInputElement).value,
    ).toBe('deploy')
    expect(onDeploy).toHaveBeenCalledTimes(1)
  })

  it('shows select trigger values and reports chosen option values', () => {
    const onValueChange = vi.fn()

    render(
      <Select defaultOpen defaultValue="preview" onValueChange={onValueChange}>
        <SelectTrigger aria-label="Publishing target">
          <SelectValue placeholder="Choose target" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="preview">Preview</SelectItem>
          <SelectItem value="production">Production</SelectItem>
          <SelectItem value="disabled" disabled>
            Disabled target
          </SelectItem>
        </SelectContent>
      </Select>,
    )

    expect(
      screen.getByRole('combobox', {
        hidden: true,
        name: 'Publishing target',
      }).textContent,
    ).toContain('Preview')
    expect(screen.getByRole('option', { name: 'Preview' }).dataset.state).toBe(
      'checked',
    )
    expect(
      screen
        .getByRole('option', { name: 'Disabled target' })
        .getAttribute('aria-disabled'),
    ).toBe('true')

    fireEvent.click(screen.getByRole('option', { name: 'Production' }))

    expect(onValueChange).toHaveBeenCalledWith('production')
  })

  it('renders combobox inputs with visible options and typed query state', () => {
    render(
      <Combobox items={['Lithuanian', 'Japanese']} defaultOpen>
        <ComboboxInput placeholder="Search language" showClear />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="Lithuanian">Lithuanian</ComboboxItem>
            <ComboboxItem value="Japanese">Japanese</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    )

    const input = screen.getByPlaceholderText(
      'Search language',
    ) as HTMLInputElement

    fireEvent.change(input, { target: { value: 'Lith' } })

    expect(input.value).toBe('Lith')
    expect(screen.getByRole('option', { name: 'Lithuanian' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Japanese' })).toBeTruthy()
  })

  it('keeps scroll-area content reachable through a focusable viewport', () => {
    render(
      <ScrollArea aria-label="Activity log">
        <ol>
          <li>Generation queued</li>
          <li>Preview ready</li>
          <li>Export packaged</li>
        </ol>
      </ScrollArea>,
    )

    const scrollArea = screen.getByLabelText('Activity log')

    expect(screen.getByText('Preview ready')).toBeTruthy()
    expect(scrollArea.contains(screen.getByText('Export packaged'))).toBe(true)
  })
})
