/**
 * CmsifyAnimation — React Scan–style DOM scanning overlay
 * Renders animated colored boxes over the preview iframe during Sanity provisioning.
 */
class CmsifyAnimation {
  constructor(previewStageEl, previewIframeEl) {
    this.stage = previewStageEl
    this.iframe = previewIframeEl
    this.overlay = null
    this.statusEl = null
    this.boxes = [] // { el, color, colorRgb, label }
    this.running = false
    this.rafId = null
    this.startTime = 0
    this.flashTimeout = null
    this.styleTag = null

    this._palette = [
      { hex: '#00d9ff', rgb: '0,217,255', label: 'cyan' },
      { hex: '#ff6b35', rgb: '255,107,53', label: 'orange' },
      { hex: '#7c3aed', rgb: '124,58,237', label: 'violet' },
      { hex: '#10b981', rgb: '16,185,129', label: 'green' },
      { hex: '#f59e0b', rgb: '245,158,11', label: 'amber' },
      { hex: '#ec4899', rgb: '236,72,153', label: 'pink' },
    ]

    this._stages = [
      { at: 0, text: 'Detecting content regions…' },
      { at: 2000, text: 'Mapping editable fields…' },
      { at: 4000, text: 'Connecting to CMS…' },
      { at: 6500, text: 'Almost ready…' },
    ]

    this._elementSelectors = [
      { sel: 'h1', label: 'heading' },
      { sel: 'h2', label: 'heading' },
      { sel: 'h3', label: 'subheading' },
      { sel: 'h4', label: 'subheading' },
      { sel: 'p', label: 'paragraph' },
      { sel: 'img', label: 'image' },
      { sel: 'nav', label: 'nav' },
      { sel: 'a', label: 'link' },
      { sel: 'button', label: 'button' },
      { sel: 'section', label: 'section' },
      { sel: '[class*="hero"]', label: 'hero' },
      { sel: '[class*="card"]', label: 'card' },
      { sel: '[class*="feature"]', label: 'feature' },
    ]
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  start() {
    if (this.running) return
    this.running = true
    this.startTime = performance.now()

    this._injectStyles()
    this._buildOverlay()

    const rects = this._collectRects()
    this._createBoxes(rects)
    this._runFlashLoop()
    this._runStageLoop()
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.rafId)
    clearTimeout(this.flashTimeout)
    clearTimeout(this._stageTimeout)

    if (this.overlay) {
      // Fade the whole overlay out before removing
      this.overlay.style.transition = 'opacity 0.5s ease'
      this.overlay.style.opacity = '0'
      setTimeout(() => {
        if (this.overlay && this.overlay.parentNode) {
          this.overlay.parentNode.removeChild(this.overlay)
        }
        this.overlay = null
        this.boxes = []
      }, 520)
    }
  }

  // ─── Setup ───────────────────────────────────────────────────────────────────

  _injectStyles() {
    if (document.getElementById('cmsify-animation-styles')) return
    const style = document.createElement('style')
    style.id = 'cmsify-animation-styles'
    style.textContent = `
      .cmsify-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 100;
        overflow: hidden;
      }
      .cmsify-box {
        position: absolute;
        border: 2px solid var(--box-color);
        box-shadow: 0 0 8px var(--box-color), inset 0 0 8px rgba(var(--box-color-rgb), 0.08);
        border-radius: 3px;
        opacity: 0;
        transition: opacity 0.12s ease, box-shadow 0.12s ease;
        pointer-events: none;
      }
      .cmsify-box.active {
        opacity: 1;
      }
      .cmsify-box.pulse {
        box-shadow:
          0 0 18px 4px var(--box-color),
          inset 0 0 14px rgba(var(--box-color-rgb), 0.18);
      }
      .cmsify-box-label {
        position: absolute;
        top: -19px;
        left: 0;
        font-size: 9px;
        font-family: 'SF Mono', 'Fira Code', monospace;
        color: var(--box-color);
        background: rgba(0,0,0,0.82);
        padding: 1px 5px;
        border-radius: 2px;
        white-space: nowrap;
        letter-spacing: 0.04em;
        line-height: 16px;
      }
      .cmsify-status {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(6, 6, 20, 0.88);
        color: #e8e8f0;
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: 12px;
        padding: 8px 20px;
        border-radius: 24px;
        border: 1px solid rgba(255,255,255,0.12);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        letter-spacing: 0.06em;
        white-space: nowrap;
        transition: opacity 0.3s ease;
      }
      .cmsify-status::before {
        content: '';
        display: inline-block;
        width: 6px;
        height: 6px;
        background: #00d9ff;
        border-radius: 50%;
        margin-right: 8px;
        vertical-align: middle;
        animation: cmsify-dot-pulse 1.1s ease-in-out infinite;
      }
      @keyframes cmsify-dot-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%       { opacity: 0.35; transform: scale(0.7); }
      }
    `
    document.head.appendChild(style)
    this.styleTag = style
  }

