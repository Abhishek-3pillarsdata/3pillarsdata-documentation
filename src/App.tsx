import { lazy } from 'react'
import { HashRouter, Route, Routes } from 'react-router'
import { AppLayout } from './layouts/AppLayout'

// Route-level code splitting: each page shows a skeleton while its chunk loads.
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const TeamPage = lazy(() => import('./pages/TeamPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const ProjectLayout = lazy(() => import('./pages/project/ProjectLayout'))
const ProjectOverview = lazy(() => import('./pages/project/ProjectOverview'))
const ProjectDoc = lazy(() => import('./pages/project/ProjectDoc'))
const MeetingDetail = lazy(() => import('./pages/project/MeetingDetail'))
const global = () => import('./pages/GlobalPages')
const MeetingsPage = lazy(() => global().then((m) => ({ default: m.MeetingsPage })))
const TasksPage = lazy(() => global().then((m) => ({ default: m.TasksPage })))
const NotFoundPage = lazy(() => global().then((m) => ({ default: m.NotFoundPage })))
const sections = () => import('./pages/project/ProjectSections')
const ProjectMeetings = lazy(() => sections().then((m) => ({ default: m.ProjectMeetings })))
const ProjectTasks = lazy(() => sections().then((m) => ({ default: m.ProjectTasks })))

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectId" element={<ProjectLayout />}>
            <Route index element={<ProjectOverview />} />
            <Route path="architecture" element={<ProjectDoc kind="architecture" />} />
            <Route path="technical" element={<ProjectDoc kind="technical" />} />
            <Route path="tasks" element={<ProjectTasks />} />
            <Route path="meetings" element={<ProjectMeetings />} />
            <Route path="meetings/:meetingId" element={<MeetingDetail />} />
          </Route>
          <Route path="tasks" element={<TasksPage />} />
          <Route path="meetings" element={<MeetingsPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
