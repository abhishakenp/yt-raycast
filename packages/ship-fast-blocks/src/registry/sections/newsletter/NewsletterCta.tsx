import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
} from '#/section-kit/CtaBand.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { newsletterLakebed } from './newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from './newsletter-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * NewsletterCta — inverted final-CTA subscribe band for an editorial newsletter,
 * cut in on a slanted clip-path seam. A full-width dark foreground band behind a
 * giant faint serif "№" ghost watermark, centered: a mono inverted dateline
 * label, a large serif headline, a relaxed lede, a square (rounded-none) inline
 * email subscribe form (translucent email input + solid background submit button
 * with a mono uppercase label and press feedback, stacking on mobile), and a
 * small note line with an inline upgrade link. Restrained newspaper structure
 * inverted for emphasis — the single dark band that anchors the page rhythm. The
 * form submit writes to the shared Lakebed subscriber list and the note link
 * routes through section-kit route links. Use as the closing conversion band for
 * newsletters, publications, blogs, or content creators. Renders fully with no
 * props via baked-in defaults.
 */
export const NewsletterCta = defineCapsule({
  name: 'NewsletterCta',
  description:
    'Inverted final-CTA subscribe band for an editorial newsletter cut in on a slanted clip-path seam: a full-width dark foreground band behind a giant faint serif ghost watermark, centered, with a mono inverted dateline label, a large serif headline, a relaxed lede, a square (rounded-none) inline email subscribe form (translucent email input + solid background submit button with a mono uppercase label and press feedback, stacking on mobile), and a small note line with an inline upgrade link. Restrained newspaper structure inverted for emphasis — the single dark band that anchors the page rhythm. The form submit writes to the shared Lakebed subscriber list and the note link routes through section-kit route links. Use as the closing conversion band for newsletters, publications, blogs, or content creators.',
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
        className={`relative overflow-hidden bg-foreground text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] ${
          props.className ?? ''
        }`}
      >
        <Watermark className="-bottom-16 -left-4 select-none font-serif text-[16rem] font-medium not-italic leading-none text-background/[0.06] sm:text-[22rem]">
          №
        </Watermark>

        <CtaBandInner className="relative pt-24">
          <MonoTag tone="inverted" className="tracking-[0.25em]">
            The Quiet Observer · Weekly
          </MonoTag>
          <CtaBandTitle className="font-serif text-3xl font-medium md:text-5xl">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle>{description}</CtaBandSubtitle>
          <NewsletterSubscribeForm
            lakebed={lakebed}
            source={submit}
            placeholder={emailPlaceholder}
            buttonLabel={submit}
            successMessage="You're subscribed. The next issue will arrive by email."
            className="mx-auto flex max-w-md flex-col gap-2.5 sm:flex-row"
            inputClassName="min-w-0 flex-1 rounded-none border border-background/30 bg-background/10 px-4 py-3 text-background placeholder:text-background/50 transition-colors focus:border-background focus:outline-none"
            buttonClassName="rounded-none bg-background px-6 py-3 font-mono text-xs font-medium uppercase tracking-[0.15em] text-foreground transition-[transform,background-color] duration-150 hover:bg-background/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
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
