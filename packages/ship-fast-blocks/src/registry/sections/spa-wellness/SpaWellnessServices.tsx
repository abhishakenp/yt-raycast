import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

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
        <Container size="xl" className="px-6">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2
              id="spa-services-heading"
              className="mb-4 font-serif text-3xl font-semibold text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{subheading}</p>
          </div>

          <FeatureGrid columns={3}>
            {services
              .map((s) => ({
                title: s.name,
                description: `${s.duration} · ${s.price} — ${s.description}`,
              }))
              .map((f) => {
                const __iv__ = f as {
                  title: string
                  description: string
                  icon?: React.ReactNode
                  points?: string[]
                  cta?: string
                  price?: string
                  imageAlt?: string
                }
                return (
                  <FeatureCard key={__iv__.title}>
                    {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                    <FeatureTitle>{__iv__.title}</FeatureTitle>
                    <FeatureDescription>
                      {__iv__.description}
                    </FeatureDescription>
                  </FeatureCard>
                )
              })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
