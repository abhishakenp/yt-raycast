import { describe, expect, it } from 'vitest'

import { createAppError, toAppErrorShape } from '@/shared/errors/app-error'

describe('app errors', () => {
  it('maps auth failures to status 401', () => {
    const error = createAppError('UNAUTHENTICATED', 'Sign in required')

    expect(toAppErrorShape(error)).toEqual({
      code: 'UNAUTHENTICATED',
      message: 'Sign in required',
      status: 401,
    })
  })

  it('maps artifact readiness to a retryable conflict status', () => {
    const error = createAppError(
      'ARTIFACT_NOT_READY',
      'Export is still building',
    )

    expect(toAppErrorShape(error).status).toBe(409)
  })
})
