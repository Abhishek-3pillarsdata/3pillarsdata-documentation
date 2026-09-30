// Records documentation state for a code repo on this machine.
//
//   mark.mjs --register <projectId> --repo <path>   link repo to a portal project and mark it documented (after onboarding)
//   mark.mjs --documented --repo <path>             the current code state has been recorded in the portal
//   mark.mjs --defer --repo <path>                  don't prompt again until the code changes further
//   mark.mjs --pause | --resume --repo <path>       turn automatic prompts off/on for this repo
//   mark.mjs --unlink --repo <path>                 forget this repo
import { headSha, loadConfig, loadState, parseArgs, repoKey, repoRoot, saveState, workingTree } from './lib.mjs'

const args = parseArgs(process.argv.slice(2))
const fail = (msg) => {
  console.error(`mark: ${msg}`)
  process.exit(1)
}

const config = loadConfig()
if (!config) fail('project-docs is not installed (no config). Run `npm run install-skill` in the portal repo.')

const root = repoRoot(args.repo || process.cwd())
if (!root) fail(`not a git repository: ${args.repo || process.cwd()}`)
const portalRoot = repoRoot(config.portalPath)
if (portalRoot && repoKey(portalRoot) === repoKey(root)) fail('that is the portal repo; pass --repo <code repo path>')

const state = loadState()
const key = repoKey(root)
const entry = state.repos[key]
const now = new Date().toISOString()

if (args.unlink) {
  delete state.repos[key]
} else if (args.register) {
  if (typeof args.register !== 'string') fail('--register needs a project id')
  const tree = workingTree(root)
  state.repos[key] = { ...entry, root, projectId: args.register, tree, documentedTree: tree, documentedHead: headSha(root), documentedAt: now }
} else {
  if (!entry) fail(`repo is not linked to a portal project yet: ${root}`)
  if (args.documented) {
    const tree = workingTree(root)
    Object.assign(entry, { tree, documentedTree: tree, documentedHead: headSha(root), documentedAt: now })
  } else if (args.defer) {
    entry.tree = workingTree(root)
  } else if (args.pause) {
    entry.paused = true
  } else if (args.resume) {
    delete entry.paused
  } else {
    fail('nothing to do; use --register <id>, --documented, --defer, --pause, --resume or --unlink')
  }
}

saveState(state)
console.log(JSON.stringify({ ok: true, repo: root, entry: state.repos[key] ?? null }))
