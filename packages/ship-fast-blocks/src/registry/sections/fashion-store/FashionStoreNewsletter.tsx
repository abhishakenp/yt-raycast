import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from '../newsletter/newsletter-interactions.tsx'

/**
 * FashionStoreNewsletter — centered newsletter signup CTA for a minimalist
 * fashion store. A narrow, centered section with an eyebrow + serif heading +
 * description above a real inline email form (a labelled email input beside a
 * filled primary submit button) and a small disclaimer note. The form submit
 * writes to the shared Lakebed subscriber list. Use to capture subscribers for
 * new-collection drops, offers and editorial for clothing brands, boutiques, or
 * apparel shops.
 */
export const FashionStoreNewsletter = defineCapsule({
  name: 'FashionStoreNewsletter',
  description:
    'Centered newsletter signup CTA for a minimalist fashion store: a narrow, centered section with an eyebrow + serif heading + description above a real inline email form (a labelled email input beside a filled primary submit button) and a small disclaimer note. The form submit writes to the shared Lakebed subscriber list so another subscribe block or admin view can react immediately. Use to capture subscribers for new-collection drops, exclusive offers and editorial content for clothing brands, boutiques, or apparel shops.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    placeholder: z.string().optional(),
    submit: z.string().optional(),
    disclaimer: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: newsletterLakebed,
  component: ({ props, lakebed }) => {
    const nlEyebrow = props.eyebrow ?? 'The Journal'
    const nlHeading = props.heading ?? 'Stay Informed'
    const nlDesc =
      props.description ??
      'Subscribe to receive early access to new collections, exclusive offers, and editorial content delivered to your inbox.'
    const nlPlaceholder = props.placeholder ?? 'Enter your email'
    const nlSubmit = props.submit ?? 'Subscribe'
    const nlDisclaimer =
      props.disclaimer ??
      'By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.'

    const eyebrowCls =
      'text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground'

    return (
      <section
        aria-label="Newsletter signup"
        className={cn('py-20 lg:py-28', props.className)}
      >
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className={cn(eyebrowCls, 'mb-4')}>{nlEyebrow}</p>
          <h2 className="mb-6 font-serif text-4xl font-normal sm:text-5xl lg:text-6xl">
            {nlHeading}
          </h2>
          <p className="mx-auto mb-10 max-w-lg text-muted-foreground">
            {nlDesc}
          </p>
          <NewsletterSubscribeForm
            lakebed={lakebed}
            source={nlSubmit}
            placeholder={nlPlaceholder}
            buttonLabel={nlSubmit}
            successMessage="You're subscribed. New collection drops will arrive by email."
            className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row"
            inputClassName="flex-1 border border-input bg-background px-4 py-4 text-foreground placeholder-muted-foreground transition-colors focus:border-ring focus:outline-none"
            buttonClassName="bg-primary px-8 py-4 text-sm font-medium tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
          />
          <p className="mt-4 text-xs text-muted-foreground">{nlDisclaimer}</p>
        </div>
      </section>
    )
  },
})
