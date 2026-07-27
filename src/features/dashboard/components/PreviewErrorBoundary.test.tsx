import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { PreviewErrorBoundary } from './PreviewErrorBoundary'

function CrashOnProp({ value }: { value: string }) {
  if (value === 'crash') throw new Error('render crash')
  return <div data-testid="child">{value}</div>
}

describe('PreviewErrorBoundary', () => {
  it('renders children when no crash', () => {
    const { container } = render(
      <PreviewErrorBoundary fallback={<div>fallback</div>}>
        <CrashOnProp value="ok" />
      </PreviewErrorBoundary>,
    )
    expect(container.querySelector('[data-testid="child"]')?.textContent).toBe(
      'ok',
    )
  })

  it('renders fallback on crash', () => {
    const { container } = render(
      <PreviewErrorBoundary
        fallback={<div data-testid="fallback">fallback</div>}
      >
        <CrashOnProp value="crash" />
      </PreviewErrorBoundary>,
    )
    expect(container.querySelector('[data-testid="fallback"]')).not.toBeNull()
  })

  it('calls onError on crash', () => {
    const onError = vi.fn()
    render(
      <PreviewErrorBoundary fallback={<div>fallback</div>} onError={onError}>
        <CrashOnProp value="crash" />
      </PreviewErrorBoundary>,
    )
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0]![0]).toBeInstanceOf(Error)
  })

  it('resets when sourceKey changes', () => {
    const { container, rerender } = render(
      <PreviewErrorBoundary
        fallback={<div data-testid="fallback">fallback</div>}
        sourceKey="A"
      >
        <CrashOnProp value="crash" />
      </PreviewErrorBoundary>,
    )
    expect(container.querySelector('[data-testid="fallback"]')).not.toBeNull()

    rerender(
      <PreviewErrorBoundary
        fallback={<div data-testid="fallback">fallback</div>}
        sourceKey="B"
      >
        <CrashOnProp value="ok" />
      </PreviewErrorBoundary>,
    )
    expect(container.querySelector('[data-testid="child"]')?.textContent).toBe(
      'ok',
    )
  })

  it('stays crashed when sourceKey does not change', () => {
    const { container, rerender } = render(
      <PreviewErrorBoundary
        fallback={<div data-testid="fallback">fallback</div>}
        sourceKey="A"
      >
        <CrashOnProp value="crash" />
      </PreviewErrorBoundary>,
    )
    expect(container.querySelector('[data-testid="fallback"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="child"]')).toBeNull()

    rerender(
      <PreviewErrorBoundary
        fallback={<div data-testid="fallback">fallback</div>}
        sourceKey="A"
      >
        <CrashOnProp value="crash" />
      </PreviewErrorBoundary>,
    )
    expect(container.querySelector('[data-testid="fallback"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="child"]')).toBeNull()
  })
})
