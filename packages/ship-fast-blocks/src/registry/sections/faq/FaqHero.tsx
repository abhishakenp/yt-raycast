import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { HeroSection, HeroContent } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import {
  SearchForm,
  SearchField,
  SearchFieldIcon,
  SearchFieldInput,
  SearchFieldHint,
  SearchSubmit,
} from '#/section-kit/SearchForm.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * FaqHero — calm centered search hero for a help-center / FAQ / knowledge-base page.
 * A light, documentation-style band (no big marketing imagery): large centered
 * heading, a supporting lead paragraph, a wide rounded search input with a leading
 * magnifier icon and a trailing ⌘K keyboard-shortcut hint, and a row of "Popular:"
 * keyword chips below. Submitting the search and tapping chips route through
 * section-kit route links. Use as the top search section for SaaS knowledge bases, help centers,
 * documentation landings, or support pages. Renders fully with no props.
 */
export const FaqHero = defineCapsule({
  name: 'FaqHero',
  description:
    "Calm centered search hero for a help-center / FAQ / knowledge-base page with a light, documentation-style band (no big marketing imagery): large centered heading, a supporting lead paragraph, a wide rounded search input with a leading magnifier icon and a trailing ⌘K keyboard-shortcut hint, and a row of 'Popular:' keyword chips below. Search submit and chip taps route through section-kit route links. Use as the top search section for SaaS knowledge bases, help centers, documentation landings, or support pages.",
  props: z.object({
    /** Hero heading. */
    heading: z.string().optional(),
    /** Supporting lead paragraph. */
    subheading: z.string().optional(),
    /** Search input placeholder. */
    searchPlaceholder: z.string().optional(),
    /** Label preceding the popular keyword chips. */
    popularLabel: z.string().optional(),
    /** Popular keyword chips below the search field. */
    popular: z.array(z.string()).optional(),
    /** Route target for search submit. */
    searchTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'How can we help you?'
    const subheading =
      props.subheading ??
      'Search our knowledge base or browse topics to find answers about FlowSync features, billing, and integrations.'
    const searchPlaceholder =
      props.searchPlaceholder ?? 'Search for articles, topics, or keywords...'
    const popularLabel = props.popularLabel ?? 'Popular:'
    const popular = props.popular?.length
      ? props.popular
      : ['Getting Started', 'Billing', 'API Keys', 'SSO Setup']
    const searchTarget = props.searchTarget ?? 'Documentation'

    return (
      <HeroSection
        variant="default"
        className={cn('border-b border-border bg-background', props.className)}
      >
        <Container
          asChild
          size="sm"
          className="py-16 text-center sm:py-20 lg:py-24"
        >
          <HeroContent>
            <h1 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {heading}
            </h1>
            <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
              {subheading}
            </p>

            <SearchForm className="mx-auto max-w-2xl">
              <SearchField>
                <SearchFieldIcon>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </SearchFieldIcon>
                <SearchFieldInput
                  type="search"
                  placeholder={searchPlaceholder}
                  aria-label="Search help articles"
                  className="pr-24 focus:border-transparent focus:ring-ring"
                />
                <SearchFieldHint>
                  <SearchSubmit
                    asChild
                    className="rounded-lg px-3 py-1.5 text-xs"
                  >
                    <NavbarRouteLink href={searchTarget}>
                      Search
                    </NavbarRouteLink>
                  </SearchSubmit>
                </SearchFieldHint>
              </SearchField>
            </SearchForm>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">
                {popularLabel}
              </span>
              {popular.map((chip) => (
                <NavbarRouteLink
                  key={chip}
                  className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  href={chip}
                >
                  {chip}
                </NavbarRouteLink>
              ))}
            </div>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
