import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  NewsletterCtaDescription,
  NewsletterCtaFineprint,
  NewsletterCtaHeading,
} from '#/section-kit/NewsletterCta.tsx'
import { SubscribeBand } from '#/section-kit/SubscribeBand.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from '../newsletter/newsletter-interactions.tsx'

/**
 * MusicArtistMailing — inverted kinetic-poster mailing-list CTA for a music
 * artist / band page. A foreground-colored band with a slanted clip-path top
 * seam and a giant ghost watermark of the artist's initial holds a giant
 * extrabold uppercase heading, a lead paragraph, a real inline email-subscribe
 * form (sharp email input + sharp mono submit with press feedback), and a small
 * mono reassurance note. The form submit writes to the shared Lakebed subscriber
 * list. Bold poster energy driven entirely by theme tokens (flips light/dark);
 * binary rounded-none radius. Use as the email-capture / newsletter conversion
 * section for musicians, bands, or artist promo pages. Renders fully with no
 * props via baked-in defaults.
 */
export const MusicArtistMailing = defineCapsule({
  name: 'MusicArtistMailing',
  description:
    "Inverted kinetic-poster mailing-list CTA for a music artist / band page: a foreground-colored band with a slanted clip-path top seam and a giant ghost watermark of the artist's initial holds a giant extrabold uppercase heading, a lead paragraph, a real inline email-subscribe form (sharp email input + sharp mono submit with press feedback), and a small mono reassurance note. The form submit writes to the shared Lakebed subscriber list. Bold poster energy driven entirely by theme tokens (flips light/dark); binary rounded-none radius. Use as the email-capture / newsletter conversion section for musicians, singers, bands, or artist promo pages.",
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

    const watermark = heading.trim().charAt(0) || 'M'

    return (
      <SubscribeBand
        variant="inverted"
        className={cn(
          'relative overflow-hidden px-6 pt-24 pb-20 [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] lg:px-8 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-6 select-none font-extrabold uppercase leading-none tracking-tighter text-background/[0.05] text-[14rem] sm:text-[20rem] lg:text-[26rem]"
        >
          {watermark}
        </span>

        <Container size="4xl" className="relative text-center">
          <NewsletterCtaHeading className="mb-6 text-4xl font-extrabold uppercase leading-[0.9] tracking-tighter text-background sm:text-5xl lg:text-6xl">
            {heading}
          </NewsletterCtaHeading>
          <NewsletterCtaDescription className="mb-10 max-w-2xl text-pretty text-lg text-background/70">
            {description}
          </NewsletterCtaDescription>
          <NewsletterSubscribeForm
            lakebed={lakebed}
            source={submit}
            placeholder={placeholder}
            buttonLabel={submit}
            successMessage="You're on the list. Tour and release updates will arrive by email."
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
            inputClassName="flex-1 rounded-none border border-background/30 bg-background/10 px-5 py-3 text-background placeholder:text-background/50 focus:border-background/60 focus:outline-none"
            buttonClassName="rounded-none bg-background px-8 py-3 font-mono text-xs font-medium uppercase tracking-[0.15em] text-foreground transition-transform hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 disabled:pointer-events-none disabled:opacity-70"
            statusClassName="font-mono text-[11px] uppercase tracking-[0.15em] text-background/50"
          />
          <NewsletterCtaFineprint className="font-mono text-[11px] uppercase tracking-[0.15em] text-background/50">
            {note}
          </NewsletterCtaFineprint>
        </Container>
      </SubscribeBand>
    )
  },
})
