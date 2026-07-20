import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * JobBoardTestimonials — "success letters" quote ledger for a job-board /
 * careers site. A paper section with an asymmetric hairline header (serif
 * heading + description left, mono "Placed candidates" meta right) above a
 * collapsed-border 3-column grid of quote cells: each sharp-cornered cell opens
 * with a giant ghost serif quotation mark, carries the quote in serif italic,
 * and closes with a hairline-topped mono byline (name + role, letter index
 * numeral right). Static (no links, no avatars). Use as social proof on job
 * boards, hiring marketplaces, recruiting platforms or talent networks.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
export const JobBoardTestimonials = defineCapsule({
  name: 'JobBoardTestimonials',
  description:
    'Success-letters quote ledger for a job-board / careers site: a paper section with an asymmetric hairline header (serif heading and description left, mono meta right) above a collapsed-border 3-column grid of quote cells — each sharp-cornered cell opens with a giant ghost serif quotation mark, carries the quote in serif italic, and closes with a hairline-topped mono byline of name and role plus a letter index numeral. Static (no links, no avatars). Use as social proof on job boards, hiring marketplaces, recruiting platforms or talent networks.',
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
      <section className={cn('bg-background py-16 lg:py-24', props.className)}>
        <Container>
          <div className="mb-10 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between lg:mb-12">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-2"
              titleClassName="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              subtitleClassName="text-muted-foreground"
            />
            <MonoTag tone="faint" aria-hidden="true" className="shrink-0">
              Placed candidates · Verified
            </MonoTag>
          </div>

          <TestimonialGrid
            columns={3}
            className="[&>div]:gap-0 [&>div]:border-l [&>div]:border-t [&>div]:border-border"
          >
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
                  className="relative gap-0 overflow-hidden rounded-none border-0 border-b border-r border-border bg-transparent p-6 hover:border-border sm:p-8"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-1 -top-5 select-none font-serif text-[5rem] leading-none text-foreground/10"
                  >
                    &ldquo;
                  </span>
                  <TestimonialQuote className="relative pt-8 font-serif text-base italic leading-relaxed text-foreground">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-6 items-baseline justify-between gap-3 border-t border-border pt-4">
                    <span className="flex min-w-0 flex-col">
                      <TestimonialName className="font-mono text-xs uppercase tracking-[0.12em] text-foreground">
                        {__iv__.name}
                      </TestimonialName>
                      {(__iv__.role || __iv__.company || __iv__.meta) && (
                        <TestimonialMeta className="mt-1 font-mono text-[11px] text-muted-foreground">
                          {__iv__.role || __iv__.company || __iv__.meta}
                        </TestimonialMeta>
                      )}
                    </span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground/60"
                    >
                      Letter {String(i + 1).padStart(2, '0')}
                    </span>
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
