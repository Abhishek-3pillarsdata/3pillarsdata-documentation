import { Link } from 'react-router'
import { CalendarDays, CheckCircle2, ChevronRight, Gavel, ListTodo } from 'lucide-react'
import type { Meeting } from '../types'
import { getProject } from '../data'
import { AvatarStack, Badge, EmptyState } from './ui'
import { formatDate, parseDate, relativeDate } from '../utils/format'

export function MeetingList({ meetings, showProject }: { meetings: Meeting[]; showProject?: boolean }) {
  if (!meetings.length) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No meeting notes yet"
        description={<>Add a Markdown file such as <code className="font-mono">docs/projects/&lt;id&gt;/meetings/YYYY-MM-DD.md</code>.</>}
      />
    )
  }
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {meetings.map((m) => {
        const project = getProject(m.projectId)
        const open = m.actionItems.filter((a) => !a.done).length
        const d = parseDate(m.date)
        return (
          <Link
            key={m.projectId + m.slug}
            to={`/projects/${m.projectId}/meetings/${m.slug}`}
            className="card focus-ring group flex gap-4 p-5 transition hover:border-slate-300 hover:shadow-sm dark:hover:border-slate-700"
          >
            <div className="flex w-14 shrink-0 flex-col items-center justify-center self-start overflow-hidden rounded-lg border border-slate-200 text-center dark:border-slate-700">
              <span className="w-full bg-indigo-600 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                {d.toLocaleDateString('en-US', { month: 'short' })}
              </span>
              <span className="py-1 text-xl font-semibold tabular-nums text-slate-900 dark:text-white">{d.getDate()}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-slate-900 dark:text-white">{m.title}</h3>
                  <p className="text-xs text-slate-500">
                    {formatDate(m.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · {relativeDate(m.date)}
                  </p>
                </div>
                <ChevronRight className="mt-1 size-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500" />
              </div>
              {m.decisions[0] && (
                <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                  <Gavel className="mr-1.5 inline size-3.5 text-slate-400" />
                  {m.decisions[0]}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <AvatarStack ids={m.participants} />
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Gavel className="size-3.5" /> {m.decisions.length}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  {open ? <ListTodo className="size-3.5" /> : <CheckCircle2 className="size-3.5 text-emerald-500" />}
                  {open ? `${open} open` : 'All done'}
                </span>
                {showProject && project && <Badge tone="indigo" className="ml-auto">{project.name}</Badge>}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
