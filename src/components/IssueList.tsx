import { Link } from 'react-router'
import { AlertOctagon, CheckCircle2, ShieldCheck } from 'lucide-react'
import type { Issue } from '../types'
import { getProject } from '../data'
import { Badge, EmptyState, IssueStatusBadge, Person, PriorityBadge } from './ui'
import { cn, formatDate, relativeDate } from '../utils/format'

export function IssueList({ issues, showProject }: { issues: Issue[]; showProject?: boolean }) {
  if (!issues.length) {
    return <EmptyState icon={ShieldCheck} title="No issues or blockers" description="Nothing is blocking this work. Issues are tracked in data/issues.json." />
  }

  const order = { open: 0, investigating: 1, resolved: 2 }
  const sorted = issues.slice().sort((a, b) => order[a.status] - order[b.status] || b.updatedDate.localeCompare(a.updatedDate))

  return (
    <div className="space-y-3">
      {sorted.map((i) => {
        const project = getProject(i.projectId)
        const resolved = i.status === 'resolved'
        return (
          <article
            key={i.id}
            className={cn(
              'card border-l-4 p-5',
              resolved ? 'border-l-emerald-500' : i.severity === 'critical' || i.severity === 'high' ? 'border-l-rose-500' : 'border-l-amber-500',
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-500">{i.id}</span>
                  {showProject && project && (
                    <Link to={`/projects/${project.id}/issues`}>
                      <Badge tone="indigo">{project.name}</Badge>
                    </Link>
                  )}
                </div>
                <h3 className={cn('flex items-center gap-2 font-semibold', resolved ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white')}>
                  {resolved ? <CheckCircle2 className="size-4 text-emerald-500" /> : <AlertOctagon className="size-4 text-rose-500" />}
                  {i.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={i.severity} />
                <IssueStatusBadge status={i.status} />
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{i.description}</p>
            {i.resolution && (
              <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200">
                <span className="font-semibold">Resolution: </span>
                {i.resolution}
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
              <Person id={i.reportedBy} />
              <span>Opened {formatDate(i.createdDate)}</span>
              <span>Updated {relativeDate(i.updatedDate)}</span>
              {i.relatedTasks?.map((t) => (
                <Link key={t} to={`/projects/${i.projectId}/tasks?task=${t}`}>
                  <Badge className="font-mono">{t}</Badge>
                </Link>
              ))}
            </div>
          </article>
        )
      })}
    </div>
  )
}
