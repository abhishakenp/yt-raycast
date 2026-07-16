import { defineCapsule } from '#/capsules/openui.ts'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * NoCodeFaq — centered-header accordion FAQ in a narrow column on a bright
 * canvas. A muted eyebrow and heading sit above a stack of native
 * details/summary cards: each bordered card shows a question with a chevron that
 * rotates open and reveals a muted answer paragraph. Use as the FAQ / objection-
 * handling section on a no-code builder, SaaS, or product landing page. Renders
 * fully with no props.
 */
export const NoCodeFaq = defineCapsule({
  name: 'NoCodeFaq',
  description:
    'Centered-header accordion FAQ in a narrow column on a bright canvas: a muted eyebrow and heading above a stack of native details/summary cards, each bordered card showing a question with a chevron that rotates open and reveals a muted answer paragraph. Use as the FAQ / objection-handling section on a no-code / app-builder SaaS or product landing page.',
  props: z.object({
    /** Muted uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Question / answer pairs. */
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'FAQ'
    const heading = props.heading ?? 'Frequently asked questions'
    const items = props.items?.length
      ? props.items
      : [
          {
            q: 'Do I need any coding knowledge to use Buildr?',
            a: 'Not at all! Buildr is designed for everyone, regardless of technical background. Our drag-and-drop interface lets you build professional apps visually. If you do know code, you can add custom HTML, CSS, and JavaScript for advanced customization.',
          },
          {
            q: 'Can I use my own custom domain?',
            a: "Yes! Pro and Enterprise plans support custom domains with free SSL certificates. Simply connect your domain in the settings, and we'll handle the DNS configuration automatically. Your site will be live on your domain within minutes.",
          },
          {
            q: 'What happens if I exceed my plan limits?',
            a: "We'll notify you when you're approaching your limits. You can upgrade anytime to unlock more features. Your app will never go offline unexpectedly — we prioritize keeping your site running smoothly.",
          },
          {
            q: 'Is there a free trial for paid plans?',
            a: "Yes, all paid plans come with a 14-day free trial. No credit card required to start. You'll have full access to all features during the trial, and you can cancel anytime before being charged.",
          },
          {
            q: 'Can I export my app if I want to move elsewhere?',
            a: "Absolutely. Your data belongs to you. Pro and Enterprise users can export clean, semantic HTML/CSS code of their apps anytime. We believe in building on Buildr because you love it, not because you're locked in.",
          },
          {
            q: 'Do you offer refunds?',
            a: "Yes, we offer a 30-day money-back guarantee on all paid plans. If Buildr isn't the right fit for you, contact our support team within 30 days of your purchase for a full refund, no questions asked.",
          },
        ]

    return (
      <section
        className={cn('bg-background py-24', props.className)}
        aria-labelledby="nc-faq"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </span>
            <h2
              id="nc-faq"
              className="text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              {heading}
            </h2>
          </div>
          <FaqAccordion>
            {items.map((item) => (
              <FaqItem key={item.q} className="transition-all open:shadow-sm">
                <FaqQuestion className="p-6">
                  <h3 className="font-semibold text-card-foreground">
                    {item.q}
                  </h3>
                  <FaqQuestionIcon className="ml-4" />
                </FaqQuestion>
                <FaqAnswer asChild className="px-6 pb-6">
                  <div>{item.a}</div>
                </FaqAnswer>
              </FaqItem>
            ))}
          </FaqAccordion>
        </div>
      </section>
    )
  },
})
