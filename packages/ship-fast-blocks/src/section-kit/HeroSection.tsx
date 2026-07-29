import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { useDesign } from '#/primitives/design-context.tsx'

/* ---------- HeroSection ---------- */

const heroSectionVariants = cva('', {
  variants: {
    variant: {
      default: '',
      'full-bleed': 'relative isolate overflow-hidden',
      gradient:
        'relative flex min-h-screen items-center justify-center overflow-hidden',
      split: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const HeroSection = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'> &
    VariantProps<typeof heroSectionVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'section'
  return (
    <Comp
      ref={ref}
      data-slot="hero-section"
      className={cn(heroSectionVariants({ variant }), className)}
      {...props}
    />
  )
})
HeroSection.displayName = 'HeroSection'

/* ---------- HeroBackgroundImage ---------- */

interface HeroBackgroundImageProps extends React.ComponentProps<'div'> {
  alt: string
  w?: number
  h?: number
  overlayClassName?: string
  gradientClassName?: string
}

function HeroBackgroundImage({
  alt,
  w = 1920,
  h = 1080,
  overlayClassName,
  gradientClassName,
}: HeroBackgroundImageProps) {
  return (
    <>
      <Image
        alt={alt}
        w={w}
        h={h}
        loading="lazy"
        className="absolute inset-0 -z-10 size-full object-cover"
      />
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 -z-10 bg-foreground/50',
          overlayClassName,
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 -z-10 bg-gradient-to-t from-foreground/60 via-foreground/20 to-foreground/40',
          gradientClassName,
        )}
      />
    </>
  )
}
HeroBackgroundImage.displayName = 'HeroBackgroundImage'

/* ---------- HeroContent ---------- */

const HeroContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="hero-content"
      className={cn('relative z-10', className)}
      {...props}
    />
  )
})
HeroContent.displayName = 'HeroContent'

/* ---------- HeroBadge ---------- */

const heroBadgeVariants = cva('', {
  variants: {
    variant: {
      default:
        'inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm',
      pill: 'inline-flex items-center rounded-full border border-background/30 bg-background/10 px-4 py-1.5 text-xs font-medium tracking-[0.2em] text-background uppercase backdrop-blur-sm',
      'pulsing-dot':
        'inline-flex items-center gap-2 rounded-full border border-border bg-accent/50 px-4 py-2 text-sm text-muted-foreground',
      solid:
        'inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const HeroBadge = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> &
    VariantProps<typeof heroBadgeVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      ref={ref}
      data-slot="hero-badge"
      className={cn(heroBadgeVariants({ variant }), className)}
      {...props}
    />
  )
})
HeroBadge.displayName = 'HeroBadge'

/* ---------- HeroHeading ---------- */

const heroHeadingVariants = cva('', {
  variants: {
    variant: {
      default:
        'text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl',
      serif:
        'mt-8 max-w-3xl font-serif text-4xl font-semibold leading-tight tracking-tight text-background sm:text-5xl lg:text-6xl',
      'extra-bold':
        'text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl',
      black:
        'mb-8 text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const HeroHeading = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<'h1'> &
    VariantProps<typeof heroHeadingVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h1'
  return (
    <Comp
      ref={ref}
      data-slot="hero-heading"
      className={cn(heroHeadingVariants({ variant }), className)}
      {...props}
    />
  )
})
HeroHeading.displayName = 'HeroHeading'

/* ---------- HeroHighlight ---------- */

const heroHighlightVariants = cva('', {
  variants: {
    variant: {
      primary: 'text-primary',
      gradient:
        'bg-gradient-to-br from-primary via-primary/80 to-accent bg-clip-text text-transparent',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
})

const HeroHighlight = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> &
    VariantProps<typeof heroHighlightVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      ref={ref}
      data-slot="hero-highlight"
      className={cn(heroHighlightVariants({ variant }), className)}
      {...props}
    />
  )
})
HeroHighlight.displayName = 'HeroHighlight'

/* ---------- HeroSubheading ---------- */

const heroSubheadingVariants = cva('', {
  variants: {
    variant: {
      default: 'mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground',
      light:
        'mt-6 max-w-2xl text-base leading-relaxed text-background/80 sm:text-lg',
      large:
        'mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const HeroSubheading = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> &
    VariantProps<typeof heroSubheadingVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      ref={ref}
      data-slot="hero-subheading"
      className={cn(heroSubheadingVariants({ variant }), className)}
      {...props}
    />
  )
})
HeroSubheading.displayName = 'HeroSubheading'

/* ---------- HeroCta ---------- */

const heroCtaVariants = cva(
  'inline-flex items-center justify-center px-5 py-3 text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        none: '',
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline:
          'border border-border bg-background text-foreground hover:bg-muted',
        ghost: 'text-foreground hover:bg-muted',
      },
    },
    defaultVariants: { variant: 'none' },
  },
)

const HeroCta = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<'a'> &
    VariantProps<typeof heroCtaVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const d = useDesign()
  const Comp = asChild ? Slot : 'a'
  return (
    <Comp
      ref={ref as never}
      data-slot="hero-cta"
      className={cn(heroCtaVariants({ variant }), d.radius.btn, d.shadow.btn, className)}
      {...props}
    />
  )
})
HeroCta.displayName = 'HeroCta'

/* ---------- HeroActions ---------- */

const HeroActions = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="hero-ctas"
      className={cn('mt-8 flex flex-wrap gap-3.5', className)}
      {...props}
    />
  )
})
HeroActions.displayName = 'HeroActions'

/* ---------- HeroMediaPanel ---------- */

interface HeroImageProps extends React.ComponentProps<'div'> {
  alt: string
  w?: number
  h?: number
}

const HeroMediaPanel = React.forwardRef<
  HTMLDivElement,
  HeroImageProps & { asChild?: boolean }
