import * as React from 'react'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * StoryCard — a clickable article/story card with image, meta, title,
 * and excerpt. Used by BlogPostStoryGrid, BlogStoryGrid, NewsletterIssues.
 *
 * Variants:
 * - "simple": image + meta row + title + excerpt (no border, no shadow)
 * - "bordered": image + meta + title + excerpt + footer link (border + shadow)
 */
export function StoryCard(props: {
  title: string
  excerpt?: string
  imageAlt: string
  imageW?: number
  imageH?: number
  imageClassName?: string
  meta?: React.ReactNode
  footer?: React.ReactNode
  onClick?: () => void
  variant?: 'simple' | 'bordered'
  className?: string
  bodyClassName?: string
}) {
  const variant = props.variant ?? 'simple'
  const bordered = variant === 'bordered'
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={cn(
        'group block w-full text-left',
        bordered &&
          'flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]',
        props.className,
      )}
    >
      {bordered ? (
        <div className="relative overflow-hidden bg-muted">
          <Image
            alt={props.imageAlt}
            w={props.imageW ?? 800}
            h={props.imageH ?? 500}
            loading="lazy"
            className={cn(
              'size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]',
              props.imageClassName,
            )}
          />
          {props.meta}
        </div>
      ) : (
        <figure className="mb-4 overflow-hidden rounded-lg">
          <Image
            alt={props.imageAlt}
            w={props.imageW ?? 600}
            h={props.imageH ?? 400}
            loading="lazy"
            className={cn(
              'h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105',
              props.imageClassName,
            )}
          />
        </figure>
      )}
      <div
        className={cn(
          bordered ? 'flex flex-1 flex-col p-5' : '',
          props.bodyClassName,
        )}
      >
        {!bordered ? props.meta : null}
        <h3
          className={cn(
            'mb-2 text-lg font-semibold text-foreground transition-colors group-hover:text-muted-foreground',
            bordered && 'text-[1.05rem] font-bold leading-snug tracking-tight',
          )}
        >
          {props.title}
        </h3>
        {props.excerpt ? (
          <p
            className={cn(
              'text-sm leading-relaxed text-muted-foreground',
              bordered && 'mt-2 line-clamp-3 flex-1 text-[0.92rem]',
            )}
          >
            {props.excerpt}
          </p>
        ) : null}
        {props.footer}
      </div>
    </button>
  )
}
