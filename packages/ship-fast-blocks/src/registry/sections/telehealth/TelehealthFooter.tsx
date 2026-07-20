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
 * TelehealthFooter — calm clinical + warmth hairline ledger footer for a
 * telehealth / virtual-care brand, built on the shared SiteFooter composite. A
 * quiet border-topped band on a soft muted wash with an asymmetric 12-column
 * grid: a wide brand block (square rounded-none primary heart-pulse glyph tile +
 * brand wordmark, a short tagline, and square mono social chips), then Services,
 * Company, Support, and Legal link columns whose titles are mono uppercase
 * micro-labels and whose links sit as block w-fit route links, closed by a
 * hairline copyright + compliance bar. Fully theme-tokened and responsive.
 * Precise yet warm, telemedicine aesthetic. Use as the final band of any
 * telehealth page to provide navigation, trust links, and legal context.
 */
export const TelehealthFooter = defineCapsule({
  name: 'TelehealthFooter',
  description:
    'Calm clinical + warmth hairline ledger footer for a telehealth / virtual care brand, built on the shared SiteFooter composite: a quiet border-topped band on a soft muted wash with an asymmetric 12-column grid holding a wide brand block (square rounded-none primary heart-pulse glyph tile + brand wordmark, a short tagline, and square mono social chips), then Services, Company, Support, and Legal link columns whose titles are mono uppercase micro-labels and whose links sit as block w-fit route links, closed by a hairline copyright + compliance bar. Fully theme-tokened and responsive. Use as the final band of any telehealth page to provide navigation, trust links, and legal context.',
  props: z.object({
    brand: z.string().optional(),
    tagline: z.string().optional(),
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'MendWell'
    const tagline =
      props.tagline ??
      'Calm, board-certified virtual care for you and your family — whenever you need it.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Services',
            links: [
              'Primary Care',
              'Mental Health',
              'Prescriptions',
              'Urgent Care',
            ],
          },
          {
            title: 'Company',
            links: ['About', 'How it works', 'Careers', 'Press'],
          },
          {
            title: 'Support',
            links: ['Help Center', 'Contact', 'Insurance', 'FAQ'],
          },
          {
            title: 'Legal',
            links: ['Privacy', 'Terms', 'HIPAA Notice', 'Accessibility'],
          },
        ]
    const social = props.social?.length
      ? props.social
      : [{ label: 'Twitter' }, { label: 'Instagram' }, { label: 'LinkedIn' }]
    const note = props.note ?? 'Not for medical emergencies — call 911.'

    const brandMark = (
      <span
        className="inline-flex size-8 items-center justify-center rounded-none bg-primary text-primary-foreground"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12h4l2 5 4-12 2 7h6" />
        </svg>
      </span>
    )

    return (
      <SiteFooter className={props.className}>
        <FooterContent className="py-14 sm:py-16">
          <FooterGrid className="gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-12">
            <FooterBrand
              brand={brand}
              brandMark={brandMark}
              brandClassName="text-lg font-bold tracking-tight"
              className="md:col-span-2 lg:col-span-4"
            >
              <FooterTagline className="mt-3 max-w-xs leading-relaxed">
                {tagline}
              </FooterTagline>
              <FooterSocial className="mt-5 gap-2">
                {social.map((s) => (
                  <FooterSocialLink
                    key={s.label}
                    className="border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground active:translate-y-px"
                  >
                    {s.label}
                  </FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title} className="lg:col-span-2">
                <FooterColumnTitle className="font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground">
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <FooterLink className="block w-fit text-foreground/80 hover:text-foreground">
                        {link}
                      </FooterLink>
                    </li>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="mt-14">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.15em]">
              {note}
            </FooterCopyright>
            <FooterLegal className="gap-x-6 gap-y-2">
              {['Privacy', 'Terms', 'Cookies'].map((l) => (
                <FooterLink
                  key={l}
                  className="block w-fit font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground/70 hover:text-foreground"
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
