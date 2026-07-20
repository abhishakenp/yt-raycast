import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { PressList } from '#/section-kit/PressList.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * FurnitureStorePress — a slim editorial "featured in" press / publication-logo
 * strip. A hairline-topped-and-bottomed band with a small mono "[ PRESS ]"
 * micro-label and a caption on the left, and a horizontal wrapping row of serif
 * wordmark buttons (faded, brightening on hover) on the right — an asymmetric
 * masthead rather than a centered stack. Each wordmark routes through
 * section-kit route links. Use beneath a hero as social-proof for furniture,
 * home-decor, interiors, or any editorial retail brand citing design-magazine
 * press. Renders fully with no props via baked-in defaults.
 */
export const FurnitureStorePress = defineCapsule({
  name: 'FurnitureStorePress',
  description:
    "Slim editorial 'featured in' press / publication-logo strip: a hairline-topped-and-bottomed band with a small mono '[ PRESS ]' micro-label + caption on the left and a horizontal wrapping row of faded serif wordmark buttons (brightening on hover) on the right as an asymmetric masthead; each routes through section-kit route links. Use beneath a hero as social-proof for furniture, home-decor, interiors, or any editorial retail brand citing design-magazine press.",
  props: z.object({
    label: z.string().optional(),
    logos: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label =
      props.label ??
      'Featured in Architectural Digest, Dwell, House Beautiful, Elle Decor, and Domino'
    const logos = props.logos?.length
      ? props.logos
      : ['ArchDigest', 'DWELL', 'House Beautiful', 'Elle Decor', 'DOMINO']
    return (
      <PressList asChild>
        <section
          className={cn('border-y border-border py-10', props.className)}
          aria-label="Featured in"
        >
          <Container>
            <LogoStrip>
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
                <LogoStripLabel className="max-w-xs text-left text-sm font-normal normal-case tracking-normal text-muted-foreground">
                  <MonoTag
                    aria-hidden="true"
                    className="mb-2 block tracking-[0.2em]"
                  >
                    [ Press ]
                  </MonoTag>
                  {label}
                </LogoStripLabel>
                <LogoStripItems
                  layout="flex"
                  className="mt-0 justify-start gap-x-8 gap-y-4 lg:justify-end"
                >
                  {logos.filter(Boolean).map((logo) => (
                    <LogoStripItem
                      key={logo}
                      variant="text-bold"
                      className="font-serif text-lg text-muted-foreground/60"
                      asChild
                    >
                      <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
                    </LogoStripItem>
                  ))}
                </LogoStripItems>
              </div>
            </LogoStrip>
          </Container>
        </section>
      </PressList>
    )
  },
})
