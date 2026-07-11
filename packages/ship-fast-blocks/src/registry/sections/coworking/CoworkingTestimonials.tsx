import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { GridField } from '#/section-kit/motion.tsx'

import { Container } from '#/section-kit/Container.tsx'

/**
 * CoworkingTestimonials — quiet editorial member-quote wall for a coworking
 * or shared-workspace page. A centered header (eyebrow chip + display
 * heading + supporting line) above a responsive grid of frosted glass cards:
 * each carries an oversized ghosted quote glyph, a primary star row, the
 * member's words in relaxed reading type, and an attribution row with an
 * alt-driven avatar. The middle card sits slightly elevated with a primary
 * hairline for editorial rhythm; cards lift softly on hover. The backdrop
 * continues the page's light-field — hairline content rails and a seam
 * hairline. Any member count renders cleanly. Use for social proof on
 * coworking spaces, shared offices, or flex-office providers.
 */
export const CoworkingTestimonials = defineCapsule({
  name: 'CoworkingTestimonials',
  description:
    'Quiet editorial member-quote wall for a coworking or shared-workspace page: centered header (eyebrow chip + display heading + supporting line) above frosted glass testimonial cards with oversized ghosted quote glyphs, primary star rows, relaxed reading type, and alt-driven avatar attributions; the middle card is slightly elevated with a primary hairline, and cards lift softly on hover over a connected light-field backdrop. Use for social proof on coworking spaces, shared offices, or flex-office providers.',
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

    const Star = ({ filled }: { filled: boolean }) => (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={cn(
          'size-4',
          filled
            ? 'fill-current text-primary'
            : 'fill-none stroke-current text-muted-foreground/50',
        )}
      >
        <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    )

    return (
      <section
        className={cn(
          'relative isolate overflow-hidden bg-background py-24 sm:py-32',
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

        <Container className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-gradient-to-b from-transparent via-border/70 to-transparent lg:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-border/70 to-transparent lg:block"
          />

          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-1.5 backdrop-blur">
              <Star filled />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Member stories
              </span>
            </span>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {heading}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
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
                <figure
                  key={`${member.name}-${index}`}
                  className={cn(
                    'relative flex h-full flex-col overflow-hidden rounded-3xl border bg-card/75 p-8 shadow-sm backdrop-blur transition-shadow duration-500 hover:shadow-lg hover:shadow-primary/10',
                    featured
                      ? 'border-primary/30 lg:-translate-y-3'
                      : 'border-border/60',
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

                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star key={starIndex} filled={starIndex < rating} />
                    ))}
                  </div>

                  <blockquote className="mt-5 flex-1 text-[15px] font-medium leading-relaxed text-card-foreground">
                    &ldquo;{member.quote}&rdquo;
                  </blockquote>

                  <figcaption className="mt-7 flex items-center gap-3.5 border-t border-border/50 pt-5">
                    <Image
                      alt={`Professional headshot portrait of ${member.name}`}
                      w={96}
                      h={96}
                      className="size-11 rounded-full object-cover ring-2 ring-border/60"
                    />
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">
                        {member.name}
                      </p>
                      {attribution ? (
                        <p className="text-sm text-muted-foreground">
                          {attribution}
                        </p>
                      ) : null}
                    </div>
                  </figcaption>
                </figure>
              )
            })}
          </div>
        </Container>
      </section>
    )
  },
})
