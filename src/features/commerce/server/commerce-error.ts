import type { CommerceError } from '../contracts'

const SAFE_CORRELATION_ID = /^[A-Za-z0-9._:-]{1,128}$/

type CommerceFailureInput = CommerceError & {
  status: number
}

export class CommerceFailure extends Error {
  readonly commerceError: CommerceError
  readonly status: number

  constructor(input: CommerceFailureInput, cause?: unknown) {
    super(input.message, cause === undefined ? undefined : { cause })
    this.name = 'CommerceFailure'
    this.status = input.status
    this.commerceError = {
      code: input.code,
      correlationId: input.correlationId,
      ...(input.fieldErrors === undefined
        ? {}
        : { fieldErrors: input.fieldErrors }),
      message: input.message,
      retryable: input.retryable,
    }
  }
}

export function commerceCorrelationId(request: Request): string {
  const requested = request.headers.get('x-correlation-id')?.trim()
  return requested !== undefined && SAFE_CORRELATION_ID.test(requested)
    ? requested
    : crypto.randomUUID()
}

export function commerceFailureResponse(failure: CommerceFailure): Response {
  return Response.json(
    { error: failure.commerceError },
    {
      headers: {
        'x-correlation-id': failure.commerceError.correlationId,
      },
      status: failure.status,
    },
  )
}
