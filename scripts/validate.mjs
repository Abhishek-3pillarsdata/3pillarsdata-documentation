#!/usr/bin/env node
/**
 * Validates the documentation content in /data and /docs.
 * Run with `npm run validate` (also runs automatically before `npm run build`).
 *
 * Checks: JSON parses, required fields, allowed values, unique ids, that every project
 * owner exists in team.json, that each project has its docs folder, the tasks.md layout,
 * and meeting note format.
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
const projectStatus = ['planning', 'active', 'on-hold', 'completed']

function checkItems(file, items, spec) {
  if (!Array.isArray(items)) {
    err(file, 'must be a JSON array')
    return new Set()
  }
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
      if (type === 'string[]' && !(Array.isArray(v) && v.every((x) => typeof x === 'string'))) err(file, `${where} "${key}" must be an array of strings`)
      if (type === 'status' && !projectStatus.includes(v)) err(file, `${where} "${key}" must be one of ${projectStatus.join(', ')}; got "${v}"`)
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

const teamIds = checkItems('data/team.json', team, { id: 'string', name: 'string', role: 'string', email: 'string?', focus: 'string?' })
checkItems('data/projects.json', projects, {
  id: 'string', key: 'string', name: 'string', description: 'string', objectives: 'string[]?',
  status: 'status', owner: 'string', techStack: 'string[]', repository: 'string?',
})

const keys = new Map()
for (const p of projects) {
  if (!teamIds.has(p.owner)) err('data/projects.json', `${p.id}: owner "${p.owner}" is not in data/team.json`)
  if (!/^[a-z0-9-]+$/.test(p.id ?? '')) err('data/projects.json', `${p.id}: id must be lowercase-kebab-case (it is also the docs folder name)`)
  if (keys.has(p.key)) err('data/projects.json', `${p.id}: key "${p.key}" already used by ${keys.get(p.key)}`)
  keys.set(p.key, p.id)
}

// ── Markdown docs ────────────────────────────────────────────────────────────
for (const p of projects) {
  const dir = join(root, 'docs/projects', p.id ?? '')
  if (!existsSync(dir)) {
    warn('data/projects.json', `${p.id}: no docs/projects/${p.id}/ folder`)
    continue
  }
  for (const f of ['overview.md', 'architecture.md', 'technical.md']) {
    if (!existsSync(join(dir, f))) warn(`docs/projects/${p.id}`, `missing ${f}`)
  }

  // tasks.md: bullets under "## To do / In progress / Blocked / Done" (matched loosely, like the site)
  const tasksPath = join(dir, 'tasks.md')
  if (existsSync(tasksPath)) {
    const rel = `docs/projects/${p.id}/tasks.md`
    const known = /^(to ?do|backlog|pending|not started|planned|in progress|doing|ongoing|wip|working on|blocked|on hold|waiting|stuck|done|completed?|finished)$/
    let inKnown = null
    readFileSync(tasksPath, 'utf8').split(/\r?\n/).forEach((line, i) => {
      const h = /^#{1,6}\s+(.+)$/.exec(line.trim())
      if (h) {
        const name = h[1].toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim()
        inKnown = known.test(name)
        if (!inKnown) warn(`${rel}:${i + 1}`, `heading "${h[1]}" is not one of To do / In progress / Blocked / Done; its tasks won't show`)
      } else if (/^\s*[-*+]\s+\S/.test(line) && inKnown === null) {
        warn(`${rel}:${i + 1}`, 'task is above the first heading, so it won\'t show; move it under "## To do" (or another heading)')
      }
    })
  } else {
    warn(`docs/projects/${p.id}`, 'missing tasks.md (copy docs/_templates/project/tasks.md)')
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
  }
}

// ── Report ───────────────────────────────────────────────────────────────────
for (const w of warnings) console.warn(`  ⚠  ${w}`)
for (const e of errors) console.error(`  ✖  ${e}`)
if (errors.length) {
  console.error(`\nValidation failed: ${errors.length} error(s), ${warnings.length} warning(s).`)
  process.exit(1)
}
console.log(`✔ Content valid — ${projects.length} projects, ${team.length} team members${warnings.length ? ` (${warnings.length} warnings)` : ''}.`)
