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
 * SpaWellnessHero — airy calm-luxury, asymmetric 7/5 hero for a day-spa /
 * wellness landing page. On a soft muted wash with a giant ghost watermark
 * word: a left column carries a hairline status chip (single primary dot + mono
 * eyebrow), a delicate fluid-clamp serif headline, a calming lede, dual
 * sharp-cornered CTAs (filled primary + hairline outline, both with press
 * feedback), and a hairline ledger row folding the opening hours and location
 * into mono-labeled cells; a right column holds a tall hairline double-framed
 * treatment-room photo with a vertical mono side label. CTAs route through
 * section-kit route links; the photo uses the alt-driven Image component. Use
 * as the opening hero for spas, wellness retreats, massage and facial studios,
 * and bathhouses. Renders fully with no props.
 */
export const SpaWellnessHero = defineCapsule({
  name: 'SpaWellnessHero',
  description:
    'Airy calm-luxury asymmetric 7/5 hero for a day-spa / wellness landing page: a soft muted wash with a giant ghost watermark word, a left column with a hairline status chip (single primary dot + mono eyebrow), a delicate fluid-clamp serif headline, a calming lede, dual sharp-cornered CTAs (filled primary + hairline outline with press feedback), and a hairline ledger row folding opening hours and location into mono-labeled cells; a right column with a tall hairline double-framed treatment-room photo and a vertical mono side label. CTAs route through section-kit route links; the photo uses the alt-driven Image component. Use as the opening hero for spas, wellness retreats, massage and facial studios, and bathhouses.',
  props: z.object({
    /** Small uppercase eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Large serif headline. */
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
    /** Opening hours line in the info strip. */
    hours: z.string().optional(),
    /** Address line in the info strip. */
    location: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Rest · Restore · Renew'
    const heading = props.heading ?? 'A calm escape for body and mind'
    const subheading =
      props.subheading ??
      'Step into a sanctuary of warm stone, soft light, and skilled hands. Our therapists craft each treatment around how you want to feel when you leave.'
    const primaryCta = props.primaryCta ?? 'Book a Treatment'
    const primaryTarget = props.primaryTarget ?? 'Booking'
    const secondaryCta = props.secondaryCta ?? 'View Menu'
    const secondaryTarget = props.secondaryTarget ?? 'Treatments'
    const imageAlt =
      props.imageAlt ??
      'serene candlelit spa treatment room with soft towels, smooth stones, and a tranquil natural palette'
    const hours = props.hours ?? 'Open Daily · 9am–8pm'
    const location = props.location ?? '12 Willow Lane, Sausalito'

    const infoItems = [
      { label: 'Hours', value: hours },
      { label: 'Find us', value: location },
    ].filter((item) => Boolean(item.value))

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
        <Watermark className="-left-4 bottom-2 text-[7rem] font-serif font-normal tracking-tight sm:text-[11rem] lg:text-[16rem]">
          calm
        </Watermark>
        <Container size="xl" className="relative pb-20 pt-16 lg:pb-28 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="max-w-2xl lg:col-span-7">
              <div className="mb-7 inline-flex items-center gap-2.5 border border-border bg-background px-3.5 py-2">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-primary"
                />
                <MonoTag>{eyebrow}</MonoTag>
              </div>
              <HeroHeading className="mb-6 max-w-xl font-serif text-[clamp(2.5rem,6vw,4.75rem)] font-normal leading-[1.02] tracking-tight text-foreground">
                {heading}
              </HeroHeading>
              <HeroSubheading className="mb-9 mt-0 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {subheading}
              </HeroSubheading>
              <HeroActions className="mb-10 mt-0 flex-col gap-3 sm:flex-row sm:gap-4">
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
              {infoItems.length > 0 && (
                <dl className="grid max-w-md grid-cols-2 gap-px border border-border bg-border">
                  {infoItems.map((item) => (
                    <div key={item.label} className="bg-background p-4">
                      <dt>
                        <MonoTag tone="faint" className="tracking-[0.14em]">
                          {item.label}
                        </MonoTag>
                      </dt>
                      <dd className="mt-2 text-sm text-foreground">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
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
                Sanctuary
              </span>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
