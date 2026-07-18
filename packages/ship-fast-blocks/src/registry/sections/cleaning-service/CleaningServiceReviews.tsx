import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * CleaningServiceReviews — a 6-up customer reviews grid for a home-cleaning / maid-service landing page. A centered heading + lead paragraph above a responsive 2/3-column grid of review cards; each card shows a 5-star rating row (inline filled-star icons), a quoted review paragraph, and an attribution row with a round lazy-loaded avatar + name + meta line. No links — pure social proof. Use for testimonial / review blocks for residential cleaning companies, maid services, or any local home-service brand wanting homeowner credibility. Renders fully with no props via six baked-in default reviews.
 */
import { Container } from '#/section-kit/Container.tsx'
import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'
export const CleaningServiceReviews = defineCapsule({
  name: 'CleaningServiceReviews',
  description:
    'A 6-up customer reviews grid for a home-cleaning / maid-service landing page: centered heading + lead above a responsive 2/3-column grid of review cards. Each card shows a 5-star rating row (inline filled-star icons), a quoted review paragraph, and an attribution row with a round lazy-loaded avatar + name + meta line. No links — pure social proof. Use for testimonial / review blocks for residential cleaning, maid services, or local home-service brands.',
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
    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <TestimonialGrid items={items} columns={3} />
        </Container>
      </section>
    )
  },
})
