import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroBackgroundImage,
  HeroContent,
  HeroBadge,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const UniversityHero = defineCapsule({
  name: 'UniversityHero',
  description:
    'Editorial-academic full-bleed hero band for the University page family. Renders a campus photograph through the alt-driven Image component under a dark token overlay, with a giant ghost founding-year watermark bleeding off the edge. A left-aligned lockup carries a mono tracked-uppercase established/ranking eyebrow rule, an authoritative serif headline, supporting copy, and dual square call-to-action buttons (Apply Now + Visit Campus) with press feedback routed via section-kit route links. A hairline mono ledger strip beneath summarizes enrollment, graduation rate, and student-faculty ratio in tabular figures. Prestigious, structured, catalog-grade. Use as the opening viewport of a university homepage.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    primaryTarget: z.string().optional(),
    secondaryCta: z.string().optional(),
    secondaryTarget: z.string().optional(),
    imageAlt: z.string().optional(),
    quickStats: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Est. 1887 · Ranked Top 25 Nationally'
    const heading =
      props.heading ?? 'A tradition of inquiry, a future without limits'
    const subheading =
      props.subheading ??
      'For more than a century, Whitmore University has shaped scholars, scientists, and civic leaders. Join a community where rigorous academics meet timeless ideals and a campus built for discovery.'
    const primaryCta = props.primaryCta ?? 'Apply Now'
    const primaryTarget = props.primaryTarget ?? 'Admissions'
    const secondaryCta = props.secondaryCta ?? 'Visit Campus'
    const secondaryTarget = props.secondaryTarget ?? 'Campus Life'
    const imageAlt =
      props.imageAlt ?? 'historic university campus quad with stone buildings'
    const quickStats = props.quickStats?.length
      ? props.quickStats
      : ['18,000 students', '95% graduation rate', '22:1 student-faculty ratio']

    return (
      <HeroSection
        variant="full-bleed"
        className={cn(
          'flex min-h-[640px] items-center bg-foreground py-24 text-background lg:py-32',
          props.className,
        )}
      >
        <HeroBackgroundImage
          alt={imageAlt}
          overlayClassName="bg-foreground/70"
          gradientClassName="bg-gradient-to-r from-foreground/80 via-foreground/40 to-transparent"
        />
        <Watermark className="-right-6 bottom-[-2rem] text-[13rem] leading-none text-background/[0.07] sm:text-[20rem]">
          1887
        </Watermark>
        <Container size="xl" className="relative px-6">
          <HeroContent className="max-w-3xl">
            <HeroBadge
              variant="pill"
              className="rounded-none border-background/30 bg-background/5 px-3 py-1.5 font-mono text-[11px] tracking-[0.2em] text-background/80"
            >
              {eyebrow}
            </HeroBadge>
            <HeroHeading
              variant="serif"
              className="mt-6 max-w-none text-balance text-5xl font-semibold leading-[1.02] tracking-tight text-background sm:text-6xl lg:text-7xl"
            >
              {heading}
            </HeroHeading>
            <HeroSubheading
              variant="large"
              className="mx-0 mt-6 mb-0 max-w-xl text-pretty leading-8 text-background/80 sm:text-lg"
            >
              {subheading}
            </HeroSubheading>
            <HeroActions className="mt-10 flex-col gap-3 sm:flex-row">
              <HeroCta
                asChild
                variant="none"
                className="rounded-none bg-background px-7 py-3.5 text-sm font-semibold text-foreground transition-transform duration-150 hover:bg-background/90 active:translate-y-px"
              >
                <NavbarRouteLink href={primaryTarget}>
                  {primaryCta}
                </NavbarRouteLink>
              </HeroCta>
              <HeroCta
                asChild
                variant="none"
                className="rounded-none border border-background/40 bg-transparent px-7 py-3.5 text-sm font-semibold text-background backdrop-blur-sm transition-transform duration-150 hover:bg-background/10 active:translate-y-px"
              >
                <NavbarRouteLink href={secondaryTarget}>
                  {secondaryCta}
                </NavbarRouteLink>
              </HeroCta>
            </HeroActions>
            <div className="mt-12 flex max-w-xl flex-wrap gap-x-8 gap-y-3 border-t border-background/20 pt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-background/70">
              {quickStats.map((stat) => (
                <span
                  key={stat}
                  className="tabular-nums first:text-background/90"
                >
                  {stat}
                </span>
              ))}
            </div>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
