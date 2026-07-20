import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
/**
 * KidsEducationFooter — playful-primary mega footer for a kids / family learning
 * platform. A 2px-topped band wrapping a plain Container, with a giant ghost
 * brand watermark bleeding off the bottom edge: an asymmetric 12-column grid
 * pairs a wide brand block (sharp primary open-book mark + extrabold name, a
 * tagline, and sharp 2px-bordered mono social chips with hard hover borders)
 * with mono-labeled link-list columns whose links sit in a tight w-fit stack;
 * below, a hairline-divided bottom bar carries the copyright note, mono legal
 * links, and a decorative mono tag. Every link, social, and the logo route
 * through section-kit route links. Use as the closing site footer for
 * kids-education startups, children's e-learning platforms, tutoring services,
 * and family learning apps. Renders fully with no props via baked-in
 * "WonderLearn" defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
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
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'
export const KidsEducationFooter = defineCapsule({
  name: 'KidsEducationFooter',
  description:
    "Playful-primary mega footer for a kids / family learning platform: a 2px-topped band wrapping a plain Container, with a giant ghost brand watermark bleeding off the bottom edge; an asymmetric 12-column grid pairs a wide brand block (sharp primary open-book mark + extrabold name, tagline, and sharp 2px-bordered mono social chips with hard hover borders) with mono-labeled link-list columns whose links sit in a tight w-fit stack, above a hairline-divided bottom bar carrying the copyright note, mono legal links, and a decorative mono tag. Every link, social, and the logo route through section-kit route links. Use as the closing site footer for kids-education startups, children's e-learning platforms, tutoring services, and family learning apps.",
  props: z.object({
    /** Brand / platform name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Navigation target for the logo click. */
    homeTarget: z.string().optional(),
    /** Brand-column tagline. */
    tagline: z.string().optional(),
    /** Trailing copyright note after the brand name. */
    note: z.string().optional(),
    /** Link-list columns. */
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Bottom-bar legal links. */
    legal: z.array(z.string()).optional(),
    /** Social labels (rendered as round initial buttons). */
    socials: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'WonderLearn'
    const tagline =
      props.tagline ??
      'Making learning an adventure for curious kids everywhere. Play-based activities for ages 4-12.'
    const note = props.note ?? 'All rights reserved.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: ['Activities', 'Pricing', 'For Schools', 'Gift Cards'],
          },
          {
            title: 'Company',
            links: ['About Us', 'Careers', 'Blog', 'Press'],
          },
          {
            title: 'Support',
            links: ['Help Center', 'Contact Us', 'Safety', 'Privacy'],
          },
        ]
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Policy']
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'Facebook', 'Instagram']
    return (
      <SiteFooter
        className={
          'relative overflow-hidden border-t-2 border-foreground bg-background' +
          (props.className ? ' ' + props.className : '')
        }
      >
        {/* Giant ghost brand watermark bleeding off the bottom edge. */}
        <Watermark className="-bottom-6 -right-2 text-[5rem] sm:text-[9rem] lg:text-[12rem]">
          {brand}
        </Watermark>
        <Container className="relative py-14 lg:py-16">
          <FooterGrid className="grid gap-10 md:grid-cols-12 lg:gap-8">
            <FooterBrand
              brand={brand}
              brandMark={
                <span
                  aria-hidden="true"
                  className="grid size-7 place-items-center rounded-none border-2 border-foreground bg-primary text-primary-foreground"
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
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </span>
              }
              brandClassName="text-lg font-extrabold tracking-tight text-foreground"
              className="md:col-span-5 lg:col-span-6"
            >
              <FooterTagline className="max-w-sm">{tagline}</FooterTagline>
              <FooterSocial className="mt-5 gap-2">
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      className="rounded-none border-2 border-border px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
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
                    /{' '}
                  </span>
                  {col.title}
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
              {note}
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
        </Container>
      </SiteFooter>
    )
  },
})
