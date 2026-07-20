import { ConvexError } from 'convex/values'

const HASH_PATTERN = /^[a-f0-9]{64}$/
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.:-]*$/
const MAX_IDENTIFIER_LENGTH = 128
const MAX_RESULT_JSON_LENGTH = 1_024

export type CommerceOperationKind = 'payment-session' | 'complete'

export type CommerceOperationResult =
  | {
      kind: 'payment-session'
      paymentSessionId: string
      actionType: 'none' | 'redirect' | 'client-session'
    }
  | {
      kind: 'complete'
      orderId: string
      displayId?: string
    }

export type CommerceOperationSnapshot = {
  requestHash: string
  state: 'started' | 'succeeded' | 'failed' | 'unknown'
  attempt: number
  retryable?: boolean
  failureCode?: string
  resultJson?: string
  leaseExpiresAt: number
  retryAfterAt?: number
  expiresAt: number
}

export type CommerceOperationBeginDecision =
  | { type: 'execute'; attempt: number; reset: boolean }
  | { type: 'conflict' }
  | { type: 'in-progress'; retryAfterMs: number }
  | { type: 'replay'; resultJson: string }
  | {
      type: 'failed'
      retryable: boolean
      failureCode?: string
      retryAfterMs?: number
    }
  | { type: 'unknown'; markUnknown: boolean }

type OperationError = (message: string) => never
type ValidateValue = (label: string, value: unknown) => string
type CommerceOperationIdentityInput = {
  tenant: unknown
  cartId: unknown
  idempotencyKeyHash: unknown
  requestHash: unknown
}
type ValidateCommerceOperationIdentity = (
  identity: CommerceOperationIdentityInput,
) => {
  tenant: string
  cartId: string
  idempotencyKeyHash: string
  requestHash: string
}
type ValidateCommerceOperationFailureCode = (failureCode: unknown) => string
type RequireRecord = (value: unknown) => Record<string, unknown>
type AssertExactKeys = (
  value: Record<string, unknown>,
  allowedKeys: readonly string[],
) => void
type NormalizeResultValue = (
  value: Record<string, unknown>,
) => CommerceOperationResult
type NormalizeCommerceOperationResultValue = (
  kind: CommerceOperationKind,
  value: unknown,
) => CommerceOperationResult
type NormalizeCommerceOperationResult = (
  kind: CommerceOperationKind,
  value: unknown,
) => string
type ParseCommerceOperationResult = (
  kind: CommerceOperationKind,
  resultJson: string,
) => CommerceOperationResult
type DecideCommerceOperationBegin = (
  operation: CommerceOperationSnapshot | null,
  requestHash: string,
  now: number,
) => CommerceOperationBeginDecision

const operationError: OperationError = (message) => {
  throw new ConvexError({
    code: 'INVALID_COMMERCE_OPERATION',
    message,
  })
}

const validateIdentifier: ValidateValue = (label, value) => {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length > MAX_IDENTIFIER_LENGTH ||
    !IDENTIFIER_PATTERN.test(value)
  ) {
    return operationError(
      `${label} must be a safe identifier of at most ${MAX_IDENTIFIER_LENGTH} characters`,
    )
  }

  return value
}

const validateHash: ValidateValue = (label, value) => {
  if (typeof value !== 'string' || !HASH_PATTERN.test(value)) {
    return operationError(`${label} must be a lowercase SHA-256 hash`)
  }

  return value
}

export const validateCommerceOperationIdentity: ValidateCommerceOperationIdentity =
  (identity) => ({
    tenant: validateIdentifier('tenant', identity.tenant),
    cartId: validateIdentifier('cartId', identity.cartId),
    idempotencyKeyHash: validateHash(
      'idempotencyKeyHash',
      identity.idempotencyKeyHash,
    ),
    requestHash: validateHash('requestHash', identity.requestHash),
  })

export const validateCommerceOperationFailureCode: ValidateCommerceOperationFailureCode =
  (failureCode) => validateIdentifier('failureCode', failureCode)

const requireRecord: RequireRecord = (value) => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return operationError('result must be an object')
  }

  return value
}

