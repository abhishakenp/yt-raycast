import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * CybersecurityStats — dark, full-bleed real-time threat-intelligence stats
 * band. A high-contrast brand-surface section: a centered heading + subheading,
 * then a 2-to-4 column grid of big numeric stats (value, label, and a colored
 * delta/note line), followed by a bordered-top 3-up row of secondary metrics.
 * Pure display, no links. Use as an authority/social-proof band between the
 * hero and feature grid for cybersecurity vendors, SOC/MDR providers, or any
 * metrics-driven B2B security SaaS. Renders fully with no props via baked-in
 * threat-intelligence defaults.
 */
export const CybersecurityStats = defineCapsule({
  name: 'CybersecurityStats',
  description:
    'Dark full-bleed real-time threat-intelligence stats band: a high-contrast brand-surface section with a centered heading + subheading, a 2-to-4 column grid of big numeric stats (value, label, colored delta/note), and a bordered-top 3-up row of secondary metrics. Pure display, no links. Use as an authority/social-proof band between hero and features for cybersecurity vendors, SOC/MDR providers, or any metrics-driven B2B security SaaS.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Primary big-number stats. */
    items: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
          note: z.string(),
        }),
      )
      .optional(),
    /** Secondary metrics shown in the bordered-top row. */
    secondary: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Real-time threat intelligence'
    const description =
      props.description ??
      'Our global security network processes billions of events daily'
    const items = props.items?.length
      ? props.items
      : [
          {
            value: '2.4M+',
            label: 'Threats blocked this quarter',
            note: '+18% vs last quarter',
          },
          {
            value: '847ms',
            label: 'Average threat response time',
            note: '-23% improvement',
          },
          {
            value: '99.99%',
            label: 'Platform uptime SLA',
            note: '24/7/365 monitoring',
          },
          {
            value: '156',
            label: 'Countries protected',
            note: 'Global SOC coverage',
          },
        ]
    const secondary = props.secondary?.length
      ? props.secondary
      : [
          {
            value: '$4.2M',
            label:
              'Average customer cost savings from prevented breaches (2024)',
          },
          {
            value: '3,847',
            label: 'Zero-day vulnerabilities discovered and patched',
          },
          {
            value: '12TB',
            label: 'Threat intelligence data processed daily',
          },
        ]

    return (
      <section className={cn('bg-foreground text-background', props.className)}>
        <Container size="xl" className="py-20">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">{heading}</h2>
            <p className="text-lg text-background/60">{description}</p>
          </div>
          <StatGrid columns={4} gap={'wide'} className={'lg:gap-12'}>
            {items.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem key={__iv__.label} align={'center'}>
                  <StatValue weight={'bold'} size={'xl'} color={'inverted'}>
                    {__iv__.value}
                  </StatValue>
                  <StatLabel color={'inverted'}>{__iv__.label}</StatLabel>
                </StatItem>
              )
            })}
          </StatGrid>
          <div className="mt-16 border-t border-background/20 pt-16">
            <div className="grid gap-8 text-center md:grid-cols-3">
              {secondary.map((s) => (
                <div key={s.label}>
                  <p className="mb-1 text-2xl font-bold">{s.value}</p>
                  <p className="text-sm text-background/60">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
