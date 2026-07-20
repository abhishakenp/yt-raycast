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
 * SubscriptionBoxFooter — playful-commerce site footer for a subscription-box
 * brand built on the shared SiteFooter composite. A chunky top-border band holds
 * a ribboned gift-box wordmark, a playful tagline, rotated rounded-full sticker
 * social chips, and link columns (Shop, Company, Support, Legal) under mono
 * uppercase headers with block, left-aligned foreground links, plus a bottom
 * note and legal row. Theme-token only and renders complete with no props. Use
 * as the footer for any curated-box, recurring-delivery, or membership-kit page.
 */
function GiftBoxMark({ className }: { className?: string }) {
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
      <path d="M20 12v9H4v-9" />
      <path d="M2 7h20v5H2z" />
      <path d="M12 22V7" />
      <path d="M12 7C12 7 11 3 8.5 3S5 5 5 5s1.5 2 4 2" />
      <path d="M12 7c0 0 1-4 3.5-4S19 5 19 5s-1.5 2-4 2" />
    </svg>
  )
}

export const SubscriptionBoxFooter = defineCapsule({
  name: 'SubscriptionBoxFooter',
  description:
    'Playful-commerce site footer for a subscription-box brand built on the shared SiteFooter composite: a chunky top-border band with a ribboned gift-box wordmark, a playful tagline, rotated rounded-full sticker social chips, and link columns (Shop, Company, Support, Legal) under mono uppercase headers with block left-aligned foreground links, plus a bottom note and legal row. Use as the footer for any curated-box, recurring-delivery, or membership-kit page.',
  props: z.object({
    brand: z.string().optional(),
    tagline: z.string().optional(),
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    legal: z.array(z.string()).optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'BoxJoy'
    const tagline =
      props.tagline ??
      'A little box of joy, delivered to your door every single month.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Shop',
            links: ['Boxes', 'Pricing', 'Gift a box', 'Past boxes'],
          },
          {
            title: 'Company',
            links: ['About', 'Blog', 'Careers', 'Press'],
          },
          {
            title: 'Support',
            links: ['How it works', 'FAQ', 'Shipping', 'Contact'],
          },
          {
            title: 'Legal',
            links: ['Privacy', 'Terms', 'Cookies'],
          },
        ]
    const social = props.social?.length
      ? props.social
      : [{ label: 'Instagram' }, { label: 'TikTok' }, { label: 'Pinterest' }]
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy', 'Terms', 'Cookies']
    const note = props.note ?? 'Unbox the joy.'

    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand
              brand={brand}
              brandMark={<GiftBoxMark className="size-7 text-primary" />}
              brandClassName="text-lg font-extrabold tracking-tight text-foreground"
            >
              <FooterTagline>{tagline}</FooterTagline>
              <FooterSocial>
                {social.map((s, i) => (
                  <FooterSocialLink
                    key={s.label}
                    className={
                      (i % 2 === 0 ? '-rotate-1 ' : 'rotate-1 ') +
                      'rounded-full border-2 border-foreground bg-background px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-foreground shadow-[2px_2px_0_0] shadow-foreground/20 transition-transform duration-150 hover:-translate-y-0.5'
                    }
                  >
                    {s.label}
                  </FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList>
                  {col.links.map((link) => (
                    <FooterLink
                      key={link}
                      className="block w-fit font-medium text-foreground/80 hover:text-foreground"
                    >
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="border-t-2 border-foreground">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.14em]">
              {note}
            </FooterCopyright>
            <FooterLegal>
              {legal.map((l) => (
                <FooterLink
                  key={l}
                  className="block w-fit text-muted-foreground hover:text-foreground"
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
