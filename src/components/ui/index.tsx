import { Link } from 'react-router'
import type { LucideIcon } from 'lucide-react'
import { getMember } from '../../data'
import { cn, initials } from '../../utils/format'

export { Badge, ProjectStatusBadge, TaskStatusBadge, PriorityBadge, IssueStatusBadge } from './Badge'

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('card', className)} {...rest}>
      {children}
    </div>
  )
}

export function CardHeader({ title, icon: Icon, action, className }: { title: string; icon?: LucideIcon; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5 dark:border-slate-800', className)}>
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
        {Icon && <Icon className="size-4 text-slate-400" />}
        {title}
      </h2>
      {action}
    </div>
  )
}

export function CardLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="focus-ring rounded text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
      {children}
    </Link>
  )
}

export function PageHeader({ title, description, eyebrow, actions }: { title: React.ReactNode; description?: React.ReactNode; eyebrow?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

const avatarColors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500', 'bg-violet-500']

function colorFor(id: string) {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return avatarColors[h % avatarColors.length]
}

export function Avatar({ id, size = 'md', ring }: { id: string; size?: 'sm' | 'md' | 'lg'; ring?: boolean }) {
  const m = getMember(id)
  const sizes = { sm: 'size-6 text-[10px]', md: 'size-8 text-xs', lg: 'size-12 text-base' }
  return (
    <span
      title={m.name}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        sizes[size],
        colorFor(m.id),
        ring && 'ring-2 ring-white dark:ring-slate-900',
      )}
    >
      {initials(m.name)}
    </span>
  )
}

export function Person({ id, size = 'sm', showRole }: { id: string; size?: 'sm' | 'md'; showRole?: boolean }) {
  const m = getMember(id)
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <Avatar id={id} size={size} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-200">{m.name}</span>
        {showRole && m.role && <span className="block truncate text-xs text-slate-500">{m.role}</span>}
      </span>
    </span>
  )
}

export function AvatarStack({ ids, max = 4 }: { ids: string[]; max?: number }) {
  return (
    <span className="flex -space-x-2">
      {ids.slice(0, max).map((id) => (
        <Avatar key={id} id={id} size="sm" ring />
      ))}
      {ids.length > max && (
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600 ring-2 ring-white dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-900">
          +{ids.length - max}
        </span>
      )}
    </span>
  )
}

export function ProgressBar({ value, size = 'md', className }: { value: number; size?: 'sm' | 'md'; className?: string }) {
  const v = Math.max(0, Math.min(100, value))
  const color = v >= 100 ? 'bg-emerald-500' : v >= 60 ? 'bg-indigo-500' : v >= 30 ? 'bg-sky-500' : 'bg-amber-500'
  return (
    <div
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800', size === 'sm' ? 'h-1.5' : 'h-2', className)}
    >
      <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${v}%` }} />
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-slate-700">
      <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <Icon className="size-5 text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function StatCard({ label, value, icon: Icon, hint, tone = 'indigo', to }: { label: string; value: React.ReactNode; icon: LucideIcon; hint?: React.ReactNode; tone?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky'; to?: string }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    sky: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
  }
  const body = (
    <>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <span className={cn('flex size-9 items-center justify-center rounded-lg', tones[tone])}>
          <Icon className="size-[18px]" />
        </span>
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums dark:text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </>
  )
  const cls = 'card block p-5 transition'
  return to ? (
    <Link to={to} className={cn(cls, 'focus-ring hover:border-slate-300 hover:shadow-sm dark:hover:border-slate-700')}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-slate-200/70 dark:bg-slate-800', className)} />
}

export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton className="mb-3 h-4 w-24" />
      <Skeleton className="mb-8 h-8 w-72" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-72 lg:col-span-2" />
        <Skeleton className="h-72" />
      </div>
    </div>
  )
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: React.ReactNode }[] }) {
  return (
    <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'focus-ring inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition',
            value === o.value ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Select({ value, onChange, children, label }: { value: string; onChange: (v: string) => void; children: React.ReactNode; label: string }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="focus-ring h-8 rounded-lg border border-slate-200 bg-white pl-2.5 pr-8 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
    >
      {children}
    </select>
  )
}
