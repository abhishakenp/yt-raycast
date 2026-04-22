;(function () {
  interface PreviewAIConfig {
    canIndian?: boolean
    indianLabel?: string
  }

  interface WindowWithPreviewAI extends Window {
    __SF_PREVIEW_AI__?: PreviewAIConfig
  }

  type Point = { x: number; y: number }
  type ToolbarElement = HTMLElement & { _sfScroll?: EventListener }
  type MessageData = {
    type?: string
    id?: string
    error?: string
    text?: string | number | null
    html?: string | null
    selectMode?: boolean
    annotateMode?: boolean
  }

  let selectMode: boolean = false
  let annotateMode: boolean = false
  let veil: HTMLElement | null = null
  let highlight: HTMLElement | null = null
  let canvas: HTMLCanvasElement | null = null
  let ctx: CanvasRenderingContext2D | null = null
  let drawing: boolean = false
  let last: Point | null = null

  let activeInlineEl: Element | null = null
  let inlineSnapshot: string | null = null
  let inlineToolbar: HTMLElement | null = null
  let pendingTextAiId: string | null = null
  let pendingStyleAiId: string | null = null
  let aiEnhanceBtn: HTMLButtonElement | null = null
  let imgPanCleanup: (() => void) | null = null

  const zBase: number = 2147482000

  function stopImgPan(): void {
    if (typeof imgPanCleanup === 'function') {
      imgPanCleanup()
      imgPanCleanup = null
    }
  }

  function attachImgPan(img: HTMLImageElement): () => void {
    if (!img || img.tagName !== 'IMG') return () => {}
    const cs0: CSSStyleDeclaration = getComputedStyle(img)
    if (cs0.objectFit !== 'cover' && cs0.objectFit !== 'contain') {
      img.style.objectFit = 'cover'
    }
    const parsePos = (): { x: number; y: number } => {
      const parts: string[] = getComputedStyle(img).objectPosition.trim().split(/\s+/)
      const p1: string = parts[0] || '50%'
      const p2: string = parts[1] || parts[0] || '50%'
      const num = (v: string): number => {
        if (v === 'left' || v === 'top') return 0
        if (v === 'center') return 50
        if (v === 'right' || v === 'bottom') return 100
        const m: RegExpMatchArray | null = String(v).match(/^([\d.]+)%$/)
        return m ? Number(m[1]) : 50
      }
      return { x: num(p1), y: num(p2) }
    }
    let { x, y }: { x: number; y: number } = parsePos()
    let dragging: boolean = false
    let lastX: number = 0
    let lastY: number = 0
    const prevCursor: string = img.style.cursor
    const prevTouchAction: string = img.style.touchAction
    const prevUserSelect: string = img.style.userSelect
    const prevPe: string = img.style.pointerEvents
    const prevDraggable: string | null = img.getAttribute('draggable')
    img.style.cursor = 'grab'
    img.style.touchAction = 'none'
    img.style.pointerEvents = 'auto'
    img.setAttribute('draggable', 'false')
    const onDown = (e: PointerEvent): void => {
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
      img.style.cursor = 'grabbing'
      img.style.userSelect = 'none'
      try {
        img.setPointerCapture(e.pointerId)
      } catch {
        void 0
      }
    }
    const onMove = (e: PointerEvent): void => {
      if (!dragging) return
      e.preventDefault()
      const w: number = Math.max(1, img.clientWidth)
      const h: number = Math.max(1, img.clientHeight)
      let dx: number = e.movementX
      let dy: number = e.movementY
      if (dx === 0 && dy === 0) {
        dx = e.clientX - lastX
        dy = e.clientY - lastY
      }
      lastX = e.clientX
      lastY = e.clientY
      x -= (dx / w) * 100
      y -= (dy / h) * 100
      x = Math.max(0, Math.min(100, x))
      y = Math.max(0, Math.min(100, y))
      img.style.objectPosition = `${x}% ${y}%`
    }
    const endDrag = (e: PointerEvent): void => {
      if (!dragging) return
      dragging = false
      img.style.cursor = 'grab'
      img.style.userSelect = prevUserSelect
      try {
        if (e.pointerId != null) img.releasePointerCapture(e.pointerId)
      } catch {
        void 0
      }
    }
    const onDocMove = (e: PointerEvent): void => {
      if (!dragging) return
      onMove(e)
    }
    const onDocUp = (e: PointerEvent): void => {
      if (!dragging) return
      endDrag(e)
    }
    img.addEventListener('pointerdown', onDown, true)
    img.addEventListener('pointerup', endDrag)
    img.addEventListener('pointercancel', endDrag)
    img.addEventListener('lostpointercapture', endDrag)
    document.addEventListener('pointermove', onDocMove, { passive: false, capture: true })
    document.addEventListener('pointerup', onDocUp, true)
    document.addEventListener('pointercancel', onDocUp, true)
    return () => {
      img.removeEventListener('pointerdown', onDown, true)
      img.removeEventListener('pointerup', endDrag)
      img.removeEventListener('pointercancel', endDrag)
      img.removeEventListener('lostpointercapture', endDrag)
      document.removeEventListener('pointermove', onDocMove, { capture: true })
      document.removeEventListener('pointerup', onDocUp, true)
      document.removeEventListener('pointercancel', onDocUp, true)
      img.style.cursor = prevCursor
      img.style.touchAction = prevTouchAction
      img.style.userSelect = prevUserSelect
      img.style.pointerEvents = prevPe
      if (prevDraggable == null) img.removeAttribute('draggable')
      else img.setAttribute('draggable', prevDraggable)
    }
  }

  function post(obj: Record<string, unknown>): void {
    try {
      if (window.parent && window.parent !== window) window.parent.postMessage(obj, '*')
    } catch {
      void 0
    }
  }

  function ensureVeil(): HTMLElement {
    if (veil) return veil
    veil = document.createElement('div')
    veil.setAttribute('data-sf-pt-veil', '1')
    Object.assign(veil.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      right: '0',
      bottom: '0',
      zIndex: String(zBase),
      background: 'transparent',
      cursor: 'crosshair',
    })
    document.documentElement.appendChild(veil)
    return veil
  }

  function ensureHighlight(): HTMLElement {
    if (highlight) return highlight
    highlight = document.createElement('div')
    highlight.setAttribute('data-sf-pt-hl', '1')
    Object.assign(highlight.style, {
      position: 'fixed',
      pointerEvents: 'none',
      border: '2px solid #a78bfa',
      borderRadius: '4px',
      boxShadow: '0 0 0 1px rgba(0,0,0,0.2)',
      zIndex: String(zBase + 1),
      display: 'none',
    })
    document.documentElement.appendChild(highlight)
    return highlight
  }

  function ensureCanvas(): HTMLCanvasElement {
    if (canvas) return canvas
    canvas = document.createElement('canvas')
    canvas.setAttribute('data-sf-pt-draw', '1')
    Object.assign(canvas.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      width: '100%',
      height: '100%',
      zIndex: String(zBase + 2),
      touchAction: 'none',
      cursor: 'crosshair',
    })
    ctx = canvas.getContext('2d')
    document.documentElement.appendChild(canvas)
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return canvas
  }

  function resizeCanvas(): void {
    if (!canvas || !ctx) return
    const dpr: number = window.devicePixelRatio || 1
    const w: number = window.innerWidth
    const h: number = window.innerHeight
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function removeSelectUi(): void {
    if (veil) {
      veil.remove()
      veil = null
    }
    if (highlight) {
      highlight.remove()
      highlight = null
    }
  }

  function removeAnnotateUi(): void {
    if (canvas) {
      window.removeEventListener('resize', resizeCanvas)
      canvas.remove()
      canvas = null
      ctx = null
    }
    drawing = false
    last = null
  }

  function isOverlayNode(el: Node | null): boolean {
    if (!el || el.nodeType !== 1) return true
    const element: Element = el as Element
    if (element === veil || element === highlight || (canvas && element === canvas)) return true
    if (element.getAttribute('data-sf-pt-veil') != null) return true
    if (element.getAttribute('data-sf-pt-hl') != null) return true
    if (element.getAttribute('data-sf-pt-draw') != null) return true
    if (element.getAttribute('data-sf-inline-toolbar') != null) return true
    return false
  }

  function pickTarget(ev: MouseEvent | PointerEvent): Element | null {
    let list: Element[] = []
    try {
      list = document.elementsFromPoint(ev.clientX, ev.clientY)
    } catch {
      return null
    }
    for (let i = 0; i < list.length; i++) {
      const el: Element = list[i]
      if (isOverlayNode(el)) continue
      const tag: string = el.tagName
      if (tag === 'HTML' || tag === 'BODY') continue
      return el
    }
    return null
  }

  function syncHighlight(el: Element | null): void {
    const h: HTMLElement = ensureHighlight()
    if (!el || !el.getBoundingClientRect) {
      h.style.display = 'none'
      return
    }
    const r: DOMRect = el.getBoundingClientRect()
    if (r.width < 1 && r.height < 1) {
      h.style.display = 'none'
      return
    }
    h.style.display = 'block'
    h.style.left = r.left + 'px'
    h.style.top = r.top + 'px'
    h.style.width = r.width + 'px'
    h.style.height = r.height + 'px'
  }

  function onSelectMove(ev: MouseEvent): void {
    if (!selectMode) return
    const el: Element | null = pickTarget(ev)
    syncHighlight(el)
  }

  function canTextEdit(el: Element | null): boolean {
    if (!el || el.nodeType !== 1) return false
    const t: string = el.tagName
    if (
      t === 'IMG' ||
      t === 'SVG' ||
      t === 'VIDEO' ||
      t === 'CANVAS' ||
      t === 'IFRAME' ||
      t === 'INPUT' ||
      t === 'TEXTAREA' ||
      t === 'SELECT' ||
      t === 'BUTTON'
    )
      return t === 'BUTTON'
    const allow: Record<string, number> = {
      P: 1,
      H1: 1,
      H2: 1,
      H3: 1,
      H4: 1,
      H5: 1,
      H6: 1,
      SPAN: 1,
      A: 1,
      BUTTON: 1,
      LI: 1,
      LABEL: 1,
      FIGCAPTION: 1,
      TD: 1,
      TH: 1,
      BLOCKQUOTE: 1,
      SMALL: 1,
      STRONG: 1,
      EM: 1,
      B: 1,
      I: 1,
      CODE: 1,
      PRE: 1,
      DIV: 1,
      SECTION: 1,
      ARTICLE: 1,
      HEADER: 1,
      FOOTER: 1,
      NAV: 1,
      MAIN: 1,
      ASIDE: 1,
    }
    return Boolean(allow[t])
  }

  function removeInlineToolbar(): void {
    if (inlineToolbar) {
      inlineToolbar.remove()
      inlineToolbar = null
    }
  }

  function positionToolbarNear(el: Element | null): void {
    if (!inlineToolbar || !el) return
    const r: DOMRect = el.getBoundingClientRect()
    const pad: number = 8
    let top: number = r.bottom + pad
    let left: number = r.left
    const tw: number = inlineToolbar.offsetWidth || 280
    const th: number = inlineToolbar.offsetHeight || 48
    if (left + tw > window.innerWidth - pad) left = window.innerWidth - tw - pad
    if (left < pad) left = pad
    if (r.bottom + th + pad * 2 > window.innerHeight) {
      top = r.top - th - pad
    }
    inlineToolbar.style.position = 'fixed'
    inlineToolbar.style.top = Math.max(pad, top) + 'px'
    inlineToolbar.style.left = left + 'px'
  }

  function baseToolbar(): ToolbarElement {
    const bar: ToolbarElement = document.createElement('div') as ToolbarElement
    bar.setAttribute('data-sf-inline-toolbar', '1')
    Object.assign(bar.style, {
      position: 'fixed',
      zIndex: String(zBase + 10),
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 10px',
      borderRadius: '10px',
      background: 'linear-gradient(180deg, #1e1a2e 0%, #12101c 100%)',
      border: '1px solid rgba(124, 58, 237, 0.45)',
      boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      color: '#e8e4ff',
    })
    return bar
  }

  function btn(label: string, primary: boolean): HTMLButtonElement {
    const b: HTMLButtonElement = document.createElement('button')
    b.type = 'button'
    b.textContent = label
    Object.assign(b.style, {
      padding: '6px 12px',
      borderRadius: '8px',
      border: primary ? '1px solid rgba(167, 139, 250, 0.5)' : '1px solid #3d3758',
      background: primary
        ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.95), rgba(167, 139, 250, 0.75))'
        : 'transparent',
      color: '#fff',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '11px',
    })
    return b
  }

  function applyStyleHtmlToActive(htmlStr: string): boolean {
    stopImgPan()
    const el: Element | null = activeInlineEl
    if (!el || !el.parentNode) return false
    const parent: Node = el.parentNode
    const wrap: HTMLDivElement = document.createElement('div')
    wrap.innerHTML = String(htmlStr || '').trim()
    const next: Element | null = wrap.firstElementChild
    if (!next) return false
    const wasImg: boolean = el.tagName === 'IMG'
    parent.replaceChild(next, el)
    activeInlineEl = next
    if (!wasImg && canTextEdit(next)) {
      ;(next as HTMLElement).contentEditable = 'true'
    }
    ;(activeInlineEl as HTMLElement).style.outline = '2px solid rgba(167, 139, 250, 0.95)'
    ;(activeInlineEl as HTMLElement).style.outlineOffset = '3px'
    if (activeInlineEl.tagName === 'IMG') {
      imgPanCleanup = attachImgPan(activeInlineEl as HTMLImageElement)
    }
    if (inlineToolbar && activeInlineEl) positionToolbarNear(activeInlineEl)
    return true
  }

  function teardownInlineEdit(restore: boolean): void {
    pendingTextAiId = null
    pendingStyleAiId = null
    aiEnhanceBtn = null
    stopImgPan()
    const toolbar: ToolbarElement | null = inlineToolbar as ToolbarElement | null
    if (toolbar && toolbar._sfScroll) {
      window.removeEventListener('scroll', toolbar._sfScroll, true)
    }
    removeInlineToolbar()
    if (activeInlineEl && restore && inlineSnapshot !== null) {
      try {
        activeInlineEl.outerHTML = inlineSnapshot
      } catch {
        void 0
      }
    } else if (activeInlineEl) {
      ;(activeInlineEl as HTMLElement).contentEditable = 'false'
      ;(activeInlineEl as HTMLElement).style.outline = ''
      ;(activeInlineEl as HTMLElement).style.outlineOffset = ''
    }
    activeInlineEl = null
    inlineSnapshot = null
  }

  function prepareDocumentForSave(): void {
    stopImgPan()
    removeInlineToolbar()
    document
      .querySelectorAll('[data-sf-pt-veil], [data-sf-pt-hl], [data-sf-pt-draw]')
      .forEach((n: Element) => n.remove())
    veil = null
    highlight = null
    canvas = null
    ctx = null
    if (activeInlineEl) {
      ;(activeInlineEl as HTMLElement).contentEditable = 'false'
      ;(activeInlineEl as HTMLElement).style.outline = ''
      ;(activeInlineEl as HTMLElement).style.outlineOffset = ''
    }
    activeInlineEl = null
    inlineSnapshot = null
  }

  function saveHomepageFromDom(): void {
    pendingTextAiId = null
    pendingStyleAiId = null
    aiEnhanceBtn = null
    const toolbar: ToolbarElement | null = inlineToolbar as ToolbarElement | null
    if (toolbar && toolbar._sfScroll) {
      window.removeEventListener('scroll', toolbar._sfScroll, true)
    }
    prepareDocumentForSave()
    selectMode = false
    annotateMode = false
    const html: string = '<!DOCTYPE html>\n' + document.documentElement.outerHTML
    post({ type: 'SF_SAVE_HOMEPAGE_HTML', html })
    post({ type: 'SF_INLINE_EDIT_END' })
  }

  function beginImgEdit(el: HTMLImageElement): void {
    inlineSnapshot = el.outerHTML
    activeInlineEl = el
    const bar: ToolbarElement = baseToolbar()
    inlineToolbar = bar
    const urlIn: HTMLInputElement = document.createElement('input')
    urlIn.type = 'text'
    urlIn.placeholder = 'Image URL'
    urlIn.value = el.getAttribute('src') || ''
    Object.assign(urlIn.style, {
      width: '200px',
      padding: '6px 8px',
      borderRadius: '6px',
      border: '1px solid #3d3758',
      background: '#0f0d1a',
      color: '#f5f3ff',
    })
    const fileIn: HTMLInputElement = document.createElement('input')
    fileIn.type = 'file'
    fileIn.accept = 'image/*'
    fileIn.style.maxWidth = '120px'
    fileIn.addEventListener('change', () => {
      const f: File | null = fileIn.files && fileIn.files[0] ? fileIn.files[0] : null
      if (!f) return
      const r: FileReader = new FileReader()
      r.onload = () => {
        el.src = String(r.result || '')
      }
      r.readAsDataURL(f)
    })
    const applyUrl: HTMLButtonElement = btn('Set URL', true)
    applyUrl.addEventListener('click', () => {
      const u: string = urlIn.value.trim()
      if (u) el.src = u
    })
    const save: HTMLButtonElement = btn('Save', true)
    save.addEventListener('click', () => saveHomepageFromDom())
    const cancel: HTMLButtonElement = btn('Cancel', false)
    cancel.addEventListener('click', () => {
      teardownInlineEdit(true)
      post({ type: 'SF_INLINE_EDIT_END' })
    })
    const rowImg: HTMLDivElement = document.createElement('div')
    Object.assign(rowImg.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap',
    })
    rowImg.appendChild(urlIn)
    rowImg.appendChild(fileIn)
    rowImg.appendChild(applyUrl)
    rowImg.appendChild(save)
    rowImg.appendChild(cancel)
    const panHint: HTMLDivElement = document.createElement('div')
    panHint.textContent = 'Click and drag the image to move the visible area inside the frame.'
    Object.assign(panHint.style, {
      fontSize: '10px',
      color: '#9b92b8',
      lineHeight: '1.35',
      maxWidth: '100%',
    })
    Object.assign(bar.style, {
      flexDirection: 'column',
      alignItems: 'stretch',
      maxWidth: 'min(420px, calc(100vw - 24px))',
      gap: '10px',
    })
    const imgAiPanel: HTMLDivElement = document.createElement('div')
    Object.assign(imgAiPanel.style, {
      display: 'none',
      flexDirection: 'column',
      gap: '10px',
    })
    const imgTa: HTMLTextAreaElement = document.createElement('textarea')
    imgTa.rows = 2
    imgTa.placeholder = 'Describe styling (shadow, radius, size…)…'
    Object.assign(imgTa.style, {
      width: '100%',
      boxSizing: 'border-box',
      padding: '8px',
      borderRadius: '8px',
      border: '1px solid #3d3758',
      background: '#0f0d1a',
      color: '#f5f3ff',
      fontSize: '12px',
      resize: 'vertical',
      minHeight: '44px',
    })
    const imgEnhance: HTMLButtonElement = btn('Apply', true)
    aiEnhanceBtn = imgEnhance
    imgEnhance.addEventListener('click', () => {
      const instruction: string = imgTa.value.trim()
      if (!instruction || !activeInlineEl) return
      pendingStyleAiId = 'sty-' + Math.random().toString(36).slice(2) + Date.now()
      imgEnhance.disabled = true
      post({
        type: 'SF_PREVIEW_STYLE_AI_REQ',
        id: pendingStyleAiId,
        fragmentHtml: activeInlineEl.outerHTML,
        instruction,
      })
    })
    imgAiPanel.appendChild(imgTa)
    imgAiPanel.appendChild(imgEnhance)
    const imgAiToggle: HTMLButtonElement = document.createElement('button')
    imgAiToggle.type = 'button'
    imgAiToggle.setAttribute('aria-label', 'AI styling')
    imgAiToggle.setAttribute('title', 'AI styling')
    imgAiToggle.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>'
    Object.assign(imgAiToggle.style, {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '34px',
      height: '34px',
      padding: '0',
      borderRadius: '8px',
      border: '1px solid rgba(124, 58, 237, 0.35)',
      background: 'rgba(124, 58, 237, 0.12)',
      color: '#e9d5ff',
      cursor: 'pointer',
      flexShrink: '0',
    })
    let imgAiOpen: boolean = false
    imgAiToggle.addEventListener('click', () => {
      imgAiOpen = !imgAiOpen
      imgAiPanel.style.display = imgAiOpen ? 'flex' : 'none'
      imgAiToggle.style.background = imgAiOpen
        ? 'rgba(167, 139, 250, 0.22)'
        : 'rgba(124, 58, 237, 0.12)'
      imgAiToggle.style.borderColor = imgAiOpen
        ? 'rgba(244, 114, 182, 0.45)'
        : 'rgba(124, 58, 237, 0.35)'
      positionToolbarNear(activeInlineEl || el)
    })
    rowImg.appendChild(imgAiToggle)
    bar.appendChild(rowImg)
    bar.appendChild(panHint)
    bar.appendChild(imgAiPanel)
    document.documentElement.appendChild(bar)
    el.style.outline = '2px solid rgba(167, 139, 250, 0.95)'
    el.style.outlineOffset = '3px'
    const scrollFnImg: EventListener = () => positionToolbarNear(activeInlineEl || el)
    bar._sfScroll = scrollFnImg
    window.addEventListener('scroll', scrollFnImg, true)
    positionToolbarNear(el)
    imgPanCleanup = attachImgPan(el)
    const onImgLoad = (): void => {
      if (activeInlineEl !== el || !inlineToolbar) return
      stopImgPan()
      imgPanCleanup = attachImgPan(el)
    }
    if (!el.complete || el.naturalWidth === 0) {
      el.addEventListener('load', onImgLoad, { once: true })
    }
  }

  function beginTextEdit(el: Element): void {
    inlineSnapshot = el.outerHTML
    activeInlineEl = el
    ;(el as HTMLElement).contentEditable = 'true'
    ;(el as HTMLElement).style.outline = '2px solid rgba(167, 139, 250, 0.95)'
    ;(el as HTMLElement).style.outlineOffset = '3px'
    const bar: ToolbarElement = baseToolbar()
    inlineToolbar = bar
    Object.assign(bar.style, {
      flexDirection: 'column',
      alignItems: 'stretch',
      maxWidth: 'min(420px, calc(100vw - 24px))',
      gap: '10px',
    })
    const row1: HTMLDivElement = document.createElement('div')
    Object.assign(row1.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap',
    })
    const hint: HTMLSpanElement = document.createElement('span')
    hint.textContent = 'Edit text'
    Object.assign(hint.style, { marginRight: '6px', opacity: '0.85' })
    const save: HTMLButtonElement = btn('Save', true)
    save.addEventListener('click', () => saveHomepageFromDom())
    const cancel: HTMLButtonElement = btn('Cancel', false)
    cancel.addEventListener('click', () => {
      teardownInlineEdit(true)
      post({ type: 'SF_INLINE_EDIT_END' })
    })
    row1.appendChild(hint)
    row1.appendChild(save)
    row1.appendChild(cancel)
    const addSection: HTMLButtonElement = document.createElement('button')
    addSection.type = 'button'
    addSection.setAttribute('aria-label', 'Add section')
    addSection.setAttribute('title', 'Add section')
    addSection.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>'
    Object.assign(addSection.style, {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '34px',
      height: '34px',
      padding: '0',
      borderRadius: '8px',
      border: '1px solid rgba(124, 58, 237, 0.35)',
      background: 'rgba(124, 58, 237, 0.12)',
      color: '#e9d5ff',
      cursor: 'pointer',
      flexShrink: '0',
    })
    addSection.addEventListener('click', () => {
      const path: string =
        window.location && window.location.pathname ? window.location.pathname : '/'
      post({ type: 'SF_ADD_COMPONENT_CLICK', route: path })
    })
    row1.appendChild(addSection)

    const aiCfg: PreviewAIConfig = (window as WindowWithPreviewAI).__SF_PREVIEW_AI__ || {}
    const aiPanel: HTMLDivElement = document.createElement('div')
    Object.assign(aiPanel.style, {
      display: 'none',
      flexDirection: 'column',
      gap: '10px',
    })
    const modeRow: HTMLDivElement = document.createElement('div')
    Object.assign(modeRow.style, {
      display: 'flex',
      gap: '12px',
      fontSize: '11px',
      color: '#b8b2d1',
    })
    const rTextMode: HTMLInputElement = document.createElement('input')
    rTextMode.type = 'radio'
    rTextMode.name = 'sf-ai-text-or-appearance'
    rTextMode.checked = true
    const labTextMode: HTMLLabelElement = document.createElement('label')
    labTextMode.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer;'
    labTextMode.appendChild(rTextMode)
    labTextMode.appendChild(document.createTextNode('Text'))
    const rAppMode: HTMLInputElement = document.createElement('input')
    rAppMode.type = 'radio'
    rAppMode.name = 'sf-ai-text-or-appearance'
    const labAppMode: HTMLLabelElement = document.createElement('label')
    labAppMode.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer;'
    labAppMode.appendChild(rAppMode)
    labAppMode.appendChild(document.createTextNode('Appearance'))
    modeRow.appendChild(labTextMode)
    modeRow.appendChild(labAppMode)
    const ta: HTMLTextAreaElement = document.createElement('textarea')
    ta.rows = 2
    ta.placeholder = 'Describe how you want this text to read…'
    Object.assign(ta.style, {
      width: '100%',
      boxSizing: 'border-box',
      padding: '8px',
      borderRadius: '8px',
      border: '1px solid #3d3758',
      background: '#0f0d1a',
      color: '#f5f3ff',
      fontSize: '12px',
      resize: 'vertical',
      minHeight: '44px',
    })
    let outLang: string = 'en'
    const langRow: HTMLDivElement = document.createElement('div')
    Object.assign(langRow.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      fontSize: '11px',
      color: '#b8b2d1',
    })
    const rEn: HTMLInputElement = document.createElement('input')
    rEn.type = 'radio'
    rEn.name = 'sf-ai-out-lang'
    rEn.checked = true
    const labEn: HTMLLabelElement = document.createElement('label')
    labEn.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer;'
    labEn.appendChild(rEn)
    labEn.appendChild(document.createTextNode('Output in English'))
    rEn.addEventListener('change', () => {
      if (rEn.checked) outLang = 'en'
    })
    langRow.appendChild(labEn)
    if (aiCfg.canIndian && aiCfg.indianLabel) {
      const rIn: HTMLInputElement = document.createElement('input')
      rIn.type = 'radio'
      rIn.name = 'sf-ai-out-lang'
      const labIn: HTMLLabelElement = document.createElement('label')
      labIn.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer;'
      labIn.appendChild(rIn)
      labIn.appendChild(document.createTextNode('Output in ' + aiCfg.indianLabel))
      rIn.addEventListener('change', () => {
        if (rIn.checked) outLang = 'indian'
      })
      langRow.appendChild(labIn)
    }
    const syncTextAiModeUi = (): void => {
      const appearance: boolean = rAppMode.checked
      langRow.style.display = appearance ? 'none' : 'flex'
      ta.placeholder = appearance
        ? 'Describe styling (spacing, colors, classes…)…'
        : 'Describe how you want this text to read…'
    }
    rTextMode.addEventListener('change', syncTextAiModeUi)
    rAppMode.addEventListener('change', syncTextAiModeUi)
    const enhance: HTMLButtonElement = btn('Apply', true)
    aiEnhanceBtn = enhance
    enhance.addEventListener('click', () => {
      const instruction: string = ta.value.trim()
      if (!instruction || !activeInlineEl) return
      if (rAppMode.checked) {
        pendingStyleAiId = 'sty-' + Math.random().toString(36).slice(2) + Date.now()
        enhance.disabled = true
        post({
          type: 'SF_PREVIEW_STYLE_AI_REQ',
          id: pendingStyleAiId,
          fragmentHtml: activeInlineEl.outerHTML,
          instruction,
        })
        return
      }
      pendingTextAiId = 'ai-' + Math.random().toString(36).slice(2) + Date.now()
      enhance.disabled = true
      const text: string = activeInlineEl.textContent || ''
      post({
        type: 'SF_PREVIEW_TEXT_AI_REQ',
        id: pendingTextAiId,
        text,
        instruction,
        outputLanguage: outLang,
      })
    })
    aiPanel.appendChild(modeRow)
    aiPanel.appendChild(ta)
    aiPanel.appendChild(langRow)
    aiPanel.appendChild(enhance)
    syncTextAiModeUi()

    const aiToggle: HTMLButtonElement = document.createElement('button')
    aiToggle.type = 'button'
    aiToggle.setAttribute('aria-label', 'AI enhance')
    aiToggle.setAttribute('title', 'AI enhance')
    aiToggle.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>'
    Object.assign(aiToggle.style, {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '34px',
      height: '34px',
      padding: '0',
      borderRadius: '8px',
      border: '1px solid rgba(124, 58, 237, 0.35)',
      background: 'rgba(124, 58, 237, 0.12)',
      color: '#e9d5ff',
      cursor: 'pointer',
      flexShrink: '0',
    })
    let aiOpen: boolean = false
    aiToggle.addEventListener('click', () => {
      aiOpen = !aiOpen
      aiPanel.style.display = aiOpen ? 'flex' : 'none'
      aiToggle.style.background = aiOpen ? 'rgba(167, 139, 250, 0.22)' : 'rgba(124, 58, 237, 0.12)'
      aiToggle.style.borderColor = aiOpen ? 'rgba(244, 114, 182, 0.45)' : 'rgba(124, 58, 237, 0.35)'
      positionToolbarNear(activeInlineEl || el)
    })
    row1.appendChild(aiToggle)
    bar.appendChild(row1)
    bar.appendChild(aiPanel)

    document.documentElement.appendChild(bar)
    const scrollFnText: EventListener = () => positionToolbarNear(activeInlineEl || el)
    bar._sfScroll = scrollFnText
    window.addEventListener('scroll', scrollFnText, true)
    positionToolbarNear(el)
    ;(el as HTMLElement).focus()
    try {
      const r: Range = document.createRange()
      r.selectNodeContents(el)
      const s: Selection | null = window.getSelection()
      if (s) {
        s.removeAllRanges()
        s.addRange(r)
      }
    } catch {
      void 0
    }
  }

  function beginInlineEdit(el: Element): void {
    if (!el || el === document.documentElement || el === document.body) return
    removeSelectUi()
    selectMode = false
    post({ type: 'SF_INLINE_EDIT_BEGIN' })
    teardownInlineEdit(false)
    if (el.tagName === 'IMG') {
      beginImgEdit(el as HTMLImageElement)
      return
    }
    if (canTextEdit(el)) {
      beginTextEdit(el)
      return
    }
    post({ type: 'SF_INLINE_EDIT_UNSUPPORTED' })
  }

  function onSelectClick(ev: MouseEvent): void {
    if (!selectMode) return
    ev.preventDefault()
    ev.stopPropagation()
    ev.stopImmediatePropagation()
    const el: Element | null = pickTarget(ev)
    if (!el || el === document.documentElement || el === document.body) return
    beginInlineEdit(el)
  }

  function bindSelect(): void {
    removeSelectUi()
    if (!selectMode) return
    const v: HTMLElement = ensureVeil()
    ensureHighlight()
    v.addEventListener('mousemove', onSelectMove, true)
    v.addEventListener('click', onSelectClick, true)
  }

  function clearCanvas(): void {
    if (!canvas || !ctx) return
    resizeCanvas()
  }

  function bindAnnotate(): void {
    removeAnnotateUi()
    if (!annotateMode) return
    const c: HTMLCanvasElement = ensureCanvas()
    clearCanvas()
    const line = (ev: PointerEvent): void => {
      const x: number = ev.clientX
      const y: number = ev.clientY
      if (!drawing) {
        last = { x, y }
        return
      }
      if (!ctx || !last) return
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.95)'
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(last.x, last.y)
      ctx.lineTo(x, y)
      ctx.stroke()
      last = { x, y }
    }
    c.addEventListener('pointerdown', (ev: PointerEvent) => {
      drawing = true
      last = { x: ev.clientX, y: ev.clientY }
      c.setPointerCapture(ev.pointerId)
    })
    c.addEventListener('pointermove', line)
    c.addEventListener('pointerup', () => {
      drawing = false
      last = null
    })
    c.addEventListener('pointercancel', () => {
      drawing = false
      last = null
    })
  }

  function applyModes(): void {
    if (!selectMode) removeSelectUi()
    else bindSelect()
    if (!annotateMode) removeAnnotateUi()
    else bindAnnotate()
  }

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return
    if (activeInlineEl || inlineToolbar) {
      e.preventDefault()
      teardownInlineEdit(true)
      post({ type: 'SF_INLINE_EDIT_END' })
      return
    }
    post({ type: 'SF_PREVIEW_TOOLS_ESCAPE' })
  })

  window.addEventListener('message', (ev: MessageEvent<unknown>) => {
    const d: MessageData = (ev.data || {}) as MessageData
    if (d.type === 'SF_PREVIEW_TEXT_AI_RES' && d.id === pendingTextAiId) {
      pendingTextAiId = null
      if (aiEnhanceBtn) aiEnhanceBtn.disabled = false
      if (d.error) {
        window.alert(d.error)
        return
      }
      if (d.text != null && activeInlineEl) {
        activeInlineEl.textContent = String(d.text)
      }
      return
    }
    if (d.type === 'SF_PREVIEW_STYLE_AI_RES' && d.id === pendingStyleAiId) {
      pendingStyleAiId = null
      if (aiEnhanceBtn) aiEnhanceBtn.disabled = false
      if (d.error) {
        window.alert(d.error)
        return
      }
      if (d.html != null && activeInlineEl) {
        const ok: boolean = applyStyleHtmlToActive(String(d.html))
        if (!ok) window.alert('Could not apply styled HTML')
      }
      return
    }
    if (d.type === 'SF_PREVIEW_TOOLS') {
      selectMode = Boolean(d.selectMode)
      annotateMode = Boolean(d.annotateMode)
      if (annotateMode) selectMode = false
      if (selectMode) annotateMode = false
      applyModes()
    }
    if (d.type === 'SF_PREVIEW_TOOLS_CLEAR_ANNOTATOR') {
      clearCanvas()
    }
  })

  window.addEventListener('load', (): void => {
    post({ type: 'SF_PREVIEW_TOOLS_READY', route: location.pathname || '/' })
  })
  if (document.readyState === 'complete') {
    post({ type: 'SF_PREVIEW_TOOLS_READY', route: location.pathname || '/' })
  }
})()
