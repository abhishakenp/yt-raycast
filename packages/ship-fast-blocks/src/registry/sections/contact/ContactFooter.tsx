import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterBottom,
  FooterCopyright,
} from '#/section-kit/SiteFooter.tsx'

/**
 * ContactFooter — minimal editorial bottom footer for a contact page.
 * A hairline bordered-top row with the brand lockup on the left and a
 * decorative mono "[ End of page ]" micro-label on the right, closed by a
 * second hairline rule and a mono uppercase auto-updating copyright line.
 * Sharp edges, tokens only, unobtrusive on dark or light themes. Use as the
 * site footer for contact, support, or inquiry pages. Renders fully with no
 * props via baked-in defaults.
 */
export const ContactFooter = defineCapsule({
  name: 'ContactFooter',
  description:
    'Minimal editorial bottom footer for a contact page: a hairline bordered-top row with the brand lockup on the left and a decorative mono "[ End of page ]" micro-label on the right, closed by a second hairline rule and a mono uppercase auto-updating copyright line. Sharp edges, token-only colors, unobtrusive on dark or light themes. Use as the site footer for contact, support, or inquiry pages.',
  props: z.object({
    /** Brand / product name included in the copyright line. */
    brand: z.string().optional(),
    /** Full custom copyright line (overrides generated default). */
    copyright: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Orbit Digital'
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`

    return (
      <SiteFooter className={cn('bg-background', props.className)}>
        <FooterContent className="py-10">
          <FooterGrid className="flex flex-wrap items-center justify-between gap-4">
            <FooterBrand brand={brand} />
            <MonoTag aria-hidden="true" tone="faint">
              [ End of page ]
            </MonoTag>
          </FooterGrid>
          <FooterBottom className="mt-8 pt-5">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {copyright}
            </FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
