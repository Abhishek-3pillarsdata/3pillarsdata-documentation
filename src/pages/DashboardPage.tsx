import { Link } from 'react-router'
import { CalendarDays, FolderKanban, Rocket, Users } from 'lucide-react'
import { getProject, meetings, projects, team } from '../data'
import { Card, CardHeader, CardLink, EmptyState, PageHeader, StatCard } from '../components/ui'
import { ProjectCard } from '../components/ProjectCard'
import { formatDate } from '../utils/format'

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

  return (
    <>
      <PageHeader eyebrow="Dashboard" title="Engineering overview" description="Every project and its current status, generated from the documentation in this repository." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Projects" value={projects.length} icon={FolderKanban} to="/projects" />
        <StatCard label="Active" value={active.length} icon={Rocket} tone="emerald" to="/projects" />
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

      {meetings.length > 0 && (
        <Card className="mt-10">
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
