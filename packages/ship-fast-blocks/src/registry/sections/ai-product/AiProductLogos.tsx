import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'

/**
 * AiProductLogos — a slim "trusted by" social-proof logo strip for a clean,
 * light AI SaaS / product page. A bordered, muted-band section with a small
 * uppercase tracking label centered above a dimmed responsive grid of wordmark
 * buttons (2 → 3 → 6 columns) that brighten on hover. Each wordmark routes
 * through useNavigate. Use directly beneath a hero to establish credibility on
 * AI tools, SaaS apps, startups, or any marketing site that lists customer or
 * partner brands. Renders fully with no props.
 */
export const AiProductLogos = defineCapsule({
  name: 'AiProductLogos',
  description:
    "Slim 'trusted by' social-proof logo strip for a clean, light AI SaaS / product page: a bordered muted-band section with a small uppercase tracking-wider label centered above a dimmed responsive grid of wordmark buttons (2 → 3 → 6 columns) that brighten on hover. Each wordmark routes through useNavigate. Place directly beneath a hero to establish credibility for AI tools, SaaS apps, startups, or any marketing site listing customer or partner brands.",
  props: z.object({
    /** Small uppercase label above the wordmarks. */
    label: z.string().optional(),
    /** Customer / partner brand wordmarks. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const label = props.label ?? 'Trusted by teams at'
    const items = props.items?.length
      ? props.items
      : ['Notion', 'Figma', 'Stripe', 'Linear', 'Vercel', 'Shopify']

    return (
      <LogoStrip
        className={cn('border-y border-border bg-muted/50', props.className)}
      >
        <LogoStripLabel>{label}</LogoStripLabel>
        <LogoStripItems layout="flex" className="mt-8">
          {items.filter(Boolean).map((logo) => (
            <LogoStripItem key={logo} variant="opacity-hover" asChild>
              <button onClick={() => go(logo)}>{logo}</button>
            </LogoStripItem>
          ))}
        </LogoStripItems>
      </LogoStrip>
    )
  },
})
