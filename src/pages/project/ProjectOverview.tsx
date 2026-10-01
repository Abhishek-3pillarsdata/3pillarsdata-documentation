import { Link } from 'react-router'
import { CalendarDays, Cpu, FileText, Target } from 'lucide-react'
import { getDoc, meetingsFor } from '../../data'
import { Card, CardHeader, CardLink, EmptyState } from '../../components/ui'
import { Markdown } from '../../components/Markdown'
import { useProject } from './ProjectLayout'
import { formatDate } from '../../utils/format'

export default function ProjectOverview() {
  const project = useProject()
  const doc = getDoc(project.id, 'overview')
  const meetings = meetingsFor(project.id)

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {project.objectives?.length ? (
          <Card>
            <CardHeader title="Objectives" icon={Target} />
            <ul className="grid gap-3 p-5 sm:grid-cols-2">
              {project.objectives.map((o, i) => (
                <li key={i} className="flex gap-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800/40 dark:text-slate-300">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">{i + 1}</span>
                  {o}
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <Card className="p-6 sm:p-8">
          {doc ? (
            <Markdown>{doc.body}</Markdown>
          ) : (
            <EmptyState icon={FileText} title="No overview written yet" description={<>Create <code className="font-mono">docs/projects/{project.id}/overview.md</code>.</>} />
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader title="Technology stack" icon={Cpu} />
          <div className="flex flex-wrap gap-2 p-5">
            {project.techStack.map((t) => (
              <span key={t} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {t}
              </span>
            ))}
          </div>
        </Card>

        {meetings.length > 0 && (
          <Card>
            <CardHeader title="Meeting notes" icon={CalendarDays} action={<CardLink to="meetings">All →</CardLink>} />
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {meetings.slice(0, 4).map((m) => (
                <li key={m.slug}>
                  <Link to={`meetings/${m.slug}`} className="block px-5 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{m.title}</p>
                    <p className="text-xs text-slate-500">{formatDate(m.date)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  )
}
