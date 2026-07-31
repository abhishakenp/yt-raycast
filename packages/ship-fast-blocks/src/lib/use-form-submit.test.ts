// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFormSubmit } from './use-form-submit.ts'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useFormSubmit', () => {
  it('starts in idle status', () => {
    const { result } = renderHook(() => useFormSubmit())
    expect(result.current.status).toBe('idle')
    expect(result.current.errorMessage).toBeNull()
  })

  it('transitions to success after submit (preview mode)', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useFormSubmit({ simulateDelay: 100 }))

    const form = document.createElement('form')
    const input = document.createElement('input')
    input.name = 'email'
    input.value = 'test@example.com'
    form.appendChild(input)
    const preventDefault = vi.fn()
    const event = {
      preventDefault,
      currentTarget: form,
    } as unknown as React.FormEvent<HTMLFormElement>

    let promise: Promise<void>
    act(() => {
      promise = result.current.handleSubmit(event)
    })

    expect(result.current.status).toBe('pending')
    expect(preventDefault).toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(200)
      await promise
    })

    expect(result.current.status).toBe('success')
    vi.useRealTimers()
  })

  it('calls mutationFn when provided', async () => {
    const mutationFn = vi.fn().mockResolvedValue({ id: 123 })
    const { result } = renderHook(() => useFormSubmit({ mutationFn }))

    const form = document.createElement('form')
    const input = document.createElement('input')
    input.name = 'name'
    input.value = 'John'
    form.appendChild(input)
    const event = {
      preventDefault: vi.fn(),
      currentTarget: form,
    } as unknown as React.FormEvent<HTMLFormElement>

    await act(async () => {
      await result.current.handleSubmit(event)
    })

    expect(mutationFn).toHaveBeenCalledWith({ name: 'John' })
    expect(result.current.status).toBe('success')
  })

  it('transitions to error on mutationFn failure', async () => {
    const mutationFn = vi.fn().mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useFormSubmit({ mutationFn }))

    const form = document.createElement('form')
    const event = {
      preventDefault: vi.fn(),
      currentTarget: form,
    } as unknown as React.FormEvent<HTMLFormElement>

    await act(async () => {
      await result.current.handleSubmit(event)
    })

    expect(result.current.status).toBe('error')
    expect(result.current.errorMessage).toBe('Network error')
  })

  it('reset returns to idle state', async () => {
    const mutationFn = vi.fn().mockResolvedValue({})
    const { result } = renderHook(() => useFormSubmit({ mutationFn }))

    const form = document.createElement('form')
    const event = {
      preventDefault: vi.fn(),
      currentTarget: form,
    } as unknown as React.FormEvent<HTMLFormElement>

    await act(async () => {
      await result.current.handleSubmit(event)
    })
    expect(result.current.status).toBe('success')

    act(() => {
      result.current.reset()
    })
    expect(result.current.status).toBe('idle')
  })

  it('prevents double submit while pending', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useFormSubmit({ simulateDelay: 500 }))

    const form = document.createElement('form')
    const event = {
      preventDefault: vi.fn(),
      currentTarget: form,
    } as unknown as React.FormEvent<HTMLFormElement>

    act(() => {
      result.current.handleSubmit(event)
    })
    expect(result.current.status).toBe('pending')

    // Try to submit again — should be blocked
    await act(async () => {
      await result.current.handleSubmit(event)
    })
    // Still pending (second call was ignored)
    expect(result.current.status).toBe('pending')

    vi.useRealTimers()
  })
})
