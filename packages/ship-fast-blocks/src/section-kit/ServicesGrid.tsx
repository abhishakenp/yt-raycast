import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'

import { SectionHeading } from './SectionHeading.tsx'

/**
 * ServicesGrid — semantic compound for"what we do" / services grids.
 *
 * Services capsules share the same card-grid structure as Features capsules
 * (icon + title + description in a responsive grid) but carry different
 * intent: services present a provider's offerings (brand strategy, dental
 * care, logistics, …) whereas features present a product's capabilities.
 * This component gives that intent a dedicated name and `services-*`
 * data-slots so styling and tests can target service sections specifically
 * without overloading the `feature-*` slots.
 *
 * Same shape as `FeatureGrid`: optional `heading` / `subheading` render a
 * `SectionHeading` above the grid; `columns` controls the responsive
 * column count. Compose `ServiceCard`, `ServiceIcon`, `ServiceTitle`,
 * `ServiceDescription` inside.
 */

const servicesGridVariants = cva('grid gap-6 grid-cols-1', {
  variants: {
    columns: {
      2: 'md:grid-cols-2',
      3: 'md:grid-cols-3',
      4: 'md:grid-cols-2 lg:grid-cols-4',
    },
  },
  defaultVariants: {
    columns: 3,
  },
})

const ServicesGrid = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'> &
    VariantProps<typeof servicesGridVariants> & {
      heading?: string
      subheading?: string
    }
>(({ className, columns, heading, subheading, children, ...props }, ref) => {
  return (
    <section
      ref={ref}
      data-slot="services-grid"
      data-d-role="grid"
      className={cn('flex flex-col gap-10', className)}
      {...props}
    >
      {heading ? (
        <SectionHeading title={heading} subtitle={subheading} />
      ) : null}
      <div className={cn(servicesGridVariants({ columns }))}>{children}</div>
    </section>
  )
})
ServicesGrid.displayName = 'ServicesGrid'

const ServiceCard = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="service-card"
      data-d-role="card"
      className={cn(
        'flex flex-col gap-3 border border-border bg-card p-6',
        className,
      )}
      {...props}
    />
  )
})
ServiceCard.displayName = 'ServiceCard'

const ServiceIcon = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="service-icon"
      className={cn(
        'inline-flex size-11 items-center justify-center bg-primary/10 text-primary',
        className,
      )}
      {...props}
    />
  )
})
ServiceIcon.displayName = 'ServiceIcon'

const ServiceTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<'h3'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h3'
  return (
    <Comp
      ref={ref}
      data-slot="service-title"
      data-d-role="heading"
      className={cn('text-lg font-semibold text-foreground', className)}
      {...props}
    />
  )
})
ServiceTitle.displayName = 'ServiceTitle'

const ServiceDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      ref={ref}
      data-slot="service-description"
      data-d-role="body"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
})
ServiceDescription.displayName = 'ServiceDescription'

export {
  ServicesGrid,
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
  servicesGridVariants,
}
