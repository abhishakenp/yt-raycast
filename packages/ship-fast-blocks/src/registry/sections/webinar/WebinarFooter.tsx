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
 * WebinarFooter — kinetic-event multi-column closing footer for a webinar or
 * virtual event site. Thin configuration over the shared `SiteFooter` composite:
 * a brand block (square broadcast mark + extrabold wordmark + tagline + a row of
 * square-edged social chips) beside mono-titled link columns (Event, Resources,
 * Company), with a hairline-topped bottom bar carrying a mono auto-updating
 * copyright line and legal links. Every link sits as a block w-fit hit target and
 * routes through the kit's section-kit route links. Use as the site-wide footer
 * for webinars, summits, masterclasses, or any registration-driven event page.
 * Renders fully with no props.
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
    'Kinetic-event multi-column closing footer for a webinar or virtual-event site built on the shared SiteFooter composite: a brand block (square broadcast mark + extrabold wordmark + tagline + a row of square-edged LinkedIn/Twitter/YouTube social chips) beside mono-titled link columns (Event, Resources, Company), with a hairline-topped bottom bar holding a mono auto-updating copyright line and legal links. Every link is a block w-fit hit target routed through section-kit route links. Use as the site-wide footer for webinars, summits, masterclasses, or any registration-driven event page.',
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
              brandMark={<BroadcastMark className="size-7 text-primary" />}
              brandClassName={'text-lg font-extrabold tracking-tight'}
            >
              <FooterTagline>
                {props.tagline ??
                  'Live, practical sessions for SaaS operators who want to grow faster.'}
              </FooterTagline>
              <FooterSocial>
                {social.map((s) => (
                  <FooterSocialLink
                    key={s.label}
                    className="rounded-none border border-border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                  >
                    {s.label}
                  </FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="font-mono text-[11px] uppercase tracking-[0.18em]">
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
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.12em]">
              {props.note ?? 'All rights reserved.'}
            </FooterCopyright>
            <FooterLegal>
              {legal.map((l) => (
                <FooterLink key={l} className="block w-fit">
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
