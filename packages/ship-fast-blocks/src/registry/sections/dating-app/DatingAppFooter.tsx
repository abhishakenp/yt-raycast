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
 * DatingAppFooter — playful-geometric site footer for a dating / matchmaking
 * app. A 2px-foreground-ruled band on the plain background: an asymmetric
 * 5/2/2/3-ish column grid where the wide brand column carries the app wordmark,
 * a tagline, and rounded-full 2px-bordered social pill chips with press
 * feedback, followed by link columns (Product / Company / Support) whose
 * titles wear mono micro-label styling and whose links sit on their own lines;
 * the hairline-ruled bottom row pairs a mono copyright note with mono legal
 * links. The brand button and every link route through section-kit route
 * links. Use as the closing footer for dating apps, singles platforms, or
 * social-connection products. Renders fully with no props via baked-in
 * "HeartLink" defaults.
 */
export const DatingAppFooter = defineCapsule({
  name: 'DatingAppFooter',
  description:
    'Playful-geometric site footer for a dating / matchmaking app: a 2px-foreground-ruled band with an asymmetric column grid — a wide brand column (app wordmark, tagline, rounded-full 2px-bordered social pill chips with press feedback) followed by link columns (Product / Company / Support) with mono micro-label titles and per-line links; a hairline-ruled bottom row pairs a mono copyright note with mono legal links. The brand button and every link route through section-kit route links. Use as the closing footer for dating apps, singles platforms, or social-connection products.',
  props: z.object({
    /** Brand / app name shown beside the heart logo. */
    brand: z.string().optional(),
    tagline: z.string().optional(),
    /** Footer link columns. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Social icon labels (rendered in Twitter/Instagram/LinkedIn glyph order). */
    socials: z.array(z.string()).optional(),
    /** Copyright line shown bottom-left. */
    note: z.string().optional(),
    /** Legal / utility link labels bottom-right. */
    legal: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'HeartLink'
    const footerTagline =
      props.tagline ??
      'Helping millions find meaningful connections through genuine compatibility matching.'
    const footerColumns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: ['Features', 'Premium', 'Safety', 'Success Stories'],
          },
          {
            title: 'Company',
            links: ['About Us', 'Careers', 'Press', 'Blog'],
          },
          {
            title: 'Support',
            links: [
              'Help Center',
              'Contact Us',
              'Community Guidelines',
              'Terms of Service',
            ],
          },
        ]
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'Instagram', 'LinkedIn']
    const footerNote = props.note ?? `© 2024 ${brand} Inc. All rights reserved.`
    const footerLegal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Policy']
    return (
      <SiteFooter
        className={`border-t-2 border-foreground bg-background ${props.className ?? ''}`}
      >
        <FooterContent className="py-14">
          <FooterGrid className="gap-10 md:grid-cols-12">
            <FooterBrand
              brand={brand}
              className="md:col-span-5"
              brandClassName="text-lg font-extrabold tracking-tight"
            >
              <FooterTagline className="mt-4 max-w-xs leading-relaxed">
                {footerTagline}
              </FooterTagline>
              <FooterSocial className="mt-5">
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      className="inline-flex items-center rounded-full border-2 border-foreground bg-background px-3.5 py-1 text-xs font-semibold text-foreground transition-[transform,background-color] duration-150 hover:bg-muted active:translate-y-px motion-reduce:transform-none"
                    >
                      {s.label}
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            {footerColumns.map((col, i) => (
              <FooterColumn
                key={col.title}
                className={
                  i === footerColumns.length - 1
                    ? 'md:col-span-3'
                    : 'md:col-span-2'
                }
              >
                <FooterColumnTitle className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <FooterLink
                      key={link}
                      className="block w-fit text-sm font-medium transition-colors hover:text-foreground"
                    >
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="mt-12 border-border pt-6">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground/70">
              {footerNote}
            </FooterCopyright>
            <FooterLegal className="gap-5">
              {footerLegal.map((l) => (
                <FooterLink
                  key={l}
                  className="block w-fit font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground/70 transition-colors hover:text-foreground"
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
