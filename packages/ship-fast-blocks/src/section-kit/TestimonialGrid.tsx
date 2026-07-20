import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'

import { SectionHeading } from './SectionHeading.tsx'

const testimonialGridVariants = cva('grid gap-6 grid-cols-1', {
  variants: {
    columns: {
      2: 'md:grid-cols-2',
      3: 'md:grid-cols-2 lg:grid-cols-3',
    },
  },
  defaultVariants: {
    columns: 3,
  },
})

const TestimonialGrid = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'> &
    VariantProps<typeof testimonialGridVariants> & {
      eyebrow?: string
      heading?: string
      subheading?: string
      asChild?: boolean
    }
>(
  (
    {
      className,
      columns,
      eyebrow,
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
        data-slot="testimonial-grid"
        className={cn('flex flex-col gap-10', className)}
        {...props}
      >
        {heading ? (
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
          />
        ) : null}
        <div className={cn(testimonialGridVariants({ columns }))}>
          {children}
        </div>
      </Comp>
    )
  },
)
TestimonialGrid.displayName = 'TestimonialGrid'

const TestimonialCard = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'figure'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'figure'
  return (
    <Comp
      ref={ref}
      data-slot="testimonial-card"
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-[border-color] duration-150 hover:border-foreground/25',
        className,
      )}
      {...props}
    />
  )
})
TestimonialCard.displayName = 'TestimonialCard'

const TestimonialQuote = React.forwardRef<
  HTMLQuoteElement,
  React.ComponentProps<'blockquote'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'blockquote'
  return (
    <Comp
      ref={ref}
      data-slot="testimonial-quote"
      className={cn('text-base leading-relaxed text-foreground', className)}
      {...props}
    />
  )
})
TestimonialQuote.displayName = 'TestimonialQuote'

const TestimonialAuthor = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'figcaption'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'figcaption'
  return (
    <Comp
      ref={ref}
      data-slot="testimonial-author"
      className={cn('mt-auto flex items-center gap-3', className)}
      {...props}
    />
  )
})
TestimonialAuthor.displayName = 'TestimonialAuthor'

const TestimonialName = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      ref={ref}
      data-slot="testimonial-name"
      className={cn('text-sm font-semibold text-foreground', className)}
      {...props}
    />
  )
})
TestimonialName.displayName = 'TestimonialName'

const TestimonialMeta = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      ref={ref}
      data-slot="testimonial-meta"
      className={cn('text-xs text-muted-foreground', className)}
      {...props}
    />
  )
})
TestimonialMeta.displayName = 'TestimonialMeta'

export {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
  testimonialGridVariants,
}
