import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * BootcampFooter — "Terminal Classroom" site footer for a coding bootcamp /
 * career-school landing page. A hairline-topped band on the page background
 * with an asymmetric 12-column grid: the brand block (logo + academy name)
 * with square bracketed mono social chips on the left, and titled link
 * columns whose headings render as bracketed mono labels on the right. The
 * bottom bar splits the tagline from mono legal links and closes with a
 * decorative `[ EOF ]` marker; a giant ghost `>_` watermark bleeds behind.
 * Every link and the brand button route through section-kit route links. Use
 * as the closing site footer for coding bootcamps, dev academies, or any
 * cohort-based education brand.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  SiteFooter,
  FooterGrid,
  FooterBrand,
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
export const BootcampFooter = defineCapsule({
  name: 'BootcampFooter',
  description:
    'Terminal-styled site footer for a coding bootcamp / career-school landing page: hairline-topped band on the page background with an asymmetric 12-column grid — brand block with square bracketed mono social chips on the left, titled link columns with bracketed mono headings on the right. The bottom bar splits the tagline from mono legal links and closes with a decorative "[ EOF ]" marker over a giant ghost ">_" watermark. Every link and the brand button route through section-kit route links. Use as the closing site footer for coding bootcamps, dev academies, or cohort-based education brands.',
  props: z.object({
    /** Brand / academy name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Tagline under the brand name. */
    tagline: z.string().optional(),
    /** Titled footer link columns. */
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Social link labels (text-only). */
    socials: z.array(z.string()).optional(),
    /** Legal link labels in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'CodeCraft Academy'
    const footerTagline =
      props.tagline ??
      'Transforming careers through accessible, hands-on coding education since 2019.'
    const footerColumns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Program',
            links: ['Curriculum', 'Mentors', 'Pricing', 'Schedule a Call'],
          },
          {
            title: 'Company',
            links: ['About Us', 'Careers', 'Blog', 'Press'],
          },
          {
            title: 'Support',
            links: ['FAQ', 'Contact', 'Student Login', 'Employer Partners'],
          },
        ]
    const footerSocials = props.socials?.length
      ? props.socials
      : ['Twitter', 'GitHub', 'LinkedIn']
    const footerLegal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Policy']
    return (
      <SiteFooter
        className={cn(
          'relative overflow-hidden border-t border-border bg-background',
          props.className,
        )}
      >
        <Watermark className="-bottom-8 -right-2 font-mono text-[7rem] sm:text-[12rem]">
          {'>_'}
        </Watermark>
        <Container className="relative py-14 lg:py-16">
          <FooterGrid className="grid gap-10 md:grid-cols-12">
            <FooterBrand brand={brand} className="md:col-span-5">
              <FooterSocial className="mt-5">
                {footerSocials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      className="border border-border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    >
                      {s.label}
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            {footerColumns.map((col) => (
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
                      className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="mt-12 flex flex-col justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
            <FooterCopyright className="max-w-md text-sm text-muted-foreground">
              {footerTagline}
            </FooterCopyright>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <FooterLegal className="flex flex-wrap gap-x-5 gap-y-2">
                {footerLegal.map((l) => (
                  <FooterLink
                    key={l}
                    className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
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
        </Container>
      </SiteFooter>
    )
  },
})
