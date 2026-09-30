import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Search, SearchX } from 'lucide-react'
import { search, searchTypeLabels, type SearchType } from '../data/search'
import { EmptyState, PageHeader } from '../components/ui'
import { Highlight, SearchResultIcon } from '../components/SearchResultIcon'
import { cn } from '../utils/format'

export default function SearchPage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const [type, setType] = useState<SearchType | 'all'>('all')
  const results = useMemo(() => search(q, 200), [q])
  const shown = results.filter((r) => type === 'all' || r.type === type)
  const counts = results.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.type]: (acc[r.type] ?? 0) + 1 }), {})

  return (
    <>
      <PageHeader eyebrow="Search" title={q ? <>Results for “{q}”</> : 'Search'} description={q ? `${results.length} results across projects, tasks, meetings, docs and changelog.` : undefined} />

      <div className="relative mb-6 max-w-2xl">
        <Search className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        <input
          autoFocus
          value={q}
          onChange={(e) => {
            setType('all')
            setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })
          }}
          placeholder="Search everything…"
          className="focus-ring h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-base shadow-xs dark:border-slate-800 dark:bg-slate-900"
        />
      </div>

      {results.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {(['all', ...Object.keys(searchTypeLabels)] as const).map((t) => {
            const n = t === 'all' ? results.length : counts[t] ?? 0
            if (!n) return null
            return (
              <button
                key={t}
                onClick={() => setType(t as SearchType | 'all')}
                className={cn(
                  'focus-ring rounded-full px-3 py-1 text-xs font-medium transition',
                  type === t ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
                )}
              >
                {t === 'all' ? 'All' : searchTypeLabels[t as SearchType]} <span className="opacity-60">{n}</span>
              </button>
            )
          })}
        </div>
      )}

      {!q ? (
        <EmptyState icon={Search} title="Search the documentation" description="Find projects, tasks, meeting notes, documentation sections, changelog entries and dev updates." />
      ) : !shown.length ? (
        <EmptyState icon={SearchX} title="No results" description={`Nothing matched “${q}”. Try fewer or different words.`} />
      ) : (
        <ul className="card divide-y divide-slate-100 dark:divide-slate-800">
          {shown.map((r, i) => (
            <li key={r.url + i}>
              <Link to={r.url} className="flex gap-4 p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <SearchResultIcon type={r.type} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-white">
                      <Highlight text={r.title} query={q} />
                    </span>
                    <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{searchTypeLabels[r.type]}</span>
                  </div>
                  <p className="text-xs text-slate-500">{r.subtitle}</p>
                  {r.snippet && (
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                      <Highlight text={r.snippet} query={q} />
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
