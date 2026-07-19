import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

/**
 * AboutSection — semantic compound for "about us" / "our story" / bio bands.
 *
 * About capsules share the same split-layout structure as the generic
 * `SplitStory` (media on one side, heading + prose on the other) but carry
 * different intent: about sections introduce a person, team, or company,
 * whereas story sections narrate a narrative arc. This component gives that
 * intent a dedicated name and `about-*` data-slots so styling and tests can
 * target about sections specifically without overloading the `story-*`
 * slots.
 *
 * Compound components: AboutSection, AboutGrid, AboutMedia, AboutContent,
 * AboutBody, AboutFooter — all forwardRef + displayName + asChild via
 * Radix Slot. Compose with `SectionHeading` or `Eyebrow` inside
 * `AboutContent` for the heading area.
 */

const aboutSectionVariants = cva('', {
  variants: {
    variant: {
      default: '',
      muted: 'bg-muted',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const AboutSection = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'> &
    VariantProps<typeof aboutSectionVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'section'
  return (
    <Comp
      data-slot="about-section"
      className={cn(aboutSectionVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
})
AboutSection.displayName = 'AboutSection'

const AboutGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="about-grid"
      className={cn(
        'grid items-center gap-12 lg:grid-cols-2 lg:gap-20',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
AboutGrid.displayName = 'AboutGrid'

const AboutMedia = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="about-media"
      className={cn('grid grid-cols-2 gap-4', className)}
      ref={ref}
      {...props}
    />
  )
})
AboutMedia.displayName = 'AboutMedia'

const AboutContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="about-content"
      className={cn('space-y-6', className)}
      ref={ref}
      {...props}
    />
  )
})
AboutContent.displayName = 'AboutContent'

const AboutEyebrow = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      data-slot="about-eyebrow"
      className={cn(
        'text-sm font-medium uppercase tracking-wider text-primary',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
AboutEyebrow.displayName = 'AboutEyebrow'

const AboutHeading = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<'h2'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h2'
  return (
    <Comp
      data-slot="about-heading"
      className={cn(
        'font-serif text-3xl font-medium leading-tight text-foreground sm:text-4xl lg:text-5xl',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
AboutHeading.displayName = 'AboutHeading'

const AboutImageTile = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { offset?: boolean; asChild?: boolean }
>(({ className, offset = false, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="about-image-tile"
      className={cn(
        'aspect-[3/4] overflow-hidden rounded-xl',
        offset && 'mt-8',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
AboutImageTile.displayName = 'AboutImageTile'

const AboutBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="about-body"
      className={cn(
        'space-y-4 leading-relaxed text-muted-foreground',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
AboutBody.displayName = 'AboutBody'

const AboutFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="about-footer"
      className={cn('flex items-center gap-6 pt-4', className)}
      ref={ref}
      {...props}
    />
  )
})
AboutFooter.displayName = 'AboutFooter'

export {
  AboutSection,
  AboutGrid,
  AboutMedia,
  AboutContent,
  AboutEyebrow,
  AboutHeading,
  AboutImageTile,
  AboutBody,
  AboutFooter,
  aboutSectionVariants,
}
