import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroHeading,
  HeroHighlight,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroSocialProof,
  HeroSocialProofItem,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { StarRating } from '#/section-kit/StarRating.tsx'

/**
 * InsuranceHero — two-column hero band for an insurance / fintech landing page.
 * On a soft muted canvas: a left column with a star rating pill, a bold headline
 * with one brand-accent highlighted word, a lede paragraph, dual CTAs (solid
 * primary + outline secondary), and an inline trust checklist; a right column
 * with a tilted gradient panel behind a rounded family photo, plus a floating
 * social-proof card (overlapping avatars, happy-customer count, star rating).
 * All links route through useNavigate; imagery is alt-driven <Image>. Use as the
 * top-of-page hero for insurance carriers, insurtech, brokers, or financial-
 * protection products. Renders fully with no props via baked-in defaults.
 */
export const InsuranceHero = defineCapsule({
  name: 'InsuranceHero',
  description:
    'Two-column hero band for an insurance / fintech landing page on a soft muted canvas: a left column with a star rating pill, a bold headline with one brand-accent highlighted word, a lede paragraph, dual CTAs (solid primary + outline secondary with a play icon), and an inline trust checklist; a right column with a tilted gradient panel behind a rounded family photo plus a floating social-proof card (overlapping customer avatars, happy-customer count, star rating). Links route through useNavigate; imagery is alt-driven Image. Use as the top-of-page hero for insurance carriers, insurtech startups, brokers, or financial-protection products.',
  props: z.object({
    /** Star rating pill above the headline. */
    ratingPill: z.string().optional(),
    /** Headline text before the highlighted word. */
    headingBefore: z.string().optional(),
    /** Word rendered in the brand-accent color inside the headline. */
    highlight: z.string().optional(),
    /** Headline text after the highlighted word. */
    headingAfter: z.string().optional(),
    /** Lede paragraph under the headline. */
    subheading: z.string().optional(),
    /** Primary (solid) CTA label. */
    primaryCta: z.string().optional(),
    /** Secondary (outline) CTA label. */
    secondaryCta: z.string().optional(),
    /** Alt text driving the hero photo. */
    imageAlt: z.string().optional(),
    /** Inline trust badges below the CTAs. */
    trustItems: z.array(z.string()).optional(),
    /** Alt strings for the overlapping social-proof avatars. */
    proofAvatars: z.array(z.string()).optional(),
    /** Social-proof count (e.g. "12,000+"). */
    proofCount: z.string().optional(),
    /** Social-proof label (e.g. "Happy customers"). */
    proofLabel: z.string().optional(),
    /** Social-proof star rating (e.g. "4.9/5"). */
    proofRating: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const ratingPill = props.ratingPill ?? 'Rated 4.9/5 by 12,000+ customers'
    const headingBefore = props.headingBefore ?? 'Insurance that actually'
    const highlight = props.highlight ?? 'protects'
    const headingAfter = props.headingAfter ?? 'what you value'
    const subheading =
      props.subheading ??
      'Get personalized coverage for your home, auto, life, and health in under 2 minutes. Join 50,000+ families who trust SecureLife to safeguard their future.'
    const primaryCta = props.primaryCta ?? 'Get Your Free Quote'
    const secondaryCta = props.secondaryCta ?? 'See How It Works'
    const imageAlt =
      props.imageAlt ??
      'Happy family standing in front of their modern home with garden'
    const trustItems = props.trustItems?.length
      ? props.trustItems
      : ['No credit check required', 'Cancel anytime']
    const proofAvatars = props.proofAvatars?.length
      ? props.proofAvatars
      : [
          'Portrait headshot of a friendly woman, satisfied customer',
          'Portrait headshot of a friendly man, satisfied customer',
          'Portrait headshot of a smiling person, satisfied customer',
        ]
    const proofCount = props.proofCount ?? '12,000+'
    const proofLabel = props.proofLabel ?? 'Happy customers'
    const proofRating = props.proofRating ?? '4.9/5'

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

    const Check = ({ className }: { className?: string }) => (
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
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <HeroSection
        className={cn('relative overflow-hidden bg-muted', props.className)}
      >
        <Container size="xl" className="py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
                <Star className="size-4 text-primary" />
                {ratingPill}
              </div>
              <HeroHeading>
                {headingBefore} <HeroHighlight>{highlight}</HeroHighlight>{' '}
                {headingAfter}
              </HeroHeading>
              <HeroSubheading className="mt-0 max-w-xl">
                {subheading}
              </HeroSubheading>
              <HeroActions className="mt-0 flex flex-col gap-4 sm:flex-row">
                <HeroCta
                  asChild
                  variant="primary"
                  className="gap-2 rounded-xl px-8 py-4 text-base font-semibold shadow-lg shadow-primary/25 transition-all"
                >
                  <button type="button" onClick={() => go(primaryCta)}>
                    {primaryCta}
                    <ArrowRight />
                  </button>
                </HeroCta>
                <HeroCta
                  asChild
                  variant="outline"
                  className="gap-2 rounded-xl px-8 py-4 text-base font-semibold transition-all"
                >
                  <button type="button" onClick={() => go(secondaryCta)}>
                    <svg
                      className="size-5 text-primary"
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
                      <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {secondaryCta}
                  </button>
                </HeroCta>
              </HeroActions>
              <HeroSocialProof className="mt-0 gap-6">
                {trustItems.map((item) => (
                  <HeroSocialProofItem key={item}>
                    <Check className="size-5 text-primary" />
                    <span>{item}</span>
                  </HeroSocialProofItem>
                ))}
              </HeroSocialProof>
            </div>
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute inset-0 rotate-3 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/40"
              />
              <Image
                alt={imageAlt}
                w={800}
                h={600}
                className="relative w-full rounded-2xl object-cover shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 max-w-xs rounded-xl bg-card p-4 shadow-xl sm:p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {proofAvatars.map((alt) => (
                      <Image
                        key={alt}
                        alt={alt}
                        w={100}
                        h={100}
                        className="size-10 rounded-full border-2 border-card object-cover"
                      />
                    ))}
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-card-foreground">
                      {proofCount}
                    </p>
                    <p className="text-muted-foreground">{proofLabel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <StarRating rating={5} size="md" color="primary" />
                  <span className="ml-2 font-semibold text-card-foreground">
                    {proofRating}
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
