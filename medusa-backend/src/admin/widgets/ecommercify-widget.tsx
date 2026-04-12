import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useState, useEffect, useRef, useCallback, CSSProperties } from "react"

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
  const [pushing, setPushing] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [pushResult, setPushResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // sfSession is received via postMessage from the Ship Fast parent window.
  // React Router strips URL query params on SPA navigation, so postMessage is the
  // only reliable way to scope products to the currently open Ship Fast session.
  const [sfSession, setSfSession] = useState<string>("")
  const fetchedForSession = useRef<string>("")
  const importRanForSfSessionRef = useRef<string>("")

  const autoImportEnabled =
    typeof import.meta !== "undefined" &&
    ((import.meta as { env?: Record<string, string> }).env?.VITE_ECOMMERCIFY_AUTO_IMPORT === "true" ||
      (import.meta as { env?: Record<string, string> }).env?.VITE_ECOMMERCIFY_AUTO_IMPORT === "1")

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type !== "SF_SESSION_ID") return
      const id = String(e.data.sessionId || "").trim()
      if (!id) return
      setSfSession((prev) => {
        if (prev !== id) {
          setProducts([])
          setResult(null)
          setPushResult(null)
          fetchedForSession.current = ""
          importRanForSfSessionRef.current = ""
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
    const sid = String(sessionId || "").trim()
    if (!sid) {
      setError("No Ship Fast session. Open Medusa from the Ship Fast dashboard (embedded preview) so the session can be linked.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const url = `/admin/shipfast/products?sf_session=${encodeURIComponent(sid)}`
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

  const importAll = useCallback(async () => {
    if (!sfSession.trim() || !products.length) return
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
      if (data.synced > 0) setTimeout(() => window.location.reload(), 1500)
    } catch (e) {
      importRanForSfSessionRef.current = ""
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setImporting(false)
    }
  }, [sfSession, products])

  const pushToShipFast = useCallback(async () => {
    if (!sfSession.trim()) return
    setPushing(true)
    setError(null)
    setPushResult(null)
    setResult(null)
    try {
      const res = await fetch("/admin/shipfast/push-to-shipfast", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sfSession }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string; products?: number }
      if (!res.ok) throw new Error(data.error || "Could not update Ship Fast")
      setPushResult(`Updated Ship Fast preview with ${data.products ?? 0} product(s) from Medusa.`)
      setTimeout(() => window.location.reload(), 1400)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setPushing(false)
    }
  }, [sfSession])

  useEffect(() => {
    if (!autoImportEnabled) return
    if (!sfSession.trim() || loading || importing) return
    if (products.length === 0) return
    if (importRanForSfSessionRef.current === sfSession) return
    importRanForSfSessionRef.current = sfSession
    void importAll()
  }, [autoImportEnabled, sfSession, products.length, loading, importing, importAll])

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
          {!loading && products.length > 0 && (
            <div style={s.callout}>
              The <strong>Products</strong> table below is Medusa&apos;s saved catalog. It does not
              update when you switch Ship Fast sessions until you import. Use{' '}
              <strong>Replace Medusa catalog</strong> to wipe the server catalog and load only the
              products from <strong>this</strong> linked session (shown in the grid). After you edit
              products or prices in Medusa, use <strong>Update Ship Fast preview</strong> to write
              those changes into this session&apos;s site spec and refresh the Ship Fast preview
              (requires the same Medusa admin credentials on the Ship Fast server).
              {autoImportEnabled ? (
                <span> Auto-import is on (VITE_ECOMMERCIFY_AUTO_IMPORT).</span>
              ) : null}
            </div>
          )}
          {pushResult && (
            <div style={s.success}>
              ✅ {pushResult}
            </div>
          )}
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
                <span style={s.muted}>
                  {products.length} product(s) from this Ship Fast session
                </span>
                <div style={s.footerBtns}>
                  <button
                    type="button"
                    style={
                      pushing || importing || !sfSession.trim()
                        ? { ...s.btnSecondary, ...s.btnDisabled }
                        : s.btnSecondary
                    }
                    onClick={(e) => {
                      e.stopPropagation()
                      void pushToShipFast()
                    }}
                    disabled={pushing || importing || !sfSession.trim()}
                  >
                    {pushing ? "Updating…" : "Update Ship Fast preview"}
                  </button>
                  <button
                    type="button"
                    style={
                      importing || pushing || !sfSession.trim()
                        ? { ...s.btn, ...s.btnDisabled }
                        : s.btn
                    }
                    onClick={(e) => {
                      e.stopPropagation()
                      void importAll()
                    }}
                    disabled={importing || pushing || !sfSession.trim()}
                  >
                    {importing ? "Importing…" : `Replace Medusa catalog (${products.length})`}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Empty state */}
          {!loading && products.length === 0 && !error && (
            <div style={s.empty}>
              {!sfSession.trim() ? (
                <>
                  <p style={{ margin: 0 }}>Waiting for Ship Fast session…</p>
                  <p style={{ margin: "4px 0 0", ...s.muted }}>
                    Open Medusa from the Ship Fast dashboard (site preview embed) so your
                    workspace session is linked. Standalone Admin cannot receive the session
                    automatically.
                  </p>
                </>
              ) : (
                <>
                  <p style={{ margin: 0 }}>No ecommerce products found for this session.</p>
                  <p style={{ margin: "4px 0 0", ...s.muted }}>
                    Generate an ecommerce site in Ship Fast first, then refresh.
                  </p>
                  <button
                    style={{ ...s.btn, marginTop: 12 }}
                    onClick={() => fetchProducts(sfSession)}
                  >
                    Refresh
                  </button>
                </>
              )}
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
    flexDirection: "column",
    alignItems: "stretch",
    gap: 12,
    borderTop: "1px solid #f3f4f6",
    paddingTop: 14,
  },
  footerBtns: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "flex-end",
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
  btnDisabled: { background: "#9ca3af", cursor: "not-allowed", opacity: 0.85 },
  btnSecondary: {
    background: "#ffffff",
    color: "#111827",
    border: "1px solid #d1d5db",
    borderRadius: 7,
    padding: "8px 16px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
  },
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
  callout: {
    background: "#fffbeb",
    border: "1px solid #fcd34d",
    borderRadius: 8,
    padding: "12px 14px",
    marginBottom: 14,
    fontSize: 13,
    color: "#78350f",
    lineHeight: 1.45,
  },
}

export const config = defineWidgetConfig({
  zone: "product.list.before",
})

export default EcommercifyWidget
