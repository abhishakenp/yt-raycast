import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const LocationListVariants = cva('flex flex-col gap-4', {
 variants: {},
 defaultVariants: {},
})

const LocationList = React.forwardRef<
 HTMLUListElement,
 React.ComponentProps<'ul'> &
 VariantProps<typeof LocationListVariants> & { asChild?: boolean }>(({ className, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'ul'
 return (
 <Comp
 data-slot="location-list"
 data-d-role="list"className={cn(LocationListVariants({}), className)}
 ref={ref}
 {...props}
 />
 )
})
LocationList.displayName = 'LocationList'

const LocationItem = React.forwardRef<
 HTMLLIElement,
 React.ComponentProps<'li'> & { asChild?: boolean }>(({ className, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'li'
 return (
 <Comp
 data-slot="location-list-item"
 data-d-role="list"className={cn('flex flex-col', className)}
 ref={ref}
 {...props}
 />
 )
})
LocationItem.displayName = 'LocationItem'

const LocationCard = React.forwardRef<
 HTMLDivElement,
 React.ComponentProps<'div'> & { asChild?: boolean }>(({ className, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'div'
 return (
 <Comp
 data-slot="location-card"
 data-d-role="card"className={cn(
 ' bg-card p-6 text-card-foreground ',
 className,
 )}
 ref={ref}
 {...props}
 />
 )
})
LocationCard.displayName = 'LocationCard'

export { LocationList, LocationItem, LocationCard, LocationListVariants }
