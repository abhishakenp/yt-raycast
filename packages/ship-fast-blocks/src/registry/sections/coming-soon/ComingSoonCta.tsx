import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
} from '#/section-kit/CtaBand.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from '../newsletter/newsletter-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * ComingSoonCta — inverted kinetic closing band for a "launching soon" /
 * waitlist pre-launch landing page. A full inversion band
 * (bg-foreground/text-background) cutting in on a diagonal clip-path seam,
 * with a giant ghost "GO" watermark, a left-aligned mono "[ FINAL CALL ]"
 * rail, a countdown-scale tight-tracked headline, supporting paragraph, and a
 * sharp-cornered email-capture form whose primary submit carries a hard
 * offset shadow and press feedback; a mono contact line closes the band. Form
 * submit writes to the shared Lakebed subscriber list and the contact email
 * link routes through section-kit route links. Use as the closing conversion
 * push on SaaS waitlists, app pre-launch pages, beta sign-ups, or any
 * "notify me" / early-access landing page. Renders fully with no props via
 * baked-in defaults.
 */
export const ComingSoonCta = defineCapsule({
  name: 'ComingSoonCta',
  description:
    "Inverted kinetic closing band for a 'launching soon' / waitlist pre-launch landing page: a full dark inversion band cutting in on a diagonal clip-path seam, with a giant ghost watermark, left-aligned mono rail, countdown-scale tight-tracked headline, supporting paragraph, and a sharp-cornered email-capture form with hard-offset-shadow primary submit and press feedback, closed by a mono contact email line. Form submit writes to the shared Lakebed subscriber list and the contact email link routes through section-kit route links. Use as the closing conversion push on SaaS waitlists, app pre-launch pages, beta sign-ups, or 'notify me' / early-access landing pages.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Email input placeholder text. */
    emailPlaceholder: z.string().optional(),
    /** Submit button label. */
    submit: z.string().optional(),
    /** Label prefix before the contact email. */
    contactPrefix: z.string().optional(),
    /** Contact email shown as a routable link. */
    contactEmail: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: newsletterLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Ready to transform how your team works?'
    const description =
      props.description ??
      'Join 12,000+ teams on the waitlist. Early access members save 50% for 6 months.'
    const emailPlaceholder = props.emailPlaceholder ?? 'Enter your email'
    const submit = props.submit ?? 'Get early access'
    const contactPrefix = props.contactPrefix ?? 'Questions? Reach us at'
    const contactEmail = props.contactEmail ?? 'hello@nexus.app'

    const inputCls =
      'min-h-12 flex-1 rounded-none border-2 border-background/25 bg-background/5 px-4 font-mono text-sm text-background transition-colors placeholder:text-background/50 focus:border-background focus:outline-none'
    const submitCls =
      'inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-none bg-primary px-7 font-mono text-[13px] font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-[4px_4px_0_0] shadow-background/30 transition-[transform,box-shadow] duration-100 hover:-translate-y-0.5 active:translate-y-px active:shadow-[2px_2px_0_0] active:shadow-background/30 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'

    return (
      <CtaBand
        tone="muted"
        className={`relative overflow-hidden bg-foreground text-background [clip-path:polygon(0_0,100%_3rem,100%_100%,0_100%)] ${props.className ?? ''}`}
      >
        <Watermark className="-right-4 bottom-0 text-[8rem] text-background/[0.05] sm:text-[14rem] lg:text-[20rem]">
          GO
        </Watermark>
        <CtaBandInner
          align="left"
          className="relative max-w-6xl px-6 py-20 pt-24 sm:py-24 sm:pt-28 lg:px-8 lg:py-28 lg:pt-32 xl:px-12"
        >
          <div className="flex w-full items-center gap-4">
            <p className="shrink-0 font-mono text-[11px] uppercase tracking-[0.25em] text-background/60">
              [ final call ]
            </p>
            <span aria-hidden="true" className="h-px flex-1 bg-background/20" />
          </div>
          <CtaBandTitle className="max-w-3xl text-[clamp(2.25rem,6vw,4.5rem)] font-extrabold uppercase leading-[0.92] tracking-tighter text-background">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="text-background/70 opacity-100">
            {description}
          </CtaBandSubtitle>
          <NewsletterSubscribeForm
            lakebed={lakebed}
            source={submit}
            placeholder={emailPlaceholder}
            buttonLabel={submit}
            successMessage="You're on the waitlist. Early access updates will arrive by email."
            className="mt-2 flex w-full max-w-md flex-col gap-3 sm:flex-row"
            inputClassName={inputCls}
            buttonClassName={`${submitCls} disabled:pointer-events-none disabled:opacity-70`}
            emailLabel="Email address for final waitlist signup"
          />
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-background/50">
            {contactPrefix}{' '}
            <NavbarRouteLink
              className="text-background/80 underline underline-offset-4 transition-colors hover:text-background"
              href={contactEmail}
            >
              {contactEmail}
            </NavbarRouteLink>
          </p>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
