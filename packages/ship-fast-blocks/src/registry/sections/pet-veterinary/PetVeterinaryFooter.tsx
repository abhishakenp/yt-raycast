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
    'Warm friendly-clinical hairline ledger footer for a veterinary clinic / pet-healthcare site, composing the SiteFooter kit composite. A border-topped band with an asymmetric grid: a wide brand block (round primary smiley-glyph mark + clinic name + heartfelt tagline + square mono social chips), followed by four link columns (Services, Clinic & Hours, Company, Legal) with mono uppercase micro-label titles and quiet block links, closed by a hairline mono copyright + legal bar. Accepts public props to override every block. Use it as the closing band of any pet-care or veterinary site for consistent, route-aware navigation and a final note of trust.',
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
                    <FooterLink
                      key={link}
                      className="block w-fit text-foreground/80 hover:text-foreground"
                    >
                      {link}
                    </FooterLink>
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
              {DEFAULT_LEGAL.map((l) => (
                <FooterLink
                  key={l}
                  className="block w-fit text-xs text-muted-foreground hover:text-foreground"
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
