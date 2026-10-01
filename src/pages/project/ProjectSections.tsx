import { ExternalLink } from 'lucide-react'
import { editTasksUrl, meetingsFor, tasksFor } from '../../data'
import { MeetingList } from '../../components/MeetingList'
import { TaskBoard, TaskHelp } from '../../components/TaskBoard'
import { useProject } from './ProjectLayout'

export function ProjectMeetings() {
  return <MeetingList meetings={meetingsFor(useProject().id)} />
}

export function ProjectTasks() {
  const project = useProject()
  const editUrl = editTasksUrl(project.id)
  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TaskHelp editUrl={editUrl} />
        {editUrl && (
          <a
            href={editUrl}
            target="_blank"
            rel="noreferrer"
            className="focus-ring inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-indigo-500"
          >
            Edit tasks <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>
      <TaskBoard tasks={tasksFor(project.id)} />
    </div>
  )
}
