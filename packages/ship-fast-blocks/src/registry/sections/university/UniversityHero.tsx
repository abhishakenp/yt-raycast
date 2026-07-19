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
import { NavbarRouteLink } from '#/section-kit/index.ts'

export const UniversityHero = defineCapsule({
  name: 'UniversityHero',
  description:
    'Bespoke full-bleed hero band for the University page family with a prestigious, collegiate aesthetic. Renders a campus photograph through the alt-driven Image component, a dark token overlay, an established-since eyebrow pill, a stately serif headline, supporting copy, dual call-to-action buttons (Apply Now + Visit Campus) routed via section-kit route links, and a quick-stats strip summarizing enrollment, graduation rate, and student-faculty ratio. Use as the opening viewport of a university homepage.',
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
          'flex min-h-[640px] items-center bg-foreground py-20 text-background lg:py-28',
          props.className,
        )}
      >
        <HeroBackgroundImage
          alt={imageAlt}
          overlayClassName="bg-foreground/60"
          gradientClassName="bg-transparent"
        />
        <Container asChild size="4xl" className="px-6 text-center lg:px-6">
          <HeroContent>
            <HeroBadge variant="pill" className="py-2 text-sm tracking-wide">
              {eyebrow}
            </HeroBadge>
            <HeroHeading
              variant="serif"
              className="font-bold max-w-none tracking-normal sm:text-6xl"
            >
              {heading}
            </HeroHeading>
            <HeroSubheading
              variant="large"
              className="mt-6 mb-0 leading-8 text-background/85 sm:text-lg"
            >
              {subheading}
            </HeroSubheading>
            <HeroActions className="mt-10 flex-col justify-center gap-3 sm:flex-row">
              <HeroCta
                asChild
                variant="primary"
                className="rounded-full px-7 py-3 text-sm font-semibold"
              >
                <NavbarRouteLink href={primaryTarget}>
                  {primaryCta}
                </NavbarRouteLink>
              </HeroCta>
              <HeroCta
                asChild
                variant="outline"
                className="rounded-full border-background/40 bg-background/10 px-7 py-3 text-sm font-semibold text-background backdrop-blur-sm hover:bg-background/20"
              >
                <NavbarRouteLink href={secondaryTarget}>
                  {secondaryCta}
                </NavbarRouteLink>
              </HeroCta>
            </HeroActions>
            <div className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-background/20 pt-8 text-sm font-medium text-background/80">
              {quickStats.map((stat, i) => (
                <span key={stat} className="flex items-center gap-3">
                  {i > 0 ? (
                    <span aria-hidden="true" className="text-background/40">
                      ·
                    </span>
                  ) : null}
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