  _buildOverlay() {
    const overlay = document.createElement('div')
    overlay.className = 'cmsify-overlay'
    overlay.id = 'cmsify-overlay'

    const status = document.createElement('div')
    status.className = 'cmsify-status'
    status.textContent = this._stages[0].text
    overlay.appendChild(status)

    this.stage.style.position = 'relative'
    this.stage.appendChild(overlay)
    this.overlay = overlay
    this.statusEl = status
  }

  // ─── DOM scanning ────────────────────────────────────────────────────────────

  _collectRects() {
    let rects = []

    try {
      const iDoc = this.iframe.contentDocument || this.iframe.contentWindow?.document
      if (iDoc && iDoc.body) {
        const stageRect = this.stage.getBoundingClientRect()
        const iframeRect = this.iframe.getBoundingClientRect()
        const offsetX = iframeRect.left - stageRect.left
        const offsetY = iframeRect.top - stageRect.top

        for (const { sel, label } of this._elementSelectors) {
          try {
            const els = iDoc.querySelectorAll(sel)
            els.forEach((el) => {
              const r = el.getBoundingClientRect()
              // Skip invisible or absurdly large/tiny elements
              if (r.width < 10 || r.height < 5) return
              if (r.width > 2000 || r.height > 1200) return
              // Skip elements scrolled out of view
              if (r.bottom < 0 || r.top > 4000) return
              rects.push({
                x: r.left + offsetX,
                y: r.top + offsetY,
                w: r.width,
                h: r.height,
                label,
              })
            })
          } catch (_) {
            /* skip selector errors */
          }
        }
      }
    } catch (_) {
      // Cross-origin or inaccessible — fall through to synthetic layout
    }

    // Deduplicate heavily-overlapping boxes (keep first encountered)
    rects = this._dedup(rects)

    // If we got nothing useful, generate a plausible synthetic layout
    if (rects.length < 4) {
      rects = this._syntheticLayout()
    }

    return rects.slice(0, 48) // cap for perf
  }

  _dedup(rects) {
    const out = []
    for (const r of rects) {
      const overlaps = out.some((o) => {
        const ix = Math.max(0, Math.min(r.x + r.w, o.x + o.w) - Math.max(r.x, o.x))
        const iy = Math.max(0, Math.min(r.y + r.h, o.y + o.h) - Math.max(r.y, o.y))
        const overlap = ix * iy
        const smaller = Math.min(r.w * r.h, o.w * o.h)
        return smaller > 0 && overlap / smaller > 0.72
      })
      if (!overlaps) out.push(r)
    }
    return out
  }

  _syntheticLayout() {
    // Reasonable approximation of a typical marketing page
    const W = this.iframe.offsetWidth || 960
    const H = this.iframe.offsetHeight || 640
    return [
      { x: 0, y: 0, w: W, h: 64, label: 'nav' },
      { x: W * 0.08, y: 80, w: W * 0.84, h: 200, label: 'hero' },
      { x: W * 0.2, y: 100, w: W * 0.6, h: 48, label: 'heading' },
      { x: W * 0.25, y: 160, w: W * 0.5, h: 28, label: 'paragraph' },
      { x: W * 0.35, y: 210, w: W * 0.3, h: 36, label: 'button' },
      { x: W * 0.05, y: 320, w: W * 0.27, h: 160, label: 'card' },
      { x: W * 0.365, y: 320, w: W * 0.27, h: 160, label: 'card' },
      { x: W * 0.68, y: 320, w: W * 0.27, h: 160, label: 'card' },
      { x: W * 0.1, y: 530, w: W * 0.8, h: 40, label: 'heading' },
      { x: W * 0.15, y: 590, w: W * 0.7, h: 80, label: 'feature' },
      { x: W * 0.15, y: 690, w: W * 0.7, h: 80, label: 'feature' },
      { x: 0, y: H - 60, w: W, h: 60, label: 'section' },
    ]
  }

