// Shared helpers for the add-this skill scripts. Node built-ins only (no npm install needed).
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

// Installed layout: <claude dir>/skills/add-this/scripts/lib.mjs
export const skillDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const claudeDir = resolve(skillDir, '..', '..')
// Settings live outside the skill folder so re-installing never wipes them.
export const dataDir = join(claudeDir, 'project-docs')
export const configPath = join(dataDir, 'config.json')
export const statePath = join(dataDir, 'state.json')

export const slash = (p) => p.replace(/\\/g, '/')

export function readJson(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return fallback
  }
}

export function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n')
}

/** { portalPath, developer, autoPush } or null when the skill was never installed. */
export function loadConfig() {
  const c = readJson(configPath, null)
  if (!c?.portalPath) return null
  return { developer: null, autoPush: true, ...c }
}

export function loadState() {
  return { repos: {}, ...readJson(statePath, {}) }
}

export const saveState = (s) => writeJson(statePath, s)

/** Runs git and returns trimmed stdout, or null on any failure. */
export function git(args, cwd, env) {
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      env: env ? { ...process.env, ...env } : process.env,
      maxBuffer: 64 * 1024 * 1024,
    }).trim()
  } catch {
    return null
  }
}

export function repoRoot(cwd) {
  if (!cwd || !existsSync(cwd)) return null
  const r = git(['rev-parse', '--show-toplevel'], cwd)
  return r ? slash(resolve(r)) : null
}

/** Case-insensitive on Windows/macOS so the same folder always maps to the same state key. */
export const repoKey = (root) => (process.platform === 'linux' ? slash(root) : slash(root).toLowerCase())

export function remoteUrl(root) {
  const origin = git(['remote', 'get-url', 'origin'], root)
  if (origin) return origin
  const first = git(['remote'], root)?.split('\n')[0]
  return first ? git(['remote', 'get-url', first], root) : null
}

/** github.com/org/repo for https, ssh and scp-style URLs, so they compare equal. */
export function normRemote(url) {
  if (!url) return ''
  return url
    .trim()
    .replace(/\.git$/i, '')
    .replace(/^[a-z+]+:\/\//i, '')
    .replace(/^[^@/]+@/, '')
    .replace(/:(?!\d)/, '/')
    .replace(/\/+$/, '')
    .toLowerCase()
}

/**
 * Content fingerprint of the working tree, including untracked (non-ignored) files: the tree
 * hash a `git add -A && git commit` would produce. Used to show what changed since the last
 * /add-this. Uses a temporary index; the real index and working tree are never modified.
 */
export function workingTree(root) {
  const indexRel = git(['rev-parse', '--git-path', 'index'], root)
  if (!indexRel) return null
  const index = resolve(root, indexRel)
  const tmp = join(tmpdir(), `add-this-index-${process.pid}-${Date.now()}`)
  try {
    if (existsSync(index)) copyFileSync(index, tmp)
    const env = { GIT_INDEX_FILE: tmp }
    if (git(['add', '-A'], root, env) === null) return null
    return git(['write-tree'], root, env)
  } finally {
    rmSync(tmp, { force: true })
  }
}

export const headSha = (root) => git(['rev-parse', 'HEAD'], root)

export function portalProjects(portalPath) {
  return readJson(join(portalPath, 'data', 'projects.json'), [])
}

/** Portal project whose `repository` URL matches this repo's git remote. */
export function projectForRemote(portalPath, remote) {
  const want = normRemote(remote)
  if (!want) return null
  return portalProjects(portalPath).find((p) => normRemote(p.repository) === want) ?? null
}

/** Stable hash of every file under a directory (used to detect an outdated installed skill). */
export function hashDir(dir) {
  if (!existsSync(dir)) return null
  const h = createHash('sha1')
  const walk = (d) => {
    for (const name of readdirSync(d).sort()) {
      const p = join(d, name)
      if (statSync(p).isDirectory()) walk(p)
      else h.update(name).update(readFileSync(p, 'utf8').replace(/\r\n/g, '\n'))
    }
  }
  walk(dir)
  return h.digest('hex')
}

export function parseArgs(argv) {
  const out = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) out._.push(a)
    else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) out[a.slice(2)] = argv[++i]
    else out[a.slice(2)] = true
  }
  return out
}

export const q = (p) => `"${slash(p)}"`
export const script = (name) => `node ${q(join(skillDir, 'scripts', name))}`
