import { Link } from 'react-router'
import { History } from 'lucide-react'
import type { ChangelogEntry } from '../types'
import { getProject } from '../data'
import { Badge, EmptyState } from './ui'
import { formatDate, parseDate } from '../utils/format'

/** Highlights task/issue references like ALPHA-12 or BETA-ISSUE-1. */
function withRefs(text: string) {
  const parts = text.replace(/\(([A-Z]{2,}(?:-ISSUE)?-\d+)\)/g, '$1').split(/(\b[A-Z]{2,}(?:-ISSUE)?-\d+\b|`[^`]+`)/g)
  return parts.map((p, i) => {
    if (i % 2 === 0) return p.replace(/\*\*/g, '')
    if (p.startsWith('`')) return <code key={i} className="rounded bg-slate-100 px-1 font-mono text-[12px] dark:bg-slate-800">{p.slice(1, -1)}</code>
    return <span key={i} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{p}</span>
  })
}

function classify(item: string): { label: string; tone: 'emerald' | 'rose' | 'sky' | 'violet' | 'slate' } {
  const w = item.toLowerCase()
  if (/^(fix|fixed|resolve)/.test(w)) return { label: 'Fixed', tone: 'rose' }
  if (/^(add|added|create|created|implement|implemented|shipped|built|rendered|seeded|documented|completed)/.test(w)) return { label: 'Added', tone: 'emerald' }
  if (/^(update|updated|improve|improved|refactor|moved|changed|scheduled)/.test(w)) return { label: 'Changed', tone: 'sky' }
  if (/^(remove|removed|deprecate)/.test(w)) return { label: 'Removed', tone: 'violet' }
  return { label: 'Note', tone: 'slate' }
}

export function ChangelogTimeline({ entries, showProject }: { entries: ChangelogEntry[]; showProject?: boolean }) {
  if (!entries.length) {
    return <EmptyState icon={History} title="No changelog entries" description="Add a “## YYYY-MM-DD” section to docs/projects/<id>/changelog.md." />
  }

  // Group by month for easy scanning.
  const groups = new Map<string, ChangelogEntry[]>()
  for (const e of entries) {
    const key = e.date.slice(0, 7)
    groups.set(key, [...(groups.get(key) ?? []), e])
  }

  return (
    <div className="space-y-10">
      {[...groups].map(([month, list]) => (
        <section key={month}>
          <h2 className="sticky top-16 z-10 -mx-1 mb-4 bg-slate-50/90 px-1 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 backdrop-blur dark:bg-slate-950/90">
            {parseDate(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <ol className="space-y-4">
            {list.map((e) => {
              const project = getProject(e.projectId)
              return (
                <li key={e.projectId + e.date} className="grid gap-3 sm:grid-cols-[120px_1fr] sm:gap-6">
                  <div className="flex items-baseline gap-2 sm:block sm:pt-4 sm:text-right">
                    <div className="text-2xl font-semibold tabular-nums leading-none text-slate-900 dark:text-white">{parseDate(e.date).getDate()}</div>
                    <div className="text-xs text-slate-500">{formatDate(e.date, { weekday: 'long' })}</div>
                  </div>
                  <div className="card p-4 sm:p-5">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <time className="font-mono text-xs text-slate-500">{e.date}</time>
                      {e.title && <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{e.title}</h3>}
                      {showProject && project && (
                        <Link to={`/projects/${project.id}/changelog`} className="ml-auto">
                          <Badge tone="indigo">{project.name}</Badge>
                        </Link>
                      )}
                    </div>
                    <ul className="space-y-2">
                      {e.items.map((item, i) => {
                        const c = classify(item)
                        return (
                          <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                            <Badge tone={c.tone} className="mt-px w-[68px] justify-center">{c.label}</Badge>
                            <span className="leading-relaxed">{withRefs(item)}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </div>
  )
}
