import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
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
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'

/**
 * NewsletterFooter — inverted multi-column footer for an editorial newsletter.
 * A full-width dark foreground band: a wide left brand column (serif initial-mark
 * logo + name, a short tagline, and round social icon buttons — a Twitter glyph,
 * otherwise an RSS-style glyph), then link columns of grouped routes; a bottom
 * bar separates an auto-year copyright line from inline legal links. Warm, calm,
 * literary mood inverted to close the page. Brand, social buttons, every link and
 * legal item route through section-kit route links. Use as the site footer for newsletters,
 * publications, blogs, or content creators. Renders fully with no props via
 * baked-in defaults.
 */
export const NewsletterFooter = defineCapsule({
  name: 'NewsletterFooter',
  description:
    'Inverted multi-column footer for an editorial newsletter: a full-width dark foreground band with a wide left brand column (serif initial-mark logo + name, a short tagline, and round social icon buttons — a Twitter glyph, otherwise an RSS-style glyph), then link columns of grouped routes; a bottom bar separates an auto-year copyright line from inline legal links. Warm, calm, literary mood inverted to close the page. Brand, social buttons, every link and legal item route through section-kit route links. Use as the site footer for newsletters, publications, blogs, essayists, or content creators.',
  props: z.object({
    /** Brand / publication name shown beside the serif logo mark. */
    brand: z.string().optional(),
    /** Short tagline under the brand. */
    tagline: z.string().optional(),
    /** Social button labels (a 'Twitter' label gets the X glyph, others an RSS glyph). */
    socials: z.array(z.string()).optional(),
    /** Grouped link columns. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Copyright suffix after the auto-year + brand. */
    copyright: z.string().optional(),
    /** Inline legal links in the bottom bar. */
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'The Quiet Observer'
    const tagline =
      props.tagline ??
      'Thoughtful essays on technology, creativity, and human connection. Written by Sarah Mitchell in Brooklyn, NY.'
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'RSS Feed']
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Newsletter',
            links: ['Recent Issues', 'Archive', 'Audio Feed', 'Subscribe'],
          },
          {
            title: 'Connect',
            links: ['About', 'Discord', 'Contact', 'Sponsor'],
          },
        ]
    const copyright = props.copyright ?? 'All rights reserved.'
    const legal = props.legal?.length ? props.legal : ['Privacy', 'Terms']

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-muted-foreground/30 font-serif font-medium text-background',
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
            <FooterBrand brand={brand} brandMark={<LogoMark />}>
              <FooterTagline>{tagline}</FooterTagline>
              <FooterSocial>
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink key={s.label}>{s.label}</FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle>{col.title}</FooterColumnTitle>
                <FooterColumnList>
                  {col.links.map((link) => (
                    <FooterLink key={link}>{link}</FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright>{copyright}</FooterCopyright>
            <FooterLegal>
              {legal.map((l) => (
                <FooterLink key={l}>{l}</FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
