/**
 * Data model for the documentation portal.
 *
 * The portal describes each project as it is *now*: what it is, what works, how it is built.
 * There is deliberately no task tracking, changelog or date history. Meeting notes are the
 * only dated content, and they are added by hand.
 */

export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed'

/** data/team.json */
export interface TeamMember {
  id: string
  name: string
  role: string
  email?: string
  /** Short bio / focus areas shown on the team page. */
  focus?: string
}

/** data/projects.json. `id` must match the folder name in docs/projects/<id>/ */
export interface Project {
  id: string
  /** Short code shown on the project card, e.g. "SDLC" */
  key: string
  name: string
  description: string
  objectives?: string[]
  status: ProjectStatus
  /** TeamMember id */
  owner: string
  techStack: string[]
  /** Git remote URL of the code repo; links developers' local repos to this project. */
  repository?: string
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
