import { AlertTriangle, CalendarDays, CheckSquare, FileText, FolderKanban, History, Workflow } from 'lucide-react'
import type { SearchType } from '../data/search'
import { cn } from '../utils/format'

const icons = {
  project: { icon: FolderKanban, cls: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' },
  task: { icon: CheckSquare, cls: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400' },
  meeting: { icon: CalendarDays, cls: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400' },
  doc: { icon: FileText, cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  changelog: { icon: History, cls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
  update: { icon: Workflow, cls: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' },
  issue: { icon: AlertTriangle, cls: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' },
} satisfies Record<SearchType, unknown>

export function SearchResultIcon({ type }: { type: SearchType }) {
  const { icon: Icon, cls } = icons[type]
  return (
    <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', cls)}>
      <Icon className="size-4" />
    </span>
  )
}

/** Wraps occurrences of the query terms in <mark>. */
export function Highlight({ text, query }: { text: string; query: string }) {
  const terms = query
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  if (!terms.length) return <>{text}</>
  const parts = text.split(new RegExp(`(${terms.join('|')})`, 'gi'))
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-sm bg-amber-200/70 px-0.5 text-inherit dark:bg-amber-400/25">
            {p}
          </mark>
        ) : (
          p
        ),
      )}
    </>
  )
}
