import { defineCapsule } from '#/capsules/openui.ts'
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
 * CorporateFaq — Swiss-corporate asymmetric FAQ ledger for an enterprise /
 * corporate B2B site. A 4/8 split: the left rail holds a mono "07 / FAQ"
 * index, the left-aligned heading, the lede, and a tabular question count,
 * staying sticky on desktop; the right column stacks square-edged native
 * HTML5 details/summary items separated by hairline rules, each summary led
 * by a giant mono tabular question numeral with a chevron icon that rotates
 * on open. Use to answer common questions about pricing, security,
 * deployment, and support on SaaS and enterprise product pages.
 */
export const CorporateFaq = defineCapsule({
  name: 'CorporateFaq',
  description:
    'Swiss-corporate asymmetric FAQ ledger for an enterprise / corporate B2B site: a 4/8 split with a sticky left rail (mono index, left-aligned heading, lede, tabular question count) beside a right column of square-edged native HTML5 details/summary items separated by hairline rules, each summary led by a giant mono tabular question numeral and a chevron icon that rotates on open. Use to answer common questions about pricing, security, deployment, and support on SaaS and enterprise product pages.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** FAQ items: question + answer. */
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Frequently asked questions'
    const description =
      props.description ??
      'Everything you need to know about Nexus enterprise solutions.'
    const items = props.items?.length
      ? props.items
      : [
          {
            q: 'What is the typical implementation timeline?',
            a: 'Most implementations are completed within 90-120 days, depending on complexity and scope. Our phased approach ensures minimal disruption to your operations, with parallel systems running during the transition period. Enterprise and Global plans include dedicated project managers to accelerate deployment.',
          },
          {
            q: 'How does your pricing model work?',
            a: 'Our Professional and Enterprise plans are priced as flat monthly subscriptions based on employee count and feature requirements. The Global plan is customized based on your specific needs, including multi-region deployment, custom SLAs, and specialized compliance requirements. All plans include implementation support.',
          },
          {
            q: 'What security certifications do you maintain?',
            a: 'Nexus maintains SOC 2 Type II, ISO 27001, ISO 9001, and HIPAA compliance certifications. Our platform is GDPR compliant and we undergo annual third-party security audits. Enterprise and Global customers receive access to our compliance documentation and can request custom security assessments.',
          },
          {
            q: 'Do you offer on-premise deployment options?',
            a: 'Yes, our Global plan includes on-premise, hybrid, and private cloud deployment options for organizations with specific data residency or regulatory requirements. Our solutions can be deployed in your own data centers while maintaining the same management and monitoring capabilities as our cloud offering.',
          },
          {
            q: 'What support options are available?',
            a: 'Professional plans include 24/7 email and chat support with 4-hour response times. Enterprise plans add 24/7 phone support and dedicated success managers with 1-hour response times. Global plans include a dedicated technical account manager, quarterly business reviews, and custom SLA guarantees.',
          },
          {
            q: 'Can I integrate with existing systems?',
            a: 'Absolutely. Nexus provides comprehensive REST APIs, webhooks, and pre-built connectors for major enterprise systems including Salesforce, SAP, Oracle, Workday, ServiceNow, and 200+ other platforms. Our integration team can build custom connectors for proprietary systems as part of your implementation.',
          },
        ]

    return (
      <section className={cn('bg-background py-16 lg:py-28', props.className)}>
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <span
                  aria-hidden="true"
                  className="mb-4 block font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                >
                  07 / FAQ
                </span>
                <SectionHeading
                  align="left"
                  title={heading}
                  subtitle={description}
                  className="gap-3"
                  titleClassName="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
                  subtitleClassName="text-lg text-muted-foreground"
                />
                <p
                  aria-hidden="true"
                  className="mt-8 border-t border-border pt-4 font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-muted-foreground/60"
                >
                  {String(items.length).padStart(2, '0')} questions
                </p>
              </div>
            </div>
            <FaqAccordion className="space-y-0 border-t border-border lg:col-span-8">
              {items.map((item, i) => (
                <FaqItem
                  key={item.q}
                  className="rounded-none border-x-0 border-b border-t-0 border-border bg-background"
                >
                  <FaqQuestion className="select-none gap-4 px-0 py-6">
                    <span className="flex min-w-0 items-baseline gap-4">
                      <span
                        aria-hidden="true"
                        className="shrink-0 font-mono text-2xl font-semibold leading-none tracking-tight tabular-nums text-muted-foreground/50"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="font-medium tracking-tight text-foreground">
                        {item.q}
                      </h3>
                    </span>
                    <FaqQuestionIcon />
                  </FaqQuestion>
                  <FaqAnswer
                    asChild
                    className="px-0 pb-6 leading-relaxed lg:pl-12"
                  >
                    <div>{item.a}</div>
                  </FaqAnswer>
                </FaqItem>
              ))}
            </FaqAccordion>
          </div>
        </Container>
      </section>
    )
  },
})
