import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * DevToolTestimonials — a 3-up developer testimonials grid for a developer tool
 * / API platform. A centered heading + intro above a responsive 1/3-column grid
 * of bordered cards, each with a 5-star brand-colored rating row, a blockquote,
 * and an author row (alt-driven circular avatar + name + role). Static (no
 * links). Use as social proof to surface engineering-team quotes for developer
 * tools, API platforms, or technical SaaS.
 */
export const DevToolTestimonials = defineCapsule({
  name: 'DevToolTestimonials',
  description:
    '3-up developer testimonials grid for a developer tool / API platform: a centered heading + intro above a responsive 1/3-column grid of bordered cards, each with a 5-star brand-colored rating row, a blockquote, and an author row (alt-driven circular avatar + name + role). Use as social proof to surface engineering-team quotes for developer tools, API platforms, or technical SaaS.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
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
    const heading = props.heading ?? 'Loved by developers'
    const description =
      props.description ??
      'See what engineering teams are building with DevStack.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'DevStack cut our API development time by 70%. Authentication, storage, and real-time — all working out of the box. We went from prototype to production in under two weeks.',
            name: 'Marcus Chen',
            role: 'CTO, Velocity Labs',
            avatarAlt:
              'professional headshot of a male CTO with beard and glasses smiling',
          },
          {
            quote:
              'The observability features alone are worth the price. We caught a performance issue in staging that would have cost us thousands in production. Support team is incredibly responsive.',
            name: 'Sarah Williams',
            role: 'Engineering Manager, DataFlow',
            avatarAlt:
              'professional headshot of a female engineering manager with dark curly hair',
          },
          {
            quote:
              'We migrated from Firebase to DevStack and reduced our infrastructure costs by 60%. The TypeScript SDK is fantastic — everything is fully typed and documented.',
            name: 'David Park',
            role: 'Senior Developer, NexGen Apps',
            avatarAlt:
              'professional headshot of a male senior developer with short dark hair and friendly smile',
          },
        ]

    const Star = () => (
      <svg
        className="size-5 text-primary"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section
        className={cn('py-20 lg:py-28', props.className)}
        aria-labelledby="testimonials-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2
              id="testimonials-heading"
              className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {items.map((t) => (
              <article
                key={t.name}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="mb-4 flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <Star key={n} />
                  ))}
                </div>
                <blockquote className="mb-6 leading-relaxed text-card-foreground/90">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-foreground">
                      {t.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t.role}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
