import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * CrmLogos — slim trusted-by logo strip for a CRM / SaaS landing page. A
 * border-bottomed band with a small uppercase tracking-wide caption above a
 * responsive grid of dimmed, wordmark-style company names (2 cols on mobile up
 * to 6 on desktop) that brighten on hover. Each logo routes through useNavigate.
 * Use right beneath a hero to establish social proof for CRM, sales-pipeline or
 * B2B SaaS products. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
export const CrmLogos = defineCapsule({
  name: 'CrmLogos',
  description:
    'Slim trusted-by logo strip for a CRM / SaaS landing page: a border-bottomed band with a small uppercase tracking-wide caption above a responsive grid of dimmed wordmark-style company names (2 cols on mobile up to 6 on desktop) that brighten on hover. Each logo routes through useNavigate. Use right beneath a hero to establish social proof for CRM, sales-pipeline or B2B SaaS products.',
  props: z.object({
    /** Caption above the logo row. */
    heading: z.string().optional(),
    /** Company wordmark labels. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading =
      props.heading ?? 'Trusted by sales teams at leading companies'
    const items = props.items?.length
      ? props.items
      : ['Stripe', 'Notion', 'Vercel', 'Slack', 'Figma', 'Mastercard']
    return (
      <section
        className={cn(
          'border-b border-border bg-background py-12',
          props.className,
        )}
      >
        <Container>
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {heading}
          </p>
          <div className="grid grid-cols-2 items-center gap-8 opacity-70 sm:grid-cols-3 md:grid-cols-6">
            {items.map((logo) => (
              <button
                key={logo}
                type="button"
                onClick={() => go(logo)}
                className="flex items-center justify-center text-lg font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                {logo}
              </button>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
