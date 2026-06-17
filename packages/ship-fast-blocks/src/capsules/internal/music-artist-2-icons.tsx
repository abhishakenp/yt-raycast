export const accents = [
  'text-chart-1',
  'text-chart-2',
  'text-chart-3',
  'text-chart-4',
]

export const accentBgs = [
  'bg-chart-1',
  'bg-chart-2',
  'bg-chart-3',
  'bg-chart-4',
]

export const PlayIcon = () => (
  <svg
    className="ml-1 size-6"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M8 5v14l11-7z" />
  </svg>
)

export const ArrowRight = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 8l4 4m0 0l-4 4m4-4H3"
    />
  </svg>
)

export const SocialIcon = ({ label }: { label: string }) => (
  <svg
    className="size-6"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <path
      d="M8 13.5c2.5-.8 5-.5 7 .8"
      stroke="currentColor"
      strokeWidth="1.4"
      fill="none"
      strokeLinecap="round"
      opacity="0"
    />
    <title>{label}</title>
  </svg>
)
