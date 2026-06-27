import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * FurnitureStorePress — a slim "featured in" press / publication-logo strip. A
 * bordered-bottom band with a centered caption above a horizontal, wrapping row
 * of serif wordmark buttons rendered as faded muted text that brighten on hover.
 * Each wordmark routes through useNavigate. Use beneath a hero as social-proof
 * for furniture, home-decor, interiors, or any editorial retail brand citing
 * design-magazine press. Renders fully with no props via baked-in defaults.
 */
export const FurnitureStorePress = defineCapsule({
  name: 'FurnitureStorePress',
  description:
    "Slim 'featured in' press / publication-logo strip: a bordered-bottom band with a centered caption above a horizontal wrapping row of serif wordmark buttons rendered as faded muted text that brighten on hover; each routes through useNavigate. Use beneath a hero as social-proof for furniture, home-decor, interiors, or any editorial retail brand citing design-magazine press.",
  props: z.object({
    label: z.string().optional(),
    logos: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const label =
      props.label ??
      'Featured in Architectural Digest, Dwell, House Beautiful, Elle Decor, and Domino'
    const logos = props.logos?.length
      ? props.logos
      : ['ArchDigest', 'DWELL', 'House Beautiful', 'Elle Decor', 'DOMINO']

    return (
      <section
        className={cn('border-b border-border py-12', props.className)}
        aria-label="Featured in"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm text-muted-foreground">
            {label}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground/60 lg:gap-16">
            {logos.map((logo) => (
              <button
                key={logo}
                type="button"
                onClick={() => go(logo)}
                className="font-serif text-lg font-semibold tracking-tight transition-colors hover:text-foreground"
              >
                {logo}
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
