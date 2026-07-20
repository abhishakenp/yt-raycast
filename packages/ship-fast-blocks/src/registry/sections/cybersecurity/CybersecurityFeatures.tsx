import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * CybersecurityFeatures — terminal-stealth capability ledger. A light section
 * opening with a hairline mono meta rule ("CAPABILITY MATRIX" + tabular module
 * count) above an asymmetric header (left-aligned heading + lede, mono
 * clearance tag right). Capabilities render as a square-edged,
 * collapsed-border 1-2-3 column grid: every cell shares hairline rules and
 * carries a ghost mono index numeral watermark, a mono "CAP.0X" micro-label, a
 * bold title, a description, and (when a link label is supplied) an arrowed
 * mono link that routes through section-kit route links. Cells wash to muted
 * on hover — no icon tiles, no glows. Use to lay out core platform
 * capabilities for cybersecurity vendors, SOC/MDR/XDR providers, zero-trust,
 * cloud-security, or compliance-automation products. Renders fully with no
 * props via baked-in capability defaults.
 */
export const CybersecurityFeatures = defineCapsule({
  name: 'CybersecurityFeatures',
  description:
    "Terminal-stealth capability ledger: a light section with a mono meta rule and asymmetric left-aligned header above a square-edged, collapsed-border capability grid — each cell shares hairline rules and carries a ghost index numeral, mono 'CAP.0X' micro-label, bold title, description, and an optional arrowed mono link routing through section-kit route links; cells wash to muted on hover. Use to lay out core platform capabilities for cybersecurity vendors, SOC/MDR/XDR providers, zero-trust, cloud-security, or compliance-automation products.",
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
      <section
        className={cn('bg-background py-16 sm:py-20 lg:py-24', props.className)}
      >
        <Container>
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:mb-10">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              Capability matrix
            </span>
            <span aria-hidden="true" className="tabular-nums">
              {String(items.length).padStart(2, '0')} modules
            </span>
          </div>
          <div className="mb-10 flex flex-col gap-6 sm:mb-14 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
              subtitleClassName="max-w-xl text-base text-muted-foreground sm:text-lg"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ all layers covered ]
            </p>
          </div>
          <FeatureGrid
            columns={3}
            className="gap-0 [&>div]:gap-0 [&>div]:border-l [&>div]:border-t [&>div]:border-border [&>div]:sm:grid-cols-2 [&>div]:md:grid-cols-3"
          >
            {items.map((f, i) => {
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
                <FeatureCard
                  key={__iv__.title}
                  className="group relative gap-3 rounded-none border-0 border-b border-r border-border bg-transparent p-6 transition-colors hover:translate-y-0 hover:border-border hover:bg-muted/40 sm:p-8"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-5 top-4 select-none font-mono text-6xl font-bold leading-none tracking-tighter text-foreground/[0.06] tabular-nums"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 tabular-nums">
                    cap.{String(i + 1).padStart(2, '0')}
                  </span>
                  {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                  <FeatureTitle className="text-lg font-bold tracking-tight">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription className="leading-relaxed">
                    {__iv__.description}
                  </FeatureDescription>
                  {(props.cta ?? __iv__.cta) && (
                    <NavbarRouteLink
                      href={__iv__.title}
                      className="mt-2 inline-flex w-fit items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground active:translate-y-px"
                    >
                      {props.cta ?? __iv__.cta}
                      <span aria-hidden="true">→</span>
                    </NavbarRouteLink>
                  )}
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
