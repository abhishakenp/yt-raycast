import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

/**
 * ContentCard — card wrapper for image + text-below gallery cards. The
 * `variant` CVA bundles the complete card chrome (border, background,
 * rounded, shadow, hover) into curated presets. Use `asChild` to render
 * as a <button> for clickable cards. The card always carries `group` so
 * hover-zoom on an inner <Image> can use `group-hover:scale-105`.
 *
 * Internal structure (image wrapper, text padding, caption alignment) is
 * composed by the capsule via children — ContentCard only owns the chrome.
 */
const contentCardVariants = cva('group', {
  variants: {
    variant: {
      'bordered-light':
        'block overflow-hidden border border-border bg-card transition-shadow hover:',
      'bordered-shadowed': 'overflow-hidden border border-border ',
      'figure-dark':
        'block w-full overflow-hidden border border-border bg-foreground ',
      plain: 'block',
      'gradient-tinted': 'relative overflow-hidden bg-background/10',
    },
  },
  defaultVariants: {
    variant: 'bordered-light',
  },
})

export interface ContentCardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof contentCardVariants> {
  asChild?: boolean
}

const ContentCard = React.forwardRef<HTMLDivElement, ContentCardProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp
        ref={ref}
        data-slot="content-card"
        data-d-role="card"
        className={cn(contentCardVariants({ variant }), className)}
        {...props}
      />
    )
  },
)
ContentCard.displayName = 'ContentCard'

export { ContentCard, contentCardVariants }
