import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
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
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'
/**
 * CybersecurityFooter — terminal-stealth site registry footer. A
 * hairline-topped footer on the base surface with a giant "//"-glyph ghost
 * watermark: an asymmetric grid gives the brand column (shield logo + name,
 * tagline, mono square-chip social links) roughly double width beside four
 * link-list columns with mono uppercase titles, then a hairline-topped bottom
 * row pairing the copyright note and a decorative mono "[ EOF ]" tag with the
 * legal links. Every column link and legal link routes through section-kit
 * route links. Use as the closing site footer for cybersecurity vendors,
 * SOC/MDR providers, or any enterprise B2B security SaaS. Renders fully with
 * no props via baked-in "SentinelGuard" defaults.
 */
export const CybersecurityFooter = defineCapsule({
  name: 'CybersecurityFooter',
  description:
    "Terminal-stealth site registry footer: a hairline-topped footer with a giant ghost watermark and an asymmetric grid — a double-width brand column (shield logo + name, tagline, mono square-chip social links) beside four link-list columns with mono uppercase titles, then a hairline-topped bottom row with the copyright note, a decorative mono '[ EOF ]' tag, and legal links. Column links, social links and legal links route through section-kit route links. Use as the closing site footer for cybersecurity vendors, SOC/MDR providers, or any enterprise B2B security SaaS.",
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
      <SiteFooter
        className={
          'relative overflow-hidden border-t border-border bg-background' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <Watermark className="-bottom-10 -right-6 text-[8rem] sm:text-[12rem]">
          {'//'}
        </Watermark>
        <Container className="relative py-12 sm:py-16">
          <FooterGrid className="gap-x-8 gap-y-10 grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.8fr_1fr_1fr_1fr_1fr]">
            <FooterBrand
              brand={brand}
              className="col-span-2 md:col-span-3 lg:col-span-1"
            >
              <FooterTagline className="mt-4 max-w-xs text-sm leading-relaxed">
                {tagline}
              </FooterTagline>
              <FooterSocial className="mt-5 gap-2">
                {social
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      className="border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors hover:border-foreground hover:text-foreground"
                    >
                      {s.label}
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col, colIndex) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="flex items-baseline gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em]">
                  <span
                    aria-hidden="true"
                    className="text-muted-foreground/50 tabular-nums"
                  >
                    {String(colIndex + 1).padStart(2, '0')}
                  </span>
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <FooterLink key={link} className="block w-fit">
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="mt-12 border-t border-border pt-6">
            <span className="flex items-center gap-4">
              <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.15em]">
                {note}
              </FooterCopyright>
              <span
                aria-hidden="true"
                className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground/50"
              >
                [ EOF ]
              </span>
            </span>
            <FooterLegal className="gap-4">
              {legal.map((l) => (
                <FooterLink
                  key={l}
                  className="font-mono text-[11px] uppercase tracking-[0.12em]"
                >
                  {l}
                </FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </Container>
      </SiteFooter>
    )
  },
})
