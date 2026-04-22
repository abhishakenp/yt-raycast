const esc = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

export const GLASS_LENS_FILTER_ID = 'sf-glass-lens'

export const glassPillSvgDefs = () =>
  `<svg class="sf-glass-sr-only" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><filter id="${GLASS_LENS_FILTER_ID}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.0082 0.0058" numOctaves="3" seed="41" result="noise" /><feGaussianBlur in="noise" stdDeviation="2" result="smooth" /><feDisplacementMap in="SourceGraphic" in2="smooth" scale="24" xChannelSelector="R" yChannelSelector="G" /></filter></defs></svg>`

const LAYERS = `<span class="pill__lens" aria-hidden="true"></span><span class="pill__fringe pill__fringe--r" aria-hidden="true"></span><span class="pill__fringe pill__fringe--b" aria-hidden="true"></span><span class="pill__mist" aria-hidden="true"></span><span class="pill__iris" aria-hidden="true"></span><span class="pill__sheen" aria-hidden="true"></span><span class="pill__rim" aria-hidden="true"></span>`

export type GlassPillButtonHtmlOpts = {
  type?: string
  className?: string
  id?: string
  name?: string
  value?: string
  disabled?: boolean
  ariaLabel?: string
  extraAttrs?: string
  html?: string
  text?: string
  label?: string
}

export const glassPillButtonHtml = ({
  type = 'button',
  className = '',
  id = '',
  name = '',
  value = '',
  disabled = false,
  ariaLabel = '',
  extraAttrs = '',
  html,
  text,
  label,
}: GlassPillButtonHtmlOpts) => {
  const cls = `pill${className ? ` ${className}` : ''}`
  const idAttr = id ? ` id="${esc(id)}"` : ''
  const nameAttr = name ? ` name="${esc(name)}"` : ''
  const valueAttr = value !== '' && value != null ? ` value="${esc(String(value))}"` : ''
  const dis = disabled ? ' disabled' : ''
  const aria = ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : ''
  const inner = html != null && html !== '' ? esc(html) : esc(text ?? label ?? '')
  return `<button type="${esc(type)}" class="${cls}"${idAttr}${nameAttr}${valueAttr}${dis}${aria}${extraAttrs}>${LAYERS}<span class="pill__body">${inner}</span></button>`
}

export type GlassPillAnchorHtmlOpts = {
  href: string
  className?: string
  id?: string
  ariaLabel?: string
  extraAttrs?: string
  html?: string
  text?: string
  label?: string
}

export const glassPillAnchorHtml = ({
  href,
  className = '',
  id = '',
  ariaLabel = '',
  extraAttrs = '',
  html,
  text,
  label,
}: GlassPillAnchorHtmlOpts) => {
  const cls = `pill${className ? ` ${className}` : ''}`
  const idAttr = id ? ` id="${esc(id)}"` : ''
  const aria = ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : ''
  const inner = html != null && html !== '' ? esc(html) : esc(text ?? label ?? '')
  return `<a href="${esc(href)}" class="${cls}"${idAttr}${aria}${extraAttrs}>${LAYERS}<span class="pill__body">${inner}</span></a>`
}
