import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroBadge,
  HeroHeading,
  HeroHighlight,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroMediaPanel,
  HeroSocialProof,
  HeroSocialProofItem,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { DotGrid, Watermark } from '#/section-kit/Decor.tsx'
import {
  LocalServiceBookingButton,
  LocalServiceMutationSpinner,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * CleaningServiceHero — playful-Swiss asymmetric hero for a home-cleaning /
 * maid-service landing page. A 7/5 split on a crisp background with a faint
 * dot-grid wash and a giant ghost sparkle watermark: the left column stacks a
 * slightly rotated mono checkbox trust chip, an oversized extrabold headline
 * whose highlight phrase sits inside a tilted bright primary block, a
 * supporting paragraph, square hard-shadow CTAs with press feedback, and a
 * mono checklist trust row built from bordered checkbox squares. The right
 * column carries the showcase photo in a square 2px frame with a hard offset
 * shadow plus an overlapping, slightly rotated star-rating card (stacked
 * avatars + rating + review count) that stays visible on mobile. Every CTA
 * routes through section-kit route links. Use as the primary above-the-fold
 * hero for residential cleaning companies, maid services, housekeeping
 * platforms, or local home-service brands. Renders fully with no props via
 * baked-in "PureSpace" defaults.
 */
export const CleaningServiceHero = defineCapsule({
  name: 'CleaningServiceHero',
  description:
    'Playful-Swiss asymmetric 7/5 hero for a home-cleaning / maid-service landing page: dot-grid washed background with a giant ghost sparkle watermark, a rotated mono checkbox trust chip, an oversized extrabold headline with a tilted bright primary highlight block, supporting paragraph, square hard-shadow CTAs with press feedback, and a mono checklist trust row of bordered checkbox squares. Right column shows the photo in a square 2px hard-shadow frame with an overlapping rotated star-rating card (stacked avatars, rating, review count). CTAs route through section-kit route links. Use as the primary hero for residential cleaning, maid services, housekeeping, or local home-service brands.',
  props: z.object({
    /** Trust-pill text above the headline. */
    badge: z.string().optional(),
    /** First line of the headline. */
    headingTop: z.string().optional(),
    /** Accent-colored phrase in the headline. */
    highlight: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Alt text driving the showcase hero photo. */
    imageAlt: z.string().optional(),
    /** Star-rating value shown in the floating card. */
    rating: z.string().optional(),
    /** Review-count note under the rating. */
    ratingNote: z.string().optional(),
    /** Trust badges beneath the CTAs. */
    trustBadges: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const badge = props.badge ?? 'Trusted by 10,000+ homes in Seattle'
    const headingTop = props.headingTop ?? 'A cleaner home,'
    const highlight = props.highlight ?? 'without the stress.'
    const subheading =
      props.subheading ??
      'Professional cleaning services tailored to your schedule. From deep cleans to weekly maintenance, our vetted, insured cleaners bring sparkle to every room.'
    const primaryCta = props.primaryCta ?? 'Book Your Cleaning'
    const secondaryCta = props.secondaryCta ?? 'View Pricing'
    const imageAlt =
      props.imageAlt ??
      'Professional cleaner in apron wiping kitchen counter with spray bottle in bright modern home'
    const rating = props.rating ?? '4.9'
    const ratingNote = props.ratingNote ?? 'From 2,847 reviews'
    const trustBadges = props.trustBadges?.length
      ? props.trustBadges
      : ['Vetted Cleaners', 'Insured & Bonded', 'Satisfaction Guarantee']

    const CheckSquare = ({ className }: { className?: string }) => (
      <span
        aria-hidden="true"
        className={cn(
          'grid size-4 shrink-0 place-items-center border-2 border-foreground bg-background text-primary',
          className,
        )}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="square"
        >
          <path d="M3 11l4 4 10-11" />
        </svg>
      </span>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const Star = () => (
      <svg
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="text-primary"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <HeroSection
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <DotGrid
          density="loose"
          tone="faint"
          fade="left"
          className="inset-y-0 right-0 w-1/2"
        />
        <Watermark className="-right-10 top-4 rotate-12 text-[11rem] text-foreground/[0.05] sm:text-[16rem]">
          ✱
        </Watermark>
        <Container size="xl" className="relative py-14 sm:py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="space-y-7 lg:col-span-7">
              <HeroBadge className="inline-flex -rotate-1 items-center gap-2.5 rounded-none border-2 border-foreground bg-background px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-foreground shadow-[3px_3px_0_0] shadow-foreground">
                <CheckSquare />
                {badge}
              </HeroBadge>
              <HeroHeading className="text-[clamp(2.75rem,7vw,5.25rem)] font-extrabold leading-[0.98] tracking-tight text-foreground">
                {headingTop}
                <br />
                <HeroHighlight className="mt-2 inline-block -rotate-1 bg-primary px-3 pb-1 text-primary-foreground">
                  {highlight}
                </HeroHighlight>
              </HeroHeading>
              <HeroSubheading className="mt-0 max-w-lg text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </HeroSubheading>
              <HeroActions className="mt-0 grid grid-cols-1 gap-4 sm:flex sm:flex-row">
                <LocalServiceBookingButton
                  lakebed={lakebed}
                  intentLabel={primaryCta}
                  service="Home cleaning"
                  source="hero"
                  pendingChildren={
                    <LocalServiceMutationSpinner className="text-primary-foreground" />
                  }
                  className="inline-flex items-center justify-center rounded-none border-2 border-foreground bg-primary px-7 py-3.5 text-base font-bold text-primary-foreground shadow-[5px_5px_0_0] shadow-foreground transition-all duration-150 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:pointer-events-none disabled:opacity-70"
                >
                  {primaryCta}
                  <ArrowRight className="ml-2 size-5" />
                </LocalServiceBookingButton>
                <HeroCta
                  asChild
                  className="rounded-none border-2 border-foreground bg-background px-7 py-3.5 text-base font-bold text-foreground transition-all duration-150 hover:bg-foreground hover:text-background active:translate-y-px"
                >
                  <NavbarRouteLink href={secondaryCta}>
                    {secondaryCta}
                  </NavbarRouteLink>
                </HeroCta>
              </HeroActions>
              <HeroSocialProof className="mt-0 flex flex-col items-start justify-start gap-3 border-t border-border pt-5 sm:flex-row sm:flex-wrap sm:gap-x-7">
                {trustBadges.map((item) => (
                  <HeroSocialProofItem
                    key={item}
                    className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground"
                  >
                    <CheckSquare />
                    <span>{item}</span>
                  </HeroSocialProofItem>
                ))}
              </HeroSocialProof>
            </div>
            <div className="relative mb-10 lg:col-span-5 lg:mb-0">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-3 -top-3 h-full w-full rotate-1 border-2 border-foreground/20 bg-primary/5"
              />
              <HeroMediaPanel
                alt={imageAlt}
                w={800}
                h={600}
                className="relative aspect-[4/3] w-full rounded-none border-2 border-foreground shadow-[8px_8px_0_0] shadow-foreground"
              />
              <div className="absolute -bottom-8 left-4 -rotate-2 rounded-none border-2 border-foreground bg-card p-3 shadow-[4px_4px_0_0] shadow-foreground sm:-left-6 sm:p-5">
                <div className="flex items-center gap-3.5">
                  <div className="flex -space-x-3">
                    <Image
                      alt="professional headshot of a smiling woman with dark hair"
                      w={100}
                      h={100}
                      className="size-9 rounded-full border-2 border-card object-cover sm:size-10"
                    />
                    <Image
                      alt="professional headshot of a smiling man with short brown hair"
                      w={100}
                      h={100}
                      className="size-9 rounded-full border-2 border-card object-cover sm:size-10"
                    />
                    <Image
                      alt="professional headshot of a smiling woman with blonde hair"
                      w={100}
                      h={100}
                      className="size-9 rounded-full border-2 border-card object-cover sm:size-10"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Star />
                      <span className="font-mono text-lg font-bold tabular-nums text-card-foreground">
                        {rating}
                      </span>
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {ratingNote}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
