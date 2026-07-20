import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
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
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  LocalServiceBookingButton,
  LocalServiceMutationSpinner,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * DentalHero — clinical Swiss-clean, asymmetric 7/5 hero for a dental practice
 * / dentist landing page. On an airy background with a giant ghost "+" cross
 * watermark: a left column with a square hairline status chip (mono
 * "now accepting new patients" micro-label + single primary dot), a giant
 * fluid-clamp extrabold headline whose middle word is accented in the primary
 * color, a lede paragraph, a square filled-primary "Schedule Your Visit" CTA
 * plus a square hairline click-to-call phone button (both with press
 * feedback), and a hairline ledger row of trust items with primary tick
 * dashes; the right column shows a hairline double-framed treatment-room photo
 * with a square ratings card (overlapping dentist avatars + a star rating in
 * tabular numerals) overlapping its corner. All CTAs route through section-kit
 * route links; imagery uses the alt-driven Image component. Use as the top
 * hero for dentists, dental offices, orthodontists, or family / cosmetic
 * dental clinics.
 */
export const DentalHero = defineCapsule({
  name: 'DentalHero',
  description:
    'Clinical Swiss-clean asymmetric 7/5 hero for a dental practice / dentist landing page: an airy band with a giant ghost "+" cross watermark, a left column with a square hairline status chip (mono now-accepting-new-patients micro-label), a giant fluid extrabold headline with an accented middle word, a lede paragraph, a square filled-primary Schedule-Your-Visit CTA plus a square hairline click-to-call phone button, and a hairline ledger row of trust items with primary tick dashes; a right column with a hairline double-framed treatment-room photo and a square ratings card showing overlapping dentist avatars and a tabular star rating. CTAs route through section-kit route links; imagery uses the Image component. Use as the top hero for dentists, dental offices, orthodontists, or family / cosmetic dental clinics.',
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
        className={cn(
          'relative overflow-hidden border-b border-border bg-background',
          props.className,
        )}
      >
        <Watermark className="-top-16 right-[-4.5rem] text-[14rem] text-foreground/[0.04] sm:right-[-6rem] sm:text-[19rem] lg:-top-24 lg:text-[24rem]">
          +
        </Watermark>
        <Container size="xl" className="relative py-16 sm:py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <div className="mb-7 inline-flex items-center gap-2.5 border border-border bg-background px-3.5 py-2">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-primary"
                />
                <MonoTag>{heroBadge}</MonoTag>
              </div>
              <HeroHeading className="mb-6 max-w-2xl text-[clamp(2.5rem,6vw,4.75rem)] font-extrabold leading-[0.98] tracking-tight">
                {heroPre} <HeroHighlight>{heroHighlight}</HeroHighlight>{' '}
                {heroPost}
              </HeroHeading>
              <HeroSubheading className="mb-9 mt-0 max-w-xl text-base leading-relaxed sm:text-lg">
                {heroSub}
              </HeroSubheading>
              <HeroActions className="mt-0 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <LocalServiceBookingButton
                  lakebed={lakebed}
                  intentLabel={heroPrimary}
                  service="Dental appointment"
                  source="hero"
                  pendingChildren={
                    <LocalServiceMutationSpinner className="text-primary-foreground" />
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-none bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
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
                  className="gap-2 rounded-none border-foreground/25 bg-background px-7 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted active:translate-y-px"
                >
                  <NavbarRouteLink href={`Call ${heroPhone}`}>
                    <PhoneIcon className="size-5" />
                    {heroPhone}
                  </NavbarRouteLink>
                </HeroCta>
              </HeroActions>
              <HeroSocialProof className="mt-12 grid max-w-xl grid-cols-1 gap-0 border-t border-border sm:grid-cols-3">
                {heroBadges.map((b) => (
                  <HeroSocialProofItem
                    key={b}
                    className="gap-3 border-b border-border py-3.5 text-sm text-muted-foreground sm:border-b-0 sm:pr-4"
                  >
                    <span
                      aria-hidden="true"
                      className="h-px w-4 shrink-0 bg-primary"
                    />
                    <span>{b}</span>
                  </HeroSocialProofItem>
                ))}
              </HeroSocialProof>
            </div>
            <div className="relative lg:col-span-5">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-3 border border-border sm:-inset-4"
              />
              <HeroMediaPanel
                alt={heroImageAlt}
                w={1200}
                h={900}
                className="aspect-[4/3] rounded-none border border-border"
              />
              <div className="absolute -bottom-6 -left-3 flex max-w-xs items-center gap-4 border border-border bg-background p-5 sm:-left-10">
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
                  <div className="flex items-center gap-1.5">
                    <Star className="size-4 text-primary" />
                    <span className="text-lg font-extrabold tracking-tight text-foreground tabular-nums">
                      {heroRating}
                    </span>
                  </div>
                  <MonoTag tone="faint" className="tracking-[0.12em]">
                    {heroReviews}
                  </MonoTag>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
