import { useState } from 'react'
import { Link } from 'react-router'
import { Compass } from 'lucide-react'
import { changelog, issues, meetings, projects, tasks, updates } from '../data'
import { EmptyState, PageHeader, Segmented, Select } from '../components/ui'
import { TaskView } from '../components/TaskView'
import { MeetingList } from '../components/MeetingList'
import { UpdateTimeline } from '../components/UpdateTimeline'
import { ChangelogTimeline } from '../components/ChangelogTimeline'
import { IssueList } from '../components/IssueList'

function ProjectFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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

const useProjectFilter = <T extends { projectId: string }>(items: T[]) => {
  const [project, setProject] = useState('all')
  return { project, setProject, filtered: items.filter((i) => project === 'all' || i.projectId === project) }
}

export function TasksPage() {
  return (
    <>
      <PageHeader eyebrow="Tasks" title="All tasks" description="Every task across all projects. Source: data/tasks.json. Click a task for details." />
      <TaskView tasks={tasks} showProject />
    </>
  )
}

export function MeetingsPage() {
  const { project, setProject, filtered } = useProjectFilter(meetings)
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

export function UpdatesPage() {
  const { project, setProject, filtered } = useProjectFilter(updates)
  return (
    <>
      <PageHeader
        eyebrow="Development updates"
        title="Session timeline"
        description="What was worked on in each development session: changes, affected files, problems, solutions and next steps."
        actions={<ProjectFilter value={project} onChange={setProject} />}
      />
      <div className="max-w-4xl">
        <UpdateTimeline updates={filtered} showProject={project === 'all'} />
      </div>
    </>
  )
}

export function ChangelogPage() {
  const { project, setProject, filtered } = useProjectFilter(changelog)
  return (
    <>
      <PageHeader eyebrow="Changelog" title="Release history" description="Chronological changes across all projects." actions={<ProjectFilter value={project} onChange={setProject} />} />
      <div className="max-w-4xl">
        <ChangelogTimeline entries={filtered} showProject={project === 'all'} />
      </div>
    </>
  )
}

export function IssuesPage() {
  const { project, setProject, filtered } = useProjectFilter(issues)
  const [status, setStatus] = useState<'unresolved' | 'all'>('unresolved')
  const list = filtered.filter((i) => status === 'all' || i.status !== 'resolved')
  return (
    <>
      <PageHeader
        eyebrow="Issues & blockers"
        title="What's in the way"
        description="Problems blocking progress and how they were resolved. Source: data/issues.json."
        actions={
          <>
            <Segmented value={status} onChange={setStatus} options={[{ value: 'unresolved', label: 'Unresolved' }, { value: 'all', label: 'All' }]} />
            <ProjectFilter value={project} onChange={setProject} />
          </>
        }
      />
      <IssueList issues={list} showProject={project === 'all'} />
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
