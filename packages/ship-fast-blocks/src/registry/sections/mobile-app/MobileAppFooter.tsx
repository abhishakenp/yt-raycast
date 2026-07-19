import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * MobileAppFooter — a bordered-top, multi-column site footer for a clean,
 * minimalist mobile-app marketing page. A wide brand column (check-in-circle
 * logo mark + app name, a tagline, and a row of round social icon buttons —
 * Twitter / Instagram / LinkedIn) sits beside several link columns (each a
 * heading over a list of nav buttons). A bordered-top bottom bar holds an
 * auto-updating copyright note and a "made in" line. The brand button, social
 * icons and every link route through useNavigate. Use as the closing footer for
 * a habit tracker, fitness / wellness app, productivity or to-do app, or any
 * consumer app landing page. Renders fully with no props via baked-in
 * "DailyFlow" defaults.
 */
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
} from '#/section-kit/SiteFooter.tsx'
export const MobileAppFooter = defineCapsule({
  name: 'MobileAppFooter',
  description:
    "Bordered-top multi-column site footer for a clean, minimalist mobile-app marketing page: a wide brand column (check-in-circle logo mark + app name, a tagline, and a row of round social icon buttons — Twitter / Instagram / LinkedIn) beside several link columns (heading over a list of nav buttons), plus a bordered-top bottom bar with an auto-updating copyright note and a 'made in' line; the brand button, social icons and every link route through useNavigate. Use as the closing footer for a habit tracker, fitness / wellness app, productivity or to-do app, or any consumer app landing page.",
  props: z.object({
    /** Brand / app name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Route the brand/logo returns to (usually the homepage). */
    homeTarget: z.string().optional(),
    tagline: z.string().optional(),
    /** Social icon labels (each must be Twitter, Instagram, or LinkedIn). */
    socials: z.array(z.string()).optional(),
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    note: z.string().optional(),
    madeIn: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'DailyFlow'
    const tagline =
      props.tagline ??
      'Building better habits, one day at a time. Join 50,000+ habit builders worldwide.'
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'Instagram', 'LinkedIn']
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
          },
          {
            title: 'Company',
            links: ['About', 'Blog', 'Careers', 'Press'],
          },
          {
            title: 'Support',
            links: ['Help Center', 'Contact', 'Privacy', 'Terms'],
          },
        ]
    const note =
      props.note ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={cn('text-foreground', className)}
        aria-hidden="true"
      >
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
        <path
          d="M10 16L14 20L22 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand} brandMark={<LogoMark />}>
              <FooterTagline>{tagline}</FooterTagline>
              <FooterSocial>
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
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
            <FooterCopyright>{note}</FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
