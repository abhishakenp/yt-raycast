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
 * WineryBreweryFooter — a rich, artisan-editorial closing footer for a winery
 * or brewery site. Thin configuration over the shared `SiteFooter` composite: a
 * warm serif wordmark beside an inline grape-cluster mark, a tagline, a mono
 * social row, and a responsive grid of link columns with mono label-stamp
 * titles. Visit (address, phone, email), Hours (day/time ledger rows), Explore,
 * and Contact are folded into columns whose links each render as a
 * block-level, width-fit tap target, and the hairline-bordered bottom bar
 * carries an auto-updating mono copyright line. Every brand, social, contact,
 * and column link routes through section-kit route links. Use as the site-wide
 * footer for wineries, vineyards, cellar doors, breweries, taprooms, or
 * cideries. Renders fully with no props via baked-in defaults.
 */
function GrapeClusterMark({ className }: { className?: string }) {
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
      <path d="M12 4c1.2 0 2-1 2-2" />
      <path d="M12 7v0" />
      <circle cx="12" cy="9" r="2.1" />
      <circle cx="8.4" cy="12" r="2.1" />
      <circle cx="15.6" cy="12" r="2.1" />
      <circle cx="10.2" cy="15.4" r="2.1" />
      <circle cx="13.8" cy="15.4" r="2.1" />
      <circle cx="12" cy="19" r="2.1" />
    </svg>
  )
}

export const WineryBreweryFooter = defineCapsule({
  name: 'WineryBreweryFooter',
  description:
    'Rich, artisan-editorial closing footer for a winery or brewery site: a responsive grid with a brand block (warm serif wordmark + grape-cluster mark + tagline + mono social row), a Visit column with address plus tappable phone and email, an Hours column of day/time ledger rows, and extra link columns (Explore, Contact, …) with mono label-stamp titles and block-level width-fit links; a hairline-bordered bottom bar holds an auto-updating mono copyright line. Every brand, social, contact, and column link routes through section-kit route links. Use as the site-wide footer for wineries, vineyards, cellar doors, breweries, taprooms, or cideries.',
  props: z.object({
    /** Winery / brewery brand name shown as the serif wordmark. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Visit, Hours, Explore, Contact, …), each a title + labels. */
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
      : [{ label: 'Instagram' }, { label: 'Facebook' }, { label: 'Untappd' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Visit',
            links: [
              '4200 Vineyard Lane, Sonoma Valley, CA 95476',
              '(707) 555-0148',
              'hello@cellarandcask.com',
            ],
          },
          {
            title: 'Hours',
            links: [
              'Thu – Fri · 11am – 6pm',
              'Sat – Sun · 11am – 7pm',
              'Mon – Wed · By appointment',
              'Harvest weeks · Extended hours',
            ],
          },
          {
            title: 'Explore',
            links: ['Wines', 'Tastings', 'Tours', 'Wine Club'],
          },
          {
            title: 'Contact',
            links: ['Plan a Visit', 'Private Events', 'Press', 'Our Story'],
          },
        ]

    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand
              brand={props.brand ?? 'Cellar & Cask'}
              brandMark={<GrapeClusterMark className="size-7 text-primary" />}
              brandClassName={'font-serif text-xl font-medium'}
            >
              <FooterTagline className="max-w-xs font-serif italic">
                {props.tagline ??
                  'Estate-grown wine and barrel-aged ale from one sun-soaked hillside.'}
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
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.14em]">
              {props.note ?? 'All rights reserved.'}
            </FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
