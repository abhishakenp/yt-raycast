import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'

const SectionHeading = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentProps<'div'>, 'title'> & {
    asChild?: boolean
    eyebrow?: string
    title: string
    subtitle?: string
    align?: 'center' | 'left'
    titleClassName?: string
    eyebrowClassName?: string
    subtitleClassName?: string
    titleId?: string
    titleAs?: 'h1' | 'h2' | 'h3'
  }
>(
  (
    {
      className,
      asChild = false,
      eyebrow,
      title,
      subtitle,
      align = 'center',
      titleClassName,
      eyebrowClassName,
      subtitleClassName,
      titleId,
      titleAs = 'h2',
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'div'
    const centered = align === 'center'
    const TitleTag = titleAs as 'h1' | 'h2' | 'h3'
    return (
      <Comp
        ref={ref}
        data-slot="section-heading"
        className={cn(
          'flex flex-col gap-3',
          centered ? 'mx-auto max-w-2xl text-center' : 'text-left',
          className,
        )}
        {...props}
      >
        {eyebrow ? (
          <span
            data-slot="section-heading-eyebrow"
            className={cn(
              'font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-primary',
              eyebrowClassName,
            )}
          >
            {eyebrow}
          </span>
        ) : null}
        <TitleTag
          id={titleId}
          data-slot="section-heading-title"
          className={cn(
            'text-3xl font-bold tracking-tight text-foreground md:text-4xl',
            titleClassName,
          )}
        >
          {title}
        </TitleTag>
        {subtitle ? (
          <p
            data-slot="section-heading-subtitle"
            className={cn(
              'text-base text-muted-foreground md:text-lg',
              subtitleClassName,
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </Comp>
    )
  },
)
SectionHeading.displayName = 'SectionHeading'

export { SectionHeading }
