import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
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
 * CybersecurityFooter — dark, full-bleed 5-column mega-footer. A brand-surface
 * footer: a wide brand column (shield logo + name, tagline, and social links)
 * beside several link-list columns, then a bordered-top bottom row with an
 * auto-updating copyright line and a set of legal links. The brand button,
 * every column link, social link and legal link route through section-kit route links. Use
 * as the closing site footer for cybersecurity vendors, SOC/MDR providers, or
 * any enterprise B2B security SaaS. Renders fully with no props via baked-in
 * "SentinelGuard" defaults.
 */
export const CybersecurityFooter = defineCapsule({
  name: 'CybersecurityFooter',
  description:
    'Dark full-bleed 5-column mega-footer on the brand surface: a wide brand column (shield logo + name, tagline, social links) beside several link-list columns, then a bordered-top bottom row with an auto-updating copyright line and legal links. The brand button, column links, social links and legal links route through section-kit route links. Use as the closing site footer for cybersecurity vendors, SOC/MDR providers, or any enterprise B2B security SaaS.',
  props: z.object({
    /** Brand / product name shown beside the shield logo. */
    brand: z.string().optional(),
    /** Short tagline under the brand. */
    tagline: z.string().optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    /** Link-list columns. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Bottom-row legal link labels. */
    legal: z.array(z.string()).optional(),
    /** Social link labels in the brand column. */
    social: z.array(z.string()).optional(),
    /** Navigation target fired by the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'SentinelGuard'
    const tagline =
      props.tagline ??
      'AI-powered cybersecurity platform protecting enterprises worldwide since 2018.'
    const note = props.note ?? 'All rights reserved.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Platform',
            links: [
              'Threat Detection',
              'Cloud Security',
              'Zero Trust',
              'Compliance',
              'API Security',
            ],
          },
          {
            title: 'Solutions',
            links: [
              'Enterprise',
              'Financial Services',
              'Healthcare',
              'Retail',
              'Government',
            ],
          },
          {
            title: 'Company',
            links: ['About Us', 'Careers', 'Press', 'Blog', 'Contact'],
          },
          {
            title: 'Resources',
            links: [
              'Documentation',
              'API Reference',
              'System Status',
              'Security',
              'Privacy Policy',
            ],
          },
        ]
    const legal = props.legal?.length
      ? props.legal
      : ['Terms of Service', 'Privacy Policy', 'Cookie Settings']
    const social = props.social?.length
      ? props.social
      : ['Twitter', 'LinkedIn', 'GitHub']
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand}>
              <FooterTagline>{tagline}</FooterTagline>
              <FooterSocial>
                {social
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
            <FooterCopyright>{note}</FooterCopyright>
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
