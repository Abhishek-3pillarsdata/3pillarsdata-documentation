// Claude Code Stop hook: after each turn, if a linked code repo changed since it was last
// recorded in the portal, block the stop and ask Claude to run the project-docs skill.
// Must never break a session: every failure path exits 0 silently.
import { readFileSync } from 'node:fs'
import {
  headTree, loadConfig, loadState, projectForRemote, remoteUrl, repoKey, repoRoot, saveState, script, workingTree, q,
} from './lib.mjs'

try {
  const input = JSON.parse(readFileSync(0, 'utf8') || '{}')
  // Claude is already continuing because of this hook: let it stop this time.
  if (input.stop_hook_active) process.exit(0)

  const config = loadConfig()
  if (!config || config.auto === false) process.exit(0)

  const root = repoRoot(input.cwd || process.cwd())
  if (!root) process.exit(0)
  const portalRoot = repoRoot(config.portalPath)
  if (portalRoot && repoKey(portalRoot) === repoKey(root)) process.exit(0)

  const state = loadState()
  let entry = state.repos[repoKey(root)]

  if (!entry) {
    // Not linked on this machine. If a teammate already onboarded this repo (its remote is a
    // portal project's `repository`), link it now; uncommitted work still counts as new.
    const project = projectForRemote(config, remoteUrl(root))
    if (!project) process.exit(0)
    const base = headTree(root)
    entry = state.repos[repoKey(root)] = { root, projectId: project.id, tree: base, documentedTree: base, linkedAt: new Date().toISOString() }
    saveState(state)
  }
  if (entry.paused) process.exit(0)

  const tree = workingTree(root)
  if (!tree || tree === entry.tree) process.exit(0)

  const reason = [
    `[project-docs] Code in ${root} changed since it was last recorded in the documentation portal (project "${entry.projectId}").`,
    `If you just finished a task (feature, fix, refactor, completed task), use the project-docs skill now to record it in the portal.`,
    `If the work is unfinished, trivial (formatting, typo, lockfile/config noise), or nothing was really done, instead run:`,
    `  ${script('mark.mjs')} --defer --repo ${q(root)}`,
    `and then end your turn normally. There is no need to tell the user about a deferral.`,
  ].join('\n')

  process.stdout.write(JSON.stringify({ decision: 'block', reason }))
} catch {
  // ignore: documentation must never get in the way of the actual work
}
process.exit(0)
