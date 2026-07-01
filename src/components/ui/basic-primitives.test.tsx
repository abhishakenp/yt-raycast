// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Button } from './button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from './input-group'
import { Input } from './input'
import { Kbd, KbdGroup } from './kbd'
import { ScrollArea } from './scroll-area'
import { Slider } from './slider'
import { Textarea } from './textarea'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'
import { Toggle } from './toggle'

describe('shared UI primitives', () => {
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

  it('renders buttons as native buttons and slotted anchors', () => {
    const onClick = vi.fn()
    render(
      <div>
        <Button onClick={onClick}>Save</Button>
        <Button asChild>
          <a href="/pricing">Pricing</a>
        </Button>
      </div>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('link', { name: 'Pricing' })).toHaveProperty(
      'pathname',
      '/pricing',
    )
  })

  it('renders form inputs with supplied accessible names and values', () => {
    render(
      <form>
        <label htmlFor="title">Title</label>
        <Input id="title" defaultValue="Generated homepage" />
        <label htmlFor="notes">Notes</label>
        <Textarea id="notes" defaultValue="Make it responsive" />
      </form>,
    )

    expect(screen.getByLabelText('Title')).toHaveProperty(
      'value',
      'Generated homepage',
    )
    expect(screen.getByLabelText('Notes')).toHaveProperty(
      'value',
      'Make it responsive',
    )
  })

  it('delegates input-group addon clicks to the input while button clicks stay buttons', () => {
    const onAction = vi.fn()
    render(
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>$</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Amount" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={onAction}>Apply</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>,
    )

    fireEvent.click(screen.getByText('$'))
    expect(screen.getByLabelText('Amount')).toBe(document.activeElement)

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('supports multiline input-group controls', () => {
    render(
      <InputGroup>
        <InputGroupTextarea aria-label="Prompt" defaultValue="Build a site" />
      </InputGroup>,
    )

    expect(screen.getByLabelText('Prompt')).toHaveProperty(
      'value',
      'Build a site',
    )
  })

  it('renders keyboard hints as grouped keyboard content', () => {
    render(
      <KbdGroup aria-label="Shortcut">
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>,
    )

    expect(screen.getByLabelText('Shortcut').textContent).toBe('⌘K')
  })

  it('renders scroll area content inside the viewport layer', () => {
    const { container } = render(
      <ScrollArea>
        <p>Scrollable preview history</p>
      </ScrollArea>,
    )

    expect(screen.getByText('Scrollable preview history')).toBeTruthy()
    expect(
      container.querySelector('[data-slot="scroll-area-viewport"]'),
    ).not.toBe(null)
  })

  it('renders one slider thumb per controlled value', () => {
    const { container } = render(<Slider value={[20, 80]} min={0} max={100} />)

    expect(
      container.querySelectorAll('[data-slot="slider-thumb"]'),
    ).toHaveLength(2)
  })

  it('toggles standalone and grouped toggle controls', () => {
    render(
      <div>
        <Toggle aria-label="Bold">B</Toggle>
        <ToggleGroup type="single" aria-label="Text alignment">
          <ToggleGroupItem value="left" aria-label="Align left">
            Left
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            Right
          </ToggleGroupItem>
        </ToggleGroup>
      </div>,
    )

    const bold = screen.getByRole('button', { name: 'Bold' })
    const left = screen.getByRole('radio', { name: 'Align left' })

    fireEvent.click(bold)
    fireEvent.click(left)

    expect(bold.getAttribute('data-state')).toBe('on')
    expect(left.getAttribute('data-state')).toBe('on')
  })
})
