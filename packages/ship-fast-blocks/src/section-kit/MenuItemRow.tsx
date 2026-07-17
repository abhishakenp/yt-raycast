import * as React from 'react'

import { cn } from '#/lib/utils.ts'

/**
 * MenuItemRow — a single menu item row with name, description, price,
 * and an optional add button / tag. Used by CafeMenu, FoodTruckMenu,
 * RestaurantMenu, WineryBreweryMenu.
 *
 * The `action` slot renders the add-to-cart button or quantity indicator.
 * The `name` can be rendered as a button (clickable) or plain text.
 */
export function MenuItemRow(props: {
  name: string
  description?: string
  price?: string
  tag?: string
  tagClassName?: string
  nameClassName?: string
  priceClassName?: string
  action?: React.ReactNode
  onNameClick?: () => void
  showDivider?: boolean
  dividerClassName?: string
  className?: string
  as?: 'div' | 'button'
  ariaLabel?: string
  ariaBusy?: boolean
}) {
  const Tag = props.as ?? 'div'
  return (
    <div className={cn(props.className)}>
      <Tag
        type={props.as === 'button' ? 'button' : undefined}
        aria-label={props.ariaLabel}
        aria-busy={props.ariaBusy}
        className={cn(
          'group flex w-full items-start justify-between gap-4 text-left',
          props.as === 'button' && 'cursor-pointer',
        )}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {props.onNameClick ? (
              <button
                type="button"
                onClick={props.onNameClick}
                className={cn(
                  'font-medium text-foreground transition-colors hover:text-primary',
                  props.nameClassName,
                )}
              >
                {props.name}
              </button>
            ) : (
              <span className={cn('font-medium', props.nameClassName)}>
                {props.name}
              </span>
            )}
            {props.tag ? (
              <span
                className={cn(
                  'rounded-full bg-primary/10 px-2 py-0.5 text-xs uppercase tracking-wide text-primary',
                  props.tagClassName,
                )}
              >
                {props.tag}
              </span>
            ) : null}
          </div>
          {props.description ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {props.description}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {props.price ? (
            <span
              className={cn(
                'font-serif text-lg text-foreground',
                props.priceClassName,
              )}
            >
              {props.price}
            </span>
          ) : null}
          {props.action}
        </div>
      </Tag>
      {props.showDivider ? (
        <div className={cn('mt-6 h-px bg-border', props.dividerClassName)} />
      ) : null}
    </div>
  )
}
