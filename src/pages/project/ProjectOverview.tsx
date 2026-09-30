import { CheckCircle2, Circle, Cpu, FileText, Flag, Target, Workflow } from 'lucide-react'
import { getDoc, tasksFor, updatesFor } from '../../data'
import { Card, CardHeader, CardLink, EmptyState } from '../../components/ui'
import { Markdown } from '../../components/Markdown'
import { UpdateTimeline } from '../../components/UpdateTimeline'
import { TaskStatusBar } from '../../components/TaskStatusBar'
import { useProject } from './ProjectLayout'
import { cn, formatDate } from '../../utils/format'

export default function ProjectOverview() {
  const project = useProject()
  const doc = getDoc(project.id, 'overview')
  const updates = updatesFor(project.id)
  const tasks = tasksFor(project.id)

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader title="Objectives" icon={Target} />
          <ul className="grid gap-3 p-5 sm:grid-cols-2">
            {project.objectives.map((o, i) => (
              <li key={i} className="flex gap-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800/40 dark:text-slate-300">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">{i + 1}</span>
                {o}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 sm:p-8">
          {doc ? (
            <Markdown>{doc.body}</Markdown>
          ) : (
            <EmptyState icon={FileText} title="No overview written yet" description={<>Create <code className="font-mono">docs/projects/{project.id}/overview.md</code>.</>} />
          )}
        </Card>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <Workflow className="size-5 text-slate-400" /> Recent updates
            </h2>
            <CardLink to="updates">All updates →</CardLink>
          </div>
          <UpdateTimeline updates={updates.slice(0, 2)} compact />
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader title="Tasks" icon={CheckCircle2} action={<CardLink to="tasks">Board →</CardLink>} />
          <div className="p-5">
            <TaskStatusBar tasks={tasks} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Technology stack" icon={Cpu} />
          <div className="flex flex-wrap gap-2 p-5">
            {project.techStack.map((t) => (
              <span key={t} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {t}
              </span>
            ))}
          </div>
        </Card>

        {project.milestones?.length ? (
          <Card>
            <CardHeader title="Milestones" icon={Flag} />
            <ol className="p-5">
              {project.milestones.map((m, i) => (
                <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < project.milestones!.length - 1 && (
                    <span className={cn('absolute left-[9px] top-6 h-[calc(100%-20px)] w-px', m.done ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-slate-200 dark:bg-slate-700')} />
                  )}
                  {m.done ? <CheckCircle2 className="size-5 shrink-0 text-emerald-500" /> : <Circle className="size-5 shrink-0 text-slate-300 dark:text-slate-600" />}
                  <div>
                    <p className={cn('text-sm font-medium', m.done ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white')}>{m.title}</p>
                    <p className="text-xs text-slate-500">
                      {formatDate(m.date)} {m.done ? '· Done' : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        ) : null}

        <Card className="p-5 text-xs text-slate-500">
          <p>
            Started <span className="font-medium text-slate-700 dark:text-slate-300">{formatDate(project.startDate)}</span>
          </p>
        </Card>
      </div>
    </div>
  )
}
