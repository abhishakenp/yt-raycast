import { describe, expect, it } from 'vitest'

import { createDefaultStoreUpdate } from '../medusa-backend/src/scripts/bootstrap'

describe('Ship Fast Medusa bootstrap store update', () => {
  it('marks USD as the default supported store currency', () => {
    expect(createDefaultStoreUpdate('sc_default')).toEqual({
      default_sales_channel_id: 'sc_default',
      supported_currencies: [{ currency_code: 'usd', is_default: true }],
    })
  })
})
