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
 * BlogPostFooter — a rich, multi-column closing footer for an editorial blog
 * post / article detail page. Thin configuration over the shared `SiteFooter`
 * composite: a feather / pen wordmark beside a tagline, a social row, a
 * responsive grid of link columns (Explore, Company, Legal, …), and a
 * bordered-top bottom bar with an auto-updating copyright line. Clean editorial
 * voice. Use as the site-wide footer for a blog, magazine, journal, or any
 * editorial publication. Renders fully with no props via baked-in defaults.
 */
function FeatherMark({ className }: { className?: string }) {
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
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <path d="M16 8 2 22" />
      <path d="M17.5 15H9" />
    </svg>
  )
}

export const BlogPostFooter = defineCapsule({
  name: 'BlogPostFooter',
  description:
    'Rich, multi-column closing footer for an editorial blog post / article detail page built on the shared SiteFooter composite: a feather/pen wordmark beside a tagline, a social row, a responsive grid of link columns (Explore, Company, Legal, …), and a bordered-top bottom bar with an auto-updating copyright line. Clean editorial voice. Use as the site-wide footer for a blog, magazine, journal, or any editorial publication.',
  props: z.object({
    /** Publication / brand name shown as the wordmark. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Link columns (Explore, Company, Legal, …), each a title + labels. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Legal / utility link labels on the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Explore',
            links: ['Latest', 'Topics', 'Archive', 'Authors'],
          },
          {
            title: 'Company',
            links: ['About', 'Newsletter', 'Contact', 'RSS'],
          },
          { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies'] },
        ]
    const social = props.social?.length
      ? props.social
      : [{ label: 'Twitter' }, { label: 'GitHub' }, { label: 'RSS' }]
    const legal = props.legal?.length ? props.legal : ['Privacy', 'Terms']

    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand
              brand={props.brand ?? 'The Editorial'}
              brandMark={<FeatherMark className="size-7 text-primary" />}
              brandClassName={'text-xl font-semibold'}
            >
              <FooterTagline>
                {props.tagline ??
                  'Thoughtful writing on design, code, and the craft of building.'}
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
