import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

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
    'Editorial-wanderlust inverted site footer for the Travel Agency page family. Composes the shared SiteFooter kit composite on a foreground surface with a giant ghost brand watermark: a brand column (compass brandmark + wordmark, tagline, mono social links), four mono-titled link columns (Destinations, Services, Company, Support) whose links sit as block-width rows, and a hairline bottom row with a closing note and mono legal links. Use as the final band of a curated travel-agency page. All content is prop-driven with wanderlust-themed defaults so it renders with no props.',
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
    const brand = props.brand ?? 'Voyage & Co'
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
      <SiteFooter
        className={cn(
          'relative overflow-hidden border-t-0 bg-foreground text-background',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-[0.16em] -left-[0.03em] select-none whitespace-nowrap text-[24vw] font-extrabold leading-none tracking-tighter text-background/[0.04]"
        >
          {brand.split(' ')[0]}
        </span>
        <FooterContent className="relative">
          <FooterGrid>
            <FooterBrand
              brand={brand}
              brandMark={<CompassMark className="size-7 text-background" />}
              brandClassName="text-lg font-semibold tracking-tight text-background"
            >
              <FooterTagline className="text-background/60">
                {props.tagline ??
                  "Crafting unforgettable journeys to the world's most breathtaking places."}
              </FooterTagline>
              <FooterSocial>
                {social.map((s) => (
                  <FooterSocialLink
                    key={s.label}
                    className="font-mono text-[11px] uppercase tracking-[0.14em] text-background/60 hover:text-background"
                  >
                    {s.label}
                  </FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-background/50">
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList>
                  {col.links.map((link) => (
                    <li key={link}>
                      <FooterLink className="block w-fit text-background/60 hover:text-background">
                        {link}
                      </FooterLink>
                    </li>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="border-background/15">
            <FooterCopyright className="text-background/50">
              {props.note ??
                'Voyage & Co is a registered travel agency. Fares and availability subject to change.'}
            </FooterCopyright>
            <FooterLegal>
              {legal.map((l) => (
                <FooterLink
                  key={l}
                  className="block w-fit font-mono text-[11px] uppercase tracking-[0.12em] text-background/50 hover:text-background"
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
