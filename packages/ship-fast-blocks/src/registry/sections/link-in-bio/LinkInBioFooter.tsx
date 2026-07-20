import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
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
 * LinkInBioFooter — a bold, mobile-first closing footer for a "link in bio" /
 * single-page link hub (Linktree / Bento style personal landing) in the "chunky
 * rounded stack" language. Thin configuration over the shared `SiteFooter`
 * composite: a hard 2px top-ruled bar with an extrabold creator wordmark beside
 * an inline spark mark, a short tagline, a row of rounded-full sticker social
 * chips, and a couple of compact mono-titled link columns (Links, More) — each
 * link a block w-fit tap target — folded into the responsive grid, plus a
 * bordered-top bottom bar with an auto-updating copyright line and legal links.
 * Use to close a creator/influencer link hub, freelancer bio link, or personal
 * landing page. Renders fully with no props via baked-in "Sarah Chen" defaults.
 */
function SparkMark({ className }: { className?: string }) {
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
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
      <path d="M12 8a4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4-4Z" />
    </svg>
  )
}

export const LinkInBioFooter = defineCapsule({
  name: 'LinkInBioFooter',
  description:
    'Bold, mobile-first closing footer for a LINK-IN-BIO / single-page link hub (Linktree / Bento style personal landing) in a chunky-rounded language: a hard 2px top-ruled bar with an extrabold creator wordmark beside an inline spark mark, a short tagline, a row of rounded-full sticker social chips (Twitter, Instagram, GitHub, LinkedIn), and a couple of compact mono-titled link columns (Links, More) — each link a block w-fit tap target — in a responsive grid; a bordered-top bottom bar holds an auto-updating copyright line plus legal links. Every brand, social, and column link routes through section-kit route links. Use to close a creator/influencer link hub, freelancer bio link, or personal landing page.',
  props: z.object({
    /** Creator / person name shown as the wordmark. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Compact link columns (Links, More, …), each a title + labels. */
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
          { label: 'Twitter' },
          { label: 'Instagram' },
          { label: 'GitHub' },
          { label: 'LinkedIn' },
        ]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Links',
            links: ['Portfolio', 'Newsletter', 'Shop', 'Book a Call'],
          },
          {
            title: 'More',
            links: ['About', 'Contact'],
          },
        ]

    return (
      <SiteFooter
        className={cn('border-t-2 border-foreground', props.className)}
      >
        <FooterContent>
          <FooterGrid>
            <FooterBrand
              brand={props.brand ?? 'Sarah Chen'}
              brandMark={<SparkMark className="size-7 text-primary" />}
              brandClassName={'text-xl font-extrabold tracking-tight'}
            >
              <FooterTagline>
                {props.tagline ?? 'Design engineer. All my links in one place.'}
              </FooterTagline>
              <FooterSocial>
                {social.map((s) => (
                  <FooterSocialLink
                    key={s.label}
                    href={s.href}
                    className="rounded-full border-2 border-foreground bg-background px-3 py-1 text-sm font-semibold text-foreground shadow-[2px_2px_0_0] shadow-foreground/25 transition-all hover:-translate-y-0.5 hover:text-foreground hover:shadow-[3px_3px_0_0] hover:shadow-foreground/25 active:translate-y-px active:shadow-none"
                  >
                    {s.label}
                  </FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList>
                  {col.links.map((link) => (
                    <FooterLink
                      key={link}
                      className="block w-fit font-medium transition-colors active:translate-y-px"
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
              {props.note ?? 'All rights reserved.'}
            </FooterCopyright>
            <FooterLegal>
              {['Privacy', 'Terms'].map((l) => (
                <FooterLink
                  key={l}
                  className="block w-fit transition-colors active:translate-y-px"
                >
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
