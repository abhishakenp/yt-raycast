import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * MusicFestivalTestimonials — a kinetic-poster testimonial row for a music /
 * arts festival landing page. An asymmetric mono-index header above a
 * staggered row of three square-cornered quote cards, each opening with a giant
 * ghost quotation mark, then a quote, and a mono name + role footer. Use for
 * social proof on music festivals, arts festivals, concert series, or any
 * multi-day live event with returning attendees.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
export const MusicFestivalTestimonials = defineCapsule({
  name: 'MusicFestivalTestimonials',
  description:
    'Kinetic-poster testimonial row for a music / arts festival landing page: an asymmetric mono-index header above a staggered row of three square-cornered quote cards, each opening with a giant ghost quotation mark, then a quote, and a mono name + role footer. Use for community social proof on music festivals, arts festivals, concert series, raves, or any multi-day live event with returning attendees.',
  props: z.object({
    /** Eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Testimonial cards. */
    items: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
          quote: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Community'
    const heading = props.heading ?? 'What People Say'
    const items = props.items?.length
      ? props.items
      : [
          {
            name: 'Maya Thompson',
            role: 'Festival veteran, 4 years',
            quote:
              "Horizon changed my life. The curation is impeccable — I've discovered at least five artists each year that are now in my daily rotation. The desert setting makes it magical.",
            avatarAlt:
              'Professional headshot of a smiling young woman with curly hair and natural makeup',
          },
          {
            name: 'David Chen',
            role: 'Photographer, LA',
            quote:
              "As a photographer, I've shot dozens of festivals. Horizon stands out for its attention to detail — the art installations, the lighting design, even the way the stages are positioned for golden hour. Pure visual poetry.",
            avatarAlt:
              'Professional headshot of a bearded man in his 30s with a friendly smile',
          },
          {
            name: 'Sarah Williams',
            role: 'First-timer, Portland',
            quote:
              'I was nervous about my first camping festival, but the Horizon community made me feel at home immediately. The wellness programs were a lifesaver, and I made friends for life. Already bought my 2025 ticket!',
            avatarAlt:
              'Professional headshot of a blonde woman with a warm smile and casual style',
          },
        ]
    return (
      <section
        className={cn(
          'pb-24 pt-24 sm:pt-28 lg:pb-28 lg:pt-32',
          props.className,
        )}
      >
        <Container>
          <div className="mb-14 flex flex-col gap-4 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              className="max-w-2xl gap-3"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
              titleClassName="text-4xl font-extrabold uppercase tracking-tight lg:text-6xl"
            />
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/40"
            >
              [ voices ]
            </span>
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
                    'relative gap-5 rounded-none border-2 border-border p-7 transition-[transform,box-shadow] duration-150 hover:-translate-y-1 hover:border-foreground hover:shadow-[6px_6px_0_0] hover:shadow-foreground motion-reduce:transform-none',
                    i % 2 === 1 ? 'md:translate-y-6' : undefined,
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="font-serif text-6xl font-bold leading-[0.6] text-foreground/15"
                  >
                    &ldquo;
                  </span>
                  <TestimonialQuote className="leading-relaxed">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-auto flex-col items-start gap-0.5 border-t border-border pt-4">
                    <TestimonialName className="text-sm font-extrabold uppercase tracking-tight">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[10px] uppercase tracking-[0.16em]">
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
