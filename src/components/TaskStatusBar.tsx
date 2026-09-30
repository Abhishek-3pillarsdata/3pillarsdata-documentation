import type { Task, TaskStatus } from '../types'
import { taskStatusMeta } from './ui/Badge'
import { cn } from '../utils/format'

const order: TaskStatus[] = ['completed', 'in-progress', 'blocked', 'todo']
const fill: Record<TaskStatus, string> = {
  completed: 'bg-emerald-500',
  'in-progress': 'bg-sky-500',
  blocked: 'bg-rose-500',
  todo: 'bg-slate-300 dark:bg-slate-600',
}

/** Stacked bar of task counts by status, with a labelled legend (identity is never color-only). */
export function TaskStatusBar({ tasks }: { tasks: Task[] }) {
  if (!tasks.length) return <p className="text-sm text-slate-500">No tasks yet.</p>
  const total = tasks.length
  const counts = order.map((s) => ({ status: s, n: tasks.filter((t) => t.status === s).length }))
  return (
    <div>
      <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        {counts
          .filter((c) => c.n)
          .map((c) => (
            <div
              key={c.status}
              className={cn('h-full first:rounded-l-full last:rounded-r-full', fill[c.status])}
              style={{ width: `${(c.n / total) * 100}%` }}
              title={`${taskStatusMeta[c.status].label}: ${c.n} of ${tasks.length}`}
            />
          ))}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5">
        {counts.map((c) => (
          <li key={c.status} className="flex items-center gap-2 whitespace-nowrap text-xs">
            <span className={cn('size-2 rounded-full', fill[c.status])} />
            <span className="text-slate-600 dark:text-slate-400">{taskStatusMeta[c.status].label}</span>
            <span className="ml-auto font-semibold tabular-nums text-slate-900 dark:text-white">{c.n}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
