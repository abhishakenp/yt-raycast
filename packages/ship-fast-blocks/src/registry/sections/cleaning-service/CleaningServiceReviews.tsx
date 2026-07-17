import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * CleaningServiceReviews — a 6-up customer reviews grid for a home-cleaning / maid-service landing page. A centered heading + lead paragraph above a responsive 2/3-column grid of review cards; each card shows a 5-star rating row (inline filled-star icons), a quoted review paragraph, and an attribution row with a round lazy-loaded avatar + name + meta line. No links — pure social proof. Use for testimonial / review blocks for residential cleaning companies, maid services, or any local home-service brand wanting homeowner credibility. Renders fully with no props via six baked-in default reviews.
 */
import { Container } from '#/section-kit/Container.tsx'
import { Card } from '#/section-kit/Card.tsx'
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
    const Star = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="text-primary"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )
    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((review) => (
              <Card
                key={review.name}
                variant="muted"
                rounded="2xl"
                padding="lg"
                className="bg-muted/40"
              >
                <div className="mb-4 flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <Star key={n} />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-foreground/80">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <Image
                    alt={review.avatarAlt}
                    w={100}
                    h={100}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">
                      {review.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {review.meta}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
