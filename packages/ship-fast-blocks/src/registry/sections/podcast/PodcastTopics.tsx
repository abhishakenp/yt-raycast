import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'

const DotWave = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M4 12v0" />
    <path d="M8 9v6" />
    <path d="M12 5v14" />
    <path d="M16 8v8" />
    <path d="M20 11v2" />
  </svg>
)

const Headphones = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
    <path d="M4 14a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1Z" />
    <path d="M20 14a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2 1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1Z" />
  </svg>
)

const Sparkle = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 3v4" />
    <path d="M12 17v4" />
    <path d="M3 12h4" />
    <path d="M17 12h4" />
    <path d="M12 8a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4Z" />
  </svg>
)

const Mic = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M6 11a6 6 0 0 0 12 0" />
    <path d="M12 17v4" />
    <path d="M8 21h8" />
  </svg>
)

const Chat = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
    <path d="M8 10h8" />
    <path d="M8 13h5" />
  </svg>
)

const Music = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M9 18V6l11-2v12" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="17" cy="16" r="3" />
  </svg>
)

const ICONS = [DotWave, Music, Sparkle, Mic, Headphones, Chat]

export const PodcastTopics = defineCapsule({
  name: 'PodcastTopics',
  description:
    "A responsive feature grid of the Signal & Static podcast's recurring topics and themes, built on FeatureGrid. Each card pairs a small token-styled icon tile with a topic title and a one-line description of what that thread covers. Use it to show, at a glance, what an audio show keeps returning to episode after episode.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    topics: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'What we talk about'
    const subheading =
      props.subheading ??
      'Six threads we keep pulling on, episode after episode.'
    const topics = props.topics?.length
      ? props.topics
      : [
          {
            title: 'Sound Design',
            description:
              'How texture, room tone, and silence quietly shape what a scene feels like.',
          },
          {
            title: 'Music & Scoring',
            description:
              'Score cues, needle drops, and the warm low end that carries an episode.',
          },
          {
            title: 'Storytelling Craft',
            description:
              'Structure, pacing, and the small turns that keep a listener leaning in.',
          },
          {
            title: 'Behind the Mic',
            description:
              'Honest field notes on gear, takes, and the long road to a final cut.',
          },
          {
            title: 'Interviews',
            description:
              'Long, unhurried conversations with the makers behind the sounds we love.',
          },
          {
            title: 'Listener Mailbag',
            description:
              'Your questions, hot takes, and voice memos, answered on the air.',
          },
        ]
    const features = topics.map((t, i) => {
      const Icon = ICONS[i % ICONS.length]
      return {
        title: t.title,
        description: t.description,
        icon: <Icon className="size-5" />,
      }
    })
    return (
      <FeatureGrid
        heading={heading}
        subheading={subheading}
        features={features}
        columns={3}
        className={props.className}
      />
    )
  },
})
