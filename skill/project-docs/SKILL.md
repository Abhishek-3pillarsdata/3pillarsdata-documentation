---
name: project-docs
description: Records development work into the team's Project Documentation Portal, a Git repo of JSON and Markdown that deploys as the team's docs site. Use this whenever a coding task in any repository is finished (a feature built, a bug fixed, a refactor done, a task completed) and whenever the "[project-docs]" Stop hook asks for it. Also use it when the user says things like "update the docs", "log today's work", "record this in the portal", "update project documentation", "add this project to the portal" or "onboard this repo". The first time it runs in a repo, it documents every existing feature, the architecture, setup and history as a baseline, then keeps tracking each new task.
---

# project-docs

The team's documentation portal is a separate Git repo. Its `data/*.json` and `docs/projects/<id>/**` files are the
source of truth, and CI turns them into the website everyone reads. This skill writes into that repo from whatever
code repo the developer is working in, so that each finished task shows up on the site without anyone writing it
up by hand.

`<skill-dir>` below means the base directory shown when this skill was loaded.

## Why the rules below matter

The portal is read by managers and teammates as the factual record of the project, so:

- **Only record what really happened.** Use the conversation, the actual code and the actual git history. Never
  invent tasks, people, dates, file names, percentages or features. If a required fact is unknown, ask the user or
  leave it out.
- **Never copy secrets** (tokens, passwords, keys, `.env` values, internal hostnames that look sensitive) into the
  portal. It may be published as a website. Document environment variables by name and purpose only.
- **Keep updates small and quiet.** This runs after every task. Do the update efficiently and report it in one or
  two lines, not a long essay.

## Step 1 — Prepare

Run this from anywhere, passing the code repo you have been working in:

```bash
node "<skill-dir>/scripts/prepare.mjs" --repo "<code repo root>"
```

It pulls the latest portal and prints JSON. Act on it:

| Field | What to do |
| --- | --- |
| `error: not-installed` / `portal-missing` | Tell the user to clone the portal repo and run `npm run install-skill` inside it. Stop. |
| `developer` is null, or `developerInTeam` is false | Ask the user for their name and role. Add them to the portal's `data/team.json` with a short kebab-case id (unless they already appear in `team`), then run `commands.setDeveloper` with that id. |
| `portal.skillUpdate` | A newer version of this skill is in the portal. Run that command (it is idempotent and keeps settings), mention it in your report, and continue. |
| `portal.pull` failed | Continue with the local copy. Mention it, because the later push may need a rebase. |
| `mode` | `onboard`, `link` or `update`. Go to the matching section below. |

Then read **`<portal.path>/CLAUDE.md`** once per session. It defines every file format, id convention and enum. Follow
it exactly. Where it says to commit only when asked: installing this skill is that permission (see Step 3).

## Step 2 — Do the work for the mode

### Mode `onboard` — first time this repo is documented

The portal has no project for this repo yet. Before tracking new work, record everything that already exists and
works, so the portal starts from an accurate picture instead of an empty page.

Read `<skill-dir>/references/onboarding.md` and follow it. It covers exploring the repo, checking what works,
the few questions to ask the user, and which files to write. At the end, run `commands.register` with the new
project id.

If the user just asked for something else and onboarding would be a surprise (for example the hook fired in a repo
they never meant to document), ask first: "This repo isn't in the portal yet — want me to onboard it now?"

### Mode `link` — project exists, but not on this machine

A teammate already onboarded this repo: its git remote matches a portal project's `repository`. Don't onboard it
again. Run `commands.register` with `project.id`, then continue as `update`. Base the update on the
`uncommitted` changes and on what was done in this conversation.

### Mode `update` — record the task that was just done

Use three sources: `sinceLastDocumented.commits`, `sinceLastDocumented.files`, and this conversation (what the user
asked for, what you changed, what broke, how it was fixed). To see a specific change, use `diffCommand`.

**Is there something worth recording?** Record it when a coherent piece of work is done: a feature or part of one,
a bug fix, a refactor, a completed task, or a meaningful config or infra change. Don't record it when the work is
half-finished and the user is still iterating, when you're waiting on a question you asked, or when the change is
trivial (formatting, typos, lockfile churn, debug logging you're about to remove). In those cases run
`commands.defer` and finish your turn without mentioning it. The changes will be picked up by the next real update,
because the comparison is always against the last *documented* state.

When recording, follow the portal CLAUDE.md section "Update the documentation with today's work". In short:

1. **Session entry** (`data/updates.json`): if today already has an entry for this developer and project, extend it
   (append to `changes`, `filesAffected`, etc.) rather than adding a second one. Take `filesAffected` from
   `sinceLastDocumented.files` (paths only, most relevant first, and don't list 40 generated files). Put problems and
   solutions only if there were real ones.
2. **Tasks** (`data/tasks.json`): update existing tasks the work relates to (status, `updatedDate`). If the work
   was a distinct feature or fix with no task, add it as a `completed` task so it appears under completed work. Small
   fixes only need the changelog. Add `todo` tasks for follow-ups the user explicitly wants tracked.
3. **Issues** (`data/issues.json`): resolve issues the work fixed (with a `resolution`). Add an issue for any new
   blocker.
4. **Changelog** (`docs/projects/<id>/changelog.md`): today's `## YYYY-MM-DD` section at the top. Start each bullet
   with a verb, and add task ids in parentheses.
5. **Project** (`data/projects.json`): set `lastUpdated` to today. Change `progress` only when the user gives a
   number or a milestone was completed. Don't guess percentages.
6. **Long-form docs**, only when the facts changed: add new user-visible features to `overview.md` under
   "Current features", new setup, env vars, endpoints or integrations to `technical.md`, and structural changes to
   `architecture.md`.

## Step 3 — Validate, commit, push

```bash
node "<portal>/scripts/validate.mjs"          # fix every error it reports, then re-run
git -C "<portal>" add data docs
git -C "<portal>" commit -m "docs(<project-key lowercase>): <what was done, imperative, ≤ 72 chars>"
```

- Stage only `data` and `docs`. Never commit other changes that happen to be in the portal working tree.
- If `autoPush` is true and the portal has a remote, run `git -C "<portal>" push`. If the push is rejected, run
  `git -C "<portal>" pull --rebase` and push again. JSON conflicts are almost always both sides adding entries, so
  keep both, fix the JSON, validate, and continue the rebase. If `autoPush` is false or there is no remote, leave the
  commit local and say so.
- If `portal.hasCommits` is false, the portal repo has never been committed. Don't make its first commit contain only
  `data/` and `docs/`. Tell the user the portal needs its initial commit and push first, and leave your edits
  uncommitted.

Then run `commands.documented` (after onboarding, `commands.register` has already done this). This records the
current code state as documented, so the Stop hook stays quiet until new changes appear.

## Step 4 — Report

One or two lines, for example:

> 📘 Portal updated — Project X: added CSV export (WEB-14 completed), fixed date parsing bug. Committed `a1b2c3d` and pushed.

## Other requests

- "stop auto-documenting this repo" / "resume": `node "<skill-dir>/scripts/mark.mjs" --pause|--resume --repo "<root>"`
- "turn off automatic updates everywhere": `node "<skill-dir>/scripts/config.mjs" --auto false`
- "don't push automatically": `node "<skill-dir>/scripts/config.mjs" --auto-push false`
- "this repo is the wrong project": `mark.mjs --unlink --repo "<root>"`, then run prepare again
