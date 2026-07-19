import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
} from '#/section-kit/CtaBand.tsx'
import { newsletterLakebed } from './newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from './newsletter-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * NewsletterCta — inverted final-CTA subscribe band for an editorial newsletter.
 * A full-width dark foreground band, centered: a large serif headline, a relaxed
 * lede, an inline email subscribe form (translucent email input + solid
 * background submit button that stacks on mobile), and a small note line with an
 * inline upgrade link. Warm, calm, literary mood inverted for emphasis. The form
 * submit writes to the shared Lakebed subscriber list and the note link routes
 * through section-kit route links. Use as the closing
 * conversion band for newsletters, publications, blogs, or content creators.
 * Renders fully with no props via baked-in defaults.
 */
export const NewsletterCta = defineCapsule({
  name: 'NewsletterCta',
  description:
    'Inverted final-CTA subscribe band for an editorial newsletter: a full-width dark foreground band, centered, with a large serif headline, a relaxed lede, an inline email subscribe form (translucent email input + solid background submit button that stacks on mobile), and a small note line with an inline upgrade link. Warm, calm, literary mood inverted for emphasis. The form submit writes to the shared Lakebed subscriber list and the note link routes through section-kit route links. Use as the closing conversion band for newsletters, publications, blogs, or content creators.',
  props: z.object({
    /** Headline. */
    heading: z.string().optional(),
    /** Supporting lede under the headline. */
    description: z.string().optional(),
    /** Email input placeholder. */
    emailPlaceholder: z.string().optional(),
    /** Submit button label (also the navigate target on submit). */
    submit: z.string().optional(),
    /** Note prefix before the inline link. */
    notePrefix: z.string().optional(),
    /** Note inline link label (also the navigate target). */
    noteLink: z.string().optional(),
    /** Note suffix after the inline link. */
    noteSuffix: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: newsletterLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Start your Sunday with insight'
    const description =
      props.description ??
      'Join 12,000+ readers who make The Quiet Observer part of their weekend ritual. No spam. Unsubscribe anytime.'
    const emailPlaceholder = props.emailPlaceholder ?? 'your@email.com'
    const submit = props.submit ?? 'Subscribe Free'
    const notePrefix = props.notePrefix ?? 'Or '
    const noteLink = props.noteLink ?? 'upgrade to paid'
    const noteSuffix = props.noteSuffix ?? ' for the full experience.'

    return (
      <CtaBand
        tone="primary"
        className={`bg-foreground text-background ${props.className ?? ''}`}
      >
        <CtaBandInner>
          <CtaBandTitle className="font-serif font-medium">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle>{description}</CtaBandSubtitle>
          <NewsletterSubscribeForm
            lakebed={lakebed}
            source={submit}
            placeholder={emailPlaceholder}
            buttonLabel={submit}
            successMessage="You're subscribed. The next issue will arrive by email."
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
            inputClassName="flex-1 rounded-lg border border-background/20 bg-background/10 px-4 py-3 text-background placeholder-background/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-background"
            buttonClassName="rounded-lg bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-background/90 focus:outline-none focus:ring-2 focus:ring-background focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-70"
            emailLabel="Email address for newsletter subscription"
            statusClassName="text-background/60"
          />

          <p className="mt-6 text-sm text-background/60">
            {notePrefix}
            <NavbarRouteLink
              className="text-background/80 underline hover:no-underline"
              href={noteLink}
            >
              {noteLink}
            </NavbarRouteLink>
            {noteSuffix}
          </p>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
