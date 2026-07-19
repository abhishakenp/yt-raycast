import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterTagline,
  FooterBottom,
  FooterCopyright,
} from '#/section-kit/SiteFooter.tsx'
/**
 * IllustratorFooter — a multi-column dark site footer for an illustrator /
 * visual-artist portfolio. A foreground-colored band with inverted type: a
 * wide brand column (serif wordmark, bio blurb, copyright) beside two link
 * columns (navigation + information), with a hairline-divided bottom row
 * holding two small notes. Every link and the wordmark route through
 * useNavigate. Use as the closing footer for illustrator and creative
 * portfolios. Renders fully with no props via baked-in "Mira Chen" defaults.
 */
export const IllustratorFooter = defineCapsule({
  name: 'IllustratorFooter',
  description:
    'Multi-column dark site footer for an illustrator / visual-artist portfolio: a foreground-colored band with inverted type holding a wide brand column (serif wordmark, bio blurb, copyright) beside two link columns (navigation + information), with a hairline-divided bottom row of two small notes. Links and the wordmark route through useNavigate. Use as the closing footer for illustrator and creative portfolios.',
  props: z.object({
    /** Artist / brand name shown as the serif wordmark. */
    brand: z.string().optional(),
    /** Navigation target for the wordmark click. */
    homeTarget: z.string().optional(),
    /** Bio blurb under the wordmark. */
    description: z.string().optional(),
    /** Copyright line. */
    copyright: z.string().optional(),
    /** Navigation column heading. */
    navHeading: z.string().optional(),
    /** Navigation column links. */
    navLinks: z.array(z.string()).optional(),
    /** Information column heading. */
    infoHeading: z.string().optional(),
    /** Information column links. */
    infoLinks: z.array(z.string()).optional(),
    /** Small note on the bottom-left. */
    noteLeft: z.string().optional(),
    /** Small note on the bottom-right. */
    noteRight: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Mira Chen'
    const description =
      props.description ??
      "Independent illustrator creating whimsical art for children's books, editorial features, and collectors worldwide. Based in Portland, Oregon."
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Illustration. All rights reserved.`
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand}>
              <FooterTagline>{description}</FooterTagline>
            </FooterBrand>
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright>{copyright}</FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
