import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { SectionHeading } from './SectionHeading.tsx'
import { StarRating } from './StarRating.tsx'

/**
 * TestimonialGrid — responsive grid of customer testimonial cards. Optional
 * heading block via SectionHeading, per-item StarRating, quote, and an avatar
 * footer with name + role/company meta. Theme-token only; 2 or 3 columns.
 */
export function TestimonialGrid(props: {
  heading?: string
  subheading?: string
  items: {
    quote: string
    name: string
    role?: string
    company?: string
    rating?: number
    avatarAlt?: string
  }[]
  columns?: 2 | 3
  className?: string
}) {
  const columns = props.columns ?? 3
  const colClass =
    columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'

  return (
    <section className={cn('flex flex-col gap-10', props.className)}>
      {props.heading ? (
        <SectionHeading title={props.heading} subtitle={props.subheading} />
      ) : null}
      <div className={cn('grid gap-6', 'grid-cols-1', colClass)}>
        {props.items.map((i, idx) => {
          const meta = [i.role, i.company].filter(Boolean).join(' · ')
          return (
            <figure
              key={idx}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
            >
              {i.rating != null ? (
                <StarRating rating={i.rating} size="sm" />
              ) : null}
              <blockquote className="text-base leading-relaxed text-foreground">
                “{i.quote}”
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3">
                <Image
                  alt={i.avatarAlt ?? i.name}
                  w={48}
                  h={48}
                  className="size-12 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">
                    {i.name}
                  </span>
                  {meta ? (
                    <span className="text-xs text-muted-foreground">
                      {meta}
                    </span>
                  ) : null}
                </div>
              </figcaption>
            </figure>
          )
        })}
      </div>
    </section>
  )
}
