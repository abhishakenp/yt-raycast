import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { publicationLakebed } from '../blog/publication-lakebed.ts'
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
 * NewsroomFooter — refined editorial footer for a digital newsroom or online
 * magazine. A large serif wordmark and a one-line tagline sit above a wide
 * multi-column set of link groups (Sections, Company, Help, Legal, Follow),
 * each with a heading and several routed links, plus an optional slim
 * newsletter mini-capture line. A divided bottom bar carries social handles,
 * an auto-updating copyright line, legal links (Privacy, Terms, Cookies) and a
 * subtle "Back to top" affordance. The newsletter capture writes to the shared
 * Lakebed subscriber list, while the wordmark and every link route through
 * useNavigate. Use as the closing footer for newspapers, magazines, publishing
 * houses or any editorial publication. Renders fully with no props via baked-in
 * "The Daily Ledger" defaults.
 */
export const NewsroomFooter = defineCapsule({
  name: 'NewsroomFooter',
  description:
    'Refined editorial newspaper-style footer for a digital newsroom or online magazine: a large serif wordmark and a one-line tagline above a wide multi-column set of link groups (Sections, Company, Help, Legal, Follow) — each a heading plus several routed links — an optional slim newsletter mini-capture line, and a divided bottom bar with social handles, an auto-updating copyright line, legal links (Privacy, Terms, Cookies) and a subtle Back-to-top affordance. The newsletter capture writes to the shared Lakebed subscriber list, while the wordmark and every link route through useNavigate. Use as the closing footer for newspapers, magazines, publishing houses or any editorial publication.',
  props: z.object({
    /** Large serif wordmark / publication name. */
    brand: z.string().optional(),
    /** One-line tagline or editorial blurb under the wordmark. */
    blurb: z.string().optional(),
    /** Footer link columns, each a heading with a list of links. */
    columns: z
      .array(z.object({ heading: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Social handles shown in the bottom bar. */
    social: z.array(z.string()).optional(),
    /** Copyright line (defaults to an auto year + brand). */
    copyright: z.string().optional(),
    /** Legal / utility link labels along the bottom bar. */
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: publicationLakebed,
  component: ({ props }) => {
    const brand = props.brand ?? 'The Daily Ledger'
    const blurb =
      props.blurb ??
      'Independent journalism, dispatches and long reads for the curious — delivered with rigor every morning.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            heading: 'Sections',
            links: ['World', 'Politics', 'Business', 'Culture', 'Opinion'],
          },
          {
            heading: 'Company',
            links: ['About', 'Masthead', 'Careers', 'Advertise', 'Contact'],
          },
          {
            heading: 'Help',
            links: [
              'Subscribe',
              'Newsletters',
              'Gift a Subscription',
              'FAQ',
              'Support',
            ],
          },
          {
            heading: 'Legal',
            links: ['Privacy', 'Terms', 'Cookies', 'Accessibility', 'Ethics'],
          },
          {
            heading: 'Follow',
            links: ['Twitter', 'Instagram', 'Facebook', 'RSS', 'Apple News'],
          },
        ]
    const social = props.social?.length
      ? props.social
      : ['@dailyledger', 'facebook.com/dailyledger', 'instagram/dailyledger']
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Media. All rights reserved.`
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy', 'Terms', 'Cookies']
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand}>
              <FooterTagline>{blurb}</FooterTagline>
              <FooterSocial>
                {social
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink key={s.label}>{s.label}</FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            {columns
              .map((c) => ({ title: c.heading, links: c.links }))
              .map((col) => (
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
            <FooterCopyright>{copyright}</FooterCopyright>
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
