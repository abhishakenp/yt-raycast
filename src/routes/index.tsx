import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { useState, type FormEvent } from 'react'

const getRecentSessions = createServerFn({ method: 'GET' }).handler(async () => {
  const { createFilesystemSessionRepository } = await import(
    '../session-domain/filesystem-session-repository.js'
  )
  return createFilesystemSessionRepository().list().slice(0, 6)
})

const createStartGeneration = createServerFn({ method: 'POST' })
  .validator((data: { prompt?: string; preferredLanguage?: string; preferredExportTarget?: string; authToken?: string }) => ({
    prompt: data?.prompt || '',
    preferredLanguage: data?.preferredLanguage || 'en',
    preferredExportTarget: data?.preferredExportTarget || 'html',
    authToken: data?.authToken || '',
  }))
  .handler(async ({ data }) => {
    const { createShipfastGeneration } = await import('../start/create-session-request.js')
    const { resolveStartClerkUser } = await import('../session-domain/start-auth.js')
    return createShipfastGeneration(data, {
      resolveAuthUser: resolveStartClerkUser,
    })
  })

export const Route = createFileRoute('/')({
  loader: () => getRecentSessions(),
  component: StartHome,
})

function StartHome() {
  const sessions = Route.useLoaderData()
  const navigate = useNavigate()
  const createGeneration = useServerFn(createStartGeneration)
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  async function submitGeneration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsGenerating(true)
    try {
      const authToken = await getStartClerkToken()
      const result = await createGeneration({
        data: {
          prompt,
          preferredLanguage: 'en',
          preferredExportTarget: 'html',
          authToken,
        },
      })
      if (result.anonOwnerSecret && typeof window !== 'undefined') {
        window.localStorage.setItem(
          `ship-fast:anon-owner:${result.sessionId}`,
          result.anonOwnerSecret,
        )
      }
      await navigate({
        to: '/generate/$sessionId',
        params: { sessionId: result.sessionId },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="shell-main">
      <section className="hero-panel">
        <p className="eyebrow">Merged generator</p>
        <h1>Generate in the Shipnow workspace.</h1>
        <form className="generation-form" onSubmit={submitGeneration}>
          <label className="generation-label" htmlFor="start-generation-prompt">
            Website prompt
          </label>
          <textarea
            id="start-generation-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="A launch-ready site for a boutique bakery with warm photography, menu highlights, and online ordering"
            rows={7}
          />
          {error ? <p className="form-error">{error}</p> : null}
          <div className="hero-actions">
            <button className="primary-action" type="submit" disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate website'}
            </button>
          </div>
        </form>
        <div className="hero-actions secondary-row">
          {sessions[0] ? (
            <Link
              className="secondary-action"
              to="/generate/$sessionId"
              params={{ sessionId: sessions[0].id }}
            >
              Open latest workspace
            </Link>
          ) : null}
        </div>
      </section>

      <section className="sessions-panel" aria-labelledby="recent-sessions-title">
        <div className="panel-heading">
          <p className="eyebrow">Filesystem repository</p>
          <h2 id="recent-sessions-title">Recent sessions</h2>
        </div>
        <div className="session-grid">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <Link
                key={session.id}
                className="session-card"
                to="/generate/$sessionId"
                params={{ sessionId: session.id }}
              >
                <span className="session-id">{session.id}</span>
                <strong>{session.prompt || 'Untitled generation'}</strong>
                <span className="session-meta">
                  {session.done}/{session.taskCount} tasks · {session.openuiReady ? 'OpenUI ready' : 'Drafting'}
                </span>
              </Link>
            ))
          ) : (
            <p className="empty-state">
              No local sessions found yet.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}

async function getStartClerkToken() {
  const clerk = typeof window !== 'undefined' ? (window as any).Clerk : null
  if (!clerk?.session) return ''
  try {
    return (await clerk.session.getToken()) || ''
  } catch {
    return ''
  }
}
