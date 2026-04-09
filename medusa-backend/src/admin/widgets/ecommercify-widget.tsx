import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useState, useEffect, useRef, CSSProperties } from "react"

type ShipFastProduct = {
  id: string
  title: string
  handle: string
  description?: string
  price?: number
  currency?: string
  image?: string
  category?: string
  sessionId: string
  sessionPrompt: string
}

type ImportResult = { synced: number; errors: string[] }

const fmt = (price: number | undefined, currency: string | undefined) => {
  if (price == null) return null
  const amount = price > 0 && price < 1000 ? price : price / 100
  return `${(currency || "USD").toUpperCase()} ${amount.toFixed(2)}`
}

const EcommercifyWidget = () => {
  const [open, setOpen] = useState(false)
  const [products, setProducts] = useState<ShipFastProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  // sfSession is received via postMessage from the Ship Fast parent window.
  // React Router strips URL query params on SPA navigation, so postMessage is the
  // only reliable way to scope products to the currently open Ship Fast session.
  const [sfSession, setSfSession] = useState<string>("")
  const fetchedForSession = useRef<string>("")

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type !== "SF_SESSION_ID") return
      const id = String(e.data.sessionId || "").trim()
      if (!id) return
      setSfSession((prev) => {
        if (prev !== id) {
          setProducts([])
          setResult(null)
          fetchedForSession.current = ""
        }
        return id
      })
      // Auto-fetch products for this session when the panel is already open
      setOpen((isOpen) => {
        if (isOpen && fetchedForSession.current !== id) fetchProducts(id)
        return isOpen
      })
    }
    window.addEventListener("message", handler)

    // Announce readiness to the Ship Fast parent window so it can reply with the
    // session ID. This request-response pattern avoids React Router timing issues
    // where the parent's setTimeout fires before this widget has mounted.
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "SF_WIDGET_READY" }, "*")
    }

    return () => window.removeEventListener("message", handler)
  }, [])

  const toggle = () => {
    const next = !open
    setOpen(next)
    // Only fetch if we have a session ID — without one we'd pull all sessions' products
    if (next && sfSession && products.length === 0 && !loading) fetchProducts(sfSession)
  }

  const fetchProducts = async (sessionId: string) => {
    setLoading(true)
    setError(null)
    try {
      const url = sessionId
        ? `/admin/shipfast/products?sf_session=${encodeURIComponent(sessionId)}`
        : "/admin/shipfast/products"
      const res = await fetch(url, { credentials: "include" })
      const data = (await res.json()) as { products?: ShipFastProduct[]; error?: string }
      if (!res.ok) throw new Error(data.error || "Fetch failed")
      setProducts(data.products || [])
      fetchedForSession.current = sessionId
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  const importAll = async () => {
    if (!products.length) return
    setImporting(true)
    setResult(null)
    setError(null)
    try {
      const res = await fetch("/admin/shipfast/import", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      })
      const data = (await res.json()) as ImportResult & { error?: string }
      if (!res.ok) throw new Error(data.error || "Import failed")
      setResult({ synced: data.synced, errors: data.errors || [] })
      // After successful import reload the page so the product list updates
      if (data.synced > 0) setTimeout(() => window.location.reload(), 1500)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setImporting(false)
    }
  }

  return (
    <div style={{ ...s.wrap, ...(open ? s.wrapOpen : {}) }}>
      {/* ── Header ── */}
      <div style={s.header} onClick={toggle} role="button" aria-expanded={open}>
        <div style={s.hLeft}>
          <span style={s.bolt}>⚡</span>
          <div>
            <span style={s.label}>Ecommercify</span>
            <span style={s.hint}> — pull products from Ship Fast into Medusa</span>
          </div>
        </div>
        <span style={s.chevron}>{open ? "▲" : "▼"}</span>
      </div>

      {/* ── Body ── */}
      {open && (
        <div style={s.body}>
          {/* Status messages */}
          {loading && <p style={s.muted}>Contacting Ship Fast…</p>}
          {error && <p style={s.err}>{error}</p>}
          {result && (
            <div style={s.success}>
              ✅ {result.synced} product(s) imported into Medusa.
              {result.errors.length > 0 && (
                <div style={s.err}>{result.errors.join(", ")}</div>
              )}
            </div>
          )}

          {/* Product grid */}
          {!loading && products.length > 0 && (
            <>
              <div style={s.grid}>
                {products.map((p) => (
                  <div key={`${p.sessionId}-${p.id}`} style={s.card}>
                    {p.image ? (
                      <img src={p.image} alt={p.title} style={s.thumb} />
                    ) : (
                      <div style={s.thumbPlaceholder}>🛍</div>
                    )}
                    <div style={s.cardBody}>
                      <div style={s.cardTitle}>{p.title}</div>
                      {fmt(p.price, p.currency) && (
                        <div style={s.price}>{fmt(p.price, p.currency)}</div>
                      )}
                      {p.category && <div style={s.tag}>{p.category}</div>}
                      {p.sessionPrompt && (
                        <div style={s.session} title={p.sessionPrompt}>
                          {p.sessionPrompt.slice(0, 32)}…
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={s.footer}>
                <span style={s.muted}>{products.length} product(s) found in Ship Fast sessions</span>
                <button
                  style={importing ? { ...s.btn, ...s.btnDisabled } : s.btn}
                  onClick={importAll}
                  disabled={importing}
                >
                  {importing ? "Importing…" : `Import All (${products.length})`}
                </button>
              </div>
            </>
          )}

          {/* Empty state */}
          {!loading && products.length === 0 && !error && (
            <div style={s.empty}>
              <p style={{ margin: 0 }}>No ecommerce products found in Ship Fast.</p>
              <p style={{ margin: "4px 0 0", ...s.muted }}>
                Generate an ecommerce site in Ship Fast first, then come back here.
              </p>
              <button style={{ ...s.btn, marginTop: 12 }} onClick={() => fetchProducts(sfSession)}>
                Refresh
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const s: Record<string, CSSProperties> = {
  wrap: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    marginBottom: 16,
    background: "#ffffff",
    overflow: "hidden",
    transition: "box-shadow 0.15s",
  },
  wrapOpen: {
    boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "13px 18px",
    cursor: "pointer",
    userSelect: "none",
    background: "linear-gradient(90deg,#f0fdf4 0%,#f8fafc 100%)",
    borderBottom: "1px solid transparent",
  },
  hLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  bolt: { fontSize: 20 },
  label: { fontWeight: 700, fontSize: 15, color: "#111827" },
  hint: { fontSize: 13, color: "#6b7280" },
  chevron: { fontSize: 12, color: "#9ca3af" },
  body: {
    padding: "16px 18px",
    borderTop: "1px solid #e5e7eb",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: 12,
    marginBottom: 16,
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
    background: "#fafafa",
    transition: "box-shadow 0.1s",
  },
  thumb: { width: "100%", height: 110, objectFit: "cover", display: "block" },
  thumbPlaceholder: {
    width: "100%",
    height: 110,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 32,
    background: "#f3f4f6",
  },
  cardBody: { padding: "8px 10px" },
  cardTitle: { fontWeight: 600, fontSize: 13, color: "#111827", marginBottom: 3 },
  price: { fontSize: 12, color: "#059669", fontWeight: 600 },
  tag: {
    display: "inline-block",
    marginTop: 4,
    padding: "1px 6px",
    background: "#eff6ff",
    borderRadius: 4,
    fontSize: 11,
    color: "#3b82f6",
  },
  session: { marginTop: 4, fontSize: 10, color: "#9ca3af", overflow: "hidden", whiteSpace: "nowrap" },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: "1px solid #f3f4f6",
    paddingTop: 14,
  },
  btn: {
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 7,
    padding: "8px 20px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
  },
  btnDisabled: { background: "#9ca3af", cursor: "not-allowed" },
  success: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: 7,
    padding: "10px 14px",
    marginBottom: 14,
    fontSize: 13,
    color: "#15803d",
  },
  err: { color: "#dc2626", fontSize: 13, margin: "4px 0" },
  muted: { fontSize: 13, color: "#6b7280", margin: 0 },
  empty: { textAlign: "center", padding: "20px 0", fontSize: 13, color: "#374151" },
}

export const config = defineWidgetConfig({
  zone: "product.list.before",
})

export default EcommercifyWidget
