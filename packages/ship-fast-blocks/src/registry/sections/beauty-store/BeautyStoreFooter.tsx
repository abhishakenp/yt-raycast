import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'
/**
 * BeautyStoreFooter — slim editorial-vogue colophon footer for a beauty /
 * skincare / cosmetics storefront. A hairline-topped row (stacks on mobile)
 * with the brand wordmark in serif italic on the left, a mono auto-updating
 * copyright line, and legal / utility links set as tiny uppercase mono labels
 * with wide letter-spacing on the right. The brand button and every link route
 * through section-kit route links. Use as the closing site footer for beauty
 * stores, skincare shops, cosmetics brands, or any clean e-commerce landing
 * page.
 */
export const BeautyStoreFooter = defineCapsule({
  name: 'BeautyStoreFooter',
  description:
    'Slim editorial-vogue colophon footer for a beauty / skincare / cosmetics storefront: a hairline-topped row (stacks on mobile) with the brand wordmark in serif italic on the left, a mono auto-updating copyright line, and legal / utility links set as tiny uppercase mono labels with wide letter-spacing on the right. The brand button and every link route through section-kit route links. Use as the closing site footer for beauty stores, skincare shops, cosmetics brands, or any clean e-commerce landing page.',
  props: z.object({
    /** Brand / store name shown in the footer. */
    brand: z.string().optional(),
    /** Copyright note appended after the brand and year. */
    note: z.string().optional(),
    /** Legal / utility link labels on the right. */
    links: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Lumière'
    const note = props.note ?? 'All rights reserved.'
    const links = props.links?.length
      ? props.links
      : ['Privacy', 'Terms', 'Contact']
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand
              brand={brand}
              brandClassName="font-serif text-2xl font-medium italic tracking-tight"
            />
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright className="font-mono text-[10px] uppercase tracking-[0.14em]">
              {note}
            </FooterCopyright>
            <FooterLegal>
              {links.map((l) => (
                <FooterLink
                  key={l}
                  className="font-mono text-[10px] uppercase tracking-[0.18em]"
                >
                  {l}
                </FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
