import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Image } from '#/lib/img.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
/**
 * InsuranceFooter — Swiss-trust ledger footer for an insurance page. A hairline-
 * topped band with a giant ghost brand watermark bleeding off the edge: content
 * sits in a plain Container over an asymmetric grid pairing a wide brand block
 * (shield mark + wordmark, tagline, square mono social chips) with mono index-
 * numbered link columns (products, company, resources, legal) and a dedicated
 * contact column carrying mono phone / email / address rows. A hairline-divided
 * bottom bar carries the auto-updating copyright beside alt-driven trust badges.
 * Every link and social routes through section-kit route links; badges use the
 * Image component. Use as the closing site footer for insurance carriers,
 * insurtech, brokers, or financial-protection products. Renders fully with no
 * props via defaults.
 */
import {
  SiteFooter,
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
export const InsuranceFooter = defineCapsule({
  name: 'InsuranceFooter',
  description:
    'Swiss-trust ledger footer for an insurance page: a hairline-topped band with a giant ghost brand watermark and content in a plain Container, pairing a wide brand block (shield mark + wordmark, tagline, square mono social chips) with mono index-numbered link columns (products, company, resources, legal) and a dedicated contact column of mono phone / email / address rows, above a hairline-divided bottom bar carrying the auto-updating copyright beside alt-driven trust badges. Every link and social routes through section-kit route links; badges use the Image component. Use as the closing site footer for insurance carriers, insurtech startups, brokers, or financial-protection products.',
  props: z.object({
    /** Brand / company name shown beside the shield logo. */
    brand: z.string().optional(),
    /** Blurb paragraph under the brand name. */
    tagline: z.string().optional(),
    /** Link columns (title + link labels). */
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Contact column title. */
    contactTitle: z.string().optional(),
    /** Phone number row. */
    phone: z.string().optional(),
    /** Email address row. */
    email: z.string().optional(),
    /** Street address row. */
    address: z.string().optional(),
    /** Copyright line in the bottom bar. */
    copyright: z.string().optional(),
    /** Social link labels (first letter shown as a button). */
    socials: z.array(z.string()).optional(),
    /** Alt strings for the bottom-bar trust badges. */
    badges: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'SecureLife'
    const tagline =
      props.tagline ??
      'Protecting what matters most for over 25 years. Licensed in all 50 states.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Products',
            links: [
              'Home Insurance',
              'Auto Insurance',
              'Life Insurance',
              'Health Insurance',
              'Renters Insurance',
            ],
          },
          {
            title: 'Company',
            links: ['About Us', 'Careers', 'Press', 'Blog', 'Contact'],
          },
          {
            title: 'Resources',
            links: [
              'Help Center',
              'Claims Center',
              'Agent Portal',
              'Policy Documents',
              'Insurance 101',
            ],
          },
          {
            title: 'Legal',
            links: [
              'Privacy Policy',
              'Terms of Service',
              'Cookie Policy',
              'Licenses',
              'Sitemap',
            ],
          },
        ]
    const contactTitle = props.contactTitle ?? 'Contact'
    const phone = props.phone ?? '1-800-555-0199'
    const email = props.email ?? 'support@securelife.com'
    const address = props.address ?? '500 Trust Ave, Suite 900, Hartford CT'
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Insurance. All rights reserved.`
    const socials = props.socials?.length
      ? props.socials
      : ['Facebook', 'Twitter', 'LinkedIn']
    const badges = props.badges?.length
      ? props.badges
      : ['A+ financial strength rating badge', 'BBB accredited business badge']

    const ShieldMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    )

    const contactRows = [
      { key: 'tel', label: phone },
      { key: 'mail', label: email },
      { key: 'addr', label: address },
    ]

    return (
      <SiteFooter
        className={
          'relative overflow-hidden border-t border-border bg-background' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <Watermark className="-bottom-8 -right-2 text-[5rem] sm:text-[9rem] lg:text-[12rem]">
          {brand}
        </Watermark>
        <Container className="relative py-14 lg:py-16">
          <FooterGrid className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(5,1fr)] lg:gap-8">
            <FooterBrand
              brand={brand}
              brandMark={<ShieldMark className="size-7 text-primary" />}
            >
              <FooterTagline className="max-w-xs">{tagline}</FooterTagline>
              <FooterSocial className="mt-5 gap-2">
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      className="rounded-none border border-border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    >
                      {s.label}
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col, ci) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="flex items-center gap-2 font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground">
                  <span
                    aria-hidden="true"
                    className="tabular-nums text-primary"
                  >
                    {String(ci + 1).padStart(2, '0')}
                  </span>
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <FooterLink
                      key={link}
                      className="block w-fit text-[13px] tracking-tight text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
            <FooterColumn>
              <FooterColumnTitle className="flex items-center gap-2 font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground">
                <span aria-hidden="true" className="tabular-nums text-primary">
                  {String(columns.length + 1).padStart(2, '0')}
                </span>
                {contactTitle}
              </FooterColumnTitle>
              <ul className="mt-4 space-y-2.5">
                {contactRows.map((row) => (
                  <li
                    key={row.key}
                    className="text-[13px] leading-relaxed tracking-tight text-muted-foreground"
                  >
                    {row.label}
                  </li>
                ))}
              </ul>
            </FooterColumn>
          </FooterGrid>
          <FooterBottom className="mt-12 flex flex-col justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {copyright}
            </FooterCopyright>
            <div className="flex flex-wrap items-center gap-4">
              {badges.map((alt) => (
                <Image
                  key={alt}
                  alt={alt}
                  w={120}
                  h={40}
                  className="h-8 w-auto opacity-70 grayscale transition-opacity hover:opacity-100"
                />
              ))}
            </div>
          </FooterBottom>
        </Container>
      </SiteFooter>
    )
  },
})
