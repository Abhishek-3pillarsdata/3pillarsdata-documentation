#!/usr/bin/env node
/**
 * Installs the project-docs Claude Code skill on this machine (run it on each developer's machine).
 *
 *   npm run install-skill                            install, or update to the version in this clone
 *   npm run install-skill -- --developer <team-id>   also set who you are (otherwise the skill asks)
 *   npm run install-skill -- --no-push               commit portal updates, but don't push them
 *   npm run install-skill -- --no-hook               skill only; no automatic prompt after each task
 *   npm run install-skill -- --uninstall             remove the skill and hook (settings kept)
 *
 * What it touches (under ~/.claude, or $CLAUDE_CONFIG_DIR):
 *   skills/project-docs/      copy of ./skill/project-docs
 *   project-docs/config.json  { portalPath, developer, autoPush, auto }
 *   settings.json             adds one Stop hook (existing settings are preserved; a backup is written first)
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, copyFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'

const argv = process.argv.slice(2)
const flag = (name) => argv.includes(`--${name}`)
const value = (name) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : undefined
}

const slash = (p) => p.replace(/\\/g, '/')
const portalRoot = slash(resolve(dirname(fileURLToPath(import.meta.url)), '..'))
const claudeDir = resolve(process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude'))
const skillSrc = join(portalRoot, 'skill', 'project-docs')
const skillDest = join(claudeDir, 'skills', 'project-docs')
const configPath = join(claudeDir, 'project-docs', 'config.json')
const settingsPath = join(claudeDir, 'settings.json')
const hookScript = slash(join(skillDest, 'scripts', 'stop-hook.mjs'))
const hookCommand = `node "${hookScript}"`
const isOurHook = (h) => typeof h?.command === 'string' && /project-docs[\\/]+scripts[\\/]+stop-hook\.mjs/.test(h.command)

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback
  const raw = readFileSync(path, 'utf8')
  if (!raw.trim()) return fallback
  try {
    return JSON.parse(raw)
  } catch (e) {
    console.error(`✖ ${path} is not valid JSON (${e.message}). Fix it first; nothing was changed.`)
    process.exit(1)
  }
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n')
}

/** Removes our Stop hook entries (idempotent), dropping groups/keys that become empty. */
function withoutOurHook(settings) {
  const stop = settings.hooks?.Stop
  if (!Array.isArray(stop)) return settings
  const kept = stop
    .map((group) => ({ ...group, hooks: (group.hooks ?? []).filter((h) => !isOurHook(h)) }))
    .filter((group) => group.hooks.length)
  const hooks = { ...settings.hooks, Stop: kept }
  if (!kept.length) delete hooks.Stop
  const next = { ...settings, hooks }
  if (!Object.keys(hooks).length) delete next.hooks
  return next
}

function saveSettings(next) {
  if (existsSync(settingsPath)) copyFileSync(settingsPath, `${settingsPath}.bak-project-docs`)
  writeJson(settingsPath, next)
}

// ── Uninstall ────────────────────────────────────────────────────────────────
if (flag('uninstall')) {
  const settings = readJson(settingsPath, {})
  saveSettings(withoutOurHook(settings))
  rmSync(skillDest, { recursive: true, force: true })
  console.log('✔ Removed the project-docs skill and its Stop hook.')
  console.log(`  Kept your settings in ${slash(dirname(configPath))}/ (delete that folder to forget them).`)
  process.exit(0)
}

// ── Install / update ─────────────────────────────────────────────────────────
if (!existsSync(join(skillSrc, 'SKILL.md'))) {
  console.error(`✖ ${slash(skillSrc)}/SKILL.md not found. Run this from a full clone of the portal repo.`)
  process.exit(1)
}

// 1. Skill files (replace the previous copy completely)
rmSync(skillDest, { recursive: true, force: true })
mkdirSync(dirname(skillDest), { recursive: true })
cpSync(skillSrc, skillDest, { recursive: true })

// 2. Machine config (keeps existing values unless overridden)
const prev = readJson(configPath, {})
const config = {
  portalPath: portalRoot,
  developer: value('developer') ?? prev.developer ?? null,
  autoPush: flag('no-push') ? false : prev.autoPush ?? true,
  auto: flag('no-hook') ? false : prev.auto ?? true,
}
writeJson(configPath, config)

// 3. Stop hook in user settings (merge, never replace)
const settings = withoutOurHook(readJson(settingsPath, {}))
if (!flag('no-hook')) {
  settings.hooks ??= {}
  settings.hooks.Stop ??= []
  settings.hooks.Stop.push({ hooks: [{ type: 'command', command: hookCommand, timeout: 60 }] })
}
saveSettings(settings)

// 4. Warn about things that stop the workflow from reaching the website
const team = readJson(join(portalRoot, 'data', 'team.json'), [])
const notes = []
if (config.developer && !team.some((t) => t.id === config.developer)) {
  notes.push(`"${config.developer}" is not in data/team.json yet; the skill will ask for your name and role and add you.`)
}
if (!config.developer) notes.push('No developer id set; the skill will ask who you are the first time it runs.')
if (!existsSync(join(portalRoot, '.git'))) notes.push('This portal folder is not a git clone, so updates cannot be committed or pushed.')

console.log(`✔ project-docs skill installed

  Skill     ${slash(skillDest)}
  Portal    ${portalRoot}
  Config    ${slash(configPath)}   (developer: ${config.developer ?? 'not set'}, autoPush: ${config.autoPush})
  Hook      ${flag('no-hook') ? 'not installed (--no-hook)' : 'Stop hook added to ' + slash(settingsPath)}
${notes.map((n) => `\n  • ${n}`).join('')}

Next: restart Claude Code (or open /hooks once) so it loads the hook. Then, in a code repo, say
"add this project to the portal". The first run documents all existing features; after that, each
finished task is recorded automatically. Re-run this installer after pulling portal updates, or let the
skill do it for you.`)
