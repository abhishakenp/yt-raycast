import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'

const StarRating = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    asChild?: boolean
    rating?: number
    max?: number
    size?: 'sm' | 'md'
  }
>(
  (
    { className, asChild = false, rating = 5, max = 5, size = 'md', ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'div'
    const filledCount = Math.round(rating)
    const starSize = size === 'sm' ? 'size-4' : 'size-5'

    return (
      <Comp
        ref={ref}
        data-slot="star-rating"
        className={cn('inline-flex items-center gap-0.5', className)}
        aria-label={`${rating} out of ${max} stars`}
        {...props}
      >
        {Array.from({ length: max }).map((_, i) => (
          <svg
            key={i}
            aria-hidden
            viewBox="0 0 24 24"
            className={cn(
              starSize,
              i < filledCount
                ? 'text-accent fill-current'
                : 'text-muted-foreground fill-none stroke-current',
            )}
          >
            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        ))}
      </Comp>
    )
  },
)
StarRating.displayName = 'StarRating'

export { StarRating }
