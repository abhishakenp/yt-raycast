import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

/**
 * ListingCard — article wrapper for real-estate / property listing cards.
 * The `variant` CVA bundles the card chrome (border, background, rounded,
 * selection ring) into curated presets. Use `asChild` to render as a
 * <button> for clickable cards. The card always carries `group` so
 * hover-zoom on the inner <Image> can use `group-hover:scale-105`.
 *
 * Internal structure (image area, spec row, address, action buttons) is
 * composed by the capsule via children — ListingCard only owns the chrome.
 */
const listingCardVariants = cva('group flex flex-col overflow-hidden', {
  variants: {
    variant: {
      'bordered-card': 'rounded-2xl border border-border bg-card',
      'selectable-card': 'rounded-2xl border bg-card',
    },
  },
  defaultVariants: {
    variant: 'bordered-card',
  },
})

export interface ListingCardProps
  extends
    React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof listingCardVariants> {
  asChild?: boolean
}

const ListingCard = React.forwardRef<HTMLElement, ListingCardProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'article'
    return (
      <Comp
        ref={ref as React.Ref<HTMLElement>}
        data-slot="listing-card"
        className={cn(listingCardVariants({ variant }), className)}
        {...props}
      />
    )
  },
)
ListingCard.displayName = 'ListingCard'

/**
 * ListingCardMedia — the image area at the top of a listing card. Owns
 * the 4:3 aspect + overflow-hidden so the inner <Image> can fill. Badge
 * and save-heart overlays compose as children.
 */
const ListingCardMedia = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="listing-card-media"
      className={cn('relative aspect-[4/3] overflow-hidden', className)}
      {...props}
    />
  )
})
ListingCardMedia.displayName = 'ListingCardMedia'

/**
 * ListingCardBadge — corner badge overlay on a listing card image.
 * Uses `variant` to switch between solid primary and glassy backdrop.
 */
const listingBadgeVariants = cva(
  'absolute left-3 top-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground',
        glass: 'bg-background/90 text-foreground backdrop-blur',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
)

export interface ListingCardBadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof listingBadgeVariants> {
  asChild?: boolean
}

const ListingCardBadge = React.forwardRef<
  HTMLSpanElement,
  ListingCardBadgeProps
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      ref={ref}
      data-slot="listing-card-badge"
      className={cn(listingBadgeVariants({ variant }), className)}
      {...props}
    />
  )
})
ListingCardBadge.displayName = 'ListingCardBadge'

/**
 * ListingCardSpecRow — the beds / baths / sqft spec row with hairline
 * separators between specs. Children should be <span> specs; separators
 * are injected automatically between children.
 */
const ListingCardSpecRow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    specs: React.ReactNode[]
    asChild?: boolean
  }
>(({ className, specs, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="listing-card-spec-row"
      className={cn(
        'mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground',
        className,
      )}
      {...props}
    >
      {specs.map((spec, i) => (
        <React.Fragment key={i}>
          {i > 0 ? (
            <span aria-hidden="true" className="h-3 w-px bg-border" />
          ) : null}
          <span>{spec}</span>
        </React.Fragment>
      ))}
    </Comp>
  )
})
ListingCardSpecRow.displayName = 'ListingCardSpecRow'

export {
  ListingCard,
  ListingCardMedia,
  ListingCardBadge,
  ListingCardSpecRow,
  listingCardVariants,
  listingBadgeVariants,
}
