import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'

const ICONS = {
  math: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 7h6M8 4v6M14 8h6M14 16h6M15.5 13.5l3 5M18.5 13.5l-3 5"
      />
    </svg>
  ),
  science: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 3h6M10 3v6.5L5.5 17a2 2 0 0 0 1.7 3h9.6a2 2 0 0 0 1.7-3L14 9.5V3M7.5 14h9"
      />
    </svg>
  ),
  language: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5h12M9 3v2M5 5c0 5 3 9 8 11M11 5c0 4-2.5 7-6 9M14 20l4-9 4 9M15.5 16.5h5"
      />
    </svg>
  ),
  testPrep: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 14l2 2 4-4"
      />
    </svg>
  ),
  writing: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
      />
    </svg>
  ),
  reading: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 7c-1.8-1.3-4.2-2-7-2H3v13h2c2.8 0 5.2.7 7 2M12 7c1.8-1.3 4.2-2 7-2h2v13h-2c-2.8 0-5.2.7-7 2M12 7v13"
      />
    </svg>
  ),
} as const

type IconKey = keyof typeof ICONS

const DEFAULT_SUBJECTS: {
  title: string
  description: string
  icon: IconKey
}[] = [
  {
    title: 'Math',
    description:
      'From multiplication to multivariable calculus — built up step by step until it finally clicks.',
    icon: 'math',
  },
  {
    title: 'Science',
    description:
      'Biology, chemistry, and physics made hands-on, curious, and a whole lot less intimidating.',
    icon: 'science',
  },
  {
    title: 'Languages',
    description:
      'Spanish, French, and ESL with real conversation practice and confidence that carries into class.',
    icon: 'language',
  },
  {
    title: 'Test Prep',
    description:
      'SAT, ACT, and AP coaching with practice tests, pacing strategies, and steady score gains.',
    icon: 'testPrep',
  },
  {
    title: 'Writing',
    description:
      'Essays, applications, and reports — from blank page to polished draft with friendly feedback.',
    icon: 'writing',
  },
  {
    title: 'Reading',
    description:
      'Phonics, comprehension, and a love of books for early and reluctant readers alike.',
    icon: 'reading',
  },
]

export const TutoringServices = defineComponent({
  name: 'TutoringServices',
  description:
    'Subjects / services band for tutoring sites, composing the FeatureGrid kit composite into a four-column grid of subject cards. Each card pairs a friendly outline icon tile with a subject name and an encouraging description (Math, Science, Languages, Test Prep, Writing, Reading by default). Accepts a public `subjects` prop to override the offering list. Use it to show parents and students the breadth of tutoring help available in a warm, scannable layout.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    subjects: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          icon: z
            .enum([
              'math',
              'science',
              'language',
              'testPrep',
              'writing',
              'reading',
            ])
            .optional(),
        }),
      )
      .optional(),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Subjects we love to teach'
    const subheading =
      props.subheading ??
      "Whatever your learner needs, there's a patient expert ready to help them grow."
    const subjects = props.subjects?.length ? props.subjects : DEFAULT_SUBJECTS

    const features = subjects.map((s) => ({
      title: s.title,
      description: s.description,
      icon: s.icon ? ICONS[s.icon as IconKey] : ICONS.math,
    }))

    return (
      <section
        className={
          'bg-background py-20 sm:py-24' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <FeatureGrid
            heading={heading}
            subheading={subheading}
            features={features}
            columns={props.columns ?? 4}
          />
        </div>
      </section>
    )
  },
})
