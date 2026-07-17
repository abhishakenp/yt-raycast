import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  NewsletterCta,
  NewsletterCtaDescription,
  NewsletterCtaFineprint,
  NewsletterCtaHeading,
} from '#/section-kit/NewsletterCta.tsx'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from '../newsletter/newsletter-interactions.tsx'

/**
 * MusicArtistMailing — dark, centered mailing-list CTA for a music artist /
 * band page. On a foreground-colored band: a thin heading, a lead paragraph, a
 * real inline email-subscribe form (rounded email input + pill submit button),
 * and a small reassurance note. The form submit writes to the shared Lakebed
 * subscriber list.
 * Warm, editorial indie-folk aesthetic inverted to a dark band for contrast. Use
 * as the email-capture / newsletter conversion section for musicians, bands, or
 * artist promo pages. Renders fully with no props via baked-in defaults.
 */
export const MusicArtistMailing = defineCapsule({
  name: 'MusicArtistMailing',
  description:
    'Dark, centered mailing-list CTA for a music artist / band page on a foreground-colored band: a thin heading, a lead paragraph, a real inline email-subscribe form (rounded email input + pill submit button), and a small reassurance note. The form submit writes to the shared Lakebed subscriber list. Warm editorial indie-folk aesthetic inverted to a dark band for contrast. Use as the email-capture / newsletter conversion section for musicians, singers, bands, or artist promo pages.',
  props: z.object({
    /** Thin-weight section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Email input placeholder. */
    placeholder: z.string().optional(),
    /** Submit button label. */
    submit: z.string().optional(),
    /** Small reassurance note under the form. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: newsletterLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Join the Mailing List'
    const description =
      props.description ??
      'Get early access to tickets, behind-the-scenes updates, and exclusive acoustic sessions delivered to your inbox.'
    const placeholder = props.placeholder ?? 'Enter your email'
    const submit = props.submit ?? 'Subscribe'
    const note = props.note ?? 'No spam. Unsubscribe anytime.'

    return (
      <NewsletterCta
        variant="inverted"
        className={cn('px-6 py-20 lg:px-8 lg:py-28', props.className)}
      >
        <div className="mx-auto max-w-4xl text-center">
          <NewsletterCtaHeading className="mb-6 text-3xl font-light lg:text-5xl">
            {heading}
          </NewsletterCtaHeading>
          <NewsletterCtaDescription className="mb-10 max-w-2xl text-lg text-background/70">
            {description}
          </NewsletterCtaDescription>
          <NewsletterSubscribeForm
            lakebed={lakebed}
            source={submit}
            placeholder={placeholder}
            buttonLabel={submit}
            successMessage="You're on the list. Tour and release updates will arrive by email."
            className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row"
            inputClassName="flex-1 rounded-full border border-background/20 bg-background/10 px-5 py-3 text-background placeholder:text-background/50 focus:border-background/50 focus:outline-none"
            buttonClassName="rounded-full bg-background px-8 py-3 font-medium text-foreground transition-colors hover:bg-background/80 disabled:pointer-events-none disabled:opacity-70"
            statusClassName="text-background/50"
          />
          <NewsletterCtaFineprint className="text-background/50">
            {note}
          </NewsletterCtaFineprint>
        </div>
      </NewsletterCta>
    )
  },
})
