import { describe, expect, it } from 'vitest'

import {
  WEBHOOK_SECRET_OVERLAP_MS,
  getWebhookVerificationSecrets,
  validateWebhookRotationWindow,
} from './webhook-secret-rotation'

describe('webhook secret rotation', () => {
  const now = 1_800_000_000_000
  const secretName = 'GITHUB_WEBHOOK_SECRET'

  it('accepts active and previous secret only during the bounded overlap', () => {
    expect(
      getWebhookVerificationSecrets(
        {
          [secretName]: 'new',
          [`${secretName}_PREVIOUS`]: 'old',
          [`${secretName}_PREVIOUS_EXPIRES_AT`]: String(now + 1),
        },
        secretName,
        now,
      ),
    ).toEqual(['new', 'old'])
    expect(
      getWebhookVerificationSecrets(
        {
          [secretName]: 'new',
          [`${secretName}_PREVIOUS`]: 'old',
          [`${secretName}_PREVIOUS_EXPIRES_AT`]: String(now),
        },
        secretName,
        now,
      ),
    ).toEqual(['new'])
  })

  it('rejects an overlap longer than seven days or with no expiry', () => {
    expect(
      validateWebhookRotationWindow(
        {
          [secretName]: 'new',
          [`${secretName}_PREVIOUS`]: 'old',
          [`${secretName}_PREVIOUS_EXPIRES_AT`]: String(
            now + WEBHOOK_SECRET_OVERLAP_MS + 1,
          ),
        },
        secretName,
        now,
      ).valid,
    ).toBe(false)
    expect(
      validateWebhookRotationWindow(
        { [secretName]: 'new', [`${secretName}_PREVIOUS`]: 'old' },
        secretName,
        now,
      ).valid,
    ).toBe(false)
  })
})
