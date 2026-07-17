import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'

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
      <LogoStrip
        lead={label}
        logos={companies}
        layout="grid"
        logoStyle="opacity-hover"
        onClickLogo={(company) => go(company)}
        leadClassName="text-sm font-medium uppercase tracking-wider"
        logoClassName="text-muted-foreground/70"
        aria-label="Member companies"
        className={cn(
          'w-full border-y border-border bg-card py-12',
          props.className,
        )}
      />
    )
  },
})
