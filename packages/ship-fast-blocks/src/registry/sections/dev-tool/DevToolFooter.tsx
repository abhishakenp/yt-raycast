import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * DevToolFooter — a 5-column footer for a developer tool / API platform. A
 * top-bordered section with a brand logo (blue bolt tile) + name + about blurb +
 * social icon buttons spanning two columns on the left, followed by three titled
 * link columns, plus a bottom copyright / legal bar. Every brand button, link,
 * and social icon routes through useNavigate. Use as the closing site footer for
 * developer tools, API platforms, backend-as-a-service, or technical SaaS.
 */
export const DevToolFooter = defineComponent({
  name: "DevToolFooter",
  description:
    "5-column footer for a developer tool / API platform: a top-bordered section with a brand logo (blue bolt tile) + name + about blurb + social icon buttons spanning two columns on the left, followed by three titled link columns, plus a bottom copyright/legal bar. Every brand button, link, and social icon routes through useNavigate. Use as the closing site footer for developer tools, API platforms, backend-as-a-service, or technical SaaS.",
  props: z.object({
    /** Brand / product name shown in the footer. */
    brand: z.string().optional(),
    /** Navigation target for the brand logo button (e.g. nav[0]). */
    homeTarget: z.string().optional(),
    /** About paragraph under the brand. */
    blurb: z.string().optional(),
    /** Social icon links: label + SVG path. */
    socials: z
      .array(z.object({ label: z.string(), path: z.string() }))
      .optional(),
    /** Footer link columns: title + array of labels. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    legalLinks: z.array(z.string()).optional(),
    copyright: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "DevStack"
    const homeTarget = props.homeTarget ?? "Features"
    const blurb =
      props.blurb ??
      "The complete developer platform for authentication, storage, real-time events, and serverless functions. Built for teams that ship."
    const socials = props.socials?.length
      ? props.socials
      : [
          {
            label: "Twitter",
            path: "M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84",
          },
          {
            label: "GitHub",
            path: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z",
          },
          {
            label: "Discord",
            path: "M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.293a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z",
          },
        ]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Changelog", "Roadmap", "Status"],
          },
          {
            title: "Resources",
            links: [
              "Documentation",
              "API Reference",
              "Guides",
              "Blog",
              "Support",
            ],
          },
          {
            title: "Company",
            links: ["About", "Careers", "Legal", "Privacy", "Contact"],
          },
        ]
    const legalLinks = props.legalLinks?.length
      ? props.legalLinks
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`

    const BoltMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary text-primary-foreground",
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
        className={cn("border-t border-border py-16", props.className)}
        role="contentinfo"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
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
              <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {blurb}
              </p>
              <div className="flex gap-4">
                {socials.map((social) => (
                  <button
                    key={social.label}
                    type="button"
                    aria-label={social.label}
                    onClick={() => go(social.label)}
                    className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    <svg
                      className="size-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d={social.path} />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 font-semibold text-foreground">
                  {col.title}
                </h4>
                <ul className="space-y-3 text-sm">
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
          <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
            <p className="text-sm text-muted-foreground">{copyright}</p>
            <div className="flex gap-6 text-sm">
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
