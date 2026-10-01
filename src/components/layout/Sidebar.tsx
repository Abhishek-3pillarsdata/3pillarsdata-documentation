import { NavLink } from 'react-router'
import { BookOpen, CalendarDays, FolderKanban, LayoutDashboard, Users, X } from 'lucide-react'
import { projects } from '../../data'
import { projectStatusMeta } from '../ui/Badge'
import { cn } from '../../utils/format'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'Projects', icon: FolderKanban, end: true },
  { to: '/meetings', label: 'Meeting notes', icon: CalendarDays },
  { to: '/team', label: 'Team', icon: Users },
]

const dotColor: Record<string, string> = {
  emerald: 'bg-emerald-500',
  sky: 'bg-sky-500',
  amber: 'bg-amber-500',
  indigo: 'bg-indigo-500',
}

const linkCls = ({ isActive }: { isActive: boolean }) =>
  cn(
    'focus-ring group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white',
  )

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <div
        className={cn('fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition lg:hidden', open ? 'opacity-100' : 'pointer-events-none opacity-0')}
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 px-5">
          <NavLink to="/" onClick={onClose} className="focus-ring flex items-center gap-2.5 rounded-lg">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-500/30">
              <BookOpen className="size-4" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold text-slate-900 dark:text-white">Project Docs</span>
              <span className="block text-[11px] text-slate-500">Engineering portal</span>
            </span>
          </NavLink>
          <button onClick={onClose} className="focus-ring rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800" aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          <div className="space-y-0.5">
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={linkCls} onClick={onClose}>
                <Icon className="size-4 shrink-0 opacity-80" />
                <span className="flex-1">{label}</span>
              </NavLink>
            ))}
          </div>

          <div>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Projects</p>
            <div className="space-y-0.5">
              {projects.map((p) => (
                <NavLink key={p.id} to={`/projects/${p.id}`} className={linkCls} onClick={onClose}>
                  <span className={cn('size-2 shrink-0 rounded-full', dotColor[projectStatusMeta[p.status]?.tone] ?? 'bg-slate-400')} />
                  <span className="flex-1 truncate">{p.name}</span>
                </NavLink>
              ))}
              {!projects.length && <p className="px-3 text-xs text-slate-400">No projects yet</p>}
            </div>
          </div>
        </nav>

        <div className="border-t border-slate-200 px-5 py-4 text-[11px] leading-relaxed text-slate-500 dark:border-slate-800">
          Content lives in the Git repo under <code className="font-mono text-slate-700 dark:text-slate-300">data/</code> and{' '}
          <code className="font-mono text-slate-700 dark:text-slate-300">docs/</code>.
        </div>
      </aside>
    </>
  )
}
