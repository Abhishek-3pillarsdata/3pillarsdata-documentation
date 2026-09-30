# Project Documentation Portal

The team's internal site for project status and documentation: progress, tasks, meeting notes and decisions,
development sessions, issues and blockers, architecture and technical docs, and changelogs.

**The Git repository is the source of truth.** All content is plain Markdown and JSON in this repo. The website is a
static, read-only presentation layer with no backend, no database and no login. To update the site, edit the files
and push.

```
Developer works on code
        ↓
Developer tells Claude Code what changed
        ↓
Claude Code updates Markdown / JSON   →   npm run validate
        ↓
git commit && git push
        ↓
CI builds and deploys the static site
        ↓
The team sees the updated documentation
```

**Stack:** React 19, TypeScript, Vite, Tailwind CSS 4, react-markdown (GFM + syntax highlighting), React Router (hash routing).

---

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev          # http://localhost:5173 (hot-reloads when you edit data/ or docs/)
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run validate` | Checks all content: JSON shape, dates, enums, ids, cross-references, meeting format |
| `npm run build` | `validate` + type-check + production build into `dist/` |
| `npm run preview` | Serves the built `dist/` locally at http://localhost:4173 |

### First-time setup

The repo ships with **no content**: every file in `data/` is an empty array and `docs/projects/` is empty. To get
started:

1. Add the team to `data/team.json`, for example
   `{ "id": "jane-doe", "name": "Jane Doe", "role": "Full-stack Developer" }`.
2. Add each project (see [Add a new project](#add-a-new-project)).

Or tell Claude Code *"Add our team and projects to the portal: …"* with the real details.

---

## Where the data is stored

```
data/
  projects.json      ← projects: status, progress %, owner, tech stack, objectives, milestones, lastUpdated
  tasks.json         ← all tasks (every project)
  updates.json       ← development session log (newest first)
  issues.json        ← issues and blockers
  team.json          ← people; referenced everywhere by id

docs/
  projects/
    <project-id>/          ← one folder per project (starts empty)
      overview.md        ← rendered on the project's Overview tab
      architecture.md    ← Architecture tab
      technical.md       ← Technical docs tab (APIs, integrations, setup)
      changelog.md       ← Changelog tab ("## YYYY-MM-DD" sections)
      meetings/
        YYYY-MM-DD.md    ← one file per meeting
  _templates/            ← copy-paste templates (not shown on the site)

src/                     ← the website (only change this to change the UI)
  types/index.ts         ← TypeScript interfaces for every data file
  data/index.ts          ← loads data/ and docs/ at build time
  data/search.ts         ← client-side search index
  components/  pages/  layouts/  utils/
scripts/validate.mjs     ← content validator
CLAUDE.md                ← step-by-step instructions for Claude Code
```

Content is bundled at build time with Vite's `import.meta.glob`. New files are picked up automatically, so there's
nothing to register.

**Conventions:** dates are `YYYY-MM-DD`; people are referenced by their `team.json` id (for example `jane-doe`); task ids
are `<PROJECT KEY>-<n>` (for example `WEB-12`); the project `id` equals its folder name under `docs/projects/`.

---

## Add a new project

1. Add an entry to `data/projects.json`:
   ```json
   {
     "id": "my-project",
     "key": "WEB",
     "name": "My Project",
     "description": "One or two sentences.",
     "objectives": ["…"],
     "status": "planning",
     "progress": 0,
     "owner": "<member-id>",
     "techStack": ["…"],
     "startDate": "2026-10-01",
     "targetDate": "2026-12-31",
     "lastUpdated": "2026-10-01",
     "milestones": [{ "title": "…", "date": "2026-10-31", "done": false }]
   }
   ```
2. Copy `docs/_templates/project/` to `docs/projects/my-project/` and fill in the Markdown files.
3. Create `docs/projects/my-project/meetings/` (add a meeting note or a `.gitkeep` so Git tracks it).
4. Run `npm run validate`.

## Add meeting notes

Create `docs/projects/<project-id>/meetings/YYYY-MM-DD.md` from `docs/_templates/meeting.md`. For a second meeting on
the same day, use `YYYY-MM-DD-some-slug.md`.

```markdown
---
title: Sprint 5 review
date: 2026-10-14
participants: [<member-id>, <member-id>]
---

## Topics Discussed
- …

## Decisions
- …

## Action Items
| Action | Owner | Deadline | Status |
| --- | --- | --- | --- |
| Do the thing | <member-id> | 2026-10-20 | open |

