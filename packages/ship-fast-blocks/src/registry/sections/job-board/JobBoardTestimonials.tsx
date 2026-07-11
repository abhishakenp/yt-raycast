import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * JobBoardTestimonials — a 3-up success-story testimonial grid for a job-board /
 * careers site. A centered heading + description above a 3-column grid of
 * rounded testimonial cards, each with a quote and a footer pairing a circular
 * candidate headshot with their name + role. Use as social proof on job boards,
 * hiring marketplaces, recruiting platforms or talent networks. Static (no
 * links); avatars use the alt-driven Image component. Renders fully with no
 * props.
 */
import { Container } from '#/section-kit/Container.tsx'
export const JobBoardTestimonials = defineCapsule({
  name: 'JobBoardTestimonials',
  description:
    '3-up success-story testimonial grid for a job-board / careers site: a centered heading + description above a 3-column grid of rounded testimonial cards, each with a quote and a footer pairing a circular candidate headshot with their name + role. Use as social proof on job boards, hiring marketplaces, recruiting platforms or talent networks; avatars use the alt-driven Image component.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Testimonial cards: quote, name, role, avatar alt. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Success stories from our community'
    const description =
      props.description ??
      'Hear from professionals who found their dream roles through WorkFlow'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'I was skeptical about another job board, but WorkFlow connected me with Stripe within 3 weeks. The quality of listings here is unmatched.',
            name: 'Sarah Chen',
            role: 'Senior Engineer at Stripe',
            avatarAlt:
              'Professional headshot of a smiling software engineer with dark hair',
          },
          {
            quote:
              'After months of searching elsewhere, I found the perfect remote design role at Figma in just two weeks. The filtering actually works.',
            name: 'Marcus Johnson',
            role: 'Product Designer at Figma',
            avatarAlt:
              'Professional headshot of a product designer with a warm smile',
          },
          {
            quote:
              'The one-click apply feature saved me hours. Landed interviews with three top-tier companies and accepted an offer at Notion.',
            name: 'Emily Rodriguez',
            role: 'Marketing Lead at Notion',
            avatarAlt:
              'Professional headshot of a marketing manager with a confident expression',
          },
        ]
    return (
      <section className={cn('bg-background py-20', props.className)}>
        <Container>
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground">
              {heading}
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {items.map((t) => (
              <figure
                key={t.name}
                className="rounded-2xl border border-border bg-muted/40 p-8"
              >
                <blockquote className="mb-6">
                  <p className="leading-relaxed text-foreground/80">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </blockquote>
                <figcaption className="flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    loading="lazy"
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <cite className="font-semibold not-italic text-foreground">
                      {t.name}
                    </cite>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
