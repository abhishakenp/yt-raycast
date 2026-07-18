import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
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
      asChild?: boolean
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
      asChild = false,
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
    const Comp = asChild ? Slot : 'section'
    return (
      <Comp
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
      </Comp>
    )
  },
)
LogoStrip.displayName = 'LogoStrip'
