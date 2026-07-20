import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { GridField } from '#/section-kit/motion.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
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
 * CoworkingTestimonials — quiet editorial member-quote wall for a coworking
 * or shared-workspace page. An asymmetric 7:5 editorial header (mono index
 * eyebrow chip "04 / Member stories" + display heading left, supporting line
 * right) above a gently staggered grid of frosted glass cards: each carries
 * an oversized ghosted quote glyph, a primary star row, the member's words
 * in relaxed reading type, and a mono attribution row with an alt-driven
 * avatar. On desktop the cards step in a rising-falling rhythm with the
 * middle card lifted behind a primary hairline; a giant ghost quotation mark
 * watermarks the section edge. The backdrop continues the page's light-field
 * — hairline content rails and a seam hairline. Any member count renders
 * cleanly. Use for social proof on coworking spaces, shared offices, or
 * flex-office providers.
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

    return (
      <section
        className={cn(
          'relative isolate overflow-hidden bg-background py-24 lg:py-28',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent"
        />
        <GridField
          className="-z-10 text-foreground/[0.045]"
          size={64}
          mask="radial-gradient(ellipse 90% 70% at 50% 25%, black 25%, transparent 78%)"
        />

        <Watermark className="right-[-2%] top-[2%] -z-10 font-serif text-[clamp(9rem,22vw,20rem)]">
          &ldquo;
        </Watermark>

        <Container className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-gradient-to-b from-transparent via-border/70 to-transparent lg:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-border/70 to-transparent lg:block"
          />

          <div className="grid items-end gap-6 lg:grid-cols-[7fr_5fr] lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-1.5 backdrop-blur">
                <StarRating rating={1} max={1} size="sm" color="primary" />
                <MonoTag>04 / Member stories</MonoTag>
              </span>
              <SectionHeading
                align="left"
                title={heading}
                className="mt-5 max-w-xl gap-0"
                titleClassName="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
              />
            </div>
            <p className="text-lg leading-relaxed text-muted-foreground lg:pb-1">
              {subheading}
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-md grid-cols-1 items-start gap-7 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {members.map((member, index) => {
              const featured = members.length >= 3 && index % 3 === 1
              const rating = Math.max(
                0,
                Math.min(
                  5,
                  Math.round(
                    typeof member.rating === 'number' ? member.rating : 5,
                  ),
                ),
              )
              const attribution = [
                typeof member.role === 'string' ? member.role : '',
                typeof member.company === 'string' ? member.company : '',
              ]
                .filter(Boolean)
                .join(' · ')
              return (
                <TestimonialCard
                  key={`${member.name}-${index}`}
                  className={cn(
                    'relative h-full overflow-hidden rounded-3xl bg-card/75 p-8 shadow-sm backdrop-blur transition-shadow duration-500 hover:shadow-lg hover:shadow-primary/10',
                    featured
                      ? 'border-primary/30 lg:-translate-y-5'
                      : 'border-border/60',
                    !featured && index % 3 === 2 && 'lg:translate-y-4',
                  )}
                >
                  <div
                    aria-hidden="true"
                    className={cn(
                      'absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent',
                      featured ? 'via-primary/60' : 'via-border',
                    )}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-3 right-5 font-serif text-8xl leading-none text-primary/10"
                  >
                    &ldquo;
                  </span>

                  <StarRating rating={rating} size="sm" color="primary" />

                  <TestimonialQuote className="mt-5 flex-1 text-[15px] font-medium leading-relaxed text-card-foreground">
                    &ldquo;{member.quote}&rdquo;
                  </TestimonialQuote>

                  <TestimonialAuthor className="mt-7 gap-3.5 border-t border-border/50 pt-5">
                    <Image
                      alt={`Professional headshot portrait of ${member.name}`}
                      w={96}
                      h={96}
                      className="size-11 rounded-full object-cover ring-2 ring-border/60"
                    />
                    <div>
                      <TestimonialName className="text-card-foreground">
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
        </Container>
      </section>
    )
  },
})
