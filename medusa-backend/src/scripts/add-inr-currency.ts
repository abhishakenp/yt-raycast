import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function addInrCurrency({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const storeModuleService = container.resolve(Modules.STORE)

  const [store] = await storeModuleService.listStores()
  if (!store) {
    logger.error("No store found.")
    return
  }

  // Ensure EUR (default), USD, and INR are all supported
  const desired = [
    { currency_code: "eur", is_default: true },
    { currency_code: "usd", is_default: false },
    { currency_code: "inr", is_default: false },
  ]

  await storeModuleService.updateStores(store.id, { supported_currencies: desired })
  logger.info(`Store "${store.name}" now supports: ${desired.map((c) => c.currency_code.toUpperCase()).join(", ")} (default: EUR)`)
}
