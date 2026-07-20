import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * MembershipClubLogos — quiet "members come from" wordmark strip for a private
 * membership club / exclusive community page. A hairline top-and-bottom bordered
 * band, contained to page width, with a centered mono micro-label caption above a
 * quiet responsive grid of dimmed serif company wordmarks that brighten on hover.
 * Each wordmark routes through section-kit route links. Use as an editorial
 * social-proof strip between hero and benefits for members clubs, professional
 * networks, founders communities or alumni collectives. Renders fully with no
 * props via baked-in defaults.
 */
export const MembershipClubLogos = defineCapsule({
  name: 'MembershipClubLogos',
  description:
    "Quiet 'members come from' wordmark strip for a private membership club / exclusive community page: a hairline top-and-bottom bordered band, contained to page width, with a centered mono micro-label caption above a quiet responsive grid of dimmed serif company wordmarks that brighten on hover. Each wordmark routes through section-kit route links. Use as an editorial social-proof strip between hero and benefits for members clubs, professional networks, founders communities or alumni collectives.",
  props: z.object({
    label: z.string().optional(),
    companies: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Members come from'
    const companies = props.companies?.length
      ? props.companies
      : ['Stripe', 'Notion', 'Figma', 'Linear', 'Vercel', 'Webflow']

    return (
      <LogoStrip
        className={cn(
          'w-full border-y border-border bg-card py-14',
          props.className,
        )}
      >
        <Container>
          <LogoStripLabel className="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            {label}
          </LogoStripLabel>
          <LogoStripItems layout="grid" className="mt-10">
            {companies.filter(Boolean).map((logo) => (
              <LogoStripItem
                key={logo}
                className="font-serif text-lg font-normal tracking-[0.12em] text-muted-foreground/70 transition-colors hover:text-foreground"
                asChild
              >
                <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
              </LogoStripItem>
            ))}
          </LogoStripItems>
        </Container>
      </LogoStrip>
    )
  },
})
