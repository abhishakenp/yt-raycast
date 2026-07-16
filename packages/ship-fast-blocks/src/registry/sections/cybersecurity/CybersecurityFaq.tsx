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

/**
 * CybersecurityFaq — accordion FAQ. A narrow, muted-band section with a
 * centered heading + subheading above a vertical stack of bordered card rows.
 * Each row is a full-width toggle button (question + a chevron that rotates when
 * open) that expands to reveal its answer; the first item is open by default and
 * only one stays open at a time. Self-contained interactive state, no links.
 * Use to answer buyer objections for cybersecurity vendors, SOC/MDR providers,
 * or any B2B security SaaS. Renders fully with no props via baked-in
 * security-FAQ defaults.
 */
export const CybersecurityFaq = defineCapsule({
  name: 'CybersecurityFaq',
  description:
    'Accordion FAQ: a narrow, muted-band section with a centered heading + subheading above a vertical stack of bordered card rows, each a full-width toggle button (question + rotating chevron) that expands to reveal its answer; the first item opens by default and only one stays open at a time. Self-contained interactive state, no links. Use to answer buyer objections for cybersecurity vendors, SOC/MDR providers, or any B2B security SaaS.',
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
      <section className={cn('bg-muted/50 py-24', props.className)}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">{heading}</h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <FaqAccordion>
            {items.map((item, i) => {
              const open = openFaq === i
              return (
                <FaqItem key={item.q} asChild variant="overflow-bordered">
                  <div>
                    <FaqQuestion
                      asChild
                      className="w-full cursor-pointer p-6 text-left transition-colors hover:bg-muted/50"
                    >
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setOpenFaq(open ? null : i)}
                      >
                        <span className="text-lg font-semibold">{item.q}</span>
                        <FaqQuestionIcon
                          className={cn(
                            'shrink-0 transition-transform',
                            open && 'rotate-180',
                          )}
                        />
                      </button>
                    </FaqQuestion>
                    {open && (
                      <FaqAnswer asChild className="px-6 pb-6">
                        <div>{item.a}</div>
                      </FaqAnswer>
                    )}
                  </div>
                </FaqItem>
              )
            })}
          </FaqAccordion>
        </div>
      </section>
    )
  },
})
