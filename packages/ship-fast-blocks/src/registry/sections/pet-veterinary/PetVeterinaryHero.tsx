import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
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

/**
 * PetVeterinaryHero — split, two-column hero for a veterinary clinic / pet
 * healthcare landing page on a soft primary-tinted gradient band. A left text
 * column with a pulsing "now accepting new patients" pill, a big headline whose
 * trailing phrase is accented in the primary color, a lede paragraph, a filled
 * primary "Schedule a Visit" CTA plus an outlined "Explore Services" button, and
 * a social-proof row of overlapping staff avatars + a star-rating note; the right
 * column shows a rounded clinic photo with two floating info chips ("same-day
 * appointments" / "open 7 days"). CTAs route through useNavigate; imagery uses
 * the alt-driven Image component. Use as the top hero for veterinary clinics,
 * animal hospitals, pet healthcare practices, or emergency animal care.
 */
export const PetVeterinaryHero = defineCapsule({
  name: 'PetVeterinaryHero',
  description:
    'Split two-column hero for a veterinary clinic / pet healthcare landing page on a soft primary-tinted gradient band: a left text column with a pulsing now-accepting-new-patients pill, a big headline with an accented trailing phrase, a lede paragraph, a filled primary Schedule-a-Visit CTA plus an outlined Explore-Services button, and a social-proof row of overlapping staff avatars and a star-rating note; a right column with a rounded clinic photo and two floating info chips (same-day appointments / open 7 days). CTAs route through useNavigate; imagery uses the Image component. Use as the top hero for veterinary clinics, animal hospitals, pet healthcare practices, or emergency animal care.',
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
    const go = useNavigate()
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
        className={cn(
          'relative overflow-hidden bg-gradient-to-b from-primary/10 to-background',
          props.className,
        )}
      >
        <Container size="xl" className="py-20 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="max-w-2xl">
              <HeroBadge
                variant="pulsing-dot"
                className="mb-8 bg-background shadow-sm"
              >
                <span className="size-2 animate-pulse rounded-full bg-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  {heroBadge}
                </span>
              </HeroBadge>
              <HeroHeading className="mb-6">
                {heroHeadingTop} <HeroHighlight>{heroHighlight}</HeroHighlight>
              </HeroHeading>
              <HeroSubheading className="mb-8 mt-0 lg:text-xl">
                {heroSub}
              </HeroSubheading>
              <HeroActions className="mb-12 flex-col gap-4 sm:flex-row">
                <HeroCta
                  asChild
                  variant="primary"
                  className="gap-2 rounded-xl px-8 py-4 text-base font-semibold transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <button type="button" onClick={() => go(heroPrimary)}>
                    {heroPrimary}
                    <ArrowRight />
                  </button>
                </HeroCta>
                <HeroCta
                  asChild
                  variant="outline"
                  className="rounded-xl border-2 border-border bg-card px-8 py-4 text-base font-semibold transition-all hover:border-primary/40 hover:bg-primary/5"
                >
                  <button type="button" onClick={() => go(heroSecondary)}>
                    {heroSecondary}
                  </button>
                </HeroCta>
              </HeroActions>
              <div className="flex flex-wrap items-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {avatars.slice(0, 3).map((alt) => (
                      <Image
                        key={alt}
                        alt={alt}
                        w={100}
                        h={100}
                        className="size-8 rounded-full border-2 border-background object-cover"
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{staffCount}</strong>{' '}
                    {staffNote}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="size-5 text-chart-4" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{rating}</strong>{' '}
                    {ratingNote}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <HeroMediaPanel alt={heroImageAlt} w={800} h={600} />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent"
                />
              </div>
              {heroChips[0] && (
                <div className="absolute -bottom-6 -left-6 rounded-xl bg-card p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                      <Check className="size-6" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {heroChips[0].title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {heroChips[0].subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {heroChips[1] && (
                <div className="absolute -right-4 -top-4 rounded-xl bg-card p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <span className="grid size-12 place-items-center rounded-full bg-accent text-accent-foreground">
                      <svg
                        width="24"
                        height="24"
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
                      <p className="text-sm font-semibold text-foreground">
                        {heroChips[1].title}
                      </p>
                      <p className="text-xs text-muted-foreground">
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
