;(function () {
  let selectMode = false
  let annotateMode = false
  let veil = null
  let highlight = null
  let canvas = null
  let ctx = null
  let drawing = false
  let last = null

  let activeInlineEl = null
  let inlineSnapshot = null
  let inlineToolbar = null
  let pendingTextAiId = null
  let pendingStyleAiId = null
  let aiEnhanceBtn = null
  let imgPanCleanup = null

  const zBase = 2147482000

  function stopImgPan() {
    if (typeof imgPanCleanup === 'function') {
      imgPanCleanup()
      imgPanCleanup = null
    }
  }

  function attachImgPan(img) {
    if (!img || img.tagName !== 'IMG') return () => {}
    const cs0 = getComputedStyle(img)
    if (cs0.objectFit !== 'cover' && cs0.objectFit !== 'contain') {
      img.style.objectFit = 'cover'
    }
    const parsePos = () => {
      const parts = getComputedStyle(img).objectPosition.trim().split(/\s+/)
      const p1 = parts[0] || '50%'
      const p2 = parts[1] || parts[0] || '50%'
      const num = (v) => {
        if (v === 'left' || v === 'top') return 0
        if (v === 'center') return 50
        if (v === 'right' || v === 'bottom') return 100
        const m = String(v).match(/^([\d.]+)%$/)
        return m ? Number(m[1]) : 50
      }
      return { x: num(p1), y: num(p2) }
    }
    let { x, y } = parsePos()
    let dragging = false
    let lastX = 0
    let lastY = 0
    const prevCursor = img.style.cursor
    const prevTouchAction = img.style.touchAction
    const prevUserSelect = img.style.userSelect
    const prevPe = img.style.pointerEvents
    const prevDraggable = img.getAttribute('draggable')
    img.style.cursor = 'grab'
    img.style.touchAction = 'none'
    img.style.pointerEvents = 'auto'
    img.setAttribute('draggable', 'false')
    const onDown = (e) => {
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
    const onMove = (e) => {
      if (!dragging) return
      e.preventDefault()
      const w = Math.max(1, img.clientWidth)
      const h = Math.max(1, img.clientHeight)
      let dx = e.movementX
      let dy = e.movementY
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
    const endDrag = (e) => {
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
    const onDocMove = (e) => {
      if (!dragging) return
      onMove(e)
    }
    const onDocUp = (e) => {
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

  function post(obj) {
    try {
      if (window.parent && window.parent !== window) window.parent.postMessage(obj, '*')
    } catch {
      void 0
    }
  }

  function ensureVeil() {
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

  function ensureHighlight() {
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

  function ensureCanvas() {
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

  function resizeCanvas() {
    if (!canvas || !ctx) return
    const dpr = window.devicePixelRatio || 1
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function removeSelectUi() {
    if (veil) {
      veil.remove()
      veil = null
    }
    if (highlight) {
      highlight.remove()
      highlight = null
    }
  }

  function removeAnnotateUi() {
    if (canvas) {
      window.removeEventListener('resize', resizeCanvas)
      canvas.remove()
      canvas = null
      ctx = null
    }
    drawing = false
    last = null
  }

  function isOverlayNode(el) {
    if (!el || el.nodeType !== 1) return true
    if (el === veil || el === highlight || (canvas && el === canvas)) return true
    if (el.getAttribute('data-sf-pt-veil') != null) return true
    if (el.getAttribute('data-sf-pt-hl') != null) return true
    if (el.getAttribute('data-sf-pt-draw') != null) return true
    if (el.getAttribute('data-sf-inline-toolbar') != null) return true
    return false
  }

  function pickTarget(ev) {
    let list = []
    try {
      list = document.elementsFromPoint(ev.clientX, ev.clientY)
    } catch {
      return null
    }
    for (let i = 0; i < list.length; i++) {
      const el = list[i]
      if (isOverlayNode(el)) continue
      const tag = el.tagName
      if (tag === 'HTML' || tag === 'BODY') continue
      return el
    }
    return null
  }

  function syncHighlight(el) {
    const h = ensureHighlight()
    if (!el || !el.getBoundingClientRect) {
      h.style.display = 'none'
      return
    }
    const r = el.getBoundingClientRect()
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

  function onSelectMove(ev) {
    if (!selectMode) return
    const el = pickTarget(ev)
    syncHighlight(el)
  }

  function canTextEdit(el) {
    if (!el || el.nodeType !== 1) return false
    const t = el.tagName
    if (t === 'IMG' || t === 'SVG' || t === 'VIDEO' || t === 'CANVAS' || t === 'IFRAME' || t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || t === 'BUTTON')
      return t === 'BUTTON'
    const allow = {
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

  function removeInlineToolbar() {
    if (inlineToolbar) {
      inlineToolbar.remove()
      inlineToolbar = null
    }
  }

  function positionToolbarNear(el) {
    if (!inlineToolbar || !el) return
    const r = el.getBoundingClientRect()
    const pad = 8
    let top = r.bottom + pad
    let left = r.left
    const tw = inlineToolbar.offsetWidth || 280
    const th = inlineToolbar.offsetHeight || 48
    if (left + tw > window.innerWidth - pad) left = window.innerWidth - tw - pad
    if (left < pad) left = pad
    if (r.bottom + th + pad * 2 > window.innerHeight) {
      top = r.top - th - pad
    }
    inlineToolbar.style.position = 'fixed'
    inlineToolbar.style.top = Math.max(pad, top) + 'px'
    inlineToolbar.style.left = left + 'px'
  }

  function baseToolbar() {
    const bar = document.createElement('div')
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

  function btn(label, primary) {
    const b = document.createElement('button')
    b.type = 'button'
    b.textContent = label
    Object.assign(b.style, {
      padding: '6px 12px',
      borderRadius: '8px',
      border: primary ? '1px solid rgba(167, 139, 250, 0.5)' : '1px solid #3d3758',
      background: primary ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.95), rgba(167, 139, 250, 0.75))' : 'transparent',
      color: '#fff',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '11px',
    })
    return b
  }

  function applyStyleHtmlToActive(htmlStr) {
    stopImgPan()
    const el = activeInlineEl
    if (!el || !el.parentNode) return false
    const parent = el.parentNode
    const wrap = document.createElement('div')
    wrap.innerHTML = String(htmlStr || '').trim()
    const next = wrap.firstElementChild
    if (!next) return false
    const wasImg = el.tagName === 'IMG'
    parent.replaceChild(next, el)
    activeInlineEl = next
    if (!wasImg && canTextEdit(next)) {
      next.contentEditable = 'true'
    }
    activeInlineEl.style.outline = '2px solid rgba(167, 139, 250, 0.95)'
    activeInlineEl.style.outlineOffset = '3px'
    if (activeInlineEl.tagName === 'IMG') {
      imgPanCleanup = attachImgPan(activeInlineEl)
    }
    if (inlineToolbar && activeInlineEl) positionToolbarNear(activeInlineEl)
    return true
  }

  function teardownInlineEdit(restore) {
    pendingTextAiId = null
    pendingStyleAiId = null
    aiEnhanceBtn = null
    stopImgPan()
    if (inlineToolbar && inlineToolbar._sfScroll) {
      window.removeEventListener('scroll', inlineToolbar._sfScroll, true)
    }
    removeInlineToolbar()
    if (activeInlineEl && restore && inlineSnapshot !== null) {
      try {
        activeInlineEl.outerHTML = inlineSnapshot
      } catch {
        void 0
      }
    } else if (activeInlineEl) {
      activeInlineEl.contentEditable = 'false'
      activeInlineEl.style.outline = ''
      activeInlineEl.style.outlineOffset = ''
    }
    activeInlineEl = null
    inlineSnapshot = null
  }

  function prepareDocumentForSave() {
    stopImgPan()
    removeInlineToolbar()
    document.querySelectorAll('[data-sf-pt-veil], [data-sf-pt-hl], [data-sf-pt-draw]').forEach((n) => n.remove())
    veil = null
    highlight = null
    canvas = null
    ctx = null
    if (activeInlineEl) {
      activeInlineEl.contentEditable = 'false'
      activeInlineEl.style.outline = ''
      activeInlineEl.style.outlineOffset = ''
    }
    activeInlineEl = null
    inlineSnapshot = null
  }

  function saveHomepageFromDom() {
    pendingTextAiId = null
    pendingStyleAiId = null
    aiEnhanceBtn = null
    if (inlineToolbar && inlineToolbar._sfScroll) {
      window.removeEventListener('scroll', inlineToolbar._sfScroll, true)
    }
    prepareDocumentForSave()
    selectMode = false
    annotateMode = false
    const html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML
    post({ type: 'SF_SAVE_HOMEPAGE_HTML', html })
    post({ type: 'SF_INLINE_EDIT_END' })
  }

  function beginImgEdit(el) {
    inlineSnapshot = el.outerHTML
    activeInlineEl = el
    const bar = baseToolbar()
    inlineToolbar = bar
    const urlIn = document.createElement('input')
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
    const fileIn = document.createElement('input')
    fileIn.type = 'file'
    fileIn.accept = 'image/*'
    fileIn.style.maxWidth = '120px'
    fileIn.addEventListener('change', () => {
      const f = fileIn.files && fileIn.files[0]
      if (!f) return
      const r = new FileReader()
      r.onload = () => {
        el.src = String(r.result || '')
      }
      r.readAsDataURL(f)
    })
    const applyUrl = btn('Set URL', true)
    applyUrl.addEventListener('click', () => {
      const u = urlIn.value.trim()
      if (u) el.src = u
    })
    const save = btn('Save', true)
    save.addEventListener('click', () => saveHomepageFromDom())
    const cancel = btn('Cancel', false)
    cancel.addEventListener('click', () => {
      teardownInlineEdit(true)
      post({ type: 'SF_INLINE_EDIT_END' })
    })
    const rowImg = document.createElement('div')
    Object.assign(rowImg.style, { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' })
    rowImg.appendChild(urlIn)
    rowImg.appendChild(fileIn)
    rowImg.appendChild(applyUrl)
    rowImg.appendChild(save)
    rowImg.appendChild(cancel)
    const panHint = document.createElement('div')
    panHint.textContent = 'Click and drag the image to move the visible area inside the frame.'
    Object.assign(panHint.style, { fontSize: '10px', color: '#9b92b8', lineHeight: '1.35', maxWidth: '100%' })
    Object.assign(bar.style, {
      flexDirection: 'column',
      alignItems: 'stretch',
      maxWidth: 'min(420px, calc(100vw - 24px))',
      gap: '10px',
    })
    const imgAiPanel = document.createElement('div')
    Object.assign(imgAiPanel.style, {
      display: 'none',
      flexDirection: 'column',
      gap: '10px',
    })
    const imgTa = document.createElement('textarea')
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
    const imgEnhance = btn('Apply', true)
    aiEnhanceBtn = imgEnhance
    imgEnhance.addEventListener('click', () => {
      const instruction = imgTa.value.trim()
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
    const imgAiToggle = document.createElement('button')
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
    let imgAiOpen = false
    imgAiToggle.addEventListener('click', () => {
      imgAiOpen = !imgAiOpen
      imgAiPanel.style.display = imgAiOpen ? 'flex' : 'none'
      imgAiToggle.style.background = imgAiOpen ? 'rgba(167, 139, 250, 0.22)' : 'rgba(124, 58, 237, 0.12)'
      imgAiToggle.style.borderColor = imgAiOpen ? 'rgba(244, 114, 182, 0.45)' : 'rgba(124, 58, 237, 0.35)'
      positionToolbarNear(activeInlineEl || el)
    })
    rowImg.appendChild(imgAiToggle)
    bar.appendChild(rowImg)
    bar.appendChild(panHint)
    bar.appendChild(imgAiPanel)
    document.documentElement.appendChild(bar)
    el.style.outline = '2px solid rgba(167, 139, 250, 0.95)'
    el.style.outlineOffset = '3px'
    const scrollFnImg = () => positionToolbarNear(activeInlineEl || el)
    bar._sfScroll = scrollFnImg
    window.addEventListener('scroll', scrollFnImg, true)
    positionToolbarNear(el)
    imgPanCleanup = attachImgPan(el)
    const onImgLoad = () => {
      if (activeInlineEl !== el || !inlineToolbar) return
      stopImgPan()
      imgPanCleanup = attachImgPan(el)
    }
    if (!el.complete || el.naturalWidth === 0) {
      el.addEventListener('load', onImgLoad, { once: true })
    }
  }

  function beginTextEdit(el) {
    inlineSnapshot = el.outerHTML
    activeInlineEl = el
    el.contentEditable = 'true'
    el.style.outline = '2px solid rgba(167, 139, 250, 0.95)'
    el.style.outlineOffset = '3px'
    const bar = baseToolbar()
    inlineToolbar = bar
    Object.assign(bar.style, {
      flexDirection: 'column',
      alignItems: 'stretch',
      maxWidth: 'min(420px, calc(100vw - 24px))',
      gap: '10px',
    })
    const row1 = document.createElement('div')
    Object.assign(row1.style, { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' })
    const hint = document.createElement('span')
    hint.textContent = 'Edit text'
    Object.assign(hint.style, { marginRight: '6px', opacity: '0.85' })
    const save = btn('Save', true)
    save.addEventListener('click', () => saveHomepageFromDom())
    const cancel = btn('Cancel', false)
    cancel.addEventListener('click', () => {
      teardownInlineEdit(true)
      post({ type: 'SF_INLINE_EDIT_END' })
    })
    row1.appendChild(hint)
    row1.appendChild(save)
    row1.appendChild(cancel)
    const addSection = document.createElement('button')
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
      const path = window.location && window.location.pathname ? window.location.pathname : '/'
      post({ type: 'SF_ADD_COMPONENT_CLICK', route: path })
    })
    row1.appendChild(addSection)

    const aiCfg = window.__SF_PREVIEW_AI__ || {}
    const aiPanel = document.createElement('div')
    Object.assign(aiPanel.style, {
      display: 'none',
      flexDirection: 'column',
      gap: '10px',
    })
    const modeRow = document.createElement('div')
    Object.assign(modeRow.style, {
      display: 'flex',
      gap: '12px',
      fontSize: '11px',
      color: '#b8b2d1',
    })
    const rTextMode = document.createElement('input')
    rTextMode.type = 'radio'
    rTextMode.name = 'sf-ai-text-or-appearance'
    rTextMode.checked = true
    const labTextMode = document.createElement('label')
    labTextMode.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer;'
    labTextMode.appendChild(rTextMode)
    labTextMode.appendChild(document.createTextNode('Text'))
    const rAppMode = document.createElement('input')
    rAppMode.type = 'radio'
    rAppMode.name = 'sf-ai-text-or-appearance'
    const labAppMode = document.createElement('label')
    labAppMode.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer;'
    labAppMode.appendChild(rAppMode)
    labAppMode.appendChild(document.createTextNode('Appearance'))
    modeRow.appendChild(labTextMode)
    modeRow.appendChild(labAppMode)
    const ta = document.createElement('textarea')
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
    let outLang = 'en'
    const langRow = document.createElement('div')
    Object.assign(langRow.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      fontSize: '11px',
      color: '#b8b2d1',
    })
    const rEn = document.createElement('input')
    rEn.type = 'radio'
    rEn.name = 'sf-ai-out-lang'
    rEn.checked = true
    const labEn = document.createElement('label')
    labEn.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer;'
    labEn.appendChild(rEn)
    labEn.appendChild(document.createTextNode('Output in English'))
    rEn.addEventListener('change', () => {
      if (rEn.checked) outLang = 'en'
    })
    langRow.appendChild(labEn)
    if (aiCfg.canIndian && aiCfg.indianLabel) {
      const rIn = document.createElement('input')
      rIn.type = 'radio'
      rIn.name = 'sf-ai-out-lang'
      const labIn = document.createElement('label')
      labIn.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer;'
      labIn.appendChild(rIn)
      labIn.appendChild(document.createTextNode('Output in ' + aiCfg.indianLabel))
      rIn.addEventListener('change', () => {
        if (rIn.checked) outLang = 'indian'
      })
      langRow.appendChild(labIn)
    }
    const syncTextAiModeUi = () => {
      const appearance = rAppMode.checked
      langRow.style.display = appearance ? 'none' : 'flex'
      ta.placeholder = appearance
        ? 'Describe styling (spacing, colors, classes…)…'
        : 'Describe how you want this text to read…'
    }
    rTextMode.addEventListener('change', syncTextAiModeUi)
    rAppMode.addEventListener('change', syncTextAiModeUi)
    const enhance = btn('Apply', true)
    aiEnhanceBtn = enhance
    enhance.addEventListener('click', () => {
      const instruction = ta.value.trim()
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
      const text = activeInlineEl.innerText || ''
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

    const aiToggle = document.createElement('button')
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
    let aiOpen = false
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
    const scrollFnText = () => positionToolbarNear(activeInlineEl || el)
    bar._sfScroll = scrollFnText
    window.addEventListener('scroll', scrollFnText, true)
    positionToolbarNear(el)
    el.focus()
    try {
      const r = document.createRange()
      r.selectNodeContents(el)
      const s = window.getSelection()
      s.removeAllRanges()
      s.addRange(r)
    } catch {
      void 0
    }
  }

  function beginInlineEdit(el) {
    if (!el || el === document.documentElement || el === document.body) return
    removeSelectUi()
    selectMode = false
    post({ type: 'SF_INLINE_EDIT_BEGIN' })
    teardownInlineEdit(false)
    if (el.tagName === 'IMG') {
      beginImgEdit(el)
      return
    }
    if (canTextEdit(el)) {
      beginTextEdit(el)
      return
    }
    post({ type: 'SF_INLINE_EDIT_UNSUPPORTED' })
  }

  function onSelectClick(ev) {
    if (!selectMode) return
    ev.preventDefault()
    ev.stopPropagation()
    ev.stopImmediatePropagation()
    const el = pickTarget(ev)
    if (!el || el === document.documentElement || el === document.body) return
    beginInlineEdit(el)
  }

  function bindSelect() {
    removeSelectUi()
    if (!selectMode) return
    ensureVeil()
    ensureHighlight()
    veil.addEventListener('mousemove', onSelectMove, true)
    veil.addEventListener('click', onSelectClick, true)
  }

  function clearCanvas() {
    if (!canvas || !ctx) return
    resizeCanvas()
  }

  function bindAnnotate() {
    removeAnnotateUi()
    if (!annotateMode) return
    const c = ensureCanvas()
    clearCanvas()
    const line = (ev) => {
      const x = ev.clientX
      const y = ev.clientY
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
    c.addEventListener('pointerdown', (ev) => {
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

  function applyModes() {
    if (!selectMode) removeSelectUi()
    else bindSelect()
    if (!annotateMode) removeAnnotateUi()
    else bindAnnotate()
  }

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return
    if (activeInlineEl || inlineToolbar) {
      e.preventDefault()
      teardownInlineEdit(true)
      post({ type: 'SF_INLINE_EDIT_END' })
      return
    }
    post({ type: 'SF_PREVIEW_TOOLS_ESCAPE' })
  })

  window.addEventListener('message', (ev) => {
    const d = ev.data || {}
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
        const ok = applyStyleHtmlToActive(String(d.html))
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

  window.addEventListener('load', () => {
    post({ type: 'SF_PREVIEW_TOOLS_READY', route: location.pathname || '/' })
  })
  if (document.readyState === 'complete') {
    post({ type: 'SF_PREVIEW_TOOLS_READY', route: location.pathname || '/' })
  }
})()
