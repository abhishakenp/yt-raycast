import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * AiProductNavbar — sticky, blurred top navigation bar for a clean, light AI
 * SaaS / product landing page. A backdrop-blurred header pinned to the top with
 * a near-black brand tile + pen glyph and product name on the left, a centered
 * horizontal set of nav links (desktop), and a "Sign in" text link plus a
 * near-black filled primary CTA on the right. Every link and CTA routes through
 * useNavigate for page-switching. Use as the sticky site header for AI writing
 * assistants, AI copilots, generative-AI tools, developer-AI products, or any
 * modern minimal SaaS marketing site. Renders fully with no props.
 */
export const AiProductNavbar = defineComponent({
  name: 'AiProductNavbar',
  description:
    "Sticky backdrop-blurred top navigation bar for a clean, light AI SaaS / product landing page: a near-black rounded brand tile with a pen/edit glyph + product name on the left, a horizontal set of nav links (desktop), and a muted 'Sign in' text link plus a near-black filled primary CTA button on the right. Links and CTAs route through useNavigate for page-switching. Use as the sticky site header for AI writing assistants, AI copilots, generative-AI tools, developer-AI products, or any modern minimal conversion-focused SaaS marketing site.",
  props: z.object({
    /** Brand / product name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Muted text link label on the right. */
    signInLabel: z.string().optional(),
    /** Filled primary CTA button label on the right. */
    cta: z.string().optional(),
    /** Navigation target for the primary CTA (defaults to the hero's start action). */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'WriteFlow'
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'Pricing', 'Stories', 'FAQ']
    const signInLabel = props.signInLabel ?? 'Sign in'
    const cta = props.cta ?? 'Start free trial'
    const ctaTarget = props.ctaTarget ?? 'Start writing free'

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-foreground text-background',
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
          <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </span>
    )

    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md',
          props.className,
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
          <button
            type="button"
            onClick={() => go(brand)}
            className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground"
          >
            <LogoMark className="size-8" />
            {brand}
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
              onClick={() => go(signInLabel)}
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              {signInLabel}
            </button>
            <button
              type="button"
              onClick={() => go(ctaTarget)}
              className="inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              {cta}
            </button>
          </div>
        </nav>
      </header>
    )
  },
})
