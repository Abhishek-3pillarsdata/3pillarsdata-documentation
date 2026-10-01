import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import type { Project } from '../types'
import { statusSummary } from '../data'
import { Person, ProjectStatusBadge } from './ui'

export function ProjectCard({ project }: { project: Project }) {
  const summary = statusSummary(project.id)
  const stack = project.techStack.slice(0, 4)
  const more = project.techStack.length - stack.length

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

      {summary && (
        <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2.5 dark:bg-slate-800/40">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Current status</p>
          <p className="mt-1 line-clamp-3 text-sm text-slate-700 dark:text-slate-300">{summary}</p>
        </div>
      )}

      <div className="flex-1" />
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <Person id={project.owner} />
        <div className="flex flex-wrap gap-1.5">
          {stack.map((t) => (
            <span key={t} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {t}
            </span>
          ))}
          {more > 0 && <span className="px-1 text-[11px] font-medium text-slate-400">+{more}</span>}
        </div>
      </div>
    </Link>
  )
}
