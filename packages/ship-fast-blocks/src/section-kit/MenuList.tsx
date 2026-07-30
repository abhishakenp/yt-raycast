import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const MenuListVariants = cva('flex flex-col', {
  variants: {},
  defaultVariants: {},
})

const MenuList = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="menu-list"
      data-d-role="list"className={cn('flex flex-col', className)}
      ref={ref}
      {...props}
    />
  )
})
MenuList.displayName = 'MenuList'

const MenuCategory = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="menu-category"
      className={cn('flex flex-col', className)}
      ref={ref}
      {...props}
    />
  )
})
MenuCategory.displayName = 'MenuCategory'

const MenuItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="menu-item"
      data-d-role="card"className={cn('flex w-full items-start justify-between gap-4', className)}
      ref={ref}
      {...props}
    />
  )
})
MenuItem.displayName = 'MenuItem'

const MenuItemDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      data-slot="menu-item-description"
      data-d-role="body"className={cn('text-sm text-muted-foreground', className)}
      ref={ref}
      {...props}
    />
  )
})
MenuItemDescription.displayName = 'MenuItemDescription'

const MenuItemPrice = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      data-slot="menu-item-price"
      className={cn('font-semibold text-foreground', className)}
      ref={ref}
      {...props}
    />
  )
})
MenuItemPrice.displayName = 'MenuItemPrice'

export {
  MenuList,
  MenuCategory,
  MenuItem,
  MenuItemDescription,
  MenuItemPrice,
  MenuListVariants as menuListVariants,
}
