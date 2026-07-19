import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
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

export function getBrandLogoImageSrc(
  value: BrandLogoSelection | null | undefined,
): string | null {
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

function restoreRuntimeSlots(root: ParentNode) {
  root.querySelectorAll(`[${runtimeSlotAttr}="true"]`).forEach((slot) => {
    const patched = slot.nextElementSibling
    if (
      patched instanceof HTMLElement &&
      patched.hasAttribute(originalDisplayAttr)
    ) {
      patched.style.display = patched.getAttribute(originalDisplayAttr) ?? ''
      patched.removeAttribute(originalDisplayAttr)
    }
    slot.remove()
  })
}

function isLikelyBrandMark(element: Element): element is HTMLElement {
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

function findLegacyBrandMark(root: Element): HTMLElement | SVGElement | null {
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

function readLogoSlotClasses(mark: Element): string {
  const classes = (mark.getAttribute('class') ?? '').split(/\s+/)
  const safeClasses = classes.filter((className) =>
    /^(size-|h-|w-|min-h-|min-w-|max-h-|max-w-|rounded)/.test(className),
  )
  return safeClasses.length > 0 ? safeClasses.join(' ') : 'size-8'
}

function applyRuntimeLogo(root: ParentNode, logo: BrandLogoSelection | null) {
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
    )
    if (existingSlot instanceof HTMLElement) {
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

/* --- Compound Logo API --- */

const LogoContext = createContext<{
  brand: string
  src: string | null
} | null>(null)

const Logo = React.forwardRef<
  HTMLSpanElement,
  Omit<React.ComponentProps<'span'>, 'children'> & {
    brand: string
    children?: React.ReactNode
    asChild?: boolean
  }
>(({ brand, children, asChild = false, className, ...props }, ref) => {
  const selectedLogo = useBrandLogo()
  const src = getBrandLogoImageSrc(selectedLogo)
  const ctx = React.useMemo(() => ({ brand, src }), [brand, src])
  const Comp = asChild ? Slot : 'span'
  return (
    <LogoContext.Provider value={ctx}>
      <Comp
        ref={ref}
        data-slot="logo"
        className={cn('inline-flex items-center gap-2', className)}
        {...props}
      >
        {children ?? (
          <>
            <LogoImage />
            <LogoLabel />
          </>
        )}
      </Comp>
    </LogoContext.Provider>
  )
})
Logo.displayName = 'Logo'

const LogoImage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & {
    asChild?: boolean
    fallback?: React.ReactNode
  }
>(({ className, asChild = false, fallback = null, ...props }, ref) => {
  const ctx = useContext(LogoContext)
  const Comp = asChild ? Slot : 'span'
  if (!ctx?.src) return <>{fallback}</>
  return (
    <Comp
      ref={ref}
      data-slot="logo-image"
      aria-hidden="true"
      className={cn(
        'inline-grid size-8 shrink-0 place-items-center overflow-hidden rounded-md bg-transparent',
        className,
      )}
      data-brand-logo-selected="true"
      {...props}
    >
      <img
        alt=""
        className="block size-full object-contain"
        draggable={false}
        src={ctx.src}
      />
    </Comp>
  )
})
LogoImage.displayName = 'LogoImage'

const LogoLabel = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const ctx = useContext(LogoContext)
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp ref={ref} data-slot="logo-label" className={className} {...props}>
      {ctx?.brand}
    </Comp>
  )
})
LogoLabel.displayName = 'LogoLabel'

export { Logo, LogoImage, LogoLabel }
