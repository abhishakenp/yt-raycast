import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { HeroSection, HeroContent } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * PhotographyHero — full-bleed gallery hero for a fine-art / wedding
 * photographer portfolio: the photograph IS the design. A full-height,
 * edge-to-edge background photo under a soft dark scrim is wrapped by a thin
 * hairline gallery frame with EXIF-style mono corner labels (a brand slate top
 * and an "EST" plate opposite). Content is bottom-anchored — an uppercase mono
 * kicker, a large serif display headline, a supporting paragraph, and dual
 * square-edged CTAs (a solid light button + an outlined ghost button, both
 * press-responsive) — with an animated scroll cue at the bottom. Both CTAs
 * route through section-kit route links; the photo is alt-driven via the Image
 * component. Use as the opening hero for wedding photographers, portrait
 * studios, elopement shooters, or gallery-first visual creatives. Renders fully
 * with no props via baked-in defaults.
 */
export const PhotographyHero = defineCapsule({
  name: 'PhotographyHero',
  description:
    'Full-bleed gallery hero for a fine-art / wedding photographer portfolio where the photograph is the design: a full-height edge-to-edge background photo under a soft dark scrim, wrapped by a thin hairline gallery frame with EXIF-style mono corner labels, with bottom-anchored content (uppercase mono kicker, large serif display headline, supporting paragraph, and dual square-edged CTAs — a solid light button + an outlined ghost button, both press-responsive) and an animated scroll cue. Both CTAs route through section-kit route links; the photo is alt-driven via the Image component. Use as the opening hero for wedding photographers, portrait studios, elopement shooters, or gallery-first visual creatives.',
  props: z.object({
    /** Uppercase tracked kicker above the headline. */
    kicker: z.string().optional(),
    /** Large serif display headline. */
    heading: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Solid primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Alt text driving the full-bleed background photo. */
    imageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const kicker = props.kicker ?? 'Fine Art Photography'
    const heading =
      props.heading ?? 'Capturing authentic moments that last forever'
    const subheading =
      props.subheading ??
      'Documentary wedding and portrait photography for couples who value emotion over perfection. Based in Portland, available worldwide.'
    const primaryCta = props.primaryCta ?? 'View Portfolio'
    const secondaryCta = props.secondaryCta ?? 'Book a Session'
    const imageAlt =
      props.imageAlt ??
      'Dramatic mountain landscape at golden hour with photographer silhouette'

    return (
      <HeroSection
        variant="default"
        className={cn(
          'relative h-screen w-full overflow-hidden',
          props.className,
        )}
        aria-label="Hero"
      >
        <div className="absolute inset-0">
          <Image
            alt={imageAlt}
            w={1920}
            h={1280}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/40" />
        </div>

        {/* Thin gallery frame + EXIF-style mono corner labels — minimal chrome. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-4 border border-background/25 sm:inset-6"
        />
        <div className="pointer-events-none absolute left-6 top-6 flex items-center gap-3 sm:left-9 sm:top-9">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-background/70">
            01 / Portfolio
          </span>
        </div>
        <div className="pointer-events-none absolute right-6 top-6 sm:right-9 sm:top-9">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-background/70">
            Est. 2019 · 35mm
          </span>
        </div>

        <Container asChild>
          <HeroContent className="flex h-full flex-col justify-end pb-24 lg:pb-32">
            <div className="max-w-3xl">
              <p className="mb-5 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-background/80">
                {kicker}
              </p>
              <h1 className="mb-6 max-w-2xl text-balance font-serif text-5xl font-medium leading-[1.02] tracking-tight text-background md:text-6xl lg:text-7xl">
                {heading}
              </h1>
              <p className="mb-10 max-w-xl text-pretty text-lg leading-relaxed text-background/80 md:text-xl">
                {subheading}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <NavbarRouteLink
                  className="inline-flex items-center justify-center rounded-none bg-background px-8 py-4 text-sm font-medium tracking-wide text-foreground transition-[background-color,transform] duration-150 hover:bg-muted active:translate-y-px motion-reduce:transform-none"
                  href={primaryCta}
                >
                  {primaryCta}
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="inline-flex items-center justify-center rounded-none border border-background px-8 py-4 text-sm font-medium tracking-wide text-background transition-[background-color,transform] duration-150 hover:bg-background/10 active:translate-y-px motion-reduce:transform-none"
                  href={secondaryCta}
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </div>
            </div>
          </HeroContent>
        </Container>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-background/60">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-bounce"
            aria-hidden="true"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </HeroSection>
    )
  },
})
