#!/usr/bin/env node
/**
 * Validates the documentation content in /data and /docs.
 * Run with `npm run validate` (also runs automatically before `npm run build`).
 *
 * Checks: JSON parses, required fields, allowed enum values, YYYY-MM-DD dates,
 * unique IDs, and that every reference (projectId, assignee, developer, relatedTasks,
 * meeting participants) points at something that exists.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const errors = []
const warnings = []
const err = (file, msg) => errors.push(`${file}: ${msg}`)
const warn = (file, msg) => warnings.push(`${file}: ${msg}`)

function readJson(rel) {
  try {
    return JSON.parse(readFileSync(join(root, rel), 'utf8'))
  } catch (e) {
    err(rel, `cannot parse JSON (${e.message})`)
    return []
  }
}

const DATE = /^\d{4}-\d{2}-\d{2}$/
const isDate = (v) => typeof v === 'string' && DATE.test(v) && !Number.isNaN(Date.parse(v))
const enums = {
  projectStatus: ['planning', 'active', 'on-hold', 'completed'],
  taskStatus: ['todo', 'in-progress', 'completed', 'blocked'],
  priority: ['low', 'medium', 'high', 'critical'],
  issueStatus: ['open', 'investigating', 'resolved'],
}

function checkItems(file, items, spec) {
  if (!Array.isArray(items)) return err(file, 'must be a JSON array')
  const ids = new Set()
  items.forEach((item, i) => {
    const where = `[${i}]${item?.id ? ` (${item.id})` : ''}`
    for (const [key, rule] of Object.entries(spec)) {
      const v = item[key]
      const optional = rule.endsWith('?')
      const type = rule.replace('?', '')
      if (v === undefined || v === null || v === '') {
        if (!optional) err(file, `${where} missing "${key}"`)
        continue
      }
      if (type === 'string' && typeof v !== 'string') err(file, `${where} "${key}" must be a string`)
      if (type === 'number' && typeof v !== 'number') err(file, `${where} "${key}" must be a number`)
      if (type === 'date' && !isDate(v)) err(file, `${where} "${key}" must be YYYY-MM-DD, got "${v}"`)
      if (type === 'string[]' && !(Array.isArray(v) && v.every((x) => typeof x === 'string'))) err(file, `${where} "${key}" must be an array of strings`)
      if (type in enums && !enums[type].includes(v)) err(file, `${where} "${key}" must be one of ${enums[type].join(', ')}; got "${v}"`)
    }
    if (item.id) {
      if (ids.has(item.id)) err(file, `duplicate id "${item.id}"`)
      ids.add(item.id)
    }
  })
  return ids
}

// ── JSON files ───────────────────────────────────────────────────────────────
const team = readJson('data/team.json')
const projects = readJson('data/projects.json')
const tasks = readJson('data/tasks.json')
const updates = readJson('data/updates.json')
const issues = readJson('data/issues.json')

const teamIds = checkItems('data/team.json', team, { id: 'string', name: 'string', role: 'string', email: 'string?', focus: 'string?' })
const projectIds = checkItems('data/projects.json', projects, {
  id: 'string', key: 'string', name: 'string', description: 'string', objectives: 'string[]', status: 'projectStatus',
  progress: 'number', owner: 'string', techStack: 'string[]', startDate: 'date', targetDate: 'date?', lastUpdated: 'date', repository: 'string?',
})
const taskIds = checkItems('data/tasks.json', tasks, {
  id: 'string', projectId: 'string', title: 'string', description: 'string', priority: 'priority', status: 'taskStatus',
  assignee: 'string', createdDate: 'date', updatedDate: 'date',
})
checkItems('data/updates.json', updates, {
  id: 'string', projectId: 'string', date: 'date', developer: 'string', summary: 'string', changes: 'string[]',
  filesAffected: 'string[]', problems: 'string[]', solutions: 'string[]', nextSteps: 'string[]', relatedTasks: 'string[]?',
})
checkItems('data/issues.json', issues, {
  id: 'string', projectId: 'string', title: 'string', description: 'string', severity: 'priority', status: 'issueStatus',
  reportedBy: 'string', createdDate: 'date', updatedDate: 'date', relatedTasks: 'string[]?', resolution: 'string?',
})

// ── Cross references ─────────────────────────────────────────────────────────
const keys = new Map()
for (const p of projects) {
  if (!teamIds.has(p.owner)) err('data/projects.json', `${p.id}: owner "${p.owner}" is not in data/team.json`)
  if (typeof p.progress === 'number' && (p.progress < 0 || p.progress > 100)) err('data/projects.json', `${p.id}: progress must be 0–100`)
  if (!/^[a-z0-9-]+$/.test(p.id ?? '')) err('data/projects.json', `${p.id}: id must be lowercase-kebab-case (it is also the docs folder name)`)
  if (!existsSync(join(root, 'docs/projects', p.id ?? ''))) warn('data/projects.json', `${p.id}: no docs/projects/${p.id}/ folder`)
  if (keys.has(p.key)) err('data/projects.json', `${p.id}: key "${p.key}" already used by ${keys.get(p.key)}`)
  keys.set(p.key, p.id)
  for (const [i, m] of (p.milestones ?? []).entries()) {
    if (!m.title || !isDate(m.date) || typeof m.done !== 'boolean') err('data/projects.json', `${p.id}: milestones[${i}] needs title, date (YYYY-MM-DD) and done (true/false)`)
  }
}

const projectKey = new Map(projects.map((p) => [p.id, p.key]))
for (const t of tasks) {
  if (!projectIds.has(t.projectId)) err('data/tasks.json', `${t.id}: unknown projectId "${t.projectId}"`)
  if (!teamIds.has(t.assignee)) err('data/tasks.json', `${t.id}: assignee "${t.assignee}" is not in data/team.json`)
  const key = projectKey.get(t.projectId)
  if (key && !t.id?.startsWith(key + '-')) warn('data/tasks.json', `${t.id}: task ids for ${t.projectId} should start with "${key}-"`)
  if (isDate(t.createdDate) && isDate(t.updatedDate) && t.updatedDate < t.createdDate) err('data/tasks.json', `${t.id}: updatedDate is before createdDate`)
}

for (const [file, list, personKey] of [['data/updates.json', updates, 'developer'], ['data/issues.json', issues, 'reportedBy']]) {
  for (const u of list) {
    if (!projectIds.has(u.projectId)) err(file, `${u.id}: unknown projectId "${u.projectId}"`)
    if (!teamIds.has(u[personKey])) err(file, `${u.id}: ${personKey} "${u[personKey]}" is not in data/team.json`)
    for (const t of u.relatedTasks ?? []) if (!taskIds.has(t)) err(file, `${u.id}: relatedTasks references unknown task "${t}"`)
  }
}

// ── Markdown docs ────────────────────────────────────────────────────────────
for (const p of projects) {
  const dir = join(root, 'docs/projects', p.id ?? '')
  if (!existsSync(dir)) continue
  for (const f of ['overview.md', 'architecture.md', 'technical.md', 'changelog.md']) {
    if (!existsSync(join(dir, f))) warn(`docs/projects/${p.id}`, `missing ${f}`)
  }

  const clPath = join(dir, 'changelog.md')
  if (existsSync(clPath)) {
    const lines = readFileSync(clPath, 'utf8').split(/\r?\n/)
    const dates = []
    lines.forEach((l, i) => {
      if (/^##\s/.test(l)) {
        const m = /^##\s+(\d{4}-\d{2}-\d{2})\b/.exec(l)
        if (!m || !isDate(m[1])) err(`docs/projects/${p.id}/changelog.md:${i + 1}`, `changelog headings must start with a date: "## YYYY-MM-DD"`)
        else dates.push(m[1])
      }
    })
    if (dates.join() !== [...dates].sort().reverse().join()) warn(`docs/projects/${p.id}/changelog.md`, 'entries should be newest first')
    if (new Set(dates).size !== dates.length) warn(`docs/projects/${p.id}/changelog.md`, 'duplicate date headings; merge them into one section')
  }

  const mDir = join(dir, 'meetings')
  if (!existsSync(mDir)) continue
  for (const f of readdirSync(mDir).filter((f) => f.endsWith('.md'))) {
    const rel = `docs/projects/${p.id}/meetings/${f}`
    const src = readFileSync(join(mDir, f), 'utf8').replace(/\r\n/g, '\n')
    if (!/^\d{4}-\d{2}-\d{2}(-[a-z0-9-]+)?\.md$/.test(f)) err(rel, 'file name must be YYYY-MM-DD.md or YYYY-MM-DD-some-slug.md')
    const fm = /^---\n([\s\S]*?)\n---/.exec(src)
    if (!fm) {
      err(rel, 'missing frontmatter (--- title / date / participants ---)')
      continue
    }
    const get = (k) => new RegExp(`^${k}\\s*:\\s*(.*)$`, 'm').exec(fm[1])?.[1]?.trim()
    if (!get('title')) err(rel, 'frontmatter missing "title"')
    const date = get('date')
    if (!isDate(date)) err(rel, `frontmatter "date" must be YYYY-MM-DD`)
    else if (!f.startsWith(date)) warn(rel, `file name does not start with its date (${date})`)
    const participants = (get('participants') ?? '').replace(/^\[|\]$/g, '').split(',').map((s) => s.trim()).filter(Boolean)
    if (!participants.length) warn(rel, 'no participants listed')
    for (const who of participants) if (!teamIds.has(who)) warn(rel, `participant "${who}" is not a team.json id (shown as plain text)`)
    for (const section of ['Topics Discussed', 'Decisions', 'Action Items']) {
      if (!new RegExp(`^##\\s+${section}`, 'mi').test(src)) warn(rel, `missing "## ${section}" section`)
    }
  }
}

// ── Report ───────────────────────────────────────────────────────────────────
for (const w of warnings) console.warn(`  ⚠  ${w}`)
for (const e of errors) console.error(`  ✖  ${e}`)
if (errors.length) {
  console.error(`\nValidation failed: ${errors.length} error(s), ${warnings.length} warning(s).`)
  process.exit(1)
}
console.log(`✔ Content valid — ${projects.length} projects, ${tasks.length} tasks, ${updates.length} updates, ${issues.length} issues, ${team.length} team members${warnings.length ? ` (${warnings.length} warnings)` : ''}.`)
