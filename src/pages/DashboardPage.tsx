import { Link } from 'react-router'
import { CalendarDays, FolderKanban, ListChecks, Rocket, Users } from 'lucide-react'
import { getProject, meetings, projects, tasks, team } from '../data'
import { Card, CardHeader, CardLink, EmptyState, PageHeader, Person, StatCard } from '../components/ui'
import { taskStatusIcon } from '../components/TaskBoard'
import { isOpen, taskColumns } from '../utils/tasks'
import { ProjectCard } from '../components/ProjectCard'
import { cn, formatDate } from '../utils/format'

export default function DashboardPage() {
  if (!projects.length) {
    return (
      <>
        <PageHeader eyebrow="Dashboard" title="Engineering overview" />
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description={
            <>
              Open a project folder in Claude Code and type <code className="font-mono">/add-this</code>. The project appears here
              after the next deploy.
            </>
          }
        />
      </>
    )
  }

  const active = projects.filter((p) => p.status === 'active')
  const open = tasks.filter(isOpen)
  const order = { 'in-progress': 0, blocked: 1, todo: 2, done: 3 }
  const shown = open.slice().sort((a, b) => order[a.status] - order[b.status]).slice(0, 8)
  const label = Object.fromEntries(taskColumns.map((c) => [c.status, c.label]))

  return (
    <>
      <PageHeader eyebrow="Dashboard" title="Engineering overview" description="Every project and its current status, generated from the documentation in this repository." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Projects" value={projects.length} icon={FolderKanban} to="/projects" />
        <StatCard label="Active" value={active.length} icon={Rocket} tone="emerald" to="/projects" />
        <StatCard
          label="Open tasks"
          value={open.length}
          icon={ListChecks}
          tone="amber"
          hint={`${open.filter((t) => t.status === 'blocked').length} blocked · ${tasks.length - open.length} done`}
          to="/tasks"
        />
        <StatCard label="Team members" value={team.length} icon={Users} tone="sky" to="/team" />
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Projects</h2>
          <CardLink to="/projects">View all →</CardLink>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </section>

      <Card className="mt-10">
        <CardHeader title="Tasks" icon={ListChecks} action={<CardLink to="/tasks">All tasks →</CardLink>} />
        {shown.length ? (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {shown.map((t, i) => {
              const { icon: Icon, cls } = taskStatusIcon[t.status]
              return (
                <li key={i}>
                  <Link to={`/projects/${t.projectId}/tasks`} className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <Icon className={cn('size-4 shrink-0', cls)} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">{t.title}</span>
                      <span className="block truncate text-xs text-slate-500">
                        {label[t.status]} · {getProject(t.projectId)?.name}
                        {t.note ? ` · ${t.note}` : ''}
                      </span>
                    </span>
                    {t.person && (
                      <span className="hidden shrink-0 sm:block">
                        <Person id={t.person} />
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="px-5 py-6 text-sm text-slate-500">
            {tasks.length ? 'All tasks are done.' : 'No tasks yet.'} Open a project&apos;s <span className="font-medium">Tasks</span> tab to add some, or type{' '}
            <code className="rounded bg-slate-100 px-1 font-mono text-xs dark:bg-slate-800">/add-this task: …</code> in Claude Code.
          </p>
        )}
        {open.length > shown.length && (
          <div className="border-t border-slate-100 px-5 py-2.5 text-xs text-slate-500 dark:border-slate-800">and {open.length - shown.length} more open tasks</div>
        )}
      </Card>

      {meetings.length > 0 && (
        <Card className="mt-6">
          <CardHeader title="Recent meeting notes" icon={CalendarDays} action={<CardLink to="/meetings">All →</CardLink>} />
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {meetings.slice(0, 5).map((m) => (
              <li key={m.projectId + m.slug}>
                <Link to={`/projects/${m.projectId}/meetings/${m.slug}`} className="flex items-center justify-between gap-4 px-5 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">{m.title}</span>
                    <span className="block text-xs text-slate-500">{getProject(m.projectId)?.name}</span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-500">{formatDate(m.date)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  )
}
