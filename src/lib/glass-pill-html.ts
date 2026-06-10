const esc = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

export const GLASS_LENS_FILTER_ID = 'sf-glass-lens'

export const glassPillSvgDefs = () =>
  `<svg class="absolute -m-px size-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><filter id="${GLASS_LENS_FILTER_ID}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.0082 0.0058" numOctaves="3" seed="41" result="noise" /><feGaussianBlur in="noise" stdDeviation="2" result="smooth" /><feDisplacementMap in="SourceGraphic" in2="smooth" scale="24" xChannelSelector="R" yChannelSelector="G" /></filter></defs></svg>`

/** Decoration nodes inserted before `.pill__body` on liquid-glass controls. */
export const glassPillDecorationLayersHtml = `<span class="pointer-events-none absolute inset-0 z-0 rounded-[inherit] backdrop-blur-[32px] backdrop-saturate-[2.1] backdrop-brightness-[1.03] backdrop-contrast-[1.04] [filter:url(#${GLASS_LENS_FILTER_ID})]" aria-hidden="true"></span><span class="pointer-events-none absolute inset-0 z-[1] translate-x-px -translate-y-[0.4px] rounded-[inherit] bg-[rgba(255,210,198,0.07)] opacity-30 mix-blend-screen backdrop-blur-[28px] backdrop-saturate-[2.2] backdrop-contrast-[1.04]" aria-hidden="true"></span><span class="pointer-events-none absolute inset-0 z-[2] -translate-x-px translate-y-[0.4px] rounded-[inherit] bg-[rgba(175,205,228,0.07)] opacity-30 mix-blend-screen backdrop-blur-[28px] backdrop-saturate-[2.2] backdrop-contrast-[1.04]" aria-hidden="true"></span><span class="pointer-events-none absolute inset-0 z-[3] rounded-[inherit] bg-[linear-gradient(180deg,rgba(8,10,18,0.22)_0%,rgba(255,255,255,0.04)_48%,rgba(218,224,232,0.1)_100%),radial-gradient(ellipse_100%_70%_at_88%_12%,rgba(255,255,255,0.06)_0%,transparent_45%)] opacity-55" aria-hidden="true"></span><span class="pointer-events-none absolute inset-0 z-[4] rounded-[inherit] bg-[conic-gradient(from_200deg_at_35%_25%,rgba(235,238,242,0.07),rgba(210,216,224,0.08),rgba(225,228,234,0.07),rgba(205,212,222,0.08),rgba(235,238,242,0.07))] opacity-25 mix-blend-soft-light" aria-hidden="true"></span><span class="pointer-events-none absolute inset-0 z-[5] rounded-[inherit] bg-[linear-gradient(172deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0)_42%),linear-gradient(358deg,rgba(255,255,255,0)_54%,rgba(255,255,255,0.05)_100%)] opacity-55 mix-blend-soft-light" aria-hidden="true"></span><span class="pointer-events-none absolute inset-0 z-[6] rounded-[inherit] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),inset_0_0_0_1px_rgba(255,255,255,0.16),inset_0_-12px_28px_rgba(0,6,30,0.28)]" aria-hidden="true"></span>`

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
  const cls = `relative isolate inline-flex min-h-12 cursor-pointer items-center justify-center overflow-hidden rounded-full border-0 bg-transparent px-5 py-3 font-[inherit] font-semibold tracking-[-0.015em] text-inherit shadow-[0_14px_32px_rgba(0,0,0,0.38)] transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.25)] [-webkit-tap-highlight-color:transparent] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white${className ? ` ${className}` : ''}`
  const idAttr = id ? ` id="${esc(id)}"` : ''
  const nameAttr = name ? ` name="${esc(name)}"` : ''
  const valueAttr = value !== '' && value != null ? ` value="${esc(String(value))}"` : ''
  const dis = disabled ? ' disabled' : ''
  const aria = ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : ''
  const inner = html != null && html !== '' ? html : esc(text ?? label ?? '')
  return `<button type="${esc(type)}" class="${cls}"${idAttr}${nameAttr}${valueAttr}${dis}${aria}${extraAttrs}>${glassPillDecorationLayersHtml}<span class="relative z-[7] inline-flex items-center justify-center gap-2 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">${inner}</span></button>`
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
  const cls = `relative isolate inline-flex min-h-12 cursor-pointer items-center justify-center overflow-hidden rounded-full border-0 bg-transparent px-5 py-3 font-[inherit] font-semibold tracking-[-0.015em] text-inherit shadow-[0_14px_32px_rgba(0,0,0,0.38)] transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.25)] [-webkit-tap-highlight-color:transparent] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white${className ? ` ${className}` : ''}`
  const idAttr = id ? ` id="${esc(id)}"` : ''
  const aria = ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : ''
  const inner = html != null && html !== '' ? html : esc(text ?? label ?? '')
  return `<a href="${esc(href)}" class="${cls}"${idAttr}${aria}${extraAttrs}>${glassPillDecorationLayersHtml}<span class="relative z-[7] inline-flex items-center justify-center gap-2 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">${inner}</span></a>`
}
