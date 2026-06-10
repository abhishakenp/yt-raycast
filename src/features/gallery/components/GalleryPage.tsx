import { Link } from '@tanstack/react-router'
import { ArrowLeft, Sparkles } from 'lucide-react'

import { useGalleryController } from '../hooks/useGalleryController'

type GallerySession = {
  sessionId: string
  prompt?: string
  status?: string
  previewVersion?: number
  createdAt?: number
  elapsed?: number
}

const getPreviewWords = (prompt?: string) =>
  (prompt ?? 'Generated website')
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 7)

const StaticPreview = ({ session }: { session: GallerySession }) => {
  const words = getPreviewWords(session.prompt)
  const title = words.slice(0, 3).join(' ') || 'Generated site'

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-t-[8px] border-b border-white/10 bg-[#050816]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(34,211,238,0.22),transparent_32%),radial-gradient(circle_at_78%_22%,rgba(168,85,247,0.24),transparent_36%),linear-gradient(135deg,#050816_0%,#0f172a_58%,#111827_100%)]" />
      <div className="absolute inset-x-5 top-4 flex items-center justify-between gap-3">
        <div className="h-2 w-24 rounded-full bg-white/18" />
        <div className="flex gap-1.5">
          <span className="size-2 rounded-full bg-cyan-300/70" />
          <span className="size-2 rounded-full bg-violet-300/70" />
          <span className="size-2 rounded-full bg-white/40" />
        </div>
      </div>
      <div className="absolute left-5 top-12 max-w-[70%]">
        <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-200/75">
          {session.status?.replaceAll('_', ' ') ?? 'ready'}
        </p>
        <h2 className="line-clamp-2 text-xl font-bold leading-tight tracking-normal text-white">{title}</h2>
      </div>
      <div className="absolute bottom-4 left-5 right-5 grid grid-cols-3 gap-2">
        {words.slice(3, 6).map((word) => (
          <span key={word} className="h-8 rounded-md border border-white/10 bg-white/[0.06] px-2 py-2 text-[10px] text-white/60">
            {word}
          </span>
        ))}
      </div>
    </div>
  )
}

export const GalleryPage = () => {
  const { sessions } = useGalleryController(48)

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
                {(sessions as GallerySession[]).map((session) => (
                  <Link
                    className="block overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.06] transition-colors hover:border-cyan-200/50 hover:bg-white/[0.08]"
                    key={session.sessionId}
                    to="/generate/$sessionId"
                    params={{ sessionId: session.sessionId }}
                  >
                    <StaticPreview session={session} />
                    <div className="p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Sparkles className="size-4 text-cyan-200" />
                        <span className="text-xs font-semibold uppercase text-slate-400">
                          {session.status?.replaceAll('_', ' ') ?? 'ready'}
                        </span>
                        {typeof session.elapsed === 'number' ? (
                          <span className="ml-auto text-xs text-slate-500">{Math.round(session.elapsed)}s</span>
                        ) : null}
                      </div>
                      <p className="mb-2 line-clamp-2 text-sm text-slate-200">{session.prompt}</p>
                      <p className="text-xs text-slate-500">v{session.previewVersion ?? 0}</p>
                    </div>
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
