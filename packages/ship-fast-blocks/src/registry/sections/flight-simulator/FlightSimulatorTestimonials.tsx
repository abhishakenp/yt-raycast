import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { z } from 'zod/v4'

import {
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

/** Div/text star rating rendered in background-family tokens for the dark band. */
function StarRow({ rating }: { rating: number }) {
  const clamped = Math.max(0, Math.min(5, Math.round(rating)))
  return (
    <span
      aria-label={`${clamped} out of 5`}
      className="flex items-center gap-1 font-mono text-sm leading-none tracking-[0.2em]"
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={i < clamped ? 'text-background' : 'text-background/25'}
        >
          ★
        </span>
      ))}
    </span>
  )
}

/**
 * FlightSimulatorTestimonials — a dark inverted "pilot log" review band for a
 * flight simulator landing page. A full ink-inverted section
 * (bg-foreground / text-background) with a slanted top seam, a mono
 * `[ PILOT LOG ]` HUD rule, and a giant ghost quotation watermark, wrapping the
 * shared `TestimonialGrid` composite as a collapsed-border ledger of log entries.
 * Each cell renders a mono star row from the rating, the quoted review, and a
 * reviewer name paired with their role (real-world pilot, sim YouTuber, flight
 * instructor). The public `reviews` prop ({quote, name, rating, role}) maps to
 * the composite's items, with `rating` shown as the star row and `role` as the
 * meta line. Use for social-proof on flight sims, airliner / combat sims, or
 * aviation titles. Renders fully with no props via baked defaults.
 */
export const FlightSimulatorTestimonials = defineCapsule({
  name: 'FlightSimulatorTestimonials',
  description:
    'Dark inverted "pilot log" review band for a flight-simulator landing page: a full ink-inverted section (bg-foreground / text-background) with a slanted top seam, a mono [ PILOT LOG ] HUD rule, and a giant ghost quotation watermark, wrapping the shared TestimonialGrid composite as a collapsed-border ledger of log entries. Each cell renders a mono star row matching the rating, a quoted review, and an attribution row pairing the reviewer name with their role (real-world pilot, sim YouTuber, flight instructor). Use for social-proof on flight sims, airliner / combat sims, or aviation titles.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Reviews: quote, name, rating, role. */
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          rating: z.number(),
          role: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted by pilots and reviewers'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              'I fly the A320 for a living, and the way this sim models the flight management system and the way she handles in a crosswind is uncanny. I run my procedures here before every line check.',
            name: 'Captain Dana Mercer',
            rating: 5,
            role: 'Real-world A320 pilot',
          },
          {
            quote:
              "I've covered every major flight sim for years and nothing comes close to this. The scenery streaming, the weather, the sheer scale of the world — it's the most jaw-dropping sim I've ever flown.",
            name: 'Liam Park',
            rating: 5,
            role: 'Sim YouTuber',
          },
          {
            quote:
              'We use it in our ground school to teach navigation and radio work. Students who train here show up to the real cockpit already ahead. The fidelity is genuinely classroom-grade.',
            name: 'Sofia Alvarez',
            rating: 4,
            role: 'Flight school instructor',
          },
        ]

    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      rating: r.rating,
      role: r.role,
    }))

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground pb-20 pt-24 text-background [clip-path:polygon(0_0,100%_2.5rem,100%_100%,0_100%)] sm:pt-28 lg:pb-28 lg:pt-32',
          props.className,
        )}
      >
        <Watermark className="-left-3 top-10 text-[9rem] leading-none text-background/[0.06] sm:text-[13rem] lg:text-[17rem]">
          &ldquo;
        </Watermark>
        <Container className="relative">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6 border-b border-background/20 pb-6 md:flex-row md:items-end md:justify-between">
              <SectionHeading
                align="left"
                title={heading}
                titleClassName="text-3xl font-extrabold tracking-tight text-background sm:text-4xl"
                className="gap-3"
              />
              <MonoTag tone="inverted" className="shrink-0 tabular-nums">
                [ pilot log ] {String(items.length).padStart(2, '0')} entries
              </MonoTag>
            </div>
            <div className="grid grid-cols-1 border-l border-t border-background/20 md:grid-cols-2 lg:grid-cols-3">
              {items.map((t) => {
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
                    className="gap-5 rounded-none border-0 border-b border-r border-background/20 bg-transparent p-6 transition-[background-color] duration-150 hover:bg-background/[0.04] sm:p-8"
                  >
                    {typeof __iv__.rating === 'number' && (
                      <StarRow rating={__iv__.rating} />
                    )}
                    <TestimonialQuote className="text-pretty text-[15px] leading-relaxed text-background/90">
                      {__iv__.quote}
                    </TestimonialQuote>
                    <TestimonialAuthor className="mt-auto flex-col items-start gap-1 border-t border-background/15 pt-4">
                      <TestimonialName className="text-background">
                        {__iv__.name}
                      </TestimonialName>
                      {(__iv__.role || __iv__.company || __iv__.meta) && (
                        <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.15em] text-background/50">
                          {__iv__.role || __iv__.company || __iv__.meta}
                        </TestimonialMeta>
                      )}
                    </TestimonialAuthor>
                  </TestimonialCard>
                )
              })}
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
