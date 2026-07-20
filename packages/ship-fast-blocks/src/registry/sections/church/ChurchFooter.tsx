import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Watermark } from '#/section-kit/Decor.tsx'
import { cn } from '#/lib/utils.ts'
import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterTagline,
  FooterSocial,
  FooterSocialLink,
  FooterLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'
/**
 * ChurchFooter — serene editorial closing footer for a church or
 * faith-community site. A hairline-topped band on a soft muted wash with a
 * giant ghost serif "Amen." watermark drifting off the lower-right edge: the
 * brand column sets the church name beside the mark with an italic serif
 * tagline beneath and quiet social links; the bottom row sits under its own
 * hairline rule with the auto-updating copyright on the left and mono
 * uppercase legal links on the right. Every link and the brand button route
 * through section-kit route links. Use as the closing site footer for
 * churches, parishes, worship centers, ministries, or religious nonprofits.
 * Renders fully with no props via baked-in defaults.
 */
export const ChurchFooter = defineCapsule({
  name: 'ChurchFooter',
  description:
    "Serene editorial closing footer for a church or faith-community site: a hairline-topped band on a soft muted wash with a giant ghost serif 'Amen.' watermark drifting off the lower-right edge — brand column with church name, italic serif tagline, and quiet social links, plus a hairline-ruled bottom row carrying the auto-updating copyright and mono uppercase legal links. Every link and the brand button route through section-kit route links. Use as the closing site footer for churches, parishes, worship centers, ministries, or religious nonprofits.",
  props: z.object({
    /** Church / community name shown beside the star mark. */
    brand: z.string().optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    /** Short about paragraph under the brand. */
    about: z.string().optional(),
    /** Social platform names; must match the built-in icon set (Instagram, YouTube, Facebook) or fall back to an initial letter. */
    socials: z.array(z.string()).optional(),
    /** Title above the quick-links column. */
    quickLinksTitle: z.string().optional(),
    /** Quick-link labels. */
    quickLinks: z.array(z.string()).optional(),
    /** Title above the resources column. */
    resourcesTitle: z.string().optional(),
    /** Resource link labels. */
    resources: z.array(z.string()).optional(),
    /** Title above the contact column. */
    contactTitle: z.string().optional(),
    /** Street address line. */
    address: z.string().optional(),
    /** Phone number shown as a button. */
    phone: z.string().optional(),
    /** Email shown as a button. */
    email: z.string().optional(),
    /** Office-hours line. */
    hours: z.string().optional(),
    /** Copyright line (excluding year). */
    copyright: z.string().optional(),
    /** Legal link labels in the bottom row. */
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Grace Community'
    const about =
      props.about ??
      'A place to belong, believe, and become. Join us Sundays at 9 & 11 AM.'
    const socials = props.socials?.length
      ? props.socials
      : ['Instagram', 'YouTube', 'Facebook']
    const copyright =
      props.copyright ?? 'Grace Community Church. All rights reserved.'
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy', 'Terms', 'Accessibility']
    return (
      <SiteFooter className={cn('relative overflow-hidden', props.className)}>
        <Watermark className="-bottom-10 right-0 font-serif text-[6rem] font-medium italic text-foreground/[0.045] sm:text-[9rem] lg:text-[12rem]">
          Amen.
        </Watermark>
        <FooterContent className="relative py-14 lg:py-16">
          <FooterGrid className="gap-10">
            <FooterBrand brand={brand} className="md:col-span-2">
              <FooterTagline className="mt-4 max-w-xs font-serif text-base italic leading-relaxed text-muted-foreground">
                {about}
              </FooterTagline>
              <FooterSocial className="mt-6 gap-5">
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {s.label}
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
          </FooterGrid>
          <FooterBottom className="mt-12 flex-col items-start gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <FooterCopyright className="text-sm text-muted-foreground">
              {copyright}
            </FooterCopyright>
            <FooterLegal className="gap-6">
              {legal.map((l) => (
                <FooterLink
                  key={l}
                  className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
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