  // ─── Box creation ─────────────────────────────────────────────────────────

  _createBoxes(rects) {
    this.boxes = []
    rects.forEach((r, i) => {
      const color = this._palette[i % this._palette.length]
      const box = document.createElement('div')
      box.className = 'cmsify-box'
      box.style.cssText = [
        `left:${r.x}px`,
        `top:${r.y}px`,
        `width:${r.w}px`,
        `height:${r.h}px`,
        `--box-color:${color.hex}`,
        `--box-color-rgb:${color.rgb}`,
      ].join(';')

      const lbl = document.createElement('span')
      lbl.className = 'cmsify-box-label'
      lbl.textContent = r.label
      box.appendChild(lbl)

      this.overlay.insertBefore(box, this.statusEl)
      this.boxes.push({ el: box, color })
    })
  }

  // ─── Flash loop ───────────────────────────────────────────────────────────

  _runFlashLoop() {
    if (!this.running) return

    const elapsed = performance.now() - this.startTime
    const batchSize = elapsed < 4000 ? 6 : elapsed < 6000 ? 3 : 1
    const interval = elapsed < 2000 ? 280 : elapsed < 4000 ? 380 : elapsed < 6000 ? 560 : 900

    // Stage 3 (4–6s): pulse ALL boxes together slowly
    if (elapsed >= 4000 && elapsed < 6500) {
      this.boxes.forEach((b) => {
        b.el.classList.add('active', 'pulse')
      })
      this.flashTimeout = setTimeout(() => this._runFlashLoop(), interval)
      return
    }

    // Stage 4 (6.5s+): fade out one box at a time
    if (elapsed >= 6500) {
      const visible = this.boxes.filter((b) => b.el.classList.contains('active'))
      const toHide = visible.slice(0, Math.ceil(visible.length / 4) || 1)
      toHide.forEach((b) => {
        b.el.classList.remove('active', 'pulse')
      })
      if (visible.length > 0) {
        this.flashTimeout = setTimeout(() => this._runFlashLoop(), interval)
      }
      return
    }

    // Stages 1–2: wave of random boxes
    // First, clear all
    this.boxes.forEach((b) => b.el.classList.remove('active', 'pulse'))

    // Pick a random subset
    const shuffled = [...this.boxes].sort(() => Math.random() - 0.5)
    const batch = shuffled.slice(0, batchSize)
    batch.forEach((b) => b.el.classList.add('active'))

    // Brief pulse on half of them
    setTimeout(() => {
      batch.slice(0, Math.ceil(batchSize / 2)).forEach((b) => b.el.classList.add('pulse'))
      setTimeout(() => {
        batch.forEach((b) => b.el.classList.remove('pulse'))
      }, 120)
    }, 100)

    this.flashTimeout = setTimeout(() => this._runFlashLoop(), interval)
  }

  // ─── Stage text loop ──────────────────────────────────────────────────────

  _runStageLoop() {
    if (!this.running || !this.statusEl) return
    const elapsed = performance.now() - this.startTime
    let currentStage = this._stages[0]
    for (const s of this._stages) {
      if (elapsed >= s.at) currentStage = s
    }
    if (this.statusEl.textContent !== currentStage.text) {
      this.statusEl.style.opacity = '0'
      setTimeout(() => {
        if (this.statusEl) {
          this.statusEl.textContent = currentStage.text
          this.statusEl.style.opacity = '1'
        }
      }, 180)
    }
    if (elapsed < 10000) {
      this._stageTimeout = setTimeout(() => this._runStageLoop(), 250)
    }
  }
}

// Make available as global for inline script usage
window.CmsifyAnimation = CmsifyAnimation
