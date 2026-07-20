import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * ComingSoonTestimonials — kinetic early-access proof band for a "launching
 * soon" / waitlist pre-launch landing page. A muted wash band cutting in on a
 * diagonal clip-path seam, with an asymmetric header (mono eyebrow rail + big
 * tight-tracked heading left, mono "[ FIELD NOTES ]" meta right) above a
 * staggered 1/2/3-column grid of sharp-cornered bordered quote cards — every
 * other card offset downward on desktop — each with a giant faint quotation
 * mark behind the quote and a mono uppercase attribution row. Use as
 * social-proof / early-feedback section on SaaS waitlists, app pre-launch
 * pages, or beta sign-up landers. Renders fully with no props via three
 * baked-in default testimonials.
 */
export const ComingSoonTestimonials = defineCapsule({
  name: 'ComingSoonTestimonials',
  description:
    "Kinetic early-access proof band for a 'launching soon' / waitlist pre-launch landing page: a muted wash band cutting in on a diagonal clip-path seam, with an asymmetric header (mono eyebrow rail and big tight-tracked heading left, mono meta right) above a staggered 1/2/3-column grid of sharp-cornered bordered quote cards — alternating cards offset downward on desktop — each with a giant faint quotation mark behind the quote and a mono uppercase attribution row. Use as social-proof / early-feedback section on SaaS waitlists, app pre-launch pages, or beta sign-up landers.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Testimonial cards: quote, name, role, avatarAlt. */
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
    const heading = props.heading ?? 'Early access feedback'
    const description =
      props.description ??
      'From design, engineering, and product teams already using Nexus'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Nexus replaced four tools in our stack. The unified workspace has transformed how our remote team collaborates.',
            name: 'Sarah Chen',
            role: 'Product Lead, Linear',
            avatarAlt:
              'Professional headshot of Sarah Chen, a smiling product manager with dark hair',
          },
          {
            quote:
              'The smart boards feature alone saved us 10 hours a week. Finally, a tool that thinks like designers do.',
            name: 'Marcus Williams',
            role: 'UX Director, Figma',
            avatarAlt:
              'Professional headshot of Marcus Williams, a bearded UX designer in his 30s',
          },
          {
            quote:
              'Security was our top concern. Nexus exceeded every compliance requirement our enterprise clients demand.',
            name: 'David Park',
            role: 'CTO, Vercel',
            avatarAlt:
              'Professional headshot of David Park, a CTO wearing glasses with a confident smile',
          },
        ]

    const gridItems = items.map((t) => ({
      quote: t.quote,
      name: t.name,
      role: t.role,
      avatarAlt: t.avatarAlt,
      rating: 5,
    }))

    return (
      <section
        className={cn(
          // Muted wash band cutting in on a diagonal seam (neighbor-independent).
          'w-full bg-muted/40 px-4 py-16 pt-24 [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] sm:px-6 sm:py-20 sm:pt-28 lg:px-8 lg:py-28 lg:pt-36 xl:px-12',
          props.className,
        )}
      >
        <Container size="lg">
          {/* Asymmetric header: heading left, mono meta right. */}
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-4"
              titleClassName="text-4xl font-extrabold uppercase leading-[0.92] tracking-tighter text-foreground sm:text-5xl"
              subtitleClassName="text-base text-muted-foreground"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground/60"
            >
              [ field notes ]
            </p>
          </div>

          <TestimonialGrid>
            {gridItems.map((t, i) => {
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
                    'relative gap-5 overflow-hidden rounded-none border-2 border-foreground/15 bg-background p-6 transition-colors duration-150 hover:border-foreground sm:p-8',
                    i % 2 === 1
                      ? 'ml-5 sm:ml-0 lg:translate-y-10'
                      : 'mr-5 sm:mr-0',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-3 -top-8 select-none font-serif text-[7rem] leading-none text-foreground/[0.06]"
                  >
                    &ldquo;
                  </span>
                  <TestimonialQuote className="relative text-base leading-relaxed">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="gap-3 border-t border-border pt-4">
                    <span
                      aria-hidden="true"
                      className="h-1 w-6 shrink-0 bg-primary"
                    />
                    <TestimonialName className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em]">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.1em]">
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
