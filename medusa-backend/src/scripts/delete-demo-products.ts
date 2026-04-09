import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

const DEMO_HANDLES = ["t-shirt", "sweatshirt", "sweatpants", "shorts"]

export default async function deleteDemoProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productService = container.resolve(Modules.PRODUCT)

  logger.info("Looking for Medusa demo products to delete…")

  // Use query.graph which is reliable across Medusa v2 versions
  const { data: allProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "title"],
  })

  const toDelete = allProducts.filter(
    (p: { handle: string }) => DEMO_HANDLES.includes(p.handle)
  )

  if (toDelete.length === 0) {
    logger.info("No demo products found. Nothing to delete.")
    return
  }

  for (const p of toDelete as Array<{ id: string; handle: string; title: string }>) {
    try {
      await productService.deleteProducts([p.id])
      logger.info(`  Deleted: "${p.title}" (handle=${p.handle}, id=${p.id})`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      logger.warn(`  Failed to delete "${p.handle}": ${msg}`)
    }
  }

  logger.info(`Done. Deleted ${toDelete.length} demo product(s).`)
}
