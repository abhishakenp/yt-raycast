import * as React from 'react'
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
import { useNavigate } from '#/lib/use-navigate.tsx'
import type { KitAction } from './types.ts'
import { kitActionClasses } from './types.ts'

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
    const go = useNavigate()
    const [open, setOpen] = React.useState(false)
    const targetHome = homeTarget ?? homeLabel
    const normalizedHomeLabel = homeLabel.trim().toLowerCase()
    const links = nav.filter((item) => {
      const navLabel = item.trim()
      return navLabel && navLabel.toLowerCase() !== normalizedHomeLabel
    })
    const close = () => setOpen(false)
    const footerContent = typeof footer === 'function' ? footer(close) : footer

    const navigate = (target: string) => {
      close()
      go(target)
    }

    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
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
        </SheetTrigger>
        <SheetContent
          side={side}
          data-slot="mobile-nav-drawer-content"
          className="w-[min(100%,22rem)] border-border bg-background p-0 text-foreground sm:max-w-[22rem]"
        >
          <SheetHeader
            data-slot="mobile-nav-drawer-header"
            className="border-b border-border px-5 py-4 text-left"
          >
            <SheetTitle className="text-base font-semibold">{brand}</SheetTitle>
            <SheetDescription className="sr-only">
              Navigate site sections.
            </SheetDescription>
          </SheetHeader>
          <div
            data-slot="mobile-nav-drawer-nav"
            className="flex flex-col gap-1 px-3 py-4"
          >
            <button
              type="button"
              onClick={() => navigate(targetHome)}
              className="rounded-lg px-3 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {homeLabel}
            </button>
            {links.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => navigate(item)}
                className="rounded-lg px-3 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item}
              </button>
            ))}
            {cta ? (
              <button
                type="button"
                onClick={() => navigate(cta.target ?? cta.label)}
                className={cn(kitActionClasses(cta.variant), 'mt-2 min-h-11')}
              >
                {cta.label}
              </button>
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
