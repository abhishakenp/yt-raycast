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
 * LendingStats — Swiss-fintech track-record split for a lending or fintech
 * marketing page. An asymmetric 5/7 split: the left column carries a mono index
 * eyebrow, a heading + supporting paragraph, and a 2x2 collapsed-border stat
 * ledger whose cells share hairline rules and each carry a giant tabular-nums
 * figure over a mono uppercase label. The wider right column frames a sharp
 * bordered photo with a hard offset shadow, overlaid by a floating hairline
 * review card — a primary star row, a quoted testimonial, an avatar, and a
 * mono name/location byline. Use to build trust with track-record numbers and a
 * real-borrower quote on loan, about, or fintech landing pages. All imagery uses
 * the alt-driven Image component. Renders fully with no props via baked-in
 * defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { StarRating } from '#/section-kit/StarRating.tsx'
export const LendingStats = defineCapsule({
  name: 'LendingStats',
  description:
    'Swiss-fintech track-record split for a lending or fintech marketing page: an asymmetric 5/7 split — the left column has a mono index eyebrow, a heading + supporting paragraph and a 2x2 collapsed-border stat ledger whose cells each carry a giant tabular-nums figure over a mono uppercase label; the wider right column frames a sharp bordered photo with a hard offset shadow, overlaid by a floating hairline review card (primary star row, quoted testimonial, avatar, mono name/location byline). Use to build trust with track-record numbers and a real-borrower quote on loan, about, or fintech landing pages. Imagery uses the alt-driven Image component.',
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
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeading
                align="left"
                eyebrow="01 / Track record"
                title={statsHeading}
                subtitle={statsDesc}
                className="gap-3"
                eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
                titleClassName="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
                subtitleClassName="text-lg leading-relaxed text-muted-foreground"
              />
              <StatGrid
                columns={2}
                className="mt-8 gap-0 border-l border-t border-border"
              >
                {statsItems.map((s) => (
                  <StatItem
                    key={s.label}
                    align="left"
                    className="gap-2 border-b border-r border-border p-6"
                  >
                    <StatValue className="mb-0 text-3xl font-extrabold leading-none tracking-tight text-foreground tabular-nums sm:text-4xl">
                      {s.value}
                    </StatValue>
                    <StatLabel className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {s.label}
                    </StatLabel>
                  </StatItem>
                ))}
              </StatGrid>
            </div>
            <div className="relative lg:col-span-7">
              <div className="relative overflow-hidden border border-foreground shadow-[10px_10px_0_0] shadow-foreground">
                <Image
                  alt={statsImageAlt}
                  w={800}
                  h={600}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <Card className="absolute -bottom-6 -left-4 max-w-xs rounded-none border border-border bg-background shadow-[6px_6px_0_0] shadow-foreground/15">
                <div className="mb-2 flex items-center gap-1">
                  <StarRating rating={5} size="md" color="primary" />
                </div>
                <p className="mb-3 text-sm text-card-foreground">
                  &ldquo;{statsReviewQuote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    alt={statsReviewAvatarAlt}
                    w={100}
                    h={100}
                    className="size-10 rounded-none object-cover"
                  />
                  <div>
                    <div className="text-sm font-medium text-card-foreground">
                      {statsReviewName}
                    </div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
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
