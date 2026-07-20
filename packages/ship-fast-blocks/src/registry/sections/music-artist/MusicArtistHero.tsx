import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroMediaPanel,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * MusicArtistHero — asymmetric 7:5 kinetic-poster hero for a music artist /
 * band landing page. On the left: a rotated mono ticket-stub eyebrow chip, a
 * giant extrabold uppercase tight-tracked album title, a descriptive blurb, and
 * a pair of sharp mono CTAs (a filled "Listen Now" with an arrow carrying a hard
 * offset shadow + press feedback and an invert-on-hover outlined "View Tour
 * Dates"). On the right: a hard-bordered square album cover floating over a
 * primary-tinted offset frame with a rotated "SIDE A" stub chip, all behind a
 * giant ghost watermark of the album's initial. Bold poster energy driven
 * entirely by theme tokens (flips light/dark); binary rounded-none radius.
 * Both CTAs route through section-kit route links; the cover uses the alt-driven
 * Image component. Use as the opening hero for album releases, musicians, bands,
 * or any artist promo page. Renders fully with no props via baked-in defaults.
 */
export const MusicArtistHero = defineCapsule({
  name: 'MusicArtistHero',
  description:
    "Asymmetric 7:5 kinetic-poster hero for a music artist / band landing page: on the left a rotated mono ticket-stub eyebrow chip, a giant extrabold uppercase tight-tracked album title, a descriptive blurb, and a pair of sharp mono CTAs (a filled 'Listen Now' with an arrow, a hard offset shadow and press feedback, plus an invert-on-hover outlined 'View Tour Dates'); on the right a hard-bordered square album cover floating over a primary-tinted offset frame with a rotated 'SIDE A' stub chip, all behind a giant ghost watermark of the album's initial. Bold poster energy driven entirely by theme tokens (flips light/dark); binary rounded-none radius. Both CTAs route through section-kit route links; the cover uses the alt-driven Image component. Use as the opening hero for album releases, musicians, singers, bands, or any artist promo page.",
  props: z.object({
    /** Small uppercase eyebrow above the title. */
    eyebrow: z.string().optional(),
    /** Large thin-weight album / release title. */
    title: z.string().optional(),
    /** Descriptive blurb under the title. */
    description: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Alt text for the square album-cover image. */
    imageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'New Album Out Now'
    const title = props.title ?? 'Northbound'
    const description =
      props.description ??
      'Twelve songs about distance, longing, and the road home. Recorded in a converted barn outside Portland during the quiet winter months.'
    const primaryCta = props.primaryCta ?? 'Listen Now'
    const secondaryCta = props.secondaryCta ?? 'View Tour Dates'
    const imageAlt =
      props.imageAlt ??
      'Minimalist album cover showing a misty mountain landscape at dawn with soft neutral tones'

    const watermark = title.trim().charAt(0) || 'M'

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="3" y1="12" x2="17" y2="12" />
        <polyline points="11 6 17 12 11 18" />
      </svg>
    )

    return (
      <HeroSection
        className={cn(
          'relative overflow-hidden px-6 pt-24 pb-16 lg:px-8 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        {/* Giant ghost watermark of the release initial. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-10 select-none font-extrabold uppercase leading-none tracking-tighter text-foreground/[0.04] text-[14rem] sm:text-[20rem] lg:text-[26rem]"
        >
          {watermark}
        </span>

        <Container size="lg" className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="order-2 lg:order-1 lg:col-span-7">
              <span className="inline-flex -rotate-2 items-center gap-2 rounded-full border border-foreground bg-background px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-primary"
                />
                {eyebrow}
              </span>
              <HeroHeading className="mb-6 mt-6 text-5xl font-extrabold uppercase leading-[0.85] tracking-tighter text-foreground text-balance sm:text-7xl lg:text-8xl">
                {title}
              </HeroHeading>
              <HeroSubheading className="mb-8 mt-0 max-w-xl text-pretty lg:text-xl">
                {description}
              </HeroSubheading>
              <HeroActions className="gap-4">
                <HeroCta
                  asChild
                  variant="primary"
                  className="rounded-none px-7 py-3.5 font-mono text-xs uppercase tracking-[0.15em] shadow-[5px_5px_0_0] shadow-foreground transition-transform hover:-translate-y-0.5 active:translate-x-[5px] active:translate-y-[5px] active:shadow-none"
                >
                  <NavbarRouteLink href={primaryCta}>
                    {primaryCta}
                    <ArrowRight className="ml-2 size-4" />
                  </NavbarRouteLink>
                </HeroCta>
                <HeroCta
                  asChild
                  variant="outline"
                  className="rounded-none border-foreground px-7 py-3.5 font-mono text-xs uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-foreground hover:text-background active:translate-y-px"
                >
                  <NavbarRouteLink href={secondaryCta}>
                    {secondaryCta}
                  </NavbarRouteLink>
                </HeroCta>
              </HeroActions>
            </div>

            <div className="relative order-1 lg:order-2 lg:col-span-5">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 translate-x-4 translate-y-4 border-2 border-primary/30 bg-primary/5"
              />
              <HeroMediaPanel
                alt={imageAlt}
                w={800}
                h={800}
                className="relative aspect-square rounded-none border-2 border-foreground bg-muted"
              />
              <span
                aria-hidden="true"
                className="absolute -left-3 top-6 inline-flex rotate-2 items-center gap-2 rounded-full border border-foreground bg-background px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground"
              >
                Side A · 33⅓
              </span>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
