import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * MobileAppFooter — a bordered-top, multi-column site footer for a clean,
 * minimalist mobile-app marketing page. A wide brand column (check-in-circle
 * logo mark + app name, a tagline, and a row of round social icon buttons —
 * Twitter / Instagram / LinkedIn) sits beside several link columns (each a
 * heading over a list of nav buttons). A bordered-top bottom bar holds an
 * auto-updating copyright note and a "made in" line. The brand button, social
 * icons and every link route through useNavigate. Use as the closing footer for
 * a habit tracker, fitness / wellness app, productivity or to-do app, or any
 * consumer app landing page. Renders fully with no props via baked-in
 * "DailyFlow" defaults.
 */
export const MobileAppFooter = defineComponent({
  name: "MobileAppFooter",
  description:
    "Bordered-top multi-column site footer for a clean, minimalist mobile-app marketing page: a wide brand column (check-in-circle logo mark + app name, a tagline, and a row of round social icon buttons — Twitter / Instagram / LinkedIn) beside several link columns (heading over a list of nav buttons), plus a bordered-top bottom bar with an auto-updating copyright note and a 'made in' line; the brand button, social icons and every link route through useNavigate. Use as the closing footer for a habit tracker, fitness / wellness app, productivity or to-do app, or any consumer app landing page.",
  props: z.object({
    /** Brand / app name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Route the brand/logo returns to (usually the homepage). */
    homeTarget: z.string().optional(),
    tagline: z.string().optional(),
    /** Social icon labels (each must be Twitter, Instagram, or LinkedIn). */
    socials: z.array(z.string()).optional(),
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    note: z.string().optional(),
    madeIn: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "DailyFlow"
    const homeTarget = props.homeTarget ?? "Features"
    const tagline =
      props.tagline ??
      "Building better habits, one day at a time. Join 50,000+ habit builders worldwide."
    const socials = props.socials?.length
      ? props.socials
      : ["Twitter", "Instagram", "LinkedIn"]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Changelog", "Roadmap"],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press"],
          },
          {
            title: "Support",
            links: ["Help Center", "Contact", "Privacy", "Terms"],
          },
        ]
    const note =
      props.note ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const madeIn = props.madeIn ?? "Made with care in San Francisco"

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={cn("text-foreground", className)}
        aria-hidden="true"
      >
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
        <path
          d="M10 16L14 20L22 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )

    return (
      <footer
        className={cn(
          "border-t border-border py-12 lg:py-16",
          props.className,
        )}
        aria-label="Footer"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
            <div className="col-span-2 lg:col-span-2">
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-4 flex items-center gap-2"
              >
                <LogoMark className="size-8" />
                <span className="text-xl font-semibold tracking-tight">{brand}</span>
              </button>
              <p className="mb-6 max-w-xs text-muted-foreground">{tagline}</p>
              <div className="flex gap-4">
                {socials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {social === "Twitter" && (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    )}
                    {social === "Instagram" && (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    )}
                    {social === "LinkedIn" && (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 font-semibold">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
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
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
            <p className="text-sm text-muted-foreground">{note}</p>
            <p className="text-sm text-muted-foreground">{madeIn}</p>
          </div>
        </div>
      </footer>
    )
  },
})
