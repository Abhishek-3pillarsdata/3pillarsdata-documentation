import { Suspense } from 'react'
import { Link, NavLink, Outlet, useOutletContext, useParams } from 'react-router'
import { CalendarClock, ChevronRight, ExternalLink, FolderX, Target } from 'lucide-react'
import type { Project } from '../../types'
import { changelogFor, getProject, issuesFor, meetingsFor, tasksFor, updatesFor } from '../../data'
import { EmptyState, PageSkeleton, Person, ProgressBar, ProjectStatusBadge } from '../../components/ui'
import { cn, formatDate, relativeDate } from '../../utils/format'

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

  const openIssues = issuesFor(project.id).filter((i) => i.status !== 'resolved').length
  const tabs = [
    { to: '', label: 'Overview', end: true },
    { to: 'architecture', label: 'Architecture' },
    { to: 'technical', label: 'Technical docs' },
    { to: 'tasks', label: 'Tasks', count: tasksFor(project.id).filter((t) => t.status !== 'completed').length },
    { to: 'meetings', label: 'Meeting notes', count: meetingsFor(project.id).length },
    { to: 'updates', label: 'Dev updates', count: updatesFor(project.id).length },
    { to: 'changelog', label: 'Changelog', count: changelogFor(project.id).length },
    { to: 'issues', label: 'Issues / Blockers', count: openIssues, alert: openIssues > 0 },
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
              {project.repository && (
                <a href={project.repository} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                  Repository <ExternalLink className="size-3" />
                </a>
              )}
            </div>
            <dl className="grid shrink-0 grid-cols-2 gap-x-8 gap-y-4 text-sm lg:w-80">
              <div className="col-span-2">
                <dt className="mb-1.5 flex justify-between text-xs font-medium text-slate-500">
                  Progress <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{project.progress}%</span>
                </dt>
                <dd><ProgressBar value={project.progress} /></dd>
              </div>
              <div>
                <dt className="mb-1 text-xs font-medium text-slate-500">Developer</dt>
                <dd><Person id={project.owner} /></dd>
              </div>
              <div>
                <dt className="mb-1 text-xs font-medium text-slate-500">Last updated</dt>
                <dd className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200" title={formatDate(project.lastUpdated)}>
                  <CalendarClock className="size-4 text-slate-400" /> {relativeDate(project.lastUpdated)}
                </dd>
              </div>
              {project.targetDate && (
                <div className="col-span-2">
                  <dt className="mb-1 text-xs font-medium text-slate-500">Target date</dt>
                  <dd className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                    <Target className="size-4 text-slate-400" /> {formatDate(project.targetDate)}
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
                <span
                  className={cn(
                    'rounded-full px-1.5 text-[11px] font-semibold tabular-nums',
                    t.alert ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                  )}
                >
                  {t.count}
                </span>
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
