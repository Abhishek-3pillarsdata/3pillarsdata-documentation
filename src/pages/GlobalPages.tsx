import { useState } from 'react'
import { Link } from 'react-router'
import { Compass, ExternalLink } from 'lucide-react'
import { editTasksUrl, meetings, projects, tasks } from '../data'
import { EmptyState, PageHeader, Select } from '../components/ui'
import { MeetingList } from '../components/MeetingList'
import { TaskBoard, TaskHelp } from '../components/TaskBoard'

export function MeetingsPage() {
  const [project, setProject] = useState('all')
  const filtered = meetings.filter((m) => project === 'all' || m.projectId === project)
  const decisions = filtered.reduce((n, m) => n + m.decisions.length, 0)
  const openActions = filtered.reduce((n, m) => n + m.actionItems.filter((a) => !a.done).length, 0)
  return (
    <>
      <PageHeader
        eyebrow="Meeting notes"
        title="Meetings & decisions"
        description={`${filtered.length} meetings · ${decisions} decisions recorded · ${openActions} open action items`}
        actions={<ProjectFilter value={project} onChange={setProject} />}
      />
      <MeetingList meetings={filtered} showProject={project === 'all'} />
    </>
  )
}

function ProjectFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  if (projects.length < 2) return null
  return (
    <Select label="Filter by project" value={value} onChange={onChange}>
      <option value="all">All projects</option>
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </Select>
  )
}

export function TasksPage() {
  const [project, setProject] = useState(projects.length === 1 ? projects[0].id : 'all')
  const filtered = tasks.filter((t) => project === 'all' || t.projectId === project)
  const editUrl = project !== 'all' ? editTasksUrl(project) : undefined
  return (
    <>
      <PageHeader
        eyebrow="Tasks"
        title="All tasks"
        description={<TaskHelp editUrl={editTasksUrl(projects[0]?.id ?? '')} />}
        actions={
          <>
            <ProjectFilter value={project} onChange={setProject} />
            {editUrl && (
              <a
                href={editUrl}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-indigo-500"
              >
                Edit tasks <ExternalLink className="size-3.5" />
              </a>
            )}
          </>
        }
      />
      {project === 'all' && projects.length > 1 && (
        <p className="-mt-4 mb-5 text-xs text-slate-500">Pick a project above to edit its tasks.</p>
      )}
      <TaskBoard tasks={filtered} showProject={project === 'all'} />
    </>
  )
}

export function NotFoundPage() {
  return (
    <EmptyState
      icon={Compass}
      title="Page not found"
      description="The page you're looking for doesn't exist."
      action={<Link to="/" className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Go to dashboard</Link>}
    />
  )
}
