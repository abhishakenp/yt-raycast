/**
 * Vanilla JS file tree drawer for multi-page website navigation.
 * Converted from React to eliminate client-side React dependency.
 */

class FileTreeDrawer {
  constructor(options = {}) {
    this.pages = options.pages || []
    this.currentRoute = options.currentRoute || '/'
    this.onNavigate = options.onNavigate || (() => {})
    this.isOpen = options.isOpen || false
    this.showToggle = options.showToggle !== false
    
    this.drawerElement = null
    this.overlayElement = null
    this.toggleButton = null
    
    this.init()
  }
  
  init() {
    this.createToggleButton()
    this.createDrawer()
    this.createOverlay()
    this.attachEventListeners()
  }
  
  createToggleButton() {
    if (!this.showToggle) return
    
    this.toggleButton = document.createElement('button')
    this.toggleButton.className = `
      fixed top-4 left-4 z-30 p-2 rounded-lg transition-all duration-200
      ${this.isOpen 
        ? 'bg-zinc-800 text-white border border-white/10' 
        : 'bg-zinc-900/80 text-gray-400 hover:text-white border border-white/5'
      }
      backdrop-blur-md shadow-lg
    `
    this.toggleButton.style.backdropFilter = 'blur(8px)'
    this.toggleButton.setAttribute('aria-label', 'Toggle file tree')
    this.toggleButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 7V5c0-1.1.9-2 2-2h2"/>
        <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
        <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
        <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
        <rect x="7" y="7" width="10" height="10" rx="2"/>
      </svg>
    `
    
    this.toggleButton.addEventListener('click', () => this.close())
    document.body.appendChild(this.toggleButton)
  }
  
  createOverlay() {
    this.overlayElement = document.createElement('div')
    this.overlayElement.className = 'fixed inset-0 bg-black/50 z-40 transition-opacity duration-200'
    this.overlayElement.style.backdropFilter = 'blur(2px)'
    this.overlayElement.style.display = this.isOpen ? 'block' : 'none'
    
    this.overlayElement.addEventListener('click', () => this.close())
    document.body.appendChild(this.overlayElement)
  }
  
  createDrawer() {
    this.drawerElement = document.createElement('div')
    this.drawerElement.className = `
      fixed top-0 left-0 h-full w-72 bg-zinc-900/95 border-r border-white/10
      transform transition-transform duration-300 ease-out z-50
      flex flex-col
      ${this.isOpen ? 'translate-x-0' : '-translate-x-full'}
    `
    this.drawerElement.style.backdropFilter = 'blur(12px)'
    
    const header = document.createElement('div')
    header.className = 'flex items-center justify-between px-4 py-3 border-b border-white/10'
    header.innerHTML = `
      <h2 class="text-sm font-medium text-white">Pages</h2>
      <button class="text-gray-400 hover:text-white transition-colors" aria-label="Close drawer">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18"/>
          <path d="m6 6 12 12"/>
        </svg>
      </button>
    `
    
    const closeButton = header.querySelector('button')
    closeButton.addEventListener('click', () => this.close())
    
    const content = document.createElement('div')
    content.className = 'flex-1 overflow-y-auto py-2'
    content.innerHTML = this.renderTree()
    
    // Attach click events to tree items
    this.attachTreeClickHandlers(content)
    
    this.drawerElement.appendChild(header)
    this.drawerElement.appendChild(content)
    document.body.appendChild(this.drawerElement)
  }
  
  buildTreeFromPages(pages) {
    const tree = []
    const rootMap = new Map()
    
    for (const page of pages) {
      const segments = page.route.split('/').filter(Boolean)
      
      if (segments.length === 0) {
        const homeNode = {
          id: page.id,
          name: page.name,
          route: page.route,
          isFolder: false,
        }
        tree.push(homeNode)
        rootMap.set(page.route, homeNode)
        continue
      }
      
      let currentPath = ''
      let currentLevel = tree
      
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]
        currentPath += '/' + segment
        const isLast = i === segments.length - 1
        
        let existingNode = currentLevel.find(n => n.name === segment)
        
        if (!existingNode) {
          const newNode = {
            id: isLast ? page.id : `${currentPath}-folder`,
            name: segment,
            route: isLast ? page.route : currentPath,
            isFolder: !isLast,
            children: isLast ? undefined : [],
          }
          
          currentLevel.push(newNode)
          if (!isLast) {
            currentLevel = newNode.children
            rootMap.set(currentPath, newNode)
          }
        } else if (!isLast && existingNode.children) {
          currentLevel = existingNode.children
        }
      }
    }
    
    return tree
  }
  
  renderTree() {
    const tree = this.buildTreeFromPages(this.pages)
    
    if (tree.length === 0) {
      return '<div class="px-4 py-8 text-sm text-gray-500 text-center">No pages available</div>'
    }
    
    return tree.map(node => this.renderTreeNode(node, 0)).join('')
  }
  
  renderTreeNode(node, level) {
    const hasChildren = node.children && node.children.length > 0
    const isActive = node.route === this.currentRoute
    const paddingLeft = `${level * 12 + 8}px`
    
    const iconHtml = hasChildren 
      ? `<span class="text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </span>`
      : `<span class="w-[14px]"></span>`
    
    const folderIconHtml = node.isFolder
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400">
          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
        </svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>`
    
    const childrenHtml = hasChildren 
      ? `<div>${node.children.map(child => this.renderTreeNode(child, level + 1)).join('')}</div>`
      : ''
    
    return `
      <div>
        <div
          class="tree-node flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-white/5 transition-colors duration-150 ${isActive ? 'bg-white/10 text-white' : 'text-gray-400'}"
          style="padding-left: ${paddingLeft}"
          data-route="${node.route}"
          data-is-folder="${hasChildren}"
        >
          ${iconHtml}
          ${folderIconHtml}
          <span class="text-sm truncate">${node.name}</span>
        </div>
        ${childrenHtml}
      </div>
    `
  }
  
  attachTreeClickHandlers(container) {
    const nodes = container.querySelectorAll('.tree-node')
    nodes.forEach(node => {
      node.addEventListener('click', (e) => {
        const route = node.dataset.route
        const isFolder = node.dataset.isFolder === 'true'
        
        if (isFolder) {
          // Toggle folder expansion (simplified - just navigate for now)
          this.onNavigate(route)
        } else {
          this.onNavigate(route)
          this.close()
        }
      })
    })
  }
  
  attachEventListeners() {
    // Update toggle button state when drawer opens/closes
    this.updateToggleButton()
  }
  
  updateToggleButton() {
    if (!this.toggleButton) return
    
    if (this.isOpen) {
      this.toggleButton.className = `
        fixed top-4 left-4 z-30 p-2 rounded-lg transition-all duration-200
        bg-zinc-800 text-white border border-white/10
        backdrop-blur-md shadow-lg
      `
    } else {
      this.toggleButton.className = `
        fixed top-4 left-4 z-30 p-2 rounded-lg transition-all duration-200
        bg-zinc-900/80 text-gray-400 hover:text-white border border-white/5
        backdrop-blur-md shadow-lg
      `
    }
  }
  
  open() {
    this.isOpen = true
    this.drawerElement.classList.remove('-translate-x-full')
    this.drawerElement.classList.add('translate-x-0')
    this.overlayElement.style.display = 'block'
    this.updateToggleButton()
  }
  
  close() {
    this.isOpen = false
    this.drawerElement.classList.remove('translate-x-0')
    this.drawerElement.classList.add('-translate-x-full')
    this.overlayElement.style.display = 'none'
    this.updateToggleButton()
  }
  
  toggle() {
    if (this.isOpen) {
      this.close()
    } else {
      this.open()
    }
  }
  
  updatePages(pages) {
    this.pages = pages
    const content = this.drawerElement.querySelector('.flex-1.overflow-y-auto')
    if (content) {
      content.innerHTML = this.renderTree()
      this.attachTreeClickHandlers(content)
    }
  }
  
  updateCurrentRoute(route) {
    this.currentRoute = route
    const content = this.drawerElement.querySelector('.flex-1.overflow-y-auto')
    if (content) {
      content.innerHTML = this.renderTree()
      this.attachTreeClickHandlers(content)
    }
  }
  
  destroy() {
    if (this.toggleButton) {
      this.toggleButton.remove()
    }
    if (this.overlayElement) {
      this.overlayElement.remove()
    }
    if (this.drawerElement) {
      this.drawerElement.remove()
    }
  }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.FileTreeDrawer = FileTreeDrawer
}