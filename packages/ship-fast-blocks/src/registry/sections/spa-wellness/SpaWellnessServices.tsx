import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'

/**
 * SpaWellnessServices — treatment-menu grid for a day-spa / wellness page. A
 * calm background band with a centered serif heading + intro above a responsive
 * grid of treatment cards. Each card shows the treatment name, a duration +
 * price row, and a short descriptive blurb. Use to present a spa's menu of
 * services — massages, facials, body treatments, and rituals. Renders fully
 * with no props via baked-in defaults.
 */
export const SpaWellnessServices = defineCapsule({
  name: 'SpaWellnessServices',
  description:
    "Treatment-menu grid for a day-spa / wellness page: a calm band with a centered serif heading + intro above a responsive grid of treatment cards, each showing the treatment name, a duration + price row, and a short blurb. Use to present a spa's menu of services — massages, facials, body treatments, and rituals.",
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
          'bg-muted/40 pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
        aria-labelledby="spa-services-heading"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2
              id="spa-services-heading"
              className="mb-4 font-serif text-3xl font-semibold text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{subheading}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card
                key={service.name}
                rounded="2xl"
                shadow="sm"
                className="flex flex-col text-card-foreground transition-shadow hover:shadow-md lg:p-8"
              >
                <h3 className="font-serif text-xl font-semibold text-foreground">
                  {service.name}
                </h3>
                <div className="mt-3 flex items-center gap-3 text-sm">
                  <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                    {service.duration}
                  </span>
                  <span className="font-semibold text-primary">
                    {service.price}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
