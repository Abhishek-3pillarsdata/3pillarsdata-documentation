import { Link } from 'react-router'
import { AlertCircle, ArrowRight, FileCode2, Lightbulb, ListChecks, Wrench } from 'lucide-react'
import type { DevelopmentUpdate } from '../types'
import { getMember, getProject } from '../data'
import { Avatar, Badge, EmptyState } from './ui'
import { formatDate, relativeDate } from '../utils/format'

function Block({ icon: Icon, title, items, tone, mono }: { icon: typeof Wrench; title: string; items: string[]; tone: string; mono?: boolean }) {
  if (!items.length) return null
  return (
    <div>
      <h4 className={`mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${tone}`}>
        <Icon className="size-3.5" /> {title}
      </h4>
      {mono ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((f) => (
            <code key={f} className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {f}
            </code>
          ))}
        </div>
      ) : (
        <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
          {items.map((c, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-slate-400" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function UpdateTimeline({ updates, showProject, compact }: { updates: DevelopmentUpdate[]; showProject?: boolean; compact?: boolean }) {
  if (!updates.length) {
    return <EmptyState icon={ListChecks} title="No development updates yet" description="Session entries are added to data/updates.json after each development session." />
  }

  return (
    <ol className="relative space-y-6 before:absolute before:inset-y-2 before:left-[15px] before:w-px before:bg-slate-200 dark:before:bg-slate-800">
      {updates.map((u) => {
        const project = getProject(u.projectId)
        return (
          <li key={u.id} className="relative pl-12">
            <span className="absolute left-0 top-0">
              <Avatar id={u.developer} ring />
            </span>
            <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <span className="font-semibold text-slate-900 dark:text-white">{getMember(u.developer).name}</span>
              <span className="text-slate-400">·</span>
              <time className="text-slate-500" title={formatDate(u.date)}>
                {formatDate(u.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </time>
              <span className="text-xs text-slate-400">({relativeDate(u.date)})</span>
              {showProject && project && (
                <Link to={`/projects/${project.id}/updates`}>
                  <Badge tone="indigo">{project.name}</Badge>
                </Link>
              )}
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white">{u.summary}</h3>
              {u.relatedTasks?.length ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {u.relatedTasks.map((id) => (
                    <Link key={id} to={`/projects/${u.projectId}/tasks?task=${id}`}>
                      <Badge tone="slate" className="font-mono hover:ring-indigo-400">{id}</Badge>
                    </Link>
                  ))}
                </div>
              ) : null}
              {compact ? (
                <ul className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  {u.changes.slice(0, 3).map((c, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-slate-400" />
                      {c}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 grid gap-5 md:grid-cols-2">
                  <Block icon={Wrench} title="Changes made" items={u.changes} tone="text-indigo-600 dark:text-indigo-400" />
                  <Block icon={FileCode2} title="Files / modules affected" items={u.filesAffected} tone="text-slate-500" mono />
                  <Block icon={AlertCircle} title="Problems encountered" items={u.problems} tone="text-rose-600 dark:text-rose-400" />
                  <Block icon={Lightbulb} title="Solution" items={u.solutions} tone="text-emerald-600 dark:text-emerald-400" />
                  <div className="md:col-span-2">
                    <Block icon={ArrowRight} title="Next steps" items={u.nextSteps} tone="text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
