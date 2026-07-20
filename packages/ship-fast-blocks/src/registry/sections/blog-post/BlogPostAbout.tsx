import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { Image } from '#/lib/img.tsx'
import { cn } from '#/lib/utils.ts'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { AboutSection } from '#/section-kit/AboutSection.tsx'
import { PullQuoteText } from '#/section-kit/PullQuote.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * BlogPostAbout — newsprint long-form article body for a blog post detail
 * page. A serif reading column under a giant ghost pilcrow watermark: the lead
 * opens with an oversized serif drop cap, body sections are introduced by a
 * mono "§ 01" index rail with a hairline rule before each serif SectionHeading
 * (align="left"), and sections are separated by ✦ ✦ ✦ ornament dividers.
 * Blocks render as serif paragraphs, small-caps-feel h3 sub-headings, sharp
 * hairline-framed figures with mono "Fig." caption rules, and callouts as
 * double-ruled ledger boxes with mono index numerals and hairline row
 * dividers. After the first section an oversized italic serif pull-quote
 * stretches wider than the column behind a giant faint quotation mark. The
 * article closes with square mono tag chips that invert on hover and a
 * hairline byline ledger card with a square grayscale portrait. All links
 * route through section-kit route links. Use as the main content area for
 * blogs, journals, magazines, essays, or editorial reading pages.
 */
