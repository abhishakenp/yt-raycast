export interface ChipScaleItem {
  id: string
  label: string
  value: string
}

export interface ChipScaleOptions {
  label: string
  chips: ChipScaleItem[]
  current?: string
  onPick(chipId: string, value: string): void
}

export interface ChipScaleControl {
  root: HTMLElement
  select(chipId: string): void
}

export const CHIP_SCALES = {
  padding: [
    { id: 'none', label: 'None', value: '0' },
    { id: 'tight', label: 'Tight', value: '4px' },
    { id: 'cozy', label: 'Cozy', value: '8px' },
    { id: 'roomy', label: 'Roomy', value: '16px' },
    { id: 'spacious', label: 'Spacious', value: '24px' },
  ],
  margin: [
    { id: 'none', label: 'None', value: '0' },
    { id: 'tight', label: 'Tight', value: '4px' },
    { id: 'cozy', label: 'Cozy', value: '8px' },
    { id: 'roomy', label: 'Roomy', value: '16px' },
    { id: 'spacious', label: 'Spacious', value: '24px' },
  ],
  radius: [
    { id: 'small', label: 'Small', value: '4px' },
    { id: 'medium', label: 'Medium', value: '10px' },
    { id: 'large', label: 'Large', value: '20px' },
    { id: 'full', label: 'Full', value: '9999px' },
  ],
  fontSize: [
    { id: 'xs', label: 'XS', value: '12px' },
    { id: 's', label: 'S', value: '14px' },
    { id: 'm', label: 'M', value: '16px' },
    { id: 'l', label: 'L', value: '20px' },
    { id: 'xl', label: 'XL', value: '28px' },
    { id: 'xxl', label: 'XXL', value: '40px' },
  ],
  fontWeight: [
    { id: 'light', label: 'Light', value: '300' },
    { id: 'normal', label: 'Normal', value: '400' },
    { id: 'bold', label: 'Bold', value: '700' },
    { id: 'extraBold', label: 'ExtraBold', value: '800' },
  ],
  lineHeight: [
    { id: 'tight', label: 'Tight', value: '1.15' },
    { id: 'normal', label: 'Normal', value: '1.5' },
    { id: 'loose', label: 'Loose', value: '1.8' },
  ],
  shadow: [
    { id: 'none', label: 'None', value: 'none' },
    { id: 'soft', label: 'Soft', value: '0 1px 2px rgba(0,0,0,0.06)' },
    { id: 'medium', label: 'Medium', value: '0 4px 10px rgba(0,0,0,0.10)' },
    { id: 'strong', label: 'Strong', value: '0 10px 25px rgba(0,0,0,0.15)' },
    { id: 'dramatic', label: 'Dramatic', value: '0 25px 50px rgba(0,0,0,0.25)' },
  ],
  gap: [
    { id: 'tight', label: 'Tight', value: '4px' },
    { id: 'cozy', label: 'Cozy', value: '8px' },
    { id: 'roomy', label: 'Roomy', value: '16px' },
    { id: 'spacious', label: 'Spacious', value: '24px' },
  ],
} as const

export type ChipScaleKey = keyof typeof CHIP_SCALES

export function createChipScale(opts: ChipScaleOptions): ChipScaleControl {
  const root = document.createElement('div')
  root.setAttribute('data-sf-panel-control', 'chip-scale')
  Object.assign(root.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontFamily: 'system-ui, sans-serif',
    color: '#e8e4ff',
  })

  const label = document.createElement('div')
  label.textContent = opts.label
  Object.assign(label.style, { fontSize: '11px', opacity: '0.75', fontWeight: '600' })
  root.appendChild(label)

  const row = document.createElement('div')
  row.setAttribute('role', 'radiogroup')
  Object.assign(row.style, { display: 'flex', flexWrap: 'wrap', gap: '4px' })
  root.appendChild(row)

  const buttons: HTMLButtonElement[] = []
  let currentIdx = opts.chips.findIndex((c) => c.id === opts.current)

  function paint(): void {
    for (let i = 0; i < buttons.length; i++) {
      const active = i === currentIdx
      buttons[i].style.background = active
        ? 'linear-gradient(135deg, rgba(124,58,237,0.95), rgba(167,139,250,0.75))'
        : 'transparent'
      buttons[i].style.borderColor = active ? 'rgba(167,139,250,0.8)' : '#3d3758'
      buttons[i].setAttribute('aria-checked', active ? 'true' : 'false')
      buttons[i].tabIndex = active ? 0 : -1
    }
  }

  opts.chips.forEach((chip, i) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.textContent = chip.label
    b.setAttribute('role', 'radio')
    Object.assign(b.style, {
      padding: '4px 10px',
      borderRadius: '999px',
      border: '1px solid #3d3758',
      background: 'transparent',
      color: '#e8e4ff',
      fontSize: '11px',
      cursor: 'pointer',
      fontFamily: 'system-ui, sans-serif',
    })
    b.addEventListener('click', () => {
      currentIdx = i
      paint()
      opts.onPick(chip.id, chip.value)
    })
    b.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
        ev.preventDefault()
        const dir = ev.key === 'ArrowRight' ? 1 : -1
        const nextIdx = (currentIdx < 0 ? 0 : currentIdx + dir + buttons.length) % buttons.length
        currentIdx = nextIdx
        paint()
        buttons[nextIdx].focus()
        const c = opts.chips[nextIdx]
        opts.onPick(c.id, c.value)
      }
    })
    row.appendChild(b)
    buttons.push(b)
  })

  paint()

  return {
    root,
    select(chipId: string): void {
      const idx = opts.chips.findIndex((c) => c.id === chipId)
      if (idx >= 0) {
        currentIdx = idx
        paint()
      }
    },
  }
}
