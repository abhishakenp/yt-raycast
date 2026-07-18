import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/* ---------- OverviewSection ---------- */

const OverviewSection = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'>
>(({ className, ...props }, ref) => (
  <section
    ref={ref}
    data-slot="overview-section"
    className={cn(
      'overflow-hidden bg-background py-20 text-foreground sm:py-24',
      className,
    )}
    {...props}
  />
))
OverviewSection.displayName = 'OverviewSection'

/* ---------- OverviewGrid ---------- */

const OverviewGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="overview-grid"
    className={cn(
      'mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8',
      className,
    )}
    {...props}
  />
))
OverviewGrid.displayName = 'OverviewGrid'

/* ---------- OverviewContent ---------- */

const OverviewContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="overview-content"
    className={cn('flex flex-col', className)}
    {...props}
  />
))
OverviewContent.displayName = 'OverviewContent'

/* ---------- OverviewEyebrow ---------- */

const OverviewEyebrow = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="overview-eyebrow"
    className={cn(
      'mb-6 inline-flex rounded-full border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground',
      className,
    )}
    {...props}
  />
))
OverviewEyebrow.displayName = 'OverviewEyebrow'

/* ---------- OverviewBrand ---------- */

const OverviewBrand = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="overview-brand"
    className={cn(
      'mb-4 text-sm font-semibold uppercase tracking-wider text-primary',
      className,
    )}
    {...props}
  />
))
OverviewBrand.displayName = 'OverviewBrand'

/* ---------- OverviewHeading ---------- */

const OverviewHeading = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<'h2'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h2'
  return (
    <Comp
      ref={ref}
      data-slot="overview-heading"
      className={cn(
        'max-w-3xl text-4xl font-bold leading-tight text-foreground sm:text-5xl',
        className,
      )}
      {...props}
    />
  )
})
OverviewHeading.displayName = 'OverviewHeading'

/* ---------- OverviewSubheading ---------- */

const OverviewSubheading = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="overview-subheading"
    className={cn(
      'mt-6 max-w-2xl text-lg leading-8 text-muted-foreground',
      className,
    )}
    {...props}
  />
))
OverviewSubheading.displayName = 'OverviewSubheading'

/* ---------- OverviewFeatures ---------- */

const OverviewFeatures = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="overview-features"
    className={cn('mt-8 flex flex-wrap gap-3', className)}
    {...props}
  />
))
OverviewFeatures.displayName = 'OverviewFeatures'

/* ---------- OverviewFeature ---------- */

const OverviewFeature = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    data-slot="overview-feature"
    className={cn(
      'rounded-full border border-border bg-card px-4 py-2 text-sm text-card-foreground',
      className,
    )}
    {...props}
  />
))
OverviewFeature.displayName = 'OverviewFeature'

/* ---------- OverviewCta ---------- */

const OverviewCta = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="overview-cta"
    className={cn('mt-10 flex flex-col gap-3 sm:flex-row', className)}
    {...props}
  />
))
OverviewCta.displayName = 'OverviewCta'

/* ---------- OverviewStats ---------- */

const OverviewStats = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="overview-stats"
    className={cn(
      'mt-12 grid grid-cols-3 gap-4 border-t border-border pt-8',
      className,
    )}
    {...props}
  />
))
OverviewStats.displayName = 'OverviewStats'

/* ---------- OverviewStat ---------- */

const OverviewStat = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="overview-stat"
    className={cn('flex flex-col', className)}
    {...props}
  />
))
OverviewStat.displayName = 'OverviewStat'

/* ---------- OverviewStatValue ---------- */

const OverviewStatValue = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="overview-stat-value"
    className={cn('text-2xl font-bold text-foreground', className)}
    {...props}
  />
))
OverviewStatValue.displayName = 'OverviewStatValue'

/* ---------- OverviewStatLabel ---------- */

const OverviewStatLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="overview-stat-label"
    className={cn('mt-1 text-sm text-muted-foreground', className)}
    {...props}
  />
))
OverviewStatLabel.displayName = 'OverviewStatLabel'

/* ---------- OverviewMediaPanel ---------- */

interface OverviewMediaPanelProps extends React.ComponentProps<'div'> {
  /** Alt text for the image */
  alt: string
  /** Brand caption shown in the card footer */
  brand?: string
  /** Caption paragraph shown under the brand */
  caption?: string
  /** Image width hint */
  w?: number
  /** Image height hint */
  h?: number
}

const OverviewMediaPanel = React.forwardRef<
  HTMLDivElement,
  OverviewMediaPanelProps
>(({ className, alt, brand, caption, w = 900, h = 700, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="overview-image-panel"
    className={cn('relative', className)}
    {...props}
  >
    <div
      className="absolute inset-6 rounded-3xl bg-primary/10 blur-3xl"
      aria-hidden="true"
    />
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_80px_rgba(0,0,0,0.12)]">
      <Image
        alt={alt}
        w={w}
        h={h}
        className="aspect-[4/3] w-full object-cover"
      />
      {brand ? (
        <div className="border-t border-border bg-card/95 p-6">
          <p className="text-sm font-semibold text-card-foreground">{brand}</p>
          {caption ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {caption}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  </div>
))
OverviewMediaPanel.displayName = 'OverviewMediaPanel'

/* ---------- Exports ---------- */

export {
  OverviewSection,
  OverviewGrid,
  OverviewContent,
  OverviewEyebrow,
  OverviewBrand,
  OverviewHeading,
  OverviewSubheading,
  OverviewFeatures,
  OverviewFeature,
  OverviewCta,
  OverviewStats,
  OverviewStat,
  OverviewStatValue,
  OverviewStatLabel,
  OverviewMediaPanel,
}
