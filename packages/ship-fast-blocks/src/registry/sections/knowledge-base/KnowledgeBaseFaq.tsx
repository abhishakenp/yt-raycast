import { defineCapsule } from '#/capsules/openui.ts'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { Container } from '#/section-kit/Container.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * KnowledgeBaseFaq — native expand/collapse FAQ accordion for a help center. A
 * centered heading + description above a narrow stack of bordered card
 * <details>/<summary> rows: each summary shows the question with a chevron that
 * rotates when open, revealing the answer paragraph below. Uses native HTML
 * disclosure (no JS state). Calm, light, editorial. Use as the FAQ section of a
 * knowledge base, support portal, docs site or any page answering common
 * questions. Renders fully with no props via baked-in defaults.
 */
export const KnowledgeBaseFaq = defineCapsule({
  name: 'KnowledgeBaseFaq',
  description:
    'Native expand/collapse FAQ accordion for a help center: a centered heading + description above a narrow stack of bordered card <details>/<summary> rows — each summary shows the question with a chevron that rotates when open, revealing the answer paragraph. Uses native HTML disclosure (no JS state). Calm, light, editorial. Use as the FAQ section of a knowledge base, support portal, docs site or any page answering common questions.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Frequently Asked Questions'
    const description =
      props.description ??
      'Quick answers to the most common questions we receive.'
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'What plans are available and how much do they cost?',
            answer:
              'We offer three plans: Starter ($9/month), Professional ($29/month), and Enterprise ($99/month). The Starter plan includes core features for individuals, Professional adds team collaboration and advanced analytics, and Enterprise includes dedicated support, custom integrations, and SLA guarantees. All plans start with a 14-day free trial.',
          },
          {
            question: 'How do I reset my password or recover my account?',
            answer:
              'On the login page, click "Forgot password" and enter your email address. You\'ll receive a reset link valid for 24 hours. If you no longer have access to your email, contact support with proof of account ownership for manual recovery.',
          },
          {
            question: 'Can I cancel my subscription at any time?',
            answer:
              "Yes, you can cancel anytime from your Account Settings under Billing. Your access continues until the end of your current billing period. We also offer a 30-day money-back guarantee for annual plans if you're not satisfied.",
          },
          {
            question: 'What browsers and devices are supported?',
            answer:
              'We support Chrome 90+, Firefox 88+, Safari 14+, and Edge 90+ on Windows 10+, macOS 10.15+, and modern Linux distributions. Mobile apps are available for iOS 14+ and Android 10+. Internet Explorer is not supported.',
          },
          {
            question: 'How do I contact support for urgent issues?',
            answer:
              'Professional and Enterprise plans have access to priority support via live chat (available 9 AM - 6 PM EST) and email with 4-hour response SLAs. Enterprise customers also receive a dedicated account manager and phone support for critical issues.',
          },
          {
            question: 'Is my data secure and where is it stored?',
            answer:
              'Your data is encrypted at rest (AES-256) and in transit (TLS 1.3). We store data in SOC 2 Type II certified data centers in the US (Oregon), EU (Frankfurt), and APAC (Singapore). You can choose your data region during account setup. We never sell your data and comply with GDPR and CCPA.',
          },
        ]
    return (
      <section
        className={cn('bg-background py-16 sm:py-20', props.className)}
        aria-labelledby="kb-faq-heading"
      >
        <Container size="sm">
          <div className="mb-12 text-center">
            <h2
              id="kb-faq-heading"
              className="mb-3 text-2xl font-semibold text-foreground sm:text-3xl"
            >
              {heading}
            </h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <FaqAccordion>
            {items.map((item) => (
              <FaqItem key={item.question} variant="overflow-bordered">
                <FaqQuestion className="p-6 transition-colors hover:bg-muted">
                  <span className="pr-8 text-base font-medium text-card-foreground">
                    {item.question}
                  </span>
                  <FaqQuestionIcon />
                </FaqQuestion>
                <FaqAnswer asChild className="px-6 pb-6">
                  <div>
                    <p>{item.answer}</p>
                  </div>
                </FaqAnswer>
              </FaqItem>
            ))}
          </FaqAccordion>
        </Container>
      </section>
    )
  },
})
