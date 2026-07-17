import * as React from 'react'

import { cn } from '#/lib/utils.ts'

/**
 * FeatureListItem — an icon + title + description row used in vertical
 * feature lists. Used by ChurchGive, EventVenue, JewelryStoreCraftsmanship,
 * MentalHealthServices.
 *
 * `iconShape` controls the icon container: "circle" (rounded-full) or
 * "square" (rounded-lg). `iconClassName` overrides the icon container bg/text.
 */
export function FeatureListItem(props: {
  icon?: React.ReactNode
  title: string
  description?: string
  iconShape?: 'circle' | 'square'
  iconSize?: 'sm' | 'md' | 'lg'
  iconClassName?: string
  titleClassName?: string
  descriptionClassName?: string
  className?: string
}) {
  const shape = props.iconShape ?? 'circle'
  const size = props.iconSize ?? 'md'
  const sizeCls =
    size === 'sm' ? 'size-10' : size === 'lg' ? 'size-14' : 'size-12'
  return (
    <div className={cn('flex items-start gap-4', props.className)}>
      {props.icon ? (
        <div
          className={cn(
            'flex shrink-0 items-center justify-center',
            sizeCls,
            shape === 'circle' ? 'rounded-full' : 'rounded-lg',
            'bg-muted',
            props.iconClassName,
          )}
        >
          {props.icon}
        </div>
      ) : null}
      <div>
        <h4 className={cn('font-medium text-foreground', props.titleClassName)}>
          {props.title}
        </h4>
        {props.description ? (
          <p
            className={cn(
              'text-sm text-muted-foreground',
              props.descriptionClassName,
            )}
          >
            {props.description}
          </p>
        ) : null}
      </div>
    </div>
  )
}
