import { useState } from 'react'
import { FolderKanban } from 'lucide-react'
import { projects } from '../data'
import { EmptyState, PageHeader, Segmented } from '../components/ui'
import { ProjectCard } from '../components/ProjectCard'
import type { ProjectStatus } from '../types'

export default function ProjectsPage() {
  const [filter, setFilter] = useState<'all' | ProjectStatus>('all')
  const list = projects.filter((p) => filter === 'all' || p.status === filter)

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="All projects"
        description="Each project has its own overview, architecture, technical docs, tasks, meeting notes, development updates and changelog."
        actions={
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: `All (${projects.length})` },
              { value: 'active', label: 'Active' },
              { value: 'planning', label: 'Planning' },
              { value: 'on-hold', label: 'On hold' },
              { value: 'completed', label: 'Completed' },
            ]}
          />
        }
      />
      {list.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <EmptyState icon={FolderKanban} title="No projects match this filter" />
      )}
    </>
  )
}
