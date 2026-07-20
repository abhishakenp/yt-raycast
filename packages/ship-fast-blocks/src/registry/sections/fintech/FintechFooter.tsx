import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

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
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'

/**
 * FintechFooter — Swiss-fintech multi-column site footer for a neobank landing
 * page. A thin configuration over the shared SiteFooter composite with hairline
 * discipline: an inline shield brand mark + wordmark, a tagline, a giant ghost
 * watermark of the brand bleeding behind the columns, mono index-numbered
 * Product / Company / Resources / Legal columns whose links sit as block w-fit
 * rows, a social row, and a mono compliance note in the hairline bottom bar.
 * Every link routes through route links. Use as the page footer for banking
 * apps, wallets, payments, or lending products. Renders fully with no props via
 * baked-in "Vault" defaults.
 */
function ShieldMark({ className }: { className?: string }) {
  return (
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
}

export const FintechFooter = defineCapsule({
  name: 'FintechFooter',
  description:
    'Swiss-fintech multi-column neobank site footer built on the shared SiteFooter composite with hairline discipline: an inline shield brand mark + wordmark, a tagline, a giant ghost brand watermark behind the columns, mono index-numbered Product / Company / Resources / Legal columns with block w-fit link rows, a social row, and a mono compliance note in the hairline bottom bar. Every link routes through route links. Use as the page footer for banking apps, wallets, payments, or lending products.',
  props: z.object({
    /** Brand / product name. */
    brand: z.string().optional(),
    /** Tagline beneath the brand. */
    tagline: z.string().optional(),
    /** Footer link columns. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Social links. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Legal link labels in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Compliance note appended to the copyright line. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Vault'
    const tagline =
      props.tagline ??
      'Banking that puts you first. Send, save, and spend with confidence.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: ['Features', 'Security', 'Pricing', 'Cards', 'Savings'],
          },
          {
            title: 'Company',
            links: ['About', 'Careers', 'Press', 'Blog'],
          },
          {
            title: 'Resources',
            links: ['Help Center', 'FAQ', 'Community', 'API Docs'],
          },
          {
            title: 'Legal',
            links: ['Privacy', 'Terms', 'Compliance', 'Licenses'],
          },
        ]
    const social = props.social?.length
      ? props.social
      : [{ label: 'Twitter' }, { label: 'LinkedIn' }, { label: 'Instagram' }]
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Settings']
    const note =
      props.note ?? 'FDIC insured. Member-backed deposits up to $250,000.'

    return (
      <SiteFooter className={props.className}>
        <FooterContent className="relative overflow-hidden">
          <Watermark className="-bottom-10 -left-2 text-[9rem] leading-none sm:text-[13rem]">
            {brand}
          </Watermark>
          <FooterGrid className="relative gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
            <FooterBrand
              brand={brand}
              brandMark={<ShieldMark className="size-7 text-primary" />}
            >
              <FooterTagline className="max-w-xs">{tagline}</FooterTagline>
              <FooterSocial className="mt-5 gap-4">
                {social.map((s) => (
                  <FooterSocialLink
                    key={s.label}
                    className="font-mono text-[11px] uppercase tracking-[0.2em]"
                  >
                    {s.label}
                  </FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col, ci) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
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
                      className="block w-fit text-[13px] tracking-tight"
                    >
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="relative mt-14 border-border">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.16em]">
              {note}
            </FooterCopyright>
            <FooterLegal className="gap-5">
              {legal.map((l) => (
                <FooterLink
                  key={l}
                  className="block w-fit font-mono text-[11px] uppercase tracking-[0.16em]"
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
