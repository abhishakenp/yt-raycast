export const PreviewErrorPage = () => (
  <main className="fixed inset-0 flex items-center justify-center bg-zinc-950">
    <div className="flex flex-col items-center gap-6 px-6 text-center">
      <img
        src="/favicon-dark-256x256.png"
        alt="Ship Fast"
        className="h-16 w-16"
      />
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-zinc-100">
          This site is not available right now
        </h1>
        <p className="max-w-md text-sm text-zinc-400">
          The preview you are looking for may have been removed, is still being
          generated, or is temporarily unavailable.
        </p>
      </div>
      <div className="flex items-center gap-4 pt-2">
        <a
          href="https://ship-fast.ai"
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700"
        >
          Ship Fast
        </a>
        <a
          href="https://x.com/shipfastai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          X / Twitter
        </a>
        <a
          href="https://linkedin.com/company/shipfastai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          LinkedIn
        </a>
      </div>
      <p className="text-xs text-zinc-600">Built with Ship Fast</p>
    </div>
  </main>
)
