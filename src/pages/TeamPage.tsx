import { Link } from 'react-router'
import { Mail, Users } from 'lucide-react'
import { projects, tasks, team, updates } from '../data'
import { Avatar, Card, EmptyState, PageHeader } from '../components/ui'
import { relativeDate } from '../utils/format'

export default function TeamPage() {
  return (
    <>
      <PageHeader eyebrow="Team" title="People" description="Team members referenced across projects. Source: data/team.json." />
      {!team.length && <EmptyState icon={Users} title="No team members yet" description={<>Add people to <code className="font-mono">data/team.json</code>.</>} />}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {team.map((m) => {
          const owned = projects.filter((p) => p.owner === m.id)
          const open = tasks.filter((t) => t.assignee === m.id && t.status !== 'completed').length
          const done = tasks.filter((t) => t.assignee === m.id && t.status === 'completed').length
          const last = updates.find((u) => u.developer === m.id)
          return (
            <Card key={m.id} className="p-6">
              <div className="flex items-center gap-4">
                <Avatar id={m.id} size="lg" />
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{m.name}</h3>
                  <p className="text-sm text-slate-500">{m.role}</p>
                </div>
              </div>
              {m.focus && <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{m.focus}</p>}
              <dl className="mt-5 grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-800/40">
                {[
                  ['Projects', owned.length],
                  ['Open tasks', open],
                  ['Completed', done],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dd className="text-lg font-semibold tabular-nums text-slate-900 dark:text-white">{v}</dd>
                    <dt className="text-[11px] text-slate-500">{k}</dt>
                  </div>
                ))}
              </dl>
              <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                {owned.map((p) => (
                  <Link key={p.id} to={`/projects/${p.id}`} className="block font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                    Owner of {p.name}
                  </Link>
                ))}
                {last && <p>Last session {relativeDate(last.date).toLowerCase()}: {last.summary}</p>}
                {m.email && (
                  <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
                    <Mail className="size-3.5" /> {m.email}
                  </a>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}
