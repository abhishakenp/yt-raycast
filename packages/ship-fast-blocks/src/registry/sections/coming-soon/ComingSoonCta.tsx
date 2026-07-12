import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from '../newsletter/newsletter-interactions.tsx'

/**
 * ComingSoonCta — final email-capture CTA band for a "launching soon" / waitlist
 * pre-launch landing page. A centered heading and supporting paragraph above an
 * inline email-capture form with a primary submit button, followed by a contact
 * email line below. Form submit writes to the shared Lakebed subscriber list and
 * the contact email link routes through useNavigate. Use as the closing conversion push on SaaS waitlists, app pre-launch
 * pages, beta sign-ups, or any "notify me" / early-access landing page. Renders
 * fully with no props via baked-in defaults.
 */
export const ComingSoonCta = defineCapsule({
  name: 'ComingSoonCta',
  description:
    "Final email-capture CTA band for a 'launching soon' / waitlist pre-launch landing page: centered heading and supporting paragraph above an inline email-capture form with a primary submit button, followed by a contact email line below. Form submit writes to the shared Lakebed subscriber list and the contact email link routes through useNavigate. Use as the closing conversion push on SaaS waitlists, app pre-launch pages, beta sign-ups, or 'notify me' / early-access landing pages.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Email input placeholder text. */
    emailPlaceholder: z.string().optional(),
    /** Submit button label. */
    submit: z.string().optional(),
    /** Label prefix before the contact email. */
    contactPrefix: z.string().optional(),
    /** Contact email shown as a routable link. */
    contactEmail: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: newsletterLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Ready to transform how your team works?'
    const description =
      props.description ??
      'Join 12,000+ teams on the waitlist. Early access members save 50% for 6 months.'
    const emailPlaceholder = props.emailPlaceholder ?? 'Enter your email'
    const submit = props.submit ?? 'Get early access'
    const contactPrefix = props.contactPrefix ?? 'Questions? Reach us at'
    const contactEmail = props.contactEmail ?? 'hello@nexus.app'

    const inputCls =
      'flex-1 rounded-lg border border-input bg-background px-5 py-3.5 text-sm text-foreground placeholder-muted-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring'
    const submitCls =
      'whitespace-nowrap rounded-lg bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'

    return (
      <section
        className={cn(
          'w-full px-4 py-24 sm:px-6 lg:py-28 lg:px-8 xl:px-12',
          props.className,
        )}
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-light text-foreground sm:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg font-light text-muted-foreground">
            {description}
          </p>
          <NewsletterSubscribeForm
            lakebed={lakebed}
            source={submit}
            placeholder={emailPlaceholder}
            buttonLabel={submit}
            successMessage="You're on the waitlist. Early access updates will arrive by email."
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
            inputClassName={inputCls}
            buttonClassName={`${submitCls} disabled:pointer-events-none disabled:opacity-70`}
            emailLabel="Email address for final waitlist signup"
          />
          <p className="mt-8 text-xs text-muted-foreground">
            {contactPrefix}{' '}
            <button
              type="button"
              onClick={() => go(contactEmail)}
              className="underline transition-colors hover:text-foreground"
            >
              {contactEmail}
            </button>
          </p>
        </div>
      </section>
    )
  },
})
