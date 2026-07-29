import { describe, expect, it } from 'vitest'
import {
  createInMemoryAdminSsoNonceStore,
  exportAdminSsoPrivateKeyBase64,
  exportAdminSsoPublicKeyBase64,
  generateAdminSsoKeyPair,
  importAdminSsoPrivateKey,
  signAdminSsoToken,
  verifyAdminSsoToken,
} from './admin-sso-token'

const audience = 'https://instance-1.commerce.ship-fast.ai'
const commerceInstanceId = 'instance-1'

async function setup() {
  const { publicKey, privateKey } = await generateAdminSsoKeyPair()
  return { publicKey, privateKey, nonceStore: createInMemoryAdminSsoNonceStore() }
}

describe('signAdminSsoToken / verifyAdminSsoToken', () => {
  it('round-trips valid claims and creates the correct admin identity', async () => {
    const { publicKey, privateKey, nonceStore } = await setup()
    const now = 1_000_000

    const token = await signAdminSsoToken(
      privateKey,
      {
        customerId: 'customer-1',
        email: 'owner@example.com',
        commerceInstanceId,
        audience,
      },
      now,
    )
    const result = await verifyAdminSsoToken(
      publicKey,
      token,
      { audience, commerceInstanceId },
      nonceStore,
      now + 1_000,
    )

    expect(result).toMatchObject({
      ok: true,
      claims: {
        customerId: 'customer-1',
        email: 'owner@example.com',
        commerceInstanceId,
        audience,
      },
    })
  })

  it('rejects a token verified after its 60-second expiry', async () => {
    const { publicKey, privateKey, nonceStore } = await setup()
    const now = 1_000_000
    const token = await signAdminSsoToken(
      privateKey,
      { customerId: 'customer-1', email: 'owner@example.com', commerceInstanceId, audience },
      now,
    )

    const result = await verifyAdminSsoToken(
      publicKey,
      token,
      { audience, commerceInstanceId },
      nonceStore,
      now + 60_001,
    )
    expect(result).toEqual({ ok: false, error: 'EXPIRED' })
  })

  it('rejects a replayed token even when everything else is valid', async () => {
    const { publicKey, privateKey, nonceStore } = await setup()
    const now = 1_000_000
    const token = await signAdminSsoToken(
      privateKey,
      { customerId: 'customer-1', email: 'owner@example.com', commerceInstanceId, audience },
      now,
    )

    const first = await verifyAdminSsoToken(
      publicKey,
      token,
      { audience, commerceInstanceId },
      nonceStore,
      now + 1_000,
    )
    const replay = await verifyAdminSsoToken(
      publicKey,
      token,
      { audience, commerceInstanceId },
      nonceStore,
      now + 2_000,
    )

    expect(first.ok).toBe(true)
    expect(replay).toEqual({ ok: false, error: 'NONCE_REUSED' })
  })

  it('rejects a token presented to the wrong audience', async () => {
    const { publicKey, privateKey, nonceStore } = await setup()
    const now = 1_000_000
    const token = await signAdminSsoToken(
      privateKey,
      { customerId: 'customer-1', email: 'owner@example.com', commerceInstanceId, audience },
      now,
    )

    const result = await verifyAdminSsoToken(
      publicKey,
      token,
      { audience: 'https://other-instance.commerce.ship-fast.ai', commerceInstanceId },
      nonceStore,
      now + 1_000,
    )
    expect(result).toEqual({ ok: false, error: 'WRONG_AUDIENCE' })
  })

  it('rejects a token for another customer instance even when the email matches', async () => {
    const { publicKey, privateKey, nonceStore } = await setup()
    const now = 1_000_000
    const token = await signAdminSsoToken(
      privateKey,
      {
        customerId: 'customer-1',
        email: 'shared@example.com',
        commerceInstanceId: 'instance-1',
        audience,
      },
      now,
    )

    // Instance-2's stack verifies against its own commerceInstanceId, not
    // instance-1's — this is the "same email, different customer" guard.
    const result = await verifyAdminSsoToken(
      publicKey,
      token,
      { audience, commerceInstanceId: 'instance-2' },
      nonceStore,
      now + 1_000,
    )
    expect(result).toEqual({ ok: false, error: 'WRONG_INSTANCE' })
  })

  it('rejects a token signed by a different (untrusted) key pair', async () => {
    const { publicKey, nonceStore } = await setup()
    const attacker = await generateAdminSsoKeyPair()
    const now = 1_000_000
    const token = await signAdminSsoToken(
      attacker.privateKey,
      { customerId: 'customer-1', email: 'owner@example.com', commerceInstanceId, audience },
      now,
    )

    const result = await verifyAdminSsoToken(
      publicKey,
      token,
      { audience, commerceInstanceId },
      nonceStore,
      now + 1_000,
    )
    expect(result).toEqual({ ok: false, error: 'BAD_SIGNATURE' })
  })

  it('rejects a token whose payload was tampered with after signing', async () => {
    const { publicKey, privateKey, nonceStore } = await setup()
    const now = 1_000_000
    const token = await signAdminSsoToken(
      privateKey,
      { customerId: 'customer-1', email: 'owner@example.com', commerceInstanceId, audience },
      now,
    )
    const [payloadPart, signaturePart] = token.split('.')
    const tamperedPayload = Buffer.from(
      JSON.stringify({
        sub: 'customer-attacker',
        email: 'owner@example.com',
        instance: commerceInstanceId,
        aud: audience,
        exp: now + 60_000,
        nonce: 'forged-nonce',
      }),
    )
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    const tamperedToken = `${tamperedPayload}.${signaturePart}`
    expect(tamperedPayload).not.toBe(payloadPart)

    const result = await verifyAdminSsoToken(
      publicKey,
      tamperedToken,
      { audience, commerceInstanceId },
      nonceStore,
      now + 1_000,
    )
    expect(result).toEqual({ ok: false, error: 'BAD_SIGNATURE' })
  })

  it('signs and verifies correctly after exporting and re-importing the private key (persisted-secret round trip)', async () => {
    const { publicKey, privateKey } = await generateAdminSsoKeyPair()
    const exportedPrivate = await exportAdminSsoPrivateKeyBase64(privateKey)
    const exportedPublic = await exportAdminSsoPublicKeyBase64(publicKey)
    expect(exportedPrivate.length).toBeGreaterThan(0)
    expect(exportedPublic.length).toBeGreaterThan(0)

    const reimportedPrivateKey = await importAdminSsoPrivateKey(exportedPrivate)
    const nonceStore = createInMemoryAdminSsoNonceStore()
    const now = 1_000_000
    const token = await signAdminSsoToken(
      reimportedPrivateKey,
      { customerId: 'customer-1', email: 'owner@example.com', commerceInstanceId, audience },
      now,
    )

    const result = await verifyAdminSsoToken(
      publicKey,
      token,
      { audience, commerceInstanceId },
      nonceStore,
      now + 1_000,
    )
    expect(result.ok).toBe(true)
  })

  it('rejects a malformed token string', async () => {
    const { publicKey, nonceStore } = await setup()
    const result = await verifyAdminSsoToken(
      publicKey,
      'not-a-valid-token',
      { audience, commerceInstanceId },
      nonceStore,
      1_000_000,
    )
    expect(result).toEqual({ ok: false, error: 'MALFORMED' })
  })
})
