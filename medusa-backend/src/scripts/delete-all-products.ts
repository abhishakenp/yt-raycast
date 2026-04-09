import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function deleteAllProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productService = container.resolve(Modules.PRODUCT)

  logger.info("Loading all products from Medusa…")

  const { data: allProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "title"],
  })

  if (allProducts.length === 0) {
    logger.info("No products found. Nothing to delete.")
    return
  }

  logger.info(`Found ${allProducts.length} product(s). Deleting…`)

  for (const p of allProducts as Array<{ id: string; handle: string; title: string }>) {
    try {
      await productService.deleteProducts([p.id])
      logger.info(`  Deleted: "${p.title}" (handle=${p.handle})`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      logger.warn(`  Failed to delete "${p.handle}": ${msg}`)
    }
  }

  logger.info(`Done. Deleted ${allProducts.length} product(s).`)
}
