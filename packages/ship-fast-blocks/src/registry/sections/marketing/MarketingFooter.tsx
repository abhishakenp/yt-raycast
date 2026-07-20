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
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * MarketingFooter — bold-kinetic slim ledger footer for a SaaS / product-
 * marketing landing page. A hairline-topped band with a giant ghost brand
 * watermark bleeding off the bottom edge: a sharp primary brand-initial tile +
 * product name sit above a hairline-divided bottom bar carrying the
 * auto-updating copyright on one side and a wrapping row of mono legal / utility
 * links (each a block w-fit target that underlines to foreground on hover) plus
 * a decorative "[ EOF ]" tag on the other. Confident kinetic-SaaS aesthetic with
 * binary radius; brand mark + links route through section-kit route links. Use
 * as the closing footer for B2B SaaS, productivity, or developer-platform pages.
 */
export const MarketingFooter = defineCapsule({
  name: 'MarketingFooter',
  description:
    'Bold-kinetic slim ledger footer for a SaaS / product-marketing landing page: a hairline-topped band with a giant ghost brand watermark, a sharp primary brand-initial tile + product name above a hairline-divided bottom bar carrying the auto-updating copyright and a wrapping row of mono legal / utility links (block w-fit targets that underline on hover) plus a decorative [ EOF ] tag. Confident kinetic-SaaS aesthetic with binary radius; brand mark + links route through section-kit route links. Use as the closing footer for B2B SaaS, productivity, or developer-platform pages.',
  props: z.object({
    /** Brand / product name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Navigation target for the brand logo button (e.g. nav[0]). */
    homeTarget: z.string().optional(),
    links: z.array(z.string()).optional(),
    copyright: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Flowstate'
    const links = props.links?.length
      ? props.links
      : ['Privacy', 'Terms', 'Security', 'Contact']
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`

    // Brand logo mark — sharp primary tile + brand initial (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid size-7 place-items-center rounded-none bg-primary text-sm font-bold text-primary-foreground',
          className,
        )}
      >
        {brand.charAt(0)}
      </span>
    )

    return (
      <SiteFooter
        className={cn(
          'relative overflow-hidden border-t border-border bg-background',
          props.className,
        )}
      >
        {/* Giant ghost brand watermark bleeding off the bottom edge. */}
        <Watermark className="-bottom-6 -right-2 text-[5rem] sm:text-[9rem] lg:text-[12rem]">
          {brand}
        </Watermark>
        <FooterContent className="relative">
          <FooterGrid>
            <FooterBrand
              brand={brand}
              brandMark={<LogoMark />}
              brandClassName="text-lg font-extrabold tracking-tight text-foreground"
            />
          </FooterGrid>
          <FooterBottom className="mt-10 flex flex-col justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
            <FooterCopyright className="text-sm text-muted-foreground">
              {copyright}
            </FooterCopyright>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <FooterLegal className="flex flex-wrap gap-x-5 gap-y-2">
                {links.map((l) => (
                  <FooterLink
                    key={l}
                    className="block w-fit font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l}
                  </FooterLink>
                ))}
              </FooterLegal>
              <MonoTag tone="faint" aria-hidden="true">
                [ EOF ]
              </MonoTag>
            </div>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
