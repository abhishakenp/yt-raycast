import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { PublicationSubscribeForm } from '../blog/publication-interactions.tsx'
import { publicationLakebed } from '../blog/publication-lakebed.ts'
import {
  NewsletterCtaDescription,
  NewsletterCtaFineprint,
  NewsletterCtaHeading,
} from '#/section-kit/NewsletterCta.tsx'
import { SubscribeBand } from '#/section-kit/SubscribeBand.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * BlogPostSubscribe — inverted-ink newsprint dispatch band for an editorial
 * blog/article page. A sharp full-ink plate (bg-foreground inversion) in the
 * reading column with a giant ghost "№" watermark, a mono "Weekly dispatch"
 * rail with hairline rules, a serif bold heading, a supporting line, and a
 * square-cornered email form — transparent hairline input beside a solid
 * paper-on-ink Subscribe button with press feedback — plus a live subscriber
 * status line and a mono reassurance footnote. The Subscribe button writes to
 * the shared Lakebed subscriber list. Uses semantic tokens only. Use as the
 * newsletter signup section on blogs, magazines, journals, or any publication
 * page.
 */
export const BlogPostSubscribe = defineCapsule({
  name: 'BlogPostSubscribe',
  description:
    "Inverted-ink newsprint dispatch band for a blog/article page: a sharp full-ink plate (foreground inversion) with a giant ghost '№' watermark, a mono 'Weekly dispatch' rail with hairline rules, a serif bold heading, a short supporting line, a square-cornered email form (transparent hairline input + solid paper-on-ink Subscribe button with press feedback, stacked on mobile, side-by-side on desktop), a live subscriber status line, and a mono reassurance footnote. Submitting writes to the shared Lakebed subscriber list so another subscribe block or admin view can react immediately. Use as the newsletter signup section on blogs, magazines, journals, or any publication page.",
  props: z.object({
    /** Band heading. */
    heading: z.string().optional(),
    /** Short supporting line under the heading. */
    subheading: z.string().optional(),
    /** Email input placeholder text. */
    placeholder: z.string().optional(),
    /** Subscribe button label. */
    ctaLabel: z.string().optional(),
    /** Small reassurance footnote under the form. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: publicationLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Subscribe to Studio Journal'
    const subheading =
      props.subheading ??
      'Get weekly articles on design craft, strategy, and team culture, delivered every Tuesday.'
    const placeholder = props.placeholder ?? 'your@email.com'
    const ctaLabel = props.ctaLabel ?? 'Subscribe'
    const note = props.note ?? 'No spam. Unsubscribe anytime.'

    return (
      <SubscribeBand
        className={cn('bg-background py-16 lg:py-24', props.className)}
      >
        <Container size="sm" className="max-w-2xl px-6 lg:px-6">
          {/* Inverted ink plate — the page's one dark newsprint band. */}
          <div className="relative overflow-hidden rounded-none bg-foreground px-6 py-12 text-background sm:px-12">
            <Watermark className="-right-6 -top-10 font-serif font-bold text-background/[0.07] text-[10rem] sm:text-[13rem]">
              №
            </Watermark>

            {/* Mono dispatch rail. */}
            <div className="relative mb-6 flex items-center gap-4">
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-background/25"
              />
              <MonoTag tone="inverted" className="shrink-0">
                Weekly dispatch
              </MonoTag>
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-background/25"
              />
            </div>

            <NewsletterCtaHeading className="relative mb-3 text-center font-serif text-3xl font-bold tracking-tight text-background sm:text-4xl">
              {heading}
            </NewsletterCtaHeading>
            <NewsletterCtaDescription className="relative mx-0 mb-8 max-w-none text-center font-serif text-background/70">
              {subheading}
            </NewsletterCtaDescription>
            <PublicationSubscribeForm
              lakebed={lakebed}
              source="Blog post subscribe"
              placeholder={placeholder}
              buttonLabel={ctaLabel}
              successMessage="You're subscribed. The next article will land in your inbox."
              className="relative mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
              inputClassName="flex-1 rounded-none border border-background/40 bg-transparent px-4 py-3 text-background placeholder:text-background/50 transition-colors focus:border-background focus:outline-none"
              buttonClassName="rounded-none bg-background px-6 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-background/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
              statusClassName="text-xs text-background/70"
            />
            <NewsletterCtaFineprint className="relative text-center font-mono text-[10px] uppercase tracking-[0.16em] text-background/50">
              {note}
            </NewsletterCtaFineprint>
          </div>
        </Container>
      </SubscribeBand>
    )
  },
})
