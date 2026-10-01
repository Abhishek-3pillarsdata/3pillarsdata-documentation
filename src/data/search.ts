import { docs, getMember, getProject, meetings, projects } from '.'
import { splitSections, stripInline } from '../utils/markdown'

export type SearchType = 'project' | 'doc' | 'meeting'

export interface SearchItem {
  type: SearchType
  title: string
  subtitle: string
  text: string
  /** Router path (may include ?h=<heading-id> to scroll to a section). */
  url: string
}

export interface SearchResult extends SearchItem {
  score: number
  snippet: string
}

const docLabels = { overview: 'Overview', architecture: 'Architecture', technical: 'Technical docs' } as const
const projectName = (id: string) => getProject(id)?.name ?? id

function buildIndex(): SearchItem[] {
  const items: SearchItem[] = []

  for (const p of projects) {
    items.push({
      type: 'project',
      title: p.name,
      subtitle: `${p.status} · ${getMember(p.owner).name}`,
      text: [p.description, ...(p.objectives ?? []), ...p.techStack, p.key].join(' '),
      url: `/projects/${p.id}`,
    })
  }

  for (const d of docs) {
    for (const s of splitSections(d.body)) {
      items.push({
        type: 'doc',
        title: s.heading || docLabels[d.kind],
        subtitle: `${projectName(d.projectId)} · ${docLabels[d.kind]}`,
        text: stripInline(s.text.replace(/\|/g, ' ')),
        url: `/projects/${d.projectId}${d.kind === 'overview' ? '' : `/${d.kind}`}${s.id ? `?h=${s.id}` : ''}`,
      })
    }
  }

  for (const m of meetings) {
    items.push({
      type: 'meeting',
      title: m.title,
      subtitle: `${projectName(m.projectId)} · Meeting ${m.date}`,
      text: stripInline(m.body.replace(/\|/g, ' ')),
      url: `/projects/${m.projectId}/meetings/${m.slug}`,
    })
  }

  return items
}

let index: (SearchItem & { _title: string; _text: string; _sub: string })[] | null = null

function getIndex() {
  index ??= buildIndex().map((i) => ({
    ...i,
    _title: i.title.toLowerCase(),
    _text: i.text.toLowerCase(),
    _sub: i.subtitle.toLowerCase(),
  }))
  return index
}

function makeSnippet(text: string, term: string, radius = 70) {
  const clean = text.replace(/\s+/g, ' ').trim()
  const at = clean.toLowerCase().indexOf(term)
  if (at < 0) return clean.slice(0, radius * 2) + (clean.length > radius * 2 ? '…' : '')
  const start = Math.max(0, at - radius)
  const end = Math.min(clean.length, at + term.length + radius)
  return (start > 0 ? '…' : '') + clean.slice(start, end) + (end < clean.length ? '…' : '')
}

/** Every term must match somewhere; title matches weigh most. */
export function search(query: string, limit = 50): SearchResult[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return []

  const results: SearchResult[] = []
  for (const item of getIndex()) {
    let score = 0
    let ok = true
    for (const term of terms) {
      const inTitle = item._title.includes(term)
      const inSub = item._sub.includes(term)
      const inText = item._text.includes(term)
      if (!inTitle && !inSub && !inText) {
        ok = false
        break
      }
      score += (inTitle ? 10 : 0) + (inSub ? 3 : 0) + (inText ? 1 : 0)
      if (item._title.startsWith(term)) score += 5
    }
    if (!ok) continue
    if (item.type === 'project') score += 4
    const { _title, _text, _sub, ...rest } = item
    results.push({ ...rest, score, snippet: makeSnippet(item.text, terms[0]) })
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit)
}

export const searchTypeLabels: Record<SearchType, string> = {
  project: 'Project',
  doc: 'Documentation',
  meeting: 'Meeting',
}
