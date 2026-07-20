import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { NewsletterCtaFineprint } from '#/section-kit/NewsletterCta.tsx'
import { SubscribeBand } from '#/section-kit/SubscribeBand.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from '../newsletter/newsletter-interactions.tsx'

/**
 * WriterAuthorSubscribe — a literary "letter" newsletter band for an author
 * site. A rounded-none manuscript letter card (hairline offset frame behind, a
 * rotated mono "post" postmark chip pinned to its corner) carries a mono
 * "NEWSLETTER" rail, an elegant serif headline, an inviting subtitle, then an
 * inline email form (rounded-none email input + filled Subscribe button that
 * presses on click) with reassuring privacy microcopy beneath. Serif-forward
 * and fully token-driven. Use on an author or writer homepage / about page to
 * collect newsletter subscribers and invite readers to follow new books and
 * essays. Renders fully with no props via baked-in defaults.
 */
export const WriterAuthorSubscribe = defineCapsule({
  name: 'WriterAuthorSubscribe',
  description:
    'A literary "letter" newsletter band for an author site: a rounded-none manuscript letter card (hairline offset frame behind, a rotated mono postmark chip on its corner) carries a mono "NEWSLETTER" rail, an elegant serif headline, an inviting subtitle, then an inline email form (rounded-none email input + filled Subscribe button that presses on click) with reassuring privacy microcopy underneath. Serif-forward and fully token-based. Use on an author, writer, novelist, or essayist homepage or about page to capture newsletter subscribers and invite readers to follow new books, essays, and announcements.',
  props: z.object({
    /** Small uppercase eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Serif headline for the newsletter band. */
    heading: z.string().optional(),
    /** Supporting subtitle inviting readers to subscribe. */
    subheading: z.string().optional(),
    /** Placeholder text inside the email input. */
    placeholder: z.string().optional(),
    /** Label on the filled submit button. */
    buttonLabel: z.string().optional(),
    /** Privacy reassurance microcopy beneath the form. */
    privacy: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: newsletterLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Newsletter'
    const heading = props.heading ?? 'Letters from Eleanor'
    const subheading =
      props.subheading ??
      "Join Eleanor Vance's readers for occasional letters on new books, work-in-progress essays, and the stories behind the writing — delivered straight to your inbox."
    const placeholder = props.placeholder ?? 'you@example.com'
    const buttonLabel = props.buttonLabel ?? 'Subscribe'
    const privacy = props.privacy ?? 'No spam. Unsubscribe anytime.'

    return (
      <SubscribeBand
        className={cn(
          'bg-background pt-28 pb-20 sm:pt-32 sm:pb-24',
          props.className,
        )}
      >
        <Container size="md" className="px-6 lg:px-6">
          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border-2 border-primary/20"
            />
            <Card className="relative rounded-none border-2 border-foreground/15 p-8 text-card-foreground shadow-none sm:p-12">
              <span
                aria-hidden="true"
                className="absolute -right-3 -top-4 rotate-2 border-2 border-foreground bg-background px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground shadow-[4px_4px_0_0] shadow-primary/30"
              >
                Post
              </span>
              <SectionHeading
                align="left"
                eyebrow={eyebrow}
                title={heading}
                subtitle={subheading}
                eyebrowClassName="tracking-[0.2em]"
                titleClassName="font-serif text-3xl font-normal tracking-tight sm:text-4xl"
              />
              <NewsletterSubscribeForm
                lakebed={lakebed}
                source={buttonLabel}
                placeholder={placeholder}
                buttonLabel={buttonLabel}
                successMessage="You're subscribed. New letters will arrive by email."
                className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
                inputClassName="w-full flex-1 rounded-none border-2 border-foreground/15 bg-background px-5 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                buttonClassName="rounded-none bg-primary px-6 py-3 font-medium text-primary-foreground transition-transform duration-100 hover:bg-primary/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
              />
              <NewsletterCtaFineprint className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {privacy}
              </NewsletterCtaFineprint>
            </Card>
          </div>
        </Container>
      </SubscribeBand>
    )
  },
})
