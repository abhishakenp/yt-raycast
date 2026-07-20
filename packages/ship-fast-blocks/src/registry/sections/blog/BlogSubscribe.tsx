import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  NewsletterCtaDescription,
  NewsletterCtaFineprint,
  NewsletterCtaHeading,
} from '#/section-kit/NewsletterCta.tsx'
import { SubscribeBand, SubscribeForm } from '#/section-kit/SubscribeBand.tsx'
import { PublicationSubscribeForm } from './publication-interactions.tsx'
import { publicationLakebed } from './publication-lakebed.ts'

/**
 * BlogSubscribe — inverted newsprint "circulation desk" band for an editorial
 * blog or publication. The whole section flips to ink (bg-foreground) and
 * cuts in on a slanted top seam, with a giant ghost ornament star bleeding
 * off the right edge. Inside: a mono small-caps eyebrow between hairline
 * rules, a large serif headline, a supporting line, and an email-capture form
 * (square hairline input plus a square invert-on-hover submit button with
 * press feedback — stacked on mobile, inline on larger screens), followed by
 * a live subscriber status line and a mono fineprint rule. Submitting writes
 * to the shared Lakebed subscriber list so another subscribe block or admin
 * view can react immediately. Use as the Subscribe section near the foot of
 * blog homepages, magazine indexes, or editorial landing pages to grow the
 * mailing list.
 */
export const BlogSubscribe = defineCapsule({
  name: 'BlogSubscribe',
  description:
    'Inverted newsprint circulation-desk band for an editorial blog or publication: the section flips to ink with a slanted top seam and a giant ghost ornament star off the right edge, holding a mono small-caps eyebrow between hairline rules, a large serif headline, a supporting line, and an email-capture form (square hairline input plus square invert-on-hover submit button with press feedback — stacked on mobile, inline on larger screens), followed by a live subscriber status line and mono fineprint. Submitting writes to the shared Lakebed subscriber list so another subscribe block or admin view can react immediately. Use as the Subscribe section near the foot of blog homepages, magazine indexes, or editorial landing pages to grow the mailing list.',
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
        variant="inverted"
        className={cn(
          // Ink-block band cutting in on a slanted top seam.
          'relative overflow-hidden py-16 pt-24 [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28',
          props.className,
        )}
      >
        <Watermark className="-right-10 -top-16 font-serif text-[18rem] font-black text-background/[0.06] sm:text-[24rem]">
          ✦
        </Watermark>
        <Container size="4xl" className="relative text-center">
          {/* Mono eyebrow between hairline rules. */}
          <div className="flex items-center justify-center gap-4">
            <span
              aria-hidden="true"
              className="h-px w-12 bg-background/30 sm:w-20"
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-background/70">
              {eyebrow}
            </span>
            <span
              aria-hidden="true"
              className="h-px w-12 bg-background/30 sm:w-20"
            />
          </div>
          <NewsletterCtaHeading className="mt-6 font-serif text-4xl font-black leading-[1.05] tracking-tight text-background sm:text-5xl">
            {heading}
          </NewsletterCtaHeading>
          <NewsletterCtaDescription className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-background/70">
            {subheading}
          </NewsletterCtaDescription>
          <SubscribeForm asChild>
            <PublicationSubscribeForm
              lakebed={lakebed}
              source={ctaTarget}
              placeholder={placeholder}
              buttonLabel={ctaLabel}
              successMessage="You're on the list. Watch your inbox for the next edition."
              className="mx-auto mt-8 flex w-full max-w-xl flex-col items-stretch gap-3 sm:flex-row"
              inputClassName="w-full flex-1 rounded-none border border-background/40 bg-transparent px-5 py-3 text-background outline-none transition-colors placeholder:text-background/50 focus:border-background"
              buttonClassName="shrink-0 rounded-none border border-background bg-background px-6 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-foreground transition-colors duration-150 hover:bg-transparent hover:text-background active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
              statusClassName="text-background/60"
            />
          </SubscribeForm>
          <NewsletterCtaFineprint className="mx-auto mt-5 inline-block border-t border-background/20 pt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-background/50">
            {note}
          </NewsletterCtaFineprint>
        </Container>
      </SubscribeBand>
    )
  },
})
