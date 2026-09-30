/**
 * Data model for the documentation portal.
 *
 * These interfaces describe the files in /data (JSON) and /docs (Markdown).
 * If you add a field to a JSON file, add it here too. All dates are
 * ISO strings in the form YYYY-MM-DD.
 */

export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed'
export type TaskStatus = 'todo' | 'in-progress' | 'completed' | 'blocked'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type IssueStatus = 'open' | 'investigating' | 'resolved'

/** data/team.json */
export interface TeamMember {
  id: string
  name: string
  role: string
  email?: string
  /** Short bio / focus areas shown on the team page. */
  focus?: string
}

export interface Milestone {
  title: string
  date: string
  done: boolean
}

/** data/projects.json — `id` must match the folder name in docs/projects/<id>/ */
export interface Project {
  id: string
  /** Short prefix used for task IDs, e.g. "ALPHA" -> ALPHA-12 */
  key: string
  name: string
  description: string
  objectives: string[]
  status: ProjectStatus
  /** 0–100 */
  progress: number
  /** TeamMember id */
  owner: string
  techStack: string[]
  startDate: string
  targetDate?: string
  lastUpdated: string
  repository?: string
  milestones?: Milestone[]
}

/** data/tasks.json */
export interface Task {
  /** "<PROJECT KEY>-<number>", e.g. ALPHA-12 */
  id: string
  projectId: string
  title: string
  description: string
  priority: Priority
  status: TaskStatus
  /** TeamMember id */
  assignee: string
  createdDate: string
  updatedDate: string
}

/** data/issues.json */
export interface Issue {
  id: string
  projectId: string
  title: string
  description: string
  severity: Priority
  status: IssueStatus
  reportedBy: string
  createdDate: string
  updatedDate: string
  /** Task IDs this issue blocks or relates to. */
  relatedTasks?: string[]
  resolution?: string
}

/** data/updates.json — one entry per development session */
export interface DevelopmentUpdate {
  id: string
  projectId: string
  date: string
  /** TeamMember id */
  developer: string
  /** One-line summary of what was worked on. */
  summary: string
  changes: string[]
  filesAffected: string[]
  problems: string[]
  solutions: string[]
  nextSteps: string[]
  /** Task IDs touched in this session. */
  relatedTasks?: string[]
}

/** Parsed from docs/projects/<id>/changelog.md (one `## YYYY-MM-DD` heading per entry). */
export interface ChangelogEntry {
  projectId: string
  date: string
  /** Optional title after the date: `## 2026-09-30 — Auth flow` */
  title?: string
  items: string[]
}

export interface ActionItem {
  action: string
  owner: string
  deadline: string
  done: boolean
}

/** Parsed from docs/projects/<id>/meetings/YYYY-MM-DD[-slug].md */
export interface Meeting {
  /** File name without extension, e.g. "2026-09-30" or "2026-09-30-sprint-review" */
  slug: string
  projectId: string
  title: string
  date: string
  /** TeamMember ids or free-text names */
  participants: string[]
  topics: string[]
  decisions: string[]
  actionItems: ActionItem[]
  /** Raw Markdown body (frontmatter removed). */
  body: string
}

export type DocKind = 'overview' | 'architecture' | 'technical'

export interface ProjectDoc {
  projectId: string
  kind: DocKind
  body: string
}
