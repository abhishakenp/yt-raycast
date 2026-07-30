import { describe, expect, it } from 'vitest'

import {
  buildLinkFortyShortUrl,
  getLinkFortyBaseUrl,
  isLinkFortyClientEnabled,
  isLinkFortyServerEnabled,
} from '@/features/linkforty/lib/linkforty-config'

describe('linkforty-config', () => {
  describe('isLinkFortyClientEnabled', () => {
    it('returns true when VITE_LINKFORTY_ENABLED is "true"', () => {
      expect(isLinkFortyClientEnabled({ VITE_LINKFORTY_ENABLED: 'true' })).toBe(
        true,
      )
    })

    it('returns false when VITE_LINKFORTY_ENABLED is "false"', () => {
      expect(
        isLinkFortyClientEnabled({ VITE_LINKFORTY_ENABLED: 'false' }),
      ).toBe(false)
    })

    it('returns false when VITE_LINKFORTY_ENABLED is undefined', () => {
      expect(isLinkFortyClientEnabled({})).toBe(false)
    })

    it('is case-insensitive for "true"', () => {
      expect(isLinkFortyClientEnabled({ VITE_LINKFORTY_ENABLED: 'TRUE' })).toBe(
        true,
      )
      expect(isLinkFortyClientEnabled({ VITE_LINKFORTY_ENABLED: 'True' })).toBe(
        true,
      )
    })

    it('trims whitespace', () => {
      expect(
        isLinkFortyClientEnabled({ VITE_LINKFORTY_ENABLED: '  true  ' }),
      ).toBe(true)
    })
  })

  describe('isLinkFortyServerEnabled', () => {
    it('returns true when all server env vars are set', () => {
      expect(
        isLinkFortyServerEnabled({
          LINKFORTY_ENABLED: 'true',
          LINKFORTY_API_URL: 'https://links.ship-fast.ai',
          LINKFORTY_SERVICE_USER_ID: 'user-123',
        }),
      ).toBe(true)
    })

    it('returns false when LINKFORTY_ENABLED is not "true"', () => {
      expect(
        isLinkFortyServerEnabled({
          LINKFORTY_ENABLED: 'false',
          LINKFORTY_API_URL: 'https://links.ship-fast.ai',
          LINKFORTY_SERVICE_USER_ID: 'user-123',
        }),
      ).toBe(false)
    })

    it('returns false when LINKFORTY_API_URL is missing', () => {
      expect(
        isLinkFortyServerEnabled({
          LINKFORTY_ENABLED: 'true',
          LINKFORTY_SERVICE_USER_ID: 'user-123',
        }),
      ).toBe(false)
    })

    it('returns false when LINKFORTY_SERVICE_USER_ID is missing', () => {
      expect(
        isLinkFortyServerEnabled({
          LINKFORTY_ENABLED: 'true',
          LINKFORTY_API_URL: 'https://links.ship-fast.ai',
        }),
      ).toBe(false)
    })
  })

  describe('getLinkFortyBaseUrl', () => {
    it('returns the base URL when set', () => {
      expect(
        getLinkFortyBaseUrl({
          VITE_LINKFORTY_BASE_URL: 'https://links.example.com',
        }),
      ).toBe('https://links.example.com')
    })

    it('returns null when not set', () => {
      expect(getLinkFortyBaseUrl({})).toBe(null)
    })

    it('returns null when empty string', () => {
      expect(getLinkFortyBaseUrl({ VITE_LINKFORTY_BASE_URL: '' })).toBe(null)
    })
  })

  describe('buildLinkFortyShortUrl', () => {
    it('builds the short URL when enabled', () => {
      expect(
        buildLinkFortyShortUrl('ABC123', {
          VITE_LINKFORTY_ENABLED: 'true',
          VITE_LINKFORTY_BASE_URL: 'https://links.ship-fast.ai',
        }),
      ).toBe('https://links.ship-fast.ai/ABC123')
    })

    it('returns null when not enabled', () => {
      expect(
        buildLinkFortyShortUrl('ABC123', {
          VITE_LINKFORTY_ENABLED: 'false',
          VITE_LINKFORTY_BASE_URL: 'https://links.ship-fast.ai',
        }),
      ).toBe(null)
    })

    it('returns null when base URL is missing', () => {
      expect(
        buildLinkFortyShortUrl('ABC123', {
          VITE_LINKFORTY_ENABLED: 'true',
        }),
      ).toBe(null)
    })
  })
})
