import GithubSlugger from 'github-slugger'
import type { ActionItem, ChangelogEntry } from '../types'

/**
 * Tiny frontmatter parser. Supports the subset used in this repo:
 *   key: value
 *   key: [a, b, c]
 */
export function parseFrontmatter(raw: string): { data: Record<string, string | string[]>; body: string } {
  const src = raw.replace(/\r\n/g, '\n')
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(src)
  if (!match) return { data: {}, body: src }

  const data: Record<string, string | string[]> = {}
  for (const line of match[1].split('\n')) {
    const m = /^([\w-]+)\s*:\s*(.*)$/.exec(line.trim())
    if (!m) continue
    const [, key, value] = m
    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map((v) => unquote(v.trim()))
        .filter(Boolean)
    } else {
      data[key] = unquote(value.trim())
    }
  }
  return { data, body: src.slice(match[0].length) }
}

function unquote(v: string) {
  return v.replace(/^["']|["']$/g, '')
}

/** Returns the lines under a `## Heading` (matched case-insensitively by prefix), up to the next `## `. */
export function getSection(body: string, ...headings: string[]): string[] {
  const lines = body.replace(/\r\n/g, '\n').split('\n')
  const wanted = headings.map((h) => h.toLowerCase())
  const out: string[] = []
  let inSection = false
  for (const line of lines) {
    const h = /^##\s+(.+)$/.exec(line)
    if (h) {
      const title = h[1].trim().toLowerCase()
      inSection = wanted.some((w) => title.startsWith(w))
      continue
    }
    if (inSection) out.push(line)
  }
  return out
}

/** Extracts `- item` / `* item` / `1. item` bullets from lines. */
export function getBullets(lines: string[]): string[] {
  return lines
    .map((l) => /^\s*(?:[-*+]|\d+\.)\s+(.*)$/.exec(l)?.[1]?.trim())
    .filter((v): v is string => !!v)
}

/** Parses the "Action Items" markdown table (columns: Action | Owner | Deadline | Status). */
export function getActionItems(lines: string[]): ActionItem[] {
  const rows = lines.filter((l) => l.trim().startsWith('|'))
  if (rows.length < 2) return []
  const cells = (row: string) =>
    row
      .trim()
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((c) => c.trim())
  const header = cells(rows[0]).map((h) => h.toLowerCase())
  const col = (name: string) => header.findIndex((h) => h.startsWith(name))
  const [iAction, iOwner, iDeadline, iStatus] = [col('action'), col('owner'), col('deadline'), col('status')]

  return rows
    .slice(1)
    .filter((r) => !/^\|?\s*:?-{2,}/.test(r.trim()))
    .map((r) => {
      const c = cells(r)
      const status = (c[iStatus] ?? '').toLowerCase()
      return {
        action: c[iAction] ?? '',
        owner: c[iOwner] ?? '',
        deadline: c[iDeadline] ?? '',
        done: ['done', 'completed', 'closed', 'yes', '✅'].includes(status),
      }
    })
    .filter((a) => a.action)
}

/**
 * Parses changelog.md. Format:
 *   ## 2026-09-30 — Optional title
 *   - item
 */
export function parseChangelog(projectId: string, raw: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = []
  let current: ChangelogEntry | null = null
  for (const line of raw.replace(/\r\n/g, '\n').split('\n')) {
    const h = /^##\s+(\d{4}-\d{2}-\d{2})\s*(?:[—–-]+\s*(.+))?$/.exec(line.trim())
    if (h) {
      current = { projectId, date: h[1], title: h[2]?.trim(), items: [] }
      entries.push(current)
      continue
    }
    const bullet = /^\s*[-*+]\s+(.*)$/.exec(line)
    if (current && bullet) current.items.push(bullet[1].trim())
  }
  return entries.sort((a, b) => b.date.localeCompare(a.date))
}

/** Strips inline markdown (bold, code, links) for plain-text previews and search. */
export function stripInline(md: string): string {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim()
}

export interface Heading {
  depth: number
  text: string
  id: string
}

/** Headings (## and ###) with ids matching rehype-slug's output. */
export function getHeadings(body: string): Heading[] {
  const slugger = new GithubSlugger()
  const out: Heading[] = []
  let inCode = false
  for (const line of body.split('\n')) {
    if (line.trim().startsWith('```')) inCode = !inCode
    if (inCode) continue
    const m = /^(#{1,3})\s+(.+)$/.exec(line)
    if (!m) continue
    const text = stripInline(m[2])
    const id = slugger.slug(text)
    if (m[1].length > 1) out.push({ depth: m[1].length, text, id })
  }
  return out
}

/** Splits a markdown doc into sections by heading for search indexing. */
export function splitSections(body: string): { heading: string; id: string; text: string }[] {
  const slugger = new GithubSlugger()
  const sections: { heading: string; id: string; text: string }[] = [{ heading: '', id: '', text: '' }]
  let inCode = false
  for (const line of body.split('\n')) {
    if (line.trim().startsWith('```')) inCode = !inCode
    const m = !inCode && /^(#{1,6})\s+(.+)$/.exec(line)
    if (m) {
      const heading = stripInline(m[2])
      sections.push({ heading, id: slugger.slug(heading), text: '' })
    } else {
      sections[sections.length - 1].text += line + '\n'
    }
  }
  return sections.filter((s) => s.heading || s.text.trim())
}
