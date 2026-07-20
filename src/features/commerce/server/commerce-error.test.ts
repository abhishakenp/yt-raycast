import { describe, expect, it } from 'vitest'

import {
  CommerceFailure,
  commerceCorrelationId,
  commerceFailureResponse,
} from './commerce-error'

describe('commerce error boundary', () => {
  it('preserves status through a stable CommerceError envelope and header', async () => {
    const failure = new CommerceFailure({
      code: 'PROVIDER_CONFLICT',
      correlationId: 'commerce-correlation-1',
      message: 'Commerce provider rejected the request.',
      retryable: false,
      status: 409,
    })

    const response = commerceFailureResponse(failure)

    expect(response.status).toBe(409)
    expect(response.headers.get('x-correlation-id')).toBe(
      'commerce-correlation-1',
    )
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'PROVIDER_CONFLICT',
        correlationId: 'commerce-correlation-1',
        message: 'Commerce provider rejected the request.',
        retryable: false,
      },
    })
  })

  it('accepts only bounded safe incoming correlation IDs', () => {
    expect(
      commerceCorrelationId(
        new Request('https://ship-fast.test', {
          headers: { 'x-correlation-id': 'request-123.ABC' },
        }),
      ),
    ).toBe('request-123.ABC')

    const generated = commerceCorrelationId(
      new Request('https://ship-fast.test', {
        headers: {
          'x-correlation-id': `unsafe secret ${'x'.repeat(200)}`,
        },
      }),
    )
    expect(generated).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('never serializes an internal cause or provider secret', async () => {
    const failure = new CommerceFailure(
      {
        code: 'PROVIDER_FAILURE',
        correlationId: 'commerce-correlation-2',
        message: 'Commerce provider request failed.',
        retryable: true,
        status: 502,
      },
      new Error('admin-token-secret'),
    )

    const serialized = JSON.stringify(
      await commerceFailureResponse(failure).json(),
    )
    expect(serialized).not.toContain('admin-token-secret')
  })
})
