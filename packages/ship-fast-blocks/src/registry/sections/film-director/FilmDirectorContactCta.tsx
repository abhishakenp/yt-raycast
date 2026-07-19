import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * FilmDirectorContactCta — an inverted, near-black contact CTA band for a film
 * director or cinematographer. On a dark foreground band: a centered thin
 * headline + muted lede, a pair of CTA buttons (a filled email button with mail
 * icon + an outlined phone button with phone icon), and a bordered top divider
 * leading into a 3-column detail row (studio address, representation, and a row
 * of social links). All actions route through useNavigate. Use as the closing
 * contact / booking call-to-action for filmmakers, directors, DPs, or production
 * houses.
 */
export const FilmDirectorContactCta = defineCapsule({
  name: 'FilmDirectorContactCta',
  description:
    'Inverted, near-black contact CTA band for a film director or cinematographer: on a dark foreground band, a centered thin headline + muted lede, a pair of CTA buttons (a filled email button with mail icon and an outlined phone button with phone icon), and a bordered top divider leading into a 3-column detail row (studio address, representation, and a row of social links). All actions route through useNavigate. Use as the closing contact / booking call-to-action for filmmakers, directors, DPs, or production houses.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    studioLabel: z.string().optional(),
    studio: z.string().optional(),
    repLabel: z.string().optional(),
    rep: z.string().optional(),
    socialLabel: z.string().optional(),
    social: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const contactHeading =
      props.heading ?? 'Ready to create something remarkable?'
    const contactDesc =
      props.description ??
      "Let's discuss your project, timeline, and vision. I'm currently booking projects for Q3 2025."
    const contactEmail = props.email ?? 'hello@marcuschen.film'
    const contactPhone = props.phone ?? '+1 (310) 555-1234'
    const contactStudioLabel = props.studioLabel ?? 'Studio'
    const contactStudio =
      props.studio ?? '1247 Abbot Kinney Blvd, Venice, CA 90291'
    const contactRepLabel = props.repLabel ?? 'Representation'
    const contactRep =
      props.rep ??
      'Samantha Wright, United Talent Agency, samantha.wright@uta.com'
    const contactSocialLabel = props.socialLabel ?? 'Social'
    const contactSocial = props.social?.length
      ? props.social
      : ['Instagram', 'Vimeo', 'LinkedIn']

    return (
      <CtaBand
        tone="primary"
        className={`bg-foreground text-background ${props.className ?? ''}`}
      >
        <CtaBandInner>
          <CtaBandTitle>{contactHeading}</CtaBandTitle>
          <CtaBandSubtitle>{contactDesc}</CtaBandSubtitle>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <CtaAction
              variant="primary"
              invert
              className="rounded-md px-8 py-4 text-foreground"
              onClick={() => go(contactEmail)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 size-5"
                aria-hidden="true"
              >
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {contactEmail}
            </CtaAction>
            <CtaAction
              variant="outline"
              className="rounded-md border-border px-8 py-4 hover:border-background"
              onClick={() => go(contactPhone)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 size-5"
                aria-hidden="true"
              >
                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {contactPhone}
            </CtaAction>
          </div>
          <ResponsiveGrid
            cols="1-md-3"

            className="border-t border-border pt-16 text-left"
          >
            <div>
              <p className="mb-2 text-sm text-primary-foreground/70">
                {contactStudioLabel}
              </p>
              <p className="text-sm">{contactStudio}</p>
            </div>
            <div>
              <p className="mb-2 text-sm text-primary-foreground/70">
                {contactRepLabel}
              </p>
              <p className="text-sm">{contactRep}</p>
            </div>
            <div>
              <p className="mb-2 text-sm text-primary-foreground/70">
                {contactSocialLabel}
              </p>
              <div className="flex gap-4">
                {contactSocial.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => go(s)}
                    className="text-sm transition-colors hover:text-primary-foreground/70"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </ResponsiveGrid>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
