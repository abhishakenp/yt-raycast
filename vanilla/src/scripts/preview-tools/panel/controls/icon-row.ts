export interface IconRowItem {
  id: string
  label: string
  svg: string
}

export interface IconRowOptions {
  icons: IconRowItem[]
  current?: string
  onPick(iconId: string): void
  multiSelect?: boolean
}

export interface IconRowControl {
  root: HTMLElement
  select(id: string): void
  toggle(id: string): void
}

export function createIconRow(opts: IconRowOptions): IconRowControl {
  const root = document.createElement('div')
  root.setAttribute('data-sf-panel-control', 'icon-row')
  Object.assign(root.style, {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    fontFamily: 'system-ui, sans-serif',
  })

  const active = new Set<string>()
  if (opts.current) active.add(opts.current)

  const buttons: Map<string, HTMLButtonElement> = new Map()

  function paint(): void {
    for (const [id, b] of buttons) {
      const isOn = active.has(id)
      b.style.background = isOn
        ? 'linear-gradient(135deg, rgba(124,58,237,0.95), rgba(167,139,250,0.75))'
        : 'transparent'
      b.style.borderColor = isOn ? 'rgba(167,139,250,0.8)' : '#3d3758'
      b.setAttribute('aria-pressed', isOn ? 'true' : 'false')
    }
  }

  for (const ic of opts.icons) {
    const b = document.createElement('button')
    b.type = 'button'
    b.title = ic.label
    b.setAttribute('aria-label', ic.label)
    b.innerHTML = ic.svg
    const svgEl = b.querySelector('svg') as SVGElement | null
    if (svgEl) {
      svgEl.setAttribute('width', '16')
      svgEl.setAttribute('height', '16')
    }
    Object.assign(b.style, {
      width: '28px',
      height: '28px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '6px',
      border: '1px solid #3d3758',
      background: 'transparent',
      color: '#e8e4ff',
      cursor: 'pointer',
      padding: '0',
    })
    b.addEventListener('click', () => {
      if (opts.multiSelect) {
        if (active.has(ic.id)) active.delete(ic.id)
        else active.add(ic.id)
      } else {
        active.clear()
        active.add(ic.id)
      }
      paint()
      opts.onPick(ic.id)
    })
    root.appendChild(b)
    buttons.set(ic.id, b)
  }

  paint()

  return {
    root,
    select(id: string): void {
      active.clear()
      active.add(id)
      paint()
    },
    toggle(id: string): void {
      if (active.has(id)) active.delete(id)
      else active.add(id)
      paint()
    },
  }
}
