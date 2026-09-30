import { Link } from 'react-router'
import { ArrowUpRight, CalendarClock, CheckCircle2, CircleDot } from 'lucide-react'
import type { Project } from '../types'
import { tasksFor } from '../data'
import { Person, ProgressBar, ProjectStatusBadge } from './ui'
import { relativeDate } from '../utils/format'

export function ProjectCard({ project }: { project: Project }) {
  const tasks = tasksFor(project.id)
  const done = tasks.filter((t) => t.status === 'completed').length
  const open = tasks.length - done

  return (
    <Link
      to={`/projects/${project.id}`}
      className="card focus-ring group flex flex-col p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:hover:border-slate-700"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-600 text-xs font-bold tracking-wide text-white dark:from-slate-700 dark:to-slate-600">
            {project.key.slice(0, 2)}
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-slate-900 dark:text-white">{project.name}</h3>
            <p className="font-mono text-[11px] text-slate-500">{project.key}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ProjectStatusBadge status={project.status} />
          <ArrowUpRight className="size-4 text-slate-300 transition group-hover:text-indigo-500 dark:text-slate-600" />
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{project.description}</p>

      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600 dark:text-slate-400">Progress</span>
          <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <Person id={project.owner} />
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1" title="Open tasks">
            <CircleDot className="size-3.5" /> {open}
          </span>
          <span className="inline-flex items-center gap-1" title="Completed tasks">
            <CheckCircle2 className="size-3.5" /> {done}
          </span>
          <span className="inline-flex items-center gap-1" title="Last updated">
            <CalendarClock className="size-3.5" /> {relativeDate(project.lastUpdated)}
          </span>
        </div>
      </div>
    </Link>
  )
}
