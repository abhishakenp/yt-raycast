import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"

const slugify = (s: string) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "product"

// Converts a display price to Medusa's smallest-unit integer (cents / paise / etc.)
// All extracted prices are display values (e.g. 299 for ₹299, 49.99 for $49.99)
const parsePriceToSmallestUnit = (price: unknown): number => {
  if (price == null) return 1999
  const n =
    typeof price === "number" && Number.isFinite(price)
      ? price
      : parseFloat(String(price).replace(/[^0-9.]/g, ""))
  if (!Number.isFinite(n)) return 1999
  // If already looks like a cents/paise value (>= 10000), use as-is
  if (n >= 10000) return Math.round(n)
  // Otherwise multiply by 100 to get smallest unit
  return Math.round(n * 100)
}

type ShipFastProduct = {
  id?: string
  title?: string
  handle?: string
  description?: string
  image?: string
  price?: unknown
  currency?: string
  sessionId?: string
}

// POST /admin/shipfast/import — wipe existing products, then create Ship Fast products in Medusa
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as { products?: ShipFastProduct[] }
  const products = body?.products

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: "No products provided" })
  }

  const sessionIds = products
    .map((p) => (p.sessionId != null && String(p.sessionId).trim() ? String(p.sessionId).trim() : null))
    .filter((id): id is string => id != null)
  if (sessionIds.length > 0) {
    const unique = new Set(sessionIds)
    if (unique.size > 1) {
      return res.status(400).json({ error: "All products must belong to the same Ship Fast session" })
    }
  }

  const defaultCurrency = (process.env.MEDUSA_DEFAULT_CURRENCY || "usd").toLowerCase()

  // Clear all existing products first so each session starts with a clean slate
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const productService = req.scope.resolve(Modules.PRODUCT)
    const { data: existing } = await query.graph({ entity: "product", fields: ["id"] })
    if (existing.length > 0) {
      await productService.deleteProducts(existing.map((p: { id: string }) => p.id))
    }
  } catch {
    // Non-fatal — proceed with import even if cleanup fails
  }

  let synced = 0
  const errors: string[] = []

  for (const p of products) {
    const title = String(p.title || "Product").trim()
    const handle = p.handle ? String(p.handle).trim() : slugify(title)
    const amount = parsePriceToSmallestUnit(p.price)
    const currency = p.currency ? p.currency.toLowerCase() : defaultCurrency

    // Build variant separately so sku is only added when available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variant: Record<string, any> = {
      title: "Default",
      options: { Default: "Default" },
      prices: [{ currency_code: currency, amount }],
    }
    if (p.id) variant.sku = String(p.id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productInput: Record<string, any> = {
      title,
      handle,
      status: ProductStatus.PUBLISHED,
      options: [{ title: "Default", values: ["Default"] }],
      variants: [variant],
    }
    if (p.description) productInput.description = String(p.description)
    if (p.image) productInput.thumbnail = String(p.image)

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await createProductsWorkflow(req.scope).run({ input: { products: [productInput] } as any })
      synced++
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      errors.push(`${handle}: ${msg}`)
    }
  }

  res.json({ ok: true, synced, errors })
}
