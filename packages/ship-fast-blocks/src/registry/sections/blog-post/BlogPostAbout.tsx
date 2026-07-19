import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { Image } from '#/lib/img.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { AboutSection } from '#/section-kit/AboutSection.tsx'
import { PullQuoteText } from '#/section-kit/PullQuote.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * BlogPostAbout — long-form editorial article body for a blog post detail page.
 * A centered long-form reading column with lead paragraphs (large, light),
 * intro paragraphs, body sections (each with a heading and ordered blocks:
 * paragraphs, h3 sub-headings, inline figures with captions, and highlighted
 * bullet callouts), an accented serif pull-quote after the first section,
 * closing paragraphs, tag/topic chips, and an author bio card. Section headings
 * use the shared SectionHeading (align="left"). All links route through
 * section-kit route links. Use as the main content area for blogs, journals, magazines,
 * essays, or editorial reading pages.
 */
export const BlogPostAbout = defineCapsule({
  name: 'BlogPostAbout',
  description:
    'Long-form editorial article body with headings + pullquote for a blog post detail page: a centered long-form reading column with lead paragraphs (large, light), intro paragraphs, body sections (each with a SectionHeading and ordered blocks: paragraphs, h3 sub-headings, inline figures with captions, and highlighted bullet callouts), an accented serif pull-quote after the first section, closing paragraphs, tag/topic chips, and an author bio card. All interactive elements route through section-kit route links. Use as the main content area for blogs, journals, magazines, essays, or editorial reading pages.',
  props: z.object({
    /** Lead paragraphs rendered above the first heading (large, light text). */
    lead: z.array(z.string()).optional(),
    /** Intro paragraphs rendered after the lead and before body sections. */
    introParagraphs: z.array(z.string()).optional(),
    /**
     * Body sections. Each has a heading and ordered blocks. A block is either a
     * paragraph ({ p }), a sub-heading ({ h3 }), a figure ({ imageAlt, caption }),
     * or a bullet callout ({ callout, items }).
     */
    sections: z
      .array(
        z.object({
          heading: z.string(),
          blocks: z.array(
            z.object({
              p: z.string().optional(),
              h3: z.string().optional(),
              imageAlt: z.string().optional(),
              caption: z.string().optional(),
              callout: z.string().optional(),
              items: z.array(z.string()).optional(),
            }),
          ),
        }),
      )
      .optional(),
    /** Accented serif pull-quote inserted after the first section. */
    pullQuote: z
      .object({
        quote: z.string().optional(),
        attribution: z.string().optional(),
      })
      .optional(),
    /** Closing paragraphs rendered after the last section. */
    closing: z.array(z.string()).optional(),
    /** Tag / topic chips displayed beneath the article. */
    tags: z.array(z.string()).optional(),
    /** Author bio card. */
    author: z
      .object({
        name: z.string().optional(),
        bio: z.string().optional(),
        avatarAlt: z.string().optional(),
        links: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const lead = props.lead?.length
      ? props.lead
      : [
          'Last October, I watched a junior designer spend three days perfecting a button hover state. The rest of the team was racing toward a deadline, cranking out screens at breakneck speed. But there was Sarah, adjusting micro-interactions by milliseconds, testing color shifts in different lighting conditions, documenting her rationale in excruciating detail.',
        ]

    const introParagraphs = props.introParagraphs?.length
      ? props.introParagraphs
      : [
          "On day four, she presented her work. The room went quiet. That button wasn't just functional—it was delightful. Users would feel it before they understood it. The micro-interaction communicated trust, responsiveness, and care. It was a tiny detail that elevated the entire product experience.",
          'This is the paradox of modern design: we\'re told to move fast, ship constantly, iterate quickly. Yet the work that endures—the products people truly love—often comes from designers who resist the pressure to rush. They practice what I call "slow design," and it\'s becoming the competitive advantage nobody talks about.',
        ]

    const sections = props.sections?.length
      ? props.sections
      : [
          {
            heading: 'The Speed Trap',
            blocks: [
              {
                p: 'Silicon Valley has fetishized velocity. We celebrate teams that ship features weekly, designers who produce dozens of screens daily, companies that "move fast and break things." The underlying assumption is that speed equals innovation, that the first to market wins, that iteration beats deliberation.',
              },
              {
                p: "But this narrative ignores a crucial truth: most products don't fail because they launched too slowly. They fail because they solve the wrong problem, or solve it poorly, or create more friction than they remove. In my 15 years of designing digital products, I've seen rushed launches kill promising concepts more often than missed deadlines ever have.",
              },
              {
                p: "Consider the data. According to a 2023 study by the Design Management Institute, design-led companies that prioritize thorough research and iteration outperform their peers by 228% on the S&P 500 over ten years. The correlation isn't just about having designers—it's about giving those designers time to think deeply.",
              },
            ],
          },
          {
            heading: 'What Slow Design Looks Like',
            blocks: [
              {
                p: "Slow design isn't about working less or missing deadlines. It's about allocating time where it matters most. Here's what I've observed in teams that practice it well:",
              },
              { h3: '1. Extended Problem Immersion' },
              {
                p: "Instead of jumping to solutions, slow designers spend disproportionate time understanding the problem space. When Airbnb redesigned their host onboarding in 2021, the team spent six weeks just shadowing hosts, mapping emotional journeys, and identifying moments of anxiety that weren't obvious in analytics. The resulting design increased host activation by 34%—but it required patience that many teams would have bypassed.",
              },
              { h3: '2. Deliberate Constraint Setting' },
              {
                p: 'Paradoxically, slowing down often means setting stricter constraints. When Figma built their multiplayer editing feature, they deliberately limited the initial scope to text editing only. This constraint allowed the team to perfect the underlying synchronization engine rather than spreading their attention across multiple feature surfaces. The result felt magical because it was polished, not because it was comprehensive.',
              },
              {
                imageAlt:
                  'Team of designers collaborating around a large table with sketches and wireframes',
                caption:
                  "Team collaboration session at Notion's San Francisco office, 2023",
              },
              { h3: '3. Maturation Periods' },
              {
                p: 'Notion\'s infamous for their approach to features: they often sit on completed designs for months before shipping. CEO Ivan Zhao has explained that this "maturation period" allows the team to experience their own product daily, identifying friction points that weren\'t visible during initial design. The waitlist feature, which drove significant growth in 2022, was built and then shelved for eight months while the team refined the invitation flow.',
              },
            ],
          },
          {
            heading: 'The Business Case for Patience',
            blocks: [
              {
                p: 'Skeptics will ask: how do you justify slow design to stakeholders demanding velocity? The answer lies in measuring what matters. Feature velocity is easy to quantify; user satisfaction, retention impact, and brand perception are harder but ultimately more valuable.',
              },
              {
                p: 'When Linear built their issue tracking product, they famously rejected VC pressure to scale quickly. The small team spent two years on a product that competitors might have built in six months. But those 18 "extra" months produced a tool so refined that it commands a premium price in a crowded market. Linear\'s annual recurring revenue crossed $20 million in 2023—a testament to the economics of excellence.',
              },
              {
                callout: 'Key Research Findings',
                items: [
                  'McKinsey\'s 2023 design study found that companies with formal "thinking time" policies saw 47% higher customer satisfaction scores',
                  'Teams that conduct 3+ rounds of user testing (vs. 1-2) reduce post-launch bug reports by 62%',
                  'Products with 6+ month development cycles show 3x higher 2-year retention than those built in under 3 months',
                ],
              },
            ],
          },
          {
            heading: 'Practical Slow Design',
            blocks: [
              {
                p: "Adopting slow design doesn't require corporate policy changes or executive buy-in. Individual designers and small teams can implement it immediately:",
              },
              {
                p: 'Start with a "waiting list" for your own ideas. When you have a design solution, write it down and revisit it in 48 hours. Most initial solutions benefit from this cooling period—you\'ll spot assumptions, simplifications, and missed opportunities that weren\'t visible in the moment of creation.',
              },
              {
                p: "Protect deep work blocks aggressively. Cal Newport's research on deep work applies directly to design. Two hours of uninterrupted focus produces better outcomes than six hours of fragmented attention. Schedule these blocks during your peak cognitive hours and defend them ruthlessly.",
              },
              {
                p: 'Build "beauty sprints" into your timeline. After functional completion, allocate 20% of remaining project time purely for refinement. This isn\'t gold-plating—it\'s the period when good products become great. Use it for micro-interactions, edge cases, and those details that separate professional work from exceptional work.',
              },
            ],
          },
          {
            heading: 'The Future is Thoughtful',
            blocks: [
              {
                p: "As AI tools accelerate the production of mediocre design, human judgment and taste become more valuable, not less. The designers who thrive won't be those who produce the fastest—they'll be those who know when to slow down, when to question defaults, when to let ideas mature.",
              },
              {
                p: 'Sarah, that junior designer obsessing over button states? She was promoted to senior within 18 months. Her work on that micro-interaction became a case study that her current team—a Series B fintech startup—still references. The three days that seemed extravagant were, in retrospect, an investment that paid dividends far beyond the immediate project.',
              },
            ],
          },
        ]

    const pullQuote =
      props.pullQuote?.quote ??
      "Speed is the enemy of nuance. When we rush, we default to patterns we've used before, solutions we've seen work elsewhere. We stop seeing the unique context in front of us."
    const pullQuoteAttribution =
      props.pullQuote?.attribution ??
      'From a 2022 interview with Jony Ive in The Design Journal'

    const closing = props.closing?.length
      ? props.closing
      : [
          "The art of slow design isn't about working less. It's about working where it counts. In a world addicted to speed, patience is the ultimate competitive advantage.",
        ]

    const tags = props.tags?.length
      ? props.tags
      : ['Design Process', 'Product Strategy', 'UX Research', 'Team Culture']

    const authorName = props.author?.name ?? 'Elena Martinez'
    const authorBio =
      props.author?.bio ??
      'Elena is a Design Director with 15 years of experience building products at Stripe, Airbnb, and Notion. She writes about the intersection of craft, strategy, and team culture. Her work has been featured in Communication Arts, Fast Company, and the AIGA Design Journal.'
    const authorAvatarAlt =
      props.author?.avatarAlt ??
      'Professional headshot of Elena Martinez, design director and writer'
    const authorLinks = props.author?.links?.length
      ? props.author.links
      : ['Twitter', 'LinkedIn', 'Portfolio']

    return (
      <AboutSection className={props.className}>
        <Container asChild size="sm" className="px-6 pb-24 lg:px-6">
          <article>
            <div className="max-w-none">
              {lead.map((p) => (
                <p
                  key={p}
                  className="mb-8 text-xl font-light leading-relaxed text-foreground/90 md:text-2xl"
                >
                  {p}
                </p>
              ))}

              {introParagraphs.map((p) => (
                <p
                  key={p}
                  className="mb-6 text-lg leading-relaxed text-muted-foreground"
                >
                  {p}
                </p>
              ))}

              {sections.map((section, sIdx) => (
                <div key={section.heading}>
                  <SectionHeading
                    title={section.heading}
                    align="left"
                    className="mt-12 mb-6"
                    titleClassName="text-2xl font-semibold tracking-tight md:text-3xl"
                  />

                  {section.blocks.map((block, bIdx) => {
                    if (block.h3) {
                      return (
                        <h3
                          key={`${section.heading}-h3-${bIdx}`}
                          className="mt-8 mb-4 text-xl font-semibold text-foreground"
                        >
                          {block.h3}
                        </h3>
                      )
                    }
                    if (block.imageAlt) {
                      return (
                        <figure
                          key={`${section.heading}-fig-${bIdx}`}
                          className="my-12"
                        >
                          <Image
                            alt={block.imageAlt}
                            w={1200}
                            h={675}
                            loading="lazy"
                            className="h-64 w-full rounded-lg object-cover md:h-80"
                          />
                          {block.caption ? (
                            <figcaption className="mt-3 text-center text-sm text-muted-foreground">
                              {block.caption}
                            </figcaption>
                          ) : null}
                        </figure>
                      )
                    }
                    if (block.callout) {
                      return (
                        <div
                          key={`${section.heading}-callout-${bIdx}`}
                          className="my-12 rounded-lg bg-muted p-8"
                        >
                          <h4 className="mb-4 text-lg font-semibold text-foreground">
                            {block.callout}
                          </h4>
                          <ul className="space-y-3 text-muted-foreground">
                            {(block.items ?? []).map((item) => (
                              <li key={item} className="flex items-start gap-3">
                                <span
                                  className="mt-1 text-primary"
                                  aria-hidden="true"
                                >
                                  •
                                </span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    }
                    return (
                      <p
                        key={`${section.heading}-p-${bIdx}`}
                        className="mb-6 text-lg leading-relaxed text-muted-foreground"
                      >
                        {block.p}
                      </p>
                    )
                  })}

                  {/* Pull-quote after the first section */}
                  {sIdx === 0 ? (
                    <PullQuoteText className="my-12 block border-l-4 border-primary py-2 pl-6">
                      <p className="font-serif text-2xl italic leading-relaxed text-foreground md:text-3xl">
                        &ldquo;{pullQuote}&rdquo;
                      </p>
                      <footer className="mt-4 text-sm text-muted-foreground">
                        — {pullQuoteAttribution}
                      </footer>
                    </PullQuoteText>
                  ) : null}
                </div>
              ))}

              {closing.map((p) => (
                <p
                  key={p}
                  className="mb-8 text-lg leading-relaxed text-muted-foreground"
                >
                  {p}
                </p>
              ))}
            </div>

            {/* Tags */}
            <div className="mt-12 border-t border-border pt-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-2 text-sm text-muted-foreground">
                  Tagged:
                </span>
                {tags.map((tag) => (
                  <NavbarRouteLink
                    key={tag}
                    className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    href={tag}
                  >
                    {tag}
                  </NavbarRouteLink>
                ))}
              </div>
            </div>

            {/* Author bio */}
            <div className="mt-12 rounded-lg bg-muted p-8">
              <div className="flex flex-col items-start gap-6 sm:flex-row">
                <Image
                  alt={authorAvatarAlt}
                  w={160}
                  h={160}
                  className="size-20 shrink-0 rounded-full object-cover"
                />
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {authorName}
                  </h3>
                  <p className="mb-4 leading-relaxed text-muted-foreground">
                    {authorBio}
                  </p>
                  <div className="flex gap-4">
                    {authorLinks.map((link) => (
                      <NavbarRouteLink
                        key={link}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        href={link}
                      >
                        {link}
                      </NavbarRouteLink>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </article>
        </Container>
      </AboutSection>
    )
  },
})
