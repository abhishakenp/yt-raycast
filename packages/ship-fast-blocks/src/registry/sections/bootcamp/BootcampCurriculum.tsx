import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * BootcampCurriculum — "Terminal Classroom" module ledger for a coding
 * bootcamp / career-school landing page. An asymmetric header (left-aligned
 * heading beside a decorative div-built syllabus progress bar) sits above a
 * collapsed-border 1/2/3-column module grid: every cell carries a mono
 * `MOD 01` index tag, a segmented progress-tick strip that fills as modules
 * advance, a ghost index numeral in the corner, the module title, a
 * week-range description, and a `+`-prefixed skills list. A giant ghost "16"
 * watermark bleeds behind the grid. Use to present a bootcamp's syllabus,
 * course modules, or week-by-week curriculum breakdown.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  FeatureCard,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
import {
  CurriculumList,
  CurriculumItem,
} from '#/section-kit/CurriculumList.tsx'
export const BootcampCurriculum = defineCapsule({
  name: 'BootcampCurriculum',
  description:
    "Terminal-styled collapsed-border module ledger for a coding bootcamp / career-school landing page: asymmetric left-aligned header with a decorative div-built syllabus progress bar, above a hairline 1/2/3-column grid of modules. Each cell has a mono 'MOD 01' index tag, a segmented progress-tick strip, a ghost corner numeral, the module title, a week-range description, and a '+'-prefixed skills list; a giant ghost '16' watermark bleeds behind. Use to present a bootcamp's syllabus, course modules, or week-by-week curriculum breakdown.",
  props: z.object({
    /** Section eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Curriculum modules: title, description, and bullet points. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          points: z.array(z.string()),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const curriculumEyebrow = props.eyebrow ?? 'The Curriculum'
    const curriculumHeading =
      props.heading ?? 'Everything you need to ship production code'
    const curriculumDesc =
      props.description ??
      'Master the modern full-stack through hands-on projects. Build 12 real applications while learning from industry veterans.'
    const curriculumItems = props.items?.length
      ? props.items
      : [
          {
            title: 'Frontend Foundations',
            description:
              'Weeks 1-4: HTML5, CSS3, JavaScript ES6+, DOM manipulation, responsive design with Tailwind CSS.',
            points: [
              'Semantic HTML & accessibility',
              'CSS Grid & Flexbox mastery',
              'Modern JavaScript patterns',
              'Project: Portfolio website',
            ],
          },
          {
            title: 'React & UI Engineering',
            description:
              'Weeks 5-8: React 18, Hooks, state management with Redux Toolkit, component architecture.',
            points: [
              'Component composition patterns',
              'Context API & Redux Toolkit',
              'React Query for server state',
              'Project: E-commerce storefront',
            ],
          },
          {
            title: 'Backend & APIs',
            description:
              'Weeks 9-11: Node.js, Express, RESTful API design, authentication with JWT, middleware patterns.',
            points: [
              'REST API design principles',
              'JWT & session authentication',
              'Express middleware patterns',
              'Project: Task management API',
            ],
          },
          {
            title: 'Databases & Storage',
            description:
              'Weeks 12-13: PostgreSQL, Prisma ORM, data modeling, migrations, indexing strategies.',
            points: [
              'Relational data modeling',
              'Prisma ORM fundamentals',
              'Query optimization & indexing',
              'Project: Social platform backend',
            ],
          },
          {
            title: 'DevOps & Deployment',
            description:
              'Weeks 14-15: Docker, CI/CD pipelines, AWS/Vercel deployment, monitoring, security best practices.',
            points: [
              'Docker containerization',
              'GitHub Actions CI/CD',
              'Cloud deployment strategies',
              'Project: Full-stack deployment',
            ],
          },
          {
            title: 'Career Services',
            description:
              'Week 16: Interview prep, portfolio refinement, salary negotiation, and job placement support.',
            points: [
              'Technical interview coaching',
              'Portfolio & GitHub review',
              'Salary negotiation workshop',
              'Direct employer introductions',
            ],
          },
        ]
    const total = curriculumItems.length
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-16 lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-right-4 -top-6 font-mono text-[9rem] sm:text-[16rem]">
          16
        </Watermark>
        <Container className="relative">
          <div className="mb-10 grid items-end gap-6 lg:mb-14 lg:grid-cols-12">
            <SectionHeading
              align="left"
              eyebrow={curriculumEyebrow}
              title={curriculumHeading}
              subtitle={curriculumDesc}
              className="max-w-2xl gap-0 lg:col-span-8"
              eyebrowClassName="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-4 text-3xl font-bold tracking-tight sm:text-5xl"
              subtitleClassName="text-base text-muted-foreground sm:text-lg"
            />
            <div
              aria-hidden="true"
              className="hidden w-full max-w-xs justify-self-end lg:col-span-4 lg:block"
            >
              <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span>syllabus.load</span>
                <span className="text-primary">wk 12/16</span>
              </div>
              <div className="mt-2 flex gap-1">
                {Array.from({ length: 16 }).map((_, j) => (
                  <span
                    key={j}
                    className={cn(
                      'h-1.5 flex-1',
                      j < 12 ? 'bg-foreground/70' : 'bg-border',
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3">
            {curriculumItems.map((mod, i) => (
              <FeatureCard
                key={mod.title}
                className="relative gap-0 rounded-none border-0 border-b border-r border-border bg-transparent p-6 transition-colors hover:bg-muted/40 lg:p-8"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-3 select-none font-mono text-6xl font-bold leading-none text-foreground/[0.05]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <MonoTag tone="primary">
                  mod {String(i + 1).padStart(2, '0')}
                </MonoTag>
                <div aria-hidden="true" className="mt-3 flex gap-1">
                  {Array.from({ length: total }).map((_, j) => (
                    <span
                      key={j}
                      className={cn(
                        'h-1 w-4',
                        j <= i ? 'bg-primary/70' : 'bg-border',
                      )}
                    />
                  ))}
                </div>
                <FeatureTitle className="mt-5 text-xl font-semibold tracking-tight">
                  {mod.title}
                </FeatureTitle>
                <FeatureDescription className="mt-2">
                  {mod.description}
                </FeatureDescription>
                <CurriculumList className="mt-4 gap-2 text-sm text-muted-foreground">
                  {mod.points.map((p) => (
                    <CurriculumItem
                      key={p}
                      className="flex-row items-start gap-2"
                    >
                      <span
                        aria-hidden="true"
                        className="font-mono text-primary"
                      >
                        +
                      </span>
                      {p}
                    </CurriculumItem>
                  ))}
                </CurriculumList>
              </FeatureCard>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
