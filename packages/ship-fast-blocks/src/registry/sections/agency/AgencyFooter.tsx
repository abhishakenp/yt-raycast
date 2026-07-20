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
 * AgencyFooter — slim neo-brutalist bottom footer for a creative
 * digital-agency site. A single row under a thick 2px top border (stacks on
 * mobile): a tilted sharp primary brand-initial tile (2px border, hard offset
 * shadow) + bold uppercase studio name on the left, an auto-updating mono
 * copyright line in the center, and mono uppercase legal/utility links on the
 * right. The brand button and every link route through section-kit route
 * links. Use as the closing site footer for agencies, studios, branding
 * shops, or any bold portfolio landing page. Renders fully with no props via
 * baked-in "Studio Rise" defaults.
 */
export const AgencyFooter = defineCapsule({
  name: 'AgencyFooter',
  description:
    'Slim neo-brutalist bottom footer for a creative digital-agency site: a single row under a thick 2px top border (stacks on mobile) with a tilted sharp primary brand-initial tile with hard offset shadow + bold uppercase studio name on the left, an auto-updating mono copyright line in the center, and mono uppercase legal/utility links on the right. The brand button and every link route through section-kit route links. Use as the closing site footer for agencies, studios, branding shops, or any minimal premium landing page.',
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
          'grid -rotate-3 place-items-center rounded-none border-2 border-foreground bg-primary font-black text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground',
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    return (
      <SiteFooter
        className={cn(
          'border-t-2 border-foreground bg-background',
          props.className,
        )}
      >
        <FooterContent>
          <FooterGrid>
            <FooterBrand
              brand={brand}
              brandMark={<LogoMark />}
              brandClassName="font-black uppercase tracking-tight"
            />
          </FooterGrid>
          <FooterBottom className="border-t-2 border-foreground">
            <FooterCopyright className="font-mono text-xs uppercase tracking-[0.12em]">
              {note}
            </FooterCopyright>
            <FooterLegal>
              {links.map((l) => (
                <FooterLink
                  key={l}
                  className="font-mono text-xs font-bold uppercase tracking-[0.12em] underline-offset-4 hover:underline hover:decoration-primary hover:decoration-2"
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
