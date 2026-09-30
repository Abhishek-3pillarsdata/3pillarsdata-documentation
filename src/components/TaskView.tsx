import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Ban, CheckCircle2, Circle, Columns3, ListChecks, Loader, Rows3, X } from 'lucide-react'
import type { Task, TaskStatus } from '../types'
import { getMember, getProject, team } from '../data'
import { Avatar, EmptyState, Person, PriorityBadge, Segmented, Select, TaskStatusBadge } from './ui'
import { priorityMeta, taskStatusMeta } from './ui/Badge'
import { cn, formatDate, relativeDate } from '../utils/format'

const columns: { status: TaskStatus; icon: typeof Circle; accent: string }[] = [
  { status: 'todo', icon: Circle, accent: 'text-slate-400' },
  { status: 'in-progress', icon: Loader, accent: 'text-sky-500' },
  { status: 'blocked', icon: Ban, accent: 'text-rose-500' },
  { status: 'completed', icon: CheckCircle2, accent: 'text-emerald-500' },
]

const priorityRank = { critical: 0, high: 1, medium: 2, low: 3 }
const sortTasks = (a: Task, b: Task) => priorityRank[a.priority] - priorityRank[b.priority] || b.updatedDate.localeCompare(a.updatedDate)

/** Task board / table with filters. `?task=ID` in the URL opens that task's detail panel. */
export function TaskView({ tasks, showProject }: { tasks: Task[]; showProject?: boolean }) {
  const [params, setParams] = useSearchParams()
  const [view, setView] = useState<'board' | 'table'>('board')
  const [assignee, setAssignee] = useState('all')
  const [priority, setPriority] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')

  const selectedId = params.get('task')
  const selected = tasks.find((t) => t.id === selectedId)
  const select = (id: string | null) => {
    const next = new URLSearchParams(params)
    if (id) next.set('task', id)
    else next.delete('task')
    setParams(next, { replace: true })
  }

  const projectIds = [...new Set(tasks.map((t) => t.projectId))]
  const filtered = useMemo(
    () =>
      tasks
        .filter((t) => assignee === 'all' || t.assignee === assignee)
        .filter((t) => priority === 'all' || t.priority === priority)
        .filter((t) => projectFilter === 'all' || t.projectId === projectFilter)
        .sort(sortTasks),
    [tasks, assignee, priority, projectFilter],
  )

  if (!tasks.length) {
    return <EmptyState icon={ListChecks} title="No tasks yet" description="Add tasks to data/tasks.json and they will appear here." />
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: 'board', label: <><Columns3 className="size-3.5" /> Board</> },
            { value: 'table', label: <><Rows3 className="size-3.5" /> Table</> },
          ]}
        />
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {showProject && projectIds.length > 1 && (
            <Select label="Filter by project" value={projectFilter} onChange={setProjectFilter}>
              <option value="all">All projects</option>
              {projectIds.map((id) => (
                <option key={id} value={id}>
                  {getProject(id)?.name ?? id}
                </option>
              ))}
            </Select>
          )}
          <Select label="Filter by assignee" value={assignee} onChange={setAssignee}>
            <option value="all">All assignees</option>
            {team
              .filter((m) => tasks.some((t) => t.assignee === m.id))
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
          </Select>
          <Select label="Filter by priority" value={priority} onChange={setPriority}>
            <option value="all">All priorities</option>
            {Object.entries(priorityMeta).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {view === 'board' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {columns.map(({ status, icon: Icon, accent }) => {
            const items = filtered.filter((t) => t.status === status)
            return (
              <section key={status} className="flex flex-col rounded-xl bg-slate-100/70 p-2 dark:bg-slate-900/50">
                <header className="flex items-center gap-2 px-2 py-2">
                  <Icon className={cn('size-4', accent)} />
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{taskStatusMeta[status].label}</h3>
                  <span className="ml-auto rounded-full bg-white px-2 text-xs font-medium tabular-nums text-slate-500 dark:bg-slate-800">{items.length}</span>
                </header>
                <div className="flex flex-1 flex-col gap-2">
                  {items.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => select(t.id)}
                      className={cn(
                        'card focus-ring p-3.5 text-left transition hover:border-slate-300 hover:shadow-sm dark:hover:border-slate-700',
                        selectedId === t.id && 'ring-2 ring-indigo-500',
                      )}
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-medium text-slate-500">{t.id}</span>
                        <PriorityBadge priority={t.priority} />
                      </div>
                      <p className="text-sm font-medium leading-snug text-slate-900 dark:text-white">{t.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{t.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <Avatar id={t.assignee} size="sm" />
                        <span className="text-[11px] text-slate-400">{relativeDate(t.updatedDate)}</span>
                      </div>
                    </button>
                  ))}
                  {!items.length && <p className="px-2 py-6 text-center text-xs text-slate-400">No tasks</p>}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:border-slate-800">
                <th className="px-4 py-3">Task</th>
                {showProject && <th className="px-4 py-3">Project</th>}
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((t) => (
                <tr key={t.id} onClick={() => select(t.id)} className="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3">
                    <span className="mr-2 font-mono text-xs text-slate-500">{t.id}</span>
                    <span className="font-medium text-slate-900 dark:text-white">{t.title}</span>
                  </td>
                  {showProject && <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{getProject(t.projectId)?.name}</td>}
                  <td className="px-4 py-3"><TaskStatusBadge status={t.status} /></td>
                  <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                  <td className="px-4 py-3"><Person id={t.assignee} /></td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(t.createdDate)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(t.updatedDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <p className="p-8 text-center text-sm text-slate-500">No tasks match these filters.</p>}
        </div>
      )}

      {selected && <TaskDrawer task={selected} onClose={() => select(null)} />}
    </div>
  )
}

function TaskDrawer({ task, onClose }: { task: Task; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const project = getProject(task.projectId)
  const rows: [string, React.ReactNode][] = [
    ['Status', <TaskStatusBadge status={task.status} />],
    ['Priority', <PriorityBadge priority={task.priority} />],
    ['Assignee', <Person id={task.assignee} showRole />],
    ['Project', project ? <Link to={`/projects/${project.id}`} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">{project.name}</Link> : task.projectId],
    ['Created', formatDate(task.createdDate)],
    ['Updated', `${formatDate(task.updatedDate)} · ${relativeDate(task.updatedDate)}`],
  ]

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={task.title}>
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
          <div>
            <p className="font-mono text-xs font-medium text-slate-500">{task.id}</p>
            <h2 className="mt-1 text-lg font-semibold leading-snug text-slate-900 dark:text-white">{task.title}</h2>
          </div>
          <button onClick={onClose} className="focus-ring rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{task.description}</p>
          <dl className="mt-6 divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {rows.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{k}</dt>
                <dd className="text-right text-sm text-slate-800 dark:text-slate-200">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-xs text-slate-400">
            Source: <code className="font-mono">data/tasks.json</code> · assigned to {getMember(task.assignee).name}
          </p>
        </div>
      </aside>
    </div>
  )
}
