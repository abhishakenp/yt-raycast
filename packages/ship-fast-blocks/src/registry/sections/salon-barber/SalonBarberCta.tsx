import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Container } from '#/section-kit/Container.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const SalonBarberCta = defineCapsule({
  name: 'SalonBarberCta',
  description:
    "Barbershop / salon booking call-to-action band rendered as a vintage-lite inverted foreground surface with a slanted clip-path top seam and a giant serif ghost watermark. Surfaces opening hours / walk-in availability as a mono eyebrow, a confident serif grooming headline, supporting copy, and twin sharp square actions to book online or call, each with press feedback. Use it as the conversion band on any barbershop, salon, or men's grooming homepage — typically the closing section that turns browsers into booked appointments.",
  props: z.object({
    headline: z.string().optional(),
    subheading: z.string().optional(),
    hours: z.string().optional(),
    primaryCta: z.string().optional(),
    primaryTarget: z.string().optional(),
    secondaryCta: z.string().optional(),
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const hours = props.hours ?? 'Open 7 days · Walk-ins welcome'
    const headline = props.headline ?? 'Book your appointment'
    const subheading =
      props.subheading ??
      "Reserve your chair in seconds and show up to a cut that's done right."
    const primaryCta = props.primaryCta ?? 'Book Now'
    const primaryTarget = props.primaryTarget ?? 'Book'
    const secondaryCta = props.secondaryCta ?? 'Call Us'
    const secondaryTarget = props.secondaryTarget ?? 'Contact'

    return (
      <section className={props.className} data-slot="cta-band">
        <div className="relative overflow-hidden bg-foreground pt-24 pb-20 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] lg:pt-28 lg:pb-24">
          <Watermark className="bottom-[-3%] right-[-2%] font-serif text-[7rem] italic tracking-tight text-background/[0.06] sm:text-[11rem] lg:text-[15rem]">
            {headline.split(' ')[0] ?? ''}
          </Watermark>

          <Container size="4xl" className="relative">
            <div className="flex items-center gap-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/70">
                {hours}
              </span>
              <span
                aria-hidden="true"
                className="hidden h-px flex-1 bg-background/20 sm:block"
              />
            </div>
            <h2 className="mt-6 max-w-2xl font-serif text-4xl font-medium leading-[1.05] tracking-tight text-background sm:text-5xl lg:text-6xl">
              {headline}
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-background/75">
              {subheading}
            </p>
            <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <NavbarRouteLink
                href={primaryTarget}
                className="inline-flex items-center justify-center border border-background bg-background px-8 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-foreground transition-[transform,background-color] duration-150 hover:bg-background/85 active:translate-y-px"
              >
                {primaryCta}
              </NavbarRouteLink>
              <NavbarRouteLink
                href={secondaryTarget}
                className="inline-flex items-center justify-center border border-background/40 bg-transparent px-8 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-background transition-[transform,background-color,color] duration-150 hover:border-background hover:bg-background hover:text-foreground active:translate-y-px"
              >
                {secondaryCta}
              </NavbarRouteLink>
            </div>
          </Container>
        </div>
      </section>
    )
  },
})
