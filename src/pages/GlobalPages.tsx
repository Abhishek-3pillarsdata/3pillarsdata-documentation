import { useState } from 'react'
import { Link } from 'react-router'
import { Compass } from 'lucide-react'
import { meetings, projects } from '../data'
import { EmptyState, PageHeader, Select } from '../components/ui'
import { MeetingList } from '../components/MeetingList'

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
        actions={
          projects.length > 1 && (
            <Select label="Filter by project" value={project} onChange={setProject}>
              <option value="all">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          )
        }
      />
      <MeetingList meetings={filtered} showProject={project === 'all'} />
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
