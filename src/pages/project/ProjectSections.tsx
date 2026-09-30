import { changelogFor, issuesFor, meetingsFor, tasksFor, updatesFor } from '../../data'
import { TaskView } from '../../components/TaskView'
import { MeetingList } from '../../components/MeetingList'
import { UpdateTimeline } from '../../components/UpdateTimeline'
import { ChangelogTimeline } from '../../components/ChangelogTimeline'
import { IssueList } from '../../components/IssueList'
import { useProject } from './ProjectLayout'

export function ProjectTasks() {
  return <TaskView tasks={tasksFor(useProject().id)} />
}

export function ProjectMeetings() {
  return <MeetingList meetings={meetingsFor(useProject().id)} />
}

export function ProjectUpdates() {
  return <UpdateTimeline updates={updatesFor(useProject().id)} />
}

export function ProjectChangelog() {
  return <ChangelogTimeline entries={changelogFor(useProject().id)} />
}

export function ProjectIssues() {
  return <IssueList issues={issuesFor(useProject().id)} />
}
