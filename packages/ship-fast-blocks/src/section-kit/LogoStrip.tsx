import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const logoStripVariants = cva('', {
  variants: {
    layout: {
      flex: 'flex flex-wrap items-center justify-center gap-x-10 gap-y-6',
      grid: 'grid grid-cols-3 items-center gap-8 md:grid-cols-6',
    },
  },
  defaultVariants: {
    layout: 'flex',
  },
})

const logoItemVariants = cva('', {
  variants: {
    style: {
      text: 'text-lg font-semibold tracking-tight text-muted-foreground',
      'text-bold':
        'text-base font-semibold tracking-tight text-muted-foreground transition-colors hover:text-foreground',
      'opacity-hover':
        'text-center text-lg font-semibold text-muted-foreground transition-colors hover:text-foreground',
    },
  },
  defaultVariants: {
    style: 'text',
  },
})

/**
 * LogoStrip — social-proof strip showing a lead line / eyebrow above a row of
 * text-based company wordmarks. Supports flex-wrap or grid layouts, with
 * optional clickable buttons (via asChild or onClick). Theme-token only.
 */
export const LogoStrip = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'> &
    VariantProps<typeof logoStripVariants> & {
      lead?: string
      logos: string[]
      leadClassName?: string
      logoClassName?: string
      logoStyle?: 'text' | 'text-bold' | 'opacity-hover'
      onClickLogo?: (logo: string) => void
    }
>(
  (
    {
      className,
      lead,
      logos: rawLogos,
      layout,
      leadClassName,
      logoClassName,
      logoStyle,
      onClickLogo,
      ...props
    },
    ref,
  ) => {
    const logos = Array.isArray(rawLogos) ? rawLogos : []
    return (
      <section
        ref={ref}
        data-slot="logo-strip"
        className={cn(className)}
        {...props}
      >
        {lead ? (
          <p
            className={cn(
              'text-center text-sm font-medium uppercase tracking-wide text-muted-foreground',
              leadClassName,
            )}
          >
            {lead}
          </p>
        ) : null}
        <div className={cn('mt-8', logoStripVariants({ layout }))}>
          {logos.filter(Boolean).map((logo) =>
            onClickLogo ? (
              <button
                key={logo}
                type="button"
                onClick={() => onClickLogo(logo)}
                className={cn(
                  logoItemVariants({ style: logoStyle }),
                  logoClassName,
                )}
              >
                {logo}
              </button>
            ) : (
              <span
                key={logo}
                className={cn(
                  logoItemVariants({ style: logoStyle }),
                  logoClassName,
                )}
              >
                {logo}
              </span>
            ),
          )}
        </div>
      </section>
    )
  },
)
LogoStrip.displayName = 'LogoStrip'

/** Label / eyebrow text above the logo strip. */
export const LogoStripLabel = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="logo-strip-label"
    className={cn(
      'text-center text-sm font-medium uppercase tracking-wide text-muted-foreground',
      className,
    )}
    {...props}
  />
))
LogoStripLabel.displayName = 'LogoStripLabel'

/** Individual logo item in the strip. Use asChild for clickable logos. */
export const LogoStripItem = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> &
    VariantProps<typeof logoItemVariants> & { asChild?: boolean }
>(({ className, style, asChild = false, ...props }, ref) => {
  const Comp = asChild ? React.Fragment : 'span'
  return (
    <Comp
      ref={ref as never}
      data-slot="logo-strip-item"
      className={cn(logoItemVariants({ style }), className)}
      {...props}
    />
  )
})
LogoStripItem.displayName = 'LogoStripItem'
