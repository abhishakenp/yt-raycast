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

function CompassMark({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </svg>
  )
}

export const TravelAgencyFooter = defineCapsule({
  name: 'TravelAgencyFooter',
  description:
    'Premium site footer for the Travel Agency page family. Composes the shared SiteFooter kit composite with a travel-forward brand, compass brandmark, tagline, social links, four link columns (Destinations, Services, Company, Support), legal links, and a closing note. Use as the final band of a travel agency page. All content is prop-driven with wanderlust-themed defaults so it renders with no props.',
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
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Destinations',
            links: ['Europe', 'Asia', 'Africa', 'The Americas', 'Islands'],
          },
          {
            title: 'Services',
            links: [
              'Flights',
              'Hotels',
              'Packages',
              'Cruises',
              'Travel insurance',
            ],
          },
          {
            title: 'Company',
            links: ['About us', 'Our advisors', 'Careers', 'Press'],
          },
          {
            title: 'Support',
            links: ['Help center', 'Contact', 'Manage booking', 'FAQ'],
          },
        ]
    const social = props.social?.length
      ? props.social
      : [
          { label: 'Instagram' },
          { label: 'Facebook' },
          { label: 'Pinterest' },
          { label: 'YouTube' },
        ]
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy', 'Terms', 'Cookies', 'Accessibility']
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand
              brand={props.brand ?? 'Voyage & Co'}
              brandMark={<CompassMark className="size-8 text-primary" />}
            >
              <FooterTagline>
                {props.tagline ??
                  "Crafting unforgettable journeys to the world's most breathtaking places."}
              </FooterTagline>
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
            <FooterCopyright>
              {props.note ??
                'Voyage & Co is a registered travel agency. Fares and availability subject to change.'}
            </FooterCopyright>
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
