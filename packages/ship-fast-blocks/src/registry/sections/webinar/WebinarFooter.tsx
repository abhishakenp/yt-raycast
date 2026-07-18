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
 * WebinarFooter — a rich, multi-column closing footer for a webinar or virtual
 * event site. Thin configuration over the shared `SiteFooter` composite: a
 * semibold wordmark beside an inline broadcast/calendar mark, a tagline, a
 * social row (LinkedIn / Twitter / YouTube), and a responsive grid of link
 * columns (Event, Resources, Company). A bordered-top bottom bar carries an
 * auto-updating copyright line. Use as the site-wide footer for webinars,
 * summits, masterclasses, or any registration-driven event page. Renders fully
 * with no props.
 */
function BroadcastMark({ className }: { className?: string }) {
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
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <circle cx="12" cy="14" r="2" />
    </svg>
  )
}

export const WebinarFooter = defineCapsule({
  name: 'WebinarFooter',
  description:
    'Rich, multi-column closing footer for a webinar or virtual-event site built on the shared SiteFooter composite: a brand block (semibold wordmark + broadcast mark + tagline + social row of LinkedIn/Twitter/YouTube) beside link columns (Event, Resources, Company), with a bordered-top bottom bar holding an auto-updating copyright line and legal links. Use as the site-wide footer for webinars, summits, masterclasses, or any registration-driven event page.',
  props: z.object({
    /** Event host / brand name shown as the wordmark. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Event, Resources, Company, …), each a title + labels. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Legal links shown in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const social = props.social?.length
      ? props.social
      : [{ label: 'LinkedIn' }, { label: 'Twitter' }, { label: 'YouTube' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Event',
            links: ['Overview', 'Agenda', 'Speakers', 'Register'],
          },
          {
            title: 'Resources',
            links: ['Blog', 'Past webinars', 'Guides', 'FAQ'],
          },
          {
            title: 'Company',
            links: ['About', 'Careers', 'Contact', 'Press'],
          },
        ]
    const legal = props.legal?.length ? props.legal : ['Privacy', 'Terms']

    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand
              brand={props.brand ?? 'Catalyst Labs'}
              brandMark={<BroadcastMark className="size-8 text-primary" />}
              brandClassName={'font-semibold tracking-tight'}
            >
              <FooterTagline>
                {props.tagline ??
                  'Live, practical sessions for SaaS operators who want to grow faster.'}
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
              {props.note ?? 'All rights reserved.'}
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
