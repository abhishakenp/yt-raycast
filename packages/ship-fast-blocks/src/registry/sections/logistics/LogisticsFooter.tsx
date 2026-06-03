import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * LogisticsFooter — a rich multi-column footer for a global-logistics / freight-
 * forwarding company. A border-topped band: a left brand column (bolt-mark tile +
 * wordmark, a short blurb and a row of social links) beside Services and Company
 * link columns and a Contact column with email, phone and address rows (each with
 * a leading icon); a bordered sub-bar below carries an auto-updating copyright and
 * a row of legal links. Clean and corporate on a light surface with a deep slate
 * primary; the brand button and every link route through useNavigate. Use as the
 * closing site footer for logistics providers, freight forwarders, shipping
 * carriers, courier, warehousing or cargo/transport companies. Renders fully with
 * no props via baked-in "SwiftFreight" defaults.
 */
export const LogisticsFooter = defineComponent({
  name: "LogisticsFooter",
  description:
    "Rich multi-column footer for a global-logistics / freight-forwarding company: a border-topped band with a left brand column (bolt-mark tile + wordmark, a short blurb and a row of social links) beside Services and Company link columns and a Contact column with email, phone and address rows (each with a leading icon), plus a bordered sub-bar below carrying an auto-updating copyright and a row of legal links. Clean and corporate on a light surface with a deep slate primary; the brand button and every link route through useNavigate. Use as the closing site footer for logistics providers, freight forwarders, shipping carriers, courier, warehousing, supply-chain or cargo/transport companies.",
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
    const go = useNavigate()
    const brand = props.brand ?? "SwiftFreight"
    const homeTarget = props.homeTarget ?? "Services"
    const blurb =
      props.blurb ??
      "Global logistics made simple. Air, ocean, and ground freight to 180+ countries with real-time tracking and guaranteed delivery."
    const socials = props.socials?.length
      ? props.socials
      : ["LinkedIn", "Twitter", "Facebook"]
    const servicesTitle = props.servicesTitle ?? "Services"
    const servicesLinks = props.servicesLinks?.length
      ? props.servicesLinks
      : [
          "Air Freight",
          "Ocean Freight",
          "Ground Transport",
          "Warehousing",
          "Customs Brokerage",
          "Last-Mile Delivery",
        ]
    const companyTitle = props.companyTitle ?? "Company"
    const companyLinks = props.companyLinks?.length
      ? props.companyLinks
      : ["About Us", "Careers", "Press", "Partners", "Sustainability", "Security"]
    const contactTitle = props.contactTitle ?? "Contact"
    const email = props.email ?? "support@swiftfreight.com"
    const phone = props.phone ?? "+1 (555) 234-5678"
    const address =
      props.address ?? "450 Lexington Ave, Suite 2800, New York, NY 10017"
    const copyright =
      props.copyright ?? "SwiftFreight Logistics Inc. All rights reserved."
    const legalLinks = props.legalLinks?.length
      ? props.legalLinks
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground",
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
      <footer
        className={cn("border-t border-border py-16", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-4 flex items-center gap-2"
              >
                <LogoMark className="size-8" />
                <span className="text-xl font-semibold tracking-tight">
                  {brand}
                </span>
              </button>
              <p className="mb-4 text-sm text-muted-foreground">{blurb}</p>
              <div className="flex items-center gap-4">
                {socials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {social}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">{servicesTitle}</h4>
              <ul className="space-y-3 text-sm">
                {servicesLinks.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      onClick={() => go(link)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">{companyTitle}</h4>
              <ul className="space-y-3 text-sm">
                {companyLinks.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      onClick={() => go(link)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">{contactTitle}</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 size-5 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <button
                    type="button"
                    onClick={() => go(email)}
                    className="text-left transition-colors hover:text-foreground"
                  >
                    {email}
                  </button>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 size-5 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <button
                    type="button"
                    onClick={() => go(phone)}
                    className="text-left transition-colors hover:text-foreground"
                  >
                    {phone}
                  </button>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 size-5 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{address}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {copyright}
            </p>
            <div className="flex items-center gap-6 text-sm">
              {legalLinks.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    )
  },
})
