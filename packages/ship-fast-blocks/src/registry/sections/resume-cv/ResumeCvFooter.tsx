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
 * ResumeCvFooter — a clean, multi-column closing footer for a personal resume /
 * CV / portfolio site. Thin configuration over the shared `SiteFooter`
 * composite: an initials monogram in a token circle beside the person's name, a
 * short tagline, a social row (LinkedIn, GitHub, Email), and a responsive grid
 * of link columns (Navigate, Connect). The bottom bar carries an auto-updating
 * copyright line and a short note. Use as the site-wide footer for personal
 * portfolios, online résumés, designer/developer profiles, or any individual's
 * professional landing page. Renders fully with no props via baked-in
 * "Jordan Avery" defaults.
 */
export const ResumeCvFooter = defineCapsule({
  name: 'ResumeCvFooter',
  description:
    "Clean, multi-column closing footer for a personal resume / CV / portfolio site: a brand block (initials monogram + person's name + tagline + social row of LinkedIn / GitHub / Email) and a responsive grid of link columns (Navigate, Connect), with a bordered-top bottom bar holding an auto-updating copyright line and a short note. Every brand, social, and column link routes through section-kit route links. Use as the site-wide footer for personal portfolios, online résumés, designer or developer profiles, or any individual's professional landing page.",
  props: z.object({
    /** Person / brand name shown as the wordmark. */
    brand: z.string().optional(),
    /** Initials shown inside the monogram circle. */
    initials: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Navigate, Connect, …), each a title + labels. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Legal links rendered in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const initials = props.initials ?? 'JA'
    const social = props.social?.length
      ? props.social
      : [{ label: 'LinkedIn' }, { label: 'GitHub' }, { label: 'Email' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Navigate',
            links: ['About', 'Experience', 'Skills', 'Projects'],
          },
          {
            title: 'Connect',
            links: ['LinkedIn', 'GitHub', 'Twitter', 'Contact'],
          },
        ]
    const legal = props.legal?.length ? props.legal : ['Privacy', 'Imprint']

    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand
              brand={props.brand ?? 'Jordan Avery'}
              brandMark={
                <span
                  aria-hidden="true"
                  className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
                >
                  {initials}
                </span>
              }
              brandClassName={'text-lg font-semibold tracking-tight'}
            >
              <FooterTagline>
                {props.tagline ??
                  'Senior product designer crafting calm, useful interfaces.'}
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
