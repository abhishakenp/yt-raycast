import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const newsletterCtaVariants = cva('', {
  variants: {
    variant: {
      default: '',
      'primary-tint': 'bg-primary/10',
      muted: 'bg-muted',
      inverted: 'bg-foreground text-background',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const NewsletterCta = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'> &
    VariantProps<typeof newsletterCtaVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'section'
  return (
    <Comp
      data-slot="newsletter-cta"
      data-d-role="btn"className={cn(newsletterCtaVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
})
NewsletterCta.displayName = 'NewsletterCta'

const NewsletterCtaHeading = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<'h2'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h2'
  return (
    <Comp
      data-slot="newsletter-cta-heading"
      data-d-role="btn"className={cn('mb-4 text-3xl font-semibold text-foreground', className)}
      ref={ref}
      {...props}
    />
  )
})
NewsletterCtaHeading.displayName = 'NewsletterCtaHeading'

const NewsletterCtaDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      data-slot="newsletter-cta-description"
      data-d-role="btn"className={cn('mx-auto mb-8 max-w-xl text-muted-foreground', className)}
      ref={ref}
      {...props}
    />
  )
})
NewsletterCtaDescription.displayName = 'NewsletterCtaDescription'

const NewsletterCtaFineprint = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      data-slot="newsletter-cta-fineprint"
      data-d-role="btn"className={cn('mt-4 text-xs text-muted-foreground', className)}
      ref={ref}
      {...props}
    />
  )
})
NewsletterCtaFineprint.displayName = 'NewsletterCtaFineprint'

export {
  NewsletterCta,
  NewsletterCtaHeading,
  NewsletterCtaDescription,
  NewsletterCtaFineprint,
  newsletterCtaVariants,
}
