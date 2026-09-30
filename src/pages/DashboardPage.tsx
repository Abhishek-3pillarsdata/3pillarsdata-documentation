import { Link } from 'react-router'
import { Activity, AlertTriangle, CalendarDays, FolderKanban, ListTodo, Rocket, Workflow } from 'lucide-react'
import { getMember, getProject, issues, meetings, projects, tasks, updates } from '../data'
import { Card, CardHeader, CardLink, EmptyState, PageHeader, Person, PriorityBadge, ProgressBar, ProjectStatusBadge, StatCard, TaskStatusBadge } from '../components/ui'
import { ProjectCard } from '../components/ProjectCard'
import { UpdateTimeline } from '../components/UpdateTimeline'
import { TaskStatusBar } from '../components/TaskStatusBar'
import { formatDate, relativeDate } from '../utils/format'

const priorityRank = { critical: 0, high: 1, medium: 2, low: 3 }

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === 'active')
  const pending = tasks.filter((t) => t.status !== 'completed')
  const blocked = tasks.filter((t) => t.status === 'blocked')
  const openIssues = issues.filter((i) => i.status !== 'resolved')
  const avgProgress = projects.length ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length) : 0
  const lastUpdate = [...projects.map((p) => p.lastUpdated), ...updates.map((u) => u.date)].sort().at(-1)

  const topPending = pending.slice().sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || b.updatedDate.localeCompare(a.updatedDate)).slice(0, 6)

  if (!projects.length) {
    return (
      <>
        <PageHeader eyebrow="Dashboard" title="Engineering overview" />
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description={
            <>
              Add your team to <code className="font-mono">data/team.json</code> and your first project to{' '}
              <code className="font-mono">data/projects.json</code>, with its docs in{' '}
              <code className="font-mono">docs/projects/&lt;project-id&gt;/</code>. Templates are in{' '}
              <code className="font-mono">docs/_templates/</code>. The README explains each step.
            </>
          }
        />
      </>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Engineering overview"
        description={
          <>
            Status of all projects, generated from the documentation in this repository.
            {lastUpdate && <> Last update <span className="font-medium text-slate-700 dark:text-slate-300">{relativeDate(lastUpdate).toLowerCase()}</span> ({formatDate(lastUpdate)}).</>}
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total projects" value={projects.length} icon={FolderKanban} hint={`Average progress ${avgProgress}%`} to="/projects" />
        <StatCard label="Active projects" value={active.length} icon={Rocket} tone="emerald" hint={`${projects.length - active.length} planning / on hold / completed`} to="/projects" />
        <StatCard label="Pending tasks" value={pending.length} icon={ListTodo} tone="sky" hint={`${blocked.length} blocked · ${tasks.length - pending.length} completed`} to="/tasks" />
        <StatCard label="Open issues & blockers" value={openIssues.length} icon={AlertTriangle} tone="rose" hint={`${issues.length - openIssues.length} resolved`} to="/issues" />
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Projects</h2>
          <CardLink to="/projects">View all →</CardLink>
        </div>
        {projects.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <EmptyState icon={FolderKanban} title="No projects yet" description="Add a project to data/projects.json to get started." />
        )}
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <Workflow className="size-5 text-slate-400" /> Recent development updates
            </h2>
            <CardLink to="/updates">Full timeline →</CardLink>
          </div>
          <UpdateTimeline updates={updates.slice(0, 4)} showProject compact />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Task status" icon={Activity} action={<CardLink to="/tasks">Board →</CardLink>} />
            <div className="p-5">
              <TaskStatusBar tasks={tasks} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Recently updated" icon={FolderKanban} />
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {projects.slice(0, 5).map((p) => (
                <li key={p.id}>
                  <Link to={`/projects/${p.id}`} className="block px-5 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-slate-900 dark:text-white">{p.name}</span>
                      <ProjectStatusBadge status={p.status} />
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <ProgressBar value={p.progress} size="sm" />
                      <span className="w-20 shrink-0 text-right text-xs text-slate-500">{relativeDate(p.lastUpdated)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Recent meetings" icon={CalendarDays} action={<CardLink to="/meetings">All →</CardLink>} />
            {meetings.length ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {meetings.slice(0, 4).map((m) => (
                  <li key={m.projectId + m.slug}>
                    <Link to={`/projects/${m.projectId}/meetings/${m.slug}`} className="block px-5 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{m.title}</p>
                      <p className="text-xs text-slate-500">
                        {getProject(m.projectId)?.name} · {formatDate(m.date)} · {m.decisions.length} decisions
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-5 text-sm text-slate-500">No meetings recorded.</p>
            )}
          </Card>
        </div>
      </div>

      <Card className="mt-10">
        <CardHeader title="Pending tasks by priority" icon={ListTodo} action={<CardLink to="/tasks">All tasks →</CardLink>} />
        {topPending.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {topPending.map((t) => (
                  <tr key={t.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3">
                      <Link to={`/projects/${t.projectId}/tasks?task=${t.id}`} className="group">
                        <span className="mr-2 font-mono text-xs text-slate-500">{t.id}</span>
                        <span className="font-medium text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">{t.title}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{getProject(t.projectId)?.name}</td>
                    <td className="px-5 py-3"><TaskStatusBadge status={t.status} /></td>
                    <td className="px-5 py-3"><PriorityBadge priority={t.priority} /></td>
                    <td className="px-5 py-3" title={getMember(t.assignee).name}><Person id={t.assignee} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-5 text-sm text-slate-500">{tasks.length ? 'All tasks are completed.' : 'No tasks yet. Add them to data/tasks.json.'}</p>
        )}
      </Card>
    </>
  )
}
