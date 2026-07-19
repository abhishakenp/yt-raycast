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
 * CorporateFaq — accordion FAQ section for an enterprise / corporate B2B site.
 * A centered section heading above a stacked set of native HTML5 details/summary
 * items with a smooth open ring highlight and a chevron icon that rotates on open.
 * Use to answer common questions about pricing, security, deployment, and support
 * on SaaS and enterprise product pages.
 */
export const CorporateFaq = defineCapsule({
  name: 'CorporateFaq',
  description:
    'Accordion FAQ section for an enterprise / corporate B2B site: centered heading above a stacked set of native HTML5 details/summary items with a smooth open ring highlight and a chevron icon that rotates on open. Use to answer common questions about pricing, security, deployment, and support on SaaS and enterprise product pages.',
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
      <section className={cn('bg-muted/50 py-20 lg:py-28', props.className)}>
        <Container size="sm">
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-16 gap-0"
            titleClassName="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <FaqAccordion>
            {items.map((item) => (
              <FaqItem
                key={item.q}
                className="bg-background open:ring-1 open:ring-border"
              >
                <FaqQuestion className="select-none p-6">
                  <h3 className="font-medium text-foreground">{item.q}</h3>
                  <FaqQuestionIcon />
                </FaqQuestion>
                <FaqAnswer asChild className="px-6 pb-6 leading-relaxed">
                  <div>{item.a}</div>
                </FaqAnswer>
              </FaqItem>
            ))}
          </FaqAccordion>
        </Container>
      </section>
    )
  },
})
