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
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * PetVeterinaryHero — warm friendly-clinical asymmetric 7/5 hero for a
 * veterinary clinic / pet-healthcare landing page. On an airy background with a
 * soft warm wash and a giant ghost "care" watermark: a left column carries a
 * rounded-full sticker chip (pulsing primary dot + "now accepting new patients"
 * micro-label), a big fluid extrabold headline whose trailing phrase is accented
 * in the primary color, a lede paragraph, a pair of rounded-full pill CTAs with
 * hard offset shadows and press feedback (filled-primary "Schedule a Visit" +
 * outlined "Explore Services"), and a hairline-topped social-proof row of
 * hairline-framed staff avatars and a star-rating note; the right column shows a
 * chunky rounded-none clinic photo double-framed with a hard offset shadow, a
 * rotated rounded-full "24/7 care" sticker, and two chunky info cards overlapping
 * its corners (same-day appointments / open 7 days). CTAs route through
 * section-kit route links; imagery uses the alt-driven Image component. Use as
 * the top hero for veterinary clinics, animal hospitals, pet healthcare
 * practices, or emergency animal care.
 */
export const PetVeterinaryHero = defineCapsule({
  name: 'PetVeterinaryHero',
  description:
    'Warm friendly-clinical asymmetric 7/5 hero for a veterinary clinic / pet-healthcare landing page on an airy band with a soft warm wash and a giant ghost "care" watermark: a left column with a rounded-full sticker chip (pulsing primary dot + now-accepting-new-patients micro-label), a big fluid extrabold headline with an accented trailing phrase, a lede paragraph, a pair of rounded-full pill CTAs with hard offset shadows and press feedback (filled primary Schedule-a-Visit + outlined Explore-Services), and a hairline-topped social-proof row of hairline-framed staff avatars and a star-rating note; a right column with a chunky rounded-none clinic photo double-framed with a hard offset shadow, a rotated rounded-full 24/7-care sticker, and two chunky info cards overlapping its corners (same-day appointments / open 7 days). CTAs route through section-kit route links; imagery uses the Image component. Use as the top hero for veterinary clinics, animal hospitals, pet healthcare practices, or emergency animal care.',
  props: z.object({
    badge: z.string().optional(),
    headingTop: z.string().optional(),
    /** Phrase rendered in the primary accent color. */
    highlight: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    /** Bold lead-in for the staff social-proof note (e.g. "15+"). */
    staffCount: z.string().optional(),
    /** Trailing text after the staff count (e.g. "expert staff"). */
    staffNote: z.string().optional(),
    /** Bold rating value in the star note (e.g. "4.9/5"). */
    rating: z.string().optional(),
    /** Trailing reviews text after the rating (e.g. "from 2,400+ reviews"). */
    ratingNote: z.string().optional(),
    imageAlt: z.string().optional(),
    /** Alt-text for the overlapping staff avatars in the social-proof row. */
    avatars: z.array(z.string()).optional(),
    /** Floating info chips overlaid on the hero photo. */
    chips: z
      .array(z.object({ title: z.string(), subtitle: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heroBadge = props.badge ?? 'Now accepting new patients'
    const heroHeadingTop = props.headingTop ?? 'Expert care for your'
    const heroHighlight = props.highlight ?? 'beloved companions'
    const heroSub =
      props.subheading ??
      'At Paws & Care Veterinary Clinic, we treat every pet like family. From routine checkups to advanced surgical procedures, our experienced team provides compassionate, comprehensive healthcare for dogs, cats, and exotic pets throughout Portland.'
    const heroPrimary = props.primaryCta ?? 'Schedule a Visit'
    const heroSecondary = props.secondaryCta ?? 'Explore Services'
    const staffCount = props.staffCount ?? '15+'
    const staffNote = props.staffNote ?? 'expert staff'
    const rating = props.rating ?? '4.9/5'
    const ratingNote = props.ratingNote ?? 'from 2,400+ reviews'
    const heroImageAlt =
      props.imageAlt ??
      'golden retriever dog receiving gentle examination from a veterinarian in a modern clinic'
    const avatars = props.avatars?.length
      ? props.avatars
      : [
          'professional headshot of Dr. Sarah Mitchell, lead veterinarian, a woman with warm smile wearing a white coat',
          'professional headshot of Dr. James Chen, surgical specialist, a man with confident expression in medical scrubs',
          'professional headshot of Dr. Emily Rodriguez, exotic pet specialist, a woman with friendly demeanor',
        ]
    const heroChips = props.chips?.length
      ? props.chips
      : [
          {
            title: 'Same-day appointments',
            subtitle: 'Available for urgent care',
          },
          { title: 'Open 7 days', subtitle: '8AM - 8PM daily' },
        ]

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
        <line x1="3" y1="12" x2="21" y2="12" />
        <polyline points="14 5 21 12 14 19" />
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
        <polyline points="20 6 9 17 4 12" />
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
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden border-b border-border bg-background',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-2/3 bg-gradient-to-b from-primary/[0.07] to-transparent"
        />
        <Watermark className="-top-10 right-[-3rem] text-[9rem] lowercase sm:right-[-4rem] sm:text-[14rem] lg:-top-16 lg:text-[19rem]">
          care
        </Watermark>
        <Container size="xl" className="relative py-16 sm:py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="max-w-2xl lg:col-span-7">
              <HeroBadge
                variant="pulsing-dot"
                className="mb-7 rounded-full border-2 border-foreground/15 bg-card px-4 py-2 shadow-[3px_3px_0_0] shadow-foreground/10"
              >
                <span
                  aria-hidden="true"
                  className="size-2 animate-pulse rounded-full bg-primary"
                />
                <MonoTag className="text-[11px] tracking-[0.14em]">
                  {heroBadge}
                </MonoTag>
              </HeroBadge>
              <HeroHeading className="mb-6 text-[clamp(2.5rem,6vw,4.75rem)] font-extrabold leading-[0.98] tracking-tight text-balance">
                {heroHeadingTop} <HeroHighlight>{heroHighlight}</HeroHighlight>
              </HeroHeading>
              <HeroSubheading className="mb-8 mt-0 max-w-xl text-base leading-relaxed sm:text-lg">
                {heroSub}
              </HeroSubheading>
              <HeroActions className="mb-10 flex-col gap-3 sm:flex-row sm:gap-4">
                <HeroCta
                  asChild
                  variant="primary"
                  className="gap-2 rounded-full px-7 py-3.5 text-base font-semibold shadow-[4px_4px_0_0] shadow-foreground/20 transition-colors hover:bg-primary active:translate-y-px active:shadow-none"
                >
                  <NavbarRouteLink href={heroPrimary}>
                    {heroPrimary}
                    <ArrowRight />
                  </NavbarRouteLink>
                </HeroCta>
                <HeroCta
                  asChild
                  variant="outline"
                  className="rounded-full border-2 border-foreground/20 bg-background px-7 py-3.5 text-base font-semibold transition-colors hover:bg-muted active:translate-y-px"
                >
                  <NavbarRouteLink href={heroSecondary}>
                    {heroSecondary}
                  </NavbarRouteLink>
                </HeroCta>
              </HeroActions>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-t-2 border-foreground/10 pt-6 text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {avatars.slice(0, 3).map((alt) => (
                      <Image
                        key={alt}
                        alt={alt}
                        w={100}
                        h={100}
                        className="size-9 rounded-full border-2 border-background object-cover"
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground">
                    <strong className="font-bold text-foreground tabular-nums">
                      {staffCount}
                    </strong>{' '}
                    {staffNote}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="size-5 text-primary" />
                  <span className="text-muted-foreground">
                    <strong className="font-bold text-foreground tabular-nums">
                      {rating}
                    </strong>{' '}
                    {ratingNote}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative lg:col-span-5">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-3 border-2 border-foreground/10 sm:-inset-4"
              />
              <div className="relative overflow-hidden rounded-none border-2 border-foreground/15 shadow-[10px_10px_0_0] shadow-foreground/15">
                <HeroMediaPanel
                  alt={heroImageAlt}
                  w={800}
                  h={600}
                  className="rounded-none"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent"
                />
              </div>
              <span
                aria-hidden="true"
                className="absolute -left-3 -top-4 -rotate-6 rounded-full border-2 border-foreground bg-background px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground shadow-[3px_3px_0_0] shadow-primary/40"
              >
                24/7 care
              </span>
              {heroChips[0] && (
                <div className="absolute -bottom-5 -left-4 rounded-none border-2 border-foreground/15 bg-card p-4 shadow-[5px_5px_0_0] shadow-foreground/15 sm:-left-6">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Check className="size-6" />
                    </span>
                    <div>
                      <p className="text-sm font-bold tracking-tight text-foreground">
                        {heroChips[0].title}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {heroChips[0].subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {heroChips[1] && (
                <div className="absolute -right-4 -top-3 rounded-none border-2 border-foreground/15 bg-card p-4 shadow-[5px_5px_0_0] shadow-foreground/15">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <polyline points="12 8 12 12 15 15" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-bold tracking-tight text-foreground">
                        {heroChips[1].title}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {heroChips[1].subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
