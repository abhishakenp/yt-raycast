import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const SHIP_FAST_URL = process.env.SHIP_FAST_URL || "http://localhost:7420"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as { sessionId?: string }
  const sessionId = String(body?.sessionId || "").trim()
  if (!sessionId) {
    return res.status(400).json({ ok: false, error: "sessionId is required" })
  }
  const url = new URL(`${SHIP_FAST_URL}/api/ecommercify/push-from-medusa`)
  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string; products?: number }
    if (!response.ok) {
      return res.status(response.status).json(data)
    }
    res.json(data)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    res.status(503).json({ ok: false, error: `Ship Fast unreachable: ${msg}` })
  }
}
