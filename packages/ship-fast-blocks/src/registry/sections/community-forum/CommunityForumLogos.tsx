import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * CommunityForumLogos — logo trust strip for a community-platform / discussion-forum
 * landing page. A centered section heading over a muted band, with a horizontal row
 * of faux-logos (initial-letter icon + name) that route through useNavigate on click.
 * Use as a social-proof / trusted-by section for community platforms, SaaS products,
 * or online forums.
 */
export const CommunityForumLogos = defineComponent({
  name: 'CommunityForumLogos',
  description:
    'Logo trust strip for a community-platform / discussion-forum landing page: a centered section heading over a muted band with a horizontal row of faux-logos (initial-letter icon + name) that route through useNavigate on click. Use as a social-proof / trusted-by section for community platforms, SaaS products, or online forums.',
  props: z.object({
    /** Section heading text. */
    heading: z.string().optional(),
    /** Logo names displayed as faux-logos; each routes on click. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Trusted by teams at innovative companies'
    const items = props.items?.length
      ? props.items
      : ['Vercel', 'Notion', 'Linear', 'Figma', 'Stripe', 'Slack']

    return (
      <section
        className={cn(
          'border-y border-border bg-muted/50 py-12',
          props.className,
        )}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
            {heading}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
            {items.map((logo) => (
              <button
                key={logo}
                type="button"
                onClick={() => go(logo)}
                className="flex items-center gap-2 font-semibold text-foreground/80 transition-opacity hover:opacity-100"
              >
                <span className="grid size-6 place-items-center rounded-sm bg-foreground/10 text-xs font-bold text-foreground">
                  {logo.charAt(0)}
                </span>
                {logo}
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
