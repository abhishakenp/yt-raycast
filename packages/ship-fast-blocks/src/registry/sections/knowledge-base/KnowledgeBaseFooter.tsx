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
 * KnowledgeBaseFooter — five-column site footer for a help center on the page
 * surface with a top border. A wide brand column (solid rounded book-glyph tile
 * + wordmark, a tagline paragraph and inline social text buttons) sits beside
 * product/resources/company link columns; below them a bordered-top bar pairs an
 * auto-updating copyright line with legal links. Calm, light, editorial. The
 * brand button, socials and every link route through useNavigate. Use as the
 * closing footer for a knowledge base, support portal, docs site or FAQ hub.
 * Renders fully with no props via baked-in "Help Center" defaults.
 */
export const KnowledgeBaseFooter = defineCapsule({
  name: 'KnowledgeBaseFooter',
  description:
    'Five-column site footer for a help center on the page surface with a top border: a wide brand column (solid rounded book-glyph tile + wordmark, a tagline paragraph and inline social text buttons) beside product/resources/company link columns, above a bordered-top bar pairing an auto-updating copyright line with legal links. Calm, light, editorial; the brand button, socials and every link route through useNavigate. Use as the closing footer for a knowledge base, support portal, docs site or FAQ hub.',
  props: z.object({
    /** Brand / help-center name shown beside the logo tile. */
    brand: z.string().optional(),
    tagline: z.string().optional(),
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    socials: z.array(z.string()).optional(),
    copyright: z.string().optional(),
    legal: z.array(z.string()).optional(),
    /** Navigation target for the brand button (defaults to "Categories"). */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Help Center'
    const tagline =
      props.tagline ??
      'Comprehensive documentation, guides, and support to help you get the most out of our platform.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: ['Features', 'Pricing', 'Integrations', 'API', 'Security'],
          },
          {
            title: 'Resources',
            links: ['Documentation', 'Guides', 'Blog', 'Community', 'Status'],
          },
          {
            title: 'Company',
            links: ['About', 'Careers', 'Contact', 'Privacy', 'Terms'],
          },
        ]
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'LinkedIn', 'GitHub', 'YouTube']
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand}. All rights reserved.`
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Settings']
    const homeTarget = props.homeTarget ?? 'Categories'

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </span>
    )

    void homeTarget
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
