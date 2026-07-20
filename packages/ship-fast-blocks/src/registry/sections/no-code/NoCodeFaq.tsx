import { defineCapsule } from '#/capsules/openui.ts'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * NoCodeFaq — block-builder-kinetic asymmetric 4/8 FAQ ledger for a no-code /
 * app-builder SaaS landing page on a bright canvas. The left rail holds a mono
 * eyebrow tag, the heading with a tilted primary marker block behind the key
 * word, and a giant ghost "?" watermark; the right column stacks native
 * <details> rows in a hairline-divided ledger — each row pairs a mono
 * question-index numeral with the question, a plus icon that rotates open, and
 * a revealed muted answer paragraph. Sharp, scannable, ledger-precise. Use as
 * the FAQ / objection-handling section on a no-code / app-builder SaaS or
 * product landing page. Renders fully with no props.
 */
export const NoCodeFaq = defineCapsule({
  name: 'NoCodeFaq',
  description:
    'Block-builder-kinetic asymmetric 4/8 FAQ ledger for a no-code / app-builder SaaS landing page: a left rail with mono eyebrow, marker-highlighted heading and giant ghost ? watermark beside a hairline-divided ledger of native <details> rows, each pairing a mono question-index numeral with the question, a plus icon that rotates open, and a revealed muted answer paragraph. Sharp and scannable. Use as the FAQ / objection-handling section on a no-code / app-builder SaaS or product landing page.',
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

    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-16 lg:py-24',
          props.className,
        )}
        aria-labelledby="nc-faq"
      >
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Left rail: mono eyebrow, marker heading, ghost ? watermark. */}
            <div className="relative lg:col-span-4">
              <MonoTag className="mb-4 block">
                {eyebrow}
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · {String(items.length).padStart(2, '0')} entries
                </span>
              </MonoTag>
              <h2
                id="nc-faq"
                className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
              >
                {headingLead}{' '}
                <span className="relative ml-[0.12em] inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.15em] inset-y-[0.05em] -rotate-1 bg-primary"
                  />
                  <span className="relative text-primary-foreground">
                    {headingMark}
                  </span>
                </span>
              </h2>
              <Watermark className="left-0 top-full hidden -translate-y-8 text-[11rem] lg:block">
                ?
              </Watermark>
            </div>

            {/* Right column: hairline-divided question ledger. */}
            <FaqAccordion
              variant="divided"
              className="border-border lg:col-span-8"
            >
              {items.map((item, index) => (
                <FaqItem key={item.q} variant="divided" className="py-0">
                  <FaqQuestion className="select-none gap-4 py-5">
                    <span className="flex min-w-0 items-baseline gap-4">
                      <span
                        aria-hidden="true"
                        className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="font-semibold tracking-tight text-foreground">
                        {item.q}
                      </span>
                    </span>
                    <FaqQuestionIcon variant="plus" />
                  </FaqQuestion>
                  <FaqAnswer
                    asChild
                    className="pb-6 pl-0 leading-relaxed sm:pl-10"
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
