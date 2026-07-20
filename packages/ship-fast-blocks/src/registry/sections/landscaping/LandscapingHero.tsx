import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroMediaPanel,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { StarRating } from '#/section-kit/StarRating.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * LandscapingHero — organic-editorial opening hero for a landscaping / outdoor-
 * design company on a layered muted wash. An asymmetric 5:7 split: on the left a
 * hairline mono index rail ("01 / OUTDOOR DESIGN"), a large tight-tracked
 * headline, a supporting paragraph, a pair of square editorial CTAs (filled sage
 * primary + outlined secondary, both with mechanical press feedback), and a
 * star-rated social-proof row with overlapping customer avatars; on the right a
 * tall garden photo in a sharp offset double frame (rounded-none) with a
 * botanical mono plate caption and a hard-shadowed "projects completed" stat
 * card overlapping its lower-left corner, all over a giant faint "01" watermark
 * numeral. Sage-green accent kept under ~5%, amber stars, tokens-only so it
 * adapts to light/dark; CTAs route through section-kit route links and imagery
 * uses the alt-driven Image component. Use as the opening hero for landscapers,
 * lawn-care and yard-maintenance services, garden designers or hardscaping
 * contractors. Renders fully with no props via baked-in "Earth & Edge" defaults.
 */
export const LandscapingHero = defineCapsule({
  name: 'LandscapingHero',
  description:
    'Organic-editorial opening hero for a landscaping / outdoor-design company on a layered muted wash: an asymmetric 5:7 split with a hairline mono index rail, a large tight-tracked headline, a supporting paragraph, a pair of square editorial CTAs (filled sage primary like Request Free Consultation + outlined secondary like View Our Work, both with mechanical press feedback), and a star-rated social-proof row with overlapping customer avatars on the left; on the right a tall garden photo in a sharp offset double frame (rounded-none) with a botanical mono plate caption and a hard-shadowed projects-completed stat card overlapping its lower-left corner, over a giant faint watermark numeral. Sage-green accent kept restrained, amber stars, tokens-only for light/dark; CTAs route through section-kit route links and imagery uses the alt-driven Image component. Use as the opening hero for landscapers, lawn-care and yard-maintenance services, garden designers or hardscaping contractors.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    rating: z.string().optional(),
    imageAlt: z.string().optional(),
    statValue: z.string().optional(),
    statLabel: z.string().optional(),
    /** Alt strings for the small customer avatars on the social-proof row. */
    avatars: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading =
      props.heading ?? 'Transform your outdoor space into a living sanctuary'
    const subheading =
      props.subheading ??
      'Award-winning landscape design and maintenance services for Portland homes and businesses. Over 500 completed projects since 2008. Licensed, insured, and committed to sustainable practices.'
    const primaryCta = props.primaryCta ?? 'Request Free Consultation'
    const secondaryCta = props.secondaryCta ?? 'View Our Work'
    const rating = props.rating ?? '4.9/5 from 127 reviews'
    const imageAlt =
      props.imageAlt ??
      'Modern landscaped garden with curved stone pathway, ornamental grasses, and native plants'
    const statValue = props.statValue ?? '500+'
    const statLabel = props.statLabel ?? 'Projects Completed'
    const avatars = props.avatars?.length
      ? props.avatars
      : [
          'Headshot of a smiling male customer with short brown hair',
          'Headshot of a smiling female customer with blonde hair',
          'Headshot of a smiling older male customer with glasses',
        ]

    return (
      <HeroSection
        className={cn('relative overflow-hidden bg-muted/40', props.className)}
      >
        {/* Layered organic washes + giant faint index watermark. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute inset-y-0 right-0 w-1/2 bg-muted/40" />
          <Watermark className="-left-6 bottom-[-3rem] text-[11rem] leading-none sm:text-[16rem] lg:text-[22rem]">
            01
          </Watermark>
        </div>

        <Container size="xl" className="relative py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="space-y-8 lg:col-span-5">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="size-1.5 bg-primary" />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  01 / Outdoor Design
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
              </div>
              <HeroHeading className="font-semibold leading-[1.05] tracking-tight">
                {heading}
              </HeroHeading>
              <HeroSubheading className="max-w-xl">{subheading}</HeroSubheading>
              <HeroActions className="gap-4">
                <HeroCta
                  asChild
                  variant="primary"
                  className="rounded-none px-7 py-3.5 text-base font-medium shadow-[5px_5px_0_0] shadow-primary/25 transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
                >
                  <NavbarRouteLink href={primaryCta}>
                    {primaryCta}
                  </NavbarRouteLink>
                </HeroCta>
                <HeroCta
                  asChild
                  variant="outline"
                  className="rounded-none border-foreground bg-background px-7 py-3.5 text-base font-medium text-foreground transition-[transform,background-color] duration-150 hover:bg-muted active:translate-y-px motion-reduce:transform-none"
                >
                  <NavbarRouteLink href={secondaryCta}>
                    {secondaryCta}
                  </NavbarRouteLink>
                </HeroCta>
              </HeroActions>
              <div className="flex items-center gap-6 border-t border-border pt-6">
                <div className="flex -space-x-2">
                  {avatars.map((alt) => (
                    <Image
                      key={alt}
                      alt={alt}
                      w={100}
                      h={100}
                      className="size-10 rounded-full border-2 border-background object-cover"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <StarRating rating={5} size="sm" color="chart-4" />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{rating}</p>
                </div>
              </div>
            </div>

            <div className="relative lg:col-span-7">
              {/* Offset frame plate behind the photo (sharp, tokenized). */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 translate-x-4 translate-y-4 border border-foreground/20 bg-primary/[0.04]"
              />
              <div className="relative">
                <HeroMediaPanel
                  alt={imageAlt}
                  w={900}
                  h={640}
                  className="h-[380px] w-full rounded-none border border-foreground/10 lg:h-[520px]"
                />
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 bg-background/85 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-sm"
                >
                  Fig. 01 / Selected work
                </span>
              </div>
              <div className="absolute -bottom-5 -left-4 hidden border border-foreground/15 bg-card px-6 py-5 shadow-[6px_6px_0_0] shadow-foreground/10 sm:block">
                <p className="text-4xl font-semibold tabular-nums tracking-tight text-primary">
                  {statValue}
                </p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {statLabel}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
