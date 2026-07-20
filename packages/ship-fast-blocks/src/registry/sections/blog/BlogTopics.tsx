import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { z } from 'zod/v4'

/**
 * BlogTopics — newsprint "sections index" for a blog or publication home
 * page. An asymmetric masthead header (serif heading left, supporting line
 * right of a hairline rule, mono "INDEX" tag) sits on a heavy double rule
 * above a collapsed-border broadsheet grid of section cells. Each cell reads
 * like a newspaper section head: a giant ghost index numeral bleeding out of
 * the corner, a mono "SEC." micro-label, a serif section title that underlines
 * on hover, and a one-line description over a hairline byline rule. The
 * `columns` prop drives the desktop column count and the whole band closes
 * with a serif ornament divider (✦ ✦ ✦). Tokens-only, no icons, no card
 * chrome — pure column rules. Use to let readers browse blog
 * categories/topics (design, engineering, product, culture, tutorials,
 * careers, …). Renders fully with no props from theme-token defaults.
 */
export const BlogTopics = defineCapsule({
  name: 'BlogTopics',
  description:
    "Newsprint 'sections index' for a blog or publication home page: an asymmetric masthead header (serif heading left, supporting line right of a hairline rule, mono INDEX tag) on a heavy double rule, above a collapsed-border broadsheet grid of section cells. Each cell has a giant ghost index numeral bleeding from its corner, a mono 'SEC.' micro-label, a serif section title that underlines on hover, and a one-line description; the band closes with a serif ornament divider. The columns prop drives the desktop column count. Use to let readers browse blog categories/topics (design, engineering, product, culture, tutorials, careers, …). Renders fully with no props from theme-token defaults.",
  props: z.object({
    /** Section heading (maps to FeatureGrid heading). */
    heading: z.string().optional(),
    /** Short supporting line under the heading (maps to FeatureGrid subheading). */
    subheading: z.string().optional(),
    /** Topic categories; each maps to a FeatureGrid feature with an auto-assigned icon. */
    topics: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    /** Grid column count; defaults to 4, which reads well for topics. */
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const topics =
      props.topics && props.topics.length > 0
        ? props.topics
        : [
            {
              title: 'Design',
              description:
                'Craft, visual systems, and the thinking behind how things look and feel.',
            },
            {
              title: 'Engineering',
              description:
                'Deep dives into the architecture, tooling, and code that ships our work.',
            },
            {
              title: 'Product',
              description:
                'How we decide what to build, prioritize, and ship to real users.',
            },
            {
              title: 'Culture',
              description:
                'Stories about how our team works, learns, and grows together.',
            },
            {
              title: 'Tutorials',
              description:
                'Step-by-step guides and practical walkthroughs you can follow along.',
            },
            {
              title: 'Careers',
              description:
                "Open roles, hiring notes, and what it's like to build here.",
            },
          ]

    const heading = props.heading ?? 'Explore topics'
    const subheading =
      props.subheading ?? 'Dive into the subjects we write about most.'
    const columns = props.columns ?? 4

    return (
      <section
        aria-label={heading}
        className={cn(
          'relative overflow-hidden bg-background py-16 lg:py-20',
          props.className,
        )}
      >
        <Container size="lg">
          {/* Asymmetric masthead header on a heavy double rule. */}
          <div className="flex flex-col gap-3 border-b-2 border-foreground pb-4 shadow-[0_3px_0_-2px] shadow-border sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div className="flex items-baseline gap-4">
              <MonoTag tone="faint" className="shrink-0">
                Index
              </MonoTag>
              <h2 className="font-serif text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                {heading}
              </h2>
            </div>
            <p className="max-w-xs border-l border-border pl-4 text-sm leading-snug text-muted-foreground sm:pb-1 sm:text-right sm:border-l-0 sm:border-r sm:pl-0 sm:pr-4">
              {subheading}
            </p>
          </div>

          {/* Collapsed-border sections grid: cells own left+top hairlines. */}
          <div
            className={cn(
              'mt-6 grid grid-cols-2 border-b border-r border-border',
              columns === 2 && 'lg:grid-cols-2',
              columns === 3 && 'lg:grid-cols-3',
              columns === 4 && 'lg:grid-cols-4',
            )}
          >
            {topics.map((topic, i) => (
              <div
                key={topic.title}
                className="group relative overflow-hidden border-l border-t border-border p-4 pb-5 transition-colors duration-200 hover:bg-muted/40 sm:p-6"
              >
                <Watermark className="-right-2 -top-5 font-serif text-[5.5rem] font-black text-foreground/[0.06] transition-colors duration-200 group-hover:text-primary/10">
                  {String(i + 1).padStart(2, '0')}
                </Watermark>
                <MonoTag tone="faint" className="text-[10px]">
                  Sec. {String(i + 1).padStart(2, '0')}
                </MonoTag>
                <h3 className="relative mt-3 font-serif text-xl font-black tracking-tight text-foreground underline-offset-4 group-hover:underline group-hover:decoration-2">
                  {topic.title}
                </h3>
                <p className="relative mt-2.5 border-t border-border pt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {topic.description}
                </p>
              </div>
            ))}
            {topics.length % columns !== 0 && (
              <div
                aria-hidden="true"
                className="hidden border-l border-t border-border lg:flex lg:items-center lg:justify-center [grid-column:auto/-1]"
              >
                <span className="font-serif text-2xl tracking-[0.5em] text-muted-foreground/40">
                  ❦
                </span>
              </div>
            )}
          </div>

          {/* Serif ornament divider closing the index. */}
          <div
            aria-hidden="true"
            className="pt-8 text-center font-serif text-base tracking-[1em] text-muted-foreground/60"
          >
            ✦ ✦ ✦
          </div>
        </Container>
      </section>
    )
  },
})
