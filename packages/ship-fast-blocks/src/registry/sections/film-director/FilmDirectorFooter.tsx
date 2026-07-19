import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
/**
 * FilmDirectorFooter — a slim, inverted footer for a film director or
 * cinematographer portfolio. A dark foreground band with muted text: a single
 * row (stacking on mobile) pairing a dynamic-year copyright line (brand + note)
 * on the left with a small set of inline text links on the right that brighten
 * on hover. Links route through section-kit route links. Use as the closing site footer for
 * filmmakers, directors, DPs, or production houses.
 */
import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterBottom,
  FooterCopyright,
} from '#/section-kit/SiteFooter.tsx'
export const FilmDirectorFooter = defineCapsule({
  name: 'FilmDirectorFooter',
  description:
    'Slim, inverted footer for a film director or cinematographer portfolio: a dark foreground band with muted text holding a single row (stacking on mobile) that pairs a dynamic-year copyright line (brand + note) on the left with a small set of inline text links on the right that brighten on hover. Links route through section-kit route links. Use as the closing site footer for filmmakers, directors, DPs, or production houses.',
  props: z.object({
    /** Director / studio name shown in the copyright line. */
    brand: z.string().optional(),
    note: z.string().optional(),
    links: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Marcus Chen'
    const footerNote =
      (props.note ?? 'All rights reserved.')
        ? props.links
        : ['Privacy', 'Terms', 'Credits']
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand} />
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright>{footerNote}</FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
