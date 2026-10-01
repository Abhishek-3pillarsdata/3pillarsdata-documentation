# Project Documentation Portal

The team's site for **what each project is and where it stands right now**: what it does, its current features and
status, how it's built and how to run it, plus the team's **tasks** and **meeting notes**.

**Site:** https://abhishek-3pillarsdata.github.io/3pillarsdata-documentation/

All content is plain Markdown and JSON in this repo, and the website is a read-only view of it. Each project page
describes the project as it is today. There are no changelogs or dates to keep up to date, and tasks only appear when
a person adds them.

**Stack:** React 19, TypeScript, Vite, Tailwind CSS 4, react-markdown, React Router (hash routing). No backend.

---

## Day-to-day: `/add-this`

Work on your project in Claude Code as usual. When you want the portal to reflect where the project is, type:

```
/add-this
```

- **The first time in a project folder**, Claude reads the code and adds the project: what it is, its current
  features, current status, architecture and setup.
- **After that**, it refreshes that project's page with whatever changed since your last `/add-this`.

It publishes straight away and tells you in one line what it changed; the site updates about a minute later.
**Nothing happens unless you type `/add-this`.** Saying "add this to the portal" works too.

The same command handles tasks and meeting notes, but only when you ask:

| You type | What happens |
| --- | --- |
| `/add-this` | Refreshes the project page (features, status, architecture). Tasks are never touched. |
| `/add-this task: Add PDF export` | Adds a task under **To do** |
| `/add-this move "Add PDF export" to done` | Moves it to **Done** (also: in progress, blocked) |
| `/add-this task blocked: Deploy to staging, waiting for server access` | Adds a blocked task with the reason |
| `/add-this meeting notes: …` (paste rough notes) | Saves them as a meeting note: topics, decisions, action items |

Admins can manage tasks without Claude; see [Tasks](#tasks).

### Install (each developer, once)

```bash
git clone https://github.com/Abhishek-3pillarsdata/3pillarsdata-documentation.git
cd 3pillarsdata-documentation          # keep this folder; the skill writes into it
npm run install-skill
git credential-manager github login --username <your-github-user>   # so Claude can push without a prompt
```

Then restart Claude Code. The first `/add-this` asks your name and role once.

The installer copies the skill to `~/.claude/skills/add-this/` and stores this clone's path in
`~/.claude/project-docs/config.json`. It doesn't add any automatic hooks. When this repo's copy of the skill
changes, the skill updates itself on its next run.

| Want to… | Do this |
| --- | --- |
| Commit portal updates but push them yourself | `npm run install-skill -- --no-push` |
| Remove the skill | `npm run install-skill -- --uninstall` |

**If pushes fail with "could not read Password":** Claude can't answer a login prompt, so Git needs a saved login (the
`git credential-manager github login` line above). If you've used `gh auth setup-git` before, your global config sends
github.com logins to the GitHub CLI instead. To make this clone use the saved login:

```bash
git config --local credential.https://github.com.helper ""
git config --local --add credential.https://github.com.helper manager
```

---

## Where the content lives

```
data/
  projects.json      ← one entry per project: name, key, description, objectives, status, owner, tech stack, repository
  team.json          ← people; referenced everywhere by id

docs/projects/<project-id>/
  overview.md        ← what it is, "## Current features", "## Current status"
  architecture.md    ← components and how they fit together
  technical.md       ← setup, configuration, APIs, integrations
  tasks.md           ← tasks, added by people (## To do / ## In progress / ## Blocked / ## Done)
  meetings/
    YYYY-MM-DD.md    ← meeting notes (written by hand)

docs/_templates/     ← copy-paste templates (not shown on the site)
src/                 ← the website itself
scripts/validate.mjs ← content checks (npm run validate)
skill/add-this/      ← the Claude Code skill behind /add-this
CLAUDE.md            ← instructions Claude follows when editing this repo
```

The dashboard card for each project shows the first paragraph of its `## Current status` section.

## Tasks

Each project has a **Tasks** tab with four columns (To do, In progress, Blocked, Done). Open tasks also appear on the
dashboard. Nothing is added automatically. Tasks live in `docs/projects/<project-id>/tasks.md`:

```markdown
## To do
- Add PDF export (abhishek)

## In progress
- Fix review gate (abhishek)

## Blocked
- Deploy to staging (rahul) — waiting for server access

## Done
- Set up CI
```

One line per task: the task, then optionally `(person)` and ` — note`.

**Admins (no tools needed):** on the site, open a project's **Tasks** tab and click **Edit tasks**. GitHub's editor
opens. To add a task, type a line under a heading; to move one, cut it and paste it under another heading. Click
**Commit changes**, and the site updates in about a minute. Admins need a free GitHub account and must be added once
under **repo Settings → Collaborators**. Without that, GitHub lets them propose the change for you to approve.

**Developers:** type `/add-this task: …` in Claude Code, as shown above.

## Meeting notes

Create `docs/projects/<project-id>/meetings/YYYY-MM-DD.md` from `docs/_templates/meeting.md` (for a second meeting on
the same day, use `YYYY-MM-DD-some-slug.md`):

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

Keep these section headings as they are: the site pulls **Decisions** and **Action Items** out of them. Then run
`npm run validate`, commit and push.

---

## Run the site locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev          # http://localhost:5173 (hot-reloads when you edit data/ or docs/)
```

| Command | What it does |
| --- | --- |
| `npm run validate` | Checks the content: JSON shape, ids, owners, docs folders, meeting note format |
| `npm run build` | `validate` + type-check + production build into `dist/` |
| `npm run preview` | Serves the built `dist/` locally at http://localhost:4173 |

## Deploy

`.github/workflows/deploy.yml` validates, builds and deploys to GitHub Pages on every push to `main` (repo
**Settings → Pages → Source: GitHub Actions**, already set). The site is public, so never put secrets or confidential
details in the docs.

The build is fully static, with hash-based URLs and relative asset paths, so it also runs on Netlify (`netlify.toml`)
or Vercel (`vercel.json`) without changes if you ever want password protection.
