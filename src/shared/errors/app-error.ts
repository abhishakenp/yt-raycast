export const appErrorCodes = [
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'VALIDATION_ERROR',
  'PAYMENT_REQUIRED',
  'QUOTA_EXCEEDED',
  'INTEGRATION_UNAVAILABLE',
  'GENERATION_FAILED',
  'ARTIFACT_NOT_READY',
] as const

export type AppErrorCode = (typeof appErrorCodes)[number]

export type AppErrorShape = {
  code: AppErrorCode
  message: string
  status: number
}

const errorStatuses = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  PAYMENT_REQUIRED: 402,
  QUOTA_EXCEEDED: 429,
  INTEGRATION_UNAVAILABLE: 503,
  GENERATION_FAILED: 500,
  ARTIFACT_NOT_READY: 409,
} satisfies Record<AppErrorCode, number>

export class AppError extends Error {
  code: AppErrorCode
  status: number

  constructor(code: AppErrorCode, message: string) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = errorStatuses[code]
  }
}

export const createAppError = (code: AppErrorCode, message: string) =>
  new AppError(code, message)

export const toAppErrorShape = (error: AppError): AppErrorShape => ({
  code: error.code,
  message: error.message,
  status: error.status,
})
