const DEFAULT_CURRENCY = 'usd'

export const createDefaultStoreUpdate = (defaultSalesChannelId: string) => ({
  default_sales_channel_id: defaultSalesChannelId,
  supported_currencies: [{ currency_code: DEFAULT_CURRENCY, is_default: true }],
})
