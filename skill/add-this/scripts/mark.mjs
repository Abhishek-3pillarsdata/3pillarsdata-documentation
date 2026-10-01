// Remembers, on this machine only, which portal project a code repo belongs to and which code
// state was last added to the portal (so the next /add-this knows what changed).
//
//   mark.mjs --register <projectId> --repo <path>   link the repo to a portal project (and mark it done)
//   mark.mjs --done --repo <path>                   the current code state is now in the portal
//   mark.mjs --unlink --repo <path>                 forget this repo
import { headSha, loadConfig, loadState, parseArgs, repoKey, repoRoot, saveState, workingTree } from './lib.mjs'

const args = parseArgs(process.argv.slice(2))
const fail = (msg) => {
  console.error(`mark: ${msg}`)
  process.exit(1)
}

const config = loadConfig()
if (!config) fail('add-this is not installed (no config). Run `npm run install-skill` in the portal repo.')

const root = repoRoot(args.repo || process.cwd())
if (!root) fail(`not a git repository: ${args.repo || process.cwd()}`)
const portalRoot = repoRoot(config.portalPath)
if (portalRoot && repoKey(portalRoot) === repoKey(root)) fail('that is the portal repo; pass --repo <project folder>')

const state = loadState()
const key = repoKey(root)
const snapshot = () => ({ documentedTree: workingTree(root), documentedHead: headSha(root) })

if (args.unlink) {
  delete state.repos[key]
} else if (args.register) {
  if (typeof args.register !== 'string') fail('--register needs a project id')
  state.repos[key] = { root, projectId: args.register, ...snapshot() }
} else if (args.done) {
  if (!state.repos[key]) fail(`repo is not linked to a portal project yet: ${root}`)
  Object.assign(state.repos[key], snapshot())
} else {
  fail('nothing to do; use --register <id>, --done or --unlink')
}

saveState(state)
console.log(JSON.stringify({ ok: true, repo: root, entry: state.repos[key] ?? null }))
