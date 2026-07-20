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
} from '#/section-kit/SiteFooter.tsx'

function Mark({ className }: { className?: string }) {
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
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M8.12 8.12 20 20" />
      <path d="M8.12 15.88 20 4" />
      <line x1="14.8" y1="14.8" x2="20" y2="20" />
    </svg>
  )
}

export const SalonBarberFooter = defineCapsule({
  name: 'SalonBarberFooter',
  description:
    "Vintage-lite editorial site footer for a barbershop / salon built on the shared SiteFooter composite. Renders a serif grooming wordmark with a scissors brand mark and a mono tagline, mono social links, and columns of hours, location, services, and quick links under mono uppercase column headings, each link a left-aligned block route link. Use it as the closing footer on any barbershop, salon, or men's grooming site to surface hours, address, and contact details below the fold.",
  props: z.object({
    brand: z.string().optional(),
    tagline: z.string().optional(),
    social: z
      .array(
        z.object({
          label: z.string(),
          href: z.string().optional(),
        }),
      )
      .optional(),
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const social = props.social?.length
      ? props.social
      : [{ label: 'Instagram' }, { label: 'TikTok' }, { label: 'Facebook' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Hours',
            links: [
              'Mon–Fri · 9am–8pm',
              'Saturday · 9am–6pm',
              'Sunday · 11am–5pm',
            ],
          },
          {
            title: 'Visit',
            links: [
              '88 Barber Lane, New York, NY 10012',
              '(212) 555-0147',
              'hello@fadeandco.com',
            ],
          },
          {
            title: 'Services',
            links: ['Haircuts', 'Color', 'Beard & Grooming', 'Styling'],
          },
          {
            title: 'More',
            links: ['Gallery', 'Pricing', 'Team', 'Book Now'],
          },
        ]
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand
              brand={props.brand ?? 'Fade & Co.'}
              brandMark={<Mark className="size-7 text-primary" />}
              brandClassName="font-serif text-xl font-semibold tracking-tight"
            >
              <FooterTagline className="mt-4 max-w-xs font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-muted-foreground">
                {props.tagline ?? 'Modern barbering for the well-groomed.'}
              </FooterTagline>
              <FooterSocial className="mt-5">
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
                <FooterColumnTitle className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">
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
              {props.note ?? 'All rights reserved.'}
            </FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
