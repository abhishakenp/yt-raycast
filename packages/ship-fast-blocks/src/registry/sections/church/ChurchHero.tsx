import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  HeroSection,
  HeroContent,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * ChurchHero — serene editorial hero for a church or faith-community landing
 * page. A light, airy composition over a faint background photo: a giant ghost
 * serif "46:10" verse-numeral watermark floats top-right while an asymmetric
 * mono metadata rail (star mark + established-since eyebrow — hairline rule —
 * "Ps. 46:10" verse index) opens the section. The centered serif display
 * headline sets the second line in italic muted serif; the supporting
 * paragraph deliberately breaks the centered grammar by sliding right on a
 * hairline left rule. Dual sharp CTAs (solid foreground + hairline outline
 * inverting on hover, both uppercase-mono-tracked with press feedback) sit
 * centered, and a full-width hairline ledger strip beneath splits service time
 * (left) and address (right) in quiet mono. CTAs route through section-kit
 * route links. Use as the opening hero for churches, worship centers,
 * ministries, or religious nonprofits. Renders fully with no props via
 * baked-in defaults.
 */
export const ChurchHero = defineCapsule({
  name: 'ChurchHero',
  description:
    'Serene editorial hero for a church or faith-community landing page: a light, airy composition over a faint background photo with a giant ghost serif "46:10" verse-numeral watermark, an asymmetric mono metadata rail (star mark + established-since eyebrow, hairline rule, verse index), a centered serif display headline whose second line turns italic muted serif, a supporting paragraph that slides right on a hairline left rule to gently subvert the centered grammar, dual sharp uppercase-mono-tracked CTAs (solid foreground + hairline outline inverting on hover, press feedback), and a full-width hairline ledger strip splitting service time and address in quiet mono. CTAs route through section-kit route links. Use as the opening hero for churches, worship centers, ministries, or religious nonprofits.',
  props: z.object({
    /** Small uppercase eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** First headline line (rendered in foreground color). */
    headingTop: z.string().optional(),
    /** Second headline line (rendered in muted foreground color). */
    headingBottom: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Service-time line shown in the bottom strip. */
    serviceTime: z.string().optional(),
    /** Address line shown in the bottom strip. */
    address: z.string().optional(),
    /** Alt text for the background hero image. */
    imageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Est. 1987 • Portland, Oregon'
    const headingTop = props.headingTop ?? 'A place to belong,'
    const headingBottom = props.headingBottom ?? 'believe, and become.'
    const subheading =
      props.subheading ??
      "We're a welcoming community of faith, hope, and love. Whether you're exploring spirituality for the first time or looking for a church home, there's a seat for you here."
    const primaryCta = props.primaryCta ?? 'Plan Your Visit'
    const secondaryCta = props.secondaryCta ?? 'Watch Live'
    const serviceTime = props.serviceTime ?? 'Sundays at 9:00 & 11:00 AM'
    const address = props.address ?? '4521 NE Glisan Street'
    const imageAlt =
      props.imageAlt ??
      'Sunlight streaming through tall church windows creating warm golden rays'

    return (
      <HeroSection
        variant="full-bleed"
        className={cn(
          'relative overflow-hidden border-b border-border pt-20 pb-16 lg:pt-28 lg:pb-24',
          props.className,
        )}
      >
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <Image
            alt={imageAlt}
            w={1920}
            h={1080}
            className="size-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background" />
        </div>

        {/* Giant ghost verse numeral — the serene editorial watermark grammar. */}
        <Watermark className="-top-6 right-0 font-serif text-[7rem] font-medium italic tracking-tight text-foreground/[0.05] sm:text-[11rem] lg:-top-10 lg:text-[16rem]">
          46:10
        </Watermark>

        <Container asChild size="4xl" className="relative px-6 lg:px-6">
          <HeroContent>
            {/* Asymmetric mono rail: star + eyebrow — hairline — verse index. */}
            <div className="mb-10 flex items-center gap-4">
              <span
                aria-hidden="true"
                className="shrink-0 text-sm text-primary"
              >
                ✦
              </span>
              <MonoTag className="min-w-0 text-foreground">{eyebrow}</MonoTag>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
              <MonoTag tone="faint" className="hidden shrink-0 sm:inline">
                Ps. 46:10
              </MonoTag>
            </div>

            <HeroHeading className="text-center font-serif text-[clamp(2.8rem,7vw,5.5rem)] font-medium leading-[1.04] tracking-tight">
              {headingTop}
              <br />
              <span className="font-serif italic text-muted-foreground">
                {headingBottom}
              </span>
            </HeroHeading>

            {/* The lead slides right off-center — gentle asymmetry against the
                centered display line. */}
            <HeroSubheading
              variant="large"
              className="ml-auto mr-0 mt-8 max-w-xl border-l border-border pl-5 text-left text-base leading-relaxed sm:mr-6 sm:text-lg lg:mr-16"
            >
              {subheading}
            </HeroSubheading>

            <HeroActions className="mt-10 flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <HeroCta
                asChild
                className="w-full rounded-none bg-foreground px-8 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-background transition-all duration-150 hover:bg-foreground/90 active:translate-y-px sm:w-auto"
              >
                <NavbarRouteLink href={primaryCta}>
                  {primaryCta}
                </NavbarRouteLink>
              </HeroCta>
              <HeroCta
                asChild
                variant="outline"
                className="w-full rounded-none border-foreground/60 bg-transparent px-8 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground transition-all duration-150 hover:border-foreground hover:bg-foreground hover:text-background active:translate-y-px sm:w-auto"
              >
                <NavbarRouteLink href={secondaryCta}>
                  <svg
                    className="mr-2 size-3.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {secondaryCta}
                </NavbarRouteLink>
              </HeroCta>
            </HeroActions>

            {/* Hairline ledger strip: service time | address. */}
            <div className="mt-14 grid grid-cols-1 border-t border-border sm:grid-cols-2">
              <div className="flex items-baseline justify-between gap-4 border-b border-border py-4 sm:border-b-0 sm:border-r sm:pr-8">
                <MonoTag tone="faint" className="shrink-0">
                  Gather
                </MonoTag>
                <span className="text-right font-serif text-sm italic text-foreground sm:text-base">
                  {serviceTime}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-4 sm:pl-8">
                <MonoTag tone="faint" className="shrink-0">
                  Find us
                </MonoTag>
                <span className="text-right font-serif text-sm italic text-foreground sm:text-base">
                  {address}
                </span>
              </div>
            </div>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
