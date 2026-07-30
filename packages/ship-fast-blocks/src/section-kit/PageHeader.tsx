import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Slot } from '@radix-ui/react-slot'
import { cn } from '#/lib/utils.ts'

const pageHeaderVariants = cva('', {
 variants: {
 variant: {
 default: 'border-b border-border bg-background',
 muted: 'border-b border-border bg-muted/30',
 card: 'border border-border bg-card ',
 },
 },
 defaultVariants: {
 variant: 'default',
 },
})

const PageHeader = React.forwardRef<
 HTMLElement,
 React.ComponentProps<'header'> &
 VariantProps<typeof pageHeaderVariants> & { asChild?: boolean }>(({ className, variant, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'header'
 return (
 <Comp
 data-d-role="section"
 data-slot="page-header"
 className={cn(
 'flex flex-col gap-4',
 pageHeaderVariants({ variant }),
 className,
 )}
 ref={ref}
 {...props}
 />
 )
})
PageHeader.displayName = 'PageHeader'

const PageHeaderActions = React.forwardRef<
 HTMLDivElement,
 React.ComponentProps<'div'> & { asChild?: boolean }>(({ className, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'div'
 return (
 <Comp
 data-d-role="container"
 data-slot="page-header-actions"
 className={cn('flex items-center gap-3', className)}
 ref={ref}
 {...props}
 />
 )
})
PageHeaderActions.displayName = 'PageHeaderActions'

export { PageHeader, PageHeaderActions, pageHeaderVariants }
