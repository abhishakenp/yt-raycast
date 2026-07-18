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
 * PlumbingHvacFooter — a multi-column site footer for a plumbing & HVAC trade
 * site. Thin configuration over the shared `SiteFooter` composite: a pipe/
 * droplet brand mark + wordmark, a tagline, a social row, and a responsive grid
 * of link columns (Services / Service Area / Company / Contact with address,
 * phone, and email); below, a bordered-top bottom bar with an auto-updating
 * copyright line and optional legal links. The brand, every column link, and
 * each social link route through useNavigate. Use as the closing footer for
 * plumber, HVAC, or other home-service sites. Renders fully with no props via
 * baked-in "Pipeworks Plumbing & HVAC" defaults.
 */
const PipeMark = () => (
  <span
    className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm"
    aria-hidden="true"
  >
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5S12 5 12 2C12 5 9 7 7 9.5S5 13 5 15a7 7 0 0 0 7 7Z" />
    </svg>
  </span>
)

export const PlumbingHvacFooter = defineCapsule({
  name: 'PlumbingHvacFooter',
  description:
    'Multi-column site footer for a plumbing & HVAC trade site built on the shared SiteFooter composite: a pipe/droplet brand mark + wordmark, a tagline, a social row, and a responsive grid of link columns (Services / Service Area / Company / Contact with address, phone, and email); below, a bordered-top bottom bar with an auto-updating copyright line and optional legal links. The brand, every column link, and each social link route through useNavigate. Use as the closing footer for plumber, HVAC, or other home-service sites.',
  props: z.object({
    /** Brand / company name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Short tagline under the wordmark. */
    tagline: z.string().optional(),
    /** Link columns: each a title plus a list of link labels. */
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    /** Legal links shown in the bottom bar. */
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Pipeworks Plumbing & HVAC'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Services',
            links: [
              'Repair',
              'Installation',
              'Maintenance',
              'Emergency Service',
            ],
          },
          {
            title: 'Service Area',
            links: [
              'Downtown',
              'North Side',
              'West End',
              'Surrounding Suburbs',
            ],
          },
          {
            title: 'Company',
            links: ['About', 'Reviews', 'Careers', 'Financing'],
          },
          {
            title: 'Contact',
            links: [
              '1420 Industrial Ave, Springfield',
              '(555) 010-7878',
              'hello@pipeworks.example',
            ],
          },
        ]
    const social = props.social?.length
      ? props.social
      : [{ label: 'Facebook' }, { label: 'Instagram' }, { label: 'Google' }]
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy', 'Terms', 'Licensing']

    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand
              brand={brand}
              brandMark={<PipeMark />}
              brandClassName={'text-lg font-bold'}
            >
              <FooterTagline>
                {props.tagline ??
                  'Licensed, insured, and available 24/7 for all your plumbing and HVAC needs. Honest work, fair prices, guaranteed.'}
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
              {props.note ?? 'License #PL-0042189 • All rights reserved.'}
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
