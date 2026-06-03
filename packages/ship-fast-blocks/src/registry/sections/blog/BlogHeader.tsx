import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * BlogHeader — glassy sticky navigation header for an editorial blog / publication.
 * Backdrop-blurred, border-bottomed bar with a gradient brand tile + publication
 * name on the left, horizontal nav links with an active-home highlight (desktop),
 * and a square icon-only search button on the right. All buttons route via
 * useNavigate; the first nav item drives the brand-logo target. Use as the site
 * header for blogs, magazines, newsrooms, or content hubs.
 */
export const BlogHeader = defineComponent({
  name: "BlogHeader",
  description:
    "Glasy sticky navigation header for an editorial blog or publication: backdrop-blurred, border-bottomed bar with a gradient brand tile + publication name on the left, horizontal nav links with an active-home highlight on desktop, and a square icon-only search button on the right. All buttons route through useNavigate. Use as the site header for blogs, magazines, newsrooms, or content hubs.",
  props: z.object({
    /** Brand / publication name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Nav link labels; first item drives the brand-logo target. */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the search button. */
    searchTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Form & Function"
    const nav = props.nav?.length
      ? props.nav
      : ["Home", "Design", "Engineering", "Product", "About"]
    const searchTarget = props.searchTarget ?? "Search"

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm",
          className,
        )}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="5" cy="19" r="2" />
          <circle cx="19" cy="5" r="2" />
          <path d="M5 17C5 9 11 5 17 5" />
        </svg>
      </span>
    )

    return (
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60",
          props.className,
        )}
      >
        <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-6">
          <button
            type="button"
            onClick={() => go(nav[0])}
            className="flex items-center gap-2.5 text-[1.15rem] font-bold tracking-tight text-foreground"
          >
            <LogoMark />
            {brand}
          </button>
          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 md:flex"
          >
            {nav.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => go(label)}
                className={cn(
                  "rounded-[0.625rem] px-3 py-2 text-[0.92rem] font-medium transition-colors",
                  i === 0
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </nav>
          <button
            type="button"
            aria-label="Search"
            onClick={() => go(searchTarget)}
            className="grid size-[2.375rem] place-items-center rounded-[0.625rem] border border-border bg-background text-muted-foreground transition-all hover:-translate-y-px hover:text-foreground hover:shadow-sm"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
      </header>
    )
  },
})
