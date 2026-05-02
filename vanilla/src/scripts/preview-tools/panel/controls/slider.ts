export interface SliderOptions {
  label: string
  min: number
  max: number
  step?: number
  current?: number
  onInput(v: number): void
  onChange?(v: number): void
  formatValue?(v: number): string
}

export interface SliderControl {
  root: HTMLElement
  set(v: number): void
}

export function createSlider(opts: SliderOptions): SliderControl {
  const root = document.createElement('div')
  root.setAttribute('data-sf-panel-control', 'slider')
  Object.assign(root.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontFamily: 'system-ui, sans-serif',
    color: '#e8e4ff',
  })

  const fmt = opts.formatValue || ((v: number) => String(v))

  const header = document.createElement('div')
  Object.assign(header.style, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  })
  const label = document.createElement('span')
  label.textContent = opts.label
  Object.assign(label.style, { fontSize: '11px', opacity: '0.75', fontWeight: '600' })
  const chip = document.createElement('span')
  Object.assign(chip.style, {
    padding: '2px 8px',
    borderRadius: '999px',
    border: '1px solid #3d3758',
    background: '#0f0d1a',
    fontSize: '10px',
    minWidth: '36px',
    textAlign: 'center',
  })
  header.appendChild(label)
  header.appendChild(chip)
  root.appendChild(header)

  const row = document.createElement('div')
  Object.assign(row.style, { display: 'flex', alignItems: 'center', gap: '6px' })
  const minLabel = document.createElement('span')
  minLabel.textContent = fmt(opts.min)
  Object.assign(minLabel.style, { fontSize: '10px', opacity: '0.5' })
  const input = document.createElement('input')
  input.type = 'range'
  input.min = String(opts.min)
  input.max = String(opts.max)
  input.step = String(opts.step ?? 1)
  const start = typeof opts.current === 'number' ? opts.current : opts.min
  input.value = String(start)
  Object.assign(input.style, { flex: '1', accentColor: '#a78bfa' })
  const maxLabel = document.createElement('span')
  maxLabel.textContent = fmt(opts.max)
  Object.assign(maxLabel.style, { fontSize: '10px', opacity: '0.5' })
  row.appendChild(minLabel)
  row.appendChild(input)
  row.appendChild(maxLabel)
  root.appendChild(row)

  function paintChip(v: number): void {
    chip.textContent = fmt(v)
  }
  paintChip(start)

  input.addEventListener('input', () => {
    const v = Number(input.value)
    paintChip(v)
    opts.onInput(v)
  })
  input.addEventListener('change', () => {
    const v = Number(input.value)
    if (opts.onChange) opts.onChange(v)
  })

  return {
    root,
    set(v: number): void {
      input.value = String(v)
      paintChip(v)
    },
  }
}