const assertExactKeys: AssertExactKeys = (value, allowedKeys) => {
  const unsupportedKeys = Object.keys(value).filter(
    (key) => !allowedKeys.includes(key),
  )
  if (unsupportedKeys.length > 0) {
    operationError(
      `result contains unsupported fields: ${unsupportedKeys.join(', ')}`,
    )
  }
}

const normalizePaymentSessionResult: NormalizeResultValue = (value) => {
  assertExactKeys(value, ['kind', 'paymentSessionId', 'actionType'])
  if (value.kind !== 'payment-session') {
    operationError('result kind must be payment-session')
  }

  const actionType = value.actionType
  if (
    actionType !== 'none' &&
    actionType !== 'redirect' &&
    actionType !== 'client-session'
  ) {
    return operationError('payment-session actionType is invalid')
  }

  return {
    kind: 'payment-session',
    paymentSessionId: validateIdentifier(
      'paymentSessionId',
      value.paymentSessionId,
    ),
    actionType,
  }
}

const normalizeCompleteResult: NormalizeResultValue = (value) => {
  assertExactKeys(value, ['kind', 'orderId', 'displayId'])
  if (value.kind !== 'complete') {
    operationError('result kind must be complete')
  }

  const displayId =
    value.displayId === undefined
      ? undefined
      : validateIdentifier('displayId', value.displayId)

  return {
    kind: 'complete',
    orderId: validateIdentifier('orderId', value.orderId),
    ...(displayId === undefined ? {} : { displayId }),
  }
}

const normalizeCommerceOperationResultValue: NormalizeCommerceOperationResultValue =
  (kind, value) => {
    const record = requireRecord(value)
    return kind === 'payment-session'
      ? normalizePaymentSessionResult(record)
      : normalizeCompleteResult(record)
  }

export const normalizeCommerceOperationResult: NormalizeCommerceOperationResult =
  (kind, value) => {
    const result = normalizeCommerceOperationResultValue(kind, value)
    const resultJson = JSON.stringify(result)

    if (resultJson.length > MAX_RESULT_JSON_LENGTH) {
      operationError(
        `result exceeds the ${MAX_RESULT_JSON_LENGTH} character storage limit`,
      )
    }

    return resultJson
  }

export const parseCommerceOperationResult: ParseCommerceOperationResult = (
  kind,
  resultJson,
) => {
  if (resultJson.length > MAX_RESULT_JSON_LENGTH) {
    operationError('stored result exceeds the storage limit')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(resultJson)
  } catch {
    return operationError('stored result is invalid JSON')
  }

  return normalizeCommerceOperationResultValue(kind, parsed)
}

export const decideCommerceOperationBegin: DecideCommerceOperationBegin = (
  operation,
  requestHash,
  now,
) => {
  if (operation === null) {
    return { type: 'execute', attempt: 1, reset: false }
  }
  if (operation.requestHash !== requestHash) {
    return { type: 'conflict' }
  }
  if (operation.expiresAt <= now) {
    return {
      type: 'execute',
      attempt: operation.attempt + 1,
      reset: true,
    }
  }
  if (operation.state === 'succeeded') {
    if (operation.resultJson === undefined) {
      return operationError(
        'succeeded operation is missing its normalized result',
      )
    }
    return { type: 'replay', resultJson: operation.resultJson }
  }
  if (operation.state === 'unknown') {
    return { type: 'unknown', markUnknown: false }
  }
  if (operation.state === 'started') {
    if (operation.leaseExpiresAt <= now) {
      return { type: 'unknown', markUnknown: true }
    }
    return {
      type: 'in-progress',
      retryAfterMs: operation.leaseExpiresAt - now,
    }
  }
  if (!operation.retryable) {
    return {
      type: 'failed',
      retryable: false,
      ...(operation.failureCode === undefined
        ? {}
        : { failureCode: operation.failureCode }),
    }
  }
  if (operation.retryAfterAt !== undefined && operation.retryAfterAt > now) {
    return {
      type: 'failed',
      retryable: true,
      ...(operation.failureCode === undefined
        ? {}
        : { failureCode: operation.failureCode }),
      retryAfterMs: operation.retryAfterAt - now,
    }
  }

  return {
    type: 'execute',
    attempt: operation.attempt + 1,
    reset: false,
  }
}
