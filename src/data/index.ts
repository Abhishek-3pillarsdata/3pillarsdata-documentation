/**
 * Loads all documentation content at build time.
 *
 *   /data/projects.json, /data/team.json                     → structured data
 *   /docs/projects/<id>/{overview,architecture,technical}.md → project pages
 *   /docs/projects/<id>/meetings/*.md                        → meeting notes
 *
 * There is nothing to register here when adding content: new files matching
 * these globs are picked up automatically on the next build.
 */
import projectsJson from '../../data/projects.json'
import teamJson from '../../data/team.json'
import type { DocKind, Meeting, Project, ProjectDoc, TeamMember } from '../types'
import { getActionItems, getBullets, getSection, parseFrontmatter, stripInline } from '../utils/markdown'

const docFiles = import.meta.glob('/docs/projects/*/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const meetingFiles = import.meta.glob('/docs/projects/*/meetings/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

const docKinds: DocKind[] = ['overview', 'architecture', 'technical']

export const team = teamJson as TeamMember[]
export const projects = (projectsJson as unknown as Project[]).slice().sort((a, b) => a.name.localeCompare(b.name))

// ── Markdown docs ────────────────────────────────────────────────────────────
export const docs: ProjectDoc[] = []

for (const [path, raw] of Object.entries(docFiles)) {
  const m = /\/docs\/projects\/([^/]+)\/([^/]+)\.md$/.exec(path)
  if (!m || !docKinds.includes(m[2] as DocKind)) continue
  docs.push({ projectId: m[1], kind: m[2] as DocKind, body: parseFrontmatter(raw).body })
}

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
  .sort((a, b) => b.date.localeCompare(a.date))

// ── Lookups ──────────────────────────────────────────────────────────────────
export const getProject = (id: string) => projects.find((p) => p.id === id)
export const getDoc = (projectId: string, kind: DocKind) => docs.find((d) => d.projectId === projectId && d.kind === kind)
export const getMeeting = (projectId: string, slug: string) => meetings.find((m) => m.projectId === projectId && m.slug === slug)
export const meetingsFor = (projectId: string) => meetings.filter((m) => m.projectId === projectId)

/** Resolves a team id to a member; free-text names produce a placeholder member. */
export function getMember(idOrName: string): TeamMember {
  return (
    team.find((t) => t.id === idOrName) ??
    team.find((t) => t.name.toLowerCase() === idOrName.toLowerCase()) ?? { id: idOrName, name: idOrName, role: '' }
  )
}

/** First paragraph of the "## Current status" section of overview.md, as plain text. */
export function statusSummary(projectId: string): string | undefined {
  const body = getDoc(projectId, 'overview')?.body
  if (!body) return undefined
  const paragraph = getSection(body, 'current status')
    .join('\n')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !p.startsWith('#'))
  return paragraph ? stripInline(paragraph.replace(/^\s*[-*+]\s+/gm, '').replace(/\s+/g, ' ')) : undefined
}
