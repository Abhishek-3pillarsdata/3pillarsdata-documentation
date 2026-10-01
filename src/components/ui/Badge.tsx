import type { ProjectStatus } from '../../types'
import { cn } from '../../utils/format'

type Tone = 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet'

const tones: Record<Tone, string> = {
  slate: 'bg-slate-100 text-slate-700 ring-slate-500/15 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-400/20',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/15 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/25',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/25',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/25',
  rose: 'bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/25',
  sky: 'bg-sky-50 text-sky-700 ring-sky-600/15 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/25',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/15 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/25',
}

const dots: Record<Tone, string> = {
  slate: 'bg-slate-400',
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  sky: 'bg-sky-500',
  violet: 'bg-violet-500',
}

export function Badge({ tone = 'slate', dot, children, className }: { tone?: Tone; dot?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset', tones[tone], className)}>
      {dot && <span className={cn('size-1.5 rounded-full', dots[tone])} />}
      {children}
    </span>
  )
}

export const projectStatusMeta: Record<ProjectStatus, { label: string; tone: Tone }> = {
  planning: { label: 'Planning', tone: 'sky' },
  active: { label: 'Active', tone: 'emerald' },
  'on-hold': { label: 'On hold', tone: 'amber' },
  completed: { label: 'Completed', tone: 'indigo' },
}

export const ProjectStatusBadge = ({ status }: { status: ProjectStatus }) => {
  const m = projectStatusMeta[status] ?? { label: status, tone: 'slate' as Tone }
  return <Badge tone={m.tone} dot>{m.label}</Badge>
}

