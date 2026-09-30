import { Link, useParams } from 'react-router'
import { ArrowLeft, CalendarDays, CheckCircle2, Circle, FileQuestion, Gavel, ListTodo, MessagesSquare, Users } from 'lucide-react'
import { getMeeting, meetingsFor } from '../../data'
import { Card, CardHeader, EmptyState, Person } from '../../components/ui'
import { Markdown } from '../../components/Markdown'
import { useProject } from './ProjectLayout'
import { cn, formatDate, daysSince } from '../../utils/format'

export default function MeetingDetail() {
  const project = useProject()
  const { meetingId = '' } = useParams()
  const meeting = getMeeting(project.id, meetingId)

  if (!meeting) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="Meeting not found"
        description={<>No file at <code className="font-mono">docs/projects/{project.id}/meetings/{meetingId}.md</code>.</>}
        action={<Link to=".." relative="path" className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Back to meetings</Link>}
      />
    )
  }

  const all = meetingsFor(project.id)
  const idx = all.findIndex((m) => m.slug === meeting.slug)
  const newer = all[idx - 1]
  const older = all[idx + 1]

  return (
    <div>
      <Link to=".." relative="path" className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
        <ArrowLeft className="size-4" /> All meeting notes
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6 sm:p-8">
            <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <CalendarDays className="size-3.5" /> {formatDate(meeting.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <h2 className="mb-6 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{meeting.title}</h2>
            <Markdown>{meeting.body}</Markdown>
          </Card>

          <div className="flex justify-between gap-4">
            {older ? (
              <Link to={`../${older.slug}`} relative="path" className="card flex-1 p-4 text-sm transition hover:border-slate-300 dark:hover:border-slate-700">
                <span className="text-xs text-slate-500">← Previous</span>
                <span className="block truncate font-medium text-slate-900 dark:text-white">{older.title}</span>
              </Link>
            ) : <span className="flex-1" />}
            {newer ? (
              <Link to={`../${newer.slug}`} relative="path" className="card flex-1 p-4 text-right text-sm transition hover:border-slate-300 dark:hover:border-slate-700">
                <span className="text-xs text-slate-500">Next →</span>
                <span className="block truncate font-medium text-slate-900 dark:text-white">{newer.title}</span>
              </Link>
            ) : <span className="flex-1" />}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Participants" icon={Users} />
            <ul className="space-y-3 p-5">
              {meeting.participants.map((p) => (
                <li key={p}><Person id={p} size="md" showRole /></li>
              ))}
            </ul>
          </Card>

          {meeting.decisions.length > 0 && (
            <Card>
              <CardHeader title={`Decisions (${meeting.decisions.length})`} icon={Gavel} />
              <ul className="space-y-2.5 p-5 text-sm text-slate-700 dark:text-slate-300">
                {meeting.decisions.map((d, i) => (
                  <li key={i} className="flex gap-2.5">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-indigo-500" /> {d}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {meeting.actionItems.length > 0 && (
            <Card>
              <CardHeader title="Action items" icon={ListTodo} />
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {meeting.actionItems.map((a, i) => {
                  const overdue = !a.done && /^\d{4}-\d{2}-\d{2}$/.test(a.deadline) && daysSince(a.deadline) > 0
                  return (
                    <li key={i} className="flex gap-3 px-5 py-3">
                      {a.done ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" /> : <Circle className="mt-0.5 size-4 shrink-0 text-slate-300 dark:text-slate-600" />}
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-sm', a.done ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-800 dark:text-slate-200')}>{a.action.replace(/`/g, '')}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          <Person id={a.owner} />
                          {a.deadline && (
                            <span className={cn(overdue && 'font-medium text-rose-600 dark:text-rose-400')}>
                              Due {/^\d{4}-\d{2}-\d{2}$/.test(a.deadline) ? formatDate(a.deadline) : a.deadline}
                              {overdue && ' · overdue'}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </Card>
          )}

          {meeting.topics.length > 0 && (
            <Card>
              <CardHeader title="Topics" icon={MessagesSquare} />
              <ul className="space-y-1.5 p-5 text-sm text-slate-600 dark:text-slate-400">
                {meeting.topics.map((t, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-slate-400" /> {t}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
