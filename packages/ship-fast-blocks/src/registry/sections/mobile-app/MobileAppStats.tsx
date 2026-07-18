import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * MobileAppStats — an inverted, full-bleed big-number stats band on the primary
 * brand background. A centered heading + description (slightly translucent) sits
 * above a responsive 2-/4-column row of large metric figures, each over a
 * translucent caption label. No links, no imagery. Use as a high-contrast
 * proof-point / traction band between content sections on a mobile-app, SaaS or
 * consumer-product landing page. Renders fully with no props via baked-in
 * defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const MobileAppStats = defineCapsule({
  name: 'MobileAppStats',
  description:
    'Inverted full-bleed big-number stats band on the primary brand background: a centered heading + translucent description over a responsive 2-/4-column row of large metric figures, each over a translucent caption label. Use as a high-contrast proof-point / traction band between content sections on a mobile-app, SaaS or consumer-product landing page.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Numbers that speak'
    const description =
      props.description ??
      'Join thousands of people who are transforming their lives one habit at a time.'
    const items = props.items?.length
      ? props.items
      : [
          {
            value: '50,000+',
            label: 'Active users building habits',
          },
          {
            value: '2.8M',
            label: 'Habits completed monthly',
          },
          {
            value: '87%',
            label: 'Users report lasting change',
          },
          {
            value: '4.9',
            label: 'App Store rating (12K reviews)',
          },
        ]
    return (
      <section
        className={cn(
          'bg-primary py-20 text-primary-foreground lg:py-28',
          props.className,
        )}
        aria-labelledby="mobileapp-stats-heading"
      >
        <Container>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2
              id="mobileapp-stats-heading"
              className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-primary-foreground/70">{description}</p>
          </div>
          <StatGrid columns={4} gap={'wide'}>
            {items
              .map((s) => ({ value: s.value, label: s.label }))
              .map((s) => {
                const __iv__ = s as { value: string; label: string }
                return (
                  <StatItem key={__iv__.label}>
                    <StatValue color={'primaryFg'}>{__iv__.value}</StatValue>
                    <StatLabel color={'primaryFg'}>{__iv__.label}</StatLabel>
                  </StatItem>
                )
              })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
