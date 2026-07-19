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
