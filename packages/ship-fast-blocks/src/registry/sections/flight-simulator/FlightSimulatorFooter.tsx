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

/**
 * FlightSimulatorFooter — an instrument-panel closing footer for a flight
 * simulator site. Thin configuration over the shared `SiteFooter` composite: a
 * bold wordmark beside an inline winged-plane mark, an aviation tagline, a
 * social row, and a responsive grid of link columns (Product, Editions,
 * Community, Support) with mono uppercase column headers and left-aligned
 * `block w-fit` links, closed by a mono copyright readout in the bottom bar. Use
 * as the site-wide footer for flight simulators, airliner / combat sims, or
 * aviation titles. Renders fully with no props via baked-in "SkyForge Sim"
 * defaults.
 */
function WingMark({ className }: { className?: string }) {
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
      <path d="M2 12h7l4-7 2 7h7" />
      <path d="M9 12l-3 5" />
      <path d="M22 12l-4 5" />
      <path d="M9 12l4 5" />
    </svg>
  )
}

export const FlightSimulatorFooter = defineCapsule({
  name: 'FlightSimulatorFooter',
  description:
    'Instrument-panel closing footer for a flight-simulator site built on the shared SiteFooter composite: a bold wordmark + inline winged-plane mark, an aviation tagline, a social row, and a responsive grid of link columns (Product, Editions, Community, Support) with mono uppercase column headers and left-aligned block w-fit links, closed by a mono copyright readout in the bottom bar. Every brand, social, and column link routes through section-kit route links. Use as the site-wide footer for flight simulators, airliner / combat sims, or aviation titles.',
  props: z.object({
    /** Product / brand name shown as the wordmark. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Product, Editions, Community, Support, …). */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const social = props.social?.length
      ? props.social
      : [
          { label: 'YouTube' },
          { label: 'Discord' },
          { label: 'X' },
          { label: 'Twitch' },
        ]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: ['Features', 'Aircraft', 'Scenery', 'System Requirements'],
          },
          {
            title: 'Editions',
            links: ['Standard', 'Deluxe', 'Premium', 'Add-on Packs'],
          },
          {
            title: 'Community',
            links: ['Forums', 'Discord', 'Liveries', 'Events'],
          },
          {
            title: 'Support',
            links: ['Help Center', 'Patch Notes', 'Report a Bug', 'Contact'],
          },
        ]

    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand
              brand={props.brand ?? 'SkyForge Sim'}
              brandMark={<WingMark className="size-8 text-primary" />}
              brandClassName={'text-xl font-bold tracking-tight'}
            >
              <FooterTagline>
                {props.tagline ??
                  'The whole world is your runway. Fly anywhere, in any weather, in stunning detail.'}
              </FooterTagline>
              <FooterSocial>
                {social.map((s) => (
                  <FooterSocialLink key={s.label}>{s.label}</FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList>
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
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.15em]">
              {props.note ?? 'All rights reserved.'}
            </FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
