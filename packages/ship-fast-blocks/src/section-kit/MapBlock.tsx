import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'

/**
 * MapBlock — map-overlay and map-pin primitives for location/map sections.
 *
 * `LocationBlock` + `LocationMap` (from `LocationBlock.tsx`) cover the
 * card shell and the map container. `MapOverlay` and `MapPin` extract the
 * two patterns that every map capsule otherwise inlines on top of
 * `LocationMap`: the gradient scrim over the cover image, and the floating
 * map-pin glyph anchored to the bottom-left of the map.
 *
 * Compose them inside `<LocationMap>`:
 *
 * ```tsx
 * <LocationMap>
 *   <Image alt={alt} className="absolute inset-0 size-full object-cover" />
 *   <MapOverlay />
 *   <MapPin />
 * </LocationMap>
 * ```
 */

/**
 * MapOverlay — gradient scrim layered over a map cover image.
 *
 * Default gradient runs from `background/70` (bottom-left) through
 * transparent to `primary/10` (top-right). Pass `className` to override
 * the gradient for per-capsule tinting.
 */
const MapOverlay = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      aria-hidden="true"
      data-slot="map-overlay"
      className={cn(
        'pointer-events-none absolute inset-0 bg-gradient-to-tr from-background/70 via-transparent to-primary/10',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
MapOverlay.displayName = 'MapOverlay'

/**
 * MapPin — floating map-pin glyph anchored to the bottom-left of a map.
 *
 * Renders a circular primary-tinted badge containing a location-pin SVG.
 * Override the SVG via `children`; override position/size/tint via
 * `className`.
 */
const MapPin = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & {
    size?: number
    asChild?: boolean
  }
>(({ className, size = 18, children, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      aria-hidden="true"
      data-slot="map-pin"
      className={cn(
        'absolute bottom-4 left-4 grid size-10 place-items-center rounded-full d-radius-lock bg-primary text-primary-foreground shadow-[0_8px_24px_rgba(0,0,0,0.5)]',
        className,
      )}
      ref={ref}
      {...props}
    >
      {children ?? (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )}
    </Comp>
  )
})
MapPin.displayName = 'MapPin'

export { MapOverlay, MapPin }
