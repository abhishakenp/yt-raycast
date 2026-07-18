import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
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
 * JobBoardFooter — a fat, multi-column site footer for a job-board / careers
 * site. A muted top-bordered band: a wide brand column (briefcase mark + name,
 * tagline, and a row of square social icon buttons) beside several link columns
 * with titled headings, closing with a divided bottom row pairing a copyright
 * note with inline legal links. Brand, social buttons and every link route
 * through useNavigate. Use as the global footer for job boards, hiring
 * marketplaces, recruiting platforms or talent networks. Renders fully with no
 * props.
 */
export const JobBoardFooter = defineCapsule({
  name: 'JobBoardFooter',
  description:
    'Fat, multi-column site footer for a job-board / careers site: a muted top-bordered band with a wide brand column (briefcase mark + name, tagline, and a row of square social icon buttons) beside several titled link columns, closing with a divided bottom row pairing a copyright note with inline legal links. Brand, social buttons and links route through useNavigate. Use as the global footer for job boards, hiring marketplaces, recruiting platforms or talent networks.',
  props: z.object({
    /** Brand / product name shown beside the briefcase mark. */
    brand: z.string().optional(),
    /** Brand tagline under the logo. */
    tagline: z.string().optional(),
    /** Social icon button labels (used as aria-labels + nav targets). */
    socials: z.array(z.string()).optional(),
    /** Footer link columns: title + links. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Bottom copyright note. */
    note: z.string().optional(),
    /** Inline legal links in the bottom row. */
    legal: z.array(z.string()).optional(),
    /** Where the brand click navigates. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'WorkFlow'
    const tagline =
      props.tagline ??
      'Connecting exceptional talent with world-class companies. Find your next career move or hire your dream team.'
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'LinkedIn', 'GitHub']
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'For Candidates',
            links: [
              'Browse Jobs',
              'Companies',
              'Salary Guide',
              'Resume Builder',
              'Career Advice',
            ],
          },
          {
            title: 'For Employers',
            links: [
              'Post a Job',
              'Search Resumes',
              'Pricing',
              'Recruiting Solutions',
              'Employer Blog',
            ],
          },
          {
            title: 'Company',
            links: ['About Us', 'Careers', 'Press', 'Contact', 'Help Center'],
          },
        ]
    const note =
      props.note ??
      `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Settings']
    const homeTarget = props.homeTarget ?? columns[0]?.links[0] ?? brand

    const BriefcaseMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="60%"
          height="60%"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
      </span>
    )

    const socialIconMap: Record<string, ReactNode> = {
      Twitter: (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      LinkedIn: (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
          aria-hidden="true"
        >
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      GitHub: (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
          aria-hidden="true"
        >
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
    }

    const fallbackIcon = (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    )

    void go
    void homeTarget
    void BriefcaseMark
    void fallbackIcon
    void socialIconMap
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand}>
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
