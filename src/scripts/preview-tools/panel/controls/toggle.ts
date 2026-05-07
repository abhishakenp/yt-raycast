export interface ToggleOptions {
  label: string
  current?: boolean
  onChange(v: boolean): void
  hint?: string
}

export interface ToggleControl {
  root: HTMLElement
  set(v: boolean): void
}

export function createToggle(opts: ToggleOptions): ToggleControl {
  const root = document.createElement('label')
  root.setAttribute('data-sf-panel-control', 'toggle')
  Object.assign(root.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'system-ui, sans-serif',
    color: '#e8e4ff',
    fontSize: '11px',
    cursor: 'pointer',
    userSelect: 'none',
  })

  let value = !!opts.current

  const pill = document.createElement('span')
  Object.assign(pill.style, {
    width: '28px',
    height: '16px',
    borderRadius: '999px',
    background: '#2a2440',
    border: '1px solid #3d3758',
    position: 'relative',
    flex: '0 0 auto',
    transition: 'background 0.15s ease',
  })
  const knob = document.createElement('span')
  Object.assign(knob.style, {
    position: 'absolute',
    top: '1px',
    left: '1px',
    width: '12px',
    height: '12px',
    borderRadius: '999px',
    background: '#fff',
    transition: 'left 0.15s ease',
  })
  pill.appendChild(knob)

  const text = document.createElement('span')
  text.textContent = opts.label
  Object.assign(text.style, { opacity: '0.9' })

  root.appendChild(pill)
  root.appendChild(text)

  if (opts.hint) {
    const h = document.createElement('span')
    h.textContent = opts.hint
    Object.assign(h.style, { opacity: '0.55', fontSize: '10px' })
    root.appendChild(h)
  }

  function paint(): void {
    pill.style.background = value ? 'rgba(124,58,237,0.9)' : '#2a2440'
    pill.style.borderColor = value ? 'rgba(167,139,250,0.8)' : '#3d3758'
    knob.style.left = value ? '13px' : '1px'
    root.setAttribute('aria-pressed', value ? 'true' : 'false')
  }

  root.addEventListener('click', (e) => {
    e.preventDefault()
    value = !value
    paint()
    opts.onChange(value)
  })

  paint()

  return {
    root,
    set(v: boolean): void {
      value = !!v
      paint()
    },
  }
}
