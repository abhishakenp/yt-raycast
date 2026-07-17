import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'

/**
 * CrmLogos — slim trusted-by logo strip for a CRM / SaaS landing page. A
 * border-bottomed band with a small uppercase tracking-wide caption above a
 * responsive grid of dimmed, wordmark-style company names (2 cols on mobile up
 * to 6 on desktop) that brighten on hover. Each logo routes through useNavigate.
 * Use right beneath a hero to establish social proof for CRM, sales-pipeline or
 * B2B SaaS products. Renders fully with no props.
 */
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
      <LogoStrip
        lead={heading}
        logos={items}
        layout="grid"
        logoStyle="opacity-hover"
        onClickLogo={(logo) => go(logo)}
        leadClassName="tracking-wider"
        className={cn(
          'border-b border-border bg-background px-4 py-12 sm:px-6 lg:px-8',
          props.className,
        )}
      />
    )
  },
})
