import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'

const MenuItemRow = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="menu-item-row"
      className={className}
      {...props}
    />
  )
})
MenuItemRow.displayName = 'MenuItemRow'

const MenuItemContent = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentProps<'div'>, 'as'> & {
    asChild?: boolean
    as?: 'div' | 'button'
  }
>(({ className, asChild = false, as = 'div', ...props }, ref) => {
  const Comp: React.ElementType = asChild ? Slot : as
  return (
    <Comp
      ref={ref}
      data-slot="menu-item-content"
      className={cn(
        'group flex w-full items-start justify-between gap-4 text-left',
        as === 'button' && 'cursor-pointer',
        className,
      )}
      {...props}
    />
  )
})
MenuItemContent.displayName = 'MenuItemContent'

const MenuItemBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="menu-item-body"
      className={className}
      {...props}
    />
  )
})
MenuItemBody.displayName = 'MenuItemBody'

const MenuItemNameRow = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="menu-item-name-row"
      className={cn('flex flex-wrap items-center gap-2', className)}
      {...props}
    />
  )
})
MenuItemNameRow.displayName = 'MenuItemNameRow'

const MenuItemName = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & {
    asChild?: boolean
    onClick?: () => void
  }
>(({ className, asChild = false, onClick, children, ...props }, ref) => {
  if (onClick) {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        data-slot="menu-item-name"
        type="button"
        onClick={onClick}
        className={cn(
          'font-medium text-foreground transition-colors hover:text-primary',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      ref={ref}
      data-slot="menu-item-name"
      className={cn('font-medium', className)}
      {...props}
    >
      {children}
    </Comp>
  )
})
MenuItemName.displayName = 'MenuItemName'

const MenuItemTag = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      ref={ref}
      data-slot="menu-item-tag"
      className={cn(
        'rounded-full bg-primary/10 px-2 py-0.5 text-xs uppercase tracking-wide text-primary',
        className,
      )}
      {...props}
    />
  )
})
MenuItemTag.displayName = 'MenuItemTag'

const MenuItemRowDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      ref={ref}
      data-slot="menu-item-description"
      className={cn('mt-1 text-sm text-muted-foreground', className)}
      {...props}
    />
  )
})
MenuItemRowDescription.displayName = 'MenuItemRowDescription'

const MenuItemPriceColumn = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="menu-item-price-column"
      className={cn('flex shrink-0 flex-col items-end gap-2', className)}
      {...props}
    />
  )
})
MenuItemPriceColumn.displayName = 'MenuItemPriceColumn'

const MenuItemRowPrice = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      ref={ref}
      data-slot="menu-item-price"
      className={cn('font-serif text-lg text-foreground', className)}
      {...props}
    />
  )
})
MenuItemRowPrice.displayName = 'MenuItemRowPrice'

const MenuItemAction = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="menu-item-action"
      className={className}
      {...props}
    />
  )
})
MenuItemAction.displayName = 'MenuItemAction'

const MenuItemDivider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="menu-item-divider"
      className={cn('mt-6 h-px bg-border', className)}
      {...props}
    />
  )
})
MenuItemDivider.displayName = 'MenuItemDivider'

export {
  MenuItemRow,
  MenuItemContent,
  MenuItemBody,
  MenuItemNameRow,
  MenuItemName,
  MenuItemTag,
  MenuItemRowDescription,
  MenuItemPriceColumn,
  MenuItemRowPrice,
  MenuItemAction,
  MenuItemDivider,
}
