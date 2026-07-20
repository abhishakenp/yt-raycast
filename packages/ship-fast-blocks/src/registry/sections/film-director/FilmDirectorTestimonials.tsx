import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FilmDirectorTestimonials — a cinematic "press quotes" grid for a film director
 * or cinematographer. Behind a giant faint quotation-mark watermark, a mono slate
 * meta rule sits above an asymmetric giant credits-style extrabold header, over a
 * responsive 1/2/3-column grid of square hairline cards (subtly staggered) — each
 * carrying a mono "REVIEW 0X" index, a serif-italic quote, and an extrabold name
 * over a mono role line. Tokens-only. Use as social proof from creative directors,
 * brand managers, artists, and fellow filmmakers for directors, cinematographers,
 * DPs, or production houses.
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
export const FilmDirectorTestimonials = defineCapsule({
  name: 'FilmDirectorTestimonials',
  description:
    'Cinematic "press quotes" grid for a film director or cinematographer: behind a giant faint quotation-mark watermark, a mono slate meta rule above an asymmetric giant credits-style extrabold header, over a responsive 1/2/3-column grid of square hairline cards (subtly staggered) each with a mono "REVIEW 0X" index, a serif-italic quote, and an extrabold name over a mono role line. Tokens-only. Use as social proof from creative directors, brand managers, artists, and fellow filmmakers for directors, cinematographers, DPs, or production houses.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
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
    const testimonialsHeading = props.heading ?? 'Client Words'
    const testimonialsDesc =
      props.description ??
      'What creative directors, brand managers, and fellow filmmakers say about working together.'
    const testimonialItems = props.items?.length
      ? props.items
      : [
          {
            name: 'Sarah Mitchell',
            role: 'Creative Director, Nike',
            quote:
              'Marcus has an incredible eye for detail and a gift for bringing out authentic performances. The campaign exceeded all our KPIs and won a Cannes Lion.',
            avatarAlt:
              'professional headshot of a smiling female creative director with short brown hair wearing minimalist black clothing',
          },
          {
            name: 'David Park',
            role: 'Executive Producer, Pulse Films',
            quote:
              "Working with Marcus is seamless. He comes prepared, communicates clearly, and delivers footage that's always beautifully composed. A true professional.",
            avatarAlt:
              'professional headshot of a male film producer in his forties with glasses and graying beard wearing a casual button shirt',
          },
          {
            name: 'Emma Larsson',
            role: 'VP Marketing, Spotify',
            quote:
              'Marcus directed our global brand film with such care and vision. He understood our brand instantly and elevated the concept beyond what we imagined.',
            avatarAlt:
              'professional headshot of a female marketing executive with blonde hair wearing elegant business attire and subtle jewelry',
          },
          {
            name: 'Julian Reyes',
            role: 'Artist, Midnight Bloom',
            quote:
              "The music video Marcus created for us captured the exact emotion of the song. He's a director who truly listens and understands artistic vision.",
            avatarAlt:
              'professional headshot of a young male indie musician with curly dark hair and artistic style wearing a vintage jacket',
          },
          {
            name: 'Robert Chen',
            role: 'Founder, Chen & Partners',
            quote:
              "We've worked with Marcus on six campaigns now. He consistently delivers cinematic quality while staying on time and on budget. Our go-to director.",
            avatarAlt:
              'professional headshot of a mature male advertising agency founder with distinguished gray hair wearing a premium suit',
          },
          {
            name: 'Nina Okafor',
            role: 'Producer, Netflix Documentaries',
            quote:
              "Marcus's cinematography on Chef's Table was breathtaking. He finds beauty in the smallest details and elevates every frame to art.",
            avatarAlt:
              'professional headshot of a female documentary producer with dark hair and natural makeup wearing practical outdoor clothing',
          },
        ]
    return (
      <section
        className={cn(
          'relative overflow-hidden pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 right-0 select-none font-serif leading-none text-foreground/[0.05] text-[18rem] lg:text-[26rem]"
        >
          &rdquo;
        </span>
        <Container className="relative">
          <div className="mb-10 flex items-center justify-between gap-4 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              Press &amp; Clients
            </span>
            <span className="tabular-nums">
              {String(testimonialItems.length).padStart(2, '0')} quotes
            </span>
          </div>
          <SectionHeading
            align="left"
            title={testimonialsHeading}
            subtitle={testimonialsDesc}
            className="mb-16 max-w-2xl gap-0"
            titleClassName="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl"
            subtitleClassName="text-muted-foreground"
          />
          <TestimonialGrid columns={3}>
            {testimonialItems.map((t, i) => {
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
                    'gap-4 rounded-none border-border',
                    i % 3 === 1 && 'lg:mt-10',
                    i % 3 === 2 && 'lg:mt-20',
                  )}
                >
                  <MonoTag className="text-muted-foreground">
                    Review {String(i + 1).padStart(2, '0')}
                  </MonoTag>
                  <TestimonialQuote className="font-serif text-lg italic leading-snug text-foreground">
                    &ldquo;{__iv__.quote}&rdquo;
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-auto flex-col items-start gap-0.5 border-t border-border pt-4">
                    <TestimonialName className="text-base font-extrabold tracking-tight">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.2em]">
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
