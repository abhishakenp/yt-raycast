import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * MentalHealthFooter — a dark, multi-column footer for a therapy practice. On the
 * inverted foreground surface: a brand column (calming "sun/wellness" mark + name
 * + about blurb + round social icon buttons), a services link column, a company
 * link column, and a contact column with address / phone / email / hours rows
 * (each with a primary icon), plus a bottom bar with copyright + license note.
 * Calm, trustworthy wellness aesthetic. Every brand button, link, phone and email
 * routes through useNavigate. Use as the closing site footer for therapists,
 * counselors, psychologists, psychiatrists or wellness centers.
 */
export const MentalHealthFooter = defineComponent({
  name: "MentalHealthFooter",
  description:
    "Dark, multi-column footer for a therapy practice on the inverted foreground surface: a brand column (calming 'sun/wellness' mark + name + about blurb + round social icon buttons), a services link column, a company link column, and a contact column with address / phone / email / hours rows (each with a primary icon), plus a bottom bar with copyright + license note. Calm, trustworthy wellness aesthetic. Every brand button, link, phone and email routes through useNavigate. Use as the closing site footer for therapists, counselors, psychologists, psychiatrists or wellness centers.",
  props: z.object({
    /** Practice / brand name shown in the footer. */
    brand: z.string().optional(),
    /** Navigation target for the brand logo button (e.g. nav[0]). */
    homeTarget: z.string().optional(),
    about: z.string().optional(),
    /** Social icon link labels. */
    socials: z.array(z.string()).optional(),
    servicesTitle: z.string().optional(),
    servicesLinks: z.array(z.string()).optional(),
    /** Navigation target shared by every services-column link. */
    servicesTarget: z.string().optional(),
    companyTitle: z.string().optional(),
    companyLinks: z.array(z.string()).optional(),
    contactTitle: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    hours: z.string().optional(),
    /** Navigation target for phone + email buttons (e.g. "Book Session"). */
    bookLabel: z.string().optional(),
    copyright: z.string().optional(),
    license: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Stillpoint"
    const homeTarget = props.homeTarget ?? "Services"
    const about =
      props.about ??
      "Professional mental health services in Portland's Pearl District. Licensed, compassionate care for individuals, couples, and families."
    const socials = props.socials?.length
      ? props.socials
      : ["Facebook", "Instagram", "LinkedIn"]
    const servicesTitle = props.servicesTitle ?? "Services"
    const servicesLinks = props.servicesLinks?.length
      ? props.servicesLinks
      : [
          "Individual Therapy",
          "Couples Therapy",
          "Family Therapy",
          "EMDR & Trauma",
          "Psychiatry",
        ]
    const servicesTarget = props.servicesTarget ?? "Services"
    const companyTitle = props.companyTitle ?? "Company"
    const companyLinks = props.companyLinks?.length
      ? props.companyLinks
      : ["About Us", "Our Team", "Careers", "Blog", "Privacy Policy"]
    const contactTitle = props.contactTitle ?? "Contact"
    const address =
      props.address ?? "1234 NW Lovejoy St, Portland, OR 97209"
    const phone = props.phone ?? "(503) 555-0147"
    const email = props.email ?? "hello@stillpointtherapy.com"
    const hours = props.hours ?? "Mon-Fri: 8am - 8pm"
    const bookLabel = props.bookLabel ?? "Book Session"
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Therapy, LLC. All rights reserved.`
    const license =
      props.license ?? "Licensed in Oregon • HIPAA Compliant"

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    )

    const Phone = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
    )

    return (
      <footer
        className={cn(
          "bg-foreground py-16 text-background/70",
          props.className,
        )}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-4 flex items-center gap-2"
              >
                <LogoMark className="size-8 text-primary" />
                <span className="text-xl font-semibold text-background">
                  {brand}
                </span>
              </button>
              <p className="mb-6 text-sm leading-relaxed">{about}</p>
              <div className="flex gap-4">
                {socials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="grid size-10 place-items-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
                  >
                    <span className="text-xs font-semibold">
                      {social.charAt(0)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-background">
                {servicesTitle}
              </h4>
              <ul className="space-y-3 text-sm">
                {servicesLinks.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      onClick={() => go(servicesTarget)}
                      className="transition-colors hover:text-background"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-background">
                {companyTitle}
              </h4>
              <ul className="space-y-3 text-sm">
                {companyLinks.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      onClick={() => go(link)}
                      className="transition-colors hover:text-background"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-background">
                {contactTitle}
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 size-5 shrink-0 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{address}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="size-5 shrink-0 text-primary" />
                  <button
                    type="button"
                    onClick={() => go(bookLabel)}
                    className="transition-colors hover:text-background"
                  >
                    {phone}
                  </button>
                </li>
                <li className="flex items-center gap-3">
                  <svg
                    className="size-5 shrink-0 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <button
                    type="button"
                    onClick={() => go(bookLabel)}
                    className="transition-colors hover:text-background"
                  >
                    {email}
                  </button>
                </li>
                <li className="flex items-center gap-3">
                  <svg
                    className="size-5 shrink-0 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{hours}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 text-sm md:flex-row">
            <p>{copyright}</p>
            <p>{license}</p>
          </div>
        </div>
      </footer>
    )
  },
})
