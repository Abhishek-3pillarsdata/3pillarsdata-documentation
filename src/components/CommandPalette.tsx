import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowRight, CornerDownLeft, Search } from 'lucide-react'
import { search, searchTypeLabels } from '../data/search'
import { Highlight, SearchResultIcon } from './SearchResultIcon'
import { cn } from '../utils/format'

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)
  const navigate = useNavigate()
  const results = useMemo(() => search(query, 12), [query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
    }
  }, [open])

  useEffect(() => setActive(0), [query])

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  if (!open) return null

  const go = (url: string) => {
    onClose()
    navigate(url)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[active]) go(results[active].url)
      else if (query.trim()) go(`/search?q=${encodeURIComponent(query)}`)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[10vh]" role="dialog" aria-modal="true" aria-label="Search">
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-800">
          <Search className="size-5 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search projects, tasks, meetings, docs, changelog…"
            className="h-14 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
          />
          <kbd className="rounded border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-500 dark:border-slate-700">Esc</kbd>
        </div>

        {query.trim() === '' ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            Type to search across all projects.
            <div className="mt-2 text-xs text-slate-400">Search by keyword, task id, person or date.</div>
          </div>
        ) : results.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            No results for <span className="font-medium text-slate-700 dark:text-slate-300">“{query}”</span>
          </div>
        ) : (
          <ul ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
            {results.map((r, i) => (
              <li key={r.url + r.title + i} data-index={i}>
                <button
                  onClick={() => go(r.url)}
                  onMouseMove={() => setActive(i)}
                  className={cn('flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left', i === active && 'bg-slate-100 dark:bg-slate-800')}
                >
                  <SearchResultIcon type={r.type} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-slate-900 dark:text-white">
                        <Highlight text={r.title} query={query} />
                      </span>
                      <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-slate-400">{searchTypeLabels[r.type]}</span>
                    </span>
                    <span className="block truncate text-xs text-slate-500">{r.subtitle}</span>
                    {r.snippet && (
                      <span className="mt-0.5 line-clamp-1 block text-xs text-slate-500 dark:text-slate-400">
                        <Highlight text={r.snippet} query={query} />
                      </span>
                    )}
                  </span>
                  {i === active && <CornerDownLeft className="mt-2 size-4 shrink-0 text-slate-400" />}
                </button>
              </li>
            ))}
          </ul>
        )}

        {query.trim() && (
          <button
            onClick={() => go(`/search?q=${encodeURIComponent(query)}`)}
            className="flex w-full items-center justify-between border-t border-slate-200 px-5 py-3 text-xs font-medium text-indigo-600 hover:bg-slate-50 dark:border-slate-800 dark:text-indigo-400 dark:hover:bg-slate-800/50"
          >
            See all results for “{query}” <ArrowRight className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
