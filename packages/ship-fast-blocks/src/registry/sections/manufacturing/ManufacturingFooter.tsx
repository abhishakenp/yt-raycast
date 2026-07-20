import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * ManufacturingFooter — a heavy-industrial four-column site footer for a
 * precision-manufacturing site. On a bg-background band ruled off by a thick
 * foreground top border and wrapped in the shared Container: a brand column (hard-
 * bordered square initials slab + extrabold uppercase wordmark linking home + an
 * about blurb + routed social links), a services link list, an industries link
 * list, and a contact column (address, linked phone + email), over a bottom bar
 * with copyright and legal links. Column titles are mono-uppercase and every link
 * is a left-aligned `block w-fit` row routing through section-kit route links.
 * Tech-brutalist, binary-radius, industrial. Use as the closing footer on
 * machine-shop, fabricator or contract-manufacturer pages. Renders fully with no
 * props via baked-in "Vertex Manufacturing" defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
import {
  SiteFooter,
  FooterGrid,
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
export const ManufacturingFooter = defineCapsule({
  name: 'ManufacturingFooter',
  description:
    'A heavy-industrial four-column site footer for a precision-manufacturing site: on a bg-background band ruled off by a thick foreground top border and wrapped in the shared Container, a brand column (hard-bordered square initials slab + extrabold uppercase wordmark linking home + about blurb + routed social links), a services link list, an industries link list, and a contact column (address, linked phone + email), over a bottom bar with copyright and legal links. Mono-uppercase column titles and left-aligned block w-fit link rows route through section-kit route links. Tech-brutalist, binary-radius, industrial. Use as the closing footer on machine-shop, fabricator or contract-manufacturer pages.',
  props: z.object({
    /** Brand / company name shown in the footer; initials tile derives from it. */
    brand: z.string().optional(),
    /** Navigation target for the brand button (defaults to "Capabilities"). */
    homeTarget: z.string().optional(),
    about: z.string().optional(),
    servicesTitle: z.string().optional(),
    services: z.array(z.string()).optional(),
    industriesTitle: z.string().optional(),
    industries: z.array(z.string()).optional(),
    contactTitle: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    /** Social icon links shown in the contact column. */
    socials: z.array(z.string()).optional(),
    legal: z.array(z.string()).optional(),
    copyright: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Vertex Manufacturing'
    const homeTarget = props.homeTarget ?? 'Capabilities'
    const about =
      props.about ??
      'Precision CNC machining, sheet metal fabrication, and industrial engineering services. ISO 9001:2015 and AS9100D certified.'
    const servicesTitle = props.servicesTitle ?? 'Services'
    const services = props.services?.length
      ? props.services
      : [
          'CNC Machining',
          'Sheet Metal',
          'Precision Grinding',
          'Wire EDM',
          'Finishing',
        ]
    const industriesTitle = props.industriesTitle ?? 'Industries'
    const industries = props.industries?.length
      ? props.industries
      : ['Aerospace', 'Automotive', 'Energy', 'Medical', 'Defense']
    const contactTitle = props.contactTitle ?? 'Contact'
    const address = props.address ?? '2400 Industrial Way, Kent, WA 98032'
    const phone = props.phone ?? '(206) 555-1234'
    const email = props.email ?? 'quotes@vertexmfg.com'
    const socials = props.socials?.length
      ? props.socials
      : ['LinkedIn', 'Twitter']
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Supplier Portal']
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Solutions. All rights reserved.`
    const brandInitials = brand
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('')
    return (
      <SiteFooter
        className={cn(
          'border-t-2 border-foreground bg-background',
          props.className,
        )}
      >
        <Container className="py-14 lg:py-16">
          <FooterGrid>
            <div className="md:col-span-1">
              <NavbarRouteLink
                href={homeTarget}
                aria-label={`${brand} Home`}
                className="flex w-fit items-center gap-2"
              >
                <span
                  aria-hidden="true"
                  className="grid size-8 place-items-center rounded-none border-2 border-foreground bg-foreground font-mono text-xs font-bold text-background"
                >
                  {brandInitials}
                </span>
                <span className="text-lg font-extrabold uppercase tracking-tight text-foreground">
                  {brand}
                </span>
              </NavbarRouteLink>
              <FooterTagline>{about}</FooterTagline>
              <FooterSocial>
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      asChild
                      className="block w-fit font-mono text-[11px] uppercase tracking-[0.14em]"
                    >
                      <NavbarRouteLink href={s.label}>
                        {s.label}
                      </NavbarRouteLink>
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </div>

            <FooterColumn>
              <FooterColumnTitle className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {servicesTitle}
              </FooterColumnTitle>
              <FooterColumnList>
                {services.map((s) => (
                  <li key={s}>
                    <FooterLink href={s} className="block w-fit">
                      {s}
                    </FooterLink>
                  </li>
                ))}
              </FooterColumnList>
            </FooterColumn>

            <FooterColumn>
              <FooterColumnTitle className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {industriesTitle}
              </FooterColumnTitle>
              <FooterColumnList>
                {industries.map((s) => (
                  <li key={s}>
                    <FooterLink href={s} className="block w-fit">
                      {s}
                    </FooterLink>
                  </li>
                ))}
              </FooterColumnList>
            </FooterColumn>

            <FooterColumn>
              <FooterColumnTitle className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {contactTitle}
              </FooterColumnTitle>
              <div className="mt-3 space-y-2">
                <p className="max-w-[16rem] text-sm text-muted-foreground">
                  {address}
                </p>
                <a
                  href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                  className="block w-fit text-sm text-muted-foreground hover:text-foreground"
                >
                  {phone}
                </a>
                <a
                  href={`mailto:${email}`}
                  className="block w-fit font-mono text-sm text-muted-foreground hover:text-foreground"
                >
                  {email}
                </a>
              </div>
            </FooterColumn>
          </FooterGrid>
          <FooterBottom className="border-t-2 border-foreground">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.12em]">
              {copyright}
            </FooterCopyright>
            <FooterLegal>
              {legal.map((l) => (
                <FooterLink
                  key={l}
                  href={l}
                  className="block w-fit font-mono text-[11px] uppercase tracking-[0.12em]"
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
