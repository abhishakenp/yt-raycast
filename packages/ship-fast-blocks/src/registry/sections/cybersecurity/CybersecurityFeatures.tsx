import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * CybersecurityFeatures — security-capability grid. A light section with a
 * centered heading + supporting paragraph above a responsive 2-to-3 column grid
 * of bordered cards. Each card has a rounded icon tile (cycling through a set of
 * security glyphs that invert color on hover), a bold title, a descriptive
 * paragraph, and an arrowed "Learn more" link that routes through useNavigate.
 * Use to lay out core platform capabilities for cybersecurity vendors,
 * SOC/MDR/XDR providers, zero-trust, cloud-security, or compliance-automation
 * products. Renders fully with no props via baked-in capability defaults.
 */
export const CybersecurityFeatures = defineCapsule({
  name: 'CybersecurityFeatures',
  description:
    "Security-capability grid: a light section with a centered heading + supporting paragraph above a responsive 2-to-3 column grid of bordered cards, each with a rounded icon tile (cycling security glyphs that invert color on hover), a bold title, a description, and an arrowed 'Learn more' link routing through useNavigate. Use to lay out core platform capabilities for cybersecurity vendors, SOC/MDR/XDR providers, zero-trust, cloud-security, or compliance-automation products.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Per-card link label. */
    cta: z.string().optional(),
    /** Capability cards. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Complete security coverage'
    const description =
      props.description ??
      'From endpoint to cloud, our unified platform protects every layer of your digital infrastructure with enterprise-grade precision.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'AI Threat Detection',
            description:
              'Machine learning models trained on 50B+ security events detect anomalies in real-time with 99.7% accuracy. Identifies zero-day exploits before they spread.',
          },
          {
            title: 'Zero Trust Architecture',
            description:
              'Never trust, always verify. Multi-factor authentication, device posture checks, and least-privilege access for every user and endpoint.',
          },
          {
            title: 'Cloud Security Posture',
            description:
              'Continuous monitoring of AWS, Azure, and GCP configurations. Auto-remediation for 500+ compliance checks including CIS benchmarks.',
          },
          {
            title: '24/7 SOC Monitoring',
            description:
              'Expert security analysts in 4 global centers monitor your environment around the clock. Average alert-to-response time under 15 minutes.',
          },
          {
            title: 'Compliance Automation',
            description:
              'Automated evidence collection and reporting for SOC 2, ISO 27001, PCI DSS, HIPAA, and GDPR. Reduce audit prep time by 80%.',
          },
          {
            title: 'API Security',
            description:
              'Protect your APIs from OWASP Top 10 threats. Real-time schema validation, anomaly detection, and bot mitigation for GraphQL and REST.',
          },
        ]

    return (
      <section className={cn('bg-background py-24', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">{heading}</h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <FeatureGrid columns={3}>
            {items.map((f) => {
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
                  <FeatureDescription>{__iv__.description}</FeatureDescription>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
