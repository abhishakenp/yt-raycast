import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Card } from '#/section-kit/Card.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'

/**
 * LendingStats — a stats / about split with a glowing photo and a floating review
 * card, for a lending or fintech marketing page. On the left: a heading,
 * supporting paragraph, and a 2x2 grid of muted stat tiles (big value + label).
 * On the right: a large rounded photo with an overlapping bottom-left review card
 * — five star icons, a quoted testimonial, an avatar, and a name/location. Use to
 * build trust with track-record numbers and a real-borrower quote on loan, about,
 * or fintech landing pages. All imagery uses the alt-driven Image component.
 * Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { StarRating } from '#/section-kit/StarRating.tsx'
export const LendingStats = defineCapsule({
  name: 'LendingStats',
  description:
    'Stats / about split with a photo and a floating review card for a lending or fintech marketing page: left column has a heading, supporting paragraph and a 2x2 grid of muted stat tiles (big value + label); right column is a large rounded photo with an overlapping bottom-left review card — five star icons, a quoted testimonial, an avatar and a name/location. Use to build trust with track-record numbers and a real-borrower quote on loan, about, or fintech landing pages. Imagery uses the alt-driven Image component.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
    imageAlt: z.string().optional(),
    reviewQuote: z.string().optional(),
    reviewName: z.string().optional(),
    reviewMeta: z.string().optional(),
    reviewAvatarAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const statsHeading = props.heading ?? 'Trusted by over 250,000 borrowers'
    const statsDesc =
      props.description ??
      "Since 2019, we've helped people consolidate debt, fund major purchases, and achieve financial goals without the stress of traditional lending."
    const statsItems = props.items?.length
      ? props.items
      : [
          {
            value: '$1.2B+',
            label: 'In loans funded',
          },
          {
            value: '4.9/5',
            label: 'Average rating',
          },
          {
            value: '2 min',
            label: 'Average application',
          },
          {
            value: '24 hrs',
            label: 'Average funding time',
          },
        ]
    const statsImageAlt =
      props.imageAlt ??
      'diverse group of professionals collaborating in modern office setting'
    const statsReviewQuote =
      props.reviewQuote ??
      "ClearLoan helped me consolidate $18,000 in credit card debt. I'm saving $340/month and paying off 3 years sooner."
    const statsReviewName = props.reviewName ?? 'Sarah Mitchell'
    const statsReviewMeta = props.reviewMeta ?? 'San Francisco, CA'
    const statsReviewAvatarAlt =
      props.reviewAvatarAlt ??
      'professional headshot of a smiling woman with brown hair in business attire'
    return (
      <section className={cn('py-24 lg:py-28', props.className)}>
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                align="left"
                title={statsHeading}
                subtitle={statsDesc}
                className="gap-0"
                titleClassName="mb-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
                subtitleClassName="mb-8 text-lg leading-relaxed text-muted-foreground"
              />
              <StatGrid columns={2} className="gap-6">
                {statsItems.map((s) => (
                  <StatItem asChild key={s.label} align="left">
                    <Card variant="muted">
                      <StatValue>{s.value}</StatValue>
                      <StatLabel>{s.label}</StatLabel>
                    </Card>
                  </StatItem>
                ))}
              </StatGrid>
            </div>
            <div className="relative">
              <Image
                alt={statsImageAlt}
                w={800}
                h={600}
                loading="lazy"
                className="w-full rounded-2xl object-cover shadow-lg"
              />
              <Card className="absolute -bottom-6 -left-6 max-w-xs shadow-lg">
                <div className="mb-2 flex items-center gap-1">
                  <StarRating rating={5} size="md" color="chart-4" />
                </div>
                <p className="mb-3 text-sm text-card-foreground">
                  &ldquo;{statsReviewQuote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    alt={statsReviewAvatarAlt}
                    w={100}
                    h={100}
                    className="size-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-sm font-medium text-card-foreground">
                      {statsReviewName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {statsReviewMeta}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
