# Project Documentation Portal — Agent Instructions

This repo is a static React site that **presents** documentation. The documentation itself lives in
`data/*.json` and `docs/projects/**.md`, and Git is the source of truth. There is no backend and no database.
Almost every request is a content edit. Do **not** change `src/` unless you are asked to change the website itself.

## What the portal is for

Each project is described **as it is right now**: what it is, its current features, its current status, how it is
built and how to run it. The team deliberately does **not** want tasks, issues or blockers lists, changelogs, session
logs, progress percentages, or dates and times on the site. Don't add them back. The only dated content is meeting
notes, which the team writes by hand.

## Where things live

| What | File | Format |
| --- | --- | --- |
| Projects | `data/projects.json` | JSON array |
| Team members | `data/team.json` | JSON array |
| Overview (what it is, `## Current features`, `## Current status`) | `docs/projects/<project-id>/overview.md` | Markdown |
| Architecture | `docs/projects/<project-id>/architecture.md` | Markdown |
| Technical docs (setup, configuration, APIs, integrations) | `docs/projects/<project-id>/technical.md` | Markdown |
| Meeting notes | `docs/projects/<project-id>/meetings/YYYY-MM-DD[-slug].md` | Markdown + frontmatter |
| Templates for new files | `docs/_templates/` | not rendered |

Types for every field are in `src/types/index.ts`. The site finds new files automatically, so nothing needs registering.
The dashboard card shows the first paragraph of each overview's `## Current status` section, so keep that paragraph a
crisp summary.

## Conventions

- Write project docs in the present tense, describing the current state. No dates, and no "added on…" history.
- People are referenced by their `team.json` id, never by name. If someone is new, add them to `team.json` first (ask
  the user for their name and role).
- Project `id` is kebab-case and equals its folder name under `docs/projects/`. `key` is a short uppercase code.
- Project `status`: `planning | active | on-hold | completed`.
- Set a project's `repository` to its code repo's git remote URL. The `add-this` skill uses it to recognise the
  project on every developer's machine.
- Only record real information. Never add sample, mock or placeholder content to `data/` or `docs/projects/`.
  Never copy secrets: the site is public.
- Keep JSON formatted with 2-space indentation.

## Updating a project

Normally developers run `/add-this` from inside their project folder (see below). If asked to update a project from
here instead: edit its `overview.md` (features and current status), `architecture.md` and `technical.md` so they
describe the project as it is now, and edit `projects.json` only if the description, tech stack, objectives or status
changed. Then validate, commit and push:

```bash
npm run validate
git add data docs
git commit -m "docs(<key lowercase>): <what changed>"
git push
```

CI rebuilds and deploys the site automatically on push to `main`. Commit and push when the user asked for the update,
or when you are running as the `add-this` skill with `autoPush` on.

## Adding meeting notes

Copy `docs/_templates/meeting.md` to `docs/projects/<id>/meetings/YYYY-MM-DD.md` (the meeting's date, as the user
gives it). If there is more than one meeting on the same day, use `YYYY-MM-DD-<slug>.md`. Keep the section headings
exactly as they are: `## Topics Discussed`, `## Decisions`, `## Action Items` (a table with columns
`Action | Owner | Deadline | Status`, where status is `open` or `done`) and `## Follow-up Notes`. The UI pulls
decisions and action items out of these sections.

## Adding a project

Prefer `/add-this` from the project folder. To do it by hand: add an entry to `data/projects.json`, copy
`docs/_templates/project/*` to `docs/projects/<new-id>/`, add `meetings/.gitkeep`, add the owner to `data/team.json`
if new, and run `npm run validate`.

## The add-this skill

`skill/add-this/` is a Claude Code skill that each developer installs globally with `npm run install-skill`. It runs
**only when the developer types `/add-this`** (or explicitly asks to update the portal) in a project folder. The first
time, it adds the project; after that, it refreshes the project's page. It never runs on its own.
`scripts/install-skill.mjs` is the installer. When `skill/add-this/` changes, the skill notices after its next pull and
re-installs itself.

## Checking the site

- `npm run validate`: content checks (fast, run this after every content edit)
- `npm run build`: validate + type-check + production build into `dist/`
- `npm run dev`: local dev server at http://localhost:5173
