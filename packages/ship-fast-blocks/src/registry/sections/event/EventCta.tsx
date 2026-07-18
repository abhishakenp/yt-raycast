import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
} from '#/section-kit/CtaBand.tsx'
import {
  EventActionButton,
  EventMutationSpinner,
} from './event-interactions.tsx'
import { eventLakebed } from './event-lakebed.ts'

/**
 * EventCta — a final call-to-action band for a conference or event page. A
 * centered, large heading with a supporting paragraph, dual primary/secondary
 * CTAs (get ticket / download brochure), and a closing email line with a real
 * mailto link. CTAs write shared Lakebed event actions. Use as the closing
 * conversion band before the footer on tech conference, summit, festival, or
 * workshop pages.
 */
export const EventCta = defineCapsule({
  name: 'EventCta',
  description:
    'Final call-to-action band for a conference or event page: a centered large heading with a supporting paragraph, dual primary/secondary CTAs (get ticket / download brochure), and a closing email line with a real mailto contact link. CTAs write shared Lakebed event actions. Use as the closing conversion band before the footer on tech conference, summit, festival, meetup, or workshop pages.',
  props: z.object({
    /** Heading text. */
    heading: z.string().optional(),
    /** Supporting paragraph beneath the heading. */
    description: z.string().optional(),
    /** Primary CTA label. */
    primaryCta: z.string().optional(),
    /** Secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Label preceding the contact email. */
    emailLabel: z.string().optional(),
    /** Contact email shown as an inline link. */
    email: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: eventLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Ready to join us in San Francisco?'
    const description =
      props.description ??
      'Early bird tickets sold out in 48 hours last year. Secure your spot at DesignFront 2024 before prices increase.'
    const primaryCta = props.primaryCta ?? 'Get Your Ticket — $649'
    const secondaryCta = props.secondaryCta ?? 'Download Brochure'
    const emailLabel = props.emailLabel ?? 'Questions? Email us at'
    const email = props.email ?? 'hello@designfront.io'

    return (
      <CtaBand tone="muted" className={props.className}>
        <CtaBandInner>
          <CtaBandTitle>{heading}</CtaBandTitle>
          <CtaBandSubtitle>{description}</CtaBandSubtitle>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <EventActionButton
              lakebed={lakebed}
              action="ticket"
              label={primaryCta}
              intentKey="cta-ticket"
              source="cta"
              pendingChildren={
                <>
                  <EventMutationSpinner />
                  Reserving
                </>
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
            >
              {primaryCta}
            </EventActionButton>
            <EventActionButton
              lakebed={lakebed}
              action="download"
              label={secondaryCta}
              intentKey="cta-download"
              source="cta"
              pendingChildren={
                <>
                  <EventMutationSpinner />
                  Preparing
                </>
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-8 py-4 text-lg font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-70"
            >
              {secondaryCta}
            </EventActionButton>
          </div>
          <p className="text-sm text-muted-foreground">
            {emailLabel}{' '}
            <a
              href={`mailto:${email}`}
              className="text-foreground underline hover:no-underline"
            >
              {email}
            </a>
          </p>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
