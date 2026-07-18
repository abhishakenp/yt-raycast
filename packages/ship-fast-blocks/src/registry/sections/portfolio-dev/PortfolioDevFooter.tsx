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

function CodeMark({ className }: { className?: string }) {
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
      <path d="m8 8-4 4 4 4" />
      <path d="m16 8 4 4-4 4" />
    </svg>
  )
}

export const PortfolioDevFooter = defineCapsule({
  name: 'PortfolioDevFooter',
  description:
    "Rich, multi-column closing footer for a developer portfolio built on the shared SiteFooter composite: a brand block pairs a mono wordmark with an inline </> code mark, a tagline, and a social row (GitHub, LinkedIn, Twitter, Email), beside a responsive grid of Work and Connect link columns. A bordered-top bottom bar carries an auto-updating copyright line and a closing note. Use as the site-wide footer for developer, engineer, freelancer, or indie-hacker portfolios; renders fully with no props via baked-in 'alex.dev' defaults.",
  props: z.object({
    /** Developer / brand handle shown as the mono wordmark. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Work, Connect, …), each a title + labels. */
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
          { label: 'GitHub' },
          { label: 'LinkedIn' },
          { label: 'Twitter' },
          { label: 'Email' },
        ]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Work',
            links: ['Projects', 'Open Source', 'Case Studies', 'Resume'],
          },
          {
            title: 'Connect',
            links: ['GitHub', 'LinkedIn', 'Twitter', 'Contact'],
          },
        ]

    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand
              brand={props.brand ?? 'alex.dev'}
              brandMark={<CodeMark className="size-8 text-primary" />}
              brandClassName={'font-mono text-lg font-semibold'}
            >
              <FooterTagline>
                {props.tagline ??
                  'Full-stack developer building fast, accessible web apps.'}
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
              {props.note ?? 'Built with care.'}
            </FooterCopyright>
            <FooterLegal>
              {['Privacy', 'Terms'].map((l) => (
                <FooterLink key={l}>{l}</FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
