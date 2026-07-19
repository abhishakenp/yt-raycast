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
  HeroMediaPanel,
  HeroSocialProof,
  HeroSocialProofItem,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import {
  LocalServiceBookingButton,
  LocalServiceMutationSpinner,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

/**
 * DentalHero — split, two-column hero for a dental practice / dentist landing
 * page. On a soft muted band with blurred mint blobs: a left text column with a
 * pulsing "now accepting new patients" pill, a big headline whose middle word is
 * accented in the primary color, a lede paragraph, a filled primary "Schedule
 * Your Visit" CTA plus an outlined click-to-call phone button, and a row of
 * check-marked trust badges; the right column shows a rounded treatment-room
 * photo with a floating ratings card (overlapping dentist avatars + a star
 * rating). All CTAs route through useNavigate; imagery uses the alt-driven
 * Image component. Use as the top hero for dentists, dental offices,
 * orthodontists, or family / cosmetic dental clinics.
 */
export const DentalHero = defineCapsule({
  name: 'DentalHero',
  description:
    'Split two-column hero for a dental practice / dentist landing page on a soft muted band with blurred mint blobs: a left text column with a pulsing now-accepting-new-patients pill, a big headline with an accented middle word, a lede paragraph, a filled primary Schedule-Your-Visit CTA plus an outlined click-to-call phone button, and a row of check-marked trust badges; a right column with a rounded treatment-room photo and a floating ratings card showing overlapping dentist avatars and a star rating. CTAs route through useNavigate; imagery uses the Image component. Use as the top hero for dentists, dental offices, orthodontists, or family / cosmetic dental clinics.',
  props: z.object({
    badge: z.string().optional(),
    headingPre: z.string().optional(),
    /** Accented word inside the headline (rendered in the primary color). */
    highlight: z.string().optional(),
    headingPost: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    phone: z.string().optional(),
    imageAlt: z.string().optional(),
    rating: z.string().optional(),
    reviewsLabel: z.string().optional(),
    badges: z.array(z.string()).optional(),
    /** Alt-text for the overlapping avatars in the floating ratings card. */
    avatars: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const heroBadge = props.badge ?? 'Now accepting new patients'
    const heroPre = props.headingPre ?? 'Your smile deserves'
    const heroHighlight = props.highlight ?? 'exceptional'
    const heroPost = props.headingPost ?? 'care'
    const heroSub =
      props.subheading ??
      'Experience modern, gentle dentistry at Bright Smile Dental. Our Portland practice combines cutting-edge technology with compassionate care for the whole family.'
    const heroPrimary = props.primaryCta ?? 'Schedule Your Visit'
    const heroPhone = props.phone ?? '(503) 555-0142'
    const heroImageAlt =
      props.imageAlt ??
      'Modern dental office treatment room with dental chair and equipment'
    const heroRating = props.rating ?? '4.9'
    const heroReviews = props.reviewsLabel ?? 'From 324 reviews'
    const heroBadges = props.badges?.length
      ? props.badges
      : ['Same-day emergencies', 'Insurance accepted', 'Pain-free techniques']
    const avatars = props.avatars?.length
      ? props.avatars
      : [
          'Professional headshot of Dr. Sarah Chen, female dentist in white coat with warm smile',
          'Professional headshot of Dr. Michael Torres, male dentist with friendly confident expression',
          'Professional headshot of Dr. Emily Watson, female dentist with warm approachable smile',
        ]

    const Star = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
      </svg>
    )

    const PhoneIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )

    return (
      <HeroSection
        className={cn('relative overflow-hidden bg-muted', props.className)}
      >
        <div aria-hidden="true" className="absolute inset-0 opacity-30">
          <div className="absolute -right-40 -top-40 size-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -left-20 top-20 size-72 rounded-full bg-secondary/40 blur-3xl" />
        </div>
        <Container size="xl" className="relative py-20 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 shadow-sm">
                <span className="size-2 animate-pulse rounded-full bg-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  {heroBadge}
                </span>
              </div>
              <HeroHeading className="mb-6">
                {heroPre} <HeroHighlight>{heroHighlight}</HeroHighlight>{' '}
                {heroPost}
              </HeroHeading>
              <HeroSubheading className="mx-auto mb-8 mt-0 max-w-xl lg:mx-0">
                {heroSub}
              </HeroSubheading>
              <HeroActions className="mt-0 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                <LocalServiceBookingButton
                  lakebed={lakebed}
                  intentLabel={heroPrimary}
                  service="Dental appointment"
                  source="hero"
                  pendingChildren={
                    <LocalServiceMutationSpinner className="text-primary-foreground" />
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
                >
                  {heroPrimary}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </LocalServiceBookingButton>
                <HeroCta
                  asChild
                  variant="outline"
                  className="gap-2 rounded-full bg-background px-8 py-4 text-lg font-semibold"
                >
                  <button type="button" onClick={() => go(`Call ${heroPhone}`)}>
                    <PhoneIcon className="size-5" />
                    {heroPhone}
                  </button>
                </HeroCta>
              </HeroActions>
              <HeroSocialProof className="mt-10 justify-center gap-6 lg:justify-start">
                {heroBadges.map((b) => (
                  <HeroSocialProofItem key={b}>
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="size-5 text-primary"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{b}</span>
                  </HeroSocialProofItem>
                ))}
              </HeroSocialProof>
            </div>
            <div className="relative">
              <HeroMediaPanel
                alt={heroImageAlt}
                w={1200}
                h={900}

                className="aspect-[4/3] shadow-2xl rounded-3xl"
              />
              <div className="absolute -bottom-6 -left-6 max-w-xs rounded-2xl bg-background p-6 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {avatars.slice(0, 3).map((alt) => (
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
                      <Star className="size-5 text-primary" />
                      <span className="font-bold text-foreground">
                        {heroRating}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {heroReviews}
                    </span>
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
