import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * OnlineCourseNavbar — sticky, translucent top navigation bar for an
 * online-course / e-learning platform. A backdrop-blurred, border-bottomed
 * header pinned to the top with a book/open-pages brand logo tile + platform
 * name on the left, a horizontal set of nav links in the center (desktop),
 * and a "Sign In" text link plus a solid primary "Get Started" CTA on the
 * right. Brand, links, and CTAs route through useNavigate so labels can drive
 * page-switching. Use as the sticky site header for course platforms,
 * e-learning marketplaces, MOOCs, bootcamps, academies, or training providers.
 * Renders fully with no props via baked-in "LearnSpace" defaults.
 */
export const OnlineCourseNavbar = defineComponent({
  name: "OnlineCourseNavbar",
  description:
    "Sticky translucent top navigation bar for an online-course / e-learning platform: backdrop-blurred, border-bottomed header pinned to the top with a book/open-pages brand logo tile + platform name on the left, horizontal nav links in the center (desktop), and a Sign In text link plus a solid primary Get Started CTA on the right. Brand, links, and CTAs route through useNavigate for page-switching. Use as the sticky site header for course platforms, e-learning marketplaces, MOOCs, bootcamps, academies, or training providers.",
  props: z.object({
    /** Brand / platform name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Secondary text-link label on the right. */
    signIn: z.string().optional(),
    /** Solid primary CTA label on the right. */
    cta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "LearnSpace"
    const nav = props.nav?.length
      ? props.nav
      : ["Courses", "Instructors", "Pricing", "FAQ"]
    const signIn = props.signIn ?? "Sign In"
    const cta = props.cta ?? "Get Started"

    const LogoMark = ({ className }: { className?: string }) => (
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
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </span>
    )

    return (
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md",
          props.className,
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => go(nav[0])}
            className="flex items-center gap-2"
          >
            <LogoMark className="size-8" />
            <span className="text-xl font-semibold tracking-tight">
              {brand}
            </span>
          </button>
          <div className="hidden items-center gap-8 md:flex">
            {nav.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => go(label)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => go(signIn)}
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              {signIn}
            </button>
            <button
              type="button"
              onClick={() => go(cta)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {cta}
            </button>
          </div>
        </nav>
      </header>
    )
  },
})
