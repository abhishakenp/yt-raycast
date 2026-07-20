import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from '../newsletter/newsletter-interactions.tsx'
import {
  NewsletterCtaDescription,
  NewsletterCtaFineprint,
  NewsletterCtaHeading,
} from '#/section-kit/NewsletterCta.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * CafeNewsletter — newsprint subscription-slip band for a cozy cafe / coffee
 * shop page on a kraft-toned muted wash. A dashed-border subscription card
 * (like a clipped coupon) holds an asymmetric 7:5 split: the left column
 * carries a rotated mono "Subscribe" stamp chip, the serif heading, and the
 * supporting paragraph; the right column stacks the email form — a sharp
 * hairline-underlined input above a full-width inverted square submit button
 * with press feedback — plus a mono fine-print line. The form submit writes to
 * the shared Lakebed subscriber list. Use as a list-building section for
 * cafes, bakeries, tea houses, or any small business. Renders fully with no
 * props via baked-in defaults.
 */
export const CafeNewsletter = defineCapsule({
  name: 'CafeNewsletter',
  description:
    "Newsprint subscription-slip band for a cozy cafe page on a kraft-toned muted wash: a dashed-border coupon-style card holds an asymmetric 7:5 split — left with a rotated mono 'Subscribe' stamp chip, serif heading, and supporting paragraph; right with a sharp hairline-underlined email input above a full-width inverted square submit button with press feedback, plus a mono fine-print line. The form submit writes to the shared Lakebed subscriber list. Use as a list-building section for cafes, bakeries, tea houses, or any small business.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Email input placeholder. */
    placeholder: z.string().optional(),
    /** Submit button label. */
    submit: z.string().optional(),
    /** Fine print under the form. */
    fineprint: z.string().optional(),
    /** Subscriber source label recorded when the form is submitted. */
    submitTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: newsletterLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Join the flock'
    const description =
      props.description ??
      'Get first dibs on new seasonal drinks, events, and coffee education workshops. We send one email a week—no spam, ever.'
    const placeholder = props.placeholder ?? 'Enter your email'
    const submit = props.submit ?? 'Subscribe'
    const fineprint =
      props.fineprint ??
      'By subscribing, you agree to receive marketing emails. Unsubscribe anytime.'
    const submitTarget = props.submitTarget ?? submit

    return (
      <section
        className={cn(
          'bg-muted/40 pt-16 pb-16 lg:pt-20 lg:pb-20',
          props.className,
        )}
      >
        <Container size="xl" className="px-6">
          <div className="border border-dashed border-foreground/30 bg-background/70 p-7 sm:p-10 lg:p-14">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
              <div className="lg:col-span-7">
                <span className="inline-flex -rotate-2 items-center border border-primary/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                  Subscribe
                </span>
                <NewsletterCtaHeading className="mt-5 font-serif text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
                  {heading}
                </NewsletterCtaHeading>
                <NewsletterCtaDescription className="mx-0 mt-4 max-w-lg text-left">
                  {description}
                </NewsletterCtaDescription>
              </div>
              <div className="lg:col-span-5">
                <NewsletterSubscribeForm
                  lakebed={lakebed}
                  source={submitTarget}
                  placeholder={placeholder}
                  buttonLabel={submit}
                  successMessage="You're subscribed. Cafe notes and seasonal menus will arrive by email."
                  className="flex flex-col gap-4"
                  inputClassName="w-full rounded-none border-0 border-b border-foreground/30 bg-transparent px-1 py-3 font-serif text-lg text-foreground placeholder-muted-foreground focus:border-foreground focus:outline-none"
                  buttonClassName="w-full rounded-none border border-foreground bg-foreground px-8 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-background transition-colors duration-150 hover:bg-background hover:text-foreground active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                  emailLabel="Email address for newsletter"
                />
                <NewsletterCtaFineprint className="mt-4 text-left font-mono text-[10px] uppercase tracking-[0.1em]">
                  {fineprint}
                </NewsletterCtaFineprint>
              </div>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
