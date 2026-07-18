import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * NoCodeFooter — rich multi-column footer on a card surface with a top border.
 * A 2-to-5 column grid: a wide brand column (inverse cube-glyph logo tile +
 * brand name, a short description, and round social-initial buttons) beside
 * several link columns, then a bordered bottom row with an auto-updating
 * copyright line and a set of legal links. The brand button and every link
 * route through useNavigate. Use as the closing site footer for a no-code
 * builder, SaaS, or product landing page. Renders fully with no props.
 */
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
export const NoCodeFooter = defineCapsule({
  name: 'NoCodeFooter',
  description:
    'Rich multi-column footer on a card surface with a top border: a 2-to-5 column grid with a wide brand column (inverse cube-glyph logo tile + brand name, a short description, and round social-initial buttons) beside several link columns, then a bordered bottom row with an auto-updating copyright line and a set of legal links. The brand button and every link route through useNavigate. Use as the closing site footer for a no-code / app-builder SaaS or product landing page.',
  props: z.object({
    /** Brand / product name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Short description under the brand. */
    description: z.string().optional(),
    /** Link columns (title + links). */
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Social network labels (rendered as round initial buttons). */
    socials: z.array(z.string()).optional(),
    /** Copyright line (defaults to brand + current year). */
    copyright: z.string().optional(),
    /** Legal / utility link labels in the bottom row. */
    legal: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Buildr'
    const description =
      props.description ??
      'The no-code platform that empowers anyone to build beautiful, functional apps without writing code.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: [
              'Features',
              'Templates',
              'Pricing',
              'Integrations',
              'Changelog',
            ],
          },
          {
            title: 'Company',
            links: ['About', 'Blog', 'Careers', 'Press', 'Partners'],
          },
          {
            title: 'Resources',
            links: [
              'Documentation',
              'Help Center',
              'Community',
              'Contact',
              'Status',
            ],
          },
        ]
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'GitHub', 'LinkedIn']
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookies']
    const homeTarget = props.homeTarget ?? 'Features'
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-foreground text-background',
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
          <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </span>
    )
    void homeTarget
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand} brandMark={<LogoMark />}>
              <FooterTagline>{description}</FooterTagline>
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
