import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { SectionHeading } from './SectionHeading.tsx'

/**
 * GalleryGrid — responsive image gallery (optional heading + N-column grid).
 * Each tile renders a stock photo from its alt text with a hover zoom and an
 * optional caption overlay strip. columns defaults to 3 (2/3/4 supported);
 * tiles keep a 4:3 aspect ratio. Theme tokens only, props.className merged last.
 */
export function GalleryGrid(props: {
  heading?: string
  subheading?: string
  images: { alt: string; caption?: string }[]
  columns?: 2 | 3 | 4
  className?: string
}) {
  const columns = props.columns ?? 3
  const images = Array.isArray(props.images) ? props.images : []
  const colClass =
    columns === 2
      ? 'sm:grid-cols-2'
      : columns === 4
        ? 'sm:grid-cols-2 lg:grid-cols-4'
        : 'sm:grid-cols-2 lg:grid-cols-3'

  return (
    <section className={cn('flex flex-col gap-10', props.className)}>
      {props.heading ? (
        <SectionHeading title={props.heading} subtitle={props.subheading} />
      ) : null}
      <div className={cn('grid gap-4', 'grid-cols-1', colClass)}>
        {images.filter(Boolean).map((img, i) => (
          <figure
            key={i}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border"
          >
            <Image
              alt={img.alt}
              w={600}
              h={450}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {img.caption ? (
              <figcaption className="absolute inset-x-0 bottom-0 bg-background/80 px-3 py-2 text-sm text-foreground backdrop-blur-sm">
                {img.caption}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </section>
  )
}
