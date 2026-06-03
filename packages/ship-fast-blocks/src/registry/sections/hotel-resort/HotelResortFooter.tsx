import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * HotelResortFooter — rich 4-column dark footer for a luxury hotel / resort &
 * spa site. A foreground-surface footer: a brand column (logo mark + name,
 * about blurb, circular social buttons), an explore-links column, a contact
 * column (address lines plus tappable phone/email), and a newsletter column
 * with an inline email-capture form, all over a bordered bottom row with an
 * auto-updating copyright line and legal links. The brand button, socials,
 * links, contact rows and newsletter all route through useNavigate. Use as the
 * closing footer for hotels, resorts, spa retreats, villas, or inns. Renders
 * fully with no props via baked-in "Azure Coast" defaults.
 */
export const HotelResortFooter = defineComponent({
  name: "HotelResortFooter",
  description:
    "Rich 4-column dark footer for a luxury hotel / resort & spa site: a foreground-surface footer with a brand column (logo mark + name, about blurb, circular social buttons), an explore-links column, a contact column (address lines plus tappable phone/email), and a newsletter column with an inline email-capture form, over a bordered bottom row with an auto-updating copyright line and legal links. Brand button, socials, links, contact rows and newsletter route through useNavigate. Use as the closing footer for hotels, resorts, spa retreats, villas, or boutique inns.",
  props: z.object({
    /** Resort / brand name shown beside the logo mark. */
    brand: z.string().optional(),
    /** About blurb under the brand. */
    about: z.string().optional(),
    /** Social link labels (rendered as circular initial buttons). */
    socials: z.array(z.string()).optional(),
    /** Heading for the explore-links column. */
    exploreHeading: z.string().optional(),
    /** Explore-link labels. */
    exploreLinks: z.array(z.string()).optional(),
    /** Heading for the contact column. */
    contactHeading: z.string().optional(),
    /** Contact lines (first two static address lines, the rest tappable). */
    contactLines: z.array(z.string()).optional(),
    /** Heading for the newsletter column. */
    newsletterHeading: z.string().optional(),
    /** Newsletter blurb. */
    newsletterText: z.string().optional(),
    /** Newsletter submit label + navigation target. */
    newsletterCta: z.string().optional(),
    /** Suffix appended after the brand in the copyright line (before the note). */
    copyrightSuffix: z.string().optional(),
    /** Copyright note. */
    note: z.string().optional(),
    /** Legal / utility links in the bottom row. */
    legalLinks: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Azure Coast"
    const about =
      props.about ??
      "An award-winning oceanfront resort offering luxury accommodations, world-class dining, and restorative wellness experiences on the California coast."
    const socials = props.socials?.length
      ? props.socials
      : ["Instagram", "Facebook", "Twitter"]
    const exploreHeading = props.exploreHeading ?? "Explore"
    const exploreLinks = props.exploreLinks?.length
      ? props.exploreLinks
      : ["Rooms & Suites", "Spa & Wellness", "Dining", "Gallery", "Gift Cards"]
    const contactHeading = props.contactHeading ?? "Contact"
    const contactLines = props.contactLines?.length
      ? props.contactLines
      : [
          "34780 Pacific Coast Highway",
          "Malibu, CA 90265",
          "1-800-555-1234",
          "reservations@azurecoast.com",
        ]
    const newsletterHeading = props.newsletterHeading ?? "Newsletter"
    const newsletterText =
      props.newsletterText ?? "Receive exclusive offers and resort updates."
    const newsletterCta = props.newsletterCta ?? "Join"
    const copyrightSuffix = props.copyrightSuffix ?? "Resort & Spa."
    const note = props.note ?? "All rights reserved."
    const legalLinks = props.legalLinks?.length
      ? props.legalLinks
      : ["Privacy Policy", "Terms of Service", "Accessibility"]
    const homeTarget = props.homeTarget ?? "Rooms & Suites"

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-full font-light",
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    return (
      <footer
        className={cn(
          "bg-foreground pb-10 pt-20 text-background",
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-6 flex items-center gap-3"
              >
                <LogoMark className="size-10 bg-background text-lg text-foreground" />
                <span className="text-xl font-medium tracking-tight">
                  {brand}
                </span>
              </button>
              <p className="mb-6 text-sm leading-relaxed text-background/60">
                {about}
              </p>
              <div className="flex gap-4">
                {socials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="grid size-10 place-items-center rounded-full bg-background/10 transition-colors hover:bg-background/20"
                  >
                    <span className="text-xs font-medium">
                      {social.charAt(0)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-6 font-medium">{exploreHeading}</h4>
              <ul className="space-y-3 text-sm text-background/60">
                {exploreLinks.map((link) => (
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
              <h4 className="mb-6 font-medium">{contactHeading}</h4>
              <ul className="space-y-3 text-sm text-background/60">
                {contactLines.map((line, i) => (
                  <li key={line} className={i === 2 ? "pt-2" : undefined}>
                    {i >= 2 ? (
                      <button
                        type="button"
                        onClick={() => go(line)}
                        className="transition-colors hover:text-background"
                      >
                        {line}
                      </button>
                    ) : (
                      line
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-6 font-medium">{newsletterHeading}</h4>
              <p className="mb-4 text-sm text-background/60">
                {newsletterText}
              </p>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  go(newsletterCta)
                }}
              >
                <input
                  type="email"
                  placeholder="Your email"
                  aria-label="Your email"
                  className="flex-1 rounded-md border border-background/20 bg-background/10 px-4 py-3 text-sm text-background placeholder:text-background/40 focus:border-background/40 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-md bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {newsletterCta}
                </button>
              </form>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 md:flex-row">
            <p className="text-sm text-background/40">
              © {new Date().getFullYear()} {brand} {copyrightSuffix} {note}
            </p>
            <div className="flex gap-6 text-sm text-background/40">
              {legalLinks.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="transition-colors hover:text-background"
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
