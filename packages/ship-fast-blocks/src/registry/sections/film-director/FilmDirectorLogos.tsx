import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FilmDirectorLogos — a hairline-framed "selected credits" client strip for a
 * film director / cinematographer portfolio. A border-y band split asymmetrically:
 * a mono, tracked slate caption on the left beside a right-weighted wrap of
 * credits-style UPPERCASE extrabold wordmarks that brighten on hover. Tokens-only.
 * Use as a social-proof / client-roster band beneath the hero for filmmakers,
 * directors, cinematographers, DPs, or production houses.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
export const FilmDirectorLogos = defineCapsule({
  name: 'FilmDirectorLogos',
  description:
    "Hairline-framed 'selected credits' client strip for a film director / cinematographer portfolio: a border-y band split asymmetrically with a mono tracked slate caption on the left beside a right-weighted wrap of credits-style UPPERCASE extrabold wordmarks that brighten on hover. Tokens-only. Use as a social-proof / client-roster band beneath the hero for filmmakers, directors, cinematographers, DPs, or production houses.",
  props: z.object({
    label: z.string().optional(),
    brands: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const logosLabel = props.label ?? 'Trusted by leading brands and agencies'
    const logoBrands = props.brands?.length
      ? props.brands
      : ['NIKE', 'APPLE', 'SONY', 'NETFLIX', 'SPOTIFY', 'ADOBE']
    return (
      <LogoStrip className={cn('border-y border-border', props.className)}>
        <Container>
          <div className="flex flex-col gap-8 py-14 md:flex-row md:items-center md:gap-12 md:py-16">
            <LogoStripLabel className="shrink-0 text-left font-mono text-[11px] uppercase leading-relaxed tracking-[0.2em] text-muted-foreground md:max-w-[12rem]">
              {logosLabel}
            </LogoStripLabel>
            <LogoStripItems
              layout="flex"
              className="justify-start gap-x-8 gap-y-4 md:flex-1 md:justify-end"
            >
              {logoBrands.filter(Boolean).map((logo) => (
                <LogoStripItem
                  key={logo}
                  variant="opacity-hover"
                  className="text-lg font-extrabold uppercase tracking-tight"
                >
                  {logo}
                </LogoStripItem>
              ))}
            </LogoStripItems>
          </div>
        </Container>
      </LogoStrip>
    )
  },
})
