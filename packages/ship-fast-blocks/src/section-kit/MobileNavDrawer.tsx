import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { MenuIcon } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet.tsx'
import { cn } from '#/lib/utils.ts'
import type { KitAction } from './types.ts'
import { kitActionClasses } from './types.ts'
import {
  useIsActiveSectionKitNavHref,
  useSectionKitNavHref,
} from './nav-href.tsx'
import { RouterLink } from './RouterLink.tsx'

function MobileNavAnchor({
  ariaCurrent,
  children,
  className,
  onNavigate,
  target,
}: {
  ariaCurrent?: React.AriaAttributes['aria-current']
  children: React.ReactNode
  className?: string
  onNavigate: () => void
  target: string
}) {
  const href = useSectionKitNavHref(target)
  return (
    <RouterLink
      href={href ?? '#'}
      onClick={onNavigate}
      aria-current={ariaCurrent}
      className={className}
    >
      {children}
    </RouterLink>
  )
}

const MobileNavDrawer = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'content'> & {
    asChild?: boolean
    brand: string
    buttonClassName?: string
    children?: React.ReactNode
    cta?: KitAction
    footer?: React.ReactNode | ((close: () => void) => React.ReactNode)
    homeLabel?: string
    homeTarget?: string
    label?: string
    nav: string[]
    side?: 'left' | 'right'
  }
>(
  (
    {
      className,
      asChild = false,
      brand,
      buttonClassName,
      children,
      cta,
      footer,
      homeLabel = 'Home',
      homeTarget,
      label = 'Open menu',
      nav,
      side = 'right',
      ...props
    },
    ref,
  ) => {
    const isActiveNavHref = useIsActiveSectionKitNavHref()
    const [open, setOpen] = React.useState(false)
    const targetHome = homeTarget ?? homeLabel
    const normalizedHomeLabel = homeLabel.trim().toLowerCase()
    const links = nav.filter((item) => {
      const navLabel = item.trim()
      return navLabel && navLabel.toLowerCase() !== normalizedHomeLabel
    })
    const close = () => setOpen(false)
    const footerContent = typeof footer === 'function' ? footer(close) : footer

    const navigate = () => {
      close()
    }

    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {asChild ? (
            <Slot
              ref={ref}
              aria-label={label}
              data-slot="mobile-nav-drawer"
              className={cn(buttonClassName, className)}
              {...props}
            >
              {children ?? <MenuIcon className="size-5" aria-hidden="true" />}
            </Slot>
          ) : (
            <button
              ref={ref}
              type="button"
              aria-label={label}
              data-slot="mobile-nav-drawer"
              className={cn(buttonClassName, className)}
              {...props}
            >
              {children ?? <MenuIcon className="size-5" aria-hidden="true" />}
            </button>
          )}
        </SheetTrigger>
        <SheetContent
          side={side}
          data-slot="mobile-nav-drawer-content"
          className="w-[min(100%,22rem)] rounded-none border-border bg-background p-0 text-foreground shadow-none sm:max-w-[22rem]"
        >
          <SheetHeader
            data-slot="mobile-nav-drawer-header"
            className="gap-2 border-b border-border px-5 py-4 text-left"
          >
            <span
              aria-hidden="true"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-[11px]"
            >
              Menu
            </span>
            <SheetTitle className="text-base font-semibold">{brand}</SheetTitle>
            <SheetDescription className="sr-only">
              Navigate site sections.
            </SheetDescription>
          </SheetHeader>
          <div
            data-slot="mobile-nav-drawer-nav"
            className="flex flex-col gap-1 px-3 py-4"
          >
            <MobileNavAnchor
              target={targetHome}
              onNavigate={navigate}
              ariaCurrent={isActiveNavHref(targetHome) ? 'page' : undefined}
              className={cn(
                'rounded-none border-l-2 border-transparent px-3 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted active:translate-y-px',
                isActiveNavHref(targetHome) &&
                  'border-l-2 border-primary bg-muted',
              )}
            >
              {homeLabel}
            </MobileNavAnchor>
            {links.map((item) => {
              const isActive = isActiveNavHref(item)
              return (
                <MobileNavAnchor
                  key={item}
                  target={item}
                  onNavigate={navigate}
                  ariaCurrent={isActive ? 'page' : undefined}
                  className={cn(
                    'rounded-none border-l-2 border-transparent px-3 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:translate-y-px',
                    isActive &&
                      'border-l-2 border-primary bg-muted text-foreground',
                  )}
                >
                  {item}
                </MobileNavAnchor>
              )
            })}
            {cta ? (
              <MobileNavAnchor
                target={cta.target ?? cta.label}
                onNavigate={navigate}
                className={cn(
                  kitActionClasses(cta.variant),
                  'mt-2 min-h-11 rounded-none active:translate-y-px',
                )}
              >
                {cta.label}
              </MobileNavAnchor>
            ) : null}
            {footerContent ? <div className="mt-2">{footerContent}</div> : null}
          </div>
        </SheetContent>
      </Sheet>
    )
  },
)
MobileNavDrawer.displayName = 'MobileNavDrawer'

export { MobileNavDrawer }
