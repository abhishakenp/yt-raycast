import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Container, ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * FintechLogos — trusted-by logo strip for a fintech / neobank landing page. A
 * single muted band bordered top and bottom with a heading label above a
 * responsive 2/4/6-column grid of clickable partner/brand text logos. Each logo
 * routes through useNavigate for page-switching. Use as social-proof for
 * digital-banking, payments, SaaS or any trust-forward product page.
 * Renders fully with no props via baked-in defaults.
 */
export const FintechLogos = defineCapsule({
  name: 'FintechLogos',
  description:
    'Trusted-by logo strip for a fintech / neobank landing page: a single muted band bordered top and bottom with a heading label above a responsive 2/4/6-column grid of clickable partner/brand text logos. Each logo routes through useNavigate for page-switching. Use as social-proof for digital-banking, payments, SaaS or any trust-forward product page.',
  props: z.object({
    /** Heading label above the logo grid. */
    label: z.string().optional(),
    /** Logo brand names (rendered as bold text). */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const label =
      props.label ?? 'Trusted by over 50,000 businesses and individuals'
    const items = props.items?.length
      ? props.items
      : ['Stripe', 'Notion', 'Slack', 'Figma', 'Webflow', 'Vercel']

    return (
      <section
        className={cn('border-y border-border bg-muted py-12', props.className)}
      >
        <Container>
          <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
            {label}
          </p>
          <ResponsiveGrid
            cols="2-4-6"
            gap="lg"
            className="items-center opacity-60"
          >
            {items.map((logo, i) => (
              <button
                key={logo}
                type="button"
                onClick={() => go(logo)}
                className={cn(
                  'mx-auto text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-100',
                  i >= 4 && 'hidden md:block',
                )}
              >
                {logo}
              </button>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
