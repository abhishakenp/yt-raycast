import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * ElectronicsStoreFooter — a multi-column site footer for an electronics
 * storefront. A wide brand column (bolt logo mark + name, description, social
 * icon buttons) sits beside link columns of store/support/company links, over a
 * bottom bar with a copyright line and legal links. Every link and icon routes
 * through useNavigate. Use as the closing footer for electronics stores, gadget
 * shops, consumer-tech retailers, or audio/camera storefronts.
 */
export const ElectronicsStoreFooter = defineComponent({
  name: "ElectronicsStoreFooter",
  description:
    "Multi-column site footer for an electronics storefront: a wide brand column (bolt logo mark + name, description, social icon buttons) beside link columns of store/support/company links, over a bottom bar with a copyright line and legal links. Every link and icon routes through useNavigate. Use as the closing footer for electronics stores, gadget shops, consumer-tech retailers, or audio/camera storefronts.",
  props: z.object({
    /** Brand / store name shown in the footer. */
    brand: z.string().optional(),
    /** Brand description paragraph. */
    description: z.string().optional(),
    /** Navigation target for the brand logo. */
    homeTarget: z.string().optional(),
    /** Social icon buttons. */
    socials: z
      .array(z.object({ label: z.string(), path: z.string() }))
      .optional(),
    /** Footer link columns. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Legal links in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Copyright line. */
    copyright: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "TechNova"
    const description =
      props.description ??
      "Premium electronics and gadgets for the modern lifestyle. Quality products, competitive prices, exceptional service."
    const homeTarget = props.homeTarget ?? "Products"
    const socials = props.socials?.length
      ? props.socials
      : [
          {
            label: "Twitter",
            path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
          },
          {
            label: "Instagram",
            path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
          },
          {
            label: "YouTube",
            path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
          },
        ]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: "Products",
            links: [
              "Headphones",
              "Smartwatches",
              "Laptops",
              "Cameras",
              "Gaming",
            ],
          },
          {
            title: "Support",
            links: [
              "Help Center",
              "Order Status",
              "Returns",
              "Warranty",
              "Contact Us",
            ],
          },
          {
            title: "Company",
            links: ["About", "Careers", "Press", "Affiliates", "Sustainability"],
          },
        ]
    const legal = props.legal?.length
      ? props.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand}. All rights reserved.`

    const BoltMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-foreground text-background",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="20"
          height="20"
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
        className={cn("border-t border-border py-12 lg:py-16", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2 lg:col-span-2">
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-4 flex items-center gap-2"
              >
                <BoltMark className="size-8" />
                <span className="text-xl font-semibold text-foreground">
                  {brand}
                </span>
              </button>
              <p className="mb-4 max-w-xs text-muted-foreground">
                {description}
              </p>
              <div className="flex gap-4">
                {socials.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    aria-label={s.label}
                    onClick={() => go(s.label)}
                    className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <svg
                      className="size-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d={s.path} />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 font-medium text-foreground">
                  {col.title}
                </h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
            <p className="text-sm text-muted-foreground">{copyright}</p>
            <div className="flex gap-6">
              {legal.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
