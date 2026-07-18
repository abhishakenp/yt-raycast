import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

import { Container } from '#/section-kit/Container.tsx'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { PressList } from '#/section-kit/PressList.tsx'

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
      <PressList asChild>
        <section
          className={cn('border-b border-border py-12', props.className)}
          aria-label="Featured in"
        >
          <Container>
            <LogoStrip>
              <LogoStripLabel className="text-center text-sm text-muted-foreground normal-case font-normal tracking-normal">
                {label}
              </LogoStripLabel>
              <LogoStripItems layout="flex" className="mt-8">
                {logos.filter(Boolean).map((logo) => (
                  <LogoStripItem
                    key={logo}
                    variant="text-bold"
                    className="font-serif text-lg text-muted-foreground/60"
                    asChild
                  >
                    <button onClick={() => ((logo) => go(logo))(logo)}>
                      {logo}
                    </button>
                  </LogoStripItem>
                ))}
              </LogoStripItems>
            </LogoStrip>
          </Container>
        </section>
      </PressList>
    )
  },
})
