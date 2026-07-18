import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'
import {
  NewsletterCtaDescription,
  NewsletterCtaFineprint,
  NewsletterCtaHeading,
} from '#/section-kit/NewsletterCta.tsx'
import { SubscribeBand, SubscribeForm } from '#/section-kit/SubscribeBand.tsx'
import { PublicationSubscribeForm } from './publication-interactions.tsx'
import { publicationLakebed } from './publication-lakebed.ts'

/**
 * BlogSubscribe — centered newsletter signup band for an editorial blog or
 * publication. A rounded card holds an eyebrow pill, a large headline, a
 * supporting subtitle, and an email-capture form (an email input plus a submit
 * button laid out as a responsive flex — stacked on mobile, inline on larger
 * screens), followed by a live subscriber status line. Submitting writes to the
 * shared Lakebed subscriber list so another subscribe block or admin view can
 * react immediately. Use as the Subscribe section near the foot of blog
 * homepages, magazine indexes, or editorial landing pages to grow the mailing
 * list.
 */
export const BlogSubscribe = defineCapsule({
  name: 'BlogSubscribe',
  description:
    'Centered newsletter signup band for an editorial blog or publication: a rounded card with an eyebrow pill, a large headline, a supporting subtitle, and an email-capture form (email input plus submit button laid out as a responsive flex — stacked on mobile, inline on larger screens), followed by a live subscriber status line. Submitting writes to the shared Lakebed subscriber list so another subscribe block or admin view can react immediately. Use as the Subscribe section near the foot of blog homepages, magazine indexes, or editorial landing pages to grow the mailing list.',
  props: z.object({
    /** Small uppercase pill above the heading. */
    eyebrow: z.string().optional(),
    /** Main headline of the signup band. */
    heading: z.string().optional(),
    /** Supporting subtitle below the heading. */
    subheading: z.string().optional(),
    /** Email input placeholder. */
    placeholder: z.string().optional(),
    /** Submit button label. */
    ctaLabel: z.string().optional(),
    /** Subscriber source label for the shared Lakebed subscriber record. */
    ctaTarget: z.string().optional(),
    /** Small reassurance line below the form. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: publicationLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Newsletter'
    const heading = props.heading ?? 'Get our best essays in your inbox'
    const subheading =
      props.subheading ??
      'Join 12,000+ readers. One thoughtful email a week — no noise.'
    const placeholder = props.placeholder ?? 'you@example.com'
    const ctaLabel = props.ctaLabel ?? 'Subscribe'
    const ctaTarget = props.ctaTarget ?? 'Subscribe'
    const note = props.note ?? 'No spam. Unsubscribe anytime.'

    return (
      <SubscribeBand
        aria-label="Newsletter signup"
        className={cn('mx-auto w-full max-w-4xl px-6 py-16', props.className)}
      >
        <Card
          rounded="2xl"
          padding="lg"
          className="text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)] md:p-12"
        >
          <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-accent">
            {eyebrow}
          </span>
          <NewsletterCtaHeading className="mt-5 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {heading}
          </NewsletterCtaHeading>
          <NewsletterCtaDescription className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {subheading}
          </NewsletterCtaDescription>
          <SubscribeForm asChild>
            <PublicationSubscribeForm
              lakebed={lakebed}
              source={ctaTarget}
              placeholder={placeholder}
              buttonLabel={ctaLabel}
              successMessage="You're on the list. Watch your inbox for the next edition."
              className="mx-auto mt-7 flex w-full max-w-xl flex-col items-stretch gap-3 sm:flex-row"
              inputClassName="w-full flex-1 rounded-full border border-input bg-background px-5 py-3 text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
              buttonClassName="shrink-0 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
            />
          </SubscribeForm>
          <NewsletterCtaFineprint className="mt-4 text-[0.8rem] text-muted-foreground">
            {note}
          </NewsletterCtaFineprint>
        </Card>
      </SubscribeBand>
    )
  },
})
