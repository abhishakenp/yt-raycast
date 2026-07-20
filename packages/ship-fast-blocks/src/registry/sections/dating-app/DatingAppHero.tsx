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
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * DatingAppHero — playful-geometric split hero for a dating / matchmaking app.
 * An asymmetric 7:5 grid under a giant ghost "MATCH" watermark: on the left a
 * rounded-full live-matches sticker pill with a 2px foreground border and hard
 * offset shadow, a mono index rail, then a huge extrabold tight-tracked
 * "find someone who [gets you]" headline whose highlight phrase sits on a
 * tilted primary marker block, a supporting paragraph, dual rounded-full pill
 * CTAs (filled primary + outlined) with hard 3px offset shadows and press
 * feedback, and an overlapping rounded-full avatar stack for social proof; on
 * the right the tall photo sits in a sharp 2px-bordered plate tilted 1deg over
 * a primary-tinted offset frame, with a sharp overlaid online profile card and
 * a rotated rounded-full "It's a Match!" heart sticker chip breaching the top
 * corner. Buttons route through section-kit route links and all imagery is
 * alt-driven. Use as the top hero for dating apps, matchmaking services,
 * singles or relationship platforms. Renders fully with no props via baked-in
 * "HeartLink" defaults.
 */
export const DatingAppHero = defineCapsule({
  name: 'DatingAppHero',
  description:
    "Playful-geometric split hero for a dating / matchmaking app: an asymmetric 7:5 grid under a giant ghost 'MATCH' watermark — left has a rounded-full live-matches sticker pill with 2px border and hard offset shadow, a mono index rail, a huge extrabold 'find someone who [highlight]' headline with the accent phrase on a tilted primary marker block, a supporting paragraph, dual rounded-full pill CTAs (filled 'Download Free' + outlined 'See How It Works') with hard offset shadows and press feedback, and an overlapping rounded-full avatar stack; right has the tall photo in a sharp 2px-bordered plate tilted over a primary-tinted offset frame with a sharp overlaid online profile card and a rotated rounded-full 'It's a Match!' heart sticker chip. Buttons route through section-kit route links; all imagery is alt-driven <Image>. Use as the top hero for dating apps, matchmaking services, singles or relationship platforms.",
  props: z.object({
    badge: z.string().optional(),
    /** Heading words before the highlighted phrase. */
    headingPre: z.string().optional(),
    /** Phrase rendered in the rose/primary accent color. */
    highlight: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    socialProof: z.string().optional(),
    /** Alt texts for the stacked social-proof avatars. */
    avatars: z.array(z.string()).optional(),
    /** Alt text for the large hero photo. */
    heroImageAlt: z.string().optional(),
    /** Featured profile card overlay name. */
    profileName: z.string().optional(),
    profileMeta: z.string().optional(),
    /** Alt text for the overlaid profile photo. */
    profileImageAlt: z.string().optional(),
    matchBadge: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heroBadge = props.badge ?? '2.1M+ matches made this month'
    const headingPre = props.headingPre ?? 'Find someone who'
    const heroHighlight = props.highlight ?? 'gets you'
    const heroSub =
      props.subheading ??
      'HeartLink connects you with genuine people looking for real relationships. Our smart matching algorithm finds compatibility beyond the surface—based on values, interests, and relationship goals.'
    const heroPrimary = props.primaryCta ?? 'Download Free'
    const heroSecondary = props.secondaryCta ?? 'See How It Works'
    const heroSocial = props.socialProof ?? 'Join 2M+ singles finding love'
    const avatars = props.avatars?.length
      ? props.avatars
      : [
          'professional headshot of a smiling woman with brown hair',
          'professional headshot of a smiling man with short curly hair',
          'professional headshot of a smiling woman with blonde hair',
          'professional headshot of a smiling man with beard',
        ]
    const heroImageAlt =
      props.heroImageAlt ?? 'happy couple on a coffee date laughing together'
    const profileName = props.profileName ?? 'Sarah, 28'
    const profileMeta = props.profileMeta ?? 'Marketing Manager • 2 miles away'
    const profileImageAlt =
      props.profileImageAlt ??
      'profile photo of Sarah a 28 year old marketing manager'
    const matchBadge = props.matchBadge ?? "It's a Match!"

    const HeartGlyph = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clipRule="evenodd"
        />
      </svg>
    )

    const ChevronDown = ({ className }: { className?: string }) => (
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
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    return (
      <HeroSection className={cn('relative overflow-hidden', props.className)}>
        {/* Giant ghost watermark anchoring the playful-geometric grammar. */}
        <Watermark className="-bottom-6 -right-8 text-[7rem] uppercase sm:text-[12rem] lg:-bottom-14 lg:text-[19rem]">
          Match
        </Watermark>
        <Container size="xl" className="relative pb-16 pt-14 lg:pb-28 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              {/* Rounded-full sticker pill vs sharp structure — binary radius. */}
              <span className="inline-flex -rotate-1 items-center gap-2 rounded-full border-2 border-foreground bg-background px-4 py-1.5 text-sm font-semibold text-foreground shadow-[3px_3px_0_0] shadow-foreground">
                <span
                  aria-hidden="true"
                  className="size-2 animate-pulse rounded-full bg-primary motion-reduce:animate-none"
                />
                {heroBadge}
              </span>
              <div className="mt-6 flex items-center gap-3">
                <MonoTag tone="faint">01 / Meet</MonoTag>
                <span aria-hidden="true" className="h-px w-16 bg-border" />
              </div>
              <HeroHeading className="mt-4 text-5xl font-extrabold leading-[0.95] tracking-tighter text-foreground sm:text-6xl lg:text-7xl">
                {headingPre}{' '}
                <HeroHighlight className="relative inline-block whitespace-nowrap text-primary-foreground">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.12em] inset-y-[0.04em] -rotate-1 bg-primary"
                  />
                  <span className="relative">{heroHighlight}</span>
                </HeroHighlight>
              </HeroHeading>
              <HeroSubheading className="mt-6 max-w-xl text-lg leading-relaxed">
                {heroSub}
              </HeroSubheading>
              <HeroActions className="mt-8 grid grid-cols-1 gap-4 sm:flex sm:flex-row">
                <HeroCta
                  asChild
                  variant="primary"
                  className="gap-2 rounded-full border-2 border-foreground px-7 py-3.5 text-base font-semibold shadow-[3px_3px_0_0] shadow-foreground transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:bg-primary/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
                >
                  <NavbarRouteLink href={heroPrimary}>
                    <HeartGlyph className="size-5" />
                    {heroPrimary}
                  </NavbarRouteLink>
                </HeroCta>
                <HeroCta
                  asChild
                  variant="outline"
                  className="gap-2 rounded-full border-2 border-foreground bg-background px-7 py-3.5 text-base font-semibold text-foreground shadow-[3px_3px_0_0] shadow-foreground transition-[transform,box-shadow,background-color] duration-150 hover:-translate-y-0.5 hover:bg-muted active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
                >
                  <NavbarRouteLink href={heroSecondary}>
                    {heroSecondary}
                    <ChevronDown className="size-5" />
                  </NavbarRouteLink>
                </HeroCta>
              </HeroActions>
              <div className="mt-8 flex items-center gap-4 border-t border-border pt-6 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {avatars.map((a) => (
                    <Image
                      key={a}
                      alt={a}
                      w={100}
                      h={100}
                      className="size-9 rounded-full border-2 border-background object-cover"
                    />
                  ))}
                </div>
                <p className="font-medium">{heroSocial}</p>
              </div>
            </div>
            <div className="relative mx-2 sm:mx-6 lg:col-span-5 lg:mx-0">
              <div className="relative rotate-1">
                {/* Primary-tinted offset frame behind the sharp photo plate. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border-2 border-primary/30 bg-primary/5"
                />
                <HeroMediaPanel
                  alt={heroImageAlt}
                  w={800}
                  h={1000}
                  className="relative aspect-[4/5] w-full rounded-none border-2 border-foreground"
                />
                <div className="absolute inset-x-4 bottom-4 border-2 border-foreground bg-card p-4 shadow-[3px_3px_0_0] shadow-foreground">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Image
                        alt={profileImageAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <span className="absolute -right-1 -top-1 size-4 rounded-full border-2 border-card bg-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-card-foreground">
                        {profileName}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {profileMeta}
                      </p>
                    </div>
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <HeartGlyph className="size-5" />
                    </span>
                  </div>
                </div>
              </div>
              {/* Rotated heart sticker chip breaching the plate corner. */}
              <span className="absolute -right-2 -top-5 inline-flex rotate-2 items-center gap-2 rounded-full border-2 border-foreground bg-background px-4 py-2 text-sm font-bold text-foreground shadow-[3px_3px_0_0] shadow-foreground sm:-right-5">
                <HeartGlyph className="size-4 text-primary" />
                {matchBadge}
              </span>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
