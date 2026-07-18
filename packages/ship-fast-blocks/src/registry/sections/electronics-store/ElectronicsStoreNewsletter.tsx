import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  NewsletterCta,
  NewsletterCtaDescription,
  NewsletterCtaFineprint,
  NewsletterCtaHeading,
} from '#/section-kit/NewsletterCta.tsx'
import { SubscribeBand } from '#/section-kit/SubscribeBand.tsx'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from '../newsletter/newsletter-interactions.tsx'

/**
 * ElectronicsStoreNewsletter — a dark inverted, centered newsletter CTA band for
 * an electronics storefront. A bold heading, a muted supporting paragraph, an
 * inline email capture form (translucent input + solid submit button that stacks
 * on mobile), and a fine-print disclaimer beneath. The form submit writes to the
 * shared Lakebed subscriber list. Use as a closing email-capture /
 * discount-incentive band on electronics stores, gadget shops, consumer-tech
 * retailers, or any product catalog.
 */
export const ElectronicsStoreNewsletter = defineCapsule({
  name: 'ElectronicsStoreNewsletter',
  description:
    "Dark inverted, centered newsletter CTA band for an electronics storefront: a bold heading, a muted supporting paragraph, an inline email capture form (translucent input + solid submit button that stacks on mobile), and a fine-print disclaimer beneath. The form submit writes to the shared Lakebed subscriber list so another subscribe block or admin view can react immediately. Use as a closing email-capture / discount-incentive band (e.g. 'Get 10% Off Your First Order') on electronics stores, gadget shops, consumer-tech retailers, or any product catalog.",
  props: z.object({
    /** Band heading. */
    heading: z.string().optional(),
    /** Supporting paragraph. */
    description: z.string().optional(),
    /** Email input placeholder. */
    placeholder: z.string().optional(),
    /** Submit button label. */
    submit: z.string().optional(),
    /** Fine-print disclaimer beneath the form. */
    disclaimer: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: newsletterLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Get 10% Off Your First Order'
    const description =
      props.description ??
      'Subscribe to our newsletter for exclusive deals, new product announcements, and expert tech tips delivered to your inbox.'
    const placeholder = props.placeholder ?? 'Enter your email'
    const submit = props.submit ?? 'Subscribe'
    const disclaimer =
      props.disclaimer ??
      'By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.'

    return (
      <SubscribeBand
        variant="inverted"
        className={cn('py-16 lg:py-24', props.className)}
      >
        <NewsletterCta asChild>
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <NewsletterCtaHeading className="text-background lg:text-4xl">
              {heading}
            </NewsletterCtaHeading>
            <NewsletterCtaDescription className="text-background/60">
              {description}
            </NewsletterCtaDescription>
            <NewsletterSubscribeForm
              lakebed={lakebed}
              source={submit}
              placeholder={placeholder}
              buttonLabel={submit}
              successMessage="You're subscribed. Watch your inbox for the next tech drop."
              className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
              inputClassName="flex-1 rounded-lg border border-background/20 bg-background/10 px-4 py-3 text-background placeholder:text-background/50 focus:border-background/40 focus:outline-none"
              buttonClassName="rounded-lg bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-background/90 disabled:pointer-events-none disabled:opacity-70"
              emailLabel={placeholder}
              statusClassName="text-background/50"
            />
            <NewsletterCtaFineprint className="text-sm text-background/50">
              {disclaimer}
            </NewsletterCtaFineprint>
          </div>
        </NewsletterCta>
      </SubscribeBand>
    )
  },
})
