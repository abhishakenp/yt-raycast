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
 * CoworkingFooter — flat editorial LEDGER footer for a coworking or shared-
 * workspace site. A brand/summary row sits on top (a solid square brand mark,
 * wordmark, and tagline beside a row of square hairline social links), then a
 * `border-t border-border` seam opens onto clean link columns headed by mono
 * micro-labels. The bottom bar is a second hairline seam carrying the
 * auto-updating copyright and a square back-to-top control. No watermark,
 * gradients, pills, or glow — one primary accent (the brand mark). Every
 * brand, social, and column link routes through section-kit route links.
 * Renders fully with no props via baked-in "Northside" defaults. Use as the
 * site-wide footer for coworking spaces, shared offices, flex-office
 * providers, or business centers.
 */
function BrandTile({ letter }: { letter: string }) {
  return (
    <span
      className="grid size-9 place-items-center rounded-none bg-primary text-base font-semibold text-primary-foreground"
      aria-hidden="true"
    >
      {letter}
    </span>
  )
}

export const CoworkingFooter = defineCapsule({
  name: 'CoworkingFooter',
  description:
    'Deep, quiet closing footer for a coworking or shared-workspace site: a giant watermark wordmark behind the content under a primary-tinted seam hairline, a gradient brand tile with wordmark + tagline + social pills that lift on hover, link columns with uppercase tracked titles and slide-on-hover links, and a bottom bar with auto-updating copyright and a back-to-top pill. Every brand, social, and column link routes through section-kit route links. Use as the site-wide footer for coworking spaces, shared offices, flex-office providers, or business centers.',
  props: z.object({
    /** Brand / workspace name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Spaces, Company, Resources, Contact, …). */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand =
      typeof props.brand === 'string' && props.brand ? props.brand : 'Northside'
    const tagline =
      typeof props.tagline === 'string' && props.tagline
        ? props.tagline
        : 'A bright, modern workspace where independent professionals and growing teams do their best work.'
    const note =
      typeof props.note === 'string' && props.note
        ? props.note
        : 'All rights reserved.'
    const social = (
      props.social?.length
        ? props.social.filter(
            (item) => typeof item?.label === 'string' && item.label,
          )
        : [{ label: 'Instagram' }, { label: 'LinkedIn' }, { label: 'X' }]
    ) as Array<{ label: string; href?: string }>
    const columns = (
      props.columns?.length
        ? props.columns.filter(
            (column) => typeof column?.title === 'string' && column.title,
          )
        : [
            {
              title: 'Spaces',
              links: [
                'Hot Desks',
                'Dedicated Desks',
                'Private Offices',
                'Meeting Rooms',
              ],
            },
            {
              title: 'Company',
              links: ['About', 'Careers', 'Community', 'Events'],
            },
            {
              title: 'Resources',
              links: ['Pricing', 'Amenities', 'Member Perks', 'FAQ'],
            },
            {
              title: 'Contact',
              links: [
                '123 Pearl Street, Portland, OR 97209',
                '(503) 555-0145',
                'hello@northside.work',
              ],
            },
          ]
    ) as Array<{ title: string; links: string[] }>
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          {/* Brand / summary row on top. */}
          <div className="flex flex-col gap-8 pb-10 sm:flex-row sm:items-start sm:justify-between">
            <FooterBrand
              brand={brand}
              brandMark={<BrandTile letter={brand[0] ?? 'C'} />}
            >
              <FooterTagline className="mt-4 max-w-sm leading-relaxed">
                {tagline}
              </FooterTagline>
            </FooterBrand>
            <FooterSocial className="mt-0 gap-2">
              {social.map((s) => (
                <FooterSocialLink
                  key={s.label}
                  className="rounded-none border border-border bg-background px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] hover:bg-muted hover:text-foreground active:translate-y-px"
                >
                  {s.label}
                </FooterSocialLink>
              ))}
            </FooterSocial>
          </div>

          {/* Link columns ledger, opened by a hairline seam. */}
          <FooterGrid className="border-t border-border pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="font-mono text-[10px] font-normal uppercase tracking-[0.16em] text-muted-foreground">
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <FooterLink
                      key={link}
                      className="block w-fit hover:text-foreground"
                    >
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>

          <FooterBottom>
            <FooterCopyright>
              &copy; {new Date().getFullYear()} {brand}. {note}
            </FooterCopyright>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }}
              className="inline-flex w-fit items-center gap-2 rounded-none border border-border bg-background px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:bg-muted hover:text-foreground active:translate-y-px"
            >
              Back to top
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5"
                aria-hidden="true"
              >
                <path d="M12 19V5m0 0l-6 6m6-6l6 6" />
              </svg>
            </button>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
