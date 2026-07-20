import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * YogaStudioHero — serene, airy asymmetric 7/5 hero for a yoga-studio landing
 * page. On a soft muted wash under a giant lowercase ghost watermark word: a left
 * column carries a hairline status chip (single primary dot + mono eyebrow), a
 * calm fluid-clamp clean-sans headline, a grounding lede, and dual
 * sharp-cornered CTAs (filled primary "Try a Class" + hairline outline "See
 * Schedule", both with press feedback); a right column holds a tall
 * hairline-double-framed movement photo with a vertical mono side label. CTAs
 * route through section-kit route links; the photo uses the alt-driven Image
 * component. Use as the opening hero for yoga studios, movement spaces, pilates
 * studios, and mindfulness centers. Renders fully with no props.
 */
export const YogaStudioHero = defineCapsule({
  name: 'YogaStudioHero',
  description:
    "Serene airy asymmetric 7/5 hero for a yoga-studio landing page: a soft muted wash with a giant lowercase ghost watermark word, a left column with a hairline status chip (single primary dot + mono eyebrow), a calm fluid-clamp clean-sans headline, a grounding lede, and dual sharp-cornered CTAs (filled primary 'Try a Class' + hairline outline 'See Schedule' with press feedback); a right column with a tall hairline double-framed movement photo and a vertical mono side label. CTAs route through section-kit route links; the photo uses the alt-driven Image component. Use as the opening hero for yoga studios, movement spaces, pilates studios, and mindfulness centers.",
  props: z.object({
    /** Small uppercase eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Large headline. */
    heading: z.string().optional(),
    /** Supporting paragraph beneath the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    primaryTarget: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Route label the secondary CTA navigates to. */
    secondaryTarget: z.string().optional(),
    /** Alt text driving the full-bleed hero photo. */
    imageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Move · Breathe · Belong'
    const heading = props.heading ?? 'Find your flow, on and off the mat'
    const subheading =
      props.subheading ??
      'A welcoming studio for every body and every level. Roll out your mat, take a breath, and move through practice with teachers who meet you exactly where you are.'
    const primaryCta = props.primaryCta ?? 'Try a Class'
    const primaryTarget = props.primaryTarget ?? 'Trial'
    const secondaryCta = props.secondaryCta ?? 'See Schedule'
    const secondaryTarget = props.secondaryTarget ?? 'Schedule'
    const imageAlt =
      props.imageAlt ??
      'warm sunlit yoga studio with wood floors and people moving through a flowing practice'

    return (
      <HeroSection
        className={cn(
          'relative overflow-hidden border-b border-border bg-background',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-muted/40 to-transparent"
        />
        <Watermark className="-left-4 bottom-0 text-[7rem] font-semibold tracking-tight sm:text-[11rem] lg:text-[16rem]">
          breathe
        </Watermark>
        <Container size="xl" className="relative pb-20 pt-28 lg:pb-28 lg:pt-36">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="max-w-2xl lg:col-span-7">
              <div className="mb-7 inline-flex items-center gap-2.5 border border-border bg-background px-3.5 py-2">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-primary"
                />
                <MonoTag>{eyebrow}</MonoTag>
              </div>
              <HeroHeading className="mb-6 max-w-xl text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.03] tracking-tight text-foreground">
                {heading}
              </HeroHeading>
              <HeroSubheading className="mb-9 mt-0 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {subheading}
              </HeroSubheading>
              <HeroActions className="mt-0 flex-col gap-3 sm:flex-row sm:gap-4">
                <HeroCta
                  asChild
                  variant="primary"
                  className="rounded-none px-7 py-3.5 text-base font-medium active:translate-y-px"
                >
                  <NavbarRouteLink href={primaryTarget}>
                    {primaryCta}
                  </NavbarRouteLink>
                </HeroCta>
                <HeroCta
                  asChild
                  variant="outline"
                  className="rounded-none border-foreground/25 bg-background px-7 py-3.5 text-base font-medium text-foreground hover:bg-muted active:translate-y-px"
                >
                  <NavbarRouteLink href={secondaryTarget}>
                    {secondaryCta}
                  </NavbarRouteLink>
                </HeroCta>
              </HeroActions>
            </div>
            <div className="relative lg:col-span-5">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-3 border border-border sm:-inset-4"
              />
              <div className="relative overflow-hidden border border-border">
                <Image
                  alt={imageAlt}
                  w={800}
                  h={1000}
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
              <span
                aria-hidden="true"
                className="absolute -left-3 top-6 hidden bg-background px-1 py-2 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground [writing-mode:vertical-rl] sm:block"
              >
                On the mat
              </span>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
