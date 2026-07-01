var u = class {
  constructor(e = {}) {
    ;((this.pages = e.pages || []),
      (this.currentRoute = e.currentRoute || '/'),
      (this.onNavigate = e.onNavigate || (() => {})),
      (this.isOpen = e.isOpen || !1),
      (this.showToggle = e.showToggle !== !1),
      (this.drawerElement = null),
      (this.overlayElement = null),
      (this.toggleButton = null),
      this.init())
  }
  init() {
    ;(this.createToggleButton(),
      this.createDrawer(),
      this.createOverlay(),
      this.attachEventListeners())
  }
  createToggleButton() {
    this.showToggle &&
      ((this.toggleButton = document.createElement('button')),
      (this.toggleButton.className = `
      fixed top-4 left-4 z-30 p-2 rounded-lg transition-all duration-200
      ${this.isOpen ? 'bg-zinc-800 text-white border border-white/10' : 'bg-zinc-900/80 text-gray-400 hover:text-white border border-white/5'}
      backdrop-blur-md shadow-lg
    `),
      (this.toggleButton.style.backdropFilter = 'blur(8px)'),
      this.toggleButton.setAttribute('aria-label', 'Toggle file tree'),
      (this.toggleButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 7V5c0-1.1.9-2 2-2h2"/>
        <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
        <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
        <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
        <rect x="7" y="7" width="10" height="10" rx="2"/>
      </svg>
    `),
      this.toggleButton.addEventListener('click', () => this.toggle()),
      document.body.appendChild(this.toggleButton))
  }
  createOverlay() {
    ;((this.overlayElement = document.createElement('div')),
      (this.overlayElement.className =
        'fixed inset-0 bg-black/50 z-40 transition-opacity duration-200'),
      (this.overlayElement.style.backdropFilter = 'blur(2px)'),
      (this.overlayElement.style.display = this.isOpen ? 'block' : 'none'),
      this.overlayElement.addEventListener('click', () => this.close()),
      document.body.appendChild(this.overlayElement))
  }
  createDrawer() {
    ;((this.drawerElement = document.createElement('div')),
      (this.drawerElement.className = `
      fixed top-0 left-0 h-full w-72 bg-zinc-900/95 border-r border-white/10
      transform transition-transform duration-300 ease-out z-50
      flex flex-col
      ${this.isOpen ? 'translate-x-0' : '-translate-x-full'}
    `),
      (this.drawerElement.style.backdropFilter = 'blur(12px)'))
    let e = document.createElement('div')
    ;((e.className =
      'flex items-center justify-between px-4 py-3 border-b border-white/10'),
      (e.innerHTML = `
      <h2 class="text-sm font-medium text-white">Pages</h2>
      <button class="text-gray-400 hover:text-white transition-colors" aria-label="Close drawer">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18"/>
          <path d="m6 6 12 12"/>
        </svg>
      </button>
    `),
      e.querySelector('button').addEventListener('click', () => this.close()))
    let r = document.createElement('div')
    ;((r.className = 'flex-1 overflow-y-auto py-2'),
      (r.innerHTML = this.renderTree()),
      this.attachTreeClickHandlers(r),
      this.drawerElement.appendChild(e),
      this.drawerElement.appendChild(r),
      document.body.appendChild(this.drawerElement))
  }
  buildTreeFromPages(e) {
    let t = [],
      r = new Map()
    for (let s of e) {
      let n = s.route.split('/').filter(Boolean)
      if (n.length === 0) {
        let o = { id: s.id, name: s.name, route: s.route, isFolder: !1 }
        ;(t.push(o), r.set(s.route, o))
        continue
      }
      let i = '',
        l = t
      for (let o = 0; o < n.length; o++) {
        let d = n[o]
        i += '/' + d
        let a = o === n.length - 1,
          c = l.find((h) => h.name === d)
        if (c) !a && c.children && (l = c.children)
        else {
          let h = {
            id: a ? s.id : `${i}-folder`,
            name: d,
            route: a ? s.route : i,
            isFolder: !a,
            children: a ? void 0 : [],
          }
          ;(l.push(h), a || ((l = h.children), r.set(i, h)))
        }
      }
    }
    return t
  }
  renderTree() {
    let e = this.buildTreeFromPages(this.pages)
    return e.length === 0
      ? '<div class="px-4 py-8 text-sm text-gray-500 text-center">No pages available</div>'
      : e.map((t) => this.renderTreeNode(t, 0)).join('')
  }
  renderTreeNode(e, t) {
    let r = e.children && e.children.length > 0,
      s = e.route === this.currentRoute,
      n = `${t * 12 + 8}px`,
      i = r
        ? `<span class="text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </span>`
        : '<span class="w-[14px]"></span>',
      l = e.isFolder
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400">
          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
        </svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>`,
      o = r
        ? `<div>${e.children.map((d) => this.renderTreeNode(d, t + 1)).join('')}</div>`
        : ''
    return `
      <div>
        <div
          class="tree-node flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-white/5 transition-colors duration-150 ${s ? 'bg-white/10 text-white' : 'text-gray-400'}"
          style="padding-left: ${n}"
          data-route="${e.route}"
          data-is-folder="${r}"
        >
          ${i}
          ${l}
          <span class="text-sm truncate">${e.name}</span>
        </div>
        ${o}
      </div>
    `
  }
  attachTreeClickHandlers(e) {
    e.querySelectorAll('.tree-node').forEach((r) => {
      r.addEventListener('click', (s) => {
        let n = r.dataset.route
        r.dataset.isFolder === 'true'
          ? this.onNavigate(n)
          : (this.onNavigate(n), this.close())
      })
    })
  }
  attachEventListeners() {
    this.updateToggleButton()
  }
  updateToggleButton() {
    this.toggleButton &&
      (this.isOpen
        ? (this.toggleButton.className = `
        fixed top-4 left-4 z-30 p-2 rounded-lg transition-all duration-200
        bg-zinc-800 text-white border border-white/10
        backdrop-blur-md shadow-lg
      `)
        : (this.toggleButton.className = `
        fixed top-4 left-4 z-30 p-2 rounded-lg transition-all duration-200
        bg-zinc-900/80 text-gray-400 hover:text-white border border-white/5
        backdrop-blur-md shadow-lg
      `))
  }
  open() {
    ;((this.isOpen = !0),
      this.drawerElement.classList.remove('-translate-x-full'),
      this.drawerElement.classList.add('translate-x-0'),
      (this.overlayElement.style.display = 'block'),
      this.updateToggleButton())
  }
  close() {
    ;((this.isOpen = !1),
      this.drawerElement.classList.remove('translate-x-0'),
      this.drawerElement.classList.add('-translate-x-full'),
      (this.overlayElement.style.display = 'none'),
      this.updateToggleButton())
  }
  toggle() {
    this.isOpen ? this.close() : this.open()
  }
  updatePages(e) {
    this.pages = e
    let t = this.drawerElement.querySelector('.flex-1.overflow-y-auto')
    t && ((t.innerHTML = this.renderTree()), this.attachTreeClickHandlers(t))
  }
  updateCurrentRoute(e) {
    this.currentRoute = e
    let t = this.drawerElement.querySelector('.flex-1.overflow-y-auto')
    t && ((t.innerHTML = this.renderTree()), this.attachTreeClickHandlers(t))
  }
  destroy() {
    ;(this.toggleButton && this.toggleButton.remove(),
      this.overlayElement && this.overlayElement.remove(),
      this.drawerElement && this.drawerElement.remove())
  }
}
typeof window < 'u' && (window.FileTreeDrawer = u)
