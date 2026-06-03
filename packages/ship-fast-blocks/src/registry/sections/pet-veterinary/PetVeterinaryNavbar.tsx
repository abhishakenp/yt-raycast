import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * PetVeterinaryNavbar — fixed, translucent top navigation bar for a veterinary
 * clinic / pet-healthcare site. A backdrop-blurred, border-bottomed header pinned
 * to the top with a rounded primary paw-glyph logo tile + clinic name on the
 * left, a horizontal set of nav links in the center (desktop), a click-to-call
 * phone link plus a filled primary "Book Appointment" pill CTA on the right, and
 * a hamburger menu button on mobile. Every link and CTA routes through
 * useNavigate. Use as the sticky site header for veterinary clinics, animal
 * hospitals, pet healthcare practices, vet offices, or emergency animal care.
 */
export const PetVeterinaryNavbar = defineComponent({
  name: "PetVeterinaryNavbar",
  description:
    "Fixed translucent top navigation bar for a veterinary clinic / pet-healthcare site: backdrop-blurred, border-bottomed header with a rounded primary paw-glyph logo tile + clinic name on the left, horizontal nav links in the center (desktop), a click-to-call phone link plus a filled primary Book-Appointment pill CTA on the right, and a hamburger menu button on mobile. All links and CTAs route through useNavigate. Use as the sticky site header for veterinary clinics, animal hospitals, pet healthcare practices, vet offices, or emergency animal care.",
  props: z.object({
    /** Clinic / brand name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level navbar link labels. */
    nav: z.array(z.string()).optional(),
    /** Click-to-call phone number shown on the right (desktop). */
    phone: z.string().optional(),
    /** Filled primary pill CTA label on the right. */
    cta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Paws & Care"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Our Team", "Pricing", "Reviews", "FAQ"]
    const phone = props.phone ?? "(555) 123-4567"
    const cta = props.cta ?? "Book Appointment"

    const PawMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-full bg-primary text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="60%"
          height="60%"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
        </svg>
      </span>
    )

    return (
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm",
          props.className,
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
          <button
            type="button"
            onClick={() => go(nav[0])}
            className="group flex items-center gap-2"
          >
            <PawMark className="size-10 transition-colors group-hover:bg-primary/90" />
            <span className="text-xl font-semibold text-foreground">
              {brand}
            </span>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            {nav.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => go(label)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => go("Call")}
              className="hidden items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary lg:flex"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {phone}
            </button>
            <button
              type="button"
              onClick={() => go(cta)}
              className="hidden rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg sm:inline-flex"
            >
              {cta}
            </button>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => go(nav[0])}
              className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          </div>
        </nav>
      </header>
    )
  },
})
