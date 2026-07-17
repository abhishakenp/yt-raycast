import * as React from 'react'

import { cn } from '#/lib/utils.ts'

/**
 * MenuCategoryHeader — the title row above a menu category section.
 * Renders an optional icon tile, a serif heading, and an optional
 * trailing divider rule. Used by CafeMenu, RestaurantMenu, WineryBreweryMenu.
 */
export function MenuCategoryHeader(props: {
  title: string
  icon?: React.ReactNode
  iconClassName?: string
  titleClassName?: string
  showDivider?: boolean
  className?: string
}) {
  return (
    <div className={cn('mb-8 flex items-center gap-4', props.className)}>
      {props.icon ? (
        <div
          className={cn(
            'grid size-12 place-items-center rounded-full bg-primary/10 text-primary',
            props.iconClassName,
          )}
        >
          {props.icon}
        </div>
      ) : null}
      <h3
        className={cn(
          'font-serif text-2xl font-medium text-foreground',
          props.titleClassName,
        )}
      >
        {props.title}
      </h3>
      {props.showDivider ? <div className="h-px flex-1 bg-border" /> : null}
    </div>
  )
}
