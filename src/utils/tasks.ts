import type { Task, TaskStatus } from '../types'
import { stripInline } from './markdown'

/**
 * Parses docs/projects/<id>/tasks.md. The file is meant to be easy to edit by hand on GitHub:
 *
 *   ## To do
 *   - Add PDF export (abhishek)
 *   ## Blocked
 *   - Deploy to staging (rahul) — waiting for server access
 *
 * Headings are matched loosely ("Todo", "Doing", "Completed"…); checkboxes like `- [ ]` are ignored.
 */
const headingStatus: [RegExp, TaskStatus][] = [
  [/^(to ?do|backlog|pending|not started|planned)$/, 'todo'],
  [/^(in progress|doing|ongoing|wip|working on)$/, 'in-progress'],
  [/^(blocked|on hold|waiting|stuck)$/, 'blocked'],
  [/^(done|completed?|finished)$/, 'done'],
]

export function statusForHeading(heading: string): TaskStatus | undefined {
  const h = stripInline(heading).toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim()
  return headingStatus.find(([re]) => re.test(h))?.[1]
}

export function parseTaskLine(text: string): Pick<Task, 'title' | 'person' | 'note'> {
  let title = text.replace(/^\[[ xX]\]\s*/, '').trim()
  let note: string | undefined
  const dash = /\s+(?:—|–|--)\s+/.exec(title) ?? /(?<=\))\s+-\s+/.exec(title)
  if (dash) {
    note = title.slice(dash.index + dash[0].length).trim() || undefined
    title = title.slice(0, dash.index).trim()
  }
  let person: string | undefined
  const who = /^(.*?)\s*\(([^()]+)\)\s*$/.exec(title)
  if (who && who[1]) {
    title = who[1].trim()
    person = who[2].trim()
  }
  return { title: stripInline(title), person, note: note && stripInline(note) }
}

export function parseTasks(projectId: string, raw: string): Task[] {
  const tasks: Task[] = []
  let status: TaskStatus | undefined
  for (const line of raw.replace(/\r\n/g, '\n').split('\n')) {
    const h = /^#{1,6}\s+(.+)$/.exec(line.trim())
    if (h) {
      status = statusForHeading(h[1])
      continue
    }
    const bullet = /^\s*[-*+]\s+(.+)$/.exec(line)
    if (status && bullet) tasks.push({ projectId, status, ...parseTaskLine(bullet[1]) })
  }
  return tasks
}

export const taskColumns: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'To do' },
  { status: 'in-progress', label: 'In progress' },
  { status: 'blocked', label: 'Blocked' },
  { status: 'done', label: 'Done' },
]

export const isOpen = (t: Task) => t.status !== 'done'

/** "2 to do · 1 in progress · 1 blocked", or '' when nothing is open. */
export function openSummary(tasks: Task[]): string {
  return taskColumns
    .filter((c) => c.status !== 'done')
    .map((c) => [tasks.filter((t) => t.status === c.status).length, c.label.toLowerCase()] as const)
    .filter(([n]) => n > 0)
    .map(([n, label]) => `${n} ${label}`)
    .join(' · ')
}

export const tasksTemplate = '## To do\n\n## In progress\n\n## Blocked\n\n## Done\n'
