import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * MembershipClubLogos — quiet "members come from" wordmark strip for a private
 * membership club / exclusive community page. A bordered, muted-surface band with
 * a centered uppercase caption above a responsive grid of company wordmarks
 * rendered as low-contrast text buttons that brighten on hover (the last two hide
 * on small screens). Each wordmark routes through useNavigate. Use as social-proof
 * filler between hero and benefits for members clubs, professional networks,
 * founders communities or alumni collectives. Renders fully with no props.
 */
export const MembershipClubLogos = defineCapsule({
  name: 'MembershipClubLogos',
  description:
    "Quiet 'members come from' wordmark strip for a private membership club / exclusive community page: a bordered, muted-surface band with a centered uppercase caption above a responsive grid of company wordmarks rendered as low-contrast text buttons that brighten on hover (last two hide on small screens). Each wordmark routes through useNavigate. Use as a social-proof strip between hero and benefits for members clubs, professional networks, founders communities or alumni collectives.",
  props: z.object({
    label: z.string().optional(),
    companies: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const label = props.label ?? 'Members come from'
    const companies = props.companies?.length
      ? props.companies
      : ['Stripe', 'Notion', 'Figma', 'Linear', 'Vercel', 'Webflow']

    return (
      <section
        className={cn('w-full border-y border-border bg-card', props.className)}
        aria-label="Member companies"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <div className="grid grid-cols-2 items-center justify-items-center gap-8 md:grid-cols-4 lg:grid-cols-6">
            {companies.map((company, i) => (
              <button
                key={company}
                type="button"
                onClick={() => go(company)}
                aria-label={`${company} company`}
                className={cn(
                  'text-lg font-medium tracking-tight text-muted-foreground/70 transition-colors hover:text-foreground',
                  i >= 4 && 'hidden md:block',
                )}
              >
                {company}
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
