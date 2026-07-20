import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import {
  HeroSection,
  HeroBackgroundImage,
  HeroContent,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const SalonBarberHero = defineCapsule({
  name: 'SalonBarberHero',
  description:
    "Vintage-lite editorial full-bleed hero for a modern barbershop or salon. Layers a confident grooming photograph behind a warm darkening overlay and gradient, then anchors a left-aligned lockup: a rotated hairline sticker badge over a giant serif signage headline echoed as a faint serif ghost watermark, supporting copy, two sharp square CTAs with press feedback, and a hairline-framed hours ledger with mono day labels and dotted leaders so visitors instantly know when to drop in. Use it as the opening viewport of a barbershop, salon, or men's grooming landing page when you want a classic, high-contrast first impression.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    primaryTarget: z.string().optional(),
    secondaryCta: z.string().optional(),
    secondaryTarget: z.string().optional(),
    imageAlt: z.string().optional(),
    hours: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Est. 2012 · Downtown'
    const heading = props.heading ?? 'Sharp cuts. Clean fades. Every time.'
    const subheading =
      props.subheading ??
      'Precision barbering and modern styling from a team that takes pride in the details. Walk in sharp, leave sharper.'
    const primaryCta = props.primaryCta ?? 'Book an Appointment'
    const primaryTarget = props.primaryTarget ?? 'Pricing'
    const secondaryCta = props.secondaryCta ?? 'View Services'
    const secondaryTarget = props.secondaryTarget ?? 'Services'
    const imageAlt =
      props.imageAlt ??
      'modern barbershop interior with leather chairs and barber giving a precise fade haircut'
    const hours = props.hours?.length
      ? props.hours
      : ['Mon–Fri · 9am–8pm', 'Saturday · 9am–6pm', 'Sunday · 11am–5pm']
    const ghostWord = heading.split(' ')[0] ?? ''

    return (
      <HeroSection variant="full-bleed" className={props.className}>
        <HeroBackgroundImage
          alt={imageAlt}
          overlayClassName="bg-foreground/65"
          gradientClassName="bg-gradient-to-t from-foreground/85 via-foreground/45 to-foreground/25"
        />

        {/* Giant serif ghost of the first headline word — classic signage watermark. */}
        <Watermark className="bottom-[-2%] right-[-3%] font-serif text-[6rem] italic tracking-tight text-background/[0.07] sm:text-[10rem] lg:text-[15rem]">
          {ghostWord}
        </Watermark>

        <Container asChild size="4xl">
          <HeroContent className="flex flex-col items-start py-28 text-left sm:py-36">
            <span className="inline-block -rotate-2 border border-background/40 bg-background/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-background backdrop-blur-sm">
              {eyebrow}
            </span>
            <HeroHeading className="mt-7 max-w-3xl font-serif text-5xl font-semibold leading-[1.02] tracking-tight text-background sm:text-6xl lg:text-7xl">
              {heading}
            </HeroHeading>
            <HeroSubheading
              variant="light"
              className="mt-6 max-w-xl border-l-2 border-background/30 pl-5 text-lg leading-8"
            >
              {subheading}
            </HeroSubheading>

            <HeroActions className="mt-10 w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <HeroCta
                asChild
                variant="none"
                className="inline-flex items-center justify-center border border-background bg-background px-8 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-foreground transition-[transform,background-color,color] duration-150 hover:bg-background/85 active:translate-y-px"
              >
                <NavbarRouteLink href={primaryTarget}>
                  {primaryCta}
                </NavbarRouteLink>
              </HeroCta>
              <HeroCta
                asChild
                variant="none"
                className="inline-flex items-center justify-center border border-background/40 bg-transparent px-8 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-background transition-[transform,background-color,color] duration-150 hover:border-background hover:bg-background hover:text-foreground active:translate-y-px"
              >
                <NavbarRouteLink href={secondaryTarget}>
                  {secondaryCta}
                </NavbarRouteLink>
              </HeroCta>
            </HeroActions>

            {/* Hairline-framed hours ledger — mono day labels + dotted leaders. */}
            <dl className="mt-12 w-full max-w-md divide-y divide-background/20 border-y border-background/20">
              {hours.map((slot) => {
                const [day, ...rest] = slot.split(' · ')
                const time = rest.join(' · ')
                return (
                  <div
                    key={slot}
                    className="flex items-baseline gap-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-background/80"
                  >
                    <dt className="shrink-0">{day}</dt>
                    <span
                      aria-hidden="true"
                      className="mb-1 min-w-4 flex-1 border-b border-dotted border-background/30"
                    />
                    <dd className="shrink-0 text-background">{time || day}</dd>
                  </div>
                )
              })}
            </dl>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
