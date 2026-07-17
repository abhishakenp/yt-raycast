import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from '../newsletter/newsletter-interactions.tsx'

import { Container } from '#/section-kit/Container.tsx'
import {
  NewsletterCta,
  NewsletterCtaDescription,
  NewsletterCtaFineprint,
  NewsletterCtaHeading,
} from '#/section-kit/NewsletterCta.tsx'

/**
 * BeautyStoreNewsletter — a dark newsletter CTA band for a beauty / skincare /
 * cosmetics storefront. A wide rounded-foreground card with a background image,
 * a centered eyebrow, a serif heading, a supporting paragraph, and a real email-
 * capture form (email input + submit button). Form submit writes to the shared
 * Lakebed subscriber list. Use as a list-building / first-order-discount
 * conversion block for e-commerce, beauty boxes, or DTC personal-care brands.
 */
export const BeautyStoreNewsletter = defineCapsule({
  name: 'BeautyStoreNewsletter',
  description:
    'Dark newsletter CTA band for a beauty / skincare / cosmetics storefront: a wide rounded-foreground card with a background image, centered eyebrow, serif heading, supporting paragraph, and a real email-capture form (email input + submit button). Form submit writes to the shared Lakebed subscriber list so another subscribe block or admin view can react immediately. Use as a list-building / first-order-discount conversion block for e-commerce, beauty boxes, or DTC personal-care brands.',
  props: z.object({
    /** Eyebrow text above heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Email field placeholder text. */
    placeholder: z.string().optional(),
    /** Submit button label. */
    submit: z.string().optional(),
    /** Fine-print note beneath the form. */
    note: z.string().optional(),
    /** Alt text driving the background image. */
    imageAlt: z.string().optional(),
    /** Subscriber source label recorded when the form is submitted. */
    submitTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: newsletterLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Limited Time Offer'
    const heading = props.heading ?? 'Join Our Beauty Community'
    const description =
      props.description ??
      'Subscribe to receive 15% off your first order, exclusive access to new arrivals, and personalized beauty recommendations.'
    const placeholder = props.placeholder ?? 'Enter your email'
    const submit = props.submit ?? 'Get 15% Off'
    const note = props.note ?? 'No spam, ever. Unsubscribe anytime.'
    const imageAlt =
      props.imageAlt ??
      'luxury skincare products arranged on dark marble surface'
    const submitTarget = props.submitTarget ?? submit

    return (
      <NewsletterCta
        variant="inverted"
        className={cn('py-20 lg:py-28', props.className)}
      >
        <Container>
          <div className="relative overflow-hidden rounded-xl bg-foreground">
            <div aria-hidden="true" className="absolute inset-0 opacity-20">
              <Image
                alt={imageAlt}
                w={1200}
                h={600}
                loading="lazy"
                className="size-full object-cover"
              />
            </div>
            <div className="relative px-8 py-16 text-center lg:px-16 lg:py-24">
              <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-widest text-primary">
                {eyebrow}
              </span>
              <NewsletterCtaHeading className="mx-auto mb-6 max-w-2xl font-serif text-3xl font-semibold text-background sm:text-4xl lg:text-5xl">
                {heading}
              </NewsletterCtaHeading>
              <NewsletterCtaDescription className="mx-auto mb-8 max-w-xl text-lg text-background/70">
                {description}
              </NewsletterCtaDescription>
              <NewsletterSubscribeForm
                lakebed={lakebed}
                source={submitTarget}
                placeholder={placeholder}
                buttonLabel={submit}
                successMessage="You're in. Your beauty offer and product edits will arrive by email."
                className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row"
                inputClassName="flex-1 rounded-full border border-border bg-background/10 px-6 py-4 text-background placeholder:text-background/50 focus:outline-none focus:ring-2 focus:ring-primary"
                buttonClassName="whitespace-nowrap rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
                statusClassName="text-background/60"
              />
              <NewsletterCtaFineprint className="mt-4 text-sm text-background/60">
                {note}
              </NewsletterCtaFineprint>
            </div>
          </div>
        </Container>
      </NewsletterCta>
    )
  },
})
