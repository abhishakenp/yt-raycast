import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroHighlight,
  HeroActions,
  HeroCta,
} from '#/section-kit/HeroSection.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { DotGrid, MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * PortfolioHero — editorial-personal signature hero for a creative-individual
 * portfolio. Over an adaptive canvas carrying a giant ghost watermark word, a
 * faint dot-grid, and one soft primary wash, an asymmetric 7:5 split: on the
 * left a mono metadata rail (role micro-label · hairline rule · availability
 * tag) above a giant clamp extrabold tight-tracked headline whose middle word
 * is set in the primary accent, a supporting paragraph, and dual rounded-none
 * CTAs (a high-contrast inverted button with a hard offset shadow + press
 * feedback beside a hairline-framed outline button); on the right a showreel
 * plate — a 16:10 alt-driven thumbnail in a sharp double-framed card with a
 * primary-tinted offset frame behind it, a glassy circular play overlay, and a
 * rotated mono caption sticker. The reel plate and both CTAs route through
 * section-kit route links. Use as the opening hero for a designer, art
 * director, animator, motion or 3D artist personal site that leads with a
 * high-craft reel. Renders fully with no props via baked-in "Kaelen Vance"
 * defaults.
 */
export const PortfolioHero = defineCapsule({
  name: 'PortfolioHero',
  description:
    'Editorial-personal signature hero for a creative-individual portfolio over an adaptive canvas with a giant ghost watermark word, a faint dot-grid, and one soft primary wash: an asymmetric 7:5 split with a mono metadata rail (role micro-label · hairline rule · availability tag) above a giant clamp extrabold tight-tracked headline whose middle word is set in the primary accent, a supporting paragraph, and dual rounded-none CTAs (a high-contrast inverted button with a hard offset shadow + press feedback beside a hairline-framed outline button) on the left, and a showreel plate — a 16:10 alt-driven thumbnail in a sharp double-framed card with a primary-tinted offset frame behind it, a glassy circular play overlay, and a rotated mono caption sticker — on the right. The reel plate and both CTAs route through section-kit route links. Use as the opening hero for a designer, art director, animator, motion or 3D artist personal site that leads with a high-craft reel.',
  props: z.object({
    /** Small uppercase role line above the headline. */
    eyebrow: z.string().optional(),
    /** First part of the headline, plain weight. */
    headlineLead: z.string().optional(),
    /** Word rendered in the cyan accent. */
    headlineAccent: z.string().optional(),
    /** Remainder of the headline after the accent word. */
    headlineTail: z.string().optional(),
    /** Supporting paragraph under the headline. */
    description: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Alt for the showreel thumbnail image. */
    reelAlt: z.string().optional(),
    /** Caption pill shown on the showreel card. */
    reelCaption: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? '3D Motion Designer & Art Director'
    const headlineLead = props.headlineLead ?? 'Crafting'
    const headlineAccent = props.headlineAccent ?? 'dimensional'
    const headlineTail = props.headlineTail ?? 'stories that move.'
    const description =
      props.description ??
      'I help brands, studios, and studios build unforgettable visual worlds — from cinematic brand films to immersive product launches. Every frame is built to perform.'
    const primaryCta = props.primaryCta ?? 'View Selected Work'
    const secondaryCta = props.secondaryCta ?? 'Start a Project'
    const reelAlt =
      props.reelAlt ??
      'Abstract 3D glass and light composition representing a motion design reel'
    const reelCaption = props.reelCaption ?? '2024 Showreel — 2:34'

    return (
      <HeroSection
        className={cn(
          'relative overflow-hidden bg-background pt-[140px] pb-20 lg:pt-[180px] lg:pb-[100px]',
          props.className,
        )}
      >
        {/* Giant ghost watermark word bleeding off the lower edge. */}
        <Watermark className="-bottom-8 -left-4 text-[7rem] sm:text-[12rem] lg:text-[16rem]">
          {headlineAccent}
        </Watermark>
        <DotGrid
          tone="faint"
          className="inset-y-0 right-0 w-1/2 [mask-image:linear-gradient(to_left,black,transparent)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_420px_at_82%_-6%,var(--primary),transparent)] opacity-[0.06]"
        />
        <Container size="xl" className="relative max-w-[1200px] px-6 lg:px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div>
              {/* Mono metadata rail: role — hairline rule — availability. */}
              <div className="mb-7 flex items-center gap-4">
                <MonoTag
                  tone="muted"
                  className="inline-flex items-center gap-2 tracking-[0.18em]"
                >
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 bg-primary"
                  />
                  {eyebrow}
                </MonoTag>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
                <MonoTag
                  tone="faint"
                  className="hidden shrink-0 sm:inline"
                  aria-hidden="true"
                >
                  Available
                </MonoTag>
              </div>
              <h1 className="mb-5 text-[clamp(2.6rem,7vw,5rem)] font-extrabold leading-[0.95] tracking-tighter text-balance">
                {headlineLead} <HeroHighlight>{headlineAccent}</HeroHighlight>
                <br />
                {headlineTail}
              </h1>
              <p className="mb-8 max-w-[520px] text-lg leading-[1.7] text-muted-foreground text-pretty">
                {description}
              </p>
              <HeroActions>
                <HeroCta
                  asChild
                  variant="none"
                  className="gap-2.5 rounded-none border-2 border-foreground bg-foreground px-7 py-3.5 text-[0.9375rem] font-semibold text-background shadow-[5px_5px_0_0] shadow-foreground/20 transition-all duration-100 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  <NavbarRouteLink href={primaryCta}>
                    {primaryCta}
                  </NavbarRouteLink>
                </HeroCta>
                <HeroCta
                  asChild
                  variant="none"
                  className="gap-2.5 rounded-none border-2 border-foreground bg-background px-7 py-3.5 text-[0.9375rem] font-semibold text-foreground transition-all duration-100 hover:-translate-y-0.5 hover:bg-muted active:translate-x-[2px] active:translate-y-[2px]"
                >
                  <NavbarRouteLink href={secondaryCta}>
                    {secondaryCta}
                  </NavbarRouteLink>
                </HeroCta>
              </HeroActions>
            </div>

            <div className="relative -rotate-1">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border-2 border-primary/30 bg-primary/5"
              />
              <Card
                asChild
                variant="default"
                className="group relative block aspect-[16/10] w-full overflow-hidden rounded-none border-2 border-foreground p-0 text-left shadow-none"
              >
                <NavbarRouteLink aria-label="Watch showreel" href={primaryCta}>
                  <Image
                    alt={reelAlt}
                    w={1600}
                    h={1000}
                    loading="eager"
                    className="h-full w-full object-cover opacity-90 grayscale transition-all duration-700 group-hover:scale-[1.04] group-hover:opacity-100 group-hover:grayscale-0"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-background/25 transition-colors duration-300 group-hover:bg-background/10">
                    <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-foreground/20 bg-foreground/10 backdrop-blur-md transition-all duration-300 group-hover:scale-105 group-hover:bg-foreground/20">
                      <svg
                        viewBox="0 0 24 24"
                        className="ml-1 h-6 w-6 fill-foreground"
                        aria-hidden="true"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                  <span className="absolute bottom-4 left-4 rotate-1 rounded-none border-2 border-foreground bg-background px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground shadow-[3px_3px_0_0] shadow-foreground/20">
                    {reelCaption}
                  </span>
                </NavbarRouteLink>
              </Card>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
