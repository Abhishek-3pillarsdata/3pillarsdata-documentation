---
name: add-this
description: Adds the current project to the team's documentation portal, or refreshes its page there. Use ONLY when the user explicitly asks, for example by typing /add-this or saying "add this to the portal", "add this project to the docs" or "update the portal". Never run it on your own after finishing a task, and don't treat a plain "add this" that refers to code (such as "add this button") as a request for it. It records what the project is, its current features, current status, architecture and setup. It never records tasks, history or dates.
---

# add-this

The team's documentation portal is a separate Git repo (`data/*.json` + `docs/projects/<id>/*.md`) that deploys as a
website. When the developer types `/add-this`, they want the portal page for the project they're working in to show
the project **as it is right now**. Nothing else.

`<skill-dir>` below means the base directory shown when this skill was loaded.

## What the portal holds, and what it must not

Each project has exactly this:

- An entry in `data/projects.json`: `id`, `key`, `name`, `description`, `objectives` (optional), `status`, `owner`,
  `techStack`, `repository`
- `docs/projects/<id>/overview.md`: what it is, `## Current features`, `## Current status` (what works, what's in
  progress, known gaps)
- `docs/projects/<id>/architecture.md`: components, how they connect, notable design decisions
- `docs/projects/<id>/technical.md`: how to install, run and test it, configuration (variable names only), APIs and
  integrations
- `docs/projects/<id>/meetings/`: meeting notes the team writes by hand (keep the folder; see the end of this file)

The developer explicitly does **not** want tasks, issues or blockers lists, changelogs, session logs, progress
percentages, or any dates or times. They work at odd hours and find dated history confusing. So:

- Write everything in the present tense, as a description of the current state ("Exports reports as PDF", not "Added
  PDF export on…").
- Never add dates, times or "recently"-style history. Never create `data/tasks.json`, `issues.json`, `updates.json`
  or `changelog.md`.
- Only write what's true. Take it from the real code, the git history and this conversation. If something is unknown,
  leave it out rather than guessing.
- Never copy secrets (tokens, passwords, keys, `.env` values) into the portal, because the website is public.

## Step 1 — Prepare

```bash
node "<skill-dir>/scripts/prepare.mjs" --repo "<project root>"
```

This pulls the latest portal and prints JSON:

| Field | What to do |
| --- | --- |
| `error` | Tell the user the `fix` it gives, and stop. |
| `developer` null, or `developerInTeam` false | Ask once for their name and role. Add them to `<portal>/data/team.json` with a short kebab-case id, then run `commands.setDeveloper`. |
| `portal.skillUpdate` | Run that command (it updates this skill from the portal and keeps settings), then continue. |
| `mode: onboard` | The project isn't in the portal yet. Do Step 2a. |
| `mode: link` | A teammate already added it. Run `commands.register` with `project.id`, then do Step 2b. |
| `mode: update` | Do Step 2b. |
| `mode: portal` / `no-repo` | Explain, and ask which project folder they mean. |

## Step 2a — First time: add the project

1. Read the project: README and docs, manifests (`package.json`, `pyproject.toml`, `go.mod`, `Dockerfile`, …),
   entry points (routes, pages, CLI commands, API endpoints, jobs), integrations, config examples, tests and CI. For a
   big repo, use an Explore subagent and ask it for features, components and setup rather than file dumps.
2. If there's an obvious, safe, local test or build command (`npm test`, `pytest`, `go test ./...`), run it, so that
   "Current status" says truthfully what works. Never run anything that deploys, migrates or needs credentials.
3. Pick the name from the README or manifest, a short uppercase `key` that isn't already used (for example `SDLC`),
   and status `active`. Don't ask the user about these. Mention them in the report so they can say "rename it".
4. Write the `projects.json` entry (with `owner` = developer, and `repository` = `repositoryForProjectsJson`, which
   lets teammates' machines recognise the project) and the three docs. Use `<portal>/docs/_templates/project/`. Create
   `meetings/.gitkeep`.
5. Run `commands.register` with the new id. Then go to Step 3.

## Step 2b — Refresh the project's page

Use `changesSinceLastAdd` (commits, changed files, and `diffCommand` for detail) together with this conversation.
Then **edit the existing docs so they describe the project as it is now**:

- New user-visible capability → add it under `## Current features`. Removed → delete it.
- Rewrite `## Current status` so it's accurate today: what works, what's in progress, known gaps. Replace outdated
  statements; don't append history.
- Architecture, setup, configuration, APIs or integrations changed → update `architecture.md` / `technical.md`.
- Update `description`, `techStack` or `objectives` in `projects.json` only if they actually changed. Change
  `status` only if the user says so.

Keep edits proportionate: a small fix may only change one line, or nothing at all. If nothing on the page is out of
date, say so and skip to `commands.done`.

## Step 3 — Publish

```bash
node "<portal>/scripts/validate.mjs"                 # fix anything it reports
git -C "<portal>" add data docs
git -C "<portal>" commit -m "docs(<key lowercase>): <what changed, ≤ 72 chars>"
git -C "<portal>" push                               # only if autoPush is true and the portal has a remote
```

- Stage only `data` and `docs`.
- If the push is rejected, run `git -C "<portal>" pull --rebase` and push again.
- If the push fails because of a login prompt, tell the user to run
  `git credential-manager github login --username <their GitHub user>` once in their own terminal.

Then run `commands.done`, and report in one line, for example:

> 📘 Portal updated — Agentic SDLC Factory: added "PDF reports" to features, refreshed current status. Live in about a minute.

## Meeting notes

The team adds meeting notes by hand. If the user includes meeting notes with `/add-this` ("/add-this meeting notes:
…"), save them as `docs/projects/<id>/meetings/<date>.md` in the format of `<portal>/docs/_templates/meeting.md`.
Use the meeting date the user gives; if they don't give one, ask. Then publish as in Step 3. Don't put meeting
content into the project docs.
