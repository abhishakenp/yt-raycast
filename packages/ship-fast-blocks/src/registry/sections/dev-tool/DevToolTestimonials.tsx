import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

/**
 * DevToolTestimonials — commit-log testimonials grid for a developer tool /
 * API platform. An asymmetric header (heading + intro left, aria-hidden mono
 * "[ log ]" meta right) above a 1/3-column grid of sharp-cornered log cards —
 * the middle card drops on desktop for a staggered rhythm. Each card opens
 * with a mono header row (square alt-driven avatar, an aria-hidden mono
 * "@handle" derived from the name, and a chart-1 "+1" diff chip), then the
 * blockquote behind a hairline rule, and an author row with name + mono role.
 * Static (no links). Use as social proof to surface engineering-team quotes
 * for developer tools, API platforms, or technical SaaS.
 */
export const DevToolTestimonials = defineCapsule({
  name: 'DevToolTestimonials',
  description:
    "Commit-log testimonials grid for a developer tool / API platform: an asymmetric header (heading + intro left, aria-hidden mono log meta right) above a 1/3-column grid of sharp log cards with a desktop stagger, each opening with a mono header row (square alt-driven avatar, aria-hidden '@handle' derived from the name, chart-1 '+1' diff chip), then the blockquote behind a hairline rule and an author row with name + mono role. Use as social proof to surface engineering-team quotes for developer tools, API platforms, or technical SaaS.",
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

    const toHandle = (name: string) =>
      '@' +
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '.')
        .replace(/(^\.|\.$)/g, '')

    return (
      <section
        className={cn('py-16 lg:py-24', props.className)}
        aria-labelledby="testimonials-heading"
      >
        <Container>
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-14">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              titleId="testimonials-heading"
              className="max-w-2xl gap-4"
              titleClassName="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <MonoTag aria-hidden="true" tone="faint" className="shrink-0">
              [ log ] verified reviews
            </MonoTag>
          </div>
          <TestimonialGrid columns={3}>
            {items.map((t, i) => {
              const __iv__ = t as {
                quote: string
                name: string
                role?: string
                company?: string
                meta?: string
                rating?: number
                avatarAlt?: string
              }
              return (
                <TestimonialCard
                  key={__iv__.name}
                  className={cn(
                    'gap-4 rounded-none border-foreground/15 bg-card p-6 hover:border-foreground/40',
                    i % 3 === 1 && 'lg:translate-y-8',
                  )}
                >
                  <div className="flex items-center gap-3 border-b border-border pb-4">
                    {__iv__.avatarAlt ? (
                      <Image
                        alt={__iv__.avatarAlt}
                        w={96}
                        h={96}
                        className="size-9 shrink-0 rounded-none border border-border object-cover"
                      />
                    ) : null}
                    <span
                      aria-hidden="true"
                      className="truncate font-mono text-xs text-muted-foreground"
                    >
                      {toHandle(__iv__.name)}
                    </span>
                    <span
                      aria-hidden="true"
                      className="ml-auto shrink-0 font-mono text-[11px] text-chart-1"
                    >
                      +1
                    </span>
                  </div>
                  <TestimonialQuote className="text-sm leading-relaxed text-foreground/90">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="flex-col items-start gap-1 border-t border-border pt-4">
                    <TestimonialName className="font-semibold text-foreground">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                        {__iv__.role || __iv__.company || __iv__.meta}
                      </TestimonialMeta>
                    )}
                  </TestimonialAuthor>
                </TestimonialCard>
              )
            })}
          </TestimonialGrid>
        </Container>
      </section>
    )
  },
})
