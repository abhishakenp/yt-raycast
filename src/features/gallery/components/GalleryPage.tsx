import { Link } from '@tanstack/react-router'
import { ArrowLeft, Sparkles } from 'lucide-react'

import { useGalleryController } from '../hooks/useGalleryController'

export const GalleryPage = () => {
  const { sessions } = useGalleryController(20)

  return (
    <main className="min-h-screen bg-[#030511] text-slate-100">
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div className="flex items-center gap-3">
            <Link
              className="grid size-9 place-items-center rounded-[8px] border border-white/10 bg-white/[0.06] text-slate-200"
              to="/"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-cyan-200">Gallery</p>
              <h1 className="text-lg font-bold tracking-normal">Public Sessions</h1>
            </div>
          </div>
        </header>

        <section className="p-6">
          <div className="mx-auto max-w-6xl">
            {sessions && sessions.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sessions.map((session: any) => (
                  <Link
                    className="block rounded-[8px] border border-white/10 bg-white/[0.06] p-4 transition-colors hover:border-cyan-200/50 hover:bg-white/[0.08]"
                    key={session.sessionId}
                    to="/generate/$sessionId"
                    params={{ sessionId: session.sessionId }}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <Sparkles className="size-4 text-cyan-200" />
                      <span className="text-xs font-semibold uppercase text-slate-400">{session.status}</span>
                    </div>
                    <p className="mb-2 line-clamp-2 text-sm text-slate-200">{session.prompt}</p>
                    <p className="text-xs text-slate-500">v{session.previewVersion}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[50vh] items-center justify-center">
                <p className="text-slate-400">No public sessions yet. Generate one to see it here!</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
