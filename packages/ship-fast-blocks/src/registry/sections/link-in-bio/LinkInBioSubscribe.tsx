import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
import {
  SubscribeBand,
  SubscribeHeading,
  SubscribeDescription,
  SubscribeFineprint,
} from '#/section-kit/SubscribeBand.tsx'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from '../newsletter/newsletter-interactions.tsx'

/**
 * LinkInBioSubscribe — a compact, centered email-capture band sized for a
 * mobile link-in-bio / link-hub page, and the page's one inverted moment. It
 * renders a single chunky rounded-3xl inverted card (bg-foreground /
 * text-background) with a 2px rule and a hard offset token shadow: a small mail
 * icon tile, an uppercase mono eyebrow, a bold headline, a short subtitle, then
 * a stacked newsletter form (an email input + a full-width chunky pill submit
 * button with press feedback) and a small reassurance note underneath. The form
 * writes to the shared Lakebed subscriber list. Use as the "Subscribe" /
 * newsletter-capture role of a Linktree / Bento style personal landing page,
 * creator or influencer link hub, or social-profile splash. Renders fully with
 * no props.
 */
export const LinkInBioSubscribe = defineCapsule({
  name: 'LinkInBioSubscribe',
  description:
    "Compact, centered EMAIL-CAPTURE / newsletter-subscribe band sized for a mobile LINK-IN-BIO / link-hub page, and the page's one inverted moment. Renders a single chunky rounded-3xl inverted card (bg-foreground / text-background, 2px-ruled with a hard offset token shadow) with a small mail icon tile, an uppercase mono eyebrow, a bold headline, a short subtitle, a stacked subscribe form (an email input + a full-width chunky pill submit button with press feedback), and a small reassurance note. Submitting writes to the shared Lakebed subscriber list so another subscribe block or admin view can react immediately. Use as the 'Subscribe' / 'Join my newsletter' / email-signup role of a Linktree / Bento style personal landing page, creator or influencer link hub, freelancer bio link, or social-profile splash. Supply copy only — eyebrow, heading, subheading, placeholder, CTA label, and note; the section owns all layout and styling.",
  props: z.object({
    /** Small uppercase label above the headline. */
    eyebrow: z.string().optional(),
    /** Main headline of the capture card. */
    heading: z.string().optional(),
    /** Supporting subtitle under the headline. */
    subheading: z.string().optional(),
    /** Placeholder text for the email input. */
    placeholder: z.string().optional(),
    /** Submit button label. */
    ctaLabel: z.string().optional(),
    /** Subscriber source label recorded when the form is submitted. */
    ctaTarget: z.string().optional(),
    /** Small reassurance line under the form. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: newsletterLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Stay in the loop'
    const heading = props.heading ?? 'Join my newsletter'
    const subheading =
      props.subheading ??
      'Get new drops, posts, and behind-the-scenes — straight to your inbox.'
    const placeholder = props.placeholder ?? 'you@example.com'
    const ctaLabel = props.ctaLabel ?? 'Subscribe'
    const ctaTarget = props.ctaTarget ?? 'Subscribe'
    const note = props.note ?? 'No spam. Unsubscribe anytime.'

    return (
      <SubscribeBand className={cn('pt-28 pb-10', props.className)}>
        <Container className="max-w-md">
          <Card className="rounded-3xl border-2 border-foreground bg-foreground p-6 text-center text-background shadow-[6px_6px_0_0] shadow-primary sm:p-8">
            <div className="mx-auto grid size-12 place-items-center rounded-xl border-2 border-background/40 bg-background/10 text-background">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <Eyebrow
              variant="text"
              className="mt-4 block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-background/70"
            >
              {eyebrow}
            </Eyebrow>
            <SubscribeHeading className="mt-2 text-xl font-extrabold tracking-tight text-background sm:text-2xl">
              {heading}
            </SubscribeHeading>
            <SubscribeDescription className="mt-2 text-sm text-background/70">
              {subheading}
            </SubscribeDescription>

            <NewsletterSubscribeForm
              lakebed={lakebed}
              source={ctaTarget}
              placeholder={placeholder}
              buttonLabel={ctaLabel}
              successMessage="You're subscribed. New links and drops will arrive by email."
              className="mt-6 flex flex-col gap-3"
              inputClassName="w-full rounded-full border-2 border-background/25 bg-background px-5 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-background/40"
              buttonClassName="w-full rounded-full border-2 border-background bg-primary px-5 py-3 font-bold text-primary-foreground shadow-[3px_3px_0_0] shadow-background/40 transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0] hover:shadow-background/40 active:translate-y-px active:shadow-none disabled:pointer-events-none disabled:opacity-70"
            />

            <SubscribeFineprint className="mt-3 text-xs text-background/60">
              {note}
            </SubscribeFineprint>
          </Card>
        </Container>
      </SubscribeBand>
    )
  },
})
