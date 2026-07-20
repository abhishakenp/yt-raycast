import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterTagline,
  FooterColumn,
  FooterColumnTitle,
  FooterColumnList,
  FooterLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'
/**
 * CafeFooter — newsprint colophon footer for a cozy cafe / coffee shop page on
 * a dark inverted band. The brand mark + serif wordmark and blurb lead a
 * footer grid; when quick-link, business-link, or contact-line props are
 * provided they render as additional columns headed by mono uppercase ledger
 * labels over hairline rules. A hairline-ruled bottom row holds an
 * auto-updating copyright line + mono legal links. Every link routes through
 * section-kit route links. Use as the closing footer for cafes, bakeries, tea
 * houses, or any warm food-and-drink small business. Renders fully with no
 * props via baked-in defaults.
 */
export const CafeFooter = defineCapsule({
  name: 'CafeFooter',
  description:
    'Newsprint colophon footer for a cozy cafe page on a dark inverted band: brand mark + serif wordmark and blurb lead the footer grid, with optional quick-link, business-link, and contact-line columns headed by mono uppercase ledger labels over hairline rules. A hairline-ruled bottom row holds an auto-updating copyright line and mono legal links. Every link routes through section-kit route links. Use as the closing footer for cafes, bakeries, tea houses, or warm food-and-drink small businesses.',
  props: z.object({
    /** Cafe / brand name shown with the owl mark. */
    brand: z.string().optional(),
    /** Short brand blurb. */
    blurb: z.string().optional(),
    /** Quick-link labels. */
    quickLinks: z.array(z.string()).optional(),
    /** Business-link labels. */
    businessLinks: z.array(z.string()).optional(),
    /** Contact lines (address, phone, email). */
    contactLines: z.array(z.string()).optional(),
    /** Legal / utility link labels. */
    legalLinks: z.array(z.string()).optional(),
    /** Copyright note. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Little Owl Coffee'
    const blurb =
      props.blurb ??
      'Specialty coffee, house-made pastries, and a space to slow down. Est. 2018 in Portland, Oregon.'
    const quickLinks = props.quickLinks ?? []
    const businessLinks = props.businessLinks ?? []
    const contactLines = props.contactLines ?? []
    const legalLinks = props.legalLinks?.length
      ? props.legalLinks
      : ['Privacy Policy', 'Terms of Service', 'Accessibility']
    const note = props.note ?? 'All rights reserved.'

    const ColumnTitle = ({ children }: { children: React.ReactNode }) => (
      <FooterColumnTitle className="border-b border-background/20 pb-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.25em] text-background/60">
        {children}
      </FooterColumnTitle>
    )

    return (
      <SiteFooter
        className={cn('border-t border-background/20', props.className)}
      >
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand}>
              <FooterTagline>{blurb}</FooterTagline>
            </FooterBrand>
            {quickLinks.length ? (
              <FooterColumn>
                <ColumnTitle>Explore</ColumnTitle>
                <FooterColumnList className="mt-4">
                  {quickLinks.map((l) => (
                    <li key={l}>
                      <FooterLink>{l}</FooterLink>
                    </li>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ) : null}
            {businessLinks.length ? (
              <FooterColumn>
                <ColumnTitle>Business</ColumnTitle>
                <FooterColumnList className="mt-4">
                  {businessLinks.map((l) => (
                    <li key={l}>
                      <FooterLink>{l}</FooterLink>
                    </li>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ) : null}
            {contactLines.length ? (
              <FooterColumn>
                <ColumnTitle>Contact</ColumnTitle>
                <FooterColumnList className="mt-4">
                  {contactLines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ) : null}
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright className="font-mono text-[10px] uppercase tracking-[0.12em]">
              {note}
            </FooterCopyright>
            <FooterLegal>
              {legalLinks.map((l) => (
                <FooterLink
                  key={l}
                  className="font-mono text-[10px] uppercase tracking-[0.12em]"
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
