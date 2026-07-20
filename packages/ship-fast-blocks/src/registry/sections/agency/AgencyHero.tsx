import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { HeroSection, HeroSubheading } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'
import { DotGrid, MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { Marquee } from '#/section-kit/motion.tsx'

/**
 * AgencyHero — neo-brutalist poster hero for a creative digital-agency landing
 * page. Left-aligned giant slab display (uppercase, clamp to ~8rem, leading
 * 0.85) where the highlight phrase sits inside a tilted solid primary block
 * like a sticker; above it an availability sticker pill (2px border, hard
 * offset shadow, pulsing dot, slight rotation) mirrored by a mono "01 /
 * Studio" index; behind everything a giant ghost asterisk watermark and a
 * fading dot grid. Below a thick rule, the supporting paragraph and dual block
 * CTAs (primary block + outlined block, both with 2px borders, hard offset
 * shadows and mechanical press feedback) split into an editorial row. A
 * full-bleed tilted marquee strip repeats the availability text between the
 * copy and a collapsed-border KPI strip whose cells carry giant slab numerals
 * (one cell inverted foreground-on-background). CTAs route through
 * section-kit route links. Use as the opening hero for agencies, design
 * studios, branding shops, or production houses. Renders fully with no props
 * via baked-in "Studio Rise" defaults.
 */
export const AgencyHero = defineCapsule({
  name: 'AgencyHero',
  description:
    'Neo-brutalist poster hero for a creative digital-agency landing page: left-aligned giant uppercase slab headline (clamp to ~8rem) with the highlight phrase inside a tilted solid primary sticker block, an availability sticker pill with 2px border, hard offset shadow and pulsing dot, a giant ghost asterisk watermark with a fading dot grid behind, dual block CTAs with hard offset shadows and press feedback, a full-bleed tilted marquee strip repeating the availability text, and a collapsed-border KPI strip with giant slab numerals (one cell inverted). CTAs route through section-kit route links. Use as the opening hero for agencies, design studios, branding shops, or production houses.',
  props: z.object({
    /** Availability / status pill text. */
    badge: z.string().optional(),
    /** First heading line (before the highlight). */
    headingTop: z.string().optional(),
    /** Phrase rendered with the indigo-violet gradient highlight. */
    highlight: z.string().optional(),
    /** Trailing heading text after the highlight. */
    headingBottom: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Inline KPI strip beneath the hero copy. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const badge = props.badge ?? 'Available for new projects'
    const headingTop = props.headingTop ?? 'We craft digital'
    const highlight = props.highlight ?? 'experiences'
    const headingBottom = props.headingBottom ?? 'that define brands.'
    const subheading =
      props.subheading ??
      'Strategy, design, and technology fused into cohesive digital products that captivate users and drive measurable business growth.'
    const primaryCta = props.primaryCta ?? 'View our work'
    const secondaryCta = props.secondaryCta ?? 'Start a project'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '120+', label: 'Projects delivered' },
          { value: '45', label: 'Industry awards' },
          { value: '8 yrs', label: 'In the game' },
          { value: '98%', label: 'Client retention' },
        ]

    const ArrowRight = () => (
      <svg
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
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    return (
      <HeroSection
        className={cn(
          'relative overflow-hidden border-b-2 border-foreground pb-0 pt-24 sm:pt-28 lg:pt-32',
          props.className,
        )}
      >
        {/* Ghost asterisk + fading dot grid backdrop. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <DotGrid
            density="tight"
            fade="left"
            className="inset-y-0 right-0 w-1/2 sm:w-1/3"
          />
          <Watermark className="-top-16 right-[-4rem] rotate-12 text-[16rem] text-foreground/[0.05] sm:text-[24rem] lg:-top-24 lg:text-[30rem]">
            *
          </Watermark>
        </div>

        <Container size="xl" className="relative px-6">
          <div className="flex items-center justify-between gap-4">
            <span className="inline-flex -rotate-2 items-center gap-2 rounded-full border-2 border-foreground bg-background px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-foreground shadow-[4px_4px_0_0] shadow-foreground">
              <span
                aria-hidden="true"
                className="size-2 animate-pulse rounded-full bg-primary"
              />
              {badge}
            </span>
            <MonoTag aria-hidden="true" className="hidden shrink-0 sm:inline">
              01 / Studio
            </MonoTag>
          </div>

          <h1 className="mt-8 max-w-6xl text-[clamp(2.75rem,9vw,8rem)] font-black uppercase leading-[0.85] tracking-tighter text-foreground sm:mt-10">
            {headingTop}{' '}
            <span className="my-1 inline-block -rotate-1 bg-primary px-3 pb-1 text-primary-foreground sm:px-5">
              {highlight}
            </span>{' '}
            {headingBottom}
          </h1>

          <div className="mt-10 border-t-2 border-foreground pt-8 lg:mt-14">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <HeroSubheading
                variant="default"
                className="mt-0 max-w-xl text-base leading-relaxed sm:text-lg"
              >
                {subheading}
              </HeroSubheading>
              <div className="flex w-full shrink-0 flex-col gap-4 sm:w-auto sm:flex-row sm:items-center">
                <NavbarRouteLink
                  className="inline-flex items-center justify-center gap-2 rounded-none border-2 border-foreground bg-primary px-7 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-[6px_6px_0_0] shadow-foreground transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0] hover:shadow-foreground active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  href={primaryCta}
                >
                  {primaryCta}
                  <ArrowRight />
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="inline-flex items-center justify-center gap-2 rounded-none border-2 border-foreground bg-background px-7 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-foreground shadow-[6px_6px_0_0] shadow-foreground transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0] hover:shadow-foreground active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  href={secondaryCta}
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </div>
            </div>
          </div>
        </Container>

        {/* Full-bleed tilted marquee strip repeating the availability text. */}
        <div
          aria-hidden="true"
          className="relative mt-12 -rotate-1 scale-x-[1.03] border-y-2 border-foreground bg-foreground py-3 text-background sm:mt-16"
        >
          <Marquee duration={40} gap={0}>
            {Array.from({ length: 6 }, (_, i) => (
              <span
                key={i}
                className="inline-flex shrink-0 items-center gap-6 pr-6 font-mono text-xs font-bold uppercase tracking-[0.25em]"
              >
                {badge}
                <span className="text-primary">✦</span>
              </span>
            ))}
          </Marquee>
        </div>

        {/* Collapsed-border KPI strip. */}
        <div className="relative mt-6 border-t-2 border-foreground">
          <Container size="xl" className="px-0 sm:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={cn(
                    'flex flex-col gap-1 border-foreground p-5 sm:p-7',
                    i % 2 === 0 && 'border-r-2',
                    i < stats.length - 2 && 'border-b-2 lg:border-b-0',
                    i % 4 !== 3 && 'lg:border-r-2',
                    i % 4 === 3 && 'lg:border-r-0',
                    i === stats.length - 1 && 'bg-foreground text-background',
                  )}
                >
                  <span className="text-3xl font-black tracking-tighter tabular-nums sm:text-5xl">
                    {s.value}
                  </span>
                  <MonoTag
                    tone={i === stats.length - 1 ? 'inverted' : 'muted'}
                    className="text-[10px]"
                  >
                    {s.label}
                  </MonoTag>
                </div>
              ))}
            </div>
          </Container>
        </div>
      </HeroSection>
    )
  },
})
