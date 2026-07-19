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
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * DocsCta — a clean, centered closing band for a developer documentation home
 * page. Thin configuration over the shared `CtaBand` composite at
 * `tone="primary"`: a short eyebrow, a confident headline, a concise supporting
 * subheading, and a centered row of two routable pill CTAs — a high-contrast
 * "Start building" button (variant "primary", auto-inverted to a light pill on
 * the primary band) that routes to the quickstart, plus an outlined "View API
 * Reference" button (variant "outline"). Both actions navigate through the kit's
 * section-kit route links so neither is a dead link. Use near the bottom of a docs home,
 * API reference, SDK guide, or developer portal page to push readers into the
 * quickstart. Renders fully with no props via crisp, developer-friendly baked-in
 * defaults.
 */
export const DocsCta = defineCapsule({
  name: 'DocsCta',
  description:
    "Clean, centered closing call-to-action band for a developer documentation home page: a full-width section wrapping a primary-colored band with a short eyebrow, a confident headline, a concise supporting subheading, and a centered row of two pill CTAs (a high-contrast 'Start building' button that routes to the quickstart plus an outlined 'View API Reference' button). Both CTAs route through section-kit route links. Use near the bottom of a docs home, API reference, SDK guide, or developer portal page to push readers into getting started.",
  props: z.object({
    /** Short label shown above the headline (maps to CtaBand eyebrow). */
    eyebrow: z.string().optional(),
    /** Closing headline (maps to CtaBand title). */
    headline: z.string().optional(),
    /** Short supporting line under the headline (maps to CtaBand subtitle). */
    subheading: z.string().optional(),
    /** High-contrast primary CTA label. */
    primaryCta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    primaryTarget: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Route label the secondary CTA navigates to. */
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    return (
      <CtaBand tone="primary" className={props.className}>
        <CtaBandInner>
          <CtaBandEyebrow>{props.eyebrow ?? 'Ready to build?'}</CtaBandEyebrow>
          <CtaBandTitle>
            {props.headline ?? 'Start building in minutes'}
          </CtaBandTitle>
          <CtaBandSubtitle>
            {props.subheading ??
              'Grab an API key, follow the quickstart, and ship your first request — the full reference is one click away.'}
          </CtaBandSubtitle>
          <CtaBandActions>
            <CtaAction variant="primary" asChild>
              <NavbarRouteLink href={props.primaryTarget ?? 'Getting Started'}>
                {props.primaryCta ?? 'Start building'}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction variant="outline" asChild>
              <NavbarRouteLink href={props.secondaryTarget ?? 'API Reference'}>
                {props.secondaryCta ?? 'View API Reference'}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
