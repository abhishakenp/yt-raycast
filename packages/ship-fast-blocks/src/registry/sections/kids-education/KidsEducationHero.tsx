import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroBadge,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroSocialProof,
  HeroSocialProofItem,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * KidsEducationHero — playful-primary split hero for a kids / family learning
 * platform under a giant ghost watermark, on an asymmetric 7:5 grid. Left side:
 * a rotated sticker status pill (pulsing dot), an extrabold headline whose
 * highlight word sits on a tilted bg-primary marker block, a supporting
 * paragraph, dual sharp-cornered block CTAs (dark primary with arrow + outlined
 * play-icon secondary, both with hard offset token shadows and mechanical press
 * feedback), and an inline trust-points row with check icons. Right side: the
 * hero photo in a tilted 2px-bordered sharp plate floating over a primary-tinted
 * offset frame, plus two sharp-bordered sticker cards with hard shadows — a
 * star-rating card bottom-left and an avatar-stack "+2k today" card top-right.
 * Every CTA routes through section-kit route links. Use as the opening hero for
 * kids-education startups, children's e-learning, family learning apps, and
 * playful course platforms. Renders fully with no props via baked-in
 * "WonderLearn" defaults.
 */
export const KidsEducationHero = defineCapsule({
  name: 'KidsEducationHero',
  description:
    "Playful-primary split hero for a kids / family learning platform under a giant ghost watermark on an asymmetric 7:5 grid: left side with a rotated sticker status pill (pulsing dot), an extrabold headline whose highlight word sits on a tilted bg-primary marker block, a supporting paragraph, dual sharp-cornered block CTAs (dark primary with arrow + outlined play-icon secondary, hard offset token shadows + press feedback), and an inline trust-points row with check icons; right side with the hero photo in a tilted 2px-bordered sharp plate floating over a primary-tinted offset frame, plus two sharp-bordered sticker cards with hard shadows (a star-rating card bottom-left and an avatar-stack '+2k today' card top-right). CTAs route through section-kit route links. Use as the opening hero for kids-education startups, children's e-learning, family learning apps, and playful course platforms.",
  props: z.object({
    /** Live-learners status pill text. */
    badge: z.string().optional(),
    /** First heading line (before the highlight). */
    headingTop: z.string().optional(),
    /** Phrase rendered with the amber-green gradient highlight. */
    highlight: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Alt text driving the large hero photo. */
    imageAlt: z.string().optional(),
    /** Floating rating-card headline value. */
    ratingValue: z.string().optional(),
    /** Floating rating-card sub-label. */
    ratingLabel: z.string().optional(),
    /** Avatar-stack card badge text. */
    avatarBadge: z.string().optional(),
    /** Trust-points row beneath the CTAs. */
    trustPoints: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const badge = props.badge ?? 'Join 50,000+ happy learners'
    const headingTop = props.headingTop ?? 'Learning is an'
    const highlight = props.highlight ?? 'adventure'
    const subheading =
      props.subheading ??
      'Engaging, play-based activities designed for curious minds ages 4-12. Science experiments, art projects, coding games, and more—delivered daily.'
    const primaryCta = props.primaryCta ?? 'Start Free 14-Day Trial'
    const secondaryCta = props.secondaryCta ?? 'See Activities'
    const imageAlt =
      props.imageAlt ??
      'Happy children doing a hands-on science experiment with colorful liquids in a bright classroom'
    const ratingValue = props.ratingValue ?? '4.9/5 Rating'
    const ratingLabel = props.ratingLabel ?? 'From 12,000+ parents'
    const avatarBadge = props.avatarBadge ?? '+2k today'
    const trustPoints = props.trustPoints?.length
      ? props.trustPoints
      : ['No credit card required', 'Cancel anytime']

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const PlayIcon = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M10 9l4 3-4 3V9z" fill="currentColor" />
      </svg>
    )

    const CheckCircle = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    )

    return (
      <HeroSection
        className={cn('relative overflow-hidden bg-card', props.className)}
      >
        <Watermark className="-right-8 top-4 text-[7rem] sm:text-[11rem] lg:text-[15rem]">
          LEARN
        </Watermark>
        <Container size="xl" className="relative py-16 lg:py-24">
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
            {/* Copy — the wide 7-col side */}
            <div className="order-1 lg:col-span-7">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <HeroBadge
                  variant="pulsing-dot"
                  className="-rotate-1 gap-2 rounded-full border-2 border-foreground bg-background px-3.5 py-1.5 shadow-[3px_3px_0_0] shadow-primary/40"
                >
                  <span className="size-2 animate-pulse rounded-full bg-primary" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-foreground">
                    {badge}
                  </span>
                </HeroBadge>
                <MonoTag className="hidden sm:inline">Ages 4-12</MonoTag>
              </div>

              <HeroHeading className="mb-5 text-4xl font-extrabold leading-[0.98] tracking-tighter text-foreground sm:text-5xl lg:text-6xl">
                {headingTop}{' '}
                <span className="relative inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute -inset-x-2 inset-y-0.5 -rotate-1 bg-primary"
                  />
                  <span className="relative text-primary-foreground">
                    {highlight}
                  </span>
                </span>
              </HeroHeading>

              <HeroSubheading className="mb-8 mt-0 max-w-xl text-lg">
                {subheading}
              </HeroSubheading>

              <HeroActions className="mt-0 grid grid-cols-1 gap-4 sm:flex sm:flex-wrap">
                <HeroCta
                  asChild
                  className="gap-2 rounded-none border-2 border-foreground bg-foreground px-7 py-3.5 text-base font-bold text-background shadow-[5px_5px_0_0] shadow-primary/40 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0] hover:shadow-primary/40 active:translate-y-px active:shadow-none motion-reduce:transform-none"
                >
                  <NavbarRouteLink href={primaryCta}>
                    {primaryCta}
                    <ArrowRight />
                  </NavbarRouteLink>
                </HeroCta>
                <HeroCta
                  asChild
                  variant="outline"
                  className="gap-2 rounded-none border-2 border-foreground bg-background px-7 py-3.5 text-base font-bold text-foreground shadow-[5px_5px_0_0] shadow-foreground/20 transition-all duration-150 hover:-translate-y-0.5 hover:bg-muted hover:shadow-[6px_6px_0_0] hover:shadow-foreground/20 active:translate-y-px active:shadow-none motion-reduce:transform-none"
                >
                  <NavbarRouteLink href={secondaryCta}>
                    <PlayIcon />
                    {secondaryCta}
                  </NavbarRouteLink>
                </HeroCta>
              </HeroActions>

              <HeroSocialProof className="mt-8 gap-x-6 gap-y-2">
                {trustPoints.map((point) => (
                  <HeroSocialProofItem key={point} className="gap-2">
                    <CheckCircle className="size-5 text-primary" />
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      {point}
                    </span>
                  </HeroSocialProofItem>
                ))}
              </HeroSocialProof>
            </div>

            {/* Media — the narrow 5-col side */}
            <div className="order-2 lg:col-span-5">
              <div className="relative rotate-1 lg:mt-6">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border-2 border-primary/40 bg-primary/10"
                />
                <div className="relative overflow-hidden rounded-none border-2 border-foreground bg-muted">
                  <Image
                    alt={imageAlt}
                    w={800}
                    h={600}
                    loading="eager"
                    className="aspect-[4/3] size-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-5 -left-3 flex -rotate-2 items-center gap-3 rounded-none border-2 border-foreground bg-background p-3.5 shadow-[4px_4px_0_0] shadow-foreground sm:-left-5">
                  <div className="grid size-11 shrink-0 place-items-center rounded-none border-2 border-foreground bg-primary text-primary-foreground">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-extrabold tabular-nums text-foreground">
                      {ratingValue}
                    </p>
                    <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                      {ratingLabel}
                    </p>
                  </div>
                </div>
                <div className="absolute -right-2 -top-4 flex rotate-2 items-center gap-2 rounded-none border-2 border-foreground bg-background p-2.5 shadow-[4px_4px_0_0] shadow-primary/40">
                  <div className="flex -space-x-2">
                    {[
                      'Happy child learning',
                      'Smiling young learner',
                      'Excited student',
                    ].map((a) => (
                      <Image
                        key={a}
                        alt={a}
                        w={100}
                        h={100}
                        className="size-8 rounded-full border-2 border-foreground object-cover"
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-foreground">
                    {avatarBadge}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
