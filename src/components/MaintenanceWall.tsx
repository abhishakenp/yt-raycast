import { useQuery } from 'convex/react'

import { api } from '../../convex/_generated/api'

export const MaintenanceWall = () => {
  const status = useQuery(api.maintenance.getStatus, {})

  if (status?.enabled !== true) return null

  return (
    <main
      aria-live="assertive"
      aria-label="Ship Fast maintenance"
      className="fixed inset-0 z-[100] grid min-h-screen place-items-center bg-[#06070d] px-6 text-center text-white"
    >
      <section className="max-w-lg space-y-6">
        <a
          href="/"
          aria-label="Ship Fast home"
          className="inline-flex items-center gap-3 text-xl font-black tracking-tight"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-white text-sm font-black text-[#06070d]">
            SF
          </span>
          Ship Fast
        </a>
        <div className="space-y-3">
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Sorry, back soon.
          </h1>
          <p className="text-base leading-7 text-white/70">
            We&apos;re making a few improvements. Follow us for updates.
          </p>
        </div>
        <nav
          aria-label="Maintenance updates"
          className="flex justify-center gap-3"
        >
          <a
            href="https://x.com"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold transition hover:border-white/50"
          >
            X / Twitter
          </a>
          <a
            href="https://www.linkedin.com"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold transition hover:border-white/50"
          >
            LinkedIn
          </a>
        </nav>
      </section>
    </main>
  )
}
