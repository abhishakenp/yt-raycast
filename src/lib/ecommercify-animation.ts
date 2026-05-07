/**
 * EcommercifyAnimation
 * Full-screen Medusa provisioning loading overlay.
 * Self-contained: injects its own <style> block, mounts into a given element.
 */

const ECOMMERCIFY_STYLE_ID = 'ecommercify-animation-styles'

function injectStyles(): void {
  if (document.getElementById(ECOMMERCIFY_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = ECOMMERCIFY_STYLE_ID
  style.textContent = /* css */ `
    /* ─── Overlay shell ─── */
    .ecommercify-overlay {
      position: absolute;
      inset: 0;
      background: #000;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      /* Must stack above the preview iframe (which is often composited in its own layer). */
      z-index: 500;
      isolation: isolate;
      transform: translateZ(0);
      pointer-events: auto;
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace;
    }

    /* ─── Card field: oversized rotated container ─── */
    .ecommercify-card-field {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .ecommercify-card-grid {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 220vmax;
      height: 220vmax;
      transform: translate(-50%, -50%) rotate(-45deg);
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;
      gap: 18px;
      padding: 18px;
    }

    /* ─── Individual card ─── */
    .ecommercify-card {
      flex-shrink: 0;
      width: 180px;
      height: 240px;
      border-radius: 10px;
      background: #161616;
      border: 1px solid #222;
      padding: 16px 14px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      position: relative;
      overflow: hidden;
    }

    /* Shimmer sweep */
    .ecommercify-card::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        105deg,
        transparent 20%,
        rgba(255, 255, 255, 0.04) 38%,
        rgba(255, 255, 255, 0.09) 50%,
        rgba(255, 255, 255, 0.04) 62%,
        transparent 80%
      );
      background-size: 300% 100%;
      background-position: 200% center;
      animation: ecommercify-shimmer 2.8s ease-in-out infinite;
    }

    @keyframes ecommercify-shimmer {
      0%   { background-position: 200% center; }
      60%  { background-position: -100% center; }
      100% { background-position: -100% center; }
    }

    /* Image placeholder */
    .ecommercify-card-img {
      width: 100%;
      height: 90px;
      border-radius: 6px;
      background: #1e1e1e;
      flex-shrink: 0;
    }

    /* Text line skeletons */
    .ecommercify-card-line {
      height: 10px;
      border-radius: 4px;
      background: #1e1e1e;
      flex-shrink: 0;
    }

    /* ─── Center panel ─── */
    .ecommercify-center {
      position: relative;
      z-index: 20;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 18px;
      padding: 40px 48px;
      background: rgba(0, 0, 0, 0.72);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 16px;
      backdrop-filter: blur(20px) saturate(120%);
      -webkit-backdrop-filter: blur(20px) saturate(120%);
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.04) inset,
        0 32px 80px rgba(0,0,0,0.7),
        0 0 60px rgba(255,255,255,0.02);
      min-width: 320px;
      max-width: 400px;
      text-align: center;
    }

    /* Spinner */
    .ecommercify-spinner {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.08);
      border-top-color: rgba(255, 255, 255, 0.6);
      animation: ecommercify-spin 0.9s linear infinite;
      flex-shrink: 0;
    }

    @keyframes ecommercify-spin {
      to { transform: rotate(360deg); }
    }

    /* Title */
    .ecommercify-center h3 {
      font-size: 15px;
      font-weight: 500;
      letter-spacing: 0.02em;
      color: rgba(255, 255, 255, 0.92);
      margin: 0;
      font-family: inherit;
    }

    /* Cycling status text */
    .ecommercify-status-text {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.38);
      letter-spacing: 0.04em;
      height: 16px;
      transition: opacity 0.4s ease;
      font-family: inherit;
      margin: 0;
    }

    .ecommercify-status-text.ecommercify-fade {
      opacity: 0;
    }

    /* Progress bar */
    .ecommercify-progress-bar {
      width: 100%;
      height: 2px;
      background: rgba(255, 255, 255, 0.07);
      border-radius: 99px;
      overflow: hidden;
      margin-top: 4px;
    }

    .ecommercify-progress-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.7));
      border-radius: 99px;
      transition: width 1s linear;
      box-shadow: 0 0 8px rgba(255,255,255,0.4);
    }
  `
  document.head.appendChild(style)
}

const STATUS_MESSAGES = [
  'Starting database...',
  'Booting Medusa...',
  'Running migrations...',
  'Seeding catalog...',
  'Generating API keys...',
  'Almost there...',
]

const CARD_WIDTH = 180
const CARD_HEIGHT = 240
const CARD_GAP = 18

export class EcommercifyAnimation {
  private _mount: HTMLElement
  private _overlay: HTMLDivElement | null
  private _statusEl: HTMLParagraphElement | null
  private _fillEl: HTMLDivElement | null
  private _statusIndex: number
  private _statusInterval: number | null
  private _progressRaf: number | null
  private _progressStart: number | null
  private _duration: number
  private _running: boolean

  constructor(mountEl: HTMLElement) {
    this._mount = mountEl
    this._overlay = null
    this._statusEl = null
    this._fillEl = null
    this._statusIndex = 0
    this._statusInterval = null
    this._progressRaf = null
    this._progressStart = null
    this._duration = 60000
    this._running = false
  }

  start(estimatedDurationMs: number = 60000): void {
    if (this._running) return
    this._running = true
    this._duration = estimatedDurationMs

    injectStyles()
    this._build()
    this._mount.appendChild(this._overlay as HTMLDivElement)
    document.body.classList.add('sf-ecommercify-provisioning')

    // Kick off status cycling
    this._statusIndex = 0
    this._updateStatusText(STATUS_MESSAGES[0])
    this._statusInterval = window.setInterval(() => this._cycleStatus(), 3000)

    // Kick off smooth progress
    this._progressStart = performance.now()
    this._tickProgress()
  }

  stop(): void {
    document.body.classList.remove('sf-ecommercify-provisioning')
    if (!this._running) return
    this._running = false
    if (this._statusInterval !== null) {
      clearInterval(this._statusInterval)
      this._statusInterval = null
    }
    if (this._progressRaf !== null) {
      cancelAnimationFrame(this._progressRaf)
      this._progressRaf = null
    }
    if (this._overlay && this._overlay.parentNode) {
      // Fade out gracefully
      this._overlay.style.transition = 'opacity 0.5s ease'
      this._overlay.style.opacity = '0'
      window.setTimeout(() => {
        if (this._overlay && this._overlay.parentNode) {
          this._overlay.parentNode.removeChild(this._overlay)
        }
      }, 520)
    }
  }

  updateStatus(message: string): void {
    this._updateStatusText(message)
  }

  // ─── Private ───────────────────────────────────────────────────

  private _build(): void {
    const overlay = document.createElement('div')
    overlay.className = 'ecommercify-overlay'

    // Card field
    const field = document.createElement('div')
    field.className = 'ecommercify-card-field'

    const grid = document.createElement('div')
    grid.className = 'ecommercify-card-grid'

    // The grid is 220vmax × 220vmax. Calculate how many cards fit.
    const vmax = Math.max(window.innerWidth, window.innerHeight)
    const gridSize = vmax * 2.2
    const cols = Math.ceil(gridSize / (CARD_WIDTH + CARD_GAP)) + 1
    const rows = Math.ceil(gridSize / (CARD_HEIGHT + CARD_GAP)) + 1
    const total = cols * rows

    for (let i = 0; i < total; i++) {
      grid.appendChild(this._makeCard(i))
    }

    field.appendChild(grid)
    overlay.appendChild(field)

    // Center panel
    const center = document.createElement('div')
    center.className = 'ecommercify-center'

    const spinner = document.createElement('div')
    spinner.className = 'ecommercify-spinner'

    const title = document.createElement('h3')
    title.textContent = 'Spinning up your store'

    const statusText = document.createElement('p')
    statusText.className = 'ecommercify-status-text'
    statusText.textContent = STATUS_MESSAGES[0]
    this._statusEl = statusText

    const progressBar = document.createElement('div')
    progressBar.className = 'ecommercify-progress-bar'
    const progressFill = document.createElement('div')
    progressFill.className = 'ecommercify-progress-fill'
    progressBar.appendChild(progressFill)
    this._fillEl = progressFill

    center.appendChild(spinner)
    center.appendChild(title)
    center.appendChild(statusText)
    center.appendChild(progressBar)
    overlay.appendChild(center)

    this._overlay = overlay
  }

  private _makeCard(index: number): HTMLDivElement {
    const card = document.createElement('div')
    card.className = 'ecommercify-card'
    // Stagger shimmer delay so cards don't sync
    card.style.setProperty('--shimmer-delay', `${(index % 20) * 0.15}s`)
    card.style.animationDelay = `${(index % 20) * 0.15}s`

    // Apply delay to the ::after shimmer via a CSS custom property
    // We use a wrapper trick: override animation-delay on the card's ::after via inline style
    // Since ::after can't be targeted inline, use a dedicated per-card class
    const delayClass = `ecommercify-delay-${index % 20}`
    card.classList.add(delayClass)

    // Dynamically inject this delay rule once per unique delay slot
    this._ensureDelayRule(index % 20)

    const img = document.createElement('div')
    img.className = 'ecommercify-card-img'

    const lines: Array<{ width: string }> = [{ width: '80%' }, { width: '60%' }, { width: '40%' }]

    card.appendChild(img)
    lines.forEach(({ width }) => {
      const line = document.createElement('div')
      line.className = 'ecommercify-card-line'
      line.style.width = width
      card.appendChild(line)
    })

    return card
  }

  private _ensureDelayRule(slot: number): void {
    const ruleId = `ecommercify-delay-rule-${slot}`
    if (document.getElementById(ruleId)) return
    const style = document.createElement('style')
    style.id = ruleId
    style.textContent = `.ecommercify-delay-${slot}::after { animation-delay: ${slot * 0.15}s; }`
    document.head.appendChild(style)
  }

  private _cycleStatus(): void {
    if (!this._statusEl) return
    this._statusEl.classList.add('ecommercify-fade')
    window.setTimeout(() => {
      this._statusIndex = (this._statusIndex + 1) % STATUS_MESSAGES.length
      if (!this._statusEl) return
      this._statusEl.textContent = STATUS_MESSAGES[this._statusIndex]
      this._statusEl.classList.remove('ecommercify-fade')
    }, 420)
  }

  private _updateStatusText(message: string): void {
    if (!this._statusEl) return
    this._statusEl.classList.add('ecommercify-fade')
    window.setTimeout(() => {
      if (!this._statusEl) return
      this._statusEl.textContent = message
      this._statusEl.classList.remove('ecommercify-fade')
    }, 420)
  }

  private _tickProgress(): void {
    if (!this._running || this._progressStart === null) return
    const elapsed = performance.now() - this._progressStart
    // Ease into 95% over the duration, never reach 100% until stop()
    const raw = elapsed / this._duration
    // Use a gentle ease-out curve so it slows as it approaches the end
    const eased = 1 - Math.pow(1 - Math.min(raw, 0.999), 2.2)
    const pct = Math.min(eased * 95, 95)
    if (this._fillEl) this._fillEl.style.width = `${pct}%`

    // Schedule next tick ~every 500ms for smooth but not expensive updates
    this._progressRaf = window.setTimeout(() => {
      this._progressRaf = window.requestAnimationFrame(() => this._tickProgress())
    }, 500)
  }
}
