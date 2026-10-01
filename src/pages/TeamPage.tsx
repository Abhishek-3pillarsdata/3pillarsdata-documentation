import { Link } from 'react-router'
import { Mail, Users } from 'lucide-react'
import { projects, team } from '../data'
import { Avatar, Card, EmptyState, PageHeader } from '../components/ui'

export default function TeamPage() {
  return (
    <>
      <PageHeader eyebrow="Team" title="People" description="Team members referenced across projects. Source: data/team.json." />
      {!team.length && <EmptyState icon={Users} title="No team members yet" description={<>Add people to <code className="font-mono">data/team.json</code>.</>} />}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {team.map((m) => {
          const owned = projects.filter((p) => p.owner === m.id)
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
              <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                {owned.map((p) => (
                  <Link key={p.id} to={`/projects/${p.id}`} className="block font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                    Owner of {p.name}
                  </Link>
                ))}
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
