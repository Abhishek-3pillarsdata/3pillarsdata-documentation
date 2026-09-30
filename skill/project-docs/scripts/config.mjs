// Shows or changes this machine's project-docs settings.
//
//   config.mjs                          print current config
//   config.mjs --developer <team-id>    who you are in the portal's data/team.json
//   config.mjs --auto-push true|false   push the portal after each update
//   config.mjs --auto true|false        prompt automatically after each task (Stop hook)
import { configPath, loadConfig, parseArgs, writeJson } from './lib.mjs'

const args = parseArgs(process.argv.slice(2))
const config = loadConfig()
if (!config) {
  console.error('project-docs is not installed (no config). Run `npm run install-skill` in the portal repo.')
  process.exit(1)
}

const bool = (v) => v === true || v === 'true' || v === 'yes' || v === '1'
if (args.developer !== undefined) config.developer = args.developer === true ? null : String(args.developer)
if (args['auto-push'] !== undefined) config.autoPush = bool(args['auto-push'])
if (args.auto !== undefined) config.auto = bool(args.auto)

if (Object.keys(args).length > 1) writeJson(configPath, config)
console.log(JSON.stringify(config, null, 2))
