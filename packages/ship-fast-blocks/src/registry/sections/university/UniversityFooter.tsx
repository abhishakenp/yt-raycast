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
import { Watermark } from '#/section-kit/Decor.tsx'
import { cn } from '#/lib/utils.ts'

function UniversityBrandSeal() {
  return (
    <span
      aria-hidden="true"
      className="grid size-7 place-items-center rounded-none border border-foreground/15 bg-primary text-primary-foreground"
    >
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 10 12 5 2 10l10 5 10-5Z" />
        <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
        <path d="M22 10v6" />
      </svg>
    </span>
  )
}

export const UniversityFooter = defineCapsule({
  name: 'UniversityFooter',
  description:
    'Editorial-academic site footer for the University page family. Composes the shared SiteFooter kit composite with a serif wordmark and squared graduation-cap brand seal, an institutional Latin-motto tagline, a giant ghost founding-year watermark, and four link columns (Academics, Admissions, Campus, About) whose mono uppercase catalog titles head hairline-spaced block links. A social row and a mono legal note (Privacy, Accessibility, Title IX, Nondiscrimination) close the band. Use as the closing band of any university homepage or as the persistent footer across a multi-page campus site.',
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
    const brand = props.brand ?? 'Whitmore University'
    const tagline =
      props.tagline ?? 'Lux et Veritas — light and truth since 1887.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Academics',
            links: [
              'Colleges & Schools',
              'Majors',
              'Graduate Programs',
              'Libraries',
            ],
          },
          {
            title: 'Admissions',
            links: ['Apply', 'Visit', 'Financial Aid', 'Transfer Students'],
          },
          {
            title: 'Campus',
            links: ['Campus Life', 'Housing', 'Athletics', 'Dining'],
          },
          {
            title: 'About',
            links: ['Our History', 'Leadership', 'News', 'Contact'],
          },
        ]
    const social = props.social?.length
      ? props.social
      : [
          { label: 'Instagram' },
          { label: 'LinkedIn' },
          { label: 'YouTube' },
          { label: 'X' },
        ]
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy', 'Accessibility', 'Title IX', 'Nondiscrimination']
    const note = props.note ?? 'All rights reserved.'

    return (
      <SiteFooter className={cn('relative overflow-hidden', props.className)}>
        <Watermark className="-left-2 bottom-[-3rem] font-serif text-[10rem] leading-none text-foreground/[0.04] sm:text-[15rem]">
          {brand}
        </Watermark>
        <FooterContent className="relative">
          <FooterGrid>
            <FooterBrand
              brand={brand}
              brandMark={<UniversityBrandSeal />}
              brandClassName={'font-serif tracking-tight'}
            >
              <FooterTagline className="mt-3 font-serif text-sm italic">
                {tagline}
              </FooterTagline>
              <FooterSocial>
                {social.map((s) => (
                  <FooterSocialLink
                    key={s.label}
                    className="font-mono text-[11px] uppercase tracking-[0.14em]"
                  >
                    {s.label}
                  </FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4">
                  {col.links.map((link) => (
                    <FooterLink key={link} className="block w-fit">
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.14em]">
              {note}
            </FooterCopyright>
            <FooterLegal>
              {legal.map((l) => (
                <FooterLink
                  key={l}
                  className="block w-fit font-mono text-[11px] uppercase tracking-[0.14em]"
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
