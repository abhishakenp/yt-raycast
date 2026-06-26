import { Activity, AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react'

type ActivityTask = {
  _id?: string
  taskKey?: string
  title?: string
  status?: string
  order?: number
  updatedAt?: number
}

type ActivityEvent = {
  _id?: string
  eventType?: string
  message?: string
  previewVersion?: number
  createdAt?: number
  elapsedMs?: number
  cost?: number
  provider?: string
  error?: string
  quotaHit?: boolean
  cacheHit?: boolean
}

type ActivityPanelProps = {
  status?: string
  elapsed?: number | null
  cost?: number | null
  tasks?: ActivityTask[]
  events?: ActivityEvent[]
}

const formatTime = (value: number | undefined): string => {
  if (value === undefined) return ''
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(value))
  } catch {
    return ''
  }
}

const statusIcon = (status: string | undefined) => {
  if (status === 'succeeded' || status === 'DONE')
    return <CheckCircle2 className="size-4 text-emerald-300" />
  if (status === 'failed' || status === 'FAILED')
    return <AlertTriangle className="size-4 text-rose-300" />
  return <Clock3 className="size-4 text-cyan-200" />
}

export const ActivityPanel = ({
  status,
  elapsed,
  cost,
  tasks = [],
  events = [],
}: ActivityPanelProps) => {
  const recentEvents = [...events].reverse().slice(0, 40)

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <Activity className="size-4 text-cyan-200" />
        <div>
          <h2 className="m-0 text-sm font-semibold uppercase tracking-[0.1em] text-white">
            Activity
          </h2>
          <p className="m-0 mt-1 text-xs leading-5 text-white/48">
            Persisted generation tasks, logs, and operational events.
          </p>
        </div>
      </div>

      <section className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
          <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-white/38">
            Status
          </p>
          <p className="m-0 mt-2 truncate text-sm font-semibold text-white">
            {status?.replaceAll('_', ' ') ?? 'loading'}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
          <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-white/38">
            Elapsed
          </p>
          <p className="m-0 mt-2 truncate text-sm font-semibold text-white">
            {elapsed ?? 0} ms
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
          <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-white/38">
            Cost
          </p>
          <p className="m-0 mt-2 truncate text-sm font-semibold text-white">
            ${(cost ?? 0).toFixed(4)}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="m-0 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-white/42">
            Tasks
          </p>
          <p className="m-0 font-mono text-[0.68rem] text-white/34">
            {tasks.length}
          </p>
        </div>
        <div className="grid gap-2">
          {tasks.map((task) => (
            <div
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 p-2"
              key={task._id ?? task.taskKey ?? task.title}
            >
              {statusIcon(task.status)}
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate text-sm text-white/76">
                  {task.title ?? task.taskKey ?? 'Task'}
                </p>
                <p className="m-0 mt-0.5 font-mono text-[0.66rem] uppercase tracking-[0.08em] text-white/34">
                  {task.status ?? 'pending'}
                </p>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="m-0 py-4 text-center text-sm italic text-white/38">
              No tasks recorded.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="m-0 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-white/42">
            Events
          </p>
          <p className="m-0 font-mono text-[0.68rem] text-white/34">
            {events.length}
          </p>
        </div>
        <div className="grid max-h-80 gap-2 overflow-y-auto">
          {recentEvents.map((event) => (
            <div
              className="rounded-xl border border-white/10 bg-black/20 p-2"
              key={
                event._id ??
                `${event.createdAt}-${event.eventType}-${event.message}`
              }
            >
              <div className="flex items-center justify-between gap-2">
                <p className="m-0 truncate font-mono text-[0.68rem] uppercase tracking-[0.08em] text-cyan-100">
                  {event.eventType ?? 'event'}
                </p>
                <p className="m-0 shrink-0 font-mono text-[0.66rem] text-white/32">
                  {formatTime(event.createdAt)}
                </p>
              </div>
              {event.message && (
                <p className="m-0 mt-1 text-sm leading-5 text-white/68">
                  {event.message}
                </p>
              )}
              {(event.provider ||
                event.elapsedMs !== undefined ||
                event.previewVersion !== undefined) && (
                <p className="m-0 mt-1 font-mono text-[0.66rem] uppercase tracking-[0.08em] text-white/34">
                  {event.provider ? `${event.provider} ` : ''}
                  {event.previewVersion !== undefined
                    ? `v${event.previewVersion} `
                    : ''}
                  {event.elapsedMs !== undefined ? `${event.elapsedMs}ms` : ''}
                </p>
              )}
            </div>
          ))}
          {recentEvents.length === 0 && (
            <p className="m-0 py-4 text-center text-sm italic text-white/38">
              No events recorded.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
