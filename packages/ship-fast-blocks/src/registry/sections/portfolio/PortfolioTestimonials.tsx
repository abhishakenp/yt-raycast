import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

/**
 * PortfolioTestimonials — editorial client-quote wall for a creative-individual
 * portfolio. A left-aligned header (mono index + uppercase label, giant clamp
 * extrabold heading) over a faint ghost watermark, above a responsive grid of
 * sharp rounded-none hairline quote plates set on a staggered ±translate
 * rhythm. Each plate carries a giant faint serif quotation mark, a small star
 * row from the rating, the quoted testimonial in italic serif, and a mono
 * attribution row pairing the client name with their role and company; the
 * plate lifts on hover. Use for social proof from collaborators and clients on
 * a designer, motion artist, or director personal site. Renders fully with no
 * props via baked-in defaults.
 */
export const PortfolioTestimonials = defineCapsule({
  name: 'PortfolioTestimonials',
  description:
    'Editorial client-quote wall for a creative-individual portfolio built on the shared TestimonialGrid composite: a left-aligned header (mono index + uppercase label, giant clamp extrabold heading) over a faint ghost watermark, above a responsive grid of sharp rounded-none hairline quote plates on a staggered ±translate rhythm. Each plate carries a giant faint serif quotation mark, a small star row from the rating, the quoted testimonial in italic serif, and a mono attribution row pairing the client name with their role and company. Use for social proof from collaborators and clients on a designer, motion artist, or director personal site.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Client reviews: quote, name, role, company, rating. */
    reviews: z
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
    const heading = props.heading ?? 'What clients say'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              "Kaelen took a half-formed brief and turned it into the most striking launch film we've ever shipped. The craft is obsessive in the best way.",
            name: 'Dana Whitfield',
            role: 'Creative Director',
            company: 'Helios Studio',
            rating: 5,
          },
          {
            quote:
              'Reliable, fast, and genuinely inventive. The 3D work elevated our entire keynote and the feedback from the room was immediate.',
            name: 'Marcus Lim',
            role: 'Head of Brand',
            company: 'Northwind',
            rating: 5,
          },
          {
            quote:
              "A rare mix of art-direction instinct and technical depth. We brief once and trust the result — that's worth everything on a tight timeline.",
            name: 'Priya Anand',
            role: 'Executive Producer',
            company: 'Field & Frame',
            rating: 5,
          },
        ]

    // Column-phased vertical stagger keeps the wall editorial, not uniform.
    const stagger = ['', 'md:translate-y-8', 'md:translate-y-4']

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Watermark className="-top-4 -left-2 font-serif text-[9rem] not-italic sm:text-[14rem] lg:text-[18rem]">
          &ldquo;
        </Watermark>
        <Container className="relative">
          <div className="mb-14 max-w-2xl">
            <div className="mb-4 flex items-center gap-4">
              <MonoTag tone="muted">03 · Praise</MonoTag>
              <span aria-hidden="true" className="h-px w-16 bg-border" />
            </div>
            <h2 className="text-[clamp(1.9rem,4.5vw,3rem)] font-extrabold leading-[1.02] tracking-tighter text-foreground text-balance">
              {heading}
            </h2>
          </div>

          <TestimonialGrid>
            {reviews
              .map((r) => ({
                quote: r.quote,
                name: r.name,
                role: r.role,
                company: r.company,
                rating: r.rating,
              }))
              .map((t, i) => {
                const __iv__ = t as {
                  quote: string
                  name: string
                  role?: string
                  company?: string
                  meta?: string
                  rating?: number
                  avatarAlt?: string
                }
                const stars = Math.max(
                  0,
                  Math.min(5, Math.round(__iv__.rating ?? 5)),
                )
                const meta = [__iv__.role, __iv__.company, __iv__.meta]
                  .filter(Boolean)
                  .join(' · ')
                return (
                  <TestimonialCard
                    key={__iv__.name}
                    className={cn(
                      'relative gap-5 rounded-none border-2 border-border bg-transparent p-7 transition-all duration-150 hover:-translate-y-1 hover:border-foreground',
                      stagger[i % stagger.length],
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-4 top-2 select-none font-serif text-6xl leading-none text-foreground/[0.06]"
                    >
                      &rdquo;
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-sm tracking-[0.15em] text-primary"
                    >
                      {'★'.repeat(stars)}
                    </span>
                    <TestimonialQuote className="font-serif text-lg italic leading-relaxed">
                      {__iv__.quote}
                    </TestimonialQuote>
                    <TestimonialAuthor className="mt-auto flex-col items-start gap-1 border-t border-border pt-4">
                      <TestimonialName className="text-sm font-bold tracking-tight">
                        {__iv__.name}
                      </TestimonialName>
                      {meta && (
                        <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.14em]">
                          {meta}
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
