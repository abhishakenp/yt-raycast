import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'

const LocationBlock = React.forwardRef<
 HTMLDivElement,
 React.ComponentProps<'div'> & { asChild?: boolean }>(({ className, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'div'
 return (
 <Comp
 data-d-role="card"
 data-slot="location-block"
 className={cn(
 ' border border-border bg-card overflow-hidden',
 className,
 )}
 ref={ref}
 {...props}
 />
 )
})
LocationBlock.displayName = 'LocationBlock'

const LocationMap = React.forwardRef<
 HTMLDivElement,
 React.ComponentProps<'div'> & { asChild?: boolean }>(({ className, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'div'
 return (
 <Comp
 data-d-role="container"
 data-slot="location-map"
 className={cn(
 'relative h-full min-h-[400px] overflow-hidden bg-muted',
 className,
 )}
 ref={ref}
 {...props}
 />
 )
})
LocationMap.displayName = 'LocationMap'

const LocationHours = React.forwardRef<
 HTMLDivElement,
 React.ComponentProps<'div'> & { asChild?: boolean }>(({ className, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'div'
 return (
 <Comp
 data-d-role="container"
 data-slot="location-hours"
 className={cn('', className)}
 ref={ref}
 {...props}
 />
 )
})
LocationHours.displayName = 'LocationHours'

const LocationContact = React.forwardRef<
 HTMLDivElement,
 React.ComponentProps<'div'> & { asChild?: boolean }>(({ className, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'div'
 return (
 <Comp
 data-d-role="container"
 data-slot="location-contact"
 className={cn('', className)}
 ref={ref}
 {...props}
 />
 )
})
LocationContact.displayName = 'LocationContact'

export { LocationBlock, LocationMap, LocationHours, LocationContact }
