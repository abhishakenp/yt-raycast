import { defineCapsule } from '#/capsules/openui.ts'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * KnowledgeBaseFaq — "Terminal-docs" accessible, JS-free FAQ ledger for a help
 * center. An asymmetric 4:8 split under a giant ghost `?` watermark: the left
 * rail (sticky on lg) holds a left-aligned SectionHeading — mono "FAQ" eyebrow,
 * extrabold title, muted subtitle — plus a tabular mono entry count over a
 * hairline rule. The right column is a collapsed hairline question ledger of
 * native <details>/<summary> rows: each summary pairs a tabular mono `Q index`
 * numeral with the question and a plus glyph that rotates 45° on open, and the
 * answer reveals under a hairline left rail indented to the question column.
 * Pure semantic HTML (no JS state) so it stays keyboard- and screen-reader-
 * accessible by default; the first item opens by default. Use as the FAQ
 * section of a knowledge base, support portal, docs site or any page answering
 * common questions. Renders fully with no props via baked-in defaults. Theme
 * tokens only.
 */
export const KnowledgeBaseFaq = defineCapsule({
  name: 'KnowledgeBaseFaq',
  description:
    "Terminal-docs accessible, JS-free FAQ ledger for a help center: an asymmetric 4:8 split under a giant ghost '?' watermark — a sticky left rail with a left-aligned SectionHeading (mono 'FAQ' eyebrow, extrabold title, muted subtitle) and a tabular mono entry count over a hairline rule, beside a collapsed hairline ledger of native <details>/<summary> rows. Each summary pairs a tabular mono index numeral with the question and a plus glyph rotating 45° on open; the answer reveals under a hairline left rail indented to the question column. Pure semantic HTML — keyboard- and screen-reader-accessible by default, no client state; the first item opens by default. Use as the FAQ section of a knowledge base, support portal, docs site or any page answering common questions. Theme tokens only.",
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
        className={cn(
          'relative overflow-hidden bg-background py-16 sm:py-20',
          props.className,
        )}
        aria-labelledby="kb-faq-heading"
      >
        {/* Giant ghost question mark — the section's reading anchor. */}
        <Watermark className="-bottom-16 -left-6 font-mono text-[14rem] sm:text-[18rem] lg:text-[24rem]">
          ?
        </Watermark>

        <Container className="relative">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left rail: heading + mono meta, sticky on lg. */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <SectionHeading
                  eyebrow="FAQ"
                  title={heading}
                  subtitle={description}
                  align="left"
                  className="gap-3"
                  titleId="kb-faq-heading"
                  eyebrowClassName="font-mono text-[11px] font-normal uppercase tracking-[0.22em] text-muted-foreground"
                  titleClassName="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
                  subtitleClassName="text-muted-foreground"
                />
                <p
                  aria-hidden="true"
                  className="mt-6 border-t border-border pt-4 font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-muted-foreground/60"
                >
                  [ {String(items.length).padStart(2, '0')} entries ]
                </p>
              </div>
            </div>

            {/* Right column: collapsed hairline question ledger. */}
            <div className="lg:col-span-8">
              <FaqAccordion variant="divided" className="space-y-0">
                {items.map((item, index) => (
                  <FaqItem
                    key={item.question}
                    open={index === 0}
                    variant="divided"
                    className="rounded-none border-0 bg-transparent"
                  >
                    <FaqQuestion className="items-baseline gap-4 rounded-none px-0 text-base font-semibold tracking-tight text-card-foreground transition-colors hover:text-foreground">
                      <span
                        aria-hidden="true"
                        className="shrink-0 font-mono text-[11px] font-normal tabular-nums tracking-[0.2em] text-muted-foreground/60"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1">{item.question}</span>
                      <FaqQuestionIcon variant="plus" className="self-center" />
                    </FaqQuestion>
                    <FaqAnswer className="ml-8 mt-3 border-l-2 border-border pl-4 text-sm leading-relaxed">
                      {item.answer}
                    </FaqAnswer>
                  </FaqItem>
                ))}
              </FaqAccordion>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
