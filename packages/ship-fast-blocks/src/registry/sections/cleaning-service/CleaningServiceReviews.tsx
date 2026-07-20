import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * CleaningServiceReviews — playful-Swiss staggered reviews board for a
 * home-cleaning / maid-service landing page. An asymmetric header row (left
 * mono "05 / Reviews" eyebrow + heading + lead, right tabular mono entry
 * count) above a 1/2/3-column grid of square 2px-bordered review cards with
 * hard offset shadows: the middle column drops down on desktop and one card
 * tilts slightly for a playful accent. Each card layers a giant ghost
 * quotation mark, a 5-star primary rating row, the quoted paragraph, and an
 * attribution row with a round bordered lazy-loaded avatar, a bold name, and a
 * mono meta line. No links — pure social proof. Use for testimonial / review
 * blocks for residential cleaning companies, maid services, or any local
 * home-service brand wanting homeowner credibility. Renders fully with no
 * props via six baked-in default reviews.
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
export const CleaningServiceReviews = defineCapsule({
  name: 'CleaningServiceReviews',
  description:
    "Playful-Swiss staggered reviews board for a home-cleaning / maid-service landing page: asymmetric header row (left mono '05 / Reviews' eyebrow + heading + lead, right tabular mono entry count) above a 1/2/3-column grid of square 2px-bordered review cards with hard offset shadows — middle column drops down on desktop and one card tilts slightly. Each card layers a giant ghost quotation mark, a 5-star primary rating row, the quoted paragraph, and an attribution row with a round bordered lazy-loaded avatar, bold name, and mono meta line. No links — pure social proof. Use for testimonial / review blocks for residential cleaning, maid services, or local home-service brands.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Review cards: quote + name + meta line + avatar alt. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          meta: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Loved by homeowners'
    const description =
      props.description ??
      "Don't take our word for it. Here's what Seattle residents say about PureSpace."
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "I've used PureSpace for weekly cleanings for 8 months now. Maria is always on time, thorough, and leaves my place smelling amazing. Worth every penny for the peace of mind.",
            name: 'Jennifer Walsh',
            meta: 'Capitol Hill, Seattle • Weekly Customer',
            avatarAlt:
              'professional headshot of Jennifer Walsh, a smiling woman with shoulder-length blonde hair',
          },
          {
            quote:
              'Booked them for a move-out clean on short notice. They arrived the next morning and got my full deposit back. The landlord even asked for their contact info. Highly recommend!',
            name: 'David Chen',
            meta: 'Ballard, Seattle • Move-Out Clean',
            avatarAlt:
              'professional headshot of David Chen, a smiling man with glasses and short black hair',
          },
          {
            quote:
              "As a working mom of three, PureSpace has been a lifesaver. The eco-friendly option means I don't worry about chemicals around my kids. Their attention to detail is incredible.",
            name: 'Sarah Martinez',
            meta: 'Green Lake, Seattle • Bi-weekly Customer',
            avatarAlt:
              'professional headshot of Sarah Martinez, a smiling woman with brown hair in a bun',
          },
          {
            quote:
              "I run an Airbnb with 4 units and PureSpace handles all my turnovers. They're reliable, communicate well, and my guests consistently mention how clean the places are in reviews.",
            name: 'Marcus Johnson',
            meta: 'Fremont, Seattle • Commercial Client',
            avatarAlt:
              'professional headshot of Marcus Johnson, a smiling man with beard and short hair',
          },
          {
            quote:
              'After my renovation, there was dust everywhere. The post-construction team made my house livable again. They even cleaned inside every drawer and cabinet. Absolutely phenomenal service.',
            name: 'Emily Thompson',
            meta: 'Queen Anne, Seattle • Deep Clean',
            avatarAlt:
              'professional headshot of Emily Thompson, a smiling young woman with curly auburn hair',
          },
          {
            quote:
              "I've tried three other cleaning services in Seattle, and PureSpace is by far the best. Consistent quality, easy app, and they actually listen to my preferences. Never switching.",
            name: 'Robert Kim',
            meta: 'Wallingford, Seattle • Monthly Customer',
            avatarAlt:
              'professional headshot of Robert Kim, a smiling man with dark hair and professional attire',
          },
        ]
    const Star = () => (
      <svg
        width="14"
        height="14"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )
    return (
      <section className={cn('bg-background py-16 lg:py-24', props.className)}>
        <Container>
          <div className="mb-10 flex flex-col gap-4 sm:mb-14 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow="05 / Reviews"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              subtitleClassName="max-w-xl text-lg text-muted-foreground"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70"
            >
              <span className="tabular-nums">
                {String(items.length).padStart(2, '0')}
              </span>{' '}
              entries · unedited
            </p>
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
                    'relative gap-4 overflow-hidden rounded-none border-2 border-foreground bg-card p-6 shadow-[4px_4px_0_0] shadow-foreground transition-transform duration-150 hover:-translate-y-0.5',
                    i % 3 === 1 && 'lg:translate-y-8',
                    i === 2 && 'lg:-rotate-1',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-1 -top-5 select-none font-serif text-8xl font-bold leading-none text-foreground/[0.06]"
                  >
                    &ldquo;
                  </span>
                  <span
                    className="flex items-center gap-0.5 text-primary"
                    aria-hidden="true"
                  >
                    <Star />
                    <Star />
                    <Star />
                    <Star />
                    <Star />
                  </span>
                  <TestimonialQuote className="text-sm leading-relaxed text-card-foreground">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-auto gap-3 border-t border-border pt-4">
                    {__iv__.avatarAlt && (
                      <Image
                        alt={__iv__.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-10 shrink-0 rounded-full border-2 border-foreground object-cover"
                      />
                    )}
                    <span className="flex min-w-0 flex-col">
                      <TestimonialName className="text-sm font-bold text-card-foreground">
                        {__iv__.name}
                      </TestimonialName>
                      {(__iv__.role || __iv__.company || __iv__.meta) && (
                        <TestimonialMeta className="truncate font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                          {__iv__.role || __iv__.company || __iv__.meta}
                        </TestimonialMeta>
                      )}
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
