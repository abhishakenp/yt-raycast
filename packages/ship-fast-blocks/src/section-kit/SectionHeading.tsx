import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'
import { stripHlTags } from '#/primitives/index.tsx'

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
    const cleanTitle = stripHlTags(title)
    return (
      <Comp
        ref={ref}
        data-slot="section-heading"
        data-d-role="heading"
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
            data-d-role="eyebrow"
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
          data-d-role="heading"
          className={cn(
            'text-3xl font-bold tracking-tight text-foreground md:text-4xl',
            titleClassName,
          )}
        >
          {cleanTitle}
        </TitleTag>
        {subtitle ? (
          <p
            data-slot="section-heading-subtitle"
            data-d-role="heading"
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
