import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'

import { SectionHeading } from './SectionHeading.tsx'

const featureGridVariants = cva('grid gap-6 grid-cols-1', {
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

const FeatureGrid = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'> &
    VariantProps<typeof featureGridVariants> & {
      heading?: string
      subheading?: string
      asChild?: boolean
    }
>(
  (
    {
      className,
      columns,
      heading,
      subheading,
      children,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'section'
    return (
      <Comp
        ref={ref}
        data-slot="feature-grid"
        data-d-role="grid"
        className={cn('flex flex-col gap-10', className)}
        {...props}
      >
        {heading ? (
          <SectionHeading title={heading} subtitle={subheading} />
        ) : null}
        <div className={cn(featureGridVariants({ columns }))}>{children}</div>
      </Comp>
    )
  },
)
FeatureGrid.displayName = 'FeatureGrid'

const FeatureCard = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="feature-card"
      data-d-role="card"
      className={cn(
        'flex flex-col gap-3 border border-border bg-card p-6 transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-foreground/25 motion-reduce:transform-none',
        className,
      )}
      {...props}
    />
  )
})
FeatureCard.displayName = 'FeatureCard'

const FeatureIcon = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="feature-icon"
      className={cn(
        'inline-flex size-11 items-center justify-center bg-primary/10 text-primary',
        className,
      )}
      {...props}
    />
  )
})
FeatureIcon.displayName = 'FeatureIcon'

const FeatureTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<'h3'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h3'
  return (
    <Comp
      ref={ref}
      data-slot="feature-title"
      data-d-role="heading"
      className={cn('text-lg font-semibold text-foreground', className)}
      {...props}
    />
  )
})
FeatureTitle.displayName = 'FeatureTitle'

const FeatureDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      ref={ref}
      data-slot="feature-description"
      data-d-role="body"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
})
FeatureDescription.displayName = 'FeatureDescription'

export {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
  featureGridVariants,
}
