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
  HeroStats,
  HeroStat,
  HeroStatValue,
  HeroStatLabel,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark, MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * FilmDirectorHero — a full-height, dark-cinematic split hero for a film director
 * / cinematographer portfolio. An asymmetric 7:5 grid with, on the left, a mono
 * slate rail (eyebrow + "SC. 01 / TAKE 03" timecode), a giant credits-style
 * extrabold headline whose emphasized phrase renders in serif italic, a lede, a
 * play-icon primary CTA plus an outlined secondary CTA (both press-responsive),
 * and a mono tabular KPI ledger; on the right, a letterboxed portrait (thin
 * bg-foreground bars top/bottom, a corner slate chip and a RUNTIME timecode) with
 * a soft bottom-up gradient. A giant faint "REEL" watermark ghosts behind the
 * band. CTAs route through section-kit route links; the portrait uses the
 * alt-driven Image component. Tokens-only so the treatment flips between light
 * and dark themes. Use as the top hero for filmmakers, directors, cinematographers,
 * DPs, or video production portfolios.
 */
export const FilmDirectorHero = defineCapsule({
  name: 'FilmDirectorHero',
  description:
    'Full-height, dark-cinematic split hero for a film director / cinematographer portfolio: an asymmetric 7:5 grid pairing a left text column (mono slate rail with eyebrow + "SC. 01 / TAKE 03" timecode, a giant credits-style extrabold headline whose emphasized phrase renders in serif italic, a lede, a play-icon primary CTA plus an outlined secondary CTA with press feedback, and a mono tabular KPI ledger) with a right letterboxed portrait (thin bg-foreground bars top/bottom, corner slate chip, RUNTIME timecode, soft bottom-up gradient) over a giant faint "REEL" watermark. CTAs route through section-kit route links; the portrait uses the Image component; tokens-only and theme-adaptive. Use as the top hero for filmmakers, directors, cinematographers, DPs, or video production portfolios.',
  props: z.object({
    eyebrow: z.string().optional(),
    /** Heading text; the `highlight` phrase within it is rendered emphasized. */
    heading: z.string().optional(),
    highlight: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    imageAlt: z.string().optional(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heroEyebrow = props.eyebrow ?? 'Film Director & Cinematographer'
    const heroHeading = props.heading ?? 'Visual stories that resonate'
    const heroHighlight = props.highlight ?? 'resonate'
    const heroSub =
      props.subheading ??
      'Crafting cinematic narratives for brands, agencies, and artists. From concept to final cut, I bring vision and precision to every frame.'
    const heroPrimary = props.primaryCta ?? 'Watch Reel'
    const heroSecondary = props.secondaryCta ?? 'View Projects'
    const heroImageAlt =
      props.imageAlt ??
      'cinematic behind-the-scenes shot of a film director operating a professional cinema camera on a commercial set with lighting equipment visible'
    const heroStats = props.stats?.length
      ? props.stats
      : [
          { value: '12+', label: 'Years Experience' },
          { value: '87', label: 'Projects Delivered' },
          { value: '14', label: 'Industry Awards' },
        ]

    const PlayIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
          clipRule="evenodd"
        />
      </svg>
    )

    const renderHeading = () => {
      const idx = heroHighlight ? heroHeading.indexOf(heroHighlight) : -1
      if (idx === -1) return heroHeading
      return (
        <>
          {heroHeading.slice(0, idx)}
          <span className="font-serif font-medium italic">{heroHighlight}</span>
          {heroHeading.slice(idx + heroHighlight.length)}
        </>
      )
    }

    return (
      <HeroSection
        className={cn(
          'relative flex min-h-screen items-center overflow-hidden',
          props.className,
        )}
      >
        <Watermark className="-right-6 bottom-2 text-[26vw] leading-none lg:text-[18rem]">
          REEL
        </Watermark>
        <Container size="xl" className="relative py-12 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="order-2 lg:order-1 lg:col-span-7">
              <div className="flex items-center gap-4">
                <MonoTag className="text-muted-foreground">
                  {heroEyebrow}
                </MonoTag>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
                <MonoTag aria-hidden="true" tone="faint">
                  SC. 01 / TAKE 03
                </MonoTag>
              </div>
              <HeroHeading className="mb-6 mt-6 text-5xl font-extrabold leading-[0.95] tracking-tighter sm:text-6xl lg:text-7xl">
                {renderHeading()}
              </HeroHeading>
              <HeroSubheading className="mb-8 mt-0 max-w-xl">
                {heroSub}
              </HeroSubheading>
              <HeroActions className="mt-0 flex-wrap gap-4">
                <HeroCta
                  asChild
                  variant="primary"
                  className="rounded-none px-6 py-3 transition-transform duration-150 active:translate-y-px motion-reduce:transform-none"
                >
                  <NavbarRouteLink href={heroPrimary}>
                    <PlayIcon className="mr-2 size-5" />
                    {heroPrimary}
                  </NavbarRouteLink>
                </HeroCta>
                <HeroCta
                  asChild
                  variant="outline"
                  className="rounded-none px-6 py-3 transition-[transform,border-color] duration-150 hover:border-foreground active:translate-y-px motion-reduce:transform-none"
                >
                  <NavbarRouteLink href={heroSecondary}>
                    {heroSecondary}
                  </NavbarRouteLink>
                </HeroCta>
              </HeroActions>
              <HeroStats className="mt-12 grid-cols-3 gap-0 border-l border-t border-border pt-0 md:grid-cols-3">
                {heroStats.map((s) => (
                  <HeroStat
                    key={s.label}
                    className="border-b border-r border-border p-4"
                  >
                    <HeroStatValue className="text-3xl font-extrabold tabular-nums tracking-tight">
                      {s.value}
                    </HeroStatValue>
                    <HeroStatLabel className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em]">
                      {s.label}
                    </HeroStatLabel>
                  </HeroStat>
                ))}
              </HeroStats>
            </div>
            <div className="order-1 lg:order-2 lg:col-span-5">
              <div className="relative bg-foreground py-5">
                <span className="absolute left-4 top-8 z-10 font-mono text-[11px] uppercase tracking-[0.2em] text-background/70">
                  SC. 01
                </span>
                <span className="absolute bottom-8 right-4 z-10 font-mono text-[11px] uppercase tracking-[0.2em] text-background/70">
                  Runtime 02:14
                </span>
                <div className="relative aspect-[4/5] overflow-hidden">
                  <HeroMediaPanel
                    alt={heroImageAlt}
                    w={800}
                    h={1000}
                    className="size-full rounded-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
