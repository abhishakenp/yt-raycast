import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { PublicationSubscribeForm } from '../blog/publication-interactions.tsx'
import { publicationLakebed } from '../blog/publication-lakebed.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
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
/**
 * NewsroomFooter — full newsprint "colophon" footer for a digital newsroom or
 * online magazine. It opens on an asymmetric masthead band: a mono "delivered
 * every morning" dateline label and a serif "The Morning Brief" newsletter
 * pitch sit opposite a hairline-framed, square (rounded-none) email-capture row
 * whose submit writes to the shared Lakebed subscriber list. Below a hairline
 * rule sits a large serif wordmark with a one-line italic standfirst and mono
 * social handles, beside a wide multi-column set of link groups (Sections,
 * Company, Help, Legal, Follow) with mono column headings and block-stacked
 * routed links. A divided bottom bar carries an auto-updating copyright line and
 * legal links (Privacy, Terms, Cookies). Every link routes through section-kit
 * route links. Use as the closing footer for newspapers, magazines, publishing
 * houses or any editorial publication. Renders fully with no props via baked-in
 * "The Daily Ledger" defaults.
 */
export const NewsroomFooter = defineCapsule({
  name: 'NewsroomFooter',
  description:
    "Full newsprint colophon footer for a digital newsroom or online magazine: an asymmetric masthead band pairs a mono dateline label and a serif 'The Morning Brief' newsletter pitch with a hairline-framed square email-capture row (submit writes to the shared Lakebed subscriber list); below a hairline rule sits a large serif wordmark, an italic standfirst and mono social handles beside a wide multi-column set of link groups (Sections, Company, Help, Legal, Follow) with mono headings and block-stacked routed links; a divided bottom bar carries an auto-updating copyright line and legal links (Privacy, Terms, Cookies). Every link routes through section-kit route links. Use as the closing footer for newspapers, magazines, publishing houses or any editorial publication.",
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
  component: ({ props, lakebed }) => {
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
      <SiteFooter
        className={cn(
          'border-t-2 border-foreground bg-background',
          props.className,
        )}
      >
        <Container className="py-14 lg:py-16">
          {/* Newsletter capture — The Morning Brief */}
          <div className="grid items-start gap-8 border-b border-border pb-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <MonoTag tone="primary">Delivered every weekday</MonoTag>
              <h3 className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                The Morning Brief
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                The day&rsquo;s essential reporting, distilled into a
                five-minute read. Free, in your inbox before the coffee cools.
              </p>
            </div>
            <div className="lg:col-span-6 lg:pt-9">
              <PublicationSubscribeForm
                lakebed={lakebed}
                emailLabel="Email address for The Morning Brief"
                source="Newsroom footer"
                buttonLabel="Subscribe"
                pendingLabel="Subscribing"
                placeholder="you@example.com"
                successMessage="You're on the list. The Brief lands tomorrow morning."
                className="flex flex-col gap-0 border border-border sm:flex-row"
                inputClassName="w-full rounded-none border-0 bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                buttonClassName="shrink-0 rounded-none border-t border-border bg-foreground px-6 py-3 text-sm font-semibold uppercase tracking-wide text-background transition-transform hover:bg-foreground/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70 sm:border-l sm:border-t-0"
                statusClassName="mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground"
              />
            </div>
          </div>

          <FooterGrid className="mt-12">
            <FooterBrand
              brand={brand}
              brandClassName="font-serif text-2xl font-bold tracking-tight"
            >
              <FooterTagline className="mt-4 max-w-xs font-serif text-base italic leading-relaxed">
                {blurb}
              </FooterTagline>
              <FooterSocial className="mt-5 gap-4">
                {social
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      className="font-mono text-[11px] uppercase tracking-[0.15em]"
                    >
                      {s.label}
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            {columns
              .map((c) => ({ title: c.heading, links: c.links }))
              .map((col) => (
                <FooterColumn key={col.title}>
                  <FooterColumnTitle className="border-b border-border pb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {col.title}
                  </FooterColumnTitle>
                  <FooterColumnList className="mt-4">
                    {col.links.map((link) => (
                      <FooterLink key={link} className="block w-fit">
                        {link}
                      </FooterLink>
                    ))}
                  </FooterColumnList>
                </FooterColumn>
              ))}
          </FooterGrid>
          <FooterBottom className="border-foreground/20">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.15em]">
              {copyright}
            </FooterCopyright>
            <FooterLegal>
              {legal.map((l) => (
                <FooterLink
                  key={l}
                  className="block w-fit font-mono text-[11px] uppercase tracking-[0.15em]"
                >
                  {l}
                </FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </Container>
      </SiteFooter>
    )
  },
})
