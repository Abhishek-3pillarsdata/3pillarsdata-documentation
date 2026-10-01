// First step of every /add-this run: pulls the latest portal and prints a JSON summary of who is
// working, which portal project this repo belongs to, and what changed since the last /add-this.
//
//   prepare.mjs --repo <code repo path> [--no-pull]
import { existsSync, readdirSync } from 'node:fs'
import { basename, join } from 'node:path'
import {
  git, hashDir, loadConfig, loadState, parseArgs, portalProjects, projectForRemote, q, readJson,
  remoteUrl, repoKey, repoRoot, script, skillDir, workingTree,
} from './lib.mjs'

const args = parseArgs(process.argv.slice(2))
const print = (o) => {
  console.log(JSON.stringify(o, null, 2))
  process.exit(0)
}
const lines = (s, max = 300) => {
  const all = (s || '').split('\n').filter(Boolean)
  return all.length > max ? [...all.slice(0, max), `… ${all.length - max} more`] : all
}

const config = loadConfig()
if (!config) print({ error: 'not-installed', fix: 'Clone the portal repo and run `npm run install-skill` inside it.' })

const portalRoot = repoRoot(config.portalPath)
if (!portalRoot) print({ error: 'portal-missing', portalPath: config.portalPath, fix: 'Clone the portal repo there, or re-run `npm run install-skill` from the clone you use.' })

// ── Portal ───────────────────────────────────────────────────────────────────
const portalRemote = remoteUrl(portalRoot)
let pull = 'skipped: portal has no git remote'
if (portalRemote && !args['no-pull']) {
  pull = git(['pull', '--rebase', '--autostash'], portalRoot) === null ? 'failed (offline or conflict) — continuing with local copy' : 'ok'
}
const team = readJson(join(portalRoot, 'data', 'team.json'), [])
const projects = portalProjects(portalRoot)
const portalSkill = join(portalRoot, 'skill', 'add-this')
const skillOutdated = existsSync(portalSkill) && hashDir(portalSkill) !== hashDir(skillDir)

const out = {
  developer: config.developer,
  developerInTeam: !!team.find((t) => t.id === config.developer),
  team: team.map((t) => `${t.id} (${t.name})`),
  autoPush: config.autoPush,
  portal: {
    path: portalRoot,
    remote: portalRemote,
    pull,
    projects: projects.map((p) => `${p.id} [${p.key}] ${p.name}`),
    ...(skillOutdated && { skillUpdate: `node ${q(join(portalRoot, 'scripts', 'install-skill.mjs'))}` }),
  },
}

// ── Code repo ────────────────────────────────────────────────────────────────
const root = repoRoot(args.repo || process.cwd())
if (!root) print({ ...out, mode: 'no-repo', note: 'Not inside a git repository. Ask the user which project folder this is about, then pass --repo.' })
if (repoKey(root) === repoKey(portalRoot)) print({ ...out, mode: 'portal', note: 'This is the portal repo itself. Follow its CLAUDE.md directly.' })

const remote = remoteUrl(root)
const entry = loadState().repos[repoKey(root)]
const linked = entry && projects.find((p) => p.id === entry.projectId)
const project = linked || projectForRemote(portalRoot, remote)
const tree = workingTree(root)
const hasObject = (sha) => sha && git(['cat-file', '-e', sha], root) !== null

const repo = {
  root,
  name: basename(root),
  remote,
  topLevel: readdirSync(root).filter((n) => n !== '.git').slice(0, 60),
}

const mode = linked ? 'update' : project ? 'link' : 'onboard'
const result = { ...out, mode, repo, project: project ? { id: project.id, key: project.key, name: project.name } : null }

if (mode === 'onboard') {
  result.recentCommits = lines(git(['log', '--format=%h %s', '-40'], root))
  result.repositoryForProjectsJson = remote ?? '(no git remote — leave "repository" out)'
} else {
  // Changes since the last /add-this on this machine (or everything uncommitted, for a freshly linked repo).
  const baseTree = entry && hasObject(entry.documentedTree) ? entry.documentedTree : null
  result.changesSinceLastAdd = {
    changed: !baseTree || tree !== baseTree,
    commits: entry && hasObject(entry.documentedHead)
      ? lines(git(['log', '--format=%h %s', `${entry.documentedHead}..HEAD`], root), 200)
      : lines(git(['log', '--format=%h %s', '-15'], root)),
    files: baseTree && tree ? lines(git(['diff', '--name-status', baseTree, tree], root)) : lines(git(['status', '--porcelain'], root)),
    diffCommand: baseTree && tree ? `git -C ${q(root)} diff ${baseTree} ${tree} -- <path>` : `git -C ${q(root)} diff HEAD -- <path>`,
  }
}

const repoArg = `--repo ${q(root)}`
result.commands = {
  register: `${script('mark.mjs')} --register <project-id> ${repoArg}`,
  done: `${script('mark.mjs')} --done ${repoArg}`,
  setDeveloper: `${script('config.mjs')} --developer <team-id>`,
  validate: `node ${q(join(portalRoot, 'scripts', 'validate.mjs'))}`,
}
print(result)
