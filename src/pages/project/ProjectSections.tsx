import { meetingsFor } from '../../data'
import { MeetingList } from '../../components/MeetingList'
import { useProject } from './ProjectLayout'

export function ProjectMeetings() {
  return <MeetingList meetings={meetingsFor(useProject().id)} />
}