export const BlogPostAbout = defineCapsule({
  name: 'BlogPostAbout',
  description:
    "Newsprint long-form article body with headings + pullquote for a blog post detail page: a serif reading column under a giant ghost pilcrow watermark, lead paragraphs opening with an oversized serif drop cap, body sections introduced by a mono '§ 01' index rail with hairline rule before each serif SectionHeading and separated by ornament dividers, ordered blocks (serif paragraphs, h3 sub-headings, sharp hairline-framed figures with mono 'Fig.' caption rules, and double-ruled ledger callouts with mono index numerals), an oversized italic serif pull-quote stretching wider than the column after the first section, closing paragraphs, square mono tag chips that invert on hover, and a hairline byline ledger card with a square grayscale portrait. All interactive elements route through section-kit route links. Use as the main content area for blogs, journals, magazines, essays, or editorial reading pages.",
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
      <AboutSection className={cn('relative overflow-hidden', props.className)}>
        {/* Giant ghost pilcrow — the manuscript watermark behind the column. */}
        <Watermark className="-top-10 left-[-0.05em] font-serif font-bold text-foreground/[0.04] text-[12rem] sm:text-[18rem]">
          ¶
        </Watermark>

        <Container asChild size="sm" className="relative px-6 pb-24 lg:px-6">
          <article>
            <div className="max-w-none">
              {lead.map((p, i) => (
                <p
                  key={p}
                  className={cn(
                    'mb-8 font-serif text-xl leading-relaxed text-foreground/90 md:text-2xl',
                    i === 0 &&
                      'first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-7xl first-letter:font-bold first-letter:leading-[0.75] first-letter:text-foreground md:first-letter:text-8xl',
                  )}
                >
                  {p}
                </p>
              ))}

              {introParagraphs.map((p) => (
                <p
                  key={p}
                  className="mb-6 font-serif text-lg leading-relaxed text-muted-foreground"
                >
                  {p}
                </p>
              ))}

              {sections.map((section, sIdx) => (
                <div key={section.heading}>
                  {/* Ornament divider before each chapter. */}
                  <div
                    aria-hidden="true"
                    className="mt-14 mb-10 text-center font-serif text-sm tracking-[1em] text-muted-foreground/60"
                  >
                    ✦ ✦ ✦
                  </div>

                  {/* Mono section-index rail: § numeral — hairline rule. */}
                  <div className="mb-4 flex items-center gap-4">
                    <MonoTag className="shrink-0 text-foreground">
                      § {String(sIdx + 1).padStart(2, '0')}
                    </MonoTag>
                    <span
                      aria-hidden="true"
                      className="h-px flex-1 bg-foreground/20"
                    />
                  </div>
                  <SectionHeading
                    title={section.heading}
                    align="left"
                    className="mb-6"
                    titleClassName="font-serif text-3xl font-bold tracking-tight md:text-4xl"
                  />

                  {section.blocks.map((block, bIdx) => {
                    if (block.h3) {
                      return (
                        <h3
                          key={`${section.heading}-h3-${bIdx}`}
                          className="mt-10 mb-4 flex items-baseline gap-3 text-xl font-semibold tracking-tight text-foreground"
                        >
                          <span
                            aria-hidden="true"
                            className="size-1.5 shrink-0 translate-y-[-0.2em] bg-primary"
                          />
                          {block.h3}
                        </h3>
                      )
                    }
                    if (block.imageAlt) {
                      return (
                        <figure
                          key={`${section.heading}-fig-${bIdx}`}
                          className="my-12 sm:-mx-6 lg:-mx-14"
                        >
                          <div className="relative">
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-0 translate-x-2.5 translate-y-2.5 border border-border"
                            />
                            <Image
                              alt={block.imageAlt}
                              w={1200}
                              h={675}
                              loading="lazy"
                              className="relative h-64 w-full rounded-none border border-foreground/25 object-cover md:h-80"
                            />
                          </div>
                          {block.caption ? (
                            <figcaption className="mt-4 flex items-baseline gap-3">
                              <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground">
                                Fig. {sIdx + 1}.{bIdx + 1}
                              </span>
                              <span
                                aria-hidden="true"
                                className="h-px w-8 shrink-0 self-center bg-border"
                              />
                              <span className="font-serif text-sm italic text-muted-foreground">
                                {block.caption}
                              </span>
                            </figcaption>
                          ) : null}
                        </figure>
                      )
                    }
                    if (block.callout) {
                      return (
                        <div
                          key={`${section.heading}-callout-${bIdx}`}
                          className="my-12 rounded-none border-y-[3px] border-x border-foreground/40 bg-muted/40 [border-top-style:double] [border-bottom-style:double] border-x-foreground/15 px-6 py-6 sm:px-8"
                        >
                          <div className="mb-2 flex items-center gap-4">
                            <MonoTag className="shrink-0 text-foreground">
                              {block.callout}
                            </MonoTag>
                            <span
                              aria-hidden="true"
                              className="h-px flex-1 bg-foreground/15"
                            />
                          </div>
                          <ul className="divide-y divide-foreground/10">
                            {(block.items ?? []).map((item, iIdx) => (
                              <li
                                key={item}
                                className="grid grid-cols-[auto_1fr] gap-4 py-4"
                              >
                                <span
                                  aria-hidden="true"
                                  className="font-serif text-2xl font-bold leading-none text-foreground/25"
                                >
                                  {String(iIdx + 1).padStart(2, '0')}
                                </span>
                                <span className="font-serif leading-relaxed text-muted-foreground">
                                  {item}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    }
                    return (
                      <p
                        key={`${section.heading}-p-${bIdx}`}
                        className="mb-6 font-serif text-lg leading-relaxed text-muted-foreground"
                      >
                        {block.p}
                      </p>
                    )
                  })}

                  {/* Pull-quote after the first section — wider than the column. */}
                  {sIdx === 0 ? (
                    <PullQuoteText className="relative my-14 block border-y border-foreground/20 py-10 sm:-mx-6 sm:px-6 lg:-mx-20 lg:px-10">
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-4 left-0 select-none font-serif text-[7rem] leading-none text-primary/10 lg:left-4"
                      >
                        &ldquo;
                      </span>
                      <p className="relative font-serif text-2xl font-medium italic leading-[1.2] tracking-tight text-foreground md:text-3xl lg:text-4xl">
                        &ldquo;{pullQuote}&rdquo;
                      </p>
                      <footer className="mt-6 flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="h-px w-8 bg-primary/60"
                        />
                        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          {pullQuoteAttribution}
                        </span>
                      </footer>
                    </PullQuoteText>
                  ) : null}
                </div>
              ))}

              <div
                aria-hidden="true"
                className="mt-14 mb-10 text-center font-serif text-sm tracking-[1em] text-muted-foreground/60"
              >
                ✦ ✦ ✦
              </div>

              {closing.map((p) => (
                <p
                  key={p}
                  className="mb-8 font-serif text-lg leading-relaxed text-muted-foreground"
                >
                  {p}
                </p>
              ))}
            </div>

            {/* Tags — square mono index chips. */}
            <div className="mt-12 border-t border-foreground/20 pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <MonoTag className="mr-2 shrink-0">Tagged:</MonoTag>
                {tags.map((tag) => (
                  <NavbarRouteLink
                    key={tag}
                    className="rounded-none border border-foreground/25 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:bg-foreground hover:text-background active:translate-y-px"
                    href={tag}
                  >
                    {tag}
                  </NavbarRouteLink>
                ))}
              </div>
            </div>

            {/* Author byline ledger. */}
            <div className="mt-12 rounded-none border-y-[3px] border-x border-foreground/40 border-x-foreground/15 bg-muted/40 p-6 [border-top-style:double] [border-bottom-style:double] sm:p-8">
              <div className="flex flex-col items-start gap-6 sm:flex-row">
                <div className="relative shrink-0">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 translate-x-2 translate-y-2 border border-border"
                  />
                  <Image
                    alt={authorAvatarAlt}
                    w={160}
                    h={160}
                    className="relative size-20 rounded-none border border-foreground/25 object-cover grayscale"
                  />
                </div>
                <div>
                  <h3 className="mb-2 font-serif text-xl font-bold tracking-tight text-foreground">
                    {authorName}
                  </h3>
                  <p className="mb-5 font-serif leading-relaxed text-muted-foreground">
                    {authorBio}
                  </p>
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {authorLinks.map((link) => (
                      <NavbarRouteLink
                        key={link}
                        className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:text-foreground hover:decoration-primary"
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
