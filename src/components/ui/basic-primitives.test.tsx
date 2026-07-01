// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './button'
import { Input } from './input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from './input-group'
import { Kbd, KbdGroup } from './kbd'
import { Textarea } from './textarea'

describe('basic UI primitives', () => {
  it('renders button variants as real buttons and forwards click/disabled behavior', () => {
    const onClick = vi.fn()
    render(
      <>
        <Button size="sm" variant="secondary" onClick={onClick}>
          Save
        </Button>
        <Button disabled onClick={onClick}>
          Disabled
        </Button>
      </>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    fireEvent.click(screen.getByRole('button', { name: 'Disabled' }))

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Save' }).className).toContain(
      'bg-secondary',
    )
    expect(
      (screen.getByRole('button', { name: 'Disabled' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)
  })

  it('renders an accessible child element when Button uses asChild', () => {
    render(
      <Button asChild variant="link">
        <a href="/pricing">Pricing</a>
      </Button>,
    )

    const link = screen.getByRole('link', { name: 'Pricing' })
    expect(link.getAttribute('href')).toBe('/pricing')
    expect(link.className).toContain('text-primary')
  })

  it('forwards native input and textarea state, invalid flags, and custom classes', () => {
    render(
      <>
        <Input
          aria-invalid="true"
          className="custom-input"
          defaultValue="abc"
        />
        <Textarea className="custom-textarea" defaultValue="notes" />
      </>,
    )

    const input = screen.getByDisplayValue('abc')
    const textarea = screen.getByDisplayValue('notes')

    expect(input.getAttribute('data-slot')).toBe('input')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.className).toContain('custom-input')
    expect(textarea.getAttribute('data-slot')).toBe('textarea')
    expect(textarea.className).toContain('custom-textarea')
  })

  it('focuses the grouped input when non-button addon content is clicked', () => {
    render(
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Domain" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton aria-label="Clear domain">Clear</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>,
    )

    fireEvent.click(screen.getByText('https://'))
    expect(document.activeElement).toBe(screen.getByLabelText('Domain'))

    screen.getByLabelText('Domain').blur()
    fireEvent.click(screen.getByRole('button', { name: 'Clear domain' }))
    expect(document.activeElement).not.toBe(screen.getByLabelText('Domain'))
  })

  it('renders grouped textarea controls and keyboard hints with stable slots', () => {
    render(
      <InputGroup>
        <InputGroupTextarea aria-label="Prompt" defaultValue="Build a site" />
        <InputGroupAddon align="block-end">
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>Enter</Kbd>
          </KbdGroup>
        </InputGroupAddon>
      </InputGroup>,
    )

    expect((screen.getByLabelText('Prompt') as HTMLTextAreaElement).value).toBe(
      'Build a site',
    )
    expect(document.querySelector('[data-slot="input-group"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="kbd-group"]')).not.toBeNull()
    expect(screen.getByText('Enter').getAttribute('data-slot')).toBe('kbd')
  })
})
