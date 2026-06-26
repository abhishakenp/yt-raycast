import { cn } from '#/lib/utils.ts'

/**
 * SectionHeading — generic, reusable section header (eyebrow pill + title +
 * subtitle). Composed by FeatureGrid, PricingGrid, TestimonialGrid,
 * GalleryGrid, and any vertical section capsule that needs a consistent
 * heading block. align="center" (default) centers in a max-w-2xl column.
 */
export function SectionHeading(props: {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  titleClassName?: string
  className?: string
}) {
  const align = props.align ?? 'center'
  const centered = align === 'center'
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        centered ? 'mx-auto max-w-2xl text-center' : 'text-left',
        props.className,
      )}
    >
      {props.eyebrow ? (
        <span className="text-sm font-medium uppercase tracking-wide text-accent">
          {props.eyebrow}
        </span>
      ) : null}
      <h2
        className={cn(
          'text-3xl font-semibold text-foreground md:text-4xl',
          props.titleClassName,
        )}
      >
        {props.title}
      </h2>
      {props.subtitle ? (
        <p className="text-base text-muted-foreground md:text-lg">
          {props.subtitle}
        </p>
      ) : null}
    </div>
  )
}
