import { Link } from 'react-router'
import { Ban, CheckCircle2, Circle, Loader } from 'lucide-react'
import type { Task, TaskStatus } from '../types'
import { getProject } from '../data'
import { taskColumns } from '../utils/tasks'
import { Badge, Person } from './ui'
import { cn } from '../utils/format'

export const taskStatusIcon: Record<TaskStatus, { icon: typeof Circle; cls: string }> = {
  todo: { icon: Circle, cls: 'text-slate-400' },
  'in-progress': { icon: Loader, cls: 'text-sky-500' },
  blocked: { icon: Ban, cls: 'text-rose-500' },
  done: { icon: CheckCircle2, cls: 'text-emerald-500' },
}

/** Four-column board: To do · In progress · Blocked · Done. */
export function TaskBoard({ tasks, showProject }: { tasks: Task[]; showProject?: boolean }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {taskColumns.map(({ status, label }) => {
        const items = tasks.filter((t) => t.status === status)
        const { icon: Icon, cls } = taskStatusIcon[status]
        return (
          <section key={status} className="flex flex-col rounded-xl bg-slate-100/70 p-2 dark:bg-slate-900/50">
            <header className="flex items-center gap-2 px-2 py-2">
              <Icon className={cn('size-4', cls)} />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</h3>
              <span className="ml-auto rounded-full bg-white px-2 text-xs font-medium tabular-nums text-slate-500 dark:bg-slate-800">{items.length}</span>
            </header>
            <div className="flex flex-1 flex-col gap-2">
              {items.map((t, i) => (
                <article key={i} className="card p-3.5">
                  <p className={cn('text-sm font-medium leading-snug', status === 'done' ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white')}>{t.title}</p>
                  {t.note && (
                    <p className={cn('mt-1 text-xs', status === 'blocked' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400')}>{t.note}</p>
                  )}
                  {(t.person || showProject) && (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      {t.person ? <Person id={t.person} /> : <span />}
                      {showProject && (
                        <Link to={`/projects/${t.projectId}/tasks`}>
                          <Badge tone="indigo">{getProject(t.projectId)?.name ?? t.projectId}</Badge>
                        </Link>
                      )}
                    </div>
                  )}
                </article>
              ))}
              {!items.length && <p className="px-2 py-6 text-center text-xs text-slate-400">Nothing here</p>}
            </div>
          </section>
        )
      })}
    </div>
  )
}

/** How tasks get added — shown next to every board, since the website itself is read-only. */
export function TaskHelp({ editUrl }: { editUrl?: string }) {
  return (
    <span className="block text-xs leading-relaxed text-slate-500 dark:text-slate-400">
      Tasks are only added by people.{' '}
      {editUrl ? (
        <>
          Admins: click <span className="font-medium text-slate-700 dark:text-slate-300">Edit tasks</span>, add a line under a heading (or move a line to
          another heading), then <span className="font-medium text-slate-700 dark:text-slate-300">Commit changes</span>.{' '}
        </>
      ) : null}
      Developers: type <code className="rounded bg-slate-100 px-1 font-mono dark:bg-slate-800">/add-this task: …</code> in Claude Code.
    </span>
  )
}
