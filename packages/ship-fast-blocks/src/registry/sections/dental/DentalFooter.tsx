import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * DentalFooter — rich 4-column footer for a dental practice site. A dark inverted
 * section on the foreground color with a brand block (mint tooth-glyph logo +
 * practice name + tagline + initial-letter social buttons), a services link
 * column, an office-hours column (day / time rows), and a contact column with
 * pinned address, click-to-call phone, and email, closed by a copyright + legal
 * bar. Every link, social, phone, and email routes through useNavigate. Use as
 * the closing footer for dentists, dental offices, orthodontists, or clinics.
 */
export const DentalFooter = defineComponent({
  name: "DentalFooter",
  description:
    "Rich 4-column footer for a dental practice site: a dark inverted section on the foreground color with a brand block (mint tooth-glyph logo + practice name + tagline + initial-letter social buttons), a services link column, an office-hours column (day / time rows), and a contact column with pinned address, click-to-call phone, and email, closed by a copyright + legal bar. Every link, social, phone, and email routes through useNavigate. Use as the closing footer for dentists, dental offices, orthodontists, or clinics.",
  props: z.object({
    /** Practice / brand name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Small eyebrow line under the brand name. */
    brandTagline: z.string().optional(),
    /** Navigation target for the brand logo (typically the first nav item). */
    homeTarget: z.string().optional(),
    tagline: z.string().optional(),
    servicesHeading: z.string().optional(),
    serviceLinks: z.array(z.string()).optional(),
    hoursHeading: z.string().optional(),
    hours: z.array(z.object({ day: z.string(), time: z.string() })).optional(),
    contactHeading: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    socials: z.array(z.string()).optional(),
    copyright: z.string().optional(),
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Bright Smile"
    const brandTagline = props.brandTagline ?? "Dental Care"
    const homeTarget = props.homeTarget ?? "Services"
    const footerTagline =
      props.tagline ??
      "Modern, compassionate dental care for the whole family. Your smile is our passion."
    const footerServicesHeading = props.servicesHeading ?? "Services"
    const footerServiceLinks = props.serviceLinks?.length
      ? props.serviceLinks
      : [
          "Preventive Care",
          "Cosmetic Dentistry",
          "Dental Implants",
          "Orthodontics",
          "Emergency Care",
        ]
    const footerHoursHeading = props.hoursHeading ?? "Office Hours"
    const footerHours = props.hours?.length
      ? props.hours
      : [
          { day: "Monday - Thursday", time: "8am - 6pm" },
          { day: "Friday", time: "8am - 4pm" },
          { day: "Saturday", time: "9am - 2pm" },
          { day: "Sunday", time: "Closed" },
        ]
    const footerContactHeading = props.contactHeading ?? "Contact"
    const footerAddress =
      props.address ?? "1847 NW Lovejoy St, Portland, OR 97209"
    const footerPhone = props.phone ?? "(503) 555-0142"
    const footerEmail = props.email ?? "hello@brightsmiledental.com"
    const footerSocials = props.socials?.length
      ? props.socials
      : ["Facebook", "Instagram", "Google"]
    const footerCopyright =
      props.copyright ?? "Bright Smile Dental. All rights reserved."
    const footerLegal = props.legal?.length
      ? props.legal
      : ["Privacy Policy", "Terms of Service", "Accessibility"]

    const ToothMark = () => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    )

    const LogoBadge = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-xl bg-primary text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <ToothMark />
      </span>
    )

    const PhoneIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )

    return (
      <footer
        className={cn("bg-foreground py-16 text-background", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-6 flex items-center gap-3 text-left"
              >
                <LogoBadge className="size-10" />
                <span className="leading-tight">
                  <span className="block text-xl font-semibold">{brand}</span>
                  <span className="-mt-1 block text-sm text-background/60">
                    {brandTagline}
                  </span>
                </span>
              </button>
              <p className="mb-6 leading-relaxed text-background/60">
                {footerTagline}
              </p>
              <div className="flex gap-4">
                {footerSocials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="grid size-10 place-items-center rounded-lg bg-background/10 text-background/60 transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <span className="text-sm font-bold">
                      {social.charAt(0)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="mb-6 text-lg font-semibold">
                {footerServicesHeading}
              </h4>
              <ul className="space-y-3">
                {footerServiceLinks.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      onClick={() => go(link)}
                      className="text-background/60 transition-colors hover:text-background"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hours */}
            <div>
              <h4 className="mb-6 text-lg font-semibold">
                {footerHoursHeading}
              </h4>
              <ul className="space-y-3 text-background/60">
                {footerHours.map((h) => (
                  <li key={h.day} className="flex justify-between gap-4">
                    <span>{h.day}</span>
                    <span className="text-background">{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-6 text-lg font-semibold">
                {footerContactHeading}
              </h4>
              <ul className="space-y-4 text-background/60">
                <li className="flex items-start gap-3">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-0.5 size-5 shrink-0 text-primary"
                    aria-hidden="true"
                  >
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
                    <path d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                  </svg>
                  <span>{footerAddress}</span>
                </li>
                <li className="flex items-center gap-3">
                  <PhoneIcon className="size-5 shrink-0 text-primary" />
                  <button
                    type="button"
                    onClick={() => go(`Call ${footerPhone}`)}
                    className="transition-colors hover:text-background"
                  >
                    {footerPhone}
                  </button>
                </li>
                <li className="flex items-center gap-3">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5 shrink-0 text-primary"
                    aria-hidden="true"
                  >
                    <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
                  </svg>
                  <button
                    type="button"
                    onClick={() => go(`Email ${footerEmail}`)}
                    className="transition-colors hover:text-background"
                  >
                    {footerEmail}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
            <p className="text-sm text-background/50">
              © {new Date().getFullYear()} {footerCopyright}
            </p>
            <div className="flex gap-6 text-sm">
              {footerLegal.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="text-background/50 transition-colors hover:text-background"
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
