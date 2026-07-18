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

const brandMark = (
  <svg
    className="size-7 text-primary"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 10 12 5 2 10l10 5 10-5Z" />
    <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
    <path d="M22 10v6" />
  </svg>
)

const DEFAULT_COLUMNS: { title: string; links: string[] }[] = [
  { title: 'Subjects', links: ['Math', 'Science', 'Languages', 'Test Prep'] },
  { title: 'Company', links: ['About', 'Our Tutors', 'Careers', 'Blog'] },
  {
    title: 'Support',
    links: ['Contact', 'Help Center', 'Book a Session', 'FAQ'],
  },
  {
    title: 'Resources',
    links: ['How it Works', 'Pricing', 'Reviews', 'Study Tips'],
  },
]

const DEFAULT_SOCIAL: { label: string; href?: string }[] = [
  { label: 'Instagram' },
  { label: 'Facebook' },
  { label: 'YouTube' },
]

const DEFAULT_LEGAL = ['Privacy', 'Terms', 'Cookies']

export const TutoringFooter = defineCapsule({
  name: 'TutoringFooter',
  description:
    'Friendly, trustworthy site footer for the tutoring page family, composing the SiteFooter kit composite. Renders a graduation-cap brand mark, a warm tagline, social links, and four link columns (Subjects, Company, Support, Resources), plus a bottom bar with copyright, a reassuring note, and legal links. Accepts public props to override every block. Use it as the closing band of any tutoring or education site for consistent, route-aware navigation and a final note of trust.',
  props: z.object({
    brand: z.string().optional(),
    tagline: z.string().optional(),
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    legal: z.array(z.string()).optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'BrightPath Tutoring'
    const tagline =
      props.tagline ??
      'Patient, background-checked tutors helping every learner find their bright path forward.'
    const columns = props.columns?.length ? props.columns : DEFAULT_COLUMNS
    const social = props.social?.length ? props.social : DEFAULT_SOCIAL
    const legal = props.legal?.length ? props.legal : DEFAULT_LEGAL
    const note = props.note ?? 'Made with care for curious minds.'

    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand
              brand={brand}
              brandMark={brandMark}
              brandClassName={'font-semibold'}
            >
              <FooterTagline>{tagline}</FooterTagline>
              <FooterSocial>
                {social.map((s) => (
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
