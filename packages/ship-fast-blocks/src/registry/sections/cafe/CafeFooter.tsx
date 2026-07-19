import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterTagline,
  FooterLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'
/**
 * CafeFooter — rich multi-column footer for a cozy cafe / coffee shop page on
 * a dark inverted band. Four columns: brand mark + blurb, quick links, business
 * links, and plain-text contact lines. A bottom row holds an auto-updating
 * copyright line + legal links. The brand mark is an inline owl SVG (currentColor
 * → token), copied locally so the footer is self-contained. Every link routes
 * through useNavigate. Use as the closing footer for cafes, bakeries, tea
 * houses, or any warm food-and-drink small business. Renders fully with no props
 * via baked-in defaults.
 */
export const CafeFooter = defineCapsule({
  name: 'CafeFooter',
  description:
    'Rich multi-column footer for a cozy cafe page on a dark inverted band: four columns with brand mark + blurb, quick links, business links, and plain-text contact lines. A bottom row holds an auto-updating copyright line and legal links. The owl brand mark is an inline SVG (currentColor → token), copied locally so the footer is self-contained. Every link routes through useNavigate. Use as the closing footer for cafes, bakeries, tea houses, or warm food-and-drink small businesses.',
  props: z.object({
    /** Cafe / brand name shown with the owl mark. */
    brand: z.string().optional(),
    /** Short brand blurb. */
    blurb: z.string().optional(),
    /** Quick-link labels. */
    quickLinks: z.array(z.string()).optional(),
    /** Business-link labels. */
    businessLinks: z.array(z.string()).optional(),
    /** Contact lines (address, phone, email). */
    contactLines: z.array(z.string()).optional(),
    /** Legal / utility link labels. */
    legalLinks: z.array(z.string()).optional(),
    /** Copyright note. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Little Owl Coffee'
    const blurb =
      props.blurb ??
      'Specialty coffee, house-made pastries, and a space to slow down. Est. 2018 in Portland, Oregon.'
    const legalLinks = props.legalLinks?.length
      ? props.legalLinks
      : ['Privacy Policy', 'Terms of Service', 'Accessibility']
    const note = props.note ?? 'All rights reserved.'
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand}>
              <FooterTagline>{blurb}</FooterTagline>
            </FooterBrand>
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright>{note}</FooterCopyright>
            <FooterLegal>
              {legalLinks.map((l) => (
                <FooterLink key={l}>{l}</FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
