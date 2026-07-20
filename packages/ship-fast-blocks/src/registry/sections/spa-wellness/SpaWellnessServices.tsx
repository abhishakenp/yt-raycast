import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  ServiceTitle,
  ServiceDescription,
} from '#/section-kit/ServicesGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * SpaWellnessServices — hairline rituals table for a day-spa / wellness page.
 * On a soft muted wash with a giant ghost watermark word: an asymmetric
 * left-aligned header (mono index eyebrow + delicate serif heading + calming
 * intro, mono count meta on the right) sits above a collapsed-border treatment
 * ledger — each ritual is a full-width hairline-divided row pairing a serif
 * treatment name and a mono duration label with a right-aligned tabular price
 * and a short descriptive blurb, spa-menu grammar. Use to present a spa's menu
 * of services — massages, facials, body treatments, and rituals. Renders fully
 * with no props via baked-in defaults.
 */
export const SpaWellnessServices = defineCapsule({
  name: 'SpaWellnessServices',
  description:
    "Hairline rituals table for a day-spa / wellness page: a soft muted wash with a giant ghost watermark word, an asymmetric left-aligned header (mono index eyebrow + delicate serif heading + calming intro, mono count meta right) above a collapsed-border treatment ledger where each ritual is a full-width hairline-divided row pairing a serif treatment name and a mono duration label with a right-aligned tabular price and a short blurb — spa-menu grammar. Use to present a spa's menu of services — massages, facials, body treatments, and rituals.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting intro under the heading. */
    subheading: z.string().optional(),
    /** Treatment entries shown in the grid. */
    services: z
      .array(
        z.object({
          name: z.string(),
          duration: z.string(),
          price: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Our treatment menu'
    const subheading =
      props.subheading ??
      'Thoughtfully designed therapies to ease tension, refresh skin, and restore balance.'
    const services = props.services?.length
      ? props.services
      : [
          {
            name: 'Signature Deep-Tissue Massage',
            duration: '60 min',
            price: '$120',
            description:
              'Firm, targeted pressure to release chronic knots and melt away built-up tension.',
          },
          {
            name: 'Hot Stone Ritual',
            duration: '75 min',
            price: '$145',
            description:
              'Warm basalt stones glide along the body to soothe sore muscles and quiet the mind.',
          },
          {
            name: 'Brightening Facial',
            duration: '50 min',
            price: '$110',
            description:
              'A gentle resurfacing facial that leaves skin luminous, hydrated, and refreshed.',
          },
          {
            name: 'Aromatherapy Body Wrap',
            duration: '90 min',
            price: '$165',
            description:
              'A nourishing botanical wrap paired with essential-oil therapy for full-body calm.',
          },
          {
            name: 'Couples Retreat',
            duration: '60 min',
            price: '$240',
            description:
              'Side-by-side massages in a private suite, finished with tea and quiet relaxation.',
          },
          {
            name: 'Reflexology Session',
            duration: '45 min',
            price: '$85',
            description:
              'Pressure-point work on the feet to restore energy flow and deep, grounding ease.',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted/30 pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
        aria-labelledby="spa-services-heading"
      >
        <Watermark className="-top-6 right-2 font-serif text-[6rem] font-normal tracking-tight sm:text-[9rem] lg:text-[13rem]">
          rituals
        </Watermark>
        <Container size="xl" className="relative px-6">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">01 / The Menu</MonoTag>
              <h2
                id="spa-services-heading"
                className="font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]"
              >
                {heading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
            </div>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-2"
            >
              {String(services.length).padStart(2, '0')} / treatments
            </MonoTag>
          </div>

          <div className="border-y border-border">
            {services.map((service) => (
              <div
                key={service.name}
                className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 border-t border-border py-6 transition-colors duration-150 first:border-t-0 hover:bg-background/60 sm:gap-x-10 sm:py-7"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <ServiceTitle className="font-serif text-lg font-medium tracking-tight text-foreground sm:text-xl">
                      {service.name}
                    </ServiceTitle>
                    <MonoTag tone="faint">{service.duration}</MonoTag>
                  </div>
                  <ServiceDescription className="mt-2 max-w-xl leading-relaxed">
                    {service.description}
                  </ServiceDescription>
                </div>
                <span className="shrink-0 font-serif text-xl font-medium tabular-nums text-foreground sm:text-2xl">
                  {service.price}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
