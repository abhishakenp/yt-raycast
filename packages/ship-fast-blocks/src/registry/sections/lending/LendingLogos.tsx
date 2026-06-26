import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * LendingLogos — a "featured in" / press-and-trust logos strip for a lending or
 * fintech marketing page. A subtle bordered, card-tinted band with a centered
 * caption above a wrapping row of dimmed, monochrome wordmark buttons (each a
 * small layered-diamond glyph beside the publication name). Every wordmark routes
 * through useNavigate. Use directly under a hero to add social proof from press
 * mentions, partner brands, or trust-signal logos on loan, fintech, SaaS, or any
 * conversion landing page. Renders fully with no props via baked-in defaults.
 */
export const LendingLogos = defineComponent({
  name: 'LendingLogos',
  description:
    "'Featured in' / press-and-trust logos strip for a lending or fintech marketing page: a subtle bordered, card-tinted band with a centered caption above a wrapping row of dimmed monochrome wordmark buttons (small layered-diamond glyph + publication name). Wordmarks route through useNavigate. Use directly under a hero for social proof from press mentions, partner brands, or trust-signal logos on loan, fintech, SaaS, or conversion landing pages.",
  props: z.object({
    caption: z.string().optional(),
    names: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const logosCaption =
      props.caption ?? 'Featured in and trusted by over 250,000 borrowers'
    const logoNames = props.names?.length
      ? props.names
      : ['TechCrunch', 'Forbes', 'Bloomberg', 'CNBC', 'NerdWallet', 'Bankrate']

    return (
      <section
        className={cn('border-y border-border bg-card py-12', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm text-muted-foreground">
            {logosCaption}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
            {logoNames.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => go(name)}
                className="flex items-center gap-2 text-foreground"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-6"
                  aria-hidden="true"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <span className="text-lg font-semibold">{name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
