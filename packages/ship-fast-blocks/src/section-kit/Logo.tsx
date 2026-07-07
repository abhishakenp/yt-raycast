import { createContext, useContext, useEffect, type ReactNode } from 'react'

import { cn } from '#/lib/utils.ts'

export type BrandLogoSelection = {
  name: string
  domain?: string | null
  brandId?: string | null
  icon?: string | null
  logo?: string | null
}

const BrandLogoContext = createContext<BrandLogoSelection | null>(null)

export const getBrandLogoImageSrc = (
  value: BrandLogoSelection | null | undefined,
): string | null => {
  const icon = typeof value?.icon === 'string' ? value.icon.trim() : ''
  if (icon) return icon
  const logo = typeof value?.logo === 'string' ? value.logo.trim() : ''
  return logo || null
}

const componentAttr = 'data-open' + 'ui-component'
const runtimeSelector = [
  `[${componentAttr}$="Navbar"]`,
  `[${componentAttr}$="Footer"]`,
  `[${componentAttr}$="Sidebar"]`,
].join(',')

const runtimeSlotAttr = 'data-brand-logo-runtime-slot'
const runtimeSlotSrcAttr = 'data-brand-logo-runtime-src'
const originalDisplayAttr = 'data-brand-logo-original-display'

const restoreRuntimeSlots = (root: ParentNode) => {
  root.querySelectorAll(`[${runtimeSlotAttr}="true"]`).forEach((slot) => {
    const patched = slot.nextElementSibling as HTMLElement | null
    if (patched?.hasAttribute(originalDisplayAttr)) {
      patched.style.display = patched.getAttribute(originalDisplayAttr) ?? ''
      patched.removeAttribute(originalDisplayAttr)
    }
    slot.remove()
  })
}

const isLikelyBrandMark = (element: Element): element is HTMLElement => {
  if (!(element instanceof HTMLElement || element instanceof SVGElement)) {
    return false
  }
  if (element.getAttribute(runtimeSlotAttr) === 'true') return false
  const tag = element.tagName.toLowerCase()
  return (
    tag === 'svg' ||
    element.getAttribute('aria-hidden') === 'true' ||
    Boolean(element.querySelector('svg'))
  )
}

const findLegacyBrandMark = (
  root: Element,
): HTMLElement | SVGElement | null => {
  const candidates = Array.from(
    root.querySelectorAll('button, a, [role="link"]'),
  )
  for (const candidate of candidates) {
    if (!candidate.textContent?.trim()) continue
    const mark = Array.from(candidate.children).find(isLikelyBrandMark)
    if (mark) return mark
  }
  return null
}

const readLogoSlotClasses = (mark: Element): string => {
  const classes = (mark.getAttribute('class') ?? '').split(/\s+/)
  const safeClasses = classes.filter((className) =>
    /^(size-|h-|w-|min-h-|min-w-|max-h-|max-w-|rounded)/.test(className),
  )
  return safeClasses.length > 0 ? safeClasses.join(' ') : 'size-8'
}

const applyRuntimeLogo = (
  root: ParentNode,
  logo: BrandLogoSelection | null,
) => {
  const src = getBrandLogoImageSrc(logo)
  if (!src) {
    restoreRuntimeSlots(root)
    return
  }

  root.querySelectorAll(runtimeSelector).forEach((componentRoot) => {
    if (componentRoot.querySelector('[data-brand-logo-selected="true"]')) {
      return
    }

    const existingSlot = componentRoot.querySelector(
      `[${runtimeSlotAttr}="true"]`,
    ) as HTMLElement | null
    if (existingSlot) {
      if (existingSlot.getAttribute(runtimeSlotSrcAttr) !== src) {
        const image = existingSlot.querySelector('img')
        if (image) image.src = src
        existingSlot.setAttribute(runtimeSlotSrcAttr, src)
      }
      return
    }

    const mark = findLegacyBrandMark(componentRoot)
    if (!mark || !mark.parentElement) return

    mark.setAttribute(originalDisplayAttr, mark.style.display)
    mark.style.display = 'none'

    const slot = document.createElement('span')
    slot.setAttribute(runtimeSlotAttr, 'true')
    slot.setAttribute(runtimeSlotSrcAttr, src)
    slot.setAttribute('aria-hidden', 'true')
    slot.className = cn(
      'inline-grid shrink-0 place-items-center overflow-hidden rounded-md bg-transparent',
      readLogoSlotClasses(mark),
    )

    const image = document.createElement('img')
    image.src = src
    image.alt = ''
    image.draggable = false
    image.style.display = 'block'
    image.style.width = '100%'
    image.style.height = '100%'
    image.style.objectFit = 'contain'

    slot.appendChild(image)
    mark.parentElement.insertBefore(slot, mark)
  })
}

export function BrandLogoProvider({
  value,
  children,
}: {
  value?: BrandLogoSelection | null
  children?: ReactNode
}) {
  useEffect(() => {
    if (typeof document === 'undefined') return
    applyRuntimeLogo(document, value ?? null)
    const observer = new MutationObserver(() => {
      applyRuntimeLogo(document, value ?? null)
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      restoreRuntimeSlots(document)
    }
  }, [value])

  return (
    <BrandLogoContext.Provider value={value ?? null}>
      {children}
    </BrandLogoContext.Provider>
  )
}

export const useBrandLogo = () => useContext(BrandLogoContext)

export function Logo({
  brand,
  fallback,
  className,
  imageClassName,
  labelClassName,
  showLabel = true,
}: {
  brand: string
  fallback?: ReactNode
  className?: string
  imageClassName?: string
  labelClassName?: string
  showLabel?: boolean
}) {
  const selectedLogo = useBrandLogo()
  const src = getBrandLogoImageSrc(selectedLogo)

  return (
    <>
      {src ? (
        <span
          aria-hidden="true"
          className={cn(
            'inline-grid size-8 shrink-0 place-items-center overflow-hidden rounded-md bg-transparent',
            className,
          )}
          data-brand-logo-selected="true"
        >
          <img
            alt=""
            className={cn('block size-full object-contain', imageClassName)}
            draggable={false}
            src={src}
          />
        </span>
      ) : (
        fallback
      )}
      {showLabel ? <span className={labelClassName}>{brand}</span> : null}
    </>
  )
}
