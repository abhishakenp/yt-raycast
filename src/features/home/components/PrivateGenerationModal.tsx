import { cn } from '@/lib/utils'

export const PrivateGenerationModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => (
  <div
    className={cn(
      'fixed inset-0 z-[260] hidden items-center justify-center px-4',
      isOpen && 'flex',
    )}
    id="private-gen-modal"
    aria-hidden={!isOpen}
  >
    <div
      className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      id="private-gen-modal-backdrop"
      onClick={onClose}
    />
    <div
      className="relative z-[1] grid w-[min(420px,100%)] gap-4 rounded-[28px] border border-white/12 bg-[#10131c]/95 p-6 text-center text-white shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-[24px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="private-gen-modal-title"
    >
      <button
        className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/[0.1] hover:text-white"
        id="private-gen-modal-close"
        aria-label="Close"
        onClick={onClose}
      >
        <span>Close</span>
      </button>
      <div className="mx-auto grid size-16 place-items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h2
        className="m-0 font-sans text-2xl font-bold tracking-[-0.03em]"
        id="private-gen-modal-title"
      >
        Private Generation
      </h2>
      <p className="m-0 text-sm leading-relaxed text-white/65">
        Your generated site won't be publicly listed - only you can access it.
      </p>
      <p className="m-0 text-sm leading-relaxed text-white/65">
        This is a <strong>Pro plan</strong> feature.
      </p>
      <a
        href="/pricing"
        className="mx-auto inline-flex min-h-11 items-center justify-center rounded-full bg-cyan-300 px-5 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-px"
      >
        Upgrade to Pro
      </a>
    </div>
  </div>
)
