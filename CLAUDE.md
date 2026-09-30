# Project Documentation Portal — Agent Instructions

This repo is a static React site that **presents** documentation. The documentation itself lives in
`data/*.json` and `docs/projects/**.md`, and Git is the source of truth. There is no backend and no database.
Almost every request is a content edit. Do **not** change `src/` unless you are asked to change the website itself.

## Where things live

| What | File | Format |
| --- | --- | --- |
| Projects (status, progress, lastUpdated, milestones) | `data/projects.json` | JSON array |
| Tasks | `data/tasks.json` | JSON array |
| Development session log | `data/updates.json` | JSON array, newest first |
| Issues / blockers | `data/issues.json` | JSON array |
| Team members | `data/team.json` | JSON array |
| Overview / architecture / technical docs | `docs/projects/<project-id>/{overview,architecture,technical}.md` | Markdown |
| Changelog | `docs/projects/<project-id>/changelog.md` | Markdown, `## YYYY-MM-DD` sections |
| Meeting notes | `docs/projects/<project-id>/meetings/YYYY-MM-DD[-slug].md` | Markdown + frontmatter |
| Templates for new files | `docs/_templates/` | not rendered |

Types for every field are in `src/types/index.ts`. The site finds new files automatically, so nothing needs registering.

## Conventions

- Dates are always `YYYY-MM-DD`. Use today's real date.
- People are referenced by their `team.json` id, never by name. If someone is new, add them to `team.json` first (ask the user for their name and role).
- Project `id` is kebab-case and equals its folder name under `docs/projects/`.
- Task ids are `<PROJECT KEY>-<n>`, e.g. `WEB-12`. For a new task, use the highest existing number for that key plus 1.
- Issue ids are `<KEY>-ISSUE-<n>`.
- Enums:
  - task `status`: `todo | in-progress | completed | blocked`
  - `priority` / `severity`: `low | medium | high | critical`
  - project `status`: `planning | active | on-hold | completed`
  - issue `status`: `open | investigating | resolved`
- Keep JSON formatted with 2-space indentation. Don't reorder existing entries needlessly.
- Set a project's `repository` to its code repo's git remote URL. The `project-docs` skill uses it to link a
  developer's local code repo to the right portal project.
- Only record real information. Never add sample, mock or placeholder content to `data/` or `docs/projects/`.

## "Update the documentation with today's work"

When the user describes a development session (for example: *"Update <project name> documentation. Today I worked on the
API integration, fixed the authentication issue, and completed task API-12"*):

1. **Identify the project** from the name/key in `data/projects.json`. Resolve the task ids mentioned. If an id doesn't
   match exactly (e.g. "API-12"), find the closest task by title/description and say which one you picked.
   Ask the user if it is genuinely ambiguous.
2. **Add a session entry** at the **top** of `data/updates.json`:
   ```json
   {
     "id": "YYYY-MM-DD-<key-lowercase>-<developer>",
     "projectId": "<project-id>",
     "date": "YYYY-MM-DD",
     "developer": "<member-id>",
     "summary": "One line: what the session was about",
     "changes": ["…"],
     "filesAffected": ["src/…"],
     "problems": ["…"],
     "solutions": ["…"],
     "nextSteps": ["…"],
     "relatedTasks": ["WEB-12"]
   }
   ```
   If the user didn't mention files, look at the code repository's recent `git log`/diff when it is available.
   Otherwise use `[]`. Never invent file names. If the same developer already has an entry for the same project today,
   extend that entry instead of adding a second one.
3. **Update tasks** in `data/tasks.json`: set `status` and bump `updatedDate` to today on every task that changed.
   Create new tasks for new work the user mentions (`createdDate` = `updatedDate` = today).
4. **Update issues** in `data/issues.json`: when a problem was fixed, set `status: "resolved"`, add a `resolution`
   and bump `updatedDate`. Add new issues for new blockers.
5. **Update the changelog** `docs/projects/<id>/changelog.md`: add or extend today's `## YYYY-MM-DD` section at the
   **top**. Start each bullet with a verb (`Added`, `Fixed`, `Updated`, `Removed`, `Completed`). The UI uses that verb
   to colour-code the entry. Put task ids in parentheses, e.g. `(WEB-12)`.
6. **Update the project** in `data/projects.json`: set `lastUpdated` to today. Adjust `progress` (0–100) if the user
   gives a number or a milestone was completed (mark `milestones[].done`). Change `status` only if told.
7. **Update long-form docs only when the facts changed.** For example, update the "Current status" section of
   `overview.md`, add a new API or integration to `technical.md`, or record a structural change in `architecture.md`.
8. **Validate:** run `npm run validate` and fix every error it reports.
9. **Commit and push** (only when the user asked you to, asked for the full workflow, or you are running as the
   `project-docs` skill with `autoPush` on — installing that skill is the developer's standing permission):
   ```bash
   git add data docs
   git commit -m "docs(<project-key>): <short summary of the session>"
   git push
   ```
   CI rebuilds and deploys the site automatically on push to `main`.

## Adding meeting notes

Copy `docs/_templates/meeting.md` to `docs/projects/<id>/meetings/YYYY-MM-DD.md`. If there is more than one meeting on
the same day, use `YYYY-MM-DD-<slug>.md`. Keep the section headings exactly as they are: `## Topics Discussed`, `## Decisions`,
`## Action Items` (a table with columns `Action | Owner | Deadline | Status`, where status is `open` or `done`) and
`## Follow-up Notes`. The UI pulls decisions and action items out of these sections.
If a meeting creates tasks, add them to `data/tasks.json` too.

## Adding a project

1. Add an entry to `data/projects.json` (copy an existing one; choose a unique `key`).
2. Copy `docs/_templates/project/*` to `docs/projects/<new-id>/` and create an empty `meetings/` folder. The folder
   needs one file to exist in Git, so add the first meeting note or a `.gitkeep`.
3. Add the owner to `data/team.json` if they're new.
4. `npm run validate`.

## The project-docs skill (automatic updates from code repos)

`skill/project-docs/` is a Claude Code skill that each developer installs globally with `npm run install-skill`.
It runs from inside their *code* repos. On first use it onboards the repo (documents all existing features, the
architecture, setup and git history), and after each finished task it records the work here. A Stop hook prompts
for it automatically. No version bump is needed when you change the skill: it detects that its installed copy differs from
`skill/project-docs/` after a pull and re-installs itself. `scripts/install-skill.mjs` is the installer.

## Checking the site

- `npm run validate`: content checks (fast, run this after every content edit)
- `npm run build`: validate + type-check + production build into `dist/`
- `npm run dev`: local dev server at http://localhost:5173
