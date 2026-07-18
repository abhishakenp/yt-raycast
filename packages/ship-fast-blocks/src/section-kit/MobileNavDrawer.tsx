import { useState } from 'react'
import type { ReactNode } from 'react'
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

export function MobileNavDrawer({
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
}: {
  brand: string
  buttonClassName?: string
  children?: ReactNode
  cta?: KitAction
  footer?: ReactNode | ((close: () => void) => ReactNode)
  homeLabel?: string
  homeTarget?: string
  label?: string
  nav: string[]
  side?: 'left' | 'right'
}) {
  const go = useNavigate()
  const [open, setOpen] = useState(false)
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
        <button type="button" aria-label={label} className={buttonClassName}>
          {children ?? <MenuIcon className="size-5" aria-hidden="true" />}
        </button>
      </SheetTrigger>
      <SheetContent
        side={side}
        className="w-[min(100%,22rem)] border-border bg-background p-0 text-foreground sm:max-w-[22rem]"
      >
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle className="text-base font-semibold">{brand}</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate site sections.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-1 px-3 py-4">
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
}
