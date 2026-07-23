import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import {
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from '@medusajs/medusa/core-flows'

const DEFAULT_COUNTRY = 'us'
const DEFAULT_CURRENCY = 'usd'
const DEFAULT_REGION_NAME = 'United States'
const DEFAULT_SALES_CHANNEL_NAME = 'Ship Fast Default Sales Channel'
const DEFAULT_STOCK_LOCATION_NAME = 'Ship Fast Warehouse'

export default async function bootstrapShipFastMedusa({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const storeModuleService = container.resolve(Modules.STORE)

  logger.info('Bootstrapping Ship Fast Medusa production defaults.')

  const [store] = await storeModuleService.listStores()
  if (store === undefined) {
    throw new Error('Medusa store not found after migrations.')
  }

  const [salesChannel] = await salesChannelModuleService.listSalesChannels({
    name: DEFAULT_SALES_CHANNEL_NAME,
  })
  const defaultSalesChannel =
    salesChannel ??
    (
      await createSalesChannelsWorkflow(container).run({
        input: {
          salesChannelsData: [{ name: DEFAULT_SALES_CHANNEL_NAME }],
        },
      })
    ).result[0]

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel.id,
        supported_currencies: [{ currency_code: DEFAULT_CURRENCY }],
      },
    },
  })

  const regionQuery = await query.graph({
    entity: 'region',
    fields: ['id', 'name'],
    filters: { name: DEFAULT_REGION_NAME },
  })

  if (regionQuery.data.length === 0) {
    await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: DEFAULT_REGION_NAME,
            currency_code: DEFAULT_CURRENCY,
            countries: [DEFAULT_COUNTRY],
            payment_providers: ['pp_system_default'],
          },
        ],
      },
    })
  }

  const taxRegionQuery = await query.graph({
    entity: 'tax_region',
    fields: ['id', 'country_code'],
    filters: { country_code: DEFAULT_COUNTRY },
  })

  if (taxRegionQuery.data.length === 0) {
    await createTaxRegionsWorkflow(container).run({
      input: [
        {
          country_code: DEFAULT_COUNTRY,
          provider_id: 'tp_system',
        },
      ],
    })
  }

  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: 'default',
  })
  if (shippingProfiles.length === 0) {
    await createShippingProfilesWorkflow(container).run({
      input: {
        data: [
          {
            name: 'Default Shipping Profile',
            type: 'default',
          },
        ],
      },
    })
  }

  const stockLocationQuery = await query.graph({
    entity: 'stock_location',
    fields: ['id', 'name'],
    filters: { name: DEFAULT_STOCK_LOCATION_NAME },
  })

  const stockLocation =
    stockLocationQuery.data[0] ??
    (
      await createStockLocationsWorkflow(container).run({
        input: {
          locations: [
            {
              name: DEFAULT_STOCK_LOCATION_NAME,
              address: {
                address_1: '',
                city: 'New York',
                country_code: DEFAULT_COUNTRY.toUpperCase(),
              },
            },
          ],
        },
      })
    ).result[0]

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_location_id: stockLocation.id,
      },
    },
  })

  try {
    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: 'manual_manual',
      },
    })
  } catch {
    logger.info('Ship Fast stock location fulfillment link already exists.')
  }

  try {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocation.id,
        add: [defaultSalesChannel.id],
      },
    })
  } catch {
    logger.info('Ship Fast sales channel stock location link already exists.')
  }

  logger.info('Finished bootstrapping Ship Fast Medusa production defaults.')
}
