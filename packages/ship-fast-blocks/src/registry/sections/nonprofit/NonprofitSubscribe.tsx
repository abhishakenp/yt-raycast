import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { NewsletterCtaFineprint } from '#/section-kit/NewsletterCta.tsx'
import { SubscribeBand } from '#/section-kit/SubscribeBand.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from '../newsletter/newsletter-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * NonprofitSubscribe — warm get-involved / newsletter band for a nonprofit /
 * charity / NGO page. A centered serif `SectionHeading` (mono eyebrow + serif
 * title + subtitle) sits inside a square hairline card on a soft muted wash,
 * above a square email-capture row with a filled-primary submit button and a
 * short row of secondary get-involved links (Volunteer, Fundraise, Partner with
 * us). The submit button writes to the shared Lakebed subscriber list and the
 * get-involved links route through section-kit route links. Restrained, human,
 * mission-driven. Use to grow the mailing list and surface ways to help on
 * nonprofit, foundation, or humanitarian pages. Renders fully with no props via
 * baked-in "Roots of Hope" defaults.
 */
export const NonprofitSubscribe = defineCapsule({
  name: 'NonprofitSubscribe',
  description:
    'Warm get-involved / newsletter band for a nonprofit / charity / NGO page: a centered serif SectionHeading (mono eyebrow + serif title + subtitle) inside a square hairline card on a soft muted wash, above a square email-capture row with a filled-primary submit button, plus a short row of secondary get-involved links (Volunteer, Fundraise, Partner with us). The submit button writes to the shared Lakebed subscriber list and secondary links route through section-kit route links. Restrained, human, mission-driven. Use to grow the mailing list and surface ways to help on nonprofit, foundation, or humanitarian pages.',
  props: z.object({
    /** Small uppercase eyebrow above the title. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    subheading: z.string().optional(),
    /** Placeholder text for the email-capture input. */
    emailPlaceholder: z.string().optional(),
    /** Label for the email-capture submit button. */
    submitCta: z.string().optional(),
    /** Subscriber source label recorded when the form is submitted. */
    submitTarget: z.string().optional(),
    /** Secondary get-involved link labels under the form. */
    getInvolved: z.array(z.string()).optional(),
    /** Fine-print line beneath the form. */
    footnote: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: newsletterLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Get involved'
    const heading = props.heading ?? 'Stay close to the change you make'
    const subheading =
      props.subheading ??
      "Join our community and we'll send you stories from the field, updates on the programs you support, and simple ways to do more good."
    const emailPlaceholder = props.emailPlaceholder ?? 'you@example.com'
    const submitCta = props.submitCta ?? 'Join us'
    const submitTarget = props.submitTarget ?? submitCta
    const getInvolved = props.getInvolved?.length
      ? props.getInvolved
      : ['Volunteer', 'Fundraise', 'Partner with us']
    const footnote =
      props.footnote ?? 'No spam, ever. Unsubscribe with one click.'

    return (
      <SubscribeBand
        className={cn(
          'bg-background pt-24 pb-20 lg:pt-28 lg:pb-28',
          props.className,
        )}
      >
        <Container className="max-w-4xl">
          <Card
            variant="outline"
            className="rounded-none border-border bg-muted/40 px-6 py-12 sm:px-12 lg:py-16"
          >
            <SectionHeading
              eyebrow={eyebrow}
              title={heading}
              subtitle={subheading}
              eyebrowClassName="font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl"
              subtitleClassName="text-base leading-relaxed text-muted-foreground sm:text-lg"
            />

            <NewsletterSubscribeForm
              lakebed={lakebed}
              source={submitTarget}
              placeholder={emailPlaceholder}
              buttonLabel={submitCta}
              successMessage="You're subscribed. We'll send field updates and ways to help."
              className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
              inputClassName="w-full rounded-none border border-border bg-background px-5 py-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              buttonClassName="shrink-0 rounded-none bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
            />

            <NewsletterCtaFineprint className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {footnote}
            </NewsletterCtaFineprint>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-border pt-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Other ways to help
              </span>
              {getInvolved.map((label) => (
                <NavbarRouteLink
                  key={label}
                  className="text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                  href={label}
                >
                  {label}
                </NavbarRouteLink>
              ))}
            </div>
          </Card>
        </Container>
      </SubscribeBand>
    )
  },
})
