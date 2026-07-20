import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterTagline,
  FooterSocial,
  FooterSocialLink,
  FooterColumn,
  FooterColumnTitle,
  FooterColumnList,
  FooterLink,
  FooterBottom,
  FooterCopyright,
} from '#/section-kit/SiteFooter.tsx'

/**
 * PortfolioFooter — editorial-personal closing footer for a creative-individual
 * portfolio. Built on the shared `SiteFooter` composite over a giant faint
 * ghost wordmark of the brand name: an extrabold wordmark + tagline + a mono
 * social row (Instagram, Behance, LinkedIn) in an asymmetric grid beside link
 * columns (Explore, Services, Contact) whose mono uppercase titles head
 * `block w-fit` links, with contact details folded in as links. The
 * hairline-topped bottom bar carries a mono auto-updating copyright line. Every
 * brand, social, and column link routes through section-kit route links. Use as
 * the site-wide footer for a designer, art director, animator, motion or 3D
 * artist personal site. Renders fully with no props via baked-in "Kaelen Vance"
 * defaults.
 */
export const PortfolioFooter = defineCapsule({
  name: 'PortfolioFooter',
  description:
    'Editorial-personal closing footer for a creative-individual portfolio built on the shared SiteFooter composite over a giant faint ghost wordmark of the brand name: an extrabold wordmark + tagline + a mono social row (Instagram, Behance, LinkedIn) beside link columns (Explore, Services, Contact) whose mono uppercase titles head block w-fit links, with contact details folded in as links, and a hairline-topped bottom bar carrying a mono auto-updating copyright line. Every brand, social, and column link routes through section-kit route links. Use as the site-wide footer for a designer, art director, animator, motion or 3D artist personal site.',
  props: z.object({
    /** Brand / person name shown as the wordmark. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Explore, Services, Contact, …), each a title + labels. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Kaelen Vance'
    const social = props.social?.length
      ? props.social
      : [{ label: 'Instagram' }, { label: 'Behance' }, { label: 'LinkedIn' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Explore',
            links: ['Work', 'About', 'Services', 'Contact'],
          },
          {
            title: 'Services',
            links: ['Art Direction', 'Motion Design', '3D & CGI', 'Branding'],
          },
          {
            title: 'Contact',
            links: [
              'hello@kaelenvance.com',
              'Based in Berlin · Working worldwide',
              'Get in touch',
            ],
          },
        ]

    return (
      <SiteFooter
        className={cn('relative overflow-hidden bg-muted/30', props.className)}
      >
        <Watermark className="-bottom-10 -right-2 text-[6rem] sm:text-[10rem] lg:text-[13rem]">
          {brand}
        </Watermark>
        <FooterContent className="relative">
          <FooterGrid>
            <FooterBrand
              brand={brand}
              brandClassName={'text-xl font-extrabold tracking-tight'}
            >
              <FooterTagline>
                {props.tagline ??
                  'Motion designer and art director crafting dimensional stories that move.'}
              </FooterTagline>
              <FooterSocial>
                {social.map((s) => (
                  <FooterSocialLink
                    key={s.label}
                    className="font-mono text-[11px] uppercase tracking-[0.14em]"
                  >
                    {s.label}
                  </FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList>
                  {col.links.map((link) => (
                    <FooterLink key={link} className="block w-fit">
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.14em]">
              © {new Date().getFullYear()} {brand}.{' '}
              {props.note ?? 'All rights reserved.'}
            </FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
