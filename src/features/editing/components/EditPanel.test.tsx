// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { EditPanel } from './EditPanel'

const mutationMock = vi.hoisted(() => vi.fn())

vi.mock('convex/react', () => ({
  useMutation: () => mutationMock,
  useQuery: () => [],
}))

vi.mock('@/features/session/services/anonymous-owner-secret', () => ({
  readAnonymousOwnerSecret: () => undefined,
}))

const selection = {
  label: 'Hero headline',
  tagName: 'h1',
  selectedText: 'Luxury Car Rental',
  elementPath: 'main > h1:nth-of-type(1)',
  html: '<h1>Luxury Car Rental</h1>',
}

const getFieldValue = (label: string) =>
  screen.getByLabelText<HTMLInputElement | HTMLTextAreaElement>(label).value

describe('EditPanel', () => {
  beforeEach(() => {
    mutationMock.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it('keeps the requested text edit when apply fails', async () => {
    mutationMock.mockRejectedValueOnce(new Error('Selected text was not found'))

    render(<EditPanel sessionId="session_123" selection={selection} />)

    const replacement = screen.getByLabelText('Replace with')
    fireEvent.change(replacement, {
      target: { value: 'Premium Fleet Rentals' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply text edit' }))

    await waitFor(() => {
      expect(screen.getByText('Selected text was not found')).toBeTruthy()
    })
    expect(getFieldValue('Find text')).toBe('Luxury Car Rental')
    expect(getFieldValue('Replace with')).toBe('Premium Fleet Rentals')
  })

  it('keeps the requested text edit when Convex reports it was not saved', async () => {
    mutationMock.mockResolvedValueOnce({ saved: false, previewVersion: 1 })

    render(<EditPanel sessionId="session_123" selection={selection} />)

    fireEvent.change(screen.getByLabelText('Replace with'), {
      target: { value: 'Premium Fleet Rentals' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply text edit' }))

    await waitFor(() => {
      expect(screen.getByText(/Selected text was not found/)).toBeTruthy()
    })
    expect(getFieldValue('Find text')).toBe('Luxury Car Rental')
    expect(getFieldValue('Replace with')).toBe('Premium Fleet Rentals')
  })

  it('clears text fields after a saved edit', async () => {
    mutationMock.mockResolvedValueOnce({ saved: true, previewVersion: 2 })

    render(<EditPanel sessionId="session_123" selection={selection} />)

    fireEvent.change(screen.getByLabelText('Replace with'), {
      target: { value: 'Premium Fleet Rentals' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply text edit' }))

    await waitFor(() => {
      expect(getFieldValue('Find text')).toBe('')
    })
    expect(getFieldValue('Replace with')).toBe('')
  })
})
