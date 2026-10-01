#!/usr/bin/env node
/**
 * Installs the add-this Claude Code skill on this machine (run it on each developer's machine).
 * After installing, type /add-this in Claude Code inside a project folder to add or refresh that
 * project in the portal. Nothing runs automatically.
 *
 *   npm run install-skill                            install, or update to the version in this clone
 *   npm run install-skill -- --developer <team-id>   also set who you are (otherwise the skill asks)
 *   npm run install-skill -- --no-push               commit portal updates, but don't push them
 *   npm run install-skill -- --uninstall             remove the skill (settings kept)
 *
 * What it touches (under ~/.claude, or $CLAUDE_CONFIG_DIR):
 *   skills/add-this/          copy of ./skill/add-this
 *   project-docs/config.json  { portalPath, developer, autoPush }
 *   settings.json             only to remove the automatic Stop hook older versions added
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
const skillSrc = join(portalRoot, 'skill', 'add-this')
const skillDest = join(claudeDir, 'skills', 'add-this')
const oldSkillDest = join(claudeDir, 'skills', 'project-docs')
const configPath = join(claudeDir, 'project-docs', 'config.json')
const settingsPath = join(claudeDir, 'settings.json')
const isOldHook = (h) => typeof h?.command === 'string' && /(project-docs|add-this)[\\/]+scripts[\\/]+stop-hook\.mjs/.test(h.command)

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

/** Removes the automatic Stop hook that earlier versions installed. Returns true if anything changed. */
function removeOldHook() {
  const settings = readJson(settingsPath, null)
  const stop = settings?.hooks?.Stop
  if (!Array.isArray(stop) || !stop.some((g) => (g.hooks ?? []).some(isOldHook))) return false
  const kept = stop.map((g) => ({ ...g, hooks: (g.hooks ?? []).filter((h) => !isOldHook(h)) })).filter((g) => g.hooks.length)
  const hooks = { ...settings.hooks, Stop: kept }
  if (!kept.length) delete hooks.Stop
  const next = { ...settings, hooks }
  if (!Object.keys(hooks).length) delete next.hooks
  copyFileSync(settingsPath, `${settingsPath}.bak-add-this`)
  writeJson(settingsPath, next)
  return true
}

// ── Uninstall ────────────────────────────────────────────────────────────────
if (flag('uninstall')) {
  removeOldHook()
  rmSync(skillDest, { recursive: true, force: true })
  rmSync(oldSkillDest, { recursive: true, force: true })
  console.log('✔ Removed the add-this skill.')
  console.log(`  Kept your settings in ${slash(dirname(configPath))}/ (delete that folder to forget them).`)
  process.exit(0)
}

// ── Install / update ─────────────────────────────────────────────────────────
if (!existsSync(join(skillSrc, 'SKILL.md'))) {
  console.error(`✖ ${slash(skillSrc)}/SKILL.md not found. Run this from a full clone of the portal repo.`)
  process.exit(1)
}

// 1. Skill files (replace the previous copy completely; remove the old project-docs skill)
rmSync(skillDest, { recursive: true, force: true })
rmSync(oldSkillDest, { recursive: true, force: true })
mkdirSync(dirname(skillDest), { recursive: true })
cpSync(skillSrc, skillDest, { recursive: true })

// 2. Machine config (keeps existing values unless overridden)
const prev = readJson(configPath, {})
const config = {
  portalPath: portalRoot,
  developer: value('developer') ?? prev.developer ?? null,
  autoPush: flag('no-push') ? false : prev.autoPush ?? true,
}
writeJson(configPath, config)

// 3. No automatic trigger: remove the Stop hook from older versions, if present
const removedHook = removeOldHook()

console.log(`✔ add-this skill installed

  Skill     ${slash(skillDest)}
  Portal    ${portalRoot}
  Config    ${slash(configPath)}   (developer: ${config.developer ?? 'not set — the skill will ask'}, autoPush: ${config.autoPush})${
    removedHook ? `\n  Removed   the old automatic hook from ${slash(settingsPath)} (backup: settings.json.bak-add-this)` : ''
  }

Next: restart Claude Code. In a project folder, type /add-this when you want that project's page
added or refreshed. Nothing updates on its own.`)
