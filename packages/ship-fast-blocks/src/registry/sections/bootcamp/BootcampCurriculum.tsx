import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * BootcampCurriculum — 6-up curriculum / modules grid for a coding bootcamp /
 * career-school landing page. A centered eyebrow, heading and description above
 * a responsive 1/2/3-column grid of rounded cards; each card has a rotated inline
 * line-icon tile in primary tint, a module title, a week-range description, and a
 * bullet list of key skills. Cards subtly highlight on hover. Use to present a
 * bootcamp's syllabus, course modules, or week-by-week curriculum breakdown.
 */
import { Container } from '#/section-kit/Container.tsx'
export const BootcampCurriculum = defineCapsule({
  name: 'BootcampCurriculum',
  description:
    "6-up curriculum / modules grid for a coding bootcamp / career-school landing page: centered eyebrow, heading and description above a responsive 1/2/3-column grid of rounded cards. Each card has a rotated inline line-icon tile in primary tint, a module title, a week-range description, and a bullet list of key skills. Cards subtly highlight on hover. Use to present a bootcamp's syllabus, course modules, or week-by-week curriculum breakdown.",
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
    const moduleIcons: ReactNode[] = [
      <svg
        key="code"
        className="size-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
        />
      </svg>,
      <svg
        key="cube"
        className="size-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
        />
      </svg>,
      <svg
        key="server"
        className="size-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
        />
      </svg>,
      <svg
        key="db"
        className="size-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
        />
      </svg>,
      <svg
        key="ship"
        className="size-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
      </svg>,
      <svg
        key="briefcase"
        className="size-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>,
    ]
    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
            <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-wider text-primary">
              {curriculumEyebrow}
            </span>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              {curriculumHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{curriculumDesc}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {curriculumItems.map((mod, i) => (
              <div
                key={mod.title}
                className="group rounded-2xl border border-border bg-muted/40 p-6 transition-colors hover:border-primary/30 lg:p-8"
              >
                <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  {moduleIcons[i % moduleIcons.length]}
                </div>
                <h3 className="mb-3 text-xl font-semibold">{mod.title}</h3>
                <p className="mb-4 text-muted-foreground">{mod.description}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {mod.points.map((p) => (
                    <li key={p} className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-primary" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
