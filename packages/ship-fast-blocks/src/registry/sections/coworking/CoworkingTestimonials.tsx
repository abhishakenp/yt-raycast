import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { StarRating } from '#/section-kit/StarRating.tsx'

/**
 * CoworkingTestimonials — flat editorial member-quote wall for a coworking or
 * shared-workspace page. A left-aligned header (square-marker mono index
 * "04 / Member stories" + display heading + supporting line) sits above ONE
 * dominant pull-quote: an oversized balanced display quote with quotation
 * marks used as a quiet typographic device, a small primary star row, and a
 * mono attribution beside a round avatar. The remaining members drop into a
 * hairline ledger — a `divide-y` stack on mobile that becomes a `divide-x`
 * row of equal cells on desktop, each with a star row, a smaller quote, and a
 * round-avatar mono attribution. No glass cards, no glow, no gradient, no
 * ghost quote-mark blobs — a single primary accent, tokens only. Any member
 * count renders cleanly. Use for social proof on coworking spaces, shared
 * offices, or flex-office providers.
 */
export const CoworkingTestimonials = defineCapsule({
  name: 'CoworkingTestimonials',
  description:
    'Quiet editorial member-quote wall for a coworking or shared-workspace page: asymmetric 7:5 editorial header (mono index eyebrow chip + display heading left, supporting line right) above gently staggered frosted glass testimonial cards with oversized ghosted quote glyphs, primary star rows, relaxed reading type, and mono alt-driven avatar attributions; on desktop the cards step in a rising-falling rhythm with the middle card lifted behind a primary hairline, under a giant ghost quotation-mark watermark, over a connected light-field backdrop. Use for social proof on coworking spaces, shared offices, or flex-office providers.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    subheading: z.string().optional(),
    /** Member reviews: quote, name, optional role, company, and rating. */
    members: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string().optional(),
          company: z.string().optional(),
          rating: z.number().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading =
      typeof props.heading === 'string' && props.heading
        ? props.heading
        : 'Loved by our members'
    const subheading =
      typeof props.subheading === 'string' && props.subheading
        ? props.subheading
        : 'Founders, freelancers, and remote teams who made Northside their home base.'

    const defaults = [
      {
        quote:
          "Moving my startup here was the easiest decision of the year. The WiFi never blinks, the meeting rooms are always free when I need them, and I've already hired two people I met at a member lunch.",
        name: 'Maya Chen',
        role: 'Founder',
        company: 'Loop Analytics',
        rating: 5,
      },
      {
        quote:
          'As a freelancer I was tired of cafés. A dedicated desk here gives me a real workspace, great coffee, and a community to bounce ideas off. My productivity has genuinely doubled.',
        name: 'Devon Park',
        role: 'Product Designer',
        company: 'Independent',
        rating: 5,
      },
      {
        quote:
          "We took a private office for our remote team's hub and it's perfect. 24/7 access fits our timezone spread, and the staff treat us like family. Couldn't recommend it more.",
        name: 'Aisha Rahman',
        role: 'Operations Lead',
        company: 'Northwind Labs',
        rating: 5,
      },
    ]

    const authored = props.members
      ?.filter(Boolean)
      .filter(
        (member) =>
          typeof member?.quote === 'string' && typeof member?.name === 'string',
      )
    const members = authored?.length ? authored : defaults

    const [lead, ...rest] = members

    const clampRating = (value: unknown) =>
      Math.max(
        0,
        Math.min(5, Math.round(typeof value === 'number' ? value : 5)),
      )

    const attributionOf = (member: (typeof members)[number]) =>
      [
        typeof member.role === 'string' ? member.role : '',
        typeof member.company === 'string' ? member.company : '',
      ]
        .filter(Boolean)
        .join(' · ')

    const leadAttribution = attributionOf(lead)

    return (
      <section
        className={cn(
          'relative isolate overflow-hidden bg-background py-24 lg:py-28',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-border"
        />

        <Container className="relative">
          <div className="flex flex-col gap-5">
            <span className="inline-flex items-center gap-2.5">
              <span aria-hidden="true" className="size-2 bg-primary" />
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                04 / Member stories
              </span>
            </span>
            <SectionHeading
              align="left"
              title={heading}
              className="max-w-xl gap-0"
              titleClassName="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
            />
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              {subheading}
            </p>
          </div>

          <figure className="mt-14 border-t border-border pt-12 lg:mt-16 lg:pt-14">
            <StarRating
              rating={clampRating(lead.rating)}
              size="sm"
              color="primary"
            />
            <TestimonialQuote className="mt-6 max-w-4xl text-balance text-3xl font-semibold leading-[1.18] tracking-tight text-foreground sm:text-4xl lg:text-[2.6rem]">
              <span aria-hidden="true" className="text-muted-foreground/40">
                &ldquo;
              </span>
              {lead.quote}
              <span aria-hidden="true" className="text-muted-foreground/40">
                &rdquo;
              </span>
            </TestimonialQuote>
            <TestimonialAuthor className="mt-8 items-center gap-4">
              <Image
                alt={`Professional headshot portrait of ${lead.name}`}
                w={96}
                h={96}
                className="size-12 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <TestimonialName className="text-base text-foreground">
                  {lead.name}
                </TestimonialName>
                {leadAttribution ? (
                  <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.12em]">
                    {leadAttribution}
                  </TestimonialMeta>
                ) : null}
              </div>
            </TestimonialAuthor>
          </figure>

          {rest.length ? (
            <div className="mt-14 flex flex-col divide-y divide-border border-y border-border sm:flex-row sm:divide-x sm:divide-y-0">
              {rest.map((member, index) => {
                const rating = clampRating(member.rating)
                const attribution = attributionOf(member)
                return (
                  <TestimonialCard
                    key={`${member.name}-${index}`}
                    className="flex-1 gap-0 rounded-none border-0 bg-transparent p-0 py-8 sm:px-8 sm:py-7 sm:first:pl-0 sm:last:pr-0"
                  >
                    <StarRating rating={rating} size="sm" color="primary" />
                    <TestimonialQuote className="mt-4 text-[15px] leading-relaxed text-muted-foreground text-pretty">
                      &ldquo;{member.quote}&rdquo;
                    </TestimonialQuote>
                    <TestimonialAuthor className="mt-6 items-center gap-3">
                      <Image
                        alt={`Professional headshot portrait of ${member.name}`}
                        w={96}
                        h={96}
                        className="size-10 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <TestimonialName className="text-foreground">
                          {member.name}
                        </TestimonialName>
                        {attribution ? (
                          <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.12em]">
                            {attribution}
                          </TestimonialMeta>
                        ) : null}
                      </div>
                    </TestimonialAuthor>
                  </TestimonialCard>
                )
              })}
            </div>
          ) : null}
        </Container>
      </section>
    )
  },
})
