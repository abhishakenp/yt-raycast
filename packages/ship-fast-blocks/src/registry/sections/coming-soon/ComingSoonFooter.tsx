import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * ComingSoonFooter — slim two-row footer for a "launching soon" / waitlist
 * pre-launch landing page. A bordered-top footer with two rows (stack on mobile):
 * the top row has the brand name + launch note on the left and social links on the
 * right; the bottom row has the copyright on the left and legal links on the right.
 * Every brand button, social, and legal link routes through useNavigate. Use as the
 * closing site footer for SaaS waitlists, app pre-launch pages, beta sign-ups, or
 * any minimal coming-soon page. Renders fully with no props via baked-in defaults.
 */
export const ComingSoonFooter = defineComponent({
  name: 'ComingSoonFooter',
  description:
    "Slim two-row footer for a 'launching soon' / waitlist pre-launch landing page: bordered-top footer with two rows (stacks on mobile). Top row has brand name + launch note on the left and social links on the right; bottom row has copyright on the left and legal links on the right. Every brand button, social, and legal link routes through useNavigate. Use as the closing site footer for SaaS waitlists, app pre-launch pages, beta sign-ups, or minimal coming-soon pages.",
  props: z.object({
    /** Brand / product name shown in the footer. */
    brand: z.string().optional(),
    /** Launch timing note shown beside the brand. */
    note: z.string().optional(),
    /** Social link labels. */
    socials: z.array(z.string()).optional(),
    /** Legal link labels. */
    legal: z.array(z.string()).optional(),
    /** Copyright text (falls back to auto-generated). */
    copyright: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Nexus'
    const note = props.note ?? 'Launching March 2025'
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'LinkedIn', 'GitHub']
    const legal = props.legal?.length ? props.legal : ['Privacy', 'Terms']
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`

    return (
      <footer
        className={cn(
          'w-full border-t border-border px-4 py-12 sm:px-6 lg:px-8 xl:px-12',
          props.className,
        )}
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => go(brand)}
                className="text-lg font-semibold tracking-tight text-foreground"
              >
                {brand}
              </button>
              <span className="text-muted-foreground/60">|</span>
              <span className="text-sm text-muted-foreground">{note}</span>
            </div>
            <div className="flex items-center gap-6">
              {socials.map((social) => (
                <button
                  key={social}
                  type="button"
                  onClick={() => go(social)}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {social}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
            <p className="text-xs text-muted-foreground">{copyright}</p>
            <div className="flex items-center gap-6">
              {legal.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    )
  },
})
