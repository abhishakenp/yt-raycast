import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
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
 * AeoFooter — "Answer Terminal" site footer for an Answer-Engine-Optimization
 * (AEO) SaaS built on the shared SiteFooter composite. A mono "EOF" prompt line
 * runs along the top hairline, a giant ghost brand-word watermark sits behind
 * the grid, the rounded-none primary brand block anchors a tagline and mono
 * social row, link columns wear mono uppercase titles, and the bottom bar
 * prefixes the note with a "$" prompt glyph as a terminal easter egg. All links
 * route through section-kit route links. Use as the closing footer on AEO,
 * generative-search visibility, or brand-citation analytics sites. Renders
 * fully with no props.
 */
const BrandMark = () => (
  <span
    className="grid size-7 place-items-center rounded-none bg-primary text-primary-foreground"
    aria-hidden="true"
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Z" />
    </svg>
  </span>
)

export const AeoFooter = defineCapsule({
  name: 'AeoFooter',
  description:
    'Terminal-styled multi-column site footer for an Answer-Engine-Optimization (AEO) product built on the shared SiteFooter composite: a mono "EOF" prompt line on the top hairline, a giant ghost brand-word watermark, a rounded-none primary brand block with tagline and mono social row, link columns with mono uppercase titles (Product, Resources, Company, Legal), and a bottom bar whose note is prefixed by a "$" prompt glyph. All links route through section-kit route links. Use as the closing footer on AEO, generative-search visibility, or brand-citation analytics sites.',
  props: z.object({
    brand: z.string().optional(),
    tagline: z.string().optional(),
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    social: z
      .array(
        z.object({
          label: z.string(),
          href: z.string().optional(),
        }),
      )
      .optional(),
    legal: z.array(z.string()).optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Citeable'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: ['Features', 'How it works', 'Pricing', 'FAQ'],
          },
          {
            title: 'Resources',
            links: ['AEO Guide', 'Blog', 'Benchmarks', 'API Docs'],
          },
          {
            title: 'Company',
            links: ['About', 'Customers', 'Careers', 'Contact'],
          },
          { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'DPA'] },
        ]
    const social = props.social?.length
      ? props.social
      : [{ label: 'X' }, { label: 'LinkedIn' }, { label: 'GitHub' }]
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy', 'Terms', 'Cookies']

    return (
      <SiteFooter
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-8 left-0 select-none whitespace-nowrap font-mono text-[clamp(6rem,18vw,16rem)] font-bold leading-none lowercase tracking-tighter text-foreground/[0.04]"
        >
          {brand}
        </span>
        <div className="relative border-b border-border">
          <p
            aria-hidden="true"
            className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 lg:px-8"
          >
            <span>
              <span className="text-primary">&gt;_</span> end of answer
            </span>
            <span>[ EOF ]</span>
          </p>
        </div>
        <FooterContent className="relative">
          <FooterGrid className="grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-10">
            <FooterBrand
              brand={brand}
              brandMark={<BrandMark />}
              className="col-span-2 md:col-span-1"
            >
              <FooterTagline>
                {props.tagline ??
                  'Get cited by AI answers. Track, optimize, and prove your visibility across every answer engine.'}
              </FooterTagline>
              <FooterSocial>
                {social.map((s, i) => (
                  <FooterSocialLink
                    key={`${s.label}-${i}`}
                    className="font-mono text-xs uppercase tracking-[0.12em] transition-colors duration-150 hover:text-primary"
                  >
                    {s.label}
                  </FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col, colIndex) => (
              <FooterColumn key={`${col.title}-${colIndex}`}>
                <FooterColumnTitle className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4">
                  {col.links.map((link, linkIndex) => (
                    <FooterLink
                      key={`${link}-${linkIndex}`}
                      className="block w-fit transition-colors duration-150 hover:text-primary"
                    >
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright className="font-mono text-xs text-muted-foreground">
              <span aria-hidden="true" className="text-primary">
                ${' '}
              </span>
              {props.note ?? 'Win the AI answer.'}
            </FooterCopyright>
            <FooterLegal>
              {legal.map((l, i) => (
                <FooterLink
                  key={`${l}-${i}`}
                  className="font-mono text-xs uppercase tracking-[0.12em] transition-colors duration-150 hover:text-primary"
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
