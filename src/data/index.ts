/**
 * Loads all documentation content at build time.
 *
 *   /data/*.json                         → structured data
 *   /docs/projects/<id>/*.md             → overview / architecture / technical / changelog
 *   /docs/projects/<id>/meetings/*.md    → meeting notes
 *
 * There is nothing to register here when adding content: new files matching
 * these globs are picked up automatically on the next build.
 */
import projectsJson from '../../data/projects.json'
import tasksJson from '../../data/tasks.json'
import teamJson from '../../data/team.json'
import updatesJson from '../../data/updates.json'
import issuesJson from '../../data/issues.json'
import type {
  ChangelogEntry,
  DevelopmentUpdate,
  DocKind,
  Issue,
  Meeting,
  Project,
  ProjectDoc,
  Task,
  TeamMember,
} from '../types'
import { getActionItems, getBullets, getSection, parseChangelog, parseFrontmatter, stripInline } from '../utils/markdown'

const docFiles = import.meta.glob('/docs/projects/*/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const meetingFiles = import.meta.glob('/docs/projects/*/meetings/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

const byDateDesc = <T>(key: (t: T) => string) => (a: T, b: T) => key(b).localeCompare(key(a))

export const team = teamJson as TeamMember[]
export const projects = (projectsJson as unknown as Project[]).slice().sort(byDateDesc((p) => p.lastUpdated))
export const tasks = tasksJson as unknown as Task[]
export const issues = (issuesJson as unknown as Issue[]).slice().sort(byDateDesc((i) => i.updatedDate))
export const updates = (updatesJson as unknown as DevelopmentUpdate[]).slice().sort(byDateDesc((u) => u.date))

// ── Markdown docs ────────────────────────────────────────────────────────────
export const docs: ProjectDoc[] = []
export const changelog: ChangelogEntry[] = []

for (const [path, raw] of Object.entries(docFiles)) {
  const m = /\/docs\/projects\/([^/]+)\/([^/]+)\.md$/.exec(path)
  if (!m) continue
  const [, projectId, name] = m
  if (name === 'changelog') changelog.push(...parseChangelog(projectId, raw))
  else docs.push({ projectId, kind: name as DocKind, body: parseFrontmatter(raw).body })
}
changelog.sort(byDateDesc((c) => c.date))

// ── Meetings ─────────────────────────────────────────────────────────────────
export const meetings: Meeting[] = Object.entries(meetingFiles)
  .map(([path, raw]) => {
    const m = /\/docs\/projects\/([^/]+)\/meetings\/([^/]+)\.md$/.exec(path)!
    const [, projectId, slug] = m
    const { data, body } = parseFrontmatter(raw)
    const date = (data.date as string) || slug.slice(0, 10)
    const participants = data.participants
    return {
      slug,
      projectId,
      title: (data.title as string) || `Meeting ${date}`,
      date,
      participants: Array.isArray(participants) ? participants : participants ? participants.split(',').map((p) => p.trim()) : [],
      topics: getBullets(getSection(body, 'topics')).map(stripInline),
      decisions: getBullets(getSection(body, 'decisions')).map(stripInline),
      actionItems: getActionItems(getSection(body, 'action items', 'actions')),
      body,
    }
  })
  .sort(byDateDesc((m) => m.date))

// ── Lookups ──────────────────────────────────────────────────────────────────
export const getProject = (id: string) => projects.find((p) => p.id === id)
export const getDoc = (projectId: string, kind: DocKind) => docs.find((d) => d.projectId === projectId && d.kind === kind)
export const getMeeting = (projectId: string, slug: string) => meetings.find((m) => m.projectId === projectId && m.slug === slug)

/** Resolves a team id to a member; free-text names produce a placeholder member. */
export function getMember(idOrName: string): TeamMember {
  return (
    team.find((t) => t.id === idOrName) ??
    team.find((t) => t.name.toLowerCase() === idOrName.toLowerCase()) ?? { id: idOrName, name: idOrName, role: '' }
  )
}

export const tasksFor = (projectId: string) => tasks.filter((t) => t.projectId === projectId)
export const meetingsFor = (projectId: string) => meetings.filter((m) => m.projectId === projectId)
export const updatesFor = (projectId: string) => updates.filter((u) => u.projectId === projectId)
export const changelogFor = (projectId: string) => changelog.filter((c) => c.projectId === projectId)
export const issuesFor = (projectId: string) => issues.filter((i) => i.projectId === projectId)
