import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
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
 * OnlineCourseFooter — "Curriculum LMS" closing footer for an online-course /
 * e-learning site. Thin configuration over the shared SiteFooter composite: a
 * hairline-topped band on the page background with an asymmetric 12-column grid
 * — a brand block (semibold wordmark + open-book mark + tagline + square
 * bracketed mono social chips) on the left, and link columns (Learn, Platform,
 * Company, Support) whose headings render as bracketed mono labels on the
 * right. A bordered-top bottom bar splits an auto-updating copyright line from
 * mono legal links and closes with a decorative "[ EOF ]" marker; a giant ghost
 * "01" watermark bleeds behind. Use as the site-wide footer for course
 * platforms, e-learning marketplaces, MOOCs, bootcamps, or academies. Renders
 * fully with no props.
 */
function BookMark({ className }: { className?: string }) {
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
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

export const OnlineCourseFooter = defineCapsule({
  name: 'OnlineCourseFooter',
  description:
    'Curriculum-LMS closing footer for an online-course / e-learning site built on the shared SiteFooter composite: a hairline-topped band on the page background with an asymmetric 12-column grid — a brand block (semibold wordmark + open-book mark + tagline + square bracketed mono social chips of Twitter/LinkedIn/YouTube) beside link columns (Learn, Platform, Company, Support) with bracketed mono headings, a bordered-top bottom bar splitting an auto-updating copyright line from mono legal links and a decorative "[ EOF ]" marker, over a giant ghost "01" watermark. Use as the site-wide footer for course platforms, e-learning marketplaces, MOOCs, bootcamps, or academies.',
  props: z.object({
    /** Platform / brand name shown as the wordmark. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Learn, Platform, Company, Support, …), each a title + labels. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Legal links shown in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const social = props.social?.length
      ? props.social
      : [{ label: 'Twitter' }, { label: 'LinkedIn' }, { label: 'YouTube' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Learn',
            links: ['Courses', 'Curriculum', 'Instructors', 'Certificates'],
          },
          {
            title: 'Platform',
            links: ['Pricing', 'Mobile app', 'For teams', 'Gift cards'],
          },
          {
            title: 'Company',
            links: ['About', 'Careers', 'Blog', 'Press'],
          },
          {
            title: 'Support',
            links: ['Help center', 'Community', 'Contact', 'FAQ'],
          },
        ]
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy', 'Terms', 'Refunds']

    return (
      <SiteFooter
        className={cn(
          'relative overflow-hidden border-t border-border bg-background',
          props.className,
        )}
      >
        <Watermark className="-bottom-8 -right-2 font-mono text-[7rem] sm:text-[12rem]">
          01
        </Watermark>
        <FooterContent className="relative">
          <FooterGrid className="grid gap-10 md:grid-cols-12">
            <FooterBrand
              brand={props.brand ?? 'LearnSpace'}
              brandMark={<BookMark className="size-8 text-primary" />}
              brandClassName={'font-semibold tracking-tight'}
              className="md:col-span-4"
            >
              <FooterTagline>
                {props.tagline ??
                  'Practical, project-based courses that turn curiosity into a career.'}
              </FooterTagline>
              <FooterSocial className="mt-5">
                {social.map((s) => (
                  <FooterSocialLink
                    key={s.label}
                    className="border border-border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    {s.label}
                  </FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title} className="md:col-span-2">
                <FooterColumnTitle className="font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground">
                  <span aria-hidden="true" className="text-primary">
                    [{' '}
                  </span>
                  {col.title}
                  <span aria-hidden="true" className="text-primary">
                    {' '}
                    ]
                  </span>
                </FooterColumnTitle>
                <FooterColumnList className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <FooterLink
                      key={link}
                      className="block w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="mt-12 flex flex-col justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
            <FooterCopyright className="text-sm text-muted-foreground">
              {props.note ?? 'All rights reserved.'}
            </FooterCopyright>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <FooterLegal className="flex flex-wrap gap-x-5 gap-y-2">
                {legal.map((l) => (
                  <FooterLink
                    key={l}
                    className="block w-fit font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l}
                  </FooterLink>
                ))}
              </FooterLegal>
              <MonoTag tone="faint" aria-hidden="true">
                [ EOF ]
              </MonoTag>
            </div>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
