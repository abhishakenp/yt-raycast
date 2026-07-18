import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroHighlight,
  HeroActions,
} from '#/section-kit/HeroSection.tsx'
import { Card } from '#/section-kit/Card.tsx'

/**
 * PortfolioHero — split, cinematic hero band for a dark creative-individual
 * portfolio. Over a near-black canvas with dual radial cyan glows: a left column
 * with a small uppercase role eyebrow, a huge display headline whose middle word
 * is rendered in the cyan accent, a supporting paragraph, and dual pill CTAs
 * (filled primary + outlined secondary); and a right column showreel card — a
 * 16:10 alt-driven thumbnail with a glassy circular play overlay and a caption
 * pill. The whole reel card and both CTAs route through useNavigate. Use as the
 * opening hero for a 3D artist, motion designer, CGI/VFX, art director, or
 * animator personal site that needs a moody, high-craft reel showcase. Renders
 * fully with no props via baked-in "Kaelen Vance" defaults.
 */
export const PortfolioHero = defineCapsule({
  name: 'PortfolioHero',
  description:
    'Split, cinematic hero band for a dark creative-individual portfolio over a near-black canvas with dual radial cyan glows: a left column with a small uppercase role eyebrow, a huge display headline whose middle word is rendered in a cyan accent, a supporting paragraph, and dual pill CTAs (filled primary + outlined secondary); and a right-column showreel card — a 16:10 alt-driven thumbnail with a glassy circular play overlay and a caption pill. The reel card and both CTAs route through useNavigate. Use as the opening hero for a 3D artist, motion designer, CGI/VFX, art director, or animator personal site that needs a moody, high-craft reel showcase.',
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
    const go = useNavigate()
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
          'relative overflow-hidden pt-[140px] pb-20 lg:pt-[180px] lg:pb-[100px]',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_80%_-10%,var(--primary),transparent),radial-gradient(700px_400px_at_10%_60%,var(--primary),transparent)] opacity-[0.08]"
        />
        <div className="relative mx-auto max-w-[1200px] px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div>
              <p className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                {eyebrow}
              </p>
              <h1 className="mb-5 text-[clamp(2.6rem,6vw,4.5rem)] font-bold leading-[1.15] tracking-[-0.03em]">
                {headlineLead} <HeroHighlight>{headlineAccent}</HeroHighlight>
                <br />
                {headlineTail}
              </h1>
              <p className="mb-8 max-w-[520px] text-lg leading-[1.7] text-muted-foreground">
                {description}
              </p>
              <HeroActions>
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="inline-flex items-center justify-center gap-2.5 rounded-full bg-primary px-7 py-3.5 text-[0.9375rem] font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {primaryCta}
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="inline-flex items-center justify-center gap-2.5 rounded-full border border-border bg-secondary px-7 py-3.5 text-[0.9375rem] font-semibold text-secondary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  {secondaryCta}
                </button>
              </HeroActions>
            </div>

            <Card
              asChild
              variant="default"
              rounded="2xl"
              padding="none"
              className="group relative block aspect-[16/10] w-full overflow-hidden text-left shadow-[0_24px_64px_rgba(0,0,0,0.55)]"
            >
              <button
                type="button"
                onClick={() => go(primaryCta)}
                aria-label="Watch showreel"
              >
                <Image
                  alt={reelAlt}
                  w={1600}
                  h={1000}
                  loading="eager"
                  className="h-full w-full object-cover opacity-90 transition-all duration-700 group-hover:scale-[1.04] group-hover:opacity-100"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-background/25 transition-colors duration-300 group-hover:bg-background/15">
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
                <span className="absolute bottom-4 left-4 rounded-full bg-background/45 px-3 py-1.5 text-xs font-medium text-foreground/85 backdrop-blur-sm">
                  {reelCaption}
                </span>
              </button>
            </Card>
          </div>
        </div>
      </HeroSection>
    )
  },
})