## Follow-up Notes
…
```

Keep these section headings as they are. The site pulls **Decisions** and **Action Items** out of them, and shows
overdue actions. Set an action's status to `done` once it's finished.

## Update tasks

Edit `data/tasks.json`. Change `status` (`todo`, `in-progress`, `completed`, `blocked`) and set `updatedDate` to today.
For a new task, add an object with the next free id for that project:

```json
{
  "id": "WEB-17",
  "projectId": "<project-id>",
  "title": "Short title",
  "description": "What needs to be done.",
  "priority": "medium",
  "status": "todo",
  "assignee": "<member-id>",
  "createdDate": "2026-10-01",
  "updatedDate": "2026-10-01"
}
```

Issues and blockers work the same way in `data/issues.json` (`open`, `investigating`, `resolved`, plus an optional
`resolution` and `relatedTasks`).

---

## Automatic updates: the `project-docs` skill (recommended)

`skill/project-docs/` is a Claude Code skill that updates this portal **from inside your code repos**. Nobody needs
to remember to write documentation.

- **First use in a repo (onboarding):** Claude reads the codebase, runs its tests or build if that's safe, and asks
  you a few questions (name, key, status). It then records everything that already exists: current features,
  architecture, setup and APIs, a changelog from the real git history, completed tasks, and any failing tests as
  issues.
- **After every task:** a Stop hook notices when the code changed since it was last documented. Claude then adds the
  session entry, updates tasks, issues and the changelog, validates, commits and pushes the portal, and CI deploys the
  site. Half-finished or trivial changes are skipped until there is something real to record.
- **Teammates:** a project's `repository` URL links it on every machine, so once one developer onboards a repo, the
  other developer's Claude recognises it automatically.

### Install (each developer, once)

```bash
git clone https://github.com/Abhishek-3pillarsdata/3pillarsdata-documentation.git
cd 3pillarsdata-documentation                          # keep this folder; the skill writes into it
npm run install-skill                                  # optional: -- --developer <your team.json id>
```

Then restart Claude Code (or open `/hooks` once). In one of your code repos, say **"add this project to the
portal"** to onboard it. After that, just work normally.

The installer copies the skill to `~/.claude/skills/project-docs/`, stores this clone's path in
`~/.claude/project-docs/config.json`, and adds one Stop hook to `~/.claude/settings.json`. Your other settings are
kept, and a backup is written to `settings.json.bak-project-docs`. Keep the clone where it is, because the skill
writes into it. When the portal's copy of the skill changes, the skill re-installs itself after its next `git pull`.

| Want to… | Do this |
| --- | --- |
| Commit portal updates but never push | `npm run install-skill -- --no-push` |
| Install without the automatic after-task prompt | `npm run install-skill -- --no-hook`, then say "update the docs" when you want |
| Pause one repo | Tell Claude "stop auto-documenting this repo" (and "resume" later) |
| Remove everything | `npm run install-skill -- --uninstall` |

**If automatic pushes fail with "could not read Password":** Claude can't answer a login prompt, so Git needs a saved
login. Run this once in your own terminal: `git credential-manager github login --username <your-github-user>`. If
you've run `gh auth setup-git` before, your global config sends github.com logins to the GitHub CLI instead. To make
just this clone use the saved login:

```bash
git config --local credential.https://github.com.helper ""
git config --local --add credential.https://github.com.helper manager
```

## Manual updates from this repo

`CLAUDE.md` holds the full procedure, and Claude Code reads it automatically. After a development session, open this
repo in Claude Code and say something like:

> Update <project name> documentation. Today I worked on the API integration, fixed the login bug, and
> completed task WEB-12. Commit and push.

Or use the bundled slash command:

```
/update-docs <project name>: finished the API integration (WEB-12), fixed the login bug
```

Claude Code will:

1. Add a session entry to `data/updates.json` (changes, files affected, problems, solutions, next steps)
2. Update task statuses and dates in `data/tasks.json`
3. Resolve or add issues in `data/issues.json`
4. Add today's section to `docs/projects/<id>/changelog.md`
5. Set `lastUpdated` (and `progress` or milestones if relevant) in `data/projects.json`
6. Update `overview.md`, `architecture.md` or `technical.md` if the facts changed
7. Run `npm run validate`
8. Commit (`docs(web): …`) and push, after which CI deploys the site

---

## Deploy

The build output (`dist/`) is fully static. It uses hash-based URLs (`/#/projects/my-project`) and relative asset
paths, so it works on any host and under any sub-path with no rewrite rules.

### GitHub Pages (this repo's setup)

`.github/workflows/deploy.yml` validates, builds and deploys on every push to `main`. Pull requests are built and
validated but not deployed.

1. Go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions** (one time).
2. Push to `main`. The site is served at
   **https://abhishek-3pillarsdata.github.io/3pillarsdata-documentation/**

> GitHub Pages sites are public unless your organisation uses GitHub Enterprise Cloud with private Pages. For internal
> documentation, check this before pushing, or use a host that supports access control (see below).

### Netlify

Import the repo in Netlify. `netlify.toml` already sets the build command (`npm run build`) and the publish directory
(`dist`). Every push to `main` deploys, and pull requests get preview URLs. Netlify's password protection or SSO can
restrict access.

### Vercel

Import the repo in Vercel. `vercel.json` sets the framework, build command and output directory. Every push deploys.
Vercel's Deployment Protection can restrict access to your team.

---

## Site features

- **Dashboard:** project, pending-task and open-issue counts; project cards with status, owner, progress and last
  update; recent development updates, meetings and high-priority pending tasks
- **Project pages:** Overview (objectives, tech stack, milestones, task breakdown, recent updates), Architecture,
  Technical docs (with an "On this page" outline), Tasks, Meeting notes, Dev updates, Changelog, Issues / Blockers
- **Tasks:** Kanban board (Todo / In progress / Blocked / Completed) or a table, filterable by project, assignee and
  priority; click a task for details (the URL is shareable: `?task=WEB-12`)
- **Search:** press <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>K</kbd> or <kbd>/</kbd> to search projects, tasks, meetings,
  documentation sections, changelog entries, dev updates and issues. Everything runs in the browser.
- Light and dark mode (follows the system setting and can be toggled), and a responsive layout with a mobile menu
