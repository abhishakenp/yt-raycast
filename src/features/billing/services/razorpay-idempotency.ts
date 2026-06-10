export function generateIdempotencyKey(prefix: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `${prefix}_${timestamp}_${random}`
}

export function validateIdempotencyKey(key: string): boolean {
  return typeof key === 'string' && key.length > 0 && key.length <= 255
}
