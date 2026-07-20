import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterTagline,
  FooterColumn,
  FooterColumnTitle,
  FooterColumnList,
  FooterLink,
  FooterBottom,
  FooterCopyright,
} from '#/section-kit/SiteFooter.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * IllustratorFooter — a paper-wash site footer for an illustrator /
 * visual-artist portfolio, sealed with a dashed hand-drawn top rule. A wide
 * brand column (serif wordmark linking home, bio blurb, copyright) sits beside
 * two link columns (navigation + information) whose entries are block-level and
 * gently dashed-underline on hover; a hairline-divided bottom row carries two
 * small mono notes. Every link and the wordmark route through route links. Use
 * as the closing footer for illustrator and creative portfolios. Renders fully
 * with no props via baked-in "Mira Chen" defaults.
 */
export const IllustratorFooter = defineCapsule({
  name: 'IllustratorFooter',
  description:
    'Paper-wash site footer for an illustrator / visual-artist portfolio, sealed with a dashed hand-drawn top rule: a wide brand column (serif wordmark linking home, bio blurb, copyright) beside two link columns (navigation + information) with block-level entries that dashed-underline on hover, and a hairline-divided bottom row of two small mono notes. Links and the wordmark route through route links. Use as the closing footer for illustrator and creative portfolios.',
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
    const navHeading = props.navHeading ?? 'Explore'
    const navLinks = props.navLinks?.length
      ? props.navLinks
      : ['Work', 'Shop', 'About', 'Contact']
    const infoHeading = props.infoHeading ?? 'Studio'
    const infoLinks = props.infoLinks?.length
      ? props.infoLinks
      : ['Commissions', 'Shipping', 'Licensing', 'Press Kit']
    const homeTarget = props.homeTarget ?? navLinks[0]
    const noteLeft = props.noteLeft ?? 'Made by hand in Portland, Oregon'
    const noteRight = props.noteRight ?? 'Illustration & signed prints'

    const linkClassName =
      'block w-fit font-mono text-xs uppercase tracking-[0.12em] transition-colors hover:text-foreground hover:underline hover:decoration-dashed hover:underline-offset-4'

    return (
      <SiteFooter
        className={cn(
          'border-t-2 border-dashed border-border bg-muted/30',
          props.className,
        )}
      >
        <FooterContent>
          <FooterGrid className="md:grid-cols-4">
            <div className="md:col-span-2">
              <NavbarRouteLink
                href={homeTarget}
                className="inline-flex items-center gap-2 transition-opacity hover:opacity-70"
              >
                <BrandLogo brand={brand} className="flex items-center gap-2">
                  <LogoImage className="size-7" />
                  <LogoLabel className="font-serif text-lg text-foreground" />
                </BrandLogo>
              </NavbarRouteLink>
              <FooterTagline className="max-w-sm">{description}</FooterTagline>
              <FooterCopyright className="mt-4 font-mono text-[11px] uppercase tracking-[0.1em]">
                {copyright}
              </FooterCopyright>
            </div>
            <FooterColumn>
              <FooterColumnTitle className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {navHeading}
              </FooterColumnTitle>
              <FooterColumnList>
                {navLinks.map((link) => (
                  <li key={link}>
                    <FooterLink href={link} className={linkClassName}>
                      {link}
                    </FooterLink>
                  </li>
                ))}
              </FooterColumnList>
            </FooterColumn>
            <FooterColumn>
              <FooterColumnTitle className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {infoHeading}
              </FooterColumnTitle>
              <FooterColumnList>
                {infoLinks.map((link) => (
                  <li key={link}>
                    <FooterLink href={link} className={linkClassName}>
                      {link}
                    </FooterLink>
                  </li>
                ))}
              </FooterColumnList>
            </FooterColumn>
          </FooterGrid>
          <FooterBottom className="border-t-2 border-dashed border-border">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.12em]">
              {noteLeft}
            </FooterCopyright>
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.12em]">
              {noteRight}
            </FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
