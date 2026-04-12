import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const SHIP_FAST_URL = process.env.SHIP_FAST_URL || "http://localhost:7420"

// GET /admin/shipfast/products — proxy Ship Fast ecommerce products into the admin
// Accepts ?sf_session=<sessionId> to scope results to the active Ship Fast session
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const sfSession = String((req.query as Record<string, string>).sf_session || "").trim()
  if (!sfSession) {
    return res.json({
      products: [],
      total: 0,
      message: "sf_session query parameter is required (open Medusa from the Ship Fast dashboard embed)",
    })
  }
  const url = new URL(`${SHIP_FAST_URL}/api/ecommercify/products`)
  url.searchParams.set("sessionId", sfSession)

  try {
    const response = await fetch(url.toString())
    if (!response.ok) {
      return res.status(502).json({ error: "Could not reach Ship Fast server" })
    }
    const data = await response.json()
    res.json(data)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    res.status(503).json({ error: `Ship Fast unreachable: ${msg}` })
  }
}
