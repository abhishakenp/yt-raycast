import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * FoodTruckFooter — an inverted, multi-column site footer for a food-truck brand. A
 * foreground-filled band with a brand block (circular monogram tile of brand initials +
 * wordmark + about line) beside configurable link columns and a dedicated socials
 * column, then a divided bottom bar with a copyright line and inline legal links. All
 * links route through useNavigate. Use as the closing footer for food trucks,
 * street-food vendors, caterers or restaurants.
 */
export const FoodTruckFooter = defineComponent({
  name: "FoodTruckFooter",
  description:
    "Inverted, multi-column site footer for a food-truck brand: a foreground-filled band with a brand block (circular monogram tile of brand initials + wordmark + about line) beside configurable link columns and a dedicated socials column, then a divided bottom bar with a copyright line and inline legal links. All links route through useNavigate. Use as the closing footer for food trucks, street-food vendors, taco / burger / bowl concepts, caterers or restaurants.",
  props: z.object({
    /** Brand / food-truck name; initials form the monogram. */
    brand: z.string().optional(),
    about: z.string().optional(),
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Heading for the socials column. */
    socialsHeading: z.string().optional(),
    socials: z.array(z.string()).optional(),
    copyright: z.string().optional(),
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Curbside Kitchen"
    const footerAbout =
      props.about ??
      "Gourmet food truck serving Los Angeles since 2020. Farm-to-street, chef-made, zero pretension."
    const footerColumns = props.columns?.length
      ? props.columns
      : [
          {
            title: "Menu",
            links: [
              "Signature Tacos",
              "Bowls & Salads",
              "Burgers",
              "Sides & Sweets",
            ],
          },
          {
            title: "Company",
            links: ["Locations", "Catering", "FAQ", "Careers"],
          },
        ]
    const socialsHeading = props.socialsHeading ?? "Connect"
    const footerSocials = props.socials?.length
      ? props.socials
      : ["Instagram", "Twitter", "YouTube", "Facebook"]
    const footerCopyright = props.copyright ?? "All rights reserved."
    const footerLegal = props.legal?.length
      ? props.legal
      : ["Privacy Policy", "Terms of Service", "Food Safety"]

    const initials = brand
      .split(/\s+/)
      .map((w) => w.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase()

    return (
      <footer
        className={cn(
          "bg-foreground px-6 py-12 text-background/70",
          props.className,
        )}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span
                  className="grid size-8 place-items-center rounded-full bg-background/10 text-xs font-bold text-background"
                  aria-hidden="true"
                >
                  {initials}
                </span>
                <span className="font-semibold text-background">{brand}</span>
              </div>
              <p className="text-sm">{footerAbout}</p>
            </div>

            {footerColumns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 font-semibold text-background">
                  {col.title}
                </h4>
                <ul className="space-y-2 text-sm">
                  {col.links.map((link) => (
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
            ))}

            <div>
              <h4 className="mb-4 font-semibold text-background">
                {socialsHeading}
              </h4>
              <ul className="space-y-2 text-sm">
                {footerSocials.map((social) => (
                  <li key={social}>
                    <button
                      type="button"
                      onClick={() => go(social)}
                      className="transition-colors hover:text-background"
                    >
                      {social}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 text-sm md:flex-row">
            <p>
              © {new Date().getFullYear()} {brand}. {footerCopyright}
            </p>
            <div className="flex flex-wrap gap-6">
              {footerLegal.map((link) => (
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
