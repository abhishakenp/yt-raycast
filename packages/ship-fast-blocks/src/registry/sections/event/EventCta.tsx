import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
} from '#/section-kit/CtaBand.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  EventActionButton,
  EventMutationSpinner,
} from './event-interactions.tsx'
import { eventLakebed } from './event-lakebed.ts'

/**
 * EventCta — kinetic-poster final conversion band for a conference or event page. A
 * muted band with a giant ghost watermark behind a left-anchored, poster-scale
 * extrabold heading and a supporting paragraph, a square-edged CTA pair (get ticket
 * / download brochure) with a hard offset shadow and press feedback, and a mono
 * closing email line with a real mailto link. CTAs write shared Lakebed event
 * actions. Use as the closing conversion band before the footer on tech conference,
 * summit, festival, or workshop pages.
 */
export const EventCta = defineCapsule({
  name: 'EventCta',
  description:
    'Kinetic-poster final conversion band for a conference or event page: a muted band with a giant ghost watermark behind a left-anchored poster-scale extrabold heading and a supporting paragraph, a square-edged CTA pair (get ticket / download brochure) with a hard offset shadow and press feedback, and a mono closing email line with a real mailto contact link. CTAs write shared Lakebed event actions. Use as the closing conversion band before the footer on tech conference, summit, festival, meetup, or workshop pages.',
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
      <CtaBand
        tone="muted"
        className={cn('relative overflow-hidden', props.className)}
      >
        <Watermark className="-right-6 top-0 text-[9rem] leading-none sm:text-[16rem] lg:text-[20rem]">
          2024
        </Watermark>
        <CtaBandInner align="left" className="relative max-w-3xl">
          <CtaBandTitle className="text-[clamp(2.25rem,6vw,4rem)] font-extrabold leading-[0.95] tracking-tight text-balance">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-2xl text-pretty">
            {description}
          </CtaBandSubtitle>
          <div className="flex flex-col gap-4 sm:flex-row">
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
              className="inline-flex items-center justify-center gap-2 rounded-none border border-foreground bg-primary px-8 py-4 font-mono text-sm font-bold uppercase tracking-[0.14em] text-primary-foreground shadow-[5px_5px_0_0] shadow-foreground transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0] hover:shadow-foreground active:translate-x-[5px] active:translate-y-[5px] active:shadow-none disabled:pointer-events-none disabled:opacity-70"
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
              className="inline-flex items-center justify-center gap-2 rounded-none border border-foreground bg-background px-8 py-4 font-mono text-sm font-bold uppercase tracking-[0.14em] text-foreground transition-[transform,background-color] duration-150 hover:bg-muted active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
            >
              {secondaryCta}
            </EventActionButton>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {emailLabel}{' '}
            <a
              href={`mailto:${email}`}
              className="text-foreground underline decoration-primary underline-offset-4 hover:no-underline"
            >
              {email}
            </a>
          </p>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
