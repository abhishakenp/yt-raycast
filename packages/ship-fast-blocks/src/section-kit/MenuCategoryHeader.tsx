import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'

const MenuCategoryHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="menu-category-header"
      className={cn('mb-8 flex items-center gap-4', className)}
      {...props}
    />
  )
})
MenuCategoryHeader.displayName = 'MenuCategoryHeader'

const MenuCategoryIcon = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="menu-category-icon"
      className={cn(
        'grid size-12 place-items-center rounded-full d-radius-lock bg-primary/10 text-primary',
        className,
      )}
      {...props}
    />
  )
})
MenuCategoryIcon.displayName = 'MenuCategoryIcon'

const MenuCategoryTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<'h3'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h3'
  return (
    <Comp
      ref={ref}
      data-slot="menu-category-title"
      className={cn(
        'font-serif text-2xl font-medium text-foreground',
        className,
      )}
      {...props}
    />
  )
})
MenuCategoryTitle.displayName = 'MenuCategoryTitle'

const MenuCategoryDivider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="menu-category-divider"
      className={cn('h-px flex-1 bg-border', className)}
      {...props}
    />
  )
})
MenuCategoryDivider.displayName = 'MenuCategoryDivider'

export {
  MenuCategoryHeader,
  MenuCategoryIcon,
  MenuCategoryTitle,
  MenuCategoryDivider,
}
