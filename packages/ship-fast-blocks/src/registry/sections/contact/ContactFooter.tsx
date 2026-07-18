import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterBottom,
  FooterCopyright,
} from '#/section-kit/SiteFooter.tsx'

/**
 * ContactFooter — minimal bottom footer for a contact page.
 * A single bordered-top row centered with an auto-updating copyright line.
 * Clean, unobtrusive closing surface on dark or light themes. Use as the site
 * footer for contact, support, or inquiry pages. Renders fully with no props via
 * baked-in defaults.
 */
export const ContactFooter = defineCapsule({
  name: 'ContactFooter',
  description:
    'Minimal bottom footer for a contact page: a single bordered-top row centered with an auto-updating copyright line. Clean, unobtrusive closing surface on dark or light themes. Use as the site footer for contact, support, or inquiry pages.',
  props: z.object({
    /** Brand / product name included in the copyright line. */
    brand: z.string().optional(),
    /** Full custom copyright line (overrides generated default). */
    copyright: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Orbit Digital'
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`

    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand} />
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright>{copyright}</FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
