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
 * DocsFooter — a clean, multi-column closing footer for a developer platform or
 * documentation site. Thin configuration over the shared `SiteFooter` composite:
 * a stacked-cube wordmark beside the "StackForge" brand, a product tagline, a
 * social row (GitHub / Discord / Twitter), and a responsive grid of link columns
 * (Docs, Resources, Community, Company). A bordered-top bottom bar carries an
 * auto-updating copyright line plus Privacy / Terms / Security legal links. Use
 * as the site-wide footer for developer docs, API platforms, SDKs, CLIs, or any
 * technical product landing page. Renders fully with no props via baked-in
 * StackForge defaults. Theme-tokened throughout; no hardcoded colors.
 */
function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2 3 7l9 5 9-5-9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </svg>
  )
}

export const DocsFooter = defineCapsule({
  name: 'DocsFooter',
  description:
    'Clean, multi-column closing footer for a developer platform or documentation site: a responsive grid with a brand block (stacked-cube mark + wordmark + product tagline + social row of GitHub/Discord/Twitter) and link columns (Docs, Resources, Community, Company); a bordered-top bottom bar holds an auto-updating copyright line and Privacy/Terms/Security legal links. Every brand, social, column, and legal link routes through useNavigate. Use as the site-wide footer for developer docs, API platforms, SDKs, CLIs, or any technical product landing page.',
  props: z.object({
    /** Product / brand name shown as the wordmark. */
    brand: z.string().optional(),
    /** Short product tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Docs, Resources, Community, Company, …), each a title + labels. */
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
      : [{ label: 'GitHub' }, { label: 'Discord' }, { label: 'Twitter' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Docs',
            links: ['Getting Started', 'API Reference', 'SDKs', 'Changelog'],
          },
          {
            title: 'Resources',
            links: ['Guides', 'Tutorials', 'Examples', 'Status'],
          },
          {
            title: 'Community',
            links: ['GitHub', 'Discord', 'Support', 'Roadmap'],
          },
          {
            title: 'Company',
            links: ['About', 'Blog', 'Careers', 'Contact'],
          },
        ]

    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand
              brand={props.brand ?? 'StackForge'}
              brandMark={<LogoMark className="size-8 text-primary" />}
            >
              <FooterTagline>
                {props.tagline ??
                  'The developer platform for building, shipping, and scaling APIs.'}
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
              {['Privacy', 'Terms', 'Security'].map((l) => (
                <FooterLink key={l}>{l}</FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
