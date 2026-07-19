import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const navSidebarVariants = cva('', {
  variants: {
    variant: {
      default: 'border-r border-border bg-background',
      muted: 'border-r border-border bg-muted/30',
      card: 'border border-border bg-card rounded-xl',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const NavSidebar = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'aside'> &
    VariantProps<typeof navSidebarVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'aside'
  return (
    <Comp
      data-slot="nav-sidebar"
      className={cn(
        'flex flex-col',
        navSidebarVariants({ variant }),
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
NavSidebar.displayName = 'NavSidebar'

const navSidebarSectionVariants = cva('p-4', {
  variants: {},
})

const NavSidebarSection = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="nav-sidebar-section"
      className={cn(
        'flex flex-col gap-1',
        navSidebarSectionVariants(),
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
NavSidebarSection.displayName = 'NavSidebarSection'

const navSidebarLinkVariants = cva('', {
  variants: {
    active: {
      true: 'bg-muted font-medium text-foreground',
      false: 'text-muted-foreground hover:bg-muted hover:text-foreground',
    },
  },
  defaultVariants: {
    active: false,
  },
})

const NavSidebarLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<'a'> & {
    active?: boolean
    asChild?: boolean
  }
>(({ className, active, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'a'
  return (
    <Comp
      data-slot="nav-sidebar-link"
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
        navSidebarLinkVariants({ active }),
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
NavSidebarLink.displayName = 'NavSidebarLink'

export {
  NavSidebar,
  NavSidebarSection,
  NavSidebarLink,
  navSidebarVariants,
  navSidebarSectionVariants,
  navSidebarLinkVariants,
}
