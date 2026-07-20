import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  NewsletterCta,
  NewsletterCtaDescription,
  NewsletterCtaFineprint,
  NewsletterCtaHeading,
} from '#/section-kit/NewsletterCta.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SubscribeBand } from '#/section-kit/SubscribeBand.tsx'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from '../newsletter/newsletter-interactions.tsx'

/**
 * ElectronicsStoreNewsletter — a tech-brutalist inverted newsletter CTA band for
 * an electronics storefront. On a bg-foreground/text-background band: a mono
 * index eyebrow, an extrabold heading, a muted supporting paragraph, an inline
 * email capture form (squared border-2 translucent input + squared solid submit
 * button with a hard offset shadow and press feedback that stacks on mobile), and
 * a fine-print disclaimer beneath. The form submit writes to the shared Lakebed
 * subscriber list. Use as a closing email-capture / discount-incentive band on
 * electronics stores, gadget shops, consumer-tech retailers, or any product
 * catalog.
 */
export const ElectronicsStoreNewsletter = defineCapsule({
  name: 'ElectronicsStoreNewsletter',
  description:
    "Tech-brutalist inverted newsletter CTA band for an electronics storefront: on a bg-foreground/text-background band a mono index eyebrow, an extrabold heading, a muted supporting paragraph, an inline email capture form (squared border-2 translucent input + squared solid submit button with a hard offset shadow and press feedback that stacks on mobile), and a fine-print disclaimer beneath. The form submit writes to the shared Lakebed subscriber list so another subscribe block or admin view can react immediately. Use as a closing email-capture / discount-incentive band (e.g. 'Get 10% Off Your First Order') on electronics stores, gadget shops, consumer-tech retailers, or any product catalog.",
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
          <Container size="4xl" className="text-center">
            <span className="mb-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-background/60">
              <span aria-hidden="true" className="tabular-nums text-primary">
                [ 09 ]
              </span>
              Newsletter
            </span>
            <NewsletterCtaHeading className="text-4xl font-extrabold tracking-tight text-background lg:text-5xl">
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
              inputClassName="flex-1 rounded-none border-2 border-background/40 bg-background/10 px-4 py-3 text-background placeholder:text-background/50 focus:border-background focus:outline-none"
              buttonClassName="rounded-none border-2 border-background bg-background px-6 py-3 font-semibold text-foreground shadow-[5px_5px_0_0] shadow-background/40 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0] active:translate-y-0 active:shadow-[2px_2px_0_0] disabled:pointer-events-none disabled:opacity-70 motion-reduce:transform-none"
              emailLabel={placeholder}
              statusClassName="text-background/50"
            />
            <NewsletterCtaFineprint className="text-sm text-background/50">
              {disclaimer}
            </NewsletterCtaFineprint>
          </Container>
        </NewsletterCta>
      </SubscribeBand>
    )
  },
})
