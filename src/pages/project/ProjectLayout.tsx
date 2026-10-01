import { Suspense } from 'react'
import { Link, NavLink, Outlet, useOutletContext, useParams } from 'react-router'
import { ChevronRight, ExternalLink, FolderX } from 'lucide-react'
import type { Project } from '../../types'
import { getProject, meetingsFor, tasksFor } from '../../data'
import { isOpen } from '../../utils/tasks'
import { EmptyState, PageSkeleton, Person, ProjectStatusBadge } from '../../components/ui'
import { cn } from '../../utils/format'

export const useProject = () => useOutletContext<Project>()

export default function ProjectLayout() {
  const { projectId = '' } = useParams()
  const project = getProject(projectId)

  if (!project) {
    return (
      <EmptyState
        icon={FolderX}
        title="Project not found"
        description={<>No project with id <code className="font-mono">{projectId}</code> exists in data/projects.json.</>}
        action={<Link to="/projects" className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Back to projects</Link>}
      />
    )
  }

  const tabs = [
    { to: '', label: 'Overview', end: true },
    { to: 'architecture', label: 'Architecture' },
    { to: 'technical', label: 'Technical docs' },
    { to: 'tasks', label: 'Tasks', count: tasksFor(project.id).filter(isOpen).length },
    { to: 'meetings', label: 'Meeting notes', count: meetingsFor(project.id).length },
  ]

  return (
    <>
      <nav className="mb-4 flex items-center gap-1 text-xs text-slate-500" aria-label="Breadcrumb">
        <Link to="/projects" className="hover:text-slate-900 dark:hover:text-white">Projects</Link>
        <ChevronRight className="size-3" />
        <span className="font-medium text-slate-700 dark:text-slate-300">{project.name}</span>
      </nav>

      <div className="card overflow-hidden">
        <div className="relative p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/[0.07] via-transparent to-violet-500/[0.07]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-3xl">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-slate-900 px-2 py-0.5 font-mono text-[11px] font-semibold text-white dark:bg-white dark:text-slate-900">{project.key}</span>
                <ProjectStatusBadge status={project.status} />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">{project.name}</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{project.description}</p>
            </div>
            <dl className="flex shrink-0 flex-col gap-4 text-sm lg:w-64">
              <div>
                <dt className="mb-1 text-xs font-medium text-slate-500">Developer</dt>
                <dd><Person id={project.owner} showRole /></dd>
              </div>
              {project.repository && (
                <div>
                  <dt className="mb-1 text-xs font-medium text-slate-500">Repository</dt>
                  <dd>
                    <a href={project.repository.replace(/\.git$/, '')} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                      Open on GitHub <ExternalLink className="size-3" />
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-slate-200 px-4 dark:border-slate-800" aria-label="Project sections">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                cn(
                  'focus-ring -mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition',
                  isActive
                    ? 'border-indigo-600 text-indigo-700 dark:border-indigo-400 dark:text-indigo-300'
                    : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
                )
              }
            >
              {t.label}
              {!!t.count && (
                <span className="rounded-full bg-slate-100 px-1.5 text-[11px] font-semibold tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-400">{t.count}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-8">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet context={project} />
        </Suspense>
      </div>
    </>
  )
}
