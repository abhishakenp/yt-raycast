import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
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
 * AgencyFooter — slim bottom footer for a creative digital-agency site. A
 * single bordered-top row (stacks on mobile): a gradient brand-initial logo
 * tile + studio name on the left, an auto-updating copyright line in the
 * center, and a set of legal/utility links on the right. The brand button and
 * every link route through section-kit route links. Use as the closing site footer for
 * agencies, studios, branding shops, or any minimal premium landing page.
 * Renders fully with no props via baked-in "Studio Rise" defaults.
 */
export const AgencyFooter = defineCapsule({
  name: 'AgencyFooter',
  description:
    'Slim bottom footer for a creative digital-agency site: a single bordered-top row (stacks on mobile) with a gradient brand-initial logo tile + studio name on the left, an auto-updating copyright line in the center, and a set of legal/utility links on the right. The brand button and every link route through section-kit route links. Use as the closing site footer for agencies, studios, branding shops, or any minimal premium landing page.',
  props: z.object({
    /** Brand / studio name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    /** Legal / utility link labels on the right. */
    links: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Studio Rise'
    const note = props.note ?? 'All rights reserved.'
    const links = props.links?.length ? props.links : ['Privacy', 'Terms']
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-gradient-to-br from-primary to-accent font-black text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand} brandMark={<LogoMark />} />
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright>{note}</FooterCopyright>
            <FooterLegal>
              {links.map((l) => (
                <FooterLink key={l}>{l}</FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
