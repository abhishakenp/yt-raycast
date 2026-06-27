import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from '../newsletter/newsletter-interactions.tsx'

/**
 * CafeNewsletter — newsletter sign-up CTA for a cozy cafe / coffee shop page,
 * on a soft primary/10 band. A centered serif heading and supporting paragraph
 * above a rounded email input + submit button form, plus a fine-print line
 * underneath. The form submit writes to the shared Lakebed subscriber list. Use
 * as a list-building section for cafes, bakeries, tea houses, or any small
 * business. Renders fully with no props via baked-in defaults.
 */
export const CafeNewsletter = defineCapsule({
  name: 'CafeNewsletter',
  description:
    'Newsletter sign-up CTA for a cozy cafe page on a soft primary/10 band: centered serif heading and supporting paragraph above a rounded email input and submit button form, plus a fine-print line. The form submit writes to the shared Lakebed subscriber list. Use as a list-building section for cafes, bakeries, tea houses, or any small business.',
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
      <section className={cn('bg-primary/10 py-20', props.className)}>
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="mb-4 font-serif text-3xl font-medium text-foreground sm:text-4xl">
            {heading}
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
            {description}
          </p>
          <NewsletterSubscribeForm
            lakebed={lakebed}
            source={submitTarget}
            placeholder={placeholder}
            buttonLabel={submit}
            successMessage="You're subscribed. Cafe notes and seasonal menus will arrive by email."
            className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row"
            inputClassName="flex-1 rounded-full border border-input bg-background px-5 py-3.5 text-foreground placeholder-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
            buttonClassName="whitespace-nowrap rounded-full bg-foreground px-8 py-3.5 font-medium text-background transition-colors hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-70"
            emailLabel="Email address for newsletter"
          />
          <p className="mt-4 text-xs text-muted-foreground">{fineprint}</p>
        </div>
      </section>
    )
  },
})