>(({ className, alt, w = 1200, h = 1200, asChild = false, ...props }, ref) => {
  const d = useDesign()
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="hero-image"
      className={cn('overflow-hidden', d.radius.container, className)}
      {...props}
    >
      <Image alt={alt} w={w} h={h} className="size-full object-cover" />
    </Comp>
  )
})
HeroMediaPanel.displayName = 'HeroMediaPanel'

/* ---------- HeroSocialProof ---------- */

const HeroSocialProof = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'ul'
  return (
    <Comp
      ref={ref}
      data-slot="hero-trust-row"
      className={cn(
        'mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
})
HeroSocialProof.displayName = 'HeroSocialProof'

/* ---------- HeroSocialProofItem ---------- */

const HeroSocialProofItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'li'
  return (
    <Comp
      ref={ref}
      data-slot="hero-trust-item"
      className={cn('flex items-center gap-2', className)}
      {...props}
    />
  )
})
HeroSocialProofItem.displayName = 'HeroSocialProofItem'

/* ---------- HeroStats ---------- */

const HeroStats = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="hero-stats"
      className={cn(
        'mt-24 grid grid-cols-2 gap-8 border-t border-border pt-10 md:grid-cols-4',
        className,
      )}
      {...props}
    />
  )
})
HeroStats.displayName = 'HeroStats'

/* ---------- HeroStat ---------- */

const HeroStat = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="hero-stat"
      className={cn('flex flex-col', className)}
      {...props}
    />
  )
})
HeroStat.displayName = 'HeroStat'

/* ---------- HeroStatValue ---------- */

const HeroStatValue = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="hero-stat-value"
      className={cn('text-3xl font-bold text-foreground', className)}
      {...props}
    />
  )
})
HeroStatValue.displayName = 'HeroStatValue'

/* ---------- HeroStatLabel ---------- */

const HeroStatLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="hero-stat-label"
      className={cn('mt-1 text-sm text-muted-foreground', className)}
      {...props}
    />
  )
})
HeroStatLabel.displayName = 'HeroStatLabel'

/* ---------- HeroCodeWindow ---------- */

const HeroCodeWindow = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="hero-code-window"
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card shadow-sm',
        className,
      )}
      {...props}
    />
  )
})
HeroCodeWindow.displayName = 'HeroCodeWindow'

const HeroCodeWindowHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="hero-code-window-header"
      className={cn(
        'flex items-center gap-2 border-b border-border bg-muted px-4 py-3',
        className,
      )}
      {...props}
    />
  )
})
HeroCodeWindowHeader.displayName = 'HeroCodeWindowHeader'

const HeroCodeWindowBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="hero-code-window-body"
      className={cn('space-y-2 p-5 font-mono text-sm', className)}
      {...props}
    />
  )
})
HeroCodeWindowBody.displayName = 'HeroCodeWindowBody'

/* ---------- HeroInfoStrip ---------- */

const HeroInfoStrip = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="hero-info-strip"
      className={cn(
        'mt-14 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-background/80',
        className,
      )}
      {...props}
    />
  )
})
HeroInfoStrip.displayName = 'HeroInfoStrip'

const HeroInfoStripItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="hero-info-strip-item"
      className={cn('flex items-center gap-x-4', className)}
      {...props}
    />
  )
})
HeroInfoStripItem.displayName = 'HeroInfoStripItem'

/* ---------- HeroStatBadge (floating stat badge on hero media) ---------- */

const HeroStatBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="hero-stat-badge"
      className={cn(
        'rounded-lg border bg-card p-4 text-card-foreground shadow-lg',
        className,
      )}
      {...props}
    />
  )
})
HeroStatBadge.displayName = 'HeroStatBadge'

const HeroStatBadgeIcon = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="hero-stat-badge-icon"
      className={cn(
        'grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-foreground',
        className,
      )}
      {...props}
    />
  )
})
HeroStatBadgeIcon.displayName = 'HeroStatBadgeIcon'

const HeroStatBadgeContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="hero-stat-badge-content"
      className={cn('min-w-0', className)}
      {...props}
    />
  )
})
HeroStatBadgeContent.displayName = 'HeroStatBadgeContent'

const HeroStatBadgeTitle = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      ref={ref}
      data-slot="hero-stat-badge-title"
      className={cn('text-sm font-medium text-card-foreground', className)}
      {...props}
    />
  )
})
HeroStatBadgeTitle.displayName = 'HeroStatBadgeTitle'

const HeroStatBadgeSubtitle = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      ref={ref}
      data-slot="hero-stat-badge-subtitle"
      className={cn('text-xs text-muted-foreground', className)}
      {...props}
    />
  )
})
HeroStatBadgeSubtitle.displayName = 'HeroStatBadgeSubtitle'

/* ---------- Exports ---------- */

export {
  HeroSection,
  HeroBackgroundImage,
  HeroContent,
  HeroBadge,
  HeroHeading,
  HeroHighlight,
  HeroSubheading,
  HeroActions,
  HeroCta,
  heroCtaVariants,
  HeroMediaPanel,
  HeroSocialProof,
  HeroSocialProofItem,
  HeroStats,
  HeroStat,
  HeroStatValue,
  HeroStatLabel,
  heroSectionVariants,
  heroBadgeVariants,
  heroHeadingVariants,
  heroHighlightVariants,
  heroSubheadingVariants,
  HeroCodeWindow,
  HeroCodeWindowHeader,
  HeroCodeWindowBody,
  HeroInfoStrip,
  HeroInfoStripItem,
  HeroStatBadge,
  HeroStatBadgeIcon,
  HeroStatBadgeContent,
  HeroStatBadgeTitle,
  HeroStatBadgeSubtitle,
}
