import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Watermark } from '#/section-kit/Decor.tsx'
/**
 * CleaningServiceFooter — playful-Swiss multi-column footer for a
 * home-cleaning / maid-service landing page. A 2px top-ruled background band
 * with a giant ghost brand-name watermark bleeding off the bottom edge and an
 * asymmetric grid: brand + tagline + square mono social chips on the left
 * (wider column on desktop), followed by link-column groups (Services,
 * Company, Support) whose titles are mono uppercase micro-labels and whose
 * links get press feedback. A hairline bottom bar carries the copyright plus
 * optional mono location / phone / email metadata — all routable through
 * section-kit route links. Use as the closing site footer for residential
 * cleaning companies, maid services, housekeeping platforms, janitorial
 * businesses, or any local home-service brand. Renders fully with no props via
 * baked-in "PureSpace" defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  SiteFooter,
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
export const CleaningServiceFooter = defineCapsule({
  name: 'CleaningServiceFooter',
  description:
    'Playful-Swiss multi-column footer for a home-cleaning / maid-service landing page: 2px top-ruled background band with a giant ghost brand-name watermark bleeding off the bottom edge and an asymmetric grid — brand + tagline + square mono social chips on a wider left column, then link-column groups (Services, Company, Support) with mono uppercase micro-label titles and press-feedback links. Hairline bottom bar carries copyright plus optional mono location / phone / email metadata — all routable through section-kit route links. Use as the closing site footer for residential cleaning, maid services, housekeeping, janitorial, or local home-service brands.',
  props: z.object({
    /** Brand / company name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Tagline paragraph under the brand name. */
    tagline: z.string().optional(),
    /** Footer column groups: title + array of link labels. */
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Copyright line; brand + current year are auto-inserted. */
    copyright: z.string().optional(),
    /** Location string shown in the bottom bar. */
    location: z.string().optional(),
    /** Phone number shown and routed in the bottom bar. */
    phone: z.string().optional(),
    /** Email address shown and routed in the bottom bar. */
    email: z.string().optional(),
    /** Social platform labels shown as first-character icon buttons. */
    socials: z.array(z.string()).optional(),
    /** Navigation target for the brand logo click. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'PureSpace'
    const tagline =
      props.tagline ??
      'Professional home cleaning services in Seattle. Making homes sparkle since 2018.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Services',
            links: [
              'Standard Cleaning',
              'Deep Cleaning',
              'Move In/Out',
              'Post-Construction',
              'Eco-Friendly',
            ],
          },
          {
            title: 'Company',
            links: ['About Us', 'Careers', 'Press', 'Blog', 'Gift Cards'],
          },
          {
            title: 'Support',
            links: [
              'Help Center',
              'Contact Us',
              'Become a Cleaner',
              'Privacy Policy',
              'Terms of Service',
            ],
          },
        ]
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Cleaning Services. All rights reserved.`
    const socials = props.socials?.length
      ? props.socials
      : ['Facebook', 'Twitter', 'Instagram']
    return (
      <SiteFooter
        className={cn(
          'relative overflow-hidden border-t-2 border-foreground bg-background',
          props.className,
        )}
      >
        <Watermark className="-bottom-8 right-0 text-[5.5rem] text-foreground/[0.04] sm:text-[9rem] lg:text-[12rem]">
          {brand}
        </Watermark>
        <Container className="relative py-14">
          <FooterGrid className="gap-10 md:grid-cols-4 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
            <FooterBrand brand={brand}>
              <FooterTagline className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {tagline}
              </FooterTagline>
              <FooterSocial className="mt-5 gap-2">
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      className="rounded-none border border-border font-mono text-[10px] uppercase tracking-[0.1em] transition-colors hover:border-foreground hover:text-foreground active:translate-y-px"
                    >
                      {s.label}
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <span aria-hidden="true" className="size-1.5 bg-primary" />
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <FooterLink
                      key={link}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground active:translate-y-px"
                    >
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="flex flex-col items-start justify-between gap-3 border-t border-border sm:flex-row sm:items-center">
            <FooterCopyright className="font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
              {copyright}
            </FooterCopyright>
            {(props.location || props.phone || props.email) && (
              <span className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[11px] tabular-nums tracking-[0.04em] text-muted-foreground">
                {props.location && <span>{props.location}</span>}
                {props.phone && (
                  <a
                    href={`tel:${props.phone.replace(/[^\d+]/g, '')}`}
                    className="transition-colors hover:text-foreground active:translate-y-px"
                  >
                    {props.phone}
                  </a>
                )}
                {props.email && (
                  <a
                    href={`mailto:${props.email}`}
                    className="transition-colors hover:text-foreground active:translate-y-px"
                  >
                    {props.email}
                  </a>
                )}
              </span>
            )}
          </FooterBottom>
        </Container>
      </SiteFooter>
    )
  },
})
