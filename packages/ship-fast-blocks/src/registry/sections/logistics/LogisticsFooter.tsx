import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * LogisticsFooter — an industrial-manifest footer for a global-logistics /
 * freight-forwarding company. A hairline border-topped band with a giant ghost
 * brand watermark behind: a left brand column (square bolt-mark tile + mono
 * wordmark and a short blurb) beside a row of square bordered mono social chips,
 * over a hairline-ruled bottom row pairing a mono copyright with a
 * pulsing-square status line and a row of mono legal links. Precise and
 * operational, tokens-only; the brand button and every link route through
 * section-kit route links. Use as the closing site footer for logistics
 * providers, freight forwarders, shipping carriers, courier, warehousing or
 * cargo/transport companies. Renders fully with no props via baked-in
 * "SwiftFreight" defaults.
 */
import {
  SiteFooter,
  FooterBrand,
  FooterTagline,
  FooterSocial,
  FooterSocialLink,
  FooterLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
export const LogisticsFooter = defineCapsule({
  name: 'LogisticsFooter',
  description:
    'Industrial-manifest footer for a global-logistics / freight-forwarding company: a hairline border-topped band with a giant ghost brand watermark, a left brand column (square bolt-mark tile + mono wordmark and a short blurb) beside a row of square bordered mono social chips, over a hairline-ruled bottom row pairing a mono copyright with a pulsing-square status line and a row of mono legal links. Precise and operational, tokens-only; the brand button and every link route through section-kit route links. Use as the closing site footer for logistics providers, freight forwarders, shipping carriers, courier, warehousing, supply-chain or cargo/transport companies.',
  props: z.object({
    /** Brand / company name shown beside the mark. */
    brand: z.string().optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    blurb: z.string().optional(),
    socials: z.array(z.string()).optional(),
    servicesTitle: z.string().optional(),
    servicesLinks: z.array(z.string()).optional(),
    companyTitle: z.string().optional(),
    companyLinks: z.array(z.string()).optional(),
    contactTitle: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    copyright: z.string().optional(),
    legalLinks: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'SwiftFreight'
    const blurb =
      props.blurb ??
      'Global logistics made simple. Air, ocean, and ground freight to 180+ countries with real-time tracking and guaranteed delivery.'
    const socials = props.socials?.length
      ? props.socials
      : ['LinkedIn', 'Twitter', 'Facebook']
    const copyright =
      props.copyright ?? 'SwiftFreight Logistics Inc. All rights reserved.'
    const legalLinks = props.legalLinks?.length
      ? props.legalLinks
      : ['Privacy Policy', 'Terms of Service', 'Cookie Settings']
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid shrink-0 place-items-center rounded-none bg-foreground text-background',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          className="size-[60%]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </span>
    )
    return (
      <SiteFooter
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <Watermark className="-bottom-4 right-0 font-mono text-[3.5rem] tracking-tighter text-foreground/[0.03] sm:text-[6rem]">
          {brand}
        </Watermark>
        <Container className="relative py-12 sm:py-14">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <FooterBrand
              brand={brand}
              brandMark={<LogoMark className="size-7" />}
              brandClassName="font-mono text-base font-bold tracking-tight"
              className="max-w-sm"
            >
              <FooterTagline className="text-sm leading-relaxed">
                {blurb}
              </FooterTagline>
            </FooterBrand>
            <FooterSocial className="mt-0 gap-2">
              {socials
                .map((s) => ({ label: s }))
                .map((s) => (
                  <FooterSocialLink
                    key={s.label}
                    className="border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground active:translate-y-px"
                  >
                    {s.label}
                  </FooterSocialLink>
                ))}
            </FooterSocial>
          </div>
          <FooterBottom className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <FooterCopyright className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 animate-pulse bg-primary"
              />
              {copyright}
            </FooterCopyright>
            <FooterLegal className="gap-x-5 gap-y-2">
              {legalLinks.map((l) => (
                <FooterLink
                  key={l}
                  className="block w-fit font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground active:translate-y-px"
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
