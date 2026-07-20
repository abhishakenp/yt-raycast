import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import {
  HeroSection,
  HeroBackgroundImage,
  HeroContent,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * VideoStreamingHero — full-bleed, dark-cinematic featured-title hero for a
 * video-streaming landing page. A single dramatic show backdrop fills the band
 * edge to edge under layered token-based dark overlays, framed by thin
 * bg-foreground letterbox bars top and bottom and corner mono timecode slates.
 * Content stacks a mono meta rule (primary dot + "Featured" eyebrow left, a
 * "S1 · 4K HDR" runtime slate right), a huge credits-style extrabold show title,
 * a short logline, dual square press-responsive CTAs (a play-icon "Start Free
 * Trial" + outlined "Browse"), and a mono `·`-separated metadata strip
 * (genre · rating · seasons). Tokens-only so it flips between light and dark
 * themes; CTAs route through section-kit route links. Use as the opening hero
 * for streaming services, OTT apps, and on-demand video platforms. Renders fully
 * with no props.
 */
export const VideoStreamingHero = defineCapsule({
  name: 'VideoStreamingHero',
  description:
    "Full-bleed dark-cinematic featured-title hero for a video-streaming landing page: one dramatic show backdrop fills the band edge to edge under layered token-based dark overlays, framed by thin bg-foreground letterbox bars and corner mono timecode slates. Content has a mono meta rule (primary dot + 'Featured' eyebrow left, a runtime slate right), a huge credits-style extrabold show title, a short logline, dual square press-responsive CTAs (a play-icon 'Start Free Trial' + outlined 'Browse'), and a mono metadata strip (genre · rating · seasons). Tokens-only and theme-adaptive; CTAs route through section-kit route links. Use as the opening hero for streaming services, OTT apps, and on-demand video platforms.",
  props: z.object({
    /** Small uppercase eyebrow above the title. */
    eyebrow: z.string().optional(),
    /** Featured show title (huge heading). */
    heading: z.string().optional(),
    /** Short logline beneath the title. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    primaryTarget: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Route label the secondary CTA navigates to. */
    secondaryTarget: z.string().optional(),
    /** Alt text driving the full-bleed backdrop photo. */
    imageAlt: z.string().optional(),
    /** Metadata chips shown in the strip (genre, rating, seasons). */
    meta: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heroEyebrow = props.eyebrow ?? 'Featured · New Season'
    const heroHeading = props.heading ?? 'Midnight Echo'
    const heroSub =
      props.subheading ??
      "When a rogue signal pulls a deep-space crew into a derelict station, the line between memory and machine begins to dissolve. Stream the season everyone's talking about."
    const heroPrimary = props.primaryCta ?? 'Start Free Trial'
    const heroPrimaryTarget = props.primaryTarget ?? 'Pricing'
    const heroSecondary = props.secondaryCta ?? 'Browse'
    const heroSecondaryTarget = props.secondaryTarget ?? 'Browse'
    const heroImageAlt =
      props.imageAlt ??
      'cinematic sci-fi show backdrop, lone figure silhouetted in a neon-lit derelict space station corridor, moody teal and amber lighting, dramatic widescreen still'
    const meta = props.meta?.length
      ? props.meta
      : ['Sci-Fi Thriller', 'TV-MA', '3 Seasons', '4K Ultra HD']

    const PlayIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M6 4.5v11a1 1 0 0 0 1.52.85l9-5.5a1 1 0 0 0 0-1.7l-9-5.5A1 1 0 0 0 6 4.5Z" />
      </svg>
    )

    return (
      <HeroSection variant="full-bleed" className={props.className}>
        <HeroBackgroundImage
          alt={heroImageAlt}
          overlayClassName="bg-foreground/60"
          gradientClassName="bg-gradient-to-t from-foreground/95 via-foreground/50 to-foreground/70"
        />

        {/* Cinematic letterbox bars + corner slates (decorative). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-6 bg-foreground sm:h-9"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-6 bg-foreground sm:h-9"
        />

        <Container asChild>
          <HeroContent className="flex flex-col items-start pb-28 pt-36 sm:pt-40 lg:pb-32 lg:pt-48">
            <div className="flex w-full items-center gap-4">
              <MonoTag
                tone="inverted"
                className="flex items-center gap-2.5 text-background/80"
              >
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 bg-primary"
                />
                {heroEyebrow}
              </MonoTag>
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-background/20"
              />
              <MonoTag
                aria-hidden="true"
                tone="inverted"
                className="hidden text-background/50 sm:inline"
              >
                S1 · 4K HDR
              </MonoTag>
            </div>

            <HeroHeading className="mt-7 max-w-3xl text-5xl font-extrabold leading-[0.95] tracking-tighter text-background sm:text-6xl lg:text-8xl">
              {heroHeading}
            </HeroHeading>

            <HeroSubheading variant="light" className="max-w-xl">
              {heroSub}
            </HeroSubheading>

            <HeroActions className="mt-10 flex-col gap-4 sm:flex-row">
              <HeroCta
                asChild
                variant="primary"
                className="rounded-none px-8 py-4 font-medium transition-transform duration-150 active:translate-y-px motion-reduce:transform-none"
              >
                <NavbarRouteLink href={heroPrimaryTarget}>
                  <PlayIcon className="mr-2 size-5" />
                  {heroPrimary}
                </NavbarRouteLink>
              </HeroCta>
              <HeroCta
                asChild
                variant="outline"
                className="rounded-none border-background/40 bg-background/10 px-8 py-4 font-medium text-background backdrop-blur-sm transition-[transform,background-color] duration-150 hover:bg-background/20 active:translate-y-px motion-reduce:transform-none"
              >
                <NavbarRouteLink href={heroSecondaryTarget}>
                  {heroSecondary}
                </NavbarRouteLink>
              </HeroCta>
            </HeroActions>

            <div className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em] text-background/70">
              {meta.map((item, i) => (
                <div key={item} className="flex items-center gap-x-3">
                  {i > 0 && (
                    <span aria-hidden="true" className="text-background/40">
                      ·
                    </span>
                  )}
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
