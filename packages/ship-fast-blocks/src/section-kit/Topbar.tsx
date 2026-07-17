import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const topbarVariants = cva(
  'z-10 flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6',
  {
    variants: {
      sticky: {
        true: 'sticky top-0',
        false: '',
      },
    },
    defaultVariants: {
      sticky: false,
    },
  },
)

export interface TopbarProps
  extends
    React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof topbarVariants> {
  asChild?: boolean
}

const Topbar = React.forwardRef<HTMLElement, TopbarProps>(
  ({ className, sticky, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'header'
    return (
      <Comp
        ref={ref}
        data-slot="topbar"
        className={cn(topbarVariants({ sticky }), className)}
        {...props}
      />
    )
  },
)
Topbar.displayName = 'Topbar'

const TopbarSection = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="topbar-section"
    className={cn('flex items-center gap-2 sm:gap-4', className)}
    {...props}
  />
))
TopbarSection.displayName = 'TopbarSection'

const TopbarDivider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="topbar-divider"
    className={cn('hidden h-6 w-px bg-border sm:block', className)}
    {...props}
  />
))
TopbarDivider.displayName = 'TopbarDivider'

const TopbarIconButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    data-slot="topbar-icon-button"
    className={cn(
      'relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
      className,
    )}
    {...props}
  />
))
TopbarIconButton.displayName = 'TopbarIconButton'

export {
  Topbar,
  TopbarSection,
  TopbarDivider,
  TopbarIconButton,
  topbarVariants,
}
