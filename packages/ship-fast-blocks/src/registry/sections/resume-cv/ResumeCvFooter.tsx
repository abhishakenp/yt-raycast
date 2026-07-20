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
 * ResumeCvFooter — document-colophon footer for a personal resume / CV /
 * portfolio site. A hard top rule over a giant faint ghost-initials watermark:
 * a brand block (square hard-edged monogram stamp + extrabold name + tagline +
 * social row of LinkedIn / GitHub / Email) beside a responsive grid of link
 * columns (Navigate, Connect) with mono uppercase column titles and left-aligned
 * `block w-fit` links, then a hairline-bordered bottom bar with a mono
 * auto-updating copyright line and short note. Binary radius, tokens only. Every
 * brand, social, and column link routes through section-kit route links. Use as
 * the site-wide footer for personal portfolios, online résumés, designer/
 * developer profiles, or any individual's professional landing page. Renders
 * fully with no props via baked-in "Jordan Avery" defaults.
 */
export const ResumeCvFooter = defineCapsule({
  name: 'ResumeCvFooter',
  description:
    "Document-colophon footer for a personal resume / CV / portfolio site: a hard top rule over a giant faint ghost-initials watermark, with a brand block (square hard-edged monogram stamp + extrabold name + tagline + social row of LinkedIn / GitHub / Email) beside a responsive grid of link columns (Navigate, Connect) with mono uppercase column titles and left-aligned block w-fit links, then a hairline-bordered bottom bar holding a mono auto-updating copyright line and short note. Binary radius, tokens only. Every brand, social, and column link routes through section-kit route links. Use as the site-wide footer for personal portfolios, online résumés, designer or developer profiles, or any individual's professional landing page.",
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
      <SiteFooter
        className={[
          'relative overflow-hidden border-t-2 border-foreground bg-background',
          props.className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Giant faint ghost-initials watermark. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-12 right-2 select-none font-extrabold leading-none tracking-tighter text-foreground/[0.04] text-[9rem] sm:text-[13rem]"
        >
          {initials}
        </span>

        <FooterContent className="relative">
          <FooterGrid>
            <FooterBrand
              brand={props.brand ?? 'Jordan Avery'}
              brandMark={
                <span
                  aria-hidden="true"
                  className="inline-flex size-9 items-center justify-center rounded-none border border-foreground bg-foreground font-mono text-xs font-bold tracking-tight text-background"
                >
                  {initials}
                </span>
              }
              brandClassName={'text-lg font-extrabold tracking-tight'}
            >
              <FooterTagline>
                {props.tagline ??
                  'Senior product designer crafting calm, useful interfaces.'}
              </FooterTagline>
              <FooterSocial>
                {social.map((s) => (
                  <FooterSocialLink
                    key={s.label}
                    className="block w-fit font-mono text-[11px] uppercase tracking-[0.14em]"
                  >
                    {s.label}
                  </FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
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
