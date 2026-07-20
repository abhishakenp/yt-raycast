import { defineCapsule } from '#/capsules/openui.ts'
import { useState } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * CybersecurityFaq — terminal-stealth interrogation ledger. An asymmetric 4:8
 * split on a muted wash: the left rail holds a mono meta rule ("QUERY LOG"), a
 * left-aligned heading + lede, and a decorative mono redaction-bar line; the
 * right column stacks the questions as a hairline-divided, square-edged ledger.
 * Each row is a full-width toggle with a mono tabular "Q.0X" index, the
 * question, and a rotating chevron; the answer expands beneath, indented past
 * the index gutter. First item open by default, one open at a time.
 * Self-contained interactive state, no links. Use to answer buyer objections
 * for cybersecurity vendors, SOC/MDR providers, or any B2B security SaaS.
 * Renders fully with no props via baked-in security-FAQ defaults.
 */
export const CybersecurityFaq = defineCapsule({
  name: 'CybersecurityFaq',
  description:
    "Terminal-stealth interrogation-ledger FAQ: an asymmetric 4:8 split on a muted wash with a left rail (mono meta rule, left-aligned heading + lede, decorative redaction line) beside a hairline-divided, square-edged question ledger — each row a full-width toggle with a mono tabular 'Q.0X' index, the question, and a rotating chevron; the first item opens by default and only one stays open at a time. Self-contained interactive state, no links. Use to answer buyer objections for cybersecurity vendors, SOC/MDR providers, or any B2B security SaaS.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Question/answer rows. */
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Frequently asked questions'
    const description =
      props.description ?? 'Everything you need to know about SentinelGuard'
    const items = props.items?.length
      ? props.items
      : [
          {
            q: 'How quickly can we deploy SentinelGuard?',
            a: 'Most customers achieve full deployment within 24-48 hours. The lightweight agent installs with a single command and requires no system restarts. Cloud integrations connect via read-only IAM roles in under 10 minutes. For enterprise deployments across multiple regions, our professional services team ensures complete coverage within one week.',
          },
          {
            q: 'What compliance standards do you support?',
            a: 'SentinelGuard provides automated compliance monitoring and reporting for SOC 2 Type I & II, ISO 27001, PCI DSS, HIPAA, GDPR, CCPA, NIST CSF, and CIS Controls. Our platform continuously checks your configurations against these frameworks and provides auditor-ready evidence packages. We maintain our own SOC 2 Type II certification and are PCI DSS Level 1 compliant.',
          },
          {
            q: 'How does your AI threat detection work?',
            a: 'Our AI models are trained on over 50 billion security events from our global customer base. We use a combination of supervised learning for known threats and unsupervised anomaly detection for zero-day attacks. The system analyzes endpoint behavior, network traffic patterns, and user activity to detect threats with 99.7% accuracy and a false positive rate under 0.1%. Models update automatically every 4 hours based on new threat intelligence.',
          },
          {
            q: 'Can we keep data on-premise?',
            a: 'Yes, our Enterprise plan offers on-premise deployment for organizations with strict data sovereignty requirements. The on-premise version includes all platform features and can operate air-gapped for highly sensitive environments. We also offer hybrid deployments where sensitive data remains on-premise while threat intelligence updates come from our cloud. Professional services are included for on-premise installations.',
          },
          {
            q: 'What is your SLA for threat response?',
            a: 'We guarantee an average threat detection-to-notification time of under 5 minutes for critical alerts. Our automated response playbooks can isolate compromised endpoints within seconds. For customers with our SOC add-on, human analysts investigate high-priority alerts within 15 minutes, 24/7/365. Enterprise customers receive custom SLAs with dedicated response teams and executive escalation paths for critical incidents.',
          },
          {
            q: 'How do you handle false positives?',
            a: "Our AI models achieve a false positive rate below 0.1% through continuous learning from analyst feedback. When you dismiss an alert, the system learns your environment's normal behavior patterns. You can also create custom suppression rules based on asset tags, user groups, or time windows. Professional and Enterprise plans include access to our ML tuning team who will customize detection thresholds for your specific environment during onboarding.",
          },
        ]

    const [openFaq, setOpenFaq] = useState<number | null>(0)

    return (
      <section
        className={cn('bg-muted/40 py-16 sm:py-20 lg:py-24', props.className)}
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-4">
              <div className="mb-6 flex items-center gap-3 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span aria-hidden="true" className="size-2 bg-primary" />
                Query log
              </div>
              <SectionHeading
                align="left"
                title={heading}
                subtitle={description}
                className="gap-3"
                titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl"
                subtitleClassName="text-base text-muted-foreground sm:text-lg"
              />
              <p
                aria-hidden="true"
                className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60"
              >
                <span>declassified</span>
                <span className="inline-block h-2.5 w-10 bg-foreground" />
                <span>rev</span>
                <span className="tabular-nums">
                  {String(items.length).padStart(2, '0')}
                </span>
              </p>
            </div>
            <div className="lg:col-span-8">
              <FaqAccordion className="space-y-0 divide-y divide-border border-y border-border">
                {items.map((item, i) => {
                  const open = openFaq === i
                  return (
                    <FaqItem
                      key={item.q}
                      asChild
                      variant="overflow-bordered"
                      className="rounded-none border-0 bg-transparent"
                    >
                      <div>
                        <FaqQuestion
                          asChild
                          className="w-full cursor-pointer gap-4 px-1 py-5 text-left transition-colors hover:bg-muted/50 sm:px-4"
                        >
                          <button
                            type="button"
                            aria-expanded={open}
                            onClick={() => setOpenFaq(open ? null : i)}
                          >
                            <span className="flex min-w-0 items-baseline gap-4">
                              <span
                                aria-hidden="true"
                                className="shrink-0 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground tabular-nums"
                              >
                                Q.{String(i + 1).padStart(2, '0')}
                              </span>
                              <span className="text-base font-bold tracking-tight sm:text-lg">
                                {item.q}
                              </span>
                            </span>
                            <FaqQuestionIcon
                              className={cn(
                                'shrink-0 transition-transform',
                                open && 'rotate-180',
                              )}
                            />
                          </button>
                        </FaqQuestion>
                        {open && (
                          <FaqAnswer
                            asChild
                            className="px-1 pb-6 sm:px-4 sm:pl-[4.25rem]"
                          >
                            <div>{item.a}</div>
                          </FaqAnswer>
                        )}
                      </div>
                    </FaqItem>
                  )
                })}
              </FaqAccordion>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
