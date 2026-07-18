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
  <span
    className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground"
    aria-hidden="true"
  >
    <svg
      width="60%"
      height="60%"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
    </svg>
  </span>
)

const DEFAULT_COLUMNS: { title: string; links: string[] }[] = [
  {
    title: 'Services',
    links: ['Wellness Exams', 'Dental Care', 'Surgery', 'Emergency Care'],
  },
  {
    title: 'Clinic & Hours',
    links: ['Mon–Fri 8am–6pm', 'Sat 9am–2pm', 'Sun Closed', 'Visit Us'],
  },
  { title: 'Company', links: ['About Us', 'Our Team', 'Pricing', 'Reviews'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies'] },
]

const DEFAULT_SOCIAL: { label: string; href?: string }[] = [
  { label: 'Instagram' },
  { label: 'Facebook' },
  { label: 'YouTube' },
]

const DEFAULT_LEGAL = ['Privacy', 'Terms', 'Cookies']

export const PetVeterinaryFooter = defineCapsule({
  name: 'PetVeterinaryFooter',
  description:
    'Warm, friendly site footer for a veterinary clinic / pet-healthcare site, composing the SiteFooter kit composite. Renders a caring paw-glyph brand mark, a heartfelt tagline, social links, and four link columns (Services, Clinic & Hours, Company, Legal), plus a bottom bar with copyright, a reassuring note, and legal links. Accepts public props to override every block. Use it as the closing band of any pet-care or veterinary site for consistent, route-aware navigation and a final note of trust.',
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
    const brand = props.brand ?? 'Paws & Care'
    const tagline =
      props.tagline ??
      'Compassionate, gentle veterinary care for every member of your family — fur, feathers, and all.'
    const columns = props.columns?.length ? props.columns : DEFAULT_COLUMNS
    const social = props.social?.length ? props.social : DEFAULT_SOCIAL
    const note = props.note ?? 'Caring for pets and their people since 2007.'

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
              {DEFAULT_LEGAL.map((l) => (
                <FooterLink key={l}>{l}</FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
