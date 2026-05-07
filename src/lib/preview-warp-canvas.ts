/**
 * Reusable “intro warp” canvas — same ribbon animation as the main dashboard intro,
 * sized to a container (iframe preview) instead of the full window.
 */

type PreviewWarpController = {
  start: () => void
  stop: () => void
}

export function createPreviewWarpController(
  canvasEl: HTMLCanvasElement,
): PreviewWarpController {
  let c: HTMLCanvasElement | null = null
  let ctx: CanvasRenderingContext2D | null = null
  let raf = 0
  let running = false
  let D = 1
  let W = 0
  let H = 0
  let ro: ResizeObserver | null = null
  const PTS = 200
  const SEG = 1.85
  const CYCLE = SEG + 2.0
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v)
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
  const col = (t: number) => {
    if (t < 0.34) {
      const u = t / 0.34
      return [lerp(20, 64, u) | 0, lerp(12, 36, u) | 0, lerp(48, 140, u) | 0]
    }
    if (t < 0.67) {
      const u = (t - 0.34) / 0.33
      return [lerp(64, 130, u) | 0, lerp(36, 72, u) | 0, lerp(140, 237, u) | 0]
    }
    const u = (t - 0.67) / 0.33
    return [lerp(130, 251, u) | 0, lerp(72, 191, u) | 0, lerp(237, 52, u) | 0]
  }
  const bezierArc = (p0: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }, p3: { x: number; y: number }) => {
    const pts: { x: number; y: number }[] = []
    const ns: { nx: number; ny: number }[] = []
    for (let i = 0; i <= PTS; i++) {
      const t = i / PTS
      const u = 1 - t
      pts.push({
        x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
        y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
      })
    }
    for (let i = 0; i <= PTS; i++) {
      const prev = pts[Math.max(0, i - 1)]
      const next = pts[Math.min(PTS, i + 1)]
      const dx = next.x - prev.x
      const dy = next.y - prev.y
      const l = Math.sqrt(dx * dx + dy * dy) || 0.001
      ns.push({ nx: -dy / l, ny: dx / l })
    }
    return { pts, norms: ns }
  }
  const arcA = bezierArc(
    { x: -0.1, y: -0.05 },
    { x: 0.18, y: 0.68 },
    { x: 0.82, y: 0.48 },
    { x: 1.15, y: 0.48 },
  )
  const arcB = bezierArc(
    { x: 1.12, y: 1.08 },
    { x: 0.75, y: 0.45 },
    { x: 0.28, y: 0.3 },
    { x: -0.12, y: -0.05 },
  )
  const arcs = [arcA, arcB]
  const vps = [
    { x: 1.5, y: 0.48 },
    { x: -0.5, y: -0.4 },
  ]
  const zSeq = [0.25, 0.9, 0.15, 1.0, 0.4, 0.75, 0.2, 0.95, 0.3, 0.6, 0.1, 0.85]
  let zIdx = 0
  let currentZ = 0.3
  let lastSeg = -1
  const passes = [
    { s: 10, a: 0.005 },
    { s: 6, a: 0.013 },
    { s: 3.5, a: 0.032 },
    { s: 2, a: 0.075 },
    { s: 1.2, a: 0.16 },
    { s: 1, a: 0.34 },
    { s: 0.12, a: 0.82, w: true as const },
  ]
  const tone = 0.62

  const onResize = () => {
    if (!c) return
    const parent = c.parentElement
    const w = parent ? parent.clientWidth : c.clientWidth
    const h = parent ? parent.clientHeight : c.clientHeight
    D = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2)
    W = c.width = Math.max(1, w) * D
    H = c.height = Math.max(1, h) * D
    c.style.width = `${Math.max(1, w)}px`
    c.style.height = `${Math.max(1, h)}px`
  }

  const draw = (ts: number) => {
    if (!running || !ctx) return
    const t = ts / 1000
    const segNum = Math.floor(t / CYCLE)
    const local = t - segNum * CYCLE
    const arcIdx = segNum % 2
    const arc = arcs[arcIdx]
    const vp = vps[arcIdx]
    const vpx = vp.x * W
    const vpy = vp.y * H
    if (segNum !== lastSeg) {
      lastSeg = segNum
      zIdx = (zIdx + 1) % zSeq.length
      currentZ = zSeq[zIdx]
    }
    ctx.clearRect(0, 0, W, H)
    if (local > SEG) {
      raf = requestAnimationFrame(draw)
      return
    }
    const master = local / SEG
    const p = easeOut(master)
    const drawProg = clamp(p * 2.5, 0, 1)
    const warp = easeOut(p)
    let fade = 1
    if (master > 0.6) fade = 1 - easeOut((master - 0.6) / 0.4)
    fade *= tone
    const z = currentZ
    const alphaBoost = (1 + warp * warp * 2) * fade
    const count = Math.max(3, Math.floor(drawProg * (PTS + 1)))
    if (fade < 0.01) {
      raf = requestAnimationFrame(draw)
      return
    }
    for (let pi = 0; pi < passes.length; pi++) {
      const pass = passes[pi]
      ctx.beginPath()
      for (let k = 0; k < count; k++) {
        const pt = arc.pts[k]
        const n = arc.norms[k]
        let px = pt.x * W
        let py = pt.y * H
        const age = k / (count - 1 || 1)
        if (warp > 0) {
          const sf = age * age * age
          const stretch = warp * (0.02 + sf * 0.98)
          px = lerp(px, vpx, stretch)
          py = lerp(py, vpy, stretch)
        }
        let base = (8 + age * age * 28) * D + z * z * 12 * D
        if (warp > 0) base += warp * age * age * (195 + z * 245) * D
        const w = base * pass.s * (1 + warp * age * 0.14)
        if (k === 0) ctx.moveTo(px + n.nx * w, py + n.ny * w)
        else ctx.lineTo(px + n.nx * w, py + n.ny * w)
      }
      for (let k = count - 1; k >= 0; k--) {
        const pt = arc.pts[k]
        const n = arc.norms[k]
        let px = pt.x * W
        let py = pt.y * H
        const age = k / (count - 1 || 1)
        if (warp > 0) {
          const sf = age * age * age
          const stretch = warp * (0.02 + sf * 0.98)
          px = lerp(px, vpx, stretch)
          py = lerp(py, vpy, stretch)
        }
        let base = (8 + age * age * 28) * D + z * z * 12 * D
        if (warp > 0) base += warp * age * age * (195 + z * 245) * D
        const w = base * pass.s * (1 + warp * age * 0.14)
        ctx.lineTo(px - n.nx * w, py - n.ny * w)
      }
      ctx.closePath()
      const p0 = arc.pts[0]
      const pN = arc.pts[count - 1]
      let x0 = p0.x * W
      let y0 = p0.y * H
      let xN = pN.x * W
      let yN = pN.y * H
      if (warp > 0) {
        xN = lerp(xN, vpx, warp)
        yN = lerp(yN, vpy, warp)
        x0 = lerp(x0, vpx, warp * 0.02)
        y0 = lerp(y0, vpy, warp * 0.02)
      }
      const grd = ctx.createLinearGradient(x0, y0, xN, yN)
      const c0 = col(0)
      const cM = col(0.5)
      const c1 = col(1)
      const a = pass.a * alphaBoost
      if (pass.w) {
        grd.addColorStop(0, `rgba(220,210,255,${a * 0.22})`)
        grd.addColorStop(0.5, `rgba(248,242,255,${a * 0.52})`)
        grd.addColorStop(1, `rgba(255,252,255,${a})`)
      } else {
        grd.addColorStop(0, `rgba(${c0[0]},${c0[1]},${c0[2]},${a * 0.42})`)
        grd.addColorStop(0.35, `rgba(${cM[0]},${cM[1]},${cM[2]},${a * 0.78})`)
        grd.addColorStop(1, `rgba(${c1[0]},${c1[1]},${c1[2]},${a})`)
      }
      ctx.fillStyle = grd
      ctx.fill()
    }
    if (warp < 0.9 && fade > 0.1) {
      const hp = arc.pts[count - 1]
      let hx = hp.x * W
      let hy = hp.y * H
      if (warp > 0) {
        hx = lerp(hx, vpx, warp)
        hy = lerp(hy, vpy, warp)
      }
      const hc = col(count / PTS)
      const hsz = (18 + warp * 56 + z * 16) * D
      const g1 = ctx.createRadialGradient(hx, hy, 0, hx, hy, hsz * 4)
      g1.addColorStop(0, `rgba(255,250,255,${0.82 * fade})`)
      g1.addColorStop(0.08, `rgba(${hc[0]},${hc[1]},${hc[2]},${0.22 * fade})`)
      g1.addColorStop(0.4, `rgba(${hc[0]},${hc[1]},${hc[2]},0.03)`)
      g1.addColorStop(1, 'transparent')
      ctx.fillStyle = g1
      ctx.beginPath()
      ctx.arc(hx, hy, hsz * 4, 0, Math.PI * 2)
      ctx.fill()
      const g2 = ctx.createRadialGradient(hx, hy, 0, hx, hy, hsz * 0.4)
      g2.addColorStop(0, `rgba(255,252,255,${fade})`)
      g2.addColorStop(1, 'transparent')
      ctx.fillStyle = g2
      ctx.beginPath()
      ctx.arc(hx, hy, hsz * 0.4, 0, Math.PI * 2)
      ctx.fill()
    }
    const vg = ctx.createRadialGradient(W / 2, H / 2, W * 0.15, W / 2, H / 2, W * 0.9)
    vg.addColorStop(0, 'rgba(0,0,0,0)')
    vg.addColorStop(1, `rgba(7,7,16,${lerp(0.22, 0.05, warp)})`)
    ctx.fillStyle = vg
    ctx.fillRect(0, 0, W, H)
    raf = requestAnimationFrame(draw)
  }

  return {
    start() {
      c = canvasEl
      ctx = c.getContext('2d')
      if (!ctx) return
      if (running) return
      running = true
      onResize()
      if (typeof ResizeObserver !== 'undefined' && c.parentElement) {
        ro = new ResizeObserver(() => onResize())
        ro.observe(c.parentElement)
      }
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', onResize)
      }
      raf = requestAnimationFrame(draw)
    },
    stop() {
      running = false
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', onResize)
      }
      ro?.disconnect()
      ro = null
      if (c && ctx) {
        ctx.clearRect(0, 0, c.width || 0, c.height || 0)
      }
    },
  }
}
