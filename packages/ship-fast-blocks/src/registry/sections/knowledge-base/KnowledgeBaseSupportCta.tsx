import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandEyebrow,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaBandActions,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { SupportBand } from '#/section-kit/SupportBand.tsx'

/**
 * KnowledgeBaseSupportCta — contrasting "still need help?" support CTA band on
 * the primary surface for a help center. A centered heading + supporting
 * paragraph above two buttons (a filled inverted "live chat" with a chat icon
 * and an outlined "email support" with a mail icon), with a bordered-top note
 * line below stating availability / response times. High-contrast, calm, and
 * reassuring. Both buttons route through useNavigate. Use near the end of a
 * knowledge base, support portal or docs site to escalate visitors to human
 * support. Renders fully with no props via baked-in defaults.
 */
export const KnowledgeBaseSupportCta = defineCapsule({
  name: 'KnowledgeBaseSupportCta',
  description:
    "Contrasting 'still need help?' support CTA band on the primary surface for a help center: a centered heading + supporting paragraph above two buttons (a filled inverted 'live chat' with a chat icon and an outlined 'email support' with a mail icon), with a bordered-top note line below stating availability / response times. High-contrast, calm and reassuring; both buttons route through useNavigate. Use near the end of a knowledge base, support portal or docs site to escalate visitors to human support.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Still need help?'
    const description =
      props.description ??
      'Our support team is available Monday through Friday, 9 AM to 6 PM EST. Enterprise customers have 24/7 priority support.'
    const primaryCta = props.primaryCta ?? 'Start live chat'
    const secondaryCta = props.secondaryCta ?? 'Email support'
    const note =
      props.note ??
      'Average response time: Under 2 hours for email, Instant for live chat'

    return (
      <SupportBand asChild>
        <CtaBand tone="primary" className={props.className}>
          <CtaBandInner>
            <CtaBandEyebrow>{note}</CtaBandEyebrow>
            <CtaBandTitle>{heading}</CtaBandTitle>
            <CtaBandSubtitle>{description}</CtaBandSubtitle>
            <CtaBandActions>
              <CtaAction variant="primary" onClick={() => go(primaryCta)}>
                {primaryCta}
              </CtaAction>
              <CtaAction variant="outline" onClick={() => go(secondaryCta)}>
                {secondaryCta}
              </CtaAction>
            </CtaBandActions>
          </CtaBandInner>
        </CtaBand>
      </SupportBand>
    )
  },
})
