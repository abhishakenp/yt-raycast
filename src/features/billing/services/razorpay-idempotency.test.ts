import { describe, expect, it } from 'vitest'
import { generateIdempotencyKey, validateIdempotencyKey } from './razorpay-idempotency'

describe('razorpay-idempotency', () => {
  describe('generateIdempotencyKey', () => {
    it('should generate unique keys', () => {
      const key1 = generateIdempotencyKey('checkout')
      const key2 = generateIdempotencyKey('checkout')
      expect(key1).not.toBe(key2)
    })

    it('should include prefix', () => {
      const key = generateIdempotencyKey('test')
      expect(key.startsWith('test_')).toBe(true)
    })

    it('should generate valid length', () => {
      const key = generateIdempotencyKey('checkout')
      expect(key.length).toBeGreaterThan(0)
      expect(key.length).toBeLessThanOrEqual(255)
    })
  })

  describe('validateIdempotencyKey', () => {
    it('should accept valid keys', () => {
      expect(validateIdempotencyKey('valid_key')).toBe(true)
      expect(validateIdempotencyKey('a')).toBe(true)
    })

    it('should reject empty strings', () => {
      expect(validateIdempotencyKey('')).toBe(false)
    })

    it('should reject non-strings', () => {
      expect(validateIdempotencyKey(null as unknown as string)).toBe(false)
      expect(validateIdempotencyKey(undefined as unknown as string)).toBe(false)
    })

    it('should reject keys longer than 255 chars', () => {
      const longKey = 'a'.repeat(256)
      expect(validateIdempotencyKey(longKey)).toBe(false)
    })
  })
})
