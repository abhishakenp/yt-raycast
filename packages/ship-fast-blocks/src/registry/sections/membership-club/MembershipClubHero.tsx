import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  HeroSection,
  HeroHeading,
  HeroHighlight,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroMediaPanel,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * MembershipClubHero — calm, editorial split hero for a private membership club /
 * exclusive community landing page. A two-column layout: on the left an uppercase
 * tracked eyebrow label, a thin display headline with one emphasized (normal-weight)
 * highlight phrase, a relaxed subheading, dual rounded-pill CTAs (solid primary +
 * outlined secondary) and a member-count proof strip; on the right a large rounded
 * lifestyle photo with a floating pull-quote card overlapping its lower-left corner.
 * CTAs route through useNavigate. Use as the trust-building opening section for
 * members clubs, founders/social clubs, professional networks, curated communities
 * or paid community subscriptions. Renders fully with no props.
 */
export const MembershipClubHero = defineCapsule({
  name: 'MembershipClubHero',
  description:
    'Calm, editorial split hero for a private membership club / exclusive community landing page: left column with an uppercase tracked eyebrow label, a thin display headline containing one emphasized (normal-weight) highlight phrase, a relaxed subheading, dual rounded-pill CTAs (solid primary + outlined secondary) and a member-count proof strip; right column with a large rounded lifestyle photo and a floating pull-quote card overlapping its lower-left corner. CTAs route through useNavigate. Use as the trust-building opening section for members clubs, founders/social clubs, professional networks, curated communities or paid community subscriptions.',
  props: z.object({
    eyebrow: z.string().optional(),
    /** Headline text before the emphasized highlight phrase. */
    headingBefore: z.string().optional(),
    /** Phrase rendered with emphasized (normal-weight) highlight. */
    highlight: z.string().optional(),
    /** Headline text after the emphasized highlight phrase. */
    headingAfter: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    imageAlt: z.string().optional(),
    proof: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    quote: z.string().optional(),
    quoteAuthor: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Est. 2019 — Private Collective'
    const headingBefore =
      props.headingBefore ?? 'A private space for people who value '
    const highlight = props.highlight ?? 'depth over breadth'
    const headingAfter = props.headingAfter ?? ''
    const subheading =
      props.subheading ??
      'The Guild is a curated membership of 500 professionals, founders, and creatives. We host intimate dinners, workshops, and retreats designed for genuine connection.'
    const primaryCta = props.primaryCta ?? 'Apply for Membership'
    const secondaryCta = props.secondaryCta ?? 'Explore Benefits'
    const imageAlt =
      props.imageAlt ??
      'group of professionals having an engaging conversation in a modern airy loft space with large windows'
    const proof = props.proof?.length
      ? props.proof
      : [
          { value: '487', label: 'Members' },
          { value: '12', label: 'Cities Worldwide' },
        ]
    const quote =
      props.quote ??
      "The quality of conversations here is unlike anything I've found elsewhere."
    const quoteAuthor =
      props.quoteAuthor ?? '— Sarah Chen, Product Lead at Stripe'

    return (
      <HeroSection
        className={cn('w-full bg-background', props.className)}
        aria-labelledby="hero-heading"
      >
        <Container size="xl" className="py-20 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="space-y-8">
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                {eyebrow}
              </p>
              <HeroHeading id="hero-heading" className="font-light">
                {headingBefore}
                <HeroHighlight className="font-normal text-foreground">
                  {highlight}
                </HeroHighlight>
                {headingAfter}
              </HeroHeading>
              <HeroSubheading>{subheading}</HeroSubheading>
              <HeroActions className="flex-col gap-4 pt-4 sm:flex-row">
                <HeroCta
                  asChild
                  variant="primary"
                  className="rounded-full px-8 py-4 text-base"
                >
                  <button type="button" onClick={() => go(primaryCta)}>
                    {primaryCta}
                  </button>
                </HeroCta>
                <HeroCta
                  asChild
                  variant="outline"
                  className="rounded-full bg-card px-8 py-4 text-base"
                >
                  <button type="button" onClick={() => go(secondaryCta)}>
                    {secondaryCta}
                  </button>
                </HeroCta>
              </HeroActions>
              <div className="flex items-center gap-6 pt-6 text-sm text-muted-foreground">
                {proof.map((p) => (
                  <div key={p.label} className="flex items-center gap-2">
                    <span className="text-xl font-light text-foreground">
                      {p.value}
                    </span>
                    <span>{p.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <HeroMediaPanel
                alt={imageAlt}
                w={800}
                h={600}
                rounded="xl"
                className="h-80 w-full shadow-xl lg:h-[500px]"
              />
              <div className="absolute -bottom-6 -left-6 hidden max-w-xs rounded-xl bg-card p-6 shadow-lg lg:block">
                <p className="text-sm italic text-muted-foreground">
                  &ldquo;{quote}&rdquo;
                </p>
                <p className="mt-3 text-sm font-medium text-foreground">
                  {quoteAuthor}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
