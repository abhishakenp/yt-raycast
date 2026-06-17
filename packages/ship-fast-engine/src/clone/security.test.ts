import { beforeEach, describe, expect, it, vi } from 'vitest'

const dnsMocks = vi.hoisted(() => ({
  lookup: vi.fn(),
}))

vi.mock('dns/promises', () => ({
  lookup: dnsMocks.lookup,
}))

import { assertPublicUrl, isAllowedScheme } from './security.ts'

describe('clone SSRF security guard', () => {
  beforeEach(() => {
    dnsMocks.lookup.mockReset()
  })

  it('only allows http and https URL schemes', () => {
    expect(isAllowedScheme('https://example.com')).toBe(true)
    expect(isAllowedScheme('http://example.com')).toBe(true)
    expect(isAllowedScheme('ftp://example.com')).toBe(false)
    expect(isAllowedScheme('not a url')).toBe(false)
  })

  it('rejects unparseable URLs and non-http schemes before DNS lookup', async () => {
    await expect(assertPublicUrl('not a url')).rejects.toThrow(
      'Blocked URL (unparseable): not a url',
    )
    await expect(assertPublicUrl('file:///etc/passwd')).rejects.toThrow(
      'Blocked URL (scheme not allowed): file:///etc/passwd',
    )
    expect(dnsMocks.lookup).not.toHaveBeenCalled()
  })

  it('blocks localhost, metadata, and unspecified host literals before DNS lookup', async () => {
    for (const url of [
      'http://localhost/admin',
      'https://api.localhost/internal',
      'http://0.0.0.0/',
      'http://metadata.google.internal/computeMetadata/v1',
    ]) {
      await expect(assertPublicUrl(url)).rejects.toThrow(
        'Blocked URL (disallowed host):',
      )
    }

    expect(dnsMocks.lookup).not.toHaveBeenCalled()
  })

  it('blocks private, loopback, link-local, and reserved IP literals without DNS lookup', async () => {
    for (const url of [
      'http://127.0.0.1/',
      'http://10.1.2.3/',
      'http://172.20.0.1/',
      'http://192.168.1.10/',
      'http://169.254.169.254/latest/meta-data',
      'http://100.64.0.2/',
      'http://224.0.0.1/',
      'http://[::1]/',
      'http://[fe80::1]/',
      'http://[fd00::1]/',
      'http://[ff00::1]/',
      'http://[::ffff:127.0.0.1]/',
    ]) {
      await expect(assertPublicUrl(url)).rejects.toThrow('Blocked URL')
    }

    expect(dnsMocks.lookup).not.toHaveBeenCalled()
  })

  it('allows public IP literals without DNS lookup', async () => {
    await expect(
      assertPublicUrl('https://8.8.8.8/dns-query'),
    ).resolves.toBeUndefined()
    await expect(
      assertPublicUrl('https://[2001:4860:4860::8888]/dns-query'),
    ).resolves.toBeUndefined()

    expect(dnsMocks.lookup).not.toHaveBeenCalled()
  })

  it('rejects hostnames that fail DNS resolution or resolve to no addresses', async () => {
    dnsMocks.lookup.mockRejectedValueOnce(new Error('ENOTFOUND'))
    await expect(assertPublicUrl('https://missing.example')).rejects.toThrow(
      'Blocked URL (DNS resolution failed): https://missing.example',
    )

    dnsMocks.lookup.mockResolvedValueOnce([])
    await expect(assertPublicUrl('https://empty.example')).rejects.toThrow(
      'Blocked URL (no DNS records): https://empty.example',
    )
  })

  it('rejects a hostname when any DNS answer is private', async () => {
    dnsMocks.lookup.mockResolvedValueOnce([
      { address: '93.184.216.34', family: 4 },
      { address: '10.0.0.5', family: 4 },
    ])

    await expect(assertPublicUrl('https://mixed.example')).rejects.toThrow(
      'Blocked URL (resolves to private/loopback IP 10.0.0.5): https://mixed.example',
    )
  })

  it('allows hostnames when every DNS answer is public', async () => {
    dnsMocks.lookup.mockResolvedValueOnce([
      { address: '93.184.216.34', family: 4 },
      { address: '2606:2800:220:1:248:1893:25c8:1946', family: 6 },
    ])

    await expect(
      assertPublicUrl('https://example.com'),
    ).resolves.toBeUndefined()
    expect(dnsMocks.lookup).toHaveBeenCalledWith('example.com', { all: true })
  })
})
